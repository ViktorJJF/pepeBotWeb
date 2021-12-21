const bots = require("../classes/Bots");
let beginState = async (req, res, next) => {
  let bot = bots.getBot(req.params.id);
  if (!bot.browser) {
    console.log("ejecutando middleware");
    await bot.begin("dev");
    await bot.login();
    console.log("se termino de ejecutar el middleware");
  }
  next();
};

module.exports = {
  beginState
};
