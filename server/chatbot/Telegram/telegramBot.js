const telegram = require("telegram-bot-api");
const dialogflow = require("../Dialogflow");
const axios = require("../../utils/axios");
const bots = require("../../classes/Bots.js");
const beginExpeditions = require("../../ogameScripts/expeditions");
const watchDog = require("../../ogameScripts/watchDog");
const fleetSave = require("../../ogameScripts/fleetSave");
const { timeout, timeTomiliseconds2 } = require("../../utils/utils.js");
const config = require("../../config.js");
const { format } = require("date-fns");

process.on("uncaughtException", (err) => {
  console.log("un error probablemente en telegram: ", err);
});

let token;
if (config.environment === "dev")
  token = "1107562973:AAGpbcw8rPs2lxllhdiA__kRIKDFYKX2XvA";
else token = "1107562973:AAGpbcw8rPs2lxllhdiA__kRIKDFYKX2XvA";
// token = "1070317592:AAE3c9b5EexG76uzResutG2_Qd0C9Xm4yWY";
try {
  var api = new telegram({
    token,
    updates: {
      enabled: true,
    },
  });

  // api.setWebhook("https://48791559.ngrok.io/api/webhook");
  // sendTextMessage(624818317, "Selecciona tu luna");
  // sendQuickReply(624818317, "Selecciona tu luna", [
  //   "1:122:1",
  //   "1:122:2",
  //   "1:122:3",
  //   "1:122:4",
  //   "1:122:5",
  //   "1:122:6",
  //   "1:122:7"
  // ]);

  // setPersistentMenu(["Expediciones", "Watchdog", "Scan", "Fleet Save"]);
  // api.sendMessage({
  //   chat_id: -339549424,
  //   text: "Opciones",
  //   reply_markup: JSON.stringify({
  //     keyboard: [
  //       ["🚀 Expediciones", "🚀❌ Cancelar"],
  //       ["🐶 Watchdog", "🐶❌ Cancelar"],
  //       ["🔍 Scan", "💤 Fleet Save"],
  //     ],
  //     resize_keyboard: true,
  //   }),
  // });
  // console.log("enviando mensaje de telegram");

  api.on("message", async (message) => {
    let sender = message.from.id;
    let msg = message.text.replace("/", "");
    console.log("mensaje completo: ", message);
    console.log("se recibio el mensaj1e:", msg, ".");
    console.log("de ", sender);
    sendTypingOn(sender); //typing on
    if (msg === "id") {
      sendTextMessage(sender, `Tu id es ${sender}`);
    }
    let result = await dialogflow.sendToDialogFlow(sender, msg);
    handleDialogFlowResponse(sender, result);
    // console.log("respuestas recibidas: ", responses);
    // for (const response of responses) {
    //   await sendTextMessage(sender, response);
    // }
  });
} catch (error) {
  console.log("algo salio mal en telegram...");
  console.log("el error es: ", error);
}

async function handleDialogFlowResponse(sender, response) {
  let responseText = response.fulfillmentMessages.fulfillmentText;
  let messages = response.fulfillmentMessages;
  let action = response.action;
  let contexts = response.outputContexts;
  let parameters = response.parameters;

  if (isDefined(action)) {
    console.log("se mandara a handleDialogFlowAction");
    handleDialogFlowAction(sender, action, messages, contexts, parameters);
  } else if (isDefined(messages)) {
    console.log("se entrara a handleMessages");
    handleMessages(messages, sender);
  } else if (responseText == "" && !isDefined(action)) {
    //dialogflow could not evaluate input.
    sendTextMessage(
      sender,
      "I'm not sure what you want. Can you be more specific? gaa"
    );
  } else if (isDefined(responseText)) {
    console.log("se mandara a sendTextMessage");
    sendTextMessage(sender, responseText);
  }
}

