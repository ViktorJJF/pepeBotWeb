const Bot = require("../models/Bots.js");
const Botclass = require("../classes/Bot");
const bots = require("../classes/Bots.js");
const config = require("../config.js");
const dateTools = require("../tools/dateTools.js");
const ogameApi = require("../services/ogameApi");
const { msToTime } = require("../utils/utils");
const beginExpeditions = require("../ogameScripts/expeditions");
const watchDog = require("../ogameScripts/watchDog");
const botTelegram = require("../chatbot//Telegram/telegramBot");
const list = (req, res) => {
  Bot.find().exec((err, payload) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      payload
    });
  });
};
const listByUser = (req, res) => {
  Bot.find({ userId: req.user._id }).exec((err, payload) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      payload
    });
  });
};
const getOne = (req, res) => {
  Bot.find({ _id: req.params.id }).exec((err, payload) => {
    if (err) {
      return res.status(400).json({
        ok: "false",
        err
      });
    }
    res.json({
      ok: true,
      payload
    });
  });
};
const create = async (req, res) => {
  let body = req.body;
  //adding default actions
  let actions = [
    { type: "expeditions", active: false },
    { type: "watchDog", active: false },
    { type: "dailyFleetSave", active: false }
  ];
  let bot = new Bot({
    server: body.server,
    language: body.language,
    telegramGroupId: body.telegramGroupId,
    telegramId: body.telegramId,
    ogameEmail: body.ogameEmail,
    ogamePassword: body.ogamePassword,
    state: body.state,
    userId: req.user ? user._id : body.userId,
    proxy: body.proxy,
    actions
  });

  console.log("se creara el bot con la siguiente info:", bot);

  bot.save((err, payload) => {
    if (err) {
      if (err.name === "MongoError" && err.code === 11000) {
        return res.status(400).json({
          ok: false,
          message: "El bot ya estaba registrado",
          err
        });
      }
      return res.status(400).json({
        ok: false,
        message: "Algo salió mal",
        err
      });
    }
    //adding bot to local class
    let botInstance = new Botclass();
    botInstance.initialize(payload);
    bots.addBot(botInstance);
    res.json({
      ok: true,
      message: "Bot creado con éxito",
      payload
    });
  });
};
const update = async (req, res) => {
  let id = req.params.id;
  let body = req.body;
  Bot.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true
    },
    (err, payload) => {
      if (err) {
        if (err.name === "MongoError" && err.code === 11000) {
          return res.status(400).json({
            ok: false,
            message: "El bot estaba registrado",
            err
          });
        }
        return res.status(400).json({
          ok: false,
          message: "Algo salió mal",
          err
        });
      }
      res.json({
        ok: true,
        message: "Bot actualizado con éxito",
        payload
      });
      //updating bot instance
      let bot = bots.getBot(String(payload._id), "update");
      console.log("bot encontrado es: ", bot);
      bot.initialize(payload);
    }
  );
};
const deletes = (req, res) => {
  let botId = req.params.id;
  Bot.findByIdAndRemove({ _id: botId }, (err, payload) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message: "Algo salió mal",
        err
      });
    }
    res.json({
      ok: true,
      message: "Bot eliminado con éxito",
      payload
    });
    //delete bot instance
    console.log("antes las instancias del bot eran:", bots);
    bots.deleteBot(botId);
    console.log("ahora las instancias del bot es: ", bots);
  });
};

const stop = async (req, res) => {
  let botId = req.params.id;
  let bot = bots.getBot(botId);
  console.log("el bot encontrado: ", bot);

  Bot.findByIdAndUpdate(
    { _id: botId },
    {
      state: false
    },
    {
      new: true
    },
    (err, payload) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: "Algo salió mal",
          err
        });
      }
      res.json({ ok: true, msg: "Bot detenido con éxito" });
      bot.stop();
    }
  );
};

