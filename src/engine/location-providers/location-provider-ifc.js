/**
 * @interface
 */
class LocationProviderIfc {
  /**
   * @returns {Array<{code: string, name: string, description: string}>}
   */
  provide() {}

  /**
   * @param {string} code
   * @returns {{code: string, name: string, description: string}}
   */
  getByCode(code) {}
}

module.exports = LocationProviderIfc;
