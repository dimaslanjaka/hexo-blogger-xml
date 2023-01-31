/// <reference types="node" />
import { PathLike } from 'fs';
import { JSDOM } from 'jsdom';
export declare function fromFile(path: string | PathLike): false | JSDOM;
export declare function fromString(str: string): JSDOM;
export declare function title(str: string): any;
