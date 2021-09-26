/// <reference path="../types/entry.d.ts" />
import { existsSync, mkdirSync, readFileSync } from "fs";
import * as fs from "fs";
import * as path from "path";
import { JSDOM } from "jsdom";
import sanitize from "sanitize-filename";
import he from "he";
import xml2js from "xml2js";
import rimraf from "rimraf";
import _ from "lodash";
import { fromString } from "./html";
import { Entry } from "../types/entry";
import { PostHeader } from "../types/post-header";
import url from "./url";
import { truncate, writeFileSync } from "./util";
import config from "../config";

class BloggerParser {
  static debug = false;
  private entriesDir = "build/hexo-blogger-xml/entries";
  private document: Document;
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  private xmlFile: fs.PathLike;
  constructor(xmlFile: string | fs.PathLike) {
    if (!existsSync(xmlFile)) throw `${xmlFile} not found`;
    this.xmlFile = xmlFile;
    writeFileSync("build/hexo-blogger-xml/.gitignore", "*");
    let xmlStr = readFileSync(xmlFile).toString();

    // Create empty DOM, the imput param here is for HTML not XML, and we don want to parse HTML
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
    let entries = this.document.documentElement.getElementsByTagName("entry");

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
    let feeds = this.document.documentElement.getElementsByTagName("entry");
    for (let index = 0; index < feeds.length; index++) {
      const element = feeds[index];
      const title = element.getElementsByTagName("title")[0].innerHTML;
      const excludeTitle = [
        "Template: Testing",
        "The type of publishing done for this blog.",
        "The list of administrators' emails for the blog.",
        "Whether this blog contains adult content",
        "Blog's Google Analytics account number",
        "The number of the archive index date format",
        "How frequently this blog should be archived",
        "The list of authors' emails who have permission to publish.",
        "Whether to provide an archive page for each post",
        "Who can comment",
        "Whether to require commenters to complete a Captcha",
        "List of e-mail addresses to send notifications of new comments to",
        "The type of feed to provide for blog comments",
        "Blog comment form location",
        "Blog comment message",
        "Whether to enable comment moderation",
        "Number of days after which new comments are subject to moderation",
        "Email address to send notifications of new comments needing moderation to",
        "Whether to show profile images in comments",
        "Whether to show comments",
        "Comment time stamp format number",
        "Whether to convert line breaks into <br /> tags in post editor",
        "Whether to convert line breaks into &lt;br /&gt; tags in post editor",
        "The custom ads.txt content of the blog served to ads search engines.",
        "Whether this blog serves custom ads.txt content to ads search engines.",
        "The content served when the requested post or page is not found.",
        "The custom robots.txt content of the blog served to search engines.",
        "Whether this blog serves custom robots.txt content to search engines.",
        "The number of the date header format",
        "Default comment mode for posts",
        "A description of the blog",
        "Whether to show a link for users to e-mail posts",
        "URL to redirect post feed requests to",
        "Whether float alignment is enabled for the blog",
        "Language for this blog",
        'Maximum number of things to show on the main page"',
        "Unit of things to show on the main page",
        "The meta description of the blog served to search engines.",
        "Whether this blog is served with meta descriptions.",
        "The name of the blog",
        "The type of feed to provide for per-post comments",
        "The type of feed to provide for blog posts",
        "Footer to append to the end of each entry in the post feed",
        "The template for blog posts",
        "Whether Quick Editing is enabled",
        "The access type for the readers of the blog.",
        "the list of emails for users who have permission to read the blog.",
        "The list of emails for users who have permission to read the blog.Whether this blog should be indexed by search engines",
        "whether this blog should be indexed by search engines",
        "The list of emails for users who have permission to read the blog",
        "Comma separated list of emails to send new blog posts to",
        "Whether to show a related link box in the post composer",
        "The BlogSpot subdomain under which to publish your blog",
        "The number of the time stamp format",
        "The time zone for this blog",
        "Whether to show images in the Lightbox when clicked",
      ].map((title) => {
        return title.toLowerCase().trim();
      });
      // skip if contains default title
      if (excludeTitle.includes(title.toLowerCase().trim())) continue;

      /** CONTENT PROCESS START **/
      let content = element.getElementsByTagName("content")[0].innerHTML;
      //content = he.decode(content);
      //let parserhtml = fromString(content);
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
      writeFileSync(path.join(this.entriesDir, sanitize(title) + ".xml"), element.outerHTML);
      writeFileSync(path.join(this.entriesDir, sanitize(title) + ".json"), JSON.stringify(obj, null, 2));
    }
    return this;
  }

  getJsonResult() {
    if (!existsSync(this.entriesDir)) throw "Entries Dir Not Found, previous process failed";
    const get = fs.readdirSync(this.entriesDir).map((file) => {
      return path.join(this.entriesDir, file);
    });
    if (Array.isArray(get) && get.length > 0)
      get.forEach(function (file) {
        const buildPost = {
          permalink: "",
          headers: {},
          content: "",
        };
        let extname = path.extname(file);
        if (extname == ".json") {
          let read = readFileSync(file).toString();
          let json: Entry = JSON.parse(read);
          // build hexo header post
          let headers: PostHeader = {
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
          };
          if (typeof json == "object") {
            buildPost.content = json.entry.content;
            headers.title =
              typeof json.entry.title[0] != "undefined"
                ? json.entry.title[0]._
                : JSON.stringify(json.entry.title, null, 2);

            // post author
            headers.author = {
              nick: json.entry.author[0].name[0],
              link: json.entry.author[0].uri[0],
              email: json.entry.author[0].email[0],
            };

            // post categories
            json.entry.category.forEach(function (category) {
              let cat = category.$.term.trim();
              if (!url.isValidURL(cat)) headers.category.push(cat);
            });

            // post published
            headers.date = json.entry.published[0];
            headers.modified = json.entry.updated[0];

            // post description
            headers.subtitle = truncate(buildPost.content, 140, ".");
            // site title
            headers.webtitle = config.webtitle;

            if (typeof json.entry.link[4] != "undefined") {
              buildPost.permalink = new URL(json.entry.link[4].$.href).pathname;
            }

            buildPost.headers = headers;

            if (buildPost.permalink.length > 0) {
              let saveFile = path.join(
                "build/hexo-blogger-xml/results/",
                buildPost.permalink.replace(/\.html$/, ".json")
              );

              writeFileSync(saveFile, JSON.stringify(buildPost, null, 2));
            }
          }
        }
      });
  }
}

export default BloggerParser;
