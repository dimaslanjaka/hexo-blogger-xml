"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.title = exports.fromString = exports.fromFile = void 0;
var fs_1 = require("fs");
var jsdom_1 = require("jsdom");
function fromFile(path) {
    if ((0, fs_1.existsSync)(path)) {
        var dom = new jsdom_1.JSDOM((0, fs_1.readFileSync)(path));
        return dom;
    }
    return false;
}
exports.fromFile = fromFile;
function fromString(str) {
    return new jsdom_1.JSDOM(str);
}
exports.fromString = fromString;
function title(str) {
    var dom = new jsdom_1.JSDOM(str);
    return dom.window.document.querySelector('title').textContent;
}
exports.title = title;
