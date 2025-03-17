const Player = require("./player");
const Game = require("./game");
const Constants = require("./constants");
const MissionsGenerator = require("./missions/mission-generator");
const ProgressManager = require("./progress-manager");

class StoryLine extends Game {
  #locationProvider;
  #missionGenerator;
  #currentLocationCode;

  /**
   *
   * @param {ConsoleIfc} consoleClient
   * @param {SceneProviderIfc} sceneProvider
   * @param {LocationProviderIfc} locationProvider
   * @param {SceneProviderIfc} sceneProvider
   * @param {Player} [currentPlayer]
   */
  constructor(consoleClient, sceneProvider, locationProvider, currentPlayer) {
    super(consoleClient, sceneProvider, currentPlayer);
    this.#locationProvider = locationProvider;
    this.#missionGenerator = new MissionsGenerator(currentPlayer);
    this.#currentLocationCode = null;
  }

  static async init(consoleClient, sceneProvider, locationProvider) {
    const player = await Player.prepare(consoleClient);

    const userProgress = await ProgressManager.loadByUser(player.name);

    await player.save();

    if (userProgress) {
      consoleClient.log("Welcome back, agent! Let's continue the game!");
      return new StoryLine(
        consoleClient,
        sceneProvider,
        locationProvider,
        player,
      );
    }

    return new StoryLine(
      consoleClient,
      sceneProvider,
      locationProvider,
      player,
    );
  }

  async start() {
    await this.#play();
  }

  getSummary() {
    return require(
      `../story/locations/${this.#currentLocationCode}/summary.json`,
    );
  }

  getFinalMessage(resultLevel, message, metricsString) {
    return `Story line is finished with ${resultLevel} result. ${message}\n${metricsString}`;
  }

  async #play() {
    const doesAvailableLocationExist = await this.#chooseLocation();

    if (!doesAvailableLocationExist) {
      const shouldRestart = await this._consoleClient.askChoice(
        "Do you want to play again?",
        [
          { text: "Yes", value: true },
          { text: "No", value: false },
        ],
      );
      if (shouldRestart) {
        await ProgressManager.clearByUser(this._currentPlayer.name);
        this._currentPlayer.resetMetrics();
        await this.#play();
      }
      return;
    }

    this._currentPlayer.resetMetrics();

    await this.next(this.#currentLocationCode);

    await this.#play();
  }

  async #chooseLocation() {
    const userProgress = await ProgressManager.loadByUser(
      this._currentPlayer.name,
    );

    const shouldContinueLastStoryLine =
      await this.#checkIfShouldContinueLastStoryLine(userProgress);

    if (shouldContinueLastStoryLine) return true;

    const locations = await this.#locationProvider.provide();

    const unfinishedStoryLines = this.#getUnfinishedStoryLines(
      locations,
      userProgress,
    );

    if (!unfinishedStoryLines.length) {
      await this._consoleClient.log(
        "You have completed all available missions. Congratulations!",
      );
      await this._consoleClient.pauseForKey("return");
      return false;
    }

    const locationOptions = unfinishedStoryLines.map((location) => ({
      text: `${location.name} - ${location.description}`,
      value: location,
    }));

    const location = await this._consoleClient.askChoice(
      "Your next assignment is highly classified. You must choose your next destination carefully. Each location presents unique risks and challenges.\n" +
        "Where will you go?",
      locationOptions,
    );

    await this.#prepareForLocation(userProgress, location);

    return true;
  }

  async #prepareForLocation(userProgress, location) {
    const locationProgress = userProgress.storyLines.find(
      (storyLine) => storyLine.code === location.code,
    );

    this.#currentLocationCode = location.code;
    await this._currentPlayer.restoreMetrics();

    if (locationProgress) {
      this.currentSceneIdx = locationProgress.sceneIdx;
      return;
    }

    this.currentSceneIdx = 1;
  }

  async #checkIfShouldContinueLastStoryLine(userProgress) {
    if (!userProgress.storyLines.length) return false;

    const lastUnfinishedStoryLine = this.#getLastPlayedStoryLine(userProgress);

    if (!lastUnfinishedStoryLine) return false;

    const location = await this.#locationProvider.getByCode(
      lastUnfinishedStoryLine.code,
    );

    const shouldContinue = await this._consoleClient.askChoice(
      `You have unfinished business in ${location.name}. Would you like to continue?`,
      [
        { text: "Yes", value: true },
        { text: "No", value: false },
      ],
    );

    if (!shouldContinue) return false;

    await this.#prepareForLocation(userProgress, location);

    return true;
  }

  #getLastPlayedStoryLine(userProgress) {
    return userProgress.storyLines
      .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
      .filter((storyLine) => storyLine.state !== Constants.GameStates.COMPLETED)
      .at(0);
  }

  #getUnfinishedStoryLines(locations, userProgress) {
    return locations.filter((location) => {
      const storyLine = userProgress.storyLines.find(
        (storyLine) => storyLine.code === location.code,
      );

      if (!storyLine) return true;

      return storyLine.state !== Constants.GameStates.COMPLETED;
    });
  }

  generateMission() {
    return this.#missionGenerator.generate(
      this._consoleClient,
      this._sceneProvider,
      this._currentPlayer,
    );
  }

  getAttributeToUpdate() {
    return Constants.ProgressAttributes.STORY_LINES;
  }

  getCodeForProgress() {
    return this.#currentLocationCode;
  }

  getEntityDirectoryCode() {
    return Constants.EntityDirectoryCodes.STORY_LINES;
  }
}

module.exports = StoryLine;