async function handleDialogFlowAction(
  sender,
  action,
  messages,
  contexts,
  parameters
) {
  //select the bot
  let bot = bots.getBotByTelegramId(sender);
  console.log("el id es: ", sender);
  //begin actions
  if (!bot) {
    return sendTextMessage(
      sender,
      "Lo siento pero aun no creaste una instancia mía 😅 debes entrar a mi web"
    );
  }
  switch (action) {
    case "loginOgameBotAction":
      console.log("se entro al action login");
      console.log("los parametros son:", parameters);
      let email = parameters.fields.email.stringValue;
      let password = parameters.fields.password.stringValue;
      if (email && password) {
        axios
          .post("/api/login-bot", { email, password, user_id: sender })
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            console.error(err);
          });
      }
      handleMessages(messages, sender);
      break;
    case "listActionsAction":
      let actions = await bot.getActions();
      console.log("las acciones son estas: ", actions);
      if (actions.length > 0) {
        await sendTextMessage(sender, "actualmente estoy haciendo esto");
        let msg = "";
        actions.forEach((action, index) => {
          msg +=
            action.type == "expeditions"
              ? "✔️ Expediciones automáticas en [" +
                action.payload.coords +
                "] (activo desde " +
                format(new Date(action.updatedAt), "hh:mm:ss aaa") +
                " )\n"
              : action.type == "watchDog"
              ? "✔️ Vigilando cuenta (activo desde " +
                format(new Date(action.updatedAt), "hh:mm:ss aaa") +
                " )" +
                "\n"
              : "✔️ Fleet diario (se reinicia a media noche)";
        });
        sendTextMessage(sender, msg);
      } else {
        sendTextMessage(sender, "estoy de vago sin hacer nada 🤔");
      }
      break;
    case "beginExpeditionsAction":
      console.log("entrando a expediciones...");
      console.log(
        "los parametros son estos: ",
        JSON.stringify(parameters.fields)
      );
      if (parameters.fields.cooords.stringValue) {
        var coords = parameters.fields.cooords.stringValue;
        console.log("🚀 Aqui *** -> coords", coords);
      }
      if (coords) {
        if (!(await bot.hasAction("expeditions"))) {
          sendTextMessage(
            sender,
            "Ok, empezaré a hacer expediciones en tu planeta/luna de " + coords
          );
          let ships = [
            { id: 1, qty: 5 },
            { id: 9, qty: 10 },
          ];
          // var coords = "9:999:9";
          await bot.addAction("expeditions", { coords: coords });
          beginExpeditions(coords, ships, bot);
        } else {
          sendTextMessage(
            sender,
            "ya tenías activadas las expediones automáticas. Si vas a cambiar de coordenadas, primero dime: '<b>cancela las expediciones</b>'."
          );
        }
      } else {
        handleMessages(messages, sender);
        // let playerId = bot.playerId;
        // console.log("el playerId es: ", playerId);
        // const res = await axios(
        //   "https://pepehunter.herokuapp.com/api/players/" + playerId
        // );
        // let playerInfo = res.data.playerInfo;
        // console.log("informacion de planetas: ", playerInfo);
        // let planets = [];
        // playerInfo.planets.forEach((planet) => {
        //   if (planet.planetType === "planet") planets.push("" + planet.coords);
        // });
        // sendQuickReply(sender, "Escribe alguna de estas coordenadas", planets);
      }

      break;
    case "stopExpeditionsAction":
      sendTextMessage(sender, "Ok, dejaré de hacer expediciones");
      var state = await bot.stopAction("expeditions");
      if (state) {
        await sendTextMessage(sender, "expediciones desactivadas con éxito...");
      } else {
        await sendTextMessage(
          sender,
          "ya tenias las <b>expediciones</b> desactivadas"
        );
      }
      break;
    case "beginWatchDogAction":
      if (!(await bot.hasAction("watchDog"))) {
        sendTextMessage(sender, "Ok, empezaré a vigilar tu cuenta");
        console.log("se entro al watchdog de telegram");
        await bot.addAction("watchDog");
        watchDog(bot);
      } else {
        sendTextMessage(sender, "ya tenías el <b>WatchDog</b> activo!");
        console.log(" no se entro al watchdog");
      }
      break;
    case "stopDailyFleetSaveAction":
      var state = await bot.stopAction("dailyFleetSave");
      if (state) {
        await sendTextMessage(
          sender,
          "<b>FleetSave diario</b> desactivado con éxito (por hoy 😬)..."
        );
        await sendTextMessage(
          sender,
          "<b>" +
            bot.ogameEmail +
            ", antes que te quedes dormido</b>, te recomiendo programar un nuevo fleet... escribeme <b>'haz fleet'</b> y sigue los pasos 😇"
        );
      } else {
        await sendTextMessage(
          sender,
          "algo salió mal y no pude detener el fleetsave de hoy..."
        );
      }
      break;
    case "fleetSaveAction":
      if (
        parameters.fields.duration.stringValue &&
        parameters.fields.beginAfter.stringValue
      ) {
        var duration = parameters.fields.duration.stringValue;
        var beginAfter = parameters.fields.beginAfter.stringValue;
      }
      console.log(
        "los parametros son: ",
        JSON.stringify(parameters.fields, null, " ")
      );
      if (duration && beginAfter) {
        await sendTextMessage(
          sender,
          "vale, haré fleetSave, en tus lunas, dentro de <b>" +
            beginAfter +
            "</b> y tu flota estará en vuelo aproximadamente <b>" +
            duration +
            "</b>"
        );
        console.log("begin after: ", timeTomiliseconds2(beginAfter));
        console.log("duration: ", timeTomiliseconds2(duration));
        if (
          isDefined(timeTomiliseconds2(beginAfter)) &&
          isDefined(timeTomiliseconds2(duration))
        )
          fleetSave(bot, beginAfter, duration);
        else
          sendTextMessage(
            sender,
            "Colocaste mal el formato de horas. Acepto valores como: \n<b>1h:3min</b> (horas y minutos)\n<b>3h</b> (solo horas)\n<b>6min</b> (solo minutos)"
          );
      } else {
        handleMessages(messages, sender);
      }
      break;
    case "offNotifyAction":
      if (parameters.fields.player.stringValue) {
        var player = parameters.fields.player.stringValue;
        await timeout(1000);
        sendTextMessage(
          sender,
          "Empezando a escanear a <b>" + player + "</b>..."
        );
      }
      if (player) {
        sendTextMessage(
          sender,
          "vale, te avisaré cuando <b>" + player + "</b> se quede off..."
        );
        let playerOff = false;
        while (!playerOff) {
          try {
            const res = await axios(
              "https://pepehunter.herokuapp.com/api/scan?nickname=" + player
            );
            let playerInfo = res.data.playerInfo;
            if (!playerInfo.hasOwnProperty("planets")) {
              return sendTextMessage(sender, "Ese jugador no existe");
            }
            playerInfo.planets.forEach((planet) => {
              if (planet.activities[0].lastActivity == "on") {
                return 0;
              } else {
                playerOff = true;
              }
            });
          } catch (error) {
            console.log("algo salio mal en offNotify:", error);
          }
          playerInfo = null;
          await timeout(1 * 1000); //1min
        }
        if (playerOff)
          sendTextMessage("<b>" + player + "</b> se quedó <b>off</b>!");
      }
      handleMessages(messages, sender);
      break;

    case "checkPlayerActivitiesAction":
      if (parameters.fields.player.stringValue) {
        var player = parameters.fields.player.stringValue;
        await timeout(1000);
        sendTextMessage(
          sender,
          "Empezando a escanear a <b>" + player + "</b>..."
        );
      }
      if (player) {
        let percents = { on: 0, off: 0, minutes: 0 };
        sendTypingOn(sender);
        axios
          .get("https://pepehunter.herokuapp.com/api/scan?nickname=" + player)
          .then(async (res) => {
            let playerInfo = res.data.playerInfo;
            if (!playerInfo.hasOwnProperty("planets"))
              return sendTextMessage(sender, "Ese jugador no existe");
            let msg = `<b>Información de ${playerInfo.nickname}</b>\n`;
            playerInfo.planets.forEach((planet, idx) => {
              //calculating percents
              console.log(
                "la ultima actividad: ",
                planet.activities[0].lastActivity
              );
              switch (planet.activities[0].lastActivity) {
                case "on":
                  console.log("se entro a on");
                  percents.on += 1;
                  break;
                case "off":
                  console.log("se entro a off");

                  percents.off += 1;
                  break;
                default:
                  console.log("se entro a minutero");

                  percents.minutes += 1;
                  break;
              }
              //message
              msg +=
                "<b>" +
                planet.name +
                "</b> " +
                "[" +
                planet.coords +
                "]" +
                (planet.planetType == "planet"
                  ? idx == 0
                    ? "(principal🌎)"
                    : "(🌎)"
                  : "(🌘)") +
                ": " +
                (planet.activities.length > 0
                  ? planet.activities[0].lastActivity
                  : "Planeta destruido") +
                "\n";
            });
            //calculating percents
            msg +=
              "📈<b>Resumen</b>\n" +
              " 🗹<b>On:</b>" +
              percents.on +
              " 🗹<b>Off:</b>" +
              percents.off +
              " 🗹<b>Minuteros:</b>" +
              percents.minutes;
            sendTextMessage(sender, msg);
            if (percents.on === 0) {
              await timeout(1000);
              sendTextMessage(
                sender,
                "<b>" + player + "</b> no tiene actividad por ningún lado!"
              );
            }
          })
          .catch((err) => {
            console.log("algo salio mal...");
            console.error(err);
          });
      }
      handleMessages(messages, sender);
      break;
    case "stopWatchDogAction":
      await sendTextMessage(sender, "Ok, entonces entrarás a la cuenta 😆");
      var state = await bot.stopAction("watchDog");
      if (state) {
        await sendTextMessage(sender, "watchDog desactivado con éxito...");
      } else {
        await sendTextMessage(
          sender,
          "ya tenias el <b>watchDog</b> desactivado"
        );
      }
      break;
    default:
      //unhandled action, just send back the text
      console.log(
        "se mandara el mensaje por defecto de handleDialogFlowAction"
      );
      handleMessages(messages, sender);
  }
}

