"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var path = require("path");
var gulp_core_1 = __importDefault(require("./gulp-core"));
var existsSync = require("fs").existsSync;
//hexo.extend.filter.register("after_render:html", require("./lib/parser"), 5);
//hexo.extend.filter.register("after_render:html", require("./dist/hexo.test.js"), 5);
if (typeof hexo != "undefined") {
    if (existsSync(path.join(__dirname, "./build/dist/hexo-core.js"))) {
        //console.log("development mode");
        require(path.join(__dirname, "./build/dist/hexo-core.js"))(hexo);
    }
    else if (existsSync(path.join(__dirname, "./dist/hexo-core.js"))) {
        //console.log("production mode");
        require(path.join(__dirname, "./dist/hexo-core.js"))(hexo);
    }
    else if (existsSync(path.join(__dirname, "./hexo-core.js"))) {
        //console.log("production mode");
        require(path.join(__dirname, "./hexo-core.js"))(hexo);
    }
}
/**
 * gulp function
 * @type {(function(gulpConfig): void)}
 */
module.exports = {
    gulpCore: gulp_core_1["default"]
};
module.exports = {
    gulpCore: gulp_core_1["default"]
};
