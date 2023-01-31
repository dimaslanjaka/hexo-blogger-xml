"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var chalk_1 = __importDefault(require("chalk"));
var events_1 = require("events");
var fs_1 = require("fs");
var Blogger_1 = __importDefault(require("./parser/Blogger"));
var core = /** @class */ (function (_super) {
    __extends(core, _super);
    function core() {
        var _this = _super.call(this) || this;
        _this.emit('init');
        return _this;
    }
    core.prototype.process = function (xml, output, hostname, 
    // eslint-disable-next-line no-unused-vars
    callback) {
        var self = this;
        //console.log(existsSync(xml), xml.endsWith(".xml"), xml);
        if ((0, fs_1.existsSync)(xml) && xml.endsWith('.xml')) {
            console.log('processing', chalk_1["default"].magenta(xml));
            var parser = new Blogger_1["default"](xml);
            if (Array.isArray(hostname) && hostname.length > 0) {
                parser.setHostname(hostname);
            }
            // listen process event
            parser.on('lastExport', function (_obj) {
                //console.log(obj);
                //console.log("Last Export", "Finish");
                self.emit('finish', { parser: parsed_1 });
            });
            var parsed_1 = parser.parseEntry().getJsonResult();
            //console.log(parsed.getParsedXml().length, "total posts");
            if (typeof callback == 'function') {
                parsed_1["export"](output, callback);
            }
        }
    };
    return core;
}(events_1.EventEmitter));
exports["default"] = core;
