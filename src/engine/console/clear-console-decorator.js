const ConsoleClient = require("./console-client");

/**
 * @implements {UserInputIfc}
 * @implements {ConsoleIfc}
 */
class ClearConsoleDecorator extends ConsoleClient {
  async log(...args) {
    this._console.clear();
    return super.log(...args);
  }

  async error(...args) {
    this._console.clear();
    return super.error(...args);
  }

  async warn(...args) {
    this._console.clear();
    return super.warn(...args);
  }
}

module.exports = ClearConsoleDecorator;
