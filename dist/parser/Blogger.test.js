"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var Blogger_1 = __importDefault(require("./Blogger"));
Blogger_1["default"].debug = true;
var dir = "xml";
if (!(0, fs_1.existsSync)(dir)) {
    if ((0, fs_1.existsSync)(path_1["default"].join(process.cwd(), "xml"))) {
        dir = path_1["default"].join(process.cwd(), "xml");
    }
    else if ((0, fs_1.existsSync)(path_1["default"].join(process.cwd(), "/../../", "xml"))) {
        dir = path_1["default"].join(process.cwd(), "/../../", "xml");
    }
}
var files = (0, fs_1.readdirSync)(dir);
files.forEach(function (file) {
    file = path_1["default"].join(dir, file);
    if (/.xml$/.test(file)) {
        processXml(file);
    }
});
function processXml(file) {
    console.log("process", path_1["default"].resolve(file));
    var parser = new Blogger_1["default"](file);
    parser.setHostname(["webmanajemen.com"]);
    var parsed = parser.parseEntry().getJsonResult();
    console.log(parsed.getParsedXml().length, "total posts");
    parsed["export"]("build/hexo-blogger-xml/export", function (content) {
        //https://cdn.rawgit.com/dimaslanjaka/Web-Manajemen/master/Animasi/text-animasi.html
        content = content.replace(new RegExp("https://cdn.rawgit.com/dimaslanjaka", "m"), "http://dimaslanjaka.github.io/");
        return content;
    });
}
