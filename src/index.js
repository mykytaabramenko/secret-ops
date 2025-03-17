const Game = require("./engine/story-line");
const ConsoleFactory = require("./engine/console/console-factory");

const LocationProvider = require("./engine/location-providers/file-location-provider");
const SceneProvider = require("./engine/scenes/scene-provider");

(async () => {
  const argsMap = process.argv.slice(2).reduce((result, arg) => {
    const [key, value] = arg.split("=");
    result[key.replace(/^--/, "")] = value || true;
    return result;
  }, {});
  const consoleClient = ConsoleFactory.getConsole(argsMap.preserveLogs);
  try {
    const game = await Game.init(
      consoleClient,
      new SceneProvider(),
      new LocationProvider(),
    );
    await game.start();
  } catch (e) {
    consoleClient.error("Error during playing game:", e);
  }
})();
