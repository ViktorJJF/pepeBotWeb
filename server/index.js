//new relic
//levantando telegram bot
require("./chatbot/Telegram/telegramBot");
const config = require("./config");
const seed = require("../seed");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const session = require("express-session"); //session managment
// const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const beginDailyFleetSave = require("./ogameScripts/dailyFleetSave");
const beginActions = require("./ogameScripts/beginActions");

const chronium = require("./classes/Chronium");
//Middleware

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(cookieParser());
app.use(
  cors({
    credentials: true,
  })
);

//session managment
//initializing session
// app.use(session({
//     secret: 'ijegoierjgoiemrjgoiem',
//     resave: false,
//     saveUninitialized: false,
//     // cookie: { secure: true }
// }))
mongoose.connect(
  config.dbString,
  {
    useNewUrlParser: true,
  },
  (err, res) => {
    if (err) throw err;
    console.log("DB online ONLINE");
  }
);

// app.use(
//   session({
//     secret: "ijegoierjgoiemrjgoiem",
//     store: new MongoStore({
//       mongooseConnection: mongoose.connection,
//     }),
//     resave: false,
//     saveUninitialized: true,
//     vcookie: {
//       httpOnly: true,
//       maxAge: 2419200000,
//     }, // configure when sessions expires
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

passport.serializeUser(function (user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
  done(null, user_id);
});

app.use("", require("./routes/api/telegram.js"));

//creando instancias
const BotModel = require("./models/Bots.js");
const Bot = require("./classes/Bot");
const bots = require("./classes/Bots.js");

BotModel.find().exec(async (err, payload) => {
  if (err) {
    console.log(err);
  }
  await chronium.begin(); //initializing browser
  payload.forEach(async (element) => {
    let bot = new Bot();

    bot.initialize(element);
    bots.addBot(bot);
    // if (bot.ogameEmail != "juancarlosjf@outlook.com.pe") {
    console.log("empezando login", bot.ogameEmail);
    let login = await bot.login(element.ogameEmail, element.ogamePassword);
    // console.log("🚀 Aqui *** -> login", login);
    console.log("se termino el loginnnn");
    // const beginSpies = require("./ogameScripts/spyRange");
    // await beginSpies(bot, "2:104", "2:300", "moon");
    // const spyPlayer = require("./ogameScripts/spyPlayer");
    // await spyPlayer(bot, "Constable Zenith");
    // // await timeout(10 * 1000);
    // let page = await bot.createNewPage();
    // await bot.filterSpyMessages(page);
    // const { sendAllShipsToDebris } = require("./ogameScripts/scripts");
    // await sendAllShipsToDebris("2:111:10", 0.1, page, "planet");
    if (login) {
      beginActions(bot);
    }
    //daily rutine
    // }
  });
  // beginDailyFleetSave(bots.bots);
  // seed.actions();
});

const routes = require("./routes/api/api.js");
const { timeout } = require("./utils/utils");
app.use("/api", routes);

//Handle Production
// if (process.env.NODE_ENV === "production") {
//static folder
app.use(express.static(__dirname + "/public"));
//Handle SPA
app.get(/.*/, (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
// }
process.env.PORT = config.port;
app.listen(process.env.PORT, () => {
  console.log(`Server starting on port ${process.env.PORT}`);
});