function handleMessages(messages, sender) {
  let timeoutInterval = 1100;
  let previousType;
  let cardTypes = [];
  let timeout = 0;
  for (var i = 0; i < messages.length; i++) {
    if (
      previousType == "card" &&
      (messages[i].message != "card" || i == messages.length - 1)
    ) {
      timeout = (i - 1) * timeoutInterval;
      setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
      cardTypes = [];
      timeout = i * timeoutInterval;
      setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
    } else if (messages[i].message == "card" && i == messages.length - 1) {
      cardTypes.push(messages[i]);
      timeout = (i - 1) * timeoutInterval;
      setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
      cardTypes = [];
    } else if (messages[i].message == "card") {
      cardTypes.push(messages[i]);
    } else {
      timeout = i * timeoutInterval;
      setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
    }
    previousType = messages[i].message;
  }
}

async function handleMessage(message, sender) {
  console.log("se entro a handleMessage");
  console.log("mensaje: ", message);
  console.log("switch: ", message.message);
  console.log("texto: ", message.text);
  switch (message.message) {
    case "text": //text
      for (const text of message.text.text) {
        if (text !== "") {
          await sendTextMessage(sender, text);
        }
      }
      break;
    case "quickReplies": //quick replies
      let replies = [];
      message.quickReplies.quickReplies.forEach((text) => {
        let reply = {
          content_type: "text",
          title: text,
          payload: text,
        };
        replies.push(reply);
      });
      sendQuickReply(sender, message.quickReplies.title, replies);
      break;
    case "image": //image
      sendImageMessage(sender, message.image.imageUri);
      break;
    case "payload":
      let desestructPayload = structProtoToJson(message.payload);
      var messageData = {
        recipient: {
          id: sender,
        },
        message: desestructPayload.facebook,
      };
      callSendAPI(messageData);
      break;
  }
}

