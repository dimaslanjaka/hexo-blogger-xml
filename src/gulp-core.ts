import path from "path";
import core from "./core";
import BloggerParser from "./parser/Blogger";
import { LooseObject, PostHeader } from "./types/post-header";

export interface gulpConfig extends LooseObject {
  /**
   * Blogger xml files
   */
  input: string[];
  /**
   * Folder output
   */
  output: string;
  /**
   * Blog hostname/domain list / internal link list by domain name
   */
  hostname?: string[];
  // eslint-disable-next-line no-unused-vars
  callback: (arg0: string, arg1: PostHeader) => string;
  on?: {
    /**
     * On Process Started
     */
    init?: () => any;
    /**
     * On Process Finished
     */
    finish?: (arg0: BloggerParser) => any;
  };
}

function gulpFunction(bloggerConfig: gulpConfig) {
  if (!bloggerConfig.hasOwnProperty("input") || !bloggerConfig.hasOwnProperty("output")) {
    return;
  }
  for (const inputKey in bloggerConfig.input) {
    const xml = path.resolve(bloggerConfig.input[inputKey]);
    if (xml.endsWith(".xml")) {
      //console.log("gulp hexo-blogger-xml processing", xml);
      let start = new core();
      if (bloggerConfig.hasOwnProperty("on")) {
        if (typeof bloggerConfig.on.finish == "function") start.on("finish", bloggerConfig.on.finish);
        if (typeof bloggerConfig.on.init == "function") start.on("init", bloggerConfig.on.init);
      }
      start.process(xml, bloggerConfig.output, bloggerConfig.hostname, bloggerConfig.callback);
    }
  }
}

module.exports = gulpFunction;
export default gulpFunction;
