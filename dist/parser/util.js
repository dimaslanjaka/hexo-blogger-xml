"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileSync = exports.truncate = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var fs = __importStar(require("fs"));
/**
 * @example
 * ```js
 * truncate('This is a long message', 20, '...');
 * ```
 * @param str
 * @param max
 * @param suffix
 * @returns
 */
var truncate = function (str, max, suffix) {
    return str.length < max ? str : "".concat(str.substr(0, str.substr(0, max - suffix.length).lastIndexOf(' '))).concat(suffix);
};
exports.truncate = truncate;
function writeFileSync(pathfile, content) {
    if (!(0, fs_1.existsSync)((0, path_1.dirname)(pathfile)))
        (0, fs_1.mkdirSync)((0, path_1.dirname)(pathfile), { recursive: true });
    fs.writeFileSync(pathfile, content);
}
exports.writeFileSync = writeFileSync;