function setSessionAndUser(senderID, callback) {
  if (!usersMap.has(senderID)) {
    console.log("empezando la segunda condicion");
    usersMap.set(senderID, uuid.v1());
    userService.addUser((err, user) => {
      if (err) {
        console.log("algo salio mal agregando al usuario..", err);
      } else {
        usersMap.set(senderID, user);
        console.log("se termino de resolver el add user");
        callback(true);
      }
    }, senderID);
  }
}

function handleMessageAttachments(messageAttachments, senderID) {
  //for now just reply
  sendTextMessage(senderID, "Attachment received. Thank you.");
}

function handleQuickReply(senderID, quickReply, messageId) {
  var quickReplyPayload = quickReply.payload;
  console.log(
    "Quick reply for message %s with payload %s",
    messageId,
    quickReplyPayload
  );
  //send payload to api.ai
  sendToDialogFlow(senderID, quickReplyPayload);
}

async function sendTextMessage(recipientId, text) {
  console.log("llego este recipient: ", recipientId);
  // let bot = bots.getBotByTelegramId(recipientId); //bot.telegramGroupId
  console.log("se enviara la respuesta: ", text);
  await api.sendMessage({
    chat_id: config.telegramId,
    text: text,
    parse_mode: "html",
  });
}

async function sendQuickReply(recipientId, text, replies, maxColumns = 3) {
  console.log("llego este recipient: ", recipientId);
  let bot = bots.getBotByTelegramId(recipientId); //bot.telegramGroupId
  console.log("se enviara la respuesta: ", text);
  let inline_keyboard = [],
    i = 0;
  let row = [];
  console.log(replies);
  replies.forEach((reply, idx) => {
    console.log("indice: ", idx);
    if (i < maxColumns) {
      console.log("dentro de if ", idx);
      row.push({
        text: "🌘 " + reply,
        switch_inline_query_current_chat: "/" + reply,
      });
      i++;
    }
    if (i === maxColumns || replies.length + 1 - idx < maxColumns) {
      console.log("dentro de else ", idx);
      i = 0;
      inline_keyboard.push(row);
      row = [];
    }
  });
  console.log(inline_keyboard);
  await api.sendMessage({
    chat_id: config.environment === "dev" ? recipientId : bot.telegramGroupId,
    text: text,
    parse_mode: "html",
    reply_markup: JSON.stringify({
      inline_keyboard,
    }),
  });
}

