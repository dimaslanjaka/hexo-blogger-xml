import gulpCore from "./src/gulp-core";
import { PostHeader } from "./src/types/post-header";
import { readdirSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import gulp from "gulp";
import { exec } from "child_process";
//import ts from "gulp-typescript";
//import merge from "merge2";

function defaultTask(cb: () => void) {
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
    on: {
      finish: function (parser) {
        cb();
      },
    },
  });
}

function compileTs(done: () => void) {
  //not compiling json files, skip
  //const tsProject = ts.createProject("tsconfig.publish.json");
  //const tsResult = gulp.src("src/**/*.{ts,json}").pipe(tsProject());
  //return merge([tsResult.dts.pipe(gulp.dest("dist")), tsResult.js.pipe(gulp.dest("dist"))]);
  exec("tsc -p tsconfig.publish.json");
  done();
}

gulp.task("tsc", gulp.series(compileTs));
gulp.task("default", gulp.series(defaultTask));

//exports.default = defaultTask;
//exports.tsc = compileTs;
