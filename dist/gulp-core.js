"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var path_1 = __importDefault(require("path"));
var core_1 = __importDefault(require("./core"));
function gulpFunction(bloggerConfig) {
    if (!bloggerConfig.hasOwnProperty("input") || !bloggerConfig.hasOwnProperty("output")) {
        return;
    }
    for (var inputKey in bloggerConfig.input) {
        var xml = path_1["default"].resolve(bloggerConfig.input[inputKey]);
        if (xml.endsWith(".xml")) {
            //console.log("[hexo-blogger-xml][gulp] processing", xml);
            var start = new core_1["default"]();
            if (bloggerConfig.on) {
                if (typeof bloggerConfig.on.finish == "function")
                    start.on("finish", bloggerConfig.on.finish);
                if (typeof bloggerConfig.on.init == "function")
                    start.on("init", bloggerConfig.on.init);
            }
            start.process(xml, bloggerConfig.output, bloggerConfig.hostname, bloggerConfig.callback);
        }
    }
}
module.exports = gulpFunction;
exports["default"] = gulpFunction;
