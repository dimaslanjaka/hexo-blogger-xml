const exec = require("child_process").exec;

exec('git log --reflog --pretty=format:"%h - %an, %ar : %s" --not --remotes', (err, stdout, stderr) => {
  console.log(stdout);
});
//git log --pretty=format:"%h - %an, %ar : %s"
