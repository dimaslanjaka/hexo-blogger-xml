"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
var os = __importStar(require("os"));
var getEnvironmentVariable = function () {
    var env = process.env;
    return (env.SUDO_USER ||
        env.C9_USER || // Cloud9
        env.LOGNAME ||
        env.USER ||
        env.LNAME ||
        env.USERNAME);
};
var getUsernameFromOsUserInfo = function () {
    try {
        return os.userInfo().username;
    }
    catch (_a) { }
};
// eslint-disable-next-line no-unused-vars
var cleanWindowsCommand = function (string) { return string.replace(/^.*\\/, ""); };
// eslint-disable-next-line no-unused-vars
var makeUsernameFromId = function (userId) { return "no-username-" + userId; };
function getUsername() {
    var test1 = getEnvironmentVariable();
    var test2 = getUsernameFromOsUserInfo();
    if (test1)
        return test2;
    if (test2)
        return test2;
    return null;
}
// noinspection JSUnusedGlobalSymbols
exports["default"] = getUsername;
module.exports = getUsername;
