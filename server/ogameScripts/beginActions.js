const { Random, timeout } = require("../utils/utils.js");
const beginFleetSave = require("./fleetSave.js");
const beginExpeditions = require("./expeditions.js");
const beginWatchdog = require("./watchDog.js");

beginActions = async bot => {
  let actions = await bot.getActions();
  console.log("las acciones son:", actions);
  for (const action of actions) {
    switch (action.type) {
      case "expeditions":
        let ships = [
          { id: 1, qty: 5 },
          { id: 9, qty: 10 }
        ];
        beginExpeditions(action.payload.coords, ships, bot);
        break;
      case "watchDog":
        beginWatchdog(bot);
        break;
      case "dailyFleetSave":
        // beginFleetSave(bot,"");
        break;

      default:
        break;
    }
  }
};

module.exports = beginActions;
