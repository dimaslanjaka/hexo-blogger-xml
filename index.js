//hexo.extend.filter.register("after_render:html", require("./lib/parser"), 5);
//hexo.extend.filter.register("after_render:html", require("./dist/hexo.test.js"), 5);
require("./dist/hexo.test.js")(hexo);
