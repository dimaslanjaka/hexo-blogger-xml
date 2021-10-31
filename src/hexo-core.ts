import { existsSync, mkdirSync, writeFileSync } from "fs";
import Hexo from "hexo";
import path from "path";
import BloggerParser from "./parser/Blogger";

interface BloggerXmlConfig extends ObjectConstructor {
  /**
   * Blogger xml files
   */
  input: string[];
  /**
   * Folder output
   */
  output: string;
  /**
   * Blog hostname/domain
   */
  hostname?: string[];
  /**
   * Script to process each post content
   */
  callback?: string;
}

/**
 * Hexo preprocessor
 * @param hexo
 */
module.exports = function (hexo: Hexo) {
  const config = hexo.config;
  // if config blogger_xml found, continue process otherwise cancel by return
  if (!config.hasOwnProperty("blogger_xml")) {
    return;
  }
  const bloggerConfig: BloggerXmlConfig = config.blogger_xml;
  const xmlList = bloggerConfig.input;

  hexo.on("ready", function () {
    console.log("blogger import xml started", bloggerConfig);
    //mkdirSync("build/test", { recursive: true });
    //writeFileSync("build/test/hexo.json", simpleStringify(hexo));

    const root = hexo.base_dir;
    for (const xmlKey in xmlList) {
      const xml = path.resolve(path.join(root, xmlList[xmlKey]));
      if (existsSync(xml)) {
        console.log("processing", xml);
        const parser = new BloggerParser(xml);
        if (bloggerConfig.hasOwnProperty("hostname") && bloggerConfig.hostname.length > 0) {
          parser.setHostname(bloggerConfig.hostname);
        }
        const parsed = parser.parseEntry().getJsonResult();
        console.log(parsed.getParsedXml().length, "total posts");

        if (bloggerConfig.hasOwnProperty("callback")) {
          let scriptCall = path.resolve(path.join(root, bloggerConfig.callback));
          if (!existsSync(scriptCall)) {
            scriptCall = path.resolve(path.join(process.cwd(), bloggerConfig.callback));
          }
          if (existsSync(scriptCall)) {
            parsed.export(bloggerConfig.output, require(scriptCall));
          }
        }
      }
    }
  });
};

function simpleStringify(object) {
  const simpleObject = {};
  for (const prop in object) {
    if (!object.hasOwnProperty(prop)) {
      continue;
    }
    if (typeof object[prop] == "object") {
      continue;
    }
    if (typeof object[prop] == "function") {
      continue;
    }
    simpleObject[prop] = object[prop];
  }
  return JSON.stringify(simpleObject, null, 2); // returns cleaned up JSON
}
