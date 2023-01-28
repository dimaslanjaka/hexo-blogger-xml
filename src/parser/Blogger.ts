import { EventEmitter } from 'events';
import * as fs from 'fs';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import he from 'he';
import 'js-prototypes';
import { JSDOM } from 'jsdom';
import * as path from 'path';
import { basename, dirname } from 'path';
import { rimrafSync } from 'rimraf';
import sanitize from 'sanitize-filename';
import xml2js from 'xml2js';
import config from '../config';
import { Entry } from '../types/entry';
import { PostHeader } from '../types/post-header';
import excludeTitleArr from './excludeTitle.json';
import { fromString } from './html';
import './JSON';
import langID from './lang/id.json';
import getUsername from './node-username';
import remove_double_quotes from './remove_double_quotes';
import StringBuilder from './StringBuilder';
import trim_whitespaces from './trim_whitespaces';
import url from './url';
import { truncate, writeFileSync } from './util';
import ParserYaml from './yaml';

interface objResult {
  permalink: string;
  headers: PostHeader;
  content: string;
}

declare interface BloggerParser {
  on<U extends keyof BloggerParser>(event: U, listener: BloggerParser[U]): this;
  on(event: 'lastExport', listener: (arg: Record<any, any>) => any): this;
  on(event: 'write-post', listener: (arg: string) => any): void;
  //emit<U extends keyof BloggerParser>(event: U, ...args: Parameters<BloggerParser[U]>): boolean;
}

class BloggerParser extends EventEmitter {
  static debug = false;
  /**
   * ID Process
   */
  id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  buildDir = 'build/hexo-blogger-xml';
  entriesDir = path.join(this.buildDir, 'entries');
  private document: Document;
  parseXmlJsonResult: objResult[] = [];
  hostname: string[] = ['webmanajemen.com', 'git.webmanajemen.com', 'web-manajemen.blogspot', 'dimaslanjaka.github.io'];

  constructor(xmlFile: string | fs.PathLike) {
    super();
    if (!existsSync(xmlFile)) throw `${xmlFile} not found`;

    // reset result
    this.parseXmlJsonResult = [];

    // clean build dir
    this.clean();

    // write ignore to buildDir
    writeFileSync(path.join(dirname(this.entriesDir), '.gitignore'), '*');
    mkdirSync(this.entriesDir, { recursive: true });
    if (getUsername() == 'dimaslanjaka') {
      writeFileSync(path.join(this.entriesDir, this.id), new Date().toString());
    }

    // read xml
    const xmlStr = readFileSync(xmlFile).toString();

    // Create empty DOM, the input param here is for HTML not XML, and we don want to parse HTML
    const dom = new JSDOM();
    // Get DOMParser, same API as in browser
    const DOMParser = dom.window.DOMParser;
    const parser = new DOMParser();
    // Create document by parsing XML
    this.document = parser.parseFromString(xmlStr, 'text/xml');

    // save the xml after modifications
    const xmlString = this.document.documentElement.outerHTML;

    writeFileSync('build/hexo-blogger-xml/rss.xml', xmlString);
    writeFileSync('build/hexo-blogger-xml/inner.xml', this.document.documentElement.innerHTML);
    const entries = this.document.documentElement.getElementsByTagName('entry');

    if (entries.length) {
      writeFileSync('build/hexo-blogger-xml/entry.xml', entries[0].innerHTML);
    }
  }

  setHostname(host: string[]) {
    this.hostname = this.hostname.concat(host);
  }

  // noinspection JSUnusedGlobalSymbols
  setEntriesDir(dir: string) {
    if (dir.length > 0) this.entriesDir = dir;
  }

