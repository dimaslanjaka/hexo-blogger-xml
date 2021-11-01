//hexo.extend.filter.register("after_render:html", require("./lib/parser"), 5);
//hexo.extend.filter.register("after_render:html", require("./dist/hexo.test.js"), 5);
if (typeof hexo != "undefined") require("./dist/hexo-core.js")(hexo);
/**
 * gulp function
 * @type {(function(gulpConfig): void)}
 */
const gulpFunction = require("./dist/gulp-core");
module.exports = {
  gulp: gulpFunction,
};
