const ConsoleClient = require("./console-client");
const ClearConsoleDecorator = require("./clear-console-decorator");

class ConsoleFactory {
  /**
   *
   * @param {boolean} preserveLogs
   * @return {ConsoleIfc}
   */
  static getConsole(preserveLogs = false) {
    if (preserveLogs) {
      return new ConsoleClient();
    } else {
      return new ClearConsoleDecorator();
    }
  }
}

module.exports = ConsoleFactory;
