const { promises: fs } = require("node:fs");
const path = require("node:path");

const Constants = require("./constants");

class ProgressManager {
  #filepath;

  constructor() {
    this.#filepath = path.resolve(__dirname, "../data/progress.json");
  }

  async load() {
    const content = await this.#getFile();

    if (content) {
      return JSON.parse(content);
    }

    return [];
  }

  async loadByUser(user) {
    const data = await this.load();
    return data.find((progress) => progress.user === user);
  }

  async clearByUser(user) {
    const data = await this.load();
    const newData = data.map((progress) => {
      const shouldClearProgress = progress.user === user;

      if (!shouldClearProgress) return progress;

      return {
        user,
        ts: new Date().toISOString(),
        [Constants.ProgressAttributes.STORY_LINES]: [],
        [Constants.ProgressAttributes.MISSIONS]: [],
      };
    });
    await this.save(newData);
  }

  save(data = []) {
    return fs.writeFile(this.#filepath, JSON.stringify(data));
  }

  async #getFile() {
    let progressFile;
    try {
      const progressFileStat = await fs.stat(this.#filepath);
      if (!progressFileStat.isFile()) {
        await fs.unlink(this.#filepath);
        return;
      }

      progressFile = await fs.readFile(this.#filepath, "utf8");
    } catch (e) {
      if (e.code !== "ENOENT") {
        console.error("Error checking file:", e);
        throw new e();
      }
    }

    return progressFile;
  }
}

module.exports = new ProgressManager();
