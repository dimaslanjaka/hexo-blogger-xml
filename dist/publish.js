var exec = require("child_process").exec;
var writeFileSync = require("fs").writeFileSync;
var versionParser = require("./src/parser/versionParser");
var readline = require("readline");
var rl = readline.createInterface(process.stdin, process.stdout);
var packages = require("./package.json");
var version = new versionParser(packages.version);
if (typeof version == "object") {
    rl.question("Overwrite? [yes]/no: ", function (answer) {
        if ((answer.toLowerCase() === "no") | (answer.toLowerCase() === "n")) {
            console.log("Publish Cancel");
        }
        else {
            console.log("Updating version");
            version.result.build++;
            packages.version = version.toString();
            writeFileSync("./package.json", JSON.stringify(packages, null, 2));
            console.log("Publishing");
            exec("tsc -p tsconfig.publish.json", function (err, stdout, stderr) {
                if (!err) {
                    console.log("Build Typescript Successfully");
                    exec("npm publish", function (err, stdout, stderr) {
                        console.log("Packages Published Successfully");
                        exec("git add .", function (err) {
                            if (!err)
                                exec("git commit -m \"Update release " + version.toString() + "\"");
                        });
                    });
                }
                else {
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
