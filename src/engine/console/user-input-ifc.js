/**
 * @interface
 */
class UserInputIfc {
  /**
   * Provides an answer to a given question.
   * @param {string} question
   * @returns {Promise<string>}
   */
  async askQuestion(question) {}

  /**
   * Provides a choice from a list of options
   * @template T
   * @param {string} question
   * @param {Array<{text: string, value: T}>} optionList
   * @return {Promise<T>} - chosen item
   */
  async askChoice(question, optionList) {}

  /**
   * Pauses the program until a key is pressed
   * @param {string} key
   * @return {Promise<void>}
   */
  async pauseForKey(key) {}
}

module.exports = UserInputIfc;
