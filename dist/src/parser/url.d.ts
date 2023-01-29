declare class url extends URL {
    /**
     * Is valid url ?
     * @param str url string
     * @see {@link https://stackoverflow.com/a/5717133}
     * @returns
     */
    static isValidURL(str: string): boolean;
}
export default url;
