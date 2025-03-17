const Constants = {
  ProgressAttributes: {
    MISSIONS: "missions",
    STORY_LINES: "storyLines",
  },

  GameStates: {
    IN_PROGRESS: "inProgress",
    COMPLETED: "completed",
  },

  EntityDirectoryCodes: {
    MISSIONS: "missions",
    STORY_LINES: "locations",
  },

  ResultLevels: {
    SUCCESS: "success",
    NEUTRAL: "neutral",
    FAILURE: "failure",
    get BEST_TO_WORST() {
      return [this.SUCCESS, this.NEUTRAL, this.FAILURE];
    },
  },
};

module.exports = Constants;
