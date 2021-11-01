"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs = __importStar(require("fs"));
var fs_1 = require("fs");
var path = __importStar(require("path"));
var jsdom_1 = require("jsdom");
var sanitize_filename_1 = __importDefault(require("sanitize-filename"));
var he_1 = __importDefault(require("he"));
var xml2js_1 = __importDefault(require("xml2js"));
var rimraf_1 = __importDefault(require("rimraf"));
var html_1 = require("./html");
var url_1 = __importDefault(require("./url"));
var util_1 = require("./util");
var config_1 = __importDefault(require("../config"));
require("./JSON");
var yaml_1 = __importDefault(require("./yaml"));
var StringBuilder_1 = __importDefault(require("./StringBuilder"));
var excludeTitle_json_1 = __importDefault(require("./excludeTitle.json"));
var path_1 = require("path");
var node_username_1 = __importDefault(require("./node-username"));
var events_1 = require("events");
var BloggerParser = /** @class */ (function (_super) {
    __extends(BloggerParser, _super);
    function BloggerParser(xmlFile) {
        var _this = _super.call(this) || this;
        /**
         * ID Process
         */
        _this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        _this.buildDir = "build/hexo-blogger-xml";
        _this.entriesDir = path.join(_this.buildDir, "entries");
        _this.parseXmlJsonResult = [];
        _this.hostname = ["webmanajemen.com", "git.webmanajemen.com", "web-manajemen.blogspot", "dimaslanjaka.github.io"];
        if (!(0, fs_1.existsSync)(xmlFile))
            throw xmlFile + " not found";
        // reset result
        _this.parseXmlJsonResult = [];
        // clean build dir
        _this.clean();
        // write ignore to buildDir
        (0, util_1.writeFileSync)(path.join((0, path_1.dirname)(_this.entriesDir), ".gitignore"), "*");
        (0, fs_1.mkdirSync)(_this.entriesDir, { recursive: true });
        if ((0, node_username_1["default"])() == "dimaslanjaka") {
            (0, util_1.writeFileSync)(path.join(_this.entriesDir, _this.id), new Date().toString());
        }
        // read xml
        var xmlStr = (0, fs_1.readFileSync)(xmlFile).toString();
        // Create empty DOM, the input param here is for HTML not XML, and we don want to parse HTML
        var dom = new jsdom_1.JSDOM();
        // Get DOMParser, same API as in browser
        var DOMParser = dom.window.DOMParser;
        var parser = new DOMParser();
        // Create document by parsing XML
        _this.document = parser.parseFromString(xmlStr, "text/xml");
        // save the xml after modifications
        var xmlString = _this.document.documentElement.outerHTML;
        (0, util_1.writeFileSync)("build/hexo-blogger-xml/rss.xml", xmlString);
        (0, util_1.writeFileSync)("build/hexo-blogger-xml/inner.xml", _this.document.documentElement.innerHTML);
        var entries = _this.document.documentElement.getElementsByTagName("entry");
        if (entries.length) {
            (0, util_1.writeFileSync)("build/hexo-blogger-xml/entry.xml", entries[0].innerHTML);
        }
        return _this;
    }
    BloggerParser.prototype.setHostname = function (host) {
        this.hostname = this.hostname.concat(host);
    };
    // noinspection JSUnusedGlobalSymbols
    BloggerParser.prototype.setEntriesDir = function (dir) {
        if (dir.length > 0)
            this.entriesDir = dir;
    };
    /**
     * Clean build dir
     */
    BloggerParser.prototype.clean = function () {
        var t = this;
        var deleteFolderRecursive = function (directoryPath) {
            if (fs.existsSync(directoryPath)) {
                // eslint-disable-next-line no-unused-vars
                fs.readdirSync(directoryPath).forEach(function (file, index) {
                    var curPath = path.join(directoryPath, file);
                    if (fs.lstatSync(curPath).isDirectory()) {
                        // recurse
                        deleteFolderRecursive(curPath);
                    }
                    else {
                        // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(directoryPath);
            }
        };
        deleteFolderRecursive(this.entriesDir);
        (0, rimraf_1["default"])(t.entriesDir, function (error) {
            if (error)
                throw error;
        });
        return this;
    };
    /**
     * Parse entries from feed
     * @returns void
     */
    BloggerParser.prototype.parseEntry = function () {
        var feeds = this.document.documentElement.getElementsByTagName("entry");
        var _loop_1 = function (index) {
            var element = feeds[index];
            var title = element.getElementsByTagName("title")[0].innerHTML;
            var excludeTitle = excludeTitle_json_1["default"].map(function (title) {
                return title.toLowerCase().trim();
            });
            // skip if contains default title
            if (excludeTitle.includes(title.toLowerCase().trim()))
                return "continue";
            /** CONTENT PROCESS START **/
            var content = element.getElementsByTagName("content")[0].innerHTML;
            content = he_1["default"].decode(content);
            /** CONTENT PROCESS END **/
            // write post with decoded entities
            var obj = {
                entry: { content: "", id: [] }
            };
            //let decodedContent = he.decode(content);
            xml2js_1["default"].parseString(element.outerHTML, function (err, result) {
                obj = result;
            });
            obj.entry.content = content;
            obj.entry.id[0] = obj.entry.id[0].replace("tag:blogger.com,1999:", "");
            //writeFileSync(path.join(this.entriesDir, sanitize(title) + ".xml"), element.outerHTML);
            (0, util_1.writeFileSync)(path.join(this_1.entriesDir, (0, sanitize_filename_1["default"])(title) + ".json"), JSON.stringify(obj, null, 2));
        };
        var this_1 = this;
        for (var index = 0; index < feeds.length; index++) {
            _loop_1(index);
        }
        return this;
    };
    BloggerParser.prototype.getJsonResult = function () {
        var _this = this;
        if (!(0, fs_1.existsSync)(this.entriesDir))
            throw "Entries Dir Not Found, previous process failed";
        var get = fs.readdirSync(this.entriesDir).map(function (file) {
            return path.join(_this.entriesDir, file);
        });
        var t = this;
        var results = [];
        if (Array.isArray(get) && get.length > 0) {
            get.forEach(function (file) {
                var buildPost = {
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
                            email: ""
                        },
                        modified: new Date().toISOString(),
                        category: [],
                        comments: true,
                        cover: "",
                        location: ""
                    },
                    content: ""
                };
                var extname = path.extname(file);
                if (extname == ".json") {
                    var read = (0, fs_1.readFileSync)(file).toString();
                    var json = JSON.parse(read);
                    // build hexo header post
                    if (typeof json == "object") {
                        buildPost.content = json.entry.content;
                        try {
                            // post permalink
                            if (typeof json.entry.link[4] != "undefined") {
                                buildPost.permalink = new URL(json.entry.link[4].$.href).pathname;
                                // modify html body (Content)
                                var mod = t.modifyHtml(json.entry.content);
                                // remove footer rss messages
                                //buildPost.content = t.stripFooterFeed(buildPost.content);
                                buildPost.content = mod.content;
                                // external link seo
                                //buildPost.content = t.externalLink(buildPost.content);
                                // post title
                                buildPost.headers.title = json.entry.title[0]._.trim();
                                // post thumbnail/cover
                                //buildPost.headers.cover = t.getFirstImg(buildPost.content);
                                buildPost.headers.cover = mod.thumbnail;
                                // post author
                                buildPost.headers.author = {
                                    nick: json.entry.author[0].name[0],
                                    link: typeof json.entry.author[0].uri != "undefined" ? json.entry.author[0].uri[0] : "",
                                    email: typeof json.entry.author[0].email != "undefined" ? json.entry.author[0].email[0] : ""
                                };
                                // post categories
                                json.entry.category.forEach(function (category) {
                                    var cat = category.$.term.trim();
                                    if (!url_1["default"].isValidURL(cat))
                                        buildPost.headers.category.push(cat);
                                });
                                // post published
                                buildPost.headers.date = json.entry.published[0];
                                buildPost.headers.modified = json.entry.updated[0];
                                // post description
                                //const parserhtml = fromString(buildPost.content);
                                //const contentStr = parserhtml.window.document.documentElement.querySelector("div,p,span");
                                //console.log(contentStr.textContent);
                                //buildPost.headers.subtitle = truncate(he.decode(contentStr.textContent), 140, "").trim();
                                buildPost.headers.subtitle = escape(mod.description);
                                // site title
                                buildPost.headers.webtitle = config_1["default"].webtitle;
                                if (buildPost.permalink.length > 0) {
                                    var saveFile = path.join("build/hexo-blogger-xml/results/", buildPost.permalink.replace(/\.html$/, ".json"));
                                    results.push(buildPost);
                                    (0, util_1.writeFileSync)(saveFile, JSON.stringify(buildPost, null, 2));
                                }
                            }
                        }
                        catch (e) {
                            //writeFileSync(path.join("build/hexo-blogger-xml/errors/", "error.log"), JSON.safeStringify(e));
                            (0, util_1.writeFileSync)(path.join("build/hexo-blogger-xml/errors/", "error-" + (0, path_1.basename)(file)), JSON.stringify(json, null, 2));
                            (0, util_1.writeFileSync)(path.join("build/hexo-blogger-xml/errors/", "error-body-" + (0, path_1.basename)(file, ".json") + ".html"), buildPost.content);
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
    };
    /**
     * Modify body content such as
     * - external link
     * - first img
     * - post description
     * @param content
     */
    BloggerParser.prototype.modifyHtml = function (content) {
        var t = this;
        var parserhtml = (0, html_1.fromString)(content);
        // strip footer rss messages
        // remove custom messages in footer feed
        var find1 = parserhtml.window.document.querySelector('[class="blogger-post-footer"]');
        if (find1) {
            find1.remove();
        }
        var find2 = parserhtml.window.document.getElementsByClassName("blogger-post-footer");
        if (find2.length > 0) {
            for (var i = 0; i < find2.length; i++) {
                var item = find2.item(i);
                item.remove();
            }
        }
        // get first img
        var firstImg = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png";
        var find = parserhtml.window.document.getElementsByTagName("img");
        if (find.length > 0) {
            for (var i = 0; i < find.length; i++) {
                var item = find.item(i);
                if (item.src.trim().length > 0) {
                    firstImg = item.src;
                    break;
                }
            }
        }
        // external link seo
        var processLink = function (link) {
            var href = t.parse_url(link.href);
            if (href instanceof URL) {
                var process_1 = true;
                t.hostname.forEach(function (hostnameKey) {
                    if (href.host.includes(hostnameKey)) {
                        //console.log(hostnameKey, href.host, href.host.includes(hostnameKey));
                        process_1 = false;
                    }
                });
                if (process_1) {
                    link.setAttribute("rel", "noopener noreferer nofollow");
                    //if (t.hostname.includes(link.href.h))
                    //console.log(link.outerHTML);
                }
            }
        };
        // find all hyperlinks
        var links = parserhtml.window.document.getElementsByTagName("a");
        if (links.length > 0) {
            for (var i = 0; i < links.length; i++) {
                processLink(links.item(i));
            }
        }
        // post description
        var description;
        var contentStr = parserhtml.window.document.documentElement.querySelector("div,p,span");
        //console.log(contentStr.textContent);
        if (contentStr) {
            description = (0, util_1.truncate)(he_1["default"].decode(contentStr.textContent), 140, "").trim();
        }
        else {
            description = (0, util_1.truncate)(content, 140, "").trim();
        }
        return {
            thumbnail: firstImg,
            content: parserhtml.window.document.body.innerHTML,
            description: description
        };
    };
    BloggerParser.prototype.getParsedXml = function () {
        return this.parseXmlJsonResult;
    };
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
    BloggerParser.prototype["export"] = function (dir, callback) {
        var _this = this;
        if (dir === void 0) { dir = "source/_posts"; }
        var parsedList = this.getParsedXml();
        var processResult = function (post) {
            var postPath = path.join(dir, post.permalink.replace(/.html$/, ".md"));
            //let postPathTest = path.join(dir, "test.md");
            //console.log(post.headers);
            var postHeader = yaml_1["default"].fromObject(_this.objTrim(post.headers));
            //console.log(postHeader);
            if (typeof callback == "function") {
                post.content = callback(post.content, post.headers);
            }
            //post.content = this.stripFooterFeed(post.content);
            var postResult = new StringBuilder_1["default"]("---")
                .appendLine(postHeader)
                .appendLine("---")
                .append("\n\n")
                .append(post.content)
                .toString();
            //const postResult = `---\n${postHeader}\n---\n\n${post.content}`;
            (0, util_1.writeFileSync)(postPath, postResult);
        };
        parsedList.forEach(function (i, idx, array) {
            processResult(i);
            if (idx === array.length - 1) {
                //console.log("Last callback call at index " + idx + " with value " + i);
                _this.emit("lastExport", { item: i, id: idx, array: array });
            }
        });
        //processResult(parsedList[0]);
        return this;
    };
    /**
     * Trim Object
     * @see {@link https://stackoverflow.com/a/51616282}
     * @param obj
     */
    BloggerParser.prototype.objTrim = function (obj) {
        Object.keys(obj).map(function (k) { return (obj[k] = typeof obj[k] == "string" ? obj[k].trim() : obj[k]); });
        return obj;
    };
    BloggerParser.prototype.parse_url = function (url) {
        try {
            return new URL(url);
        }
        catch (e) {
            return url;
        }
    };
    /**
     * Automatic process xml and output into directory with custom callback each function
     * @param outputDir
     * @param callback
     */
    BloggerParser.prototype.auto = function (file, outputDir, callback) {
        if (outputDir === void 0) { outputDir = "source/__posts"; }
        var parser = new BloggerParser(file);
        //parser.setHostname("webmanajemen.com");
        parser.clean();
        var parsed = parser.parseEntry().getJsonResult();
        console.log(file, parsed.getParsedXml().length, "total posts");
        parsed["export"](outputDir, callback);
    };
    BloggerParser.prototype.toString = function () {
        return JSON.stringify(this.getParsedXml(), null, 4);
    };
    BloggerParser.debug = false;
    return BloggerParser;
}(events_1.EventEmitter));
exports["default"] = BloggerParser;
