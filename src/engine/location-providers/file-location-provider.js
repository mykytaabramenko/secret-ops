/**
 * @implements {LocationProviderIfc}
 */
class FileLocationProvider {
  #locations;
  constructor() {
    this.#locations = require("../../story/locations.json");
  }

  provide() {
    return this.#locations;
  }

  getByCode(code) {
    return this.#locations.find((location) => location.code === code);
  }
}

module.exports = FileLocationProvider;
