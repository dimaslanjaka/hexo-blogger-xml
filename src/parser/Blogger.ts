/// <reference path="../types/entry.d.ts" />
import * as fs from "fs";
import { existsSync, readFileSync } from "fs";
import * as path from "path";
import { JSDOM } from "jsdom";
import sanitize from "sanitize-filename";
import he from "he";
import xml2js from "xml2js";
import rimraf from "rimraf";
import { fromString } from "./html";
import { Entry } from "../types/entry";
import { PostHeader } from "../types/post-header";
import url from "./url";
import { truncate, writeFileSync } from "./util";
import config from "../config";
import "./JSON";
import ParserYaml from "./yaml";
import StringBuilder from "./StringBuilder";
import excludeTitleArr from "./excludeTitle.json";

interface objResult {
  permalink: string;
  headers: PostHeader;
  content: string;
}

class BloggerParser {
  static debug = false;
  private entriesDir = "build/hexo-blogger-xml/entries";
  private document: Document;
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  private xmlFile: fs.PathLike;
  private parseXmlJsonResult: objResult[] = [];

  constructor(xmlFile: string | fs.PathLike) {
    if (!existsSync(xmlFile)) throw `${xmlFile} not found`;
    this.xmlFile = xmlFile;
    writeFileSync("build/hexo-blogger-xml/.gitignore", "*");
    const xmlStr = readFileSync(xmlFile).toString();

    // Create empty DOM, the input param here is for HTML not XML, and we don want to parse HTML
    const dom = new JSDOM();
    // Get DOMParser, same API as in browser
    const DOMParser = dom.window.DOMParser;
    const parser = new DOMParser();
    // Create document by parsing XML
    this.document = parser.parseFromString(xmlStr, "text/xml");

    // save the xml after modifications
    const xmlString = this.document.documentElement.outerHTML;

    writeFileSync("build/hexo-blogger-xml/rss.xml", xmlString);
    writeFileSync("build/hexo-blogger-xml/inner.xml", this.document.documentElement.innerHTML);
    const entries = this.document.documentElement.getElementsByTagName("entry");

    if (entries.length) {
      writeFileSync("build/hexo-blogger-xml/entry.xml", entries[0].innerHTML);
    }
  }

  /**
   * Clean build dir
   */
  async clean() {
    await new Promise((resolve) =>
      rimraf(this.entriesDir, (x) => {
        resolve(this);
      })
    );
  }

  /**
   * Parse entries from feed
   * @returns void
   */
  parseEntry() {
    const feeds = this.document.documentElement.getElementsByTagName("entry");
    for (let index = 0; index < feeds.length; index++) {
      const element = feeds[index];
      const title = element.getElementsByTagName("title")[0].innerHTML;
      const excludeTitle = excludeTitleArr.map((title) => {
        return title.toLowerCase().trim();
      });
      // skip if contains default title
      if (excludeTitle.includes(title.toLowerCase().trim())) continue;

      /** CONTENT PROCESS START **/
      let content = element.getElementsByTagName("content")[0].innerHTML;
      content = he.decode(content);
      /** CONTENT PROCESS END **/

      // write post with decoded entities
      let obj = {
        entry: { content: "", id: [] },
      };
      //let decodedContent = he.decode(content);
      xml2js.parseString(element.outerHTML, function (err, result) {
        obj = result;
      });
      obj.entry.content = content;
      obj.entry.id[0] = obj.entry.id[0].replace("tag:blogger.com,1999:", "");
      //writeFileSync(path.join(this.entriesDir, sanitize(title) + ".xml"), element.outerHTML);
      writeFileSync(path.join(this.entriesDir, sanitize(title) + ".json"), JSON.stringify(obj, null, 2));
    }
    return this;
  }

