# hexo-blogger-xml
Import content/article from blogger to hexo without losing SEO

![compiler build status](https://github.com/dimaslanjaka/hexo-blogger-xml/actions/workflows/npm.yml/badge.svg?branch=compiler)
![compiler test status](https://github.com/dimaslanjaka/hexo-blogger-xml/actions/workflows/test.yml/badge.svg?branch=compiler)

# Feature
- Migrate from blogger to hexo
- Migrate blogger permalink to hexo permalink without losing SEO
- Gulp function supported

# Requirements
- Node 12.x 14.x
- Python 2.7 or 3.3
- GCC (node-gyp)
- Typescript (global)
- ts-node (global)
```shell
npm config set python /path/python_dir/python
npm i -g node-gyp typescript ts-node
```

# Installation
Using Git Repository (Development)
```shell
npm i git+https://github.com/dimaslanjaka/hexo-blogger-xml.git
```
Using NPM Repository (Production)
```shell
npm i hexo-blogger-xml
```

# Setup Hexo _config.yml
```yaml
permalink: :title.html # set permalink to title to direct permalink from directory path
pretty_urls:
  trailing_html: true # Set true to keep `.html` from permalink

blogger_xml:
  # site title (optional), will set on header.webtitle each post
  site_title: "WMI"
  # default thumbnail if no image in post, will set on header.cover each post
  thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"
  # script path relative path from hexo root directory
  callback: "./scripts/post_callback.js"
  # Your blog domain and subdomain to seo external link, and bellow list is an internal link based on domains
  hostname:
    - "webmanajemen.com"
    - "git.webmanajemen.com"
  # Output directory
  output: "source/_posts"
  # blogger xml path relative path from hexo root directory, you can insert multiple xml
  input:
    - "../xml/test.xml"
    - "./directory/another.xml"
```

# Setup .gitignore to your project
```gitignore
# this is build directory of hexo-blogger-xml
build/hexo-blogger-xml
```

> this plugin run once. If you want to rewrite the posts, you should remove `source/hexo-blogger-xml.json`

# Using GULP Example
view this repo workflow gulp [gulpfile.ts](https://github.com/dimaslanjaka/hexo-blogger-xml/tree/compiler/gulpfile.ts)
```typescript
//use typescript compiler replace import bellow
//import gulpCore from "hexo-blogger-xml/src/gulp-core";
import { gulpCore } from "hexo-blogger-xml";
import path from "path";
gulp.task("blogger", function (done) {
  const mainXML = path.resolve("demo/xml/test.xml");
  gulpCore({
    input: [mainXML],
    output: "./src-posts",
    hostname: ["webmanajemen.com", "www.webmanajemen.com", "dimaslanjaka.github.io"],
    callback: require("./demo/xml/post_callback"),
    on: {
      finish: (parser) => {
        console.log("Blogger gulp finished");
      },
    },
  });

  done();
});
```
run with:
```
npx gulp blogger
```

# How to export blogger articles/content
![how to export blogger to hexo](img/blogger-export.png)

# How to keep blogger seo to new domain

- Open blogger theme
- Edit HTML, add below codes to `<head></head>`
```html
<script type='text/javascript'>
  // <![CDATA[
    let hostname = "web-manajemen.blogspot.com"; // your blogger hostname/domain
    let pathnames = ["/p/search.html", "/p/a.html", "/p/gallery.html", "/p/privacy.html", "/p/tos.html", "/p/proxy-extractor-online.html", "/p/redirect.html", "/p/simple-websocket.html"]; // redirect custom pages, otherwise retains on blogger
    function redirectNow() {
      let href = window.location.href;
      let url = new URL(href);
      url.host = "www.webmanajemen.com";
      url.hostname = "www.webmanajemen.com";
      let newhref =
        url.protocol + "//" + url.host + url.pathname + url.search + url.hash;
      window.location.replace(newhref);
    }
    if (
      window.location.host == hostname &&
      pathnames.includes(window.location.pathname)
    ) {
      redirectNow();
    }
  // ]]>
</script>
```
- or using [this template](https://github.com/dimaslanjaka/hexo-blogger-xml/tree/compiler/blogger redirect theme/blogger-redirect-theme.xml)
- Change Redirect Feed URL to new domain feed url

# Preview This Plugin
terminal
![](img/ss-terminal.png)
homepage
![](img/ss-hexo.png)
permalink: /2021/09/post-with-description.html
![](img/ss-hexo-post.png)

## Todo
- [ ] Sync with https://github.com/hr6r/hexo-migrator-blogger

## Source Code
> [Source Code Compiler](https://github.com/dimaslanjaka/hexo-blogger-xml/tree/compiler)

## Bash script for migrate blogger to hexo
```bash
#!/bin/bash

# remove what's there
rm source/_posts/*.md 

# download blogs
node_modules/.bin/hexo migrate blogger 'http://blog.meredrica.org/feeds/posts/default?alt=json&max-results=10000'
node_modules/.bin/hexo migrate blogger 'http://jujitsu.westreicher.org/feeds/posts/default?alt=json&max-results=10000'

# fix image links generated by migrate
# they will look like this: [![](link to small img)](link to larg img)
# this is an image that is the anchor text to the big immage
# this perl command replaces the anchor and inserts a new image tag that points to the large one
#
# regex broken down
#
# \[!\[]\(http.*?\)]
# matches the start of the anchor tag like: [![] (http:...)]
#
# (\(http.*?\))
# matches the second part (http:....) including the brackets and captures it in group 1
#
# this part of the regex produces the new image tag with the matched group 1
#	![]\1
#
perl -p -i -e 's/\[!\[]\(http.*?\)](\(http.*?\))/![]\1/g' source/_posts/*

# download the images to the local folder
node_modules/.bin/hexo migrate image

# strip all html tags and their attributes
perl -p -i -e 's/<.*?>//g' source/_posts/*

# replace all occurances of mor than 3 empty lines with just two of them
# this is required because the blogger migrate creates a lot of empty lines
# the tag replacement from above then creates even more
perl -0 -p -i -e 's/\n{3,}/\n\n/g' source/_posts/*

# remove all generated .bak files
rm source/_posts/*.bak
```
# Website using Hexo NodeJS Blogging System

[![Build And Tests](https://github.com/dimaslanjaka/dimaslanjaka.github.io/actions/workflows/page.yml/badge.svg?branch=compiler)](https://github.com/dimaslanjaka/dimaslanjaka.github.io/actions/workflows/page.yml)
[![GitHub](https://badgen.net/badge/icon/github?icon=github&label&style=flat-square)](https://github.com/dimaslanjaka/dimaslanjaka.github.io/tree/compiler)
[![webmanajemen.com](https://img.shields.io/website.svg?down_color=red&down_message=down&style=flat-square&up_color=green&up_message=up&label=webmanajemen.com&url=https://webmanajemen.com)](https://webmanajemen.com)

## hexo-adsense
[![npm version](https://badge.fury.io/js/hexo-adsense.svg?style=flat-square)](https://badge.fury.io/js/hexo-adsense)
[![Npm package yearly downloads](https://badgen.net/npm/dy/hexo-adsense?style=flat-square)](https://npmjs.com/package/hexo-adsense)
[![Minimum node.js version](https://badgen.net/npm/node/hexo-adsense?style=flat-square)](https://npmjs.com/package/hexo-adsense)
![GitHub repo size](https://img.shields.io/github/repo-size/dimaslanjaka/hexo-adsense?label=Repository%20Size&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/dimaslanjaka/hexo-adsense?color=blue&label=Last%20Commit&style=flat-square)

## hexo-seo
[![npm version](https://badge.fury.io/js/hexo-seo.svg?style=flat-square)](https://badge.fury.io/js/hexo-seo)
[![Npm package yearly downloads](https://badgen.net/npm/dy/hexo-seo?style=flat-square)](https://npmjs.com/package/hexo-seo)
[![Minimum node.js version](https://badgen.net/npm/node/hexo-seo?style=flat-square)](https://npmjs.com/package/hexo-seo)
![GitHub repo size](https://img.shields.io/github/repo-size/dimaslanjaka/hexo-seo?label=Repository%20Size&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/dimaslanjaka/hexo-seo?color=blue&label=Last%20Commit&style=flat-square)

## hexo-blogger-xml
[![npm version](https://badge.fury.io/js/hexo-blogger-xml.svg?style=flat-square)](https://badge.fury.io/js/hexo-blogger-xml)
[![Npm package yearly downloads](https://badgen.net/npm/dy/hexo-blogger-xml?style=flat-square)](https://npmjs.com/package/hexo-blogger-xml)
[![Minimum node.js version](https://badgen.net/npm/node/hexo-blogger-xml?style=flat-square)](https://npmjs.com/package/hexo-blogger-xml)
![GitHub repo size](https://img.shields.io/github/repo-size/dimaslanjaka/hexo-blogger-xml?label=Repository%20Size&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/dimaslanjaka/hexo-blogger-xml?color=blue&label=Last%20Commit&style=flat-square)
