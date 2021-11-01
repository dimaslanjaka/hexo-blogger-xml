const { exec } = require("child_process");

exec("tsc -p tsconfig.publish.json", (err, stdout, stderr) => {
  if (!err) {
    exec("npm publish", (err, stdout, stderr) => {
      console.log("published successfully");
    });
  }
});
