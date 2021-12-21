const express = require("express");
const router = express.Router();
const bots = require("../../classes/Bots.js");
const Bot = require("../../classes/Bot");
const telegramBot = require("../../chatbot/Telegram/telegramBot");
const ogameApi = require("../../services/ogameApi");

//Controllers
const usersController = require("../../controllers/usersController.js");
const botsController = require("../../controllers/botsController.js");

//CRUD USERS
router.get("/users/list", usersController.list);
router.post("/users/create", usersController.create);
router.put("/users/update/:id", usersController.update);
router.delete("/users/delete/:id", usersController.deletes);
router.post("/login", usersController.login);
router.post("/users/logged", usersController.getUser);
router.get("/logout", usersController.logout);

//CRUD BOTS
router.get("/bots", botsController.list);
router.get("/bots/self", botsController.listByUser);
router.post("/bots", botsController.create);
router.get("/bots/:id", botsController.getOne);
router.put("/bots/:id", botsController.update);
router.delete("/bots/:id", botsController.deletes);
//actions
router.post("/bots/test", botsController.testOgameLogin);
router.get("/bots/:id/begin", botsController.begin);
router.get("/bots/:id/stop", botsController.stop);
router.get("/bots/:id/actions", botsController.listActions);
router.post("/bots/:id/actions", botsController.actions);
router.get("/bots/:id/stop-action/:actionid", botsController.stopAction);
router.post("/bots/telegram", botsController.testTelegram);

router.get("/memory", (req, res) => {
  let mem = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log("el uso de memoria es: ", mem);
  res.json({ ok: true, memory: mem });
});

//tools
const dateTools = require("../../tools/dateTools.js");

//sessions
router.get("/session", (req, res) => {
  console.log("sesion: ", req.cookies);
  console.log("sesion usuario: ", req.user);
  console.log("sesion: ", req.isAuthenticated());
  if (req.isAuthenticated()) {
    return res.json({
      isAuthenticated: true,
      activeSession: req.user,
    });
  }
  return res.json({
    isAuthenticated: false,
  });
});
router.get("/session/list", (req, res) => {
  console.log("sesiones activas: ", req.sessionStore);
  return res.json({
    sesions: req.session,
  });
});

router.post("/login-bot", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  // let user_id = req.body.user_id;
  let user_id = -339549424;
  let bot = new Bot();
  await bot.begin("dev");
  bots.addBot(bot);

  // telegramBot.sendTextMessage(
  //   user_id,
  //   "Iniciando sesión en ogame con: " + email
  // );
  try {
    await bot.login(email, password);
    telegramBot.sendTextMessage(user_id, "Sesión iniciada con éxito!");
    res.json({ ok: true, message: "Sesión iniciada con éxito!" });
  } catch (error) {
    telegramBot.sendTextMessage(user_id, "Usuario o contraseña incorrecta");
    res.json({ ok: false, message: "Usuario o contraseña incorrecta" });
  }
});

router.get("/hunter", async (req, res) => {
  // let user_id = req.query.user_id;
  let user_id = 624818317;
  let nickname = req.query.nickname;
  let bot = bots.getBotByTelegramId(user_id);
  let page = await bot.createNewPage();
  if (!bot)
    return res.json({
      ok: false,
      msg: "No hay un bot creado con ese id de usuario",
    });
  try {
    telegramBot.sendTextMessage(
      user_id,
      "obteniendo información del jugador " + nickname
    );
    let playerInfo = await ogameApi.getPlayerInfo(nickname); //return object
    for (const [index, planet] of playerInfo.planets.entries()) {
      let activity = await bot.checkPlanetActivity(
        planet.coords,
        planet.type,
        page
      );
      telegramBot.sendTextMessage(
        user_id,
        planet.name +
          ` (${planet.coords}) (${
            planet.type == "planet"
              ? index == 0
                ? "planeta principal"
                : "planeta"
              : "luna"
          }) - actividad: ${
            activity.lastActivity !== "on" && activity.lastActivity !== "off"
              ? `${activity.lastActivity} minutos`
              : activity.lastActivity
          }`
      );
    }
    setTimeout(() => {
      telegramBot.sendTextMessage(
        user_id,
        "se termino de escanear a " + nickname
      );
    }, 1000);

    res.json({ ok: true, msg: "accion terminada" });
  } catch (error) {
    console.log(error);
    telegramBot.sendTextMessage(user_id, "Al parecer ese jugador no existe");
    res.json({ ok: true, msg: "algo salió mal" });
  }
});

router.get("/check-activity", async (req, res) => {
  let coords = req.query.coords;
  let user_id = req.query.user_id;
  let bot = bots.getBot(user_id);
  if (!bot)
    return res.json({
      ok: false,
      msg: "No hay un bot creado con ese id de usuario",
    });
  try {
    let activity = await bot.checkPlanetActivity(coords, "planet");
    telegramBot.sendTextMessage(
      user_id,
      "Parece que en las coordenadas " +
        coords +
        " hay actividad de " +
        activity.lastActivity +
        " minutos"
    );
    res.json({ ok: true, msg: "accion terminada" });
  } catch (error) {
    console.log(error);
    telegramBot.sendTextMessage(
      user_id,
      "Al parecer esas coordenadas no existen"
    );
    res.json({ ok: true, msg: "algo salió mal" });
  }
});

router.post("/webhook/", (req, res) => {
  console.log("se ingreso al webhook");
  console.log("llego esta info:");
  console.log(req.body);
  // Assume all went well.
  // You must send back a 200, within 20 seconds
  res.sendStatus(200);
});

//CRUD types
const axios = require("axios");
var parseString = require("xml2js").parseString;
router.get("/universe", (req, res1) => {
  axios
    .get("https://s208-es.ogame.gameforge.com/api/universe.xml")
    .then((res) => {
      parseString(res.data, function (err, result) {
        let coords = [];
        result.universe.planet.forEach((planet) => {
          coords.push({
            player: planet["$"].player,
            coords: planet["$"].coords,
          });
        });
        res1.json(coords);
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

module.exports = router;
