var exec = require("child_process").exec;
var _a = require("fs"), writeFileSync = _a.writeFileSync, readFileSync = _a.readFileSync;
var versionParser = require("./src/parser/versionParser");
var readline = require("readline");
var rl = readline.createInterface(process.stdin, process.stdout);
var packages = require("./package.json");
var version = new versionParser(packages.version);
var Moment = require("moment");
var join = require("path").join;
if (typeof version == "object") {
    rl.question("Overwrite? [yes]/no: ", function (answer) {
        if (answer.toLowerCase() === "no" || answer.toLowerCase() === "n") {
            console.log("Publish Cancel");
        }
        else {
            console.log("Updating version");
            version.result.build++;
            packages.version = version.toString();
            writeFileSync("./package.json", JSON.stringify(packages, null, 2));
            console.log("Compiling...");
            exec("tsc -p tsconfig.publish.json", function (err, stdout, stderr) {
                if (!err) {
                    console.log("Build Typescript Successfully");
                    console.log("Publishing");
                    exec("npm publish", function (err, stdout, stderr) {
                        console.log("Packages Published Successfully");
                        // add to git
                        updateChangelog(function () {
                            exec("git add .", function (err) {
                                if (!err)
                                    exec("git commit -m \"Update release ".concat(version.toString(), "\""));
                            });
                        });
                    });
                }
                else {
                    console.log("Publish Failed, Rollback version");
                    version.result.build--;
                    packages.version = version.toString();
                    writeFileSync("./package.json", JSON.stringify(packages, null, 2));
                    console.log(stderr);
                    throw err;
                }
            });
        }
        rl.close();
    });
}
function updateChangelog(callback) {
    exec('git log --reflog --pretty=format:"%h : %s" --not --remotes', function (err, stdout, stderr) {
        var std = stdout
            .split("\n")
            .filter(
        /**
         * filter non-empty
         * @param {string} el
         * @returns {boolean}
         */
        function (el) {
            return el != null && el.trim().length > 0;
        })
            .map(
        /**
         * Trim
         * @param {string} str
         * @returns {string}
         */
        function (str) {
            return str.trim();
        });
        var date = Moment().format("YYYY-MM-DD HH:mm:ss");
        var build = "\n\n## [".concat(packages.version, "] ").concat(date, "\n");
        std.forEach(function (str) {
            build += "-".concat(str, "\n");
        });
        var changelog = join(__dirname, "CHANGELOG.md");
        var readChangelog = readFileSync(changelog).toString().trim();
        readChangelog += build;
        writeFileSync(changelog, readChangelog);
        if (typeof callback == "function")
            callback();
    });
}
