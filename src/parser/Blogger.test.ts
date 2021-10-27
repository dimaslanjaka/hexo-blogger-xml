import { existsSync, readdirSync } from "fs";
import path from "path";
import BloggerParser from "./Blogger";

BloggerParser.debug = true;

let dir = "xml";
if (!existsSync(dir)) {
  if (existsSync(path.join(process.cwd(), "xml"))) {
    dir = path.join(process.cwd(), "xml");
  } else if (existsSync(path.join(process.cwd(), "/../../", "xml"))) {
    dir = path.join(process.cwd(), "/../../", "xml");
  }
}

const files = readdirSync(dir);
files.forEach(function (file) {
  file = path.join(dir, file);
  if (/.xml$/.test(file)) {
    processXml(file);
  }
});

function processXml(file: any) {
  console.log("process", path.resolve(file));
  const parser = new BloggerParser(file);
  parser.setHostname(["webmanajemen.com"]);
  parser.clean().catch((e) => {
    console.error(e);
  });
  const parsed = parser.parseEntry().getJsonResult();
  console.log(parsed.getParsedXml().length, "total posts");
  parsed.export("build/hexo-blogger-xml/export", (content) => {
    //https://cdn.rawgit.com/dimaslanjaka/Web-Manajemen/master/Animasi/text-animasi.html
    content = content.replace(new RegExp("https://cdn.rawgit.com/dimaslanjaka", "m"), "http://dimaslanjaka.github.io/");
    return content;
  });
}
