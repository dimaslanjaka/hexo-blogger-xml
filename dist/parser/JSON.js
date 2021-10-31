JSON.safeStringify = function (obj, indent) {
    if (indent === void 0) { indent = 2; }
    var cache = [];
    var retVal = JSON.stringify(obj, function (key, value) {
        return typeof value === "object" && value !== null
            ? cache.includes(value)
                ? undefined // Duplicate reference found, discard key
                : cache.push(value) && value // Store value in our collection
            : value;
    }, indent);
    cache = null;
    return retVal;
};
