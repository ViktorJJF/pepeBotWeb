const schedule = require("node-schedule");
const botTelegram = require("../chatbot/Telegram/telegramBot");
const { Random, timeout } = require("../utils/utils.js");
const beginFleetSave = require("./fleetSave.js");
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(0, 6)];
rule.hour = 0;
rule.minute = Random(1, 2);
// rule.minute = 1;

let beginDailyFleetSave = bots => {
  schedule.scheduleJob(rule, async () => {
    for (const bot of bots) {
      //adding action
      if (!(await bot.hasAction("dailyFleetSave"))) {
        await bot.addAction("dailyFleetSave");
      }
      //time to cancel
      await botTelegram.sendTextMessage(
        bot.telegramId,
        `<b>${bot.ogameEmail}</b> dentro de 03 minutos empezaré el fleetSave diario. Para cancelar escribe:<b>"cancela el fleet de hoy"</b>`
      );
      await timeout(3 * 60 * 1000); //tthree minutes to cancel daily fleetsave
      //begin
      if (await bot.hasAction("dailyFleetSave")) {
        await botTelegram.sendTextMessage(
          bot.telegramId,
          `<b>${bot.ogameEmail}</b> parece que te quedaste dormido, empezaré el fleetSave..."`
        );
        await beginFleetSave(bot, "0min", "6h");
        console.log("se culmino el fleet save para: ", bot.ogameEmail);
      } else {
        await botTelegram.sendTextMessage(
          bot.telegramId,
          `<b>${bot.ogameEmail}</b> se cumplieron los 03 minutos y veo que cancelaste el fleetsave de hoy... ojalá no te hayas dormido aún! 😡"`
        );
      }
      await timeout(Random(1 * 60 * 1000, 2 * 60 * 1000));
    }
    rule.minute = Random(1, 2);
  });
};

module.exports = beginDailyFleetSave;
