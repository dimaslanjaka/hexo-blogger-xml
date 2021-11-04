const exec = require("child_process").exec;

exec("git log --reflog", (err, stdout, stderr) => {
  console.log(stdout);
});

exec("git reflog", (err, stdout, stderr) => {
  console.log(stdout);
});
