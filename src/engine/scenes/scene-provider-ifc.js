class SceneProviderIfc {
  /**
   * @abstract
   * @param {string} locationCode
   * @returns {{question: string, optionList: Array<{action: string, consequence: string, metrics: Object}>}|null}
   */
  provide(locationCode) {}
}

module.exports = SceneProviderIfc;