  getJsonResult() {
    if (!existsSync(this.entriesDir)) throw "Entries Dir Not Found, previous process failed";
    const get = fs.readdirSync(this.entriesDir).map((file) => {
      return path.join(this.entriesDir, file);
    });

    const t = this;
    const results = [];

    if (Array.isArray(get) && get.length > 0) {
      get.forEach(function (file) {
        const buildPost: objResult = {
          permalink: "",
          headers: {
            title: "",
            webtitle: "",
            subtitle: "",
            lang: "en",
            date: new Date().toISOString(),
            type: "post",
            tags: [],
            author: {
              nick: "",
              link: "",
              email: "",
            },
            modified: new Date().toISOString(),
            category: [],
            comments: true,
            cover: "",
            location: "",
          },
          content: "",
        };
        const extname = path.extname(file);
        if (extname == ".json") {
          const read = readFileSync(file).toString();
          const json: Entry = JSON.parse(read);
          // build hexo header post
          if (typeof json == "object") {
            buildPost.content = json.entry.content;

            try {
              // post permalink
              if (typeof json.entry.link[4] != "undefined") {
                buildPost.permalink = new URL(json.entry.link[4].$.href).pathname;

                const parserhtml = fromString(buildPost.content);
                buildPost.content = t.stripFooterFeed(buildPost.content);

                // post title
                buildPost.headers.title = json.entry.title[0]._.trim();

                // post thumbnail/cover
                buildPost.headers.cover = t.getFirstImg(parserhtml);

                // post author
                buildPost.headers.author = {
                  nick: json.entry.author[0].name[0],
                  link: typeof json.entry.author[0].uri != "undefined" ? json.entry.author[0].uri[0] : "",
                  email: typeof json.entry.author[0].email != "undefined" ? json.entry.author[0].email[0] : "",
                };

                // post categories
                json.entry.category.forEach(function (category) {
                  const cat = category.$.term.trim();
                  if (!url.isValidURL(cat)) buildPost.headers.category.push(cat);
                });

                // post published
                buildPost.headers.date = json.entry.published[0];
                buildPost.headers.modified = json.entry.updated[0];

                // post description
                const contentStr = parserhtml.window.document.documentElement.querySelector("div,p,span");
                //console.log(contentStr.textContent);
                buildPost.headers.subtitle = truncate(he.decode(contentStr.textContent), 140, "").trim();
                // site title
                buildPost.headers.webtitle = config.webtitle;

                if (buildPost.permalink.length > 0) {
                  const saveFile = path.join(
                    "build/hexo-blogger-xml/results/",
                    buildPost.permalink.replace(/\.html$/, ".json")
                  );

                  results.push(buildPost);
                  writeFileSync(saveFile, JSON.stringify(buildPost, null, 2));
                }
              }
            } catch (e) {
              //writeFileSync(path.join("build/hexo-blogger-xml/errors/", "error.log"), JSON.safeStringify(e));
              writeFileSync(
                path.join("build/hexo-blogger-xml/errors/", "error-" + file),
                JSON.stringify(json, null, 2)
              );
              BloggerParser.die(e);
            }
          }
        }
      });
    }

    this.parseXmlJsonResult = results;
    return this;
  }

  getParsedXml() {
    return this.parseXmlJsonResult;
  }

  /**
   * export parsed xml to folder (default source/_posts)
   * @param dir folder posts
   * @param callback function called each post (required return string content after modification)
   * @example
   * export("source/_posts", (content) => {
   *   content = content.replace('http://', 'https://') // replace http to https for example
   *   return content; // return back the modified content
   * })
   */
  export(dir: string = "source/_posts", callback?: (arg0: string) => string) {
    let parsedList = this.getParsedXml();
    const process = (post: objResult) => {
      let postPath = path.join(dir, post.permalink.replace(/.html$/, ".md"));
      //let postPathTest = path.join(dir, "test.md");
      let postHeader = ParserYaml.fromObject(this.objTrim(post.headers));
      if (typeof callback == "function") post.content = callback(post.content);
      //post.content = this.stripFooterFeed(post.content);
      let postResult = new StringBuilder("---")
        .appendLine(postHeader.trim())
        .appendLine("---")
        .append("\n\n")
        .append(post.content)
        .toString();
      writeFileSync(postPath, postResult);
    };

    parsedList.forEach(process);

    //process(parsedList[0]);
  }

  /**
   * Trim Object
   * @see {@link https://stackoverflow.com/a/51616282}
   * @param obj
   */
  objTrim(obj: object) {
    Object.keys(obj).map((k) => (obj[k] = typeof obj[k] == "string" ? obj[k].trim() : obj[k]));
    return obj;
  }

  /**
   * Get first image from html
   * @param content
   */
  getFirstImg(content: string | JSDOM) {
    try {
      let parserhtml = typeof content == "string" ? fromString(content) : content;
      let find = parserhtml.window.document.getElementsByTagName("img");
      if (find) {
        for (let i = 0; i < find.length; i++) {
          let item = find.item(i);
          if (item.src.trim().length > 0) {
            return item.src;
            break;
          }
        }
      }
    } catch (e) {
      BloggerParser.die(e);
    }

    return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png";
  }

  /**
   * Remove custom messages from footer feeds
   * @param content
   */
  stripFooterFeed(content: JSDOM | string): string {
    try {
      let parserhtml = typeof content == "string" ? fromString(content) : content;
      // remove custom messages in footer feed
      let find1 = parserhtml.window.document.querySelector('[class="blogger-post-footer"]');
      if (find1) {
        find1.remove();
      }
      let find2 = parserhtml.window.document.getElementsByClassName("blogger-post-footer");
      if (find2) {
        for (let i = 0; i < find2.length; i++) {
          let item = find2.item(i);
          item.remove();
        }
      }
      //content = parserhtml.window.document.documentElement.innerHTML;
      content = parserhtml.window.document.body.innerHTML;
    } catch (e) {
      BloggerParser.die(e);
    }

    return content.toString();
  }

  private static die(...args: any[]) {
    console.clear();
    args.forEach((msg) => console.log(msg + "\n\n"));
    throw "D I E D";
  }
}

export default BloggerParser;
