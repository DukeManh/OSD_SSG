#!/usr/bin/env node
"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = __importStar(require("yargs"));
var fs = __importStar(require("fs-extra"));
var path = __importStar(require("path"));
var chalk_1 = __importDefault(require("chalk"));
// Decorated console output
var logError = function (message) { return console.error((0, chalk_1.default)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["{red Error: ", "}"], ["{red Error: ", "}"])), message)); };
var logSuccess = function (message) { return console.error((0, chalk_1.default)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["{blue ", "}"], ["{blue ", "}"])), message)); };
// Generate html text from .txt file
var processFile = function (filePath) {
    var extension = path.extname(filePath).toLowerCase();
    if (extension !== '.txt') {
        logError('Input file must be .txt');
        return '';
    }
    logSuccess("Processing " + filePath);
    var text = fs.readFileSync(filePath, 'utf-8');
    var titleAndContent = text.split(/\n\n\n/);
    var title = '';
    var content = '';
    if (titleAndContent.length >= 2) {
        title = titleAndContent[0];
        content = titleAndContent.slice(1).join('\n\n\n');
    }
    else {
        content = titleAndContent[0];
    }
    var head = "          <meta charset=\"UTF-8\">\n          <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n          <title>" + title + "</title>          ";
    var body = "<h2>" + title + "</h2><br>" + content
        .split(/\n/)
        .map(function (line) { return "<p>" + (line || '<br>') + "</p>\n"; })
        .join('');
    var html = "      <!DOCTYPE html>\n      <html lang=\"en\">\n        <head>\n          " + head + "\n        </head>\n        <body>\n          " + body + "\n        </body>\n      </html>";
    return html;
};
var argv = yargs
    .option({
    input: {
        alias: 'i',
        describe: 'Input file or folder to be parsed',
        type: 'string',
        demandOption: true,
        requiresArg: true,
    },
    dist: {
        alias: 'd',
        describe: 'Output folder of generated files',
        type: 'string',
        requiresArg: true,
    },
    recursive: {
        alias: 'i',
        describe: 'Recursively parsed files',
        type: 'string',
        requiresArg: true,
    },
})
    .help()
    .alias('help', 'h')
    .version()
    .alias('version', 'v').argv;
var _a = argv, input = _a.input, dist = _a.dist;
function generatedHTML(pathName) {
    try {
        var fileStat = fs.statSync(pathName);
        if (fileStat.isFile()) {
            var markup = processFile(input);
            if (markup) {
                fs.writeFileSync("./dist/" + pathName + ".html", markup, { flag: 'w' });
            }
        }
        else if (fileStat.isDirectory()) {
            var files = fs.readdirSync(pathName);
            files.forEach(function (name) { return generatedHTML(name); });
        }
    }
    catch (err) { }
}
var inputPath = fs.statSync(input);
if (inputPath.isFile()) {
    var body = processFile(input);
    fs.removeSync('./dist/');
    fs.ensureFileSync("./dist/index.html");
    fs.writeFileSync('./dist/index.html', body, { flag: 'w' });
}
else if (inputPath.isDirectory()) {
    fs.removeSync('./dist/');
    fs.ensureDirSync("./dist");
    generatedHTML(input);
}
else {
    logError('Error reading input path');
}
var templateObject_1, templateObject_2;
