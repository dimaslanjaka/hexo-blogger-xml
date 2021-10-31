"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
/// <reference path="../types/entry.d.ts" />
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
var BloggerParser = /** @class */ (function () {
    function BloggerParser(xmlFile) {
        this.entriesDir = "build/hexo-blogger-xml/entries";
        this.parseXmlJsonResult = [];
        this.hostname = ["webmanajemen.com", "git.webmanajemen.com", "web-manajemen.blogspot", "dimaslanjaka.github.io"];
        if (!(0, fs_1.existsSync)(xmlFile))
            throw xmlFile + " not found";
        // reset result
        this.parseXmlJsonResult = [];
        // write ignore to buildDir
        (0, util_1.writeFileSync)(path.join((0, path_1.dirname)(this.entriesDir), ".gitignore"), "*");
        // read xml
        var xmlStr = (0, fs_1.readFileSync)(xmlFile).toString();
        // Create empty DOM, the input param here is for HTML not XML, and we don want to parse HTML
        var dom = new jsdom_1.JSDOM();
        // Get DOMParser, same API as in browser
        var DOMParser = dom.window.DOMParser;
        var parser = new DOMParser();
        // Create document by parsing XML
        this.document = parser.parseFromString(xmlStr, "text/xml");
        // save the xml after modifications
        var xmlString = this.document.documentElement.outerHTML;
        (0, util_1.writeFileSync)("build/hexo-blogger-xml/rss.xml", xmlString);
        (0, util_1.writeFileSync)("build/hexo-blogger-xml/inner.xml", this.document.documentElement.innerHTML);
        var entries = this.document.documentElement.getElementsByTagName("entry");
        if (entries.length) {
            (0, util_1.writeFileSync)("build/hexo-blogger-xml/entry.xml", entries[0].innerHTML);
        }
    }
    BloggerParser.prototype.setHostname = function (host) {
        this.hostname = this.hostname.concat(host);
    };
    BloggerParser.prototype.setEntriesDir = function (dir) {
        if (dir.length > 0)
            this.entriesDir = dir;
    };
    /**
     * Clean build dir
     */
    BloggerParser.prototype.clean = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                            (0, rimraf_1["default"])(_this.entriesDir, function (x) {
                                if (x) {
                                    reject(x);
                                }
                                else {
                                    resolve(_this);
                                }
                            });
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
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
                entry: { content: "", id: [] },
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
                                    email: typeof json.entry.author[0].email != "undefined" ? json.entry.author[0].email[0] : "",
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
                                buildPost.headers.subtitle = mod.description;
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
            description: description,
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
        var process = function (post) {
            var postPath = path.join(dir, post.permalink.replace(/.html$/, ".md"));
            //let postPathTest = path.join(dir, "test.md");
            var postHeader = yaml_1["default"].fromObject(_this.objTrim(post.headers));
            if (typeof callback == "function")
                post.content = callback(post.content);
            //post.content = this.stripFooterFeed(post.content);
            var postResult = new StringBuilder_1["default"]("---")
                .appendLine(postHeader.trim())
                .appendLine("---")
                .append("\n\n")
                .append(post.content)
                .toString();
            (0, util_1.writeFileSync)(postPath, postResult);
        };
        parsedList.forEach(process);
        //process(parsedList[0]);
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
        parser.clean().then(function () {
            var parsed = parser.parseEntry().getJsonResult();
            console.log(file, parsed.getParsedXml().length, "total posts");
            parsed["export"](outputDir, callback);
        });
    };
    BloggerParser.prototype.toString = function () {
        return JSON.stringify(this.getParsedXml(), null, 4);
    };
    BloggerParser.debug = false;
    return BloggerParser;
}());
exports["default"] = BloggerParser;
