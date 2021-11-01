const fs = require("fs");
//hexo.extend.filter.register("after_render:html", require("./lib/parser"), 5);
//hexo.extend.filter.register("after_render:html", require("./dist/hexo.test.js"), 5);
if (typeof hexo != "undefined") {
  if (fs.existsSync("./build/dist/hexo-core.js")) {
    // development mode
    require("./build/dist/hexo-core.js")(hexo);
  } else {
    // publish mode
    require("./dist/hexo-core.js")(hexo);
  }
}

/**
 * gulp function
 * @type {(function(gulpConfig): void)}
 */
const gulpFunction = require("./dist/gulp-core");
const { existsSync } = require("fs");
module.exports = {
  gulp: gulpFunction,
};
