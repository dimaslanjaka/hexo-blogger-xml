const { exec } = require("child_process");
const { writeFileSync } = require("fs");
const versionParser = require("./src/parser/versionParser");
var readline = require("readline");
var rl = readline.createInterface(process.stdin, process.stdout);
const packages = require("./package.json");
let version = new versionParser(packages.version);
if (typeof version == "object") {
  rl.question("Overwrite? [yes]/no: ", function (answer) {
    if ((answer.toLowerCase() === "no") | (answer.toLowerCase() === "n")) {
      console.log("Publish Cancel");
    } else {
      console.log("Updating version");
      version.result.build++;
      packages.version = version.toString();
      writeFileSync("./package.json", JSON.stringify(packages, null, 2));
      console.log("Publishing");
      exec("tsc -p tsconfig.publish.json", (err, stdout, stderr) => {
        if (!err) {
          console.log("Build Typescript Successfully");
          exec("npm publish", (err, stdout, stderr) => {
            console.log("Packages Published Successfully");
            exec("git add .", (err) => {
              if (!err) exec(`git commit -m "Update release ${version.toString()}"`);
            });
          });
        } else {
          console.log("Publish Failed, Rollback version");
          version.result.build--;
          packages.version = version.toString();
          writeFileSync("./package.json", JSON.stringify(packages, null, 2));
        }
      });
    }
    rl.close();
  });
}
