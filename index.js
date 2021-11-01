const path = require("path");
const gulpFunction = require("./dist/gulp-core");
const { existsSync } = require("fs");

//hexo.extend.filter.register("after_render:html", require("./lib/parser"), 5);
//hexo.extend.filter.register("after_render:html", require("./dist/hexo.test.js"), 5);
if (typeof hexo != "undefined") {
  if (existsSync(path.join(__dirname, "./build/dist/hexo-core.js"))) {
    //console.log("development mode");
    require(path.join(__dirname, "./build/dist/hexo-core.js"))(hexo);
  } else {
    //console.log("production mode");
    require(path.join(__dirname, "./dist/hexo-core.js"))(hexo);
  }
}

/**
 * gulp function
 * @type {(function(gulpConfig): void)}
 */
module.exports = {
  gulp: gulpFunction,
};
