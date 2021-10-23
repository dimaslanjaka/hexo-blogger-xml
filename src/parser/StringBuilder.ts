export default class {
  private result = "";

  constructor(str = "") {
    this.result = str;
  }

  /**
   * Append to previous string
   * @param str
   */
  append(str?: string) {
    this.result += str;
    return this;
  }

  /**
   * Append in new line to previous string
   * @param str
   */
  appendLine(str?: string) {
    this.result += "\n";
    this.result += str;
    return this;
  }

  toString() {
    return this.result;
  }
}
