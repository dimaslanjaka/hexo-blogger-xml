import chalk from 'chalk';
import { EventEmitter } from 'events';
import { existsSync } from 'fs';
import BloggerParser from './parser/Blogger';
import { PostHeader } from './types/post-header';

declare interface core {
  on<U extends keyof core>(event: U, listener: core[U]): this;
  on(event: 'init', listener: () => any): this;
  on(event: 'finish', listener: (arg0: BloggerParser) => any): this;
  //emit<U extends keyof BloggerParser>(event: U, ...args: Parameters<BloggerParser[U]>): boolean;
}

class core extends EventEmitter {
  constructor() {
    super();
    this.emit('init');
  }

  process(
    xml: string,
    output: string,
    hostname?: string[],
    // eslint-disable-next-line no-unused-vars
    callback?: (arg0: string, arg1: PostHeader) => string
  ) {
    const self = this;
    //console.log(existsSync(xml), xml.endsWith(".xml"), xml);
    if (existsSync(xml) && xml.endsWith('.xml')) {
      console.log('processing', chalk.magenta(xml));
      const parser = new BloggerParser(xml);
      if (Array.isArray(hostname) && hostname.length > 0) {
        parser.setHostname(hostname);
      }

      // listen process event
      parser.on('lastExport', function (_obj) {
        //console.log(obj);
        //console.log("Last Export", "Finish");
        self.emit('finish', { parser: parsed });
      });

      const parsed = parser.parseEntry().getJsonResult();
      //console.log(parsed.getParsedXml().length, "total posts");

      if (typeof callback == 'function') {
        parsed.export(output, callback);
      }
    }
  }
}

export default core;
