"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var Blogger_1 = __importDefault(require("./parser/Blogger"));
/**
 * Hexo preprocessor
 * @param hexo
 */
var hexoCore = function (hexo) {
    var config = hexo.config;
    // if config blogger_xml found, continue process otherwise cancel by return
    if (!config["blogger_xml"]) {
        hexo.log.error("hexo blogger xml not set");
        return;
    }
    var bloggerConfig = config.blogger_xml;
    if (!bloggerConfig.hasOwnProperty("hostname")) {
        bloggerConfig.hostname = [];
    }
    if (!bloggerConfig.hasOwnProperty("callback")) {
        bloggerConfig.callback = null;
    }
    var xmlList = bloggerConfig.input;
    hexo.on("ready", function () {
        console.log("blogger import xml started", bloggerConfig);
        //mkdirSync("build/test", { recursive: true });
        //writeFileSync("build/test/hexo.json", simpleStringify(hexo));
        var root = hexo.base_dir;
        for (var xmlKey in xmlList) {
            var xmlPath = path_1["default"].join(root, xmlList[xmlKey]);
            if ((0, fs_1.existsSync)(xmlPath)) {
                console.log("processing", xmlPath);
                var parser = new Blogger_1["default"](xmlPath);
                if (bloggerConfig.hostname.length > 0) {
                    parser.setHostname(bloggerConfig.hostname);
                }
                var parsed = parser.parseEntry().getJsonResult();
                console.log(parsed.getParsedXml().length, "total posts");
                if (typeof bloggerConfig.callback == "string") {
                    var scriptCall = path_1["default"].resolve(path_1["default"].join(root, bloggerConfig.callback));
                    if (!(0, fs_1.existsSync)(scriptCall)) {
                        scriptCall = path_1["default"].resolve(path_1["default"].join(process.cwd(), bloggerConfig.callback));
                    }
                    if ((0, fs_1.existsSync)(scriptCall)) {
                        parsed["export"](bloggerConfig.output, require(scriptCall));
                    }
                }
            }
        }
    });
};
exports["default"] = hexoCore;
module.exports = hexoCore;
