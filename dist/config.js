"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var config = {
    /**
     * Site title
     */
    webtitle: "WMI Gitlab",
    /**
     * Default fallback thumbnail
     */
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png",
};
if ((0, fs_1.existsSync)("xml/config.json")) {
    var getConfig_1 = JSON.parse((0, fs_1.readFileSync)("xml/config.json").toString());
    // replace object value if conflict
    Object.keys(config).forEach(function (key) {
        if (config[key] == null || config[key] == 0) {
            config[key] = getConfig_1[key];
        }
    });
    // merge object
    config = Object.assign(config, getConfig_1);
}
exports["default"] = config;
