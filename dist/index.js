"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.gulpCore = void 0;
var hexo_core_1 = __importDefault(require("./hexo-core"));
__exportStar(require("./exports"), exports);
var gulp_core_1 = require("./gulp-core");
__createBinding(exports, gulp_core_1, "default", "gulpCore");
//hexo.extend.filter.register("after_render:html", require("./lib/parser"), 5);
//hexo.extend.filter.register("after_render:html", require("./dist/hexo.test.js"), 5);
if (typeof hexo != 'undefined') {
    (0, hexo_core_1["default"])(hexo);
    /*if (existsSync(path.join(__dirname, "./build/dist/hexo-core.js"))) {
      //console.log("development mode");
      require(path.join(__dirname, "./build/dist/hexo-core.js"))(hexo);
    } else if (existsSync(path.join(__dirname, "./dist/hexo-core.js"))) {
      //console.log("production mode");
      require(path.join(__dirname, "./dist/hexo-core.js"))(hexo);
    } else if (existsSync(path.join(__dirname, "./hexo-core.js"))) {
      //console.log("production mode");
      require(path.join(__dirname, "./hexo-core.js"))(hexo);
    }*/
}
