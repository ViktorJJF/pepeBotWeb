const {
  timeout,
  Random,
  timeTomiliseconds,
  timeTomiliseconds2,
  getCloserDurationIndex,
} = require("../utils/utils.js");
class Fleet {
  constructor() {
    this.page = null; // puppeteer page
    this.origin = null; //1:241:4
    this.destination = null; //1:241:4
    this.speed = null; //0.10 - 1
    this.mission = null; //EXPEDITION - ATTACK - TRANSPORT
    this.duration = null; //1h 2h 1h:30min 40min etc
    this.allResources = null;
    this.allShips = null;
    this.ships = [
      {
        id: "202",
        name: "Nave pequeña de carga",
        type: "transporterSmall",
        qty: 0,
      },
      {
        id: "203",
        name: "Nave Grande de carga",
        type: "transporterLarge",
        qty: 0,
      },
      {
        id: "204",
        name: "Cazador Ligero",
        type: "fighterLight",
        qty: 0,
      },
      {
        id: "205",
        name: "Cazador Pesado",
        type: "fighterHeavy",
        qty: 0,
      },
      {
        id: "206",
        name: "Crucero",
        type: "cruiser",
        qty: 0,
      },
      {
        id: "207",
        name: "Nave de batalla",
        type: "battleship",
        qty: 0,
      },
      {
        id: "208",
        name: "Colonizador",
        type: "colonyShip",
        qty: 0,
      },
      {
        id: "209",
        name: "Reciclador",
        type: "recycler",
        qty: 0,
      },
      {
        id: "210",
        name: "Sonda de espionaje",
        type: "espionageProbe",
        qty: 0,
      },
      {
        id: "211",
        name: "Bombardero",
        type: "bomber",
        qty: 0,
      },
      {
        id: "213",
        name: "Destructor",
        type: "destroyer",
        qty: 0,
      },
      {
        id: "214",
        name: "Estrella de la muerte",
        type: "deathstar",
        qty: 0,
      },
      {
        id: "215",
        name: "Acorazado",
        type: "interceptor",
        qty: 0,
      },
      {
        id: "218",
        name: "Segador",
        type: "reaper",
        qty: 0,
      },
      {
        id: "219",
        name: "Explorador",
        type: "explorer",
        qty: 0,
      },
    ];
  }
  setPage(value) {
    this.page = value;
  }
  setOrigin(value) {
    this.origin = value;
  }
  setDestination(value) {
    this.destination = value;
  }
  setSpeed(value) {
    this.speed = value;
  }
  setMission(value) {
    this.mission = value;
  }
  setDuration(value) {
    this.duration = value;
  }
  addShips(shipId, qty) {
    this[shipId] = qty;
  }
  SetAllResources() {
    this.allResources = true;
  }
  SetAllShips() {
    this.allShips = true;
  }
  async sendNow() {
    //select origin
    console.log("yendo al origen");
    await this.page.waitForSelector("span.planet-koords");
    await this.page.evaluate((origin) => {
      var planetCoords = document.querySelectorAll(".smallplanet");
      for (let i = 0; i < planetCoords.length; i++) {
        var planetCoordsText = planetCoords[i]
          .querySelector("span.planet-koords")
          .innerText.replace(/[\[\]']+/g, "");
        if (planetCoordsText == origin) {
          if (planetCoords[i].querySelector(".moonlink"))
            planetCoords[i].querySelector(".moonlink").click();
          else planetCoords[i].querySelector("span.planet-koords").click();
        }
      }
    }, this.origin);
    //go to fleet view
    await this.page.waitForSelector(
      "#toolbarcomponent > #links > #menuTable > li:nth-child(8) > .menubutton"
    );
    await this.page.click(
      "#toolbarcomponent > #links > #menuTable > li:nth-child(8) > .menubutton"
    );
    await timeout(1500);
    await this.page.waitForSelector("#planet.planet-header");
    //check if exists ships
    let existsShips = await this.page.evaluate((e) =>
      document.querySelector("#warning") ? false : true
    );
    if (!existsShips) return null;
    await this.page.waitForSelector("#slots>.fleft:nth-child(2)");
    if (this.mission === "expedition") {
      let ships = await this.page.evaluate(() => {
        //get max expeditions
        var expMax = parseInt(
          document
            .querySelector("#slots>.fleft:nth-child(2)")
            .innerText.match(/([^\/]+$)/)[0]
        );
        var expInUse = parseInt(
          document
            .querySelector("#slots>.fleft:nth-child(2)")
            .innerText.match(/[0-9]/)[0]
        );
        var freeExpSlots = expMax - expInUse;
        console.log("las expediciones restantes son: ", freeExpSlots);
        var naveGrandeDeCargaTotal = parseInt(
          document
            .querySelector("span.transporterLarge>span")
            .getAttribute("data-value")
        );
        var cazadorLigeroTotal = parseInt(
          document
            .querySelector("span.fighterLight>span")
            .getAttribute("data-value")
        );
        var navePequenaDeCargaTotal = parseInt(
          document
            .querySelector("span.transporterSmall>span")
            .getAttribute("data-value")
        );
        var sondaTotal = parseInt(
          document
            .querySelector("span.espionageProbe>span")
            .getAttribute("data-value")
        );
        var battleShips = document.querySelectorAll(
          "#battleships>ul#military>li"
        );
        for (let i = battleShips.length - 2; i > -1; i--) {
          let lastBattleShipQty = parseInt(
            battleShips[i].querySelector("span>span").getAttribute("data-value")
          );
          if (lastBattleShipQty > 0) {
            var lastBattleShipId =
              battleShips[i].getAttribute("data-technology");
            i = -1;
          }
        }
        return [
          // {
          //   id: "204",
          //   qty:
          //     parseInt((cazadorLigeroTotal * 1) / freeExpSlots) > 3000
          //       ? 3000
          //       : parseInt((cazadorLigeroTotal * 1) / freeExpSlots)
          // },
          // {
          //   id: "202",
          //   qty: parseInt((navePequenaDeCargaTotal * 1) / freeExpSlots)
          // },
          {
            id: "203",
            qty: parseInt((naveGrandeDeCargaTotal * 1) / freeExpSlots),
          },
          {
            id: "210",
            qty: 1,
          },
          // { id: "215", qty: 1 },
          {
            id: "219",
            qty: 1,
          },
          {
            id: lastBattleShipId,
            qty: 1,
          },
        ];
      });
      ships.forEach((localShip) => {
        let shipIndex = this.ships.findIndex((ship) => ship.id == localShip.id);
        console.log("el indice es: ", shipIndex);
        if (this.ships[shipIndex].id !== "214")
          this.ships[shipIndex].qty = localShip.qty;
      });
    }

    let shipsToSend = []; // return
    if (this.allShips) {
      let hasEspionageProbe = await this.page.evaluate(() =>
        document.querySelector(".espionageProbe[data-status='on']")
      );
      if (!hasEspionageProbe) return null;
      await this.page.waitForSelector("a#sendall");
      await this.page.click("a#sendall");
      await timeout(500);
    } else {
      for (const ship of this.ships) {
        if (ship.qty > 0 || this.allShips) {
          shipsToSend.push(ship);
          console.log(
            "se colocara esta nave: ",
            ship.name,
            " - ",
            String(ship.qty)
          );
          await this.page.click(`li.${ship.type}>input`);
          await this.page.type(`li.${ship.type}>input`, String(ship.qty));
          await timeout(800);
        }
      }
    }

    await this.page.evaluate(() => {
      document
        .querySelector(
          ".content > #allornone > .allornonewrap > #continueToFleet2.continue.on > span"
        )
        .click();
    });
    // await this.page.waitForSelector(
    //   ".content > #allornone > .allornonewrap > #continueToFleet2.continue.on > span"
    // );
    // await this.page.click(
    //   ".content > #allornone > .allornonewrap > #continueToFleet2.continue.on > span"
    // );
    let [galaxy, system, planet] = this.destination.split(":");
    // await timeout(7500);
    await this.page.waitForSelector("tbody #galaxy", {
      visible: true,
    });
    await this.page.click("input#galaxy");
    await this.page.type("input#galaxy", galaxy);
    await timeout(2000);
    await this.page.click("input#system");
    await this.page.type("input#system", system);
    await timeout(2000);
    await this.page.click("input#position");
    await this.page.type("input#position", planet);
    await timeout(2000);
    // if (this.duration) {
    //   let speeds = [];
    //   let speedSelectors = await this.page.$$(".step");
    //   for (const speedSelector of speedSelectors) {
    //     await timeout(1000);
    //     await speedSelector.hover();
    //     await timeout(500);
    //     let currentSpeed = await this.page.evaluate(() => {
    //       return document
    //         .querySelector("span#duration")
    //         .innerText.replace(" h", "");
    //     });
    //     speeds.push(currentSpeed);
    //   }
    //   console.log("las velocidades son: ", speeds);
    //   speeds = speeds.map((e) => timeTomiliseconds(e));
    //   let closerDurationIndex = getCloserDurationIndex(
    //     speeds,
    //     timeTomiliseconds2(this.duration)
    //   );
    //   console.log(
    //     "lo mejor para ",
    //     this.duration,
    //     " es : ",
    //     speeds[closerDurationIndex]
    //   );
    //   //seting speed
    //   await this.page.click(`.step:nth-child(${closerDurationIndex})`);
    // } else {
    //   //seting speed
    //   await this.page.click(`.step:nth-child(10)`);
    // }
    await timeout(5000);
    // await this.page.waitForSelector("li#button15.on>a#missionButton15");
    //go to next page
    // en la nueva actualizacion de ogame no se necesita esto
    // await this.page.waitForSelector("a#continueToFleet3.continue.on", {
    //   visible: true,
    // });
    // await this.page.waitForSelector("a#continueToFleet3.continue.on");
    // await this.page.click("a#continueToFleet3.continue.on");
    switch (this.mission) {
      case "expedition":
        console.log("se escogio expedicion");
        await this.page.waitForSelector("li#button15>a#missionButton15", {
          visible: true,
        });
        await this.page.click("li#button15>a#missionButton15");
        break;
      case "espionage":
        console.log("se escogio espionaje");
        await this.page.waitForSelector("li#button6>a#missionButton6", {
          visible: true,
        });
        await this.page.click("li#button6>a#missionButton6");
        break;
      default:
        break;
    }
    //if all resources true
    if (this.allResources) {
      await this.page.waitForSelector("a#allresources>img");
      await this.page.click("a#allresources>img");
      let dutyRemaining = await this.page.evaluate(() => {
        var duty = document.querySelector("input#deuterium").value;
        duty = parseInt(duty.split(".").join(""));
        document.querySelector("input#deuterium").value = "";
        return duty;
      });
      await this.page.type(
        "input#deuterium",
        String(dutyRemaining - Random(400000, 600000))
      );
    }
    console.log("mandando la flota...");
    await this.page.waitForSelector("a#sendFleet.start.on");
    await this.page.click("a#sendFleet.start.on");
    return shipsToSend;
  }
}

module.exports = Fleet;
