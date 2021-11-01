import gulpCore from "./src/gulp-core";
import { PostHeader } from "./src/types/post-header";
import { readdirSync } from "fs";
import { join } from "path";
import chalk from "chalk";
function defaultTask(cb) {
  gulpCore({
    input: readdirSync(join(__dirname, "xml")).map((xml) => {
      return join(__dirname, "xml", xml);
    }),
    output: "./build/export/gulp",
    callback(content: string, headers: PostHeader): string {
      console.log("gulp process post", chalk.magenta(headers.title));
      return content;
    },
    hostname: ["webmanajemen.com", "web-manajemen.blogspot.com", "dimaslanjaka.github.io"],
  });
  // place code for your default task here
  cb();
}

exports.default = defaultTask;
