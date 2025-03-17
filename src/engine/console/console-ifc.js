/**
 * @interface ConsoleIfc
 */
class ConsoleIfc {
  /**
   * @param {...any} args
   */
  log(args) {}

  /**
   * @param {...any} args
   */
  error(args) {}

  /**
   * @param {...any} args
   */
  warn(args) {}
}

module.exports = ConsoleIfc;
