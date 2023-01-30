/// <reference types="node" />
import { EventEmitter } from 'events';
import BloggerParser from './parser/Blogger';
import { PostHeader } from './types/post-header';
declare interface core {
    on<U extends keyof core>(event: U, listener: core[U]): this;
    on(event: 'init', listener: () => any): this;
    on(event: 'finish', listener: (arg0: BloggerParser) => any): this;
}
declare class core extends EventEmitter {
    constructor();
    process(xml: string, output: string, hostname?: string[], callback?: (arg0: string, arg1: PostHeader) => string): void;
}
export default core;
