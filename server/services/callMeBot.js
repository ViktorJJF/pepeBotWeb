const axios = require("axios");

let callMebot = msg => {
  let telegramUsername = "@ViktorJJF";
  let url = `http://api.callmebot.com/start.php?source=web&user=${telegramUsername}&text=${encodeURI(
    msg
  )}&lang=es-ES-Standard-A`;
  axios
    .get(url)
    .then(res => {
      console.log("LLamada de telegram realizada con exito");
    })
    .catch(err => {
      console.error("Algo salio mal con la llamada de telegram: ", err);
    });
};

module.exports = callMebot;
