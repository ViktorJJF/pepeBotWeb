const { Random, timeout, msToTime } = require("../utils/utils");
const formatISO9075 = require("date-fns/formatISO9075");
const callMeBot = require("../services/callMeBot");

async function watchDog(bot, page) {
  // await timeout(1 * 60 * 1000);
  const botTelegram = require("../chatbot/Telegram/telegramBot.js");
  botTelegram.sendTextMessage(
    bot.telegramId,
    bot.ogameEmail +
      " empezare a cuidar tu cuenta, para desactivar dime algo como 'pepebot ya no cuides mi cuenta'"
  );
  while (await bot.hasAction("watchDog")) {
    try {
      let watchDogStatus = await start(page, bot, botTelegram);
      if (watchDogStatus)
        await timeout(Random(0.75 * 60 * 1000, 1 * 60 * 1000));
    } catch (error) {
      console.log(error);
    }
  }
  console.log("se terminó el watchdog");
  return;
}

async function start(page, bot, botTelegram) {
  try {
    var page = await bot.createNewPage();
    console.log("se encontro la accion watchDog");
    let attacked = await bot.watchDog(page);
    console.log(attacked);
    if (attacked) {
      var ogameUsername = await bot.getOgameUsername(page);
      await botTelegram.sendTextMessage(
        bot.telegramId, //bot.telegramGroupId
        "⚠️ <b>" +
          ogameUsername +
          "</b>" +
          " te están atacando ⚠️\nverificaré los detalles..."
      );
      var attackDetails = await bot.attackDetail(page);
      if (attackDetails.normal.length === 0 && attackDetails.sac.length === 0) {
        await botTelegram.sendTextMessage(
          bot.telegramId,
          "parece que solo fue un espionaje"
        );
      } else {
        console.log("llego esta respuesta: ", attackDetails);
        callMeBot("@ViktorJJF", "Te estan atacando"); //make telegram phonecall
        callMeBot("@Juancarlosjf", "Te estan atacando"); //make telegram phonecall
        await botTelegram.sendTextMessage(
          bot.telegramId, //bot.telegramGroupId
          "⚠️ <b>" +
            ogameUsername +
            "</b>" +
            " tienes " +
            attackDetails.normal.length +
            " ataques normales y " +
            attackDetails.sac.length +
            " SACS en tu contra"
        );
        if (attackDetails.normal.length > 0) {
          await botTelegram.sendTextMessage(
            bot.telegramId, //bot.telegramGroupId
            "<b>Detalle de Ataques normales</b>"
          );
          attackDetails.normal.forEach(async (attackDetail) => {
            let shipsDetailMsg = "";
            attackDetail.ships.forEach((ship) => {
              shipsDetailMsg += "✔️ " + ship.name + " " + ship.qty + "\n";
            });
            await botTelegram.sendTextMessage(
              bot.telegramId,
              "<b>Detalles</b>:\n" +
                "✅ <b>Jugador hostil:</b> " +
                attackDetail.hostilePlayer.name +
                "\n" +
                "✅ <b>Desde:</b> " +
                attackDetail.hostilePlayer.origin.planetName +
                " (" +
                attackDetail.hostilePlayer.origin.coords +
                ") (" +
                (attackDetail.hostilePlayer.origin.type == "moon"
                  ? "luna"
                  : "planeta") +
                ")\n" +
                "✅ <b>A tu planeta:</b> " +
                attackDetail.hostilePlayer.target.planetName +
                " (" +
                attackDetail.hostilePlayer.target.coords +
                ") (" +
                (attackDetail.hostilePlayer.target.type == "moon"
                  ? "luna"
                  : "planeta") +
                ")\n" +
                "🕜 <b>Hora de impacto:</b> " +
                formatISO9075(attackDetail.hostilePlayer.impactHour) +
                "\n" +
                "🕜 <b>Tiempo restante:</b> " +
                msToTime(attackDetail.hostilePlayer.timeRemaining) +
                "\n" +
                "📝 <b>Detalle de Naves:</b>\n" +
                shipsDetailMsg
            );
          });
        }
        if (attackDetails.sac.length > 0) {
          await timeout(2000);
          await botTelegram.sendTextMessage(
            bot.telegramId, //bot.telegramGroupId
            "<b>Detalle de ataques en SAC</b>\nte mostraré los detalles proximamente jajaj"
          );
        }
      }
    }
    await bot.closePage(page);
    // await timeout(Random(3000, 6000));
    return true;
  } catch (error) {
    console.log(
      "se dio un error en watchdog..probablemente el logeo, el error es este: ",
      error
    );
    await bot.checkLoginStatus(page);
    return;
  }
}

module.exports = watchDog;
