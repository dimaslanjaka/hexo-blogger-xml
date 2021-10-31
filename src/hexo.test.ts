import * as fs from "fs";
import { mkdirSync } from "fs";
import Hexo from "hexo";

/**
 * Hexo preprocessor
 * @param hexo
 */
module.exports = function (hexo: Hexo) {
  const config = hexo.config;
  // if config blogger_xml found, continue process otherwise cancel by return
  if (config.hasOwnProperty("blogger_xml")) {
    console.log("Config blogger xml found");
  } else {
    return;
  }
  const xmls: string[] = config.blogger_xml;

  hexo.on("ready", function () {
    console.log("blogger import xml started");
  });
};
