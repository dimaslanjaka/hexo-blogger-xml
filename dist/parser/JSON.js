"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleStringify = void 0;
// @ts-ignore
JSON.safeStringify = function (obj, indent) {
    if (indent === void 0) { indent = 2; }
    var cache = [];
    var retVal = JSON.stringify(obj, function (key, value) {
        return typeof value === 'object' && value !== null
            ? cache.includes(value)
                ? undefined // Duplicate reference found, discard key
                : cache.push(value) && value // Store value in our collection
            : value;
    }, indent);
    cache = null;
    return retVal;
};
function simpleStringify(object) {
    var simpleObject = {};
    for (var prop in object) {
        if (!object.hasOwnProperty(prop)) {
            continue;
        }
        if (typeof object[prop] == 'object') {
            continue;
        }
        if (typeof object[prop] == 'function') {
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject, null, 2); // returns cleaned up JSON
}
exports.simpleStringify = simpleStringify;
