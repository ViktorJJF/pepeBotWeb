//new relic

const config = require("./config");
const seed = require("../seed");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const session = require("express-session"); //session managment
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const beginDailyFleetSave = require("./ogameScripts/dailyFleetSave");
const beginActions = require("./ogameScripts/beginActions");

const chronium = require("./classes/Chronium");
//Middleware

// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true
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
  config.dbString, {
    useNewUrlParser: true
  },
  (err, res) => {
    if (err) throw err;
    console.log("DB online ONLINE");
  }
);

app.use(
  session({
    secret: "ijegoierjgoiemrjgoiem",
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    }),
    resave: false,
    saveUninitialized: true,
    vcookie: {
      httpOnly: true,
      maxAge: 2419200000
    } // configure when sessions expires
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
  done(null, user_id);
});

//levantando telegram bot
require("./chatbot/Telegram/telegramBot");
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
  payload.forEach(async element => {
    let bot = new Bot();

    bot.initialize(element);
    bots.addBot(bot);
    if (
      bot.ogameEmail == "cs.nma18@gmail.com" ||
      config.environment !== "dev"
    ) {
      console.log("empezando login");
      await bot.login(element.ogameEmail, element.ogamePassword);
      console.log("se termino el login");
      beginActions(bot);
      //daily rutine
    }
  });
  // beginDailyFleetSave(bots.bots);
  // seed.actions();
});

const routes = require("./routes/api/api.js");
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