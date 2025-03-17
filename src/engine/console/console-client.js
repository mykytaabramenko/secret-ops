const readline = require("readline/promises");
const keypress = require("keypress");

/**
 * @implements {UserInputIfc}
 * @implements {ConsoleIfc}
 */
class ConsoleClient {
  #rl;
  _console;

  constructor() {
    this._console = console;
    this.#rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async askQuestion(question) {
    process.stdin.resume();
    const answer = await this.#rl.question(`${question}\n`);
    process.stdin.pause();
    return answer;
  }

  async askChoice(question, optionList) {
    this.log(`${question}\n`);

    optionList.forEach(({ text, value }, index) => {
      console.log(`${index + 1}. ${text}`);
    });

    let isInputValid = false;
    process.stdin.resume();
    while (!isInputValid) {
      const answer = await this.#rl.question("Your choice: ");
      const choice = parseInt(answer, 10);
      if (choice >= 1 && choice <= optionList.length) {
        isInputValid = true;
        process.stdin.pause();
        return optionList[choice - 1].value;
      } else {
        console.warn("Invalid choice. Please try again.");
      }
    }
  }

  async pauseForKey(key = "return") {
    return new Promise((resolve) => {
      console.log(`\nPress '${key.toUpperCase()}' to continue...`);

      keypress(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.resume();

      function onKeyPress(_, inputKey) {
        if (inputKey && inputKey.name.toLowerCase() === key.toLowerCase()) {
          process.stdin.setRawMode(false);

          process.stdin.pause();
          process.stdin.removeListener("keypress", onKeyPress);

          resolve();
        }
      }

      process.stdin.on("keypress", onKeyPress);
    });
  }

  log(...args) {
    this._console.log(...args);
  }

  error(...args) {
    this._console.error(...args);
  }

  warn(...args) {
    this._console.warn(...args);
  }
}

module.exports = ConsoleClient;
