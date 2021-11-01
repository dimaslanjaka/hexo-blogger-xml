import gulpCore from "./src/gulp-core";
import { PostHeader } from "./src/types/post-header";
function defaultTask(cb) {
  gulpCore({
    input: ["./xml/test.xml"],
    output: "./build/export/gulp",
    callback(content: string, headers: PostHeader): string {
      console.log("gulp process post", headers.title);
      return content;
    },
    hostname: ["webmanajemen.com", "web-manajemen.blogspot.com", "dimaslanjaka.github.io"],
  });
  // place code for your default task here
  cb();
}

exports.default = defaultTask;
