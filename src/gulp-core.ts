import path from "path";
import { process as ProcessXML } from "./core";
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
}

module.exports = function (bloggerConfig: gulpConfig) {
  if (!bloggerConfig.hasOwnProperty("input") || !bloggerConfig.hasOwnProperty("output")) {
    return;
  }
  for (const inputKey in bloggerConfig.input) {
    const xml = path.resolve(bloggerConfig.input[inputKey]);
    ProcessXML(xml, bloggerConfig.output, bloggerConfig.hostname, bloggerConfig.callback);
  }
};
