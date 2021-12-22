import { existsSync, readFileSync } from "fs";
import Hexo from "hexo";
import path, { join } from "path";
import BloggerParser from "./parser/Blogger";
import { writeFileSync } from "./parser/util";
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

interface CacheLog {
  lastWrite: Date;
  paths: string[];
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

  let continueParse = true;
  const cacheloc = join(config.source_dir, "hexo-blogger-xml.json");
  if (existsSync(cacheloc)) {
    const readDate: CacheLog = JSON.parse(readFileSync(cacheloc).toString());
    if (readDate.lastWrite && readDate.paths.length) {
      continueParse = false;
    }
  }

  if (!continueParse) return;

  const bloggerConfig: BloggerXmlConfig = config.blogger_xml;
  if (!bloggerConfig.hostname) {
    bloggerConfig.hostname = [];
  }
  if (!bloggerConfig.callback) {
    bloggerConfig.callback = null;
  }
  const xmlList = bloggerConfig.input;

  hexo.on("ready", function () {
    console.log("blogger import xml started", bloggerConfig);
    const createLog: CacheLog = {
      lastWrite: undefined,
      paths: [],
    };

    const root = hexo.base_dir.toString();
    for (const xmlKey in xmlList) {
      const xmlPath = join(root.toString(), xmlList[xmlKey].toString());
      if (existsSync(xmlPath)) {
        console.log("processing", xmlPath);
        const parser = new BloggerParser(xmlPath);
        parser.on("write-post", function (postPath) {
          console.log("post written", postPath);
          createLog.paths.push(postPath);
        });
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

    createLog.lastWrite = new Date(Date.now());
    writeFileSync(cacheloc, JSON.stringify(createLog));
  });
};

export default hexoCore;
module.exports = hexoCore;
