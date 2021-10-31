"use strict";
exports.__esModule = true;
/**
 * Hexo preprocessor
 * @param hexo
 */
module.exports = function (hexo) {
    var config = hexo.config;
    // if config blogger_xml found, continue process otherwise cancel by return
    if (config.hasOwnProperty("blogger_xml")) {
        console.log("Config blogger xml found");
    }
    else {
        return;
    }
    var xmls = config.blogger_xml;
    hexo.on("ready", function () {
        console.log("blogger import xml started");
    });
};
