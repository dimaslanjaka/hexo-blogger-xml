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
module.exports = function (hexo) {
    var config = hexo.config;
    // if config blogger_xml found, continue process otherwise cancel by return
    if (!config.hasOwnProperty("blogger_xml")) {
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
            var xml = path_1["default"].resolve(path_1["default"].join(root, xmlList[xmlKey]));
            if (fs_1.existsSync(xml)) {
                console.log("processing", xml);
                var parser = new Blogger_1["default"](xml);
                if (bloggerConfig.hostname.length > 0) {
                    parser.setHostname(bloggerConfig.hostname);
                }
                var parsed = parser.parseEntry().getJsonResult();
                console.log(parsed.getParsedXml().length, "total posts");
                if (typeof bloggerConfig.callback == "string") {
                    var scriptCall = path_1["default"].resolve(path_1["default"].join(root, bloggerConfig.callback));
                    if (!fs_1.existsSync(scriptCall)) {
                        scriptCall = path_1["default"].resolve(path_1["default"].join(process.cwd(), bloggerConfig.callback));
                    }
                    if (fs_1.existsSync(scriptCall)) {
                        parsed["export"](bloggerConfig.output, require(scriptCall));
                    }
                }
            }
        }
    });
};
function simpleStringify(object) {
    var simpleObject = {};
    for (var prop in object) {
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
