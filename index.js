//hexo.extend.filter.register("after_render:html", require("./lib/parser"), 5);
//hexo.extend.filter.register("after_render:html", require("./dist/hexo.test.js"), 5);
if (typeof hexo != "undefined") require("./dist/hexo-core.js")(hexo);
module.exports.gulp = require("./dist/gulp-core");
