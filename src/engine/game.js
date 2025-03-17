const ProgressManager = require("./progress-manager");
const Constants = require("./constants");

class Game {
  _consoleClient;
  _sceneProvider;
  _currentPlayer;
  #currentSceneIdx;

  /**
   *
   * @param {ConsoleIfc} consoleClient
   * @param {SceneProviderIfc} sceneProvider
   * @param {Player} currentPlayer
   */
  constructor(consoleClient, sceneProvider, currentPlayer = null) {
    this._consoleClient = consoleClient;
    this._sceneProvider = sceneProvider;
    this._currentPlayer = currentPlayer;
    this.#currentSceneIdx = 0;
  }

  set currentSceneIdx(idx) {
    this.#currentSceneIdx = idx;
  }

  async next(code) {
    const scene = await this.#getScene(code);

    if (!scene) {
      await this.saveProgress(Constants.GameStates.COMPLETED);
      await this.#renderFinalScene();
      return;
    }

    const mission = await this.generateMission();

    if (mission) {
      const shouldPlayMission = await this._consoleClient.askChoice(
        `You are offered a mission. Mission objective is: ${mission.objective}`,
        [
          { text: "Accept", value: true },
          { text: "Decline", value: false },
        ],
      );
      if (shouldPlayMission) {
        await mission.start();
        await this.saveProgress(Constants.GameStates.IN_PROGRESS);
      }
    }

    const options = scene.optionList.map((option) => ({
      text: option.action,
      value: option,
    }));

    const selectedOption = await this._consoleClient.askChoice(
      scene.question,
      options,
    );

    this._currentPlayer.processMetrics(selectedOption.metrics);

    await this.saveProgress(Constants.GameStates.IN_PROGRESS);

    this._consoleClient.log(selectedOption.consequence);

    await this._consoleClient.pauseForKey("return");

    await this.next(code);
  }

  async #renderFinalScene() {
    const summary = this.getSummary();

    const resultLevel = this.#getResult(summary);

    const metricsString = this._currentPlayer.getMetricsString();

    await this._consoleClient.log(
      this.getFinalMessage(
        resultLevel,
        summary[resultLevel].message,
        metricsString,
      ),
    );

    await this._consoleClient.pauseForKey("return");
  }

  async #getScene(code) {
    let scene;
    try {
      scene = await this._sceneProvider.provide(
        this.getEntityDirectoryCode(),
        code,
        ++this.#currentSceneIdx,
      );
    } catch (e) {
      console.log("Scene does not exist");
    }

    return scene;
  }

  #getResult(summary) {
    for (const level of Constants.ResultLevels.BEST_TO_WORST) {
      const minMetricsMap = summary[level].minMetrics;
      const doMetricsSatisfyLevel = Object.entries(minMetricsMap).every(
        ([key, value]) => this._currentPlayer.metrics[key] >= value,
      );

      if (doMetricsSatisfyLevel) return level;
    }

    return Constants.ResultLevels.FAILURE;
  }

  /**
   * @abstract
   */
  async generateMission() {
    throw new Error("Method not implemented");
  }

  /**
   * @abstract
   */
  getCodeForProgress() {
    throw new Error("Method not implemented");
  }

  /**
   * @abstract
   */
  getAttributeToUpdate() {
    throw new Error("Method not implemented");
  }

  /**
   * @abstract
   */
  getEntityDirectoryCode() {
    throw new Error("Method not implemented");
  }

  /**
   * @abstract
   */
  getSummary() {
    throw new Error("Method not implemented");
  }

  /**
   * @abstract
   */
  getFinalMessage(resultLevel, message, metricsString) {
    throw new Error("Method not implemented");
  }

  async saveProgress(state) {
    const attributeToUpdate = this.getAttributeToUpdate();

    const newProgress = {
      code: this.getCodeForProgress(),
      sceneIdx: this.#currentSceneIdx,
      ts: new Date().toISOString(),
      metrics: this._currentPlayer.metrics,
      state,
    };

    const progressData = await ProgressManager.load();

    const userData = progressData.find(
      (item) => item.user === this._currentPlayer.name,
    );

    const progressToUpdate = userData[attributeToUpdate].find(
      (item) => item.code === newProgress.code,
    );

    let listToUpdate = [...userData[attributeToUpdate]];
    if (progressToUpdate) {
      listToUpdate = userData[attributeToUpdate].map((currentProgress) => {
        if (currentProgress.code === newProgress.code) {
          return newProgress;
        }
        return currentProgress;
      });
    } else {
      listToUpdate.push(newProgress);
    }

    const newProgressData = progressData.map((item) => {
      if (item.user === this._currentPlayer.name) {
        return {
          ...item,
          [attributeToUpdate]: listToUpdate,
        };
      }
      return item;
    });

    await ProgressManager.save(newProgressData);
  }
}

module.exports = Game;
