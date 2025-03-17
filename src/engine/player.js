const ProgressManager = require("./progress-manager");
const Constants = require("./constants");

const MAX_METRIC_VALUE = 100;

const MetricMap = {
  secrecyLevel: "Secrecy Level",
  trust: "Trust",
  intelligence: "Intelligence gathered",
  stability: "Stability",
};

const INITIAL_METRICS = {
  secrecyLevel: 100,
  trust: 50,
  intelligence: 0,
  stability: 50,
};

class Player {
  #name;
  #metrics;

  constructor(name) {
    this.#name = name;
    this.#metrics = INITIAL_METRICS;
  }

  get name() {
    return this.#name;
  }

  get metrics() {
    return this.#metrics;
  }

  static async prepare(consoleClient) {
    const username = await consoleClient.askQuestion("What is your name?");
    const userProgress = await ProgressManager.loadByUser(username);

    if (userProgress) {
      return new Player(username);
    }

    return new Player(username);
  }

  processMetrics(newMetricsMap) {
    for (const [metric, value] of Object.entries(newMetricsMap)) {
      const computedValue = this.#metrics[metric] + value;
      this.#metrics[metric] =
        computedValue > MAX_METRIC_VALUE ? MAX_METRIC_VALUE : computedValue;
    }
  }

  getMetricsString() {
    let str = "Your current metrics:\n";
    for (const [metric, value] of Object.entries(this.#metrics)) {
      str = str.concat(`${MetricMap[metric]}: ${value}\n`);
    }

    return str;
  }

  resetMetrics() {
    this.#metrics = INITIAL_METRICS;
  }

  async restoreMetrics(storyLineCode) {
    const userProgress = await ProgressManager.loadByUser(this.#name);

    if (!userProgress) return;

    const storyLineProgress = userProgress.storyLines.find(
      (progress) => progress.code === storyLineCode,
    );

    if (!storyLineProgress) {
      this.resetMetrics();
      return;
    }

    this.#metrics = storyLineProgress.metrics;
  }

  async save() {
    const progressData = await ProgressManager.load();

    const userExists = progressData.find(
      (progress) => progress.user === this.#name,
    );
    if (userExists) return;

    const userProgress = {
      user: this.#name,
      [Constants.ProgressAttributes.STORY_LINES]: [],
      [Constants.ProgressAttributes.MISSIONS]: [],
    };

    progressData.push(userProgress);

    await ProgressManager.save(progressData);
  }
}

module.exports = Player;
