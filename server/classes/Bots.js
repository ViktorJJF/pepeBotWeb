class Bots {
  constructor(bots = []) {
    this.bots = bots;
  }
  addBot(newBot) {
    this.bots.push(newBot);
  }
  deleteBot(id) {
    let index = this.bots.findIndex(bot => bot._id == id);
    this.bots.splice(index, 1);
  }
  getBot(id, msg) {
    console.log("vengo de : ", msg);
    console.log("se recibio este id: ", id);
    console.log("se buscara dentro de esto: ", this.bots.length);
    return this.bots.find(bot => {
      console.log(
        "primera vuelta: ",
        typeof bot._id,
        bot._id,
        typeof id,
        id,
        bot._id == id
      );
      return bot._id == id;
    });
  }
  getBotByTelegramId(telegramId) {
    return this.bots.find(bot => bot.telegramId == telegramId);
  }
}

let bots = new Bots();

module.exports = bots;
