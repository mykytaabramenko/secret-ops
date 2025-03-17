const fs = require("node:fs").promises;
const path = require("node:path");
const Mission = require("./mission");
const Constants = require("../constants");
const ProgressManager = require("../progress-manager");

class MissionGenerator {
  #currentPlayer;
  #initialMissionProbability;

  constructor(currentPlayer) {
    this.#currentPlayer = currentPlayer;
    this.#initialMissionProbability = 0.5;
  }

  async generate(consoleClient, sceneProvider, currentPlayer) {
    const missionsDirPath = path.resolve(__dirname, "../../story/missions");
    const missions = await fs.readdir(missionsDirPath);

    const userProgress = await ProgressManager.loadByUser(
      this.#currentPlayer.name,
    );

    const passedMissionCodes = userProgress.missions.reduce(
      (result, mission) => {
        if (mission.state !== Constants.GameStates.COMPLETED) return result;
        result.push(mission.code);
        return result;
      },
      [],
    );

    const availableMissions = missions.filter(
      (mission) => !passedMissionCodes.includes(mission),
    );

    if (!availableMissions.length) return false;

    const missionProbability =
      this.#initialMissionProbability *
      (availableMissions.length / missions.length);

    const finalProbability = Math.max(0.1, missionProbability);

    const shouldReturnMission = Math.random() < finalProbability;

    if (!shouldReturnMission) return false;

    const missionIdx = Math.floor(Math.random() * availableMissions.length);

    return new Mission(
      consoleClient,
      sceneProvider,
      currentPlayer,
      availableMissions[missionIdx],
    );
  }
}

module.exports = MissionGenerator;
