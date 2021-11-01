const path = require("path");
import gulpCore from "./gulp-core";
const { existsSync } = require("fs");

//hexo.extend.filter.register("after_render:html", require("./lib/parser"), 5);
//hexo.extend.filter.register("after_render:html", require("./dist/hexo.test.js"), 5);
if (typeof hexo != "undefined") {
  if (existsSync(path.join(__dirname, "./build/dist/hexo-core.js"))) {
    //console.log("development mode");
    require(path.join(__dirname, "./build/dist/hexo-core.js"))(hexo);
  } else if (existsSync(path.join(__dirname, "./dist/hexo-core.js"))) {
    //console.log("production mode");
    require(path.join(__dirname, "./dist/hexo-core.js"))(hexo);
  } else if (existsSync(path.join(__dirname, "./hexo-core.js"))) {
    //console.log("production mode");
    require(path.join(__dirname, "./hexo-core.js"))(hexo);
  }
}

/**
 * gulp function
 * @type {(function(gulpConfig): void)}
 */
module.exports = {
  gulpCore,
};

// eslint-disable-next-line no-unused-vars
//export import gulp = require("./gulp-core");
export = {
  gulpCore,
};
