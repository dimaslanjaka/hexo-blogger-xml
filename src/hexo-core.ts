import { existsSync } from "fs";
import Hexo from "hexo";
import path from "path";
import BloggerParser from "./parser/Blogger";
import { LooseObject } from "./types/post-header";

export interface BloggerXmlConfig extends LooseObject {
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
  /**
   * Site title
   */
  site_title?: string;
  /**
   * Default thumbnail if no image inside post
   */
  thumbnail?: string;
}

/**
 * Hexo preprocessor
 * @param hexo
 */
const hexoCore = function (hexo: Hexo) {
  const config = hexo.config;
  // if config blogger_xml found, continue process otherwise cancel by return
  if (!config["blogger_xml"]) {
    hexo.log.error("hexo blogger xml not set");
    return;
  }

  const bloggerConfig: BloggerXmlConfig = config.blogger_xml;
  if (!bloggerConfig.hasOwnProperty("hostname")) {
    bloggerConfig.hostname = [];
  }
  if (!bloggerConfig.hasOwnProperty("callback")) {
    bloggerConfig.callback = null;
  }
  const xmlList = bloggerConfig.input;

  hexo.on("ready", function () {
    console.log("blogger import xml started", bloggerConfig);
    //mkdirSync("build/test", { recursive: true });
    //writeFileSync("build/test/hexo.json", simpleStringify(hexo));

    const root = hexo.base_dir;
    for (const xmlKey in xmlList) {
      const xmlPath = path.join(root, xmlList[xmlKey]);
      if (existsSync(xmlPath)) {
        console.log("processing", xmlPath);
        const parser = new BloggerParser(xmlPath);
        if (bloggerConfig.hostname.length > 0) {
          parser.setHostname(bloggerConfig.hostname);
        }
        const parsed = parser.parseEntry().getJsonResult();
        console.log(parsed.getParsedXml().length, "total posts");

        if (typeof bloggerConfig.callback == "string") {
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
export default hexoCore;
module.exports = hexoCore;
