"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.process = void 0;
var fs_1 = require("fs");
var Blogger_1 = __importDefault(require("./parser/Blogger"));
var chalk_1 = __importDefault(require("chalk"));
function process(xml, output, hostname, 
// eslint-disable-next-line no-unused-vars
callback) {
    //console.log(existsSync(xml), xml.endsWith(".xml"), xml);
    if ((0, fs_1.existsSync)(xml) && xml.endsWith(".xml")) {
        console.log("processing", chalk_1["default"].magenta(xml));
        var parser = new Blogger_1["default"](xml);
        if (Array.isArray(hostname) && hostname.length > 0) {
            parser.setHostname(hostname);
        }
        var parsed = parser.parseEntry().getJsonResult();
        console.log(parsed.getParsedXml().length, "total posts");
        if (typeof callback == "function") {
            parsed["export"](output, callback);
        }
    }
}
exports.process = process;
