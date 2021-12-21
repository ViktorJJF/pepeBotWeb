class Coordinate {
  constructor(galaxy, system, planet, planetType = "planet") {
    this.galaxy = galaxy;
    this.system = system;
    this.planet = planet;
    this.planetType = planetType;
  }
  generateCoords() {
    return this.galaxy + ":" + this.system + ":" + this.planet;
  }
}

module.exports = Coordinate;