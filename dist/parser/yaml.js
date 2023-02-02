"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var yaml_1 = __importDefault(require("yaml"));
var ParserYaml = /** @class */ (function () {
    function ParserYaml() {
    }
    ParserYaml.fromObject = function (jsonObject) {
        var doc = new yaml_1["default"].Document();
        doc.contents = jsonObject;
        //console.log(doc.toString());
        return doc.toString();
    };
    return ParserYaml;
}());
exports["default"] = ParserYaml;
