//get time changed
var times = [];
var msg = document.querySelector("p.auction_info>span").innerText;
var interval = setInterval(() => {
  console.log("ejecutando intervalo...");
  if (msg !== document.querySelector("p.auction_info>span").innerText) {
    console.log("pasaron 5 min...");
    times.push(Date.now());
    console.log("times ahora es: ", times);
    msg = document.querySelector("p.auction_info>span").innerText;
  }
}, 900);

var buyInterval = setInterval(() => {
  if (document.querySelector("a.currentPlayer").innerText != "Jose Cuervo") {
    document.querySelector("a.js_sliderMetalMax").click();
    if (document.querySelector("a.pay")) {
      document.querySelector("a.pay").click();
      console.log("no eres el mejor postor y pagaremos mas");
    }
  }
}, 500);

// clearInterval(buyInterval);
