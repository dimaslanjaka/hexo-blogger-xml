import gulpCore from "./src/gulp-core";
import { PostHeader } from "./src/types/post-header";
import { readdirSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import gulp, { TaskFunctionCallback } from "gulp";
import { exec } from "child_process";

function defaultTask(done: TaskFunctionCallback) {
  return gulpCore({
    input: readdirSync(join(__dirname, "xml")).map((xml) => {
      return join(__dirname, "xml", xml);
    }),
    output: "./build/export/gulp",
    callback(content: string, headers: PostHeader): string {
      console.log("gulp process post", chalk.magenta(headers.title));
      return content;
    },
    hostname: ["webmanajemen.com", "web-manajemen.blogspot.com", "dimaslanjaka.github.io"],
    on: {
      finish: function (parser) {
        done();
      },
    },
  });
}

function compileTs(done: TaskFunctionCallback) {
  exec("tsc -p tsconfig.publish.json");
  const exclude = ["!**/.git**", "!**.gitmodules**", "!**node_modules**"];
  return gulp.src(["./packages/**/*"].concat(exclude)).pipe(gulp.dest("./dist"));
}

gulp.task("tsc", gulp.series(compileTs));
gulp.task("default", gulp.series(defaultTask));
