/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import * as fs from 'fs';
import 'js-prototypes';
import { PostHeader } from '../types/post-header';
import './JSON';
interface objResult {
    permalink: string;
    headers: PostHeader;
    content: string;
}
export declare interface BloggerParser {
    on<U extends keyof BloggerParser>(event: U, listener: BloggerParser[U]): this;
    on(event: 'lastExport', listener: (arg: Record<any, any>) => any): this;
    on(event: 'write-post', listener: (arg: string) => any): void;
}
export declare class BloggerParser extends EventEmitter {
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
        description: string;
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
    export(dir?: string, callback?: (arg0: string, arg1: PostHeader) => string): this;
    /**
     * Trim Object
     * @see {@link https://stackoverflow.com/a/51616282}
     * @param obj
     */
    objTrim(obj: Record<any, any>): Record<any, any>;
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
