import gulpCore from "./src/gulp-core";
import { PostHeader } from "./src/types/post-header";
import { readdirSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import ts from "gulp-typescript";
import gulp from "gulp";
import merge from "merge2";
import { exec } from "child_process";

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

function compileTs(done) {
  //const tsProject = ts.createProject("tsconfig.publish.json");
  //const tsResult = gulp.src("src/**/*.{ts,json}").pipe(tsProject());
  //return merge([tsResult.dts.pipe(gulp.dest("dist")), tsResult.js.pipe(gulp.dest("dist"))]);
  exec("tsc -p tsconfig.publish.json");
  done();
}

exports.default = defaultTask;
exports.tsc = compileTs;
