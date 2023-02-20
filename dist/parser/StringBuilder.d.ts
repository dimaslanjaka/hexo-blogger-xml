export default class {
    private result;
    constructor(str?: string);
    /**
     * Append to previous string
     * @param str
     */
    append(str?: string): this;
    /**
     * Append in new line to previous string
     * @param str
     */
    appendLine(str?: string): this;
    toString(): string;
}