function sendImageMessage(recipientId, imageUrl) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: imageUrl,
        },
      },
    },
  };

  callSendAPI(messageData);
}

function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: config.SERVER_URL + "/assets/instagram_logo.gif",
        },
      },
    },
  };

  callSendAPI(messageData);
}
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: config.SERVER_URL + "/assets/sample.mp3",
        },
      },
    },
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 * example videoName: "/assets/allofus480.mov"
 */
function sendVideoMessage(recipientId, videoName) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: config.SERVER_URL + videoName,
        },
      },
    },
  };

  callSendAPI(messageData);
}

function sendFileMessage(recipientId, fileName) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: config.SERVER_URL + fileName,
        },
      },
    },
  };

  callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId, text, buttons) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons,
        },
      },
    },
  };

  callSendAPI(messageData);
}

function sendGenericMessage(recipientId, elements) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements,
        },
      },
    },
  };

  callSendAPI(messageData);
}

function sendTypingOn(recipientId) {
  let bot = bots.getBotByTelegramId(recipientId);
  api.sendChatAction({
    chat_id: recipientId,
    action: "typing",
  });
}

function isDefined(obj) {
  if (obj === undefined) {
    return false;
  }

  if (obj === null) {
    return false;
  }
  return true;
}

module.exports = { sendTextMessage, api };
