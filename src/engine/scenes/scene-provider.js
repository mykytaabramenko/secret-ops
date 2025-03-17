class SceneProvider {
  provide(entityDirectoryCode, code, number) {
    let scene;
    try {
      scene = require(
        `../../story/${entityDirectoryCode}/${code}/${number}.json`,
      );
    } catch (e) {
      return null;
    }
    return scene;
  }
}

module.exports = SceneProvider;
