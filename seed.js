const Bot = require("./server/models/Bots");
const formatISO9075 = require("date-fns/formatISO9075");

let actions = async () => {
  console.log("estamos dentro de actions");
  let actions = [
    { type: "expeditions", active: false },
    { type: "watchDog", active: false },
    { type: "dailyFleetSave", active: false }
  ];
  await Bot.update({}, { $set: { actions } }, { multi: true });
  let bots = await Bot.find({});
  bots.actions[0].active = true;
  await bots.save();
  console.log("los bots son:", bots);
  console.log(
    "su ultima actualizacion: ",
    formatISO9075(bots.actions[0].updatedAt)
  );
};

module.exports = {
  actions
};
