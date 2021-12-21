const puppeteer = require("puppeteer");
const config = require("../config");

class Chronium {
  constructor() {
    this.explorer = null;
  }
  async begin() {
    let browser;
    if (config.environment === "development") {
      browser = await puppeteer.launch({
        headless: false,
      });
    } else {
      browser = await puppeteer.launch({
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });
    }
    console.log("se termino el inicio");
    this.explorer = browser;
  }
  getBrowser() {
    return this.explorer;
  }
}

let chronium = new Chronium();

module.exports = chronium;
