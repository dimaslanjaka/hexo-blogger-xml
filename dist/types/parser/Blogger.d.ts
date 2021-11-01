/// <reference path="../../../../src/types/entry.d.ts" />
/// <reference types="node" />
import * as fs from "fs";
import { PostHeader } from "../types/post-header";
import "./JSON";
interface objResult {
    permalink: string;
    headers: PostHeader;
    content: string;
}
declare class BloggerParser {
    static debug: boolean;
    /**
     * ID Process
     */
    id: string;
    buildDir: string;
    entriesDir: string;
    private document;
    parseXmlJsonResult: objResult[];
    hostname: string[];
    constructor(xmlFile: string | fs.PathLike);
    setHostname(host: string[]): void;
    setEntriesDir(dir: string): void;
    /**
     * Clean build dir
     */
    clean(): this;
    /**
     * Parse entries from feed
     * @returns void
     */
    parseEntry(): this;
    getJsonResult(): this;
    /**
     * Modify body content such as
     * - external link
     * - first img
     * - post description
     * @param content
     */
    modifyHtml(content: string): {
        thumbnail: string;
        content: any;
        description: any;
    };
    getParsedXml(): objResult[];
    /**
     * export parsed xml to folder (default source/_posts)
     * @param dir folder posts
     * @param callback function called each post (required return string content after modification)
     * @example
     * export("source/_posts", (content) => {
     *   content = content.replace('http://', 'https://') // replace http to https for example
     *   return content; // return back the modified content
     * })
     */
    export(dir?: string, callback?: (arg0: string, arg1: PostHeader) => string): void;
    /**
     * Trim Object
     * @see {@link https://stackoverflow.com/a/51616282}
     * @param obj
     */
    objTrim(obj: object): object;
    parse_url(url: string): URL | string;
    /**
     * Automatic process xml and output into directory with custom callback each function
     * @param outputDir
     * @param callback
     */
    auto(file: string, outputDir: string, callback: (content: string) => any): void;
    toString(): string;
}
export default BloggerParser;