const begin = async (req, res) => {
  let ogameEmail = req.query.ogameEmail;
  let ogamePassword = req.query.ogamePassword;
  let botId = req.params.id;
  let user_id = -339549424;
  console.log("se pasara este id para buscar:", botId);
  console.log("bots contiene: ", bots);
  var bot = bots.getBot(botId);
  await bot.begin();
  await bot.login(ogameEmail, ogamePassword);
  res.json({ ok: true, msg: "Bot iniciado con éxito" });
  // telegramBot.sendTextMessage(user_id, "Sesión iniciada con éxito!");
};

const actions = async (req, res) => {
  let action = req.body.action;
  let botId = req.params.id;
  let bot = bots.getBot(botId);
  if (!bot)
    return res.json({
      ok: false,
      msg: "Hay un bot creado con ese id de usuario"
    });
  switch (action) {
    case "scan":
      console.log("ejecutando scan");
      let username = req.body.payload.username;
      try {
        let playerInfo = await ogameApi.getPlayerInfo(username); //return object
        for (const [index, planet] of playerInfo.planets.entries()) {
          let activity = await bot.checkPlanetActivity(
            planet.coords,
            planet.type
          );
          console.log(activity);
        }
        res.json({ ok: true, msg: "accion terminada" });
      } catch (error) {
        console.log(error);
        res.json({ ok: false, msg: "el jugador no existe" });
      }
      break;
    case "watchDog":
      console.log("ejecutando watchDog");
      let milliseconds = req.body.payload.milliseconds;
      if (!(await bot.hasAction("watchDog"))) {
        await bot.addAction("watchDog");
        watchDog(bot);
      }
      return res.json({ ok: true, msg: "Empezando watchdog..." });
      break;
    case "expeditions":
      console.log("ejecutando expediciones");
      // let ships = req.body.payload.ships;
      let origin = req.body.payload.origin;
      // let page = await bot.createNewPage();
      //first ejecution
      var actionId;
      if (!(await bot.hasAction("expeditions"))) {
        await bot.addAction("expeditions", { coords: origin });
        beginExpeditions(origin, ships, bot);
      }
      var ships = [
        { id: 1, qty: 5 },
        { id: 9, qty: 10 }
      ];
      return res.json({
        ok: true,
        msg: "Empezando a hacer expediciones",
        actionId
      });
      break;
    default:
      break;
  }
};

const stopAction = async (req, res) => {
  let botId = req.params.id;
  let type = req.params.type;
  let bot = bots.getBot(botId);
  console.log("el parametro a eliminar: ", type);
  let state = await bot.stopAction(type);
  if (state) {
    res.json({ ok: true, msg: "Acción detenida con éxito" });
  }
};

const testTelegram = async (req, res) => {
  let sender = req.body.sender;
  console.log("se enviara al destino: ", sender);
  botTelegram.sendTextMessage(sender, "TESTEANDO");
  res.json({ ok: true, msg: "mensaje enviado con éxito" });
};
const listActions = async (req, res) => {
  let botId = req.params.id;
  let bot = bots.getBot(botId);
  let actions = await bot.getActions();
  res.json({ ok: true, actions });
};

const testOgameLogin = async (req, res) => {
  let ogameEmail = req.body.ogameEmail;
  let ogamePassword = req.body.password;
  let proxy = req.body.proxy;
  let bot = new Botclass();
  await bot.begin(proxy);
  let loginStatus = await bot.login(ogameEmail, ogamePassword);
  if (loginStatus)
    res.json({
      ok: true,
      msg: "Sesión en ogame iniciada correctamente",
      payload: { loginStatus }
    });
  else
    res
      .status(400)
      .json({ ok: false, msg: "Datos de inicio de sesión incorrectos" });
  return await bot.stop();
};

module.exports = {
  list,
  listByUser,
  getOne,
  create,
  update,
  deletes,
  begin,
  actions,
  stop,
  stopAction,
  listActions,
  testOgameLogin,
  testTelegram
};

//action functions