  /**
   * Clean build dir
   */
  clean() {
    const self = this;
    const deleteFolderRecursive = function (directoryPath: fs.PathLike) {
      if (fs.existsSync(directoryPath)) {
        // eslint-disable-next-line no-unused-vars
        fs.readdirSync(directoryPath).forEach((file) => {
          const curPath = path.join(directoryPath.toString(), file);
          if (fs.lstatSync(curPath).isDirectory()) {
            // recurse
            deleteFolderRecursive(curPath);
          } else {
            // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(directoryPath);
      }
    };

    deleteFolderRecursive(this.entriesDir);
    rimrafSync(self.entriesDir);
    return this;
  }

  /**
   * Parse entries from feed
   * @returns void
   */
  parseEntry() {
    const feeds = this.document.documentElement.getElementsByTagName('entry');
    for (let index = 0; index < feeds.length; index++) {
      const element = feeds[index];
      const title = element.getElementsByTagName('title')[0].innerHTML;
      const excludeTitle = excludeTitleArr.map((title) => {
        return title.toLowerCase().trim();
      });
      // skip if contains default title
      if (excludeTitle.includes(title.toLowerCase().trim())) continue;

      /** CONTENT PROCESS START **/
      let content = element.getElementsByTagName('content')[0].innerHTML;
      content = he.decode(content);
      /** CONTENT PROCESS END **/

      // write post with decoded entities
      let obj = {
        entry: { content: '', id: [] }
      };
      //let decodedContent = he.decode(content);
      xml2js.parseString(element.outerHTML, function (err, result) {
        obj = result;
      });
      obj.entry.content = content;
      obj.entry.id[0] = obj.entry.id[0].replace('tag:blogger.com,1999:', '');
      //writeFileSync(path.join(this.entriesDir, sanitize(title) + ".xml"), element.outerHTML);
      writeFileSync(path.join(this.entriesDir, sanitize(title) + '.json'), JSON.stringify(obj, null, 2));
    }
    return this;
  }

  getJsonResult() {
    if (!existsSync(this.entriesDir)) throw 'Entries Dir Not Found, previous process failed';
    const get = fs.readdirSync(this.entriesDir).map((file) => {
      return path.join(this.entriesDir, file);
    });

    const self = this;
    const results = [];

    if (Array.isArray(get) && get.length > 0) {
      get.forEach(function (file) {
        const buildPost: objResult = {
          permalink: '',
          headers: {
            title: '',
            webtitle: '',
            subtitle: '',
            lang: 'en',
            date: new Date().toISOString(),
            type: 'post',
            tags: [],
            author: {
              nick: '',
              link: '',
              email: ''
            },
            modified: new Date().toISOString(),
            category: [],
            comments: true,
            cover: '',
            location: ''
          },
          content: ''
        };
        const extname = path.extname(file);
        if (extname == '.json') {
          const read = readFileSync(file).toString();
          const json: Entry = JSON.parse(read);
          // build hexo header post
          if (typeof json == 'object') {
            buildPost.content = json.entry.content;

            try {
              // post permalink
              if (typeof json.entry.link[4] != 'undefined') {
                buildPost.permalink = new URL(json.entry.link[4].$.href).pathname;

                // modify html body (Content)
                const mod = self.modifyHtml(json.entry.content);

                // remove footer rss messages
                //buildPost.content = t.stripFooterFeed(buildPost.content);
                buildPost.content = mod.content;

                // external link seo
                //buildPost.content = t.externalLink(buildPost.content);

                // post title
                buildPost.headers.title = json.entry.title[0]._.trim();

                // post language simple
                const titleTest = buildPost.headers.title.toLocaleLowerCase();
                if (new RegExp('s?' + langID.join('|') + 's?', 'gmu').test(titleTest)) {
                  buildPost.headers.lang = 'id';
                }

                // post thumbnail/cover
                //buildPost.headers.cover = t.getFirstImg(buildPost.content);
                buildPost.headers.cover = mod.thumbnail;

                // post author
                buildPost.headers.author = {
                  nick: json.entry.author[0].name[0],
                  link: typeof json.entry.author[0].uri != 'undefined' ? json.entry.author[0].uri[0] : '',
                  email: typeof json.entry.author[0].email != 'undefined' ? json.entry.author[0].email[0] : ''
                };

                // post categories
                json.entry.category.forEach(function (category) {
                  const cat = category.$.term.trim();
                  if (!url.isValidURL(cat)) buildPost.headers.tags.push(cat);
                });

                // post published
                buildPost.headers.date = json.entry.published[0];
                buildPost.headers.modified = json.entry.updated[0];

                // post description
                //const parserhtml = fromString(buildPost.content);
                //const contentStr = parserhtml.window.document.documentElement.querySelector("div,p,span");
                //console.log(contentStr.textContent);
                //buildPost.headers.subtitle = truncate(he.decode(contentStr.textContent), 140, "").trim();
                buildPost.headers.subtitle = trim_whitespaces(remove_double_quotes(mod.description)).replace(
                  new RegExp('[^a-zA-Z., ]', 'm'),
                  ''
                );

                // site title
                buildPost.headers.webtitle = config.webtitle;

                if (buildPost.permalink.length > 0) {
                  const saveFile = path.join(
                    'build/hexo-blogger-xml/results/',
                    buildPost.permalink.replace(/\.html$/, '.json')
                  );

                  results.push(buildPost);
                  writeFileSync(saveFile, JSON.stringify(buildPost, null, 2));
                }
              }
            } catch (e) {
              //writeFileSync(path.join("build/hexo-blogger-xml/errors/", "error.log"), JSON.safeStringify(e));
              writeFileSync(
                path.join('build/hexo-blogger-xml/errors/', 'error-' + basename(file)),
                JSON.stringify(json, null, 2)
              );
              writeFileSync(
                path.join('build/hexo-blogger-xml/errors/', 'error-body-' + basename(file, '.json') + '.html'),
                buildPost.content
              );

              //buildPost.content
              //console.log(json.entry.content);
              throw e;
            }
          }
        }
      });
    }

    this.parseXmlJsonResult = results;
    return this;
  }

  /**
   * Modify body content such as
   * - external link
   * - first img
   * - post description
   * @param content
   */
  modifyHtml(content: string) {
    const self = this;
    const parserhtml = fromString(content);

    // strip footer rss messages
    // remove custom messages in footer feed
    const find1 = parserhtml.window.document.querySelector('[class="blogger-post-footer"]');
    if (find1) {
      find1.remove();
    }
    const find2 = parserhtml.window.document.getElementsByClassName('blogger-post-footer');
    if (find2.length > 0) {
      for (let i = 0; i < find2.length; i++) {
        const item = find2.item(i);
        item.remove();
      }
    }

    // get first img
    let firstImg =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png';
    const find = parserhtml.window.document.getElementsByTagName('img');
    if (find.length > 0) {
      for (let i = 0; i < find.length; i++) {
        const item = find.item(i);
        if (item.src.trim().length > 0) {
          firstImg = item.src;
          break;
        }
      }
    }

    // external link seo
    const processLink = (link: HTMLAnchorElement) => {
      const href = self.parse_url(link.href);
      if (href instanceof URL) {
        let process = true;
        self.hostname.forEach((hostnameKey) => {
          if (href.host.includes(hostnameKey)) {
            //console.log(hostnameKey, href.host, href.host.includes(hostnameKey));
            process = false;
          }
        });
        if (process) {
          link.setAttribute('rel', 'noopener noreferer nofollow');
          //if (t.hostname.includes(link.href.h))
          //console.log(link.outerHTML);
        }
      }
    };
    // find all hyperlinks
    const links = parserhtml.window.document.getElementsByTagName('a');
    if (links.length > 0) {
      for (let i = 0; i < links.length; i++) {
        processLink(links.item(i));
      }
    }

    // post description
    let description: string;
    const contentStr = parserhtml.window.document.documentElement.querySelector('div,p,span');
    //console.log(contentStr.textContent);
    if (contentStr) {
      description = truncate(he.decode(contentStr.textContent), 140, '').trim();
    } else {
      description = truncate(content, 140, '').trim();
    }

    return {
      thumbnail: firstImg,
      content: parserhtml.window.document.body.innerHTML,
      description: description
    };
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
  export(dir = 'source/_posts', callback?: (arg0: string, arg1: PostHeader) => string) {
    const self = this;
    const parsedList = this.getParsedXml();
    const processResult = (post: objResult) => {
      const postPath = path.join(dir, post.permalink.replace(/.html$/, '.md'));
      //let postPathTest = path.join(dir, "test.md");
      //console.log(post.headers);
      const postHeader = ParserYaml.fromObject(this.objTrim(post.headers));
      //console.log(postHeader);
      if (typeof callback == 'function') {
        post.content = callback(post.content, post.headers);
      }
      //post.content = this.stripFooterFeed(post.content);
      const postResult = new StringBuilder('---')
        .appendLine(postHeader)
        .appendLine('---')
        .append('\n\n')
        .append(post.content)
        .toString();
      //const postResult = `---\n${postHeader}\n---\n\n${post.content}`;
      writeFileSync(postPath, postResult);
      self.emit('write-post', postPath);
    };

    parsedList.forEach((i, idx, array) => {
      processResult(i);
      if (idx === array.length - 1) {
        //console.log("Last callback call at index " + idx + " with value " + i);
        this.emit('lastExport', { item: i, id: idx, array: array });
      }
    });

    //processResult(parsedList[0]);
    return this;
  }

  /**
   * Trim Object
   * @see {@link https://stackoverflow.com/a/51616282}
   * @param obj
   */
  objTrim(obj: Record<any, any>) {
    Object.keys(obj).map((k) => (obj[k] = typeof obj[k] == 'string' ? obj[k].trim() : obj[k]));
    return obj;
  }

  parse_url(url: string): URL | string {
    try {
      return new URL(url);
    } catch (e) {
      return url;
    }
  }

  /**
   * Automatic process xml and output into directory with custom callback each function
   * @param outputDir
   * @param callback
   */
  auto(file: string, outputDir = 'source/_posts', callback: (content: string) => any) {
    const parser = new BloggerParser(file);
    //parser.setHostname("webmanajemen.com");
    parser.clean();
    const parsed = parser.parseEntry().getJsonResult();
    console.log(file, parsed.getParsedXml().length, 'total posts');
    parsed.export(outputDir, callback);
  }

  toString() {
    return JSON.stringify(this.getParsedXml(), null, 4);
  }
}

export default BloggerParser;
