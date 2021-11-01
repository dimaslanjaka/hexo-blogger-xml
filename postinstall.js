const { exec } = require("child_process");

exec("tsc -p tsconfig.publish.json");
