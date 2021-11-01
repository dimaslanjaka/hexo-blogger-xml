import { existsSync, readFileSync } from "fs";
import { BloggerXmlConfig } from "./hexo-core";

let config = {
  /**
   * Site title
   */
  webtitle: "WMI Gitlab",
  /**
   * Default fallback thumbnail
   */
  thumbnail:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png",
};

if (existsSync("xml/config.json")) {
  const getConfig = JSON.parse(readFileSync("xml/config.json").toString());
  // replace object value if conflict
  Object.keys(config).forEach(function (key) {
    if (config[key] == null || config[key] == 0) {
      config[key] = getConfig[key];
    }
  });
  // merge object
  config = Object.assign(config, getConfig);
}

if (typeof hexo != "undefined") {
  const bloggerConfig: BloggerXmlConfig = hexo.config.blogger_xml;
  if (bloggerConfig.hasOwnProperty("thumbnail")) {
    config.thumbnail = bloggerConfig.thumbnail;
  }
  if (bloggerConfig.hasOwnProperty("site_title")) {
    config.webtitle = bloggerConfig.site_title;
  }
}

export default config;
