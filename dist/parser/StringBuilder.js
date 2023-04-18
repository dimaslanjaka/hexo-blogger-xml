"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var default_1 = /** @class */ (function () {
    function default_1(str) {
        if (str === void 0) { str = ''; }
        this.result = '';
        this.result = str;
    }
    /**
     * Append to previous string
     * @param str
     */
    default_1.prototype.append = function (str) {
        this.result += str;
        return this;
    };
    /**
     * Append in new line to previous string
     * @param str
     */
    default_1.prototype.appendLine = function (str) {
        this.result += '\n';
        this.result += str;
        return this;
    };
    default_1.prototype.toString = function () {
        return this.result;
    };
    return default_1;
}());
exports.default = default_1;
