import { fstat, readdirSync } from "fs";
import path from "path";
import BloggerParser from "./Blogger";
BloggerParser.debug = true;

let files = readdirSync("xml");
files.forEach(function (file) {
  file = path.join("xml", file);
  if (/.xml$/.test(file)) {
    let parser = new BloggerParser(file);
    parser.clean().then(function () {
      parser.parseEntry().getJsonResult();
    });
  }
});
