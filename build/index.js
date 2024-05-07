"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentDirectory = void 0;
const ora_1 = __importDefault(require("ora"));
const getFiles_1 = require("./common/getFiles");
const prompt_1 = require("./utils/prompt");
const common_1 = require("./common");
const spinner = (0, ora_1.default)({
    text: "Doing some stuff...",
    spinner: "fingerDance",
}).start();
// Map to store type aliases grouped by hashed type value
// Example usage: process all TypeScript files in the current directory
exports.currentDirectory = process.cwd();
const buildTypesMap = (options) => {
    return new Promise((resolve) => {
        const computedTypeMap = (0, common_1.processDirectory)(exports.currentDirectory, options);
        resolve(computedTypeMap);
    });
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const options = (0, getFiles_1.readConfig)();
    const computedTypeMap = yield buildTypesMap(options);
    spinner.stop();
    try {
        yield (0, prompt_1.showPrompt)(computedTypeMap, options.strict);
    }
    catch (err) {
        console.log(err);
    }
});
main();
