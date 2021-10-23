import { existsSync, readdirSync } from "fs";
import path from "path";
import BloggerParser from "./Blogger";

BloggerParser.debug = true;

let dir = "xml";
if (existsSync("xml")) {
  dir = "xml";
} else if (existsSync(path.join(process.cwd(), "xml"))) {
  dir = path.join(process.cwd(), "xml");
} else if (existsSync(path.join(process.cwd(), "/../../", "xml"))) {
  dir = path.join(process.cwd(), "/../../", "xml");
}

const files = readdirSync(dir);
files.forEach(function (file) {
  file = path.join(dir, file);
  if (/.xml$/.test(file)) {
    const parser = new BloggerParser(file);
    parser.clean().then(function () {
      const parsed = parser.parseEntry().getJsonResult();
      console.log(parsed.getParsedXml().length, "total posts");
      parsed.export("build/hexo-blogger-xml/export", (content) => {
        //https://cdn.rawgit.com/dimaslanjaka/Web-Manajemen/master/Animasi/text-animasi.html
        content = content.replace(
          new RegExp("https://cdn.rawgit.com/dimaslanjaka", "m"),
          "http://dimaslanjaka.github.io/"
        );
        return content;
      });
    });
  }
});
