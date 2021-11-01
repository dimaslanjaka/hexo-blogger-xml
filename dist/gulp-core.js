"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var path_1 = __importDefault(require("path"));
var core_1 = require("./core");
function gulpFunction(bloggerConfig) {
    if (!bloggerConfig.hasOwnProperty("input") || !bloggerConfig.hasOwnProperty("output")) {
        return;
    }
    for (var inputKey in bloggerConfig.input) {
        var xml = path_1["default"].resolve(bloggerConfig.input[inputKey]);
        if (xml.endsWith(".xml")) {
            //console.log("gulp hexo-blogger-xml processing", xml);
            (0, core_1.process)(xml, bloggerConfig.output, bloggerConfig.hostname, bloggerConfig.callback);
        }
    }
}
module.exports = gulpFunction;
exports["default"] = gulpFunction;
