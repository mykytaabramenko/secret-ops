const Game = require("../game");
const Constants = require("../constants");

class Mission extends Game {
  #missionCode;
  #summary;

  /**
   *
   * @param {ConsoleIfc} consoleClient
   * @param {SceneProviderIfc} sceneProvider
   * @param {Player} currentPlayer
   * @param {string} missionCode
   */
  constructor(consoleClient, sceneProvider, currentPlayer, missionCode) {
    super(consoleClient, sceneProvider, currentPlayer);
    this.#missionCode = missionCode;
    this.#summary = require(`../../story/missions/${missionCode}/summary.json`);
  }

  get objective() {
    return this.#summary.objective;
  }

  async start() {
    await this.next(this.#missionCode);
  }

  getSummary() {
    return this.#summary;
  }

  getFinalMessage(resultLevel, message, metricsString) {
    return `Mission is finished with ${resultLevel} result. ${message}\n${metricsString}`;
  }

  generateMission() {
    return false;
  }

  getAttributeToUpdate() {
    return Constants.ProgressAttributes.MISSIONS;
  }

  getCodeForProgress() {
    return this.#missionCode;
  }

  getEntityDirectoryCode() {
    return Constants.EntityDirectoryCodes.MISSIONS;
  }
}

module.exports = Mission;
