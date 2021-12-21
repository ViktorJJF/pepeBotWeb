// const { api } = require("../../chatbot/Telegram/telegramBot");
const express = require("express");
const app = express();
const config = require("../../config");
const telegramBot = require("../../chatbot/Telegram/telegramBot");

// We are receiving updates at the route below!
app.post(`${config.SERVER_URL}/webhook`, (req, res) => {
  // api.processUpdate(req.body);
  // res.sendStatus(200);
});

app.post("/api/telegram/message", (req, res) => {
  let msg = req.body.message;
  telegramBot.sendTextMessage(624818317, msg);
  res.json({
    ok: true,
    msg
  });
});

module.exports = app;
