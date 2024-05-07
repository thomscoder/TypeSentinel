#!/usr/bin/env node

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
const ts = __importStar(require("typescript"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const constants_1 = require("./common/constants");
// @ts-ignore
const enquirer_1 = require("enquirer");
const colorette_1 = require("colorette");
const ora_1 = __importDefault(require("ora"));
const spinner = (0, ora_1.default)({
    text: "Doing some stuff...",
    spinner: "fingerDance",
}).start();
// Function to read the config file
const readConfig = () => {
    const configFile = constants_1.CONFIG_FILE;
    if (fs.existsSync(configFile)) {
        const configData = fs.readFileSync(configFile, "utf-8");
        return JSON.parse(configData);
    }
    return { skip: ["node_modules"], collectTypes: false }; // Default empty array if config file not found
};
// Function to recursively traverse a directory and return all TypeScript files
const getFiles = (dir, options) => {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    const files = dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        const rel = path.relative(process.cwd(), dirent.name);
        if (dirent.isDirectory()) {
            // Skip
            if (options.skip.includes(rel)) {
                return [];
            }
            return getFiles(res, options);
        }
        else {
            if (options.skip.includes(rel)) {
                return [];
            }
            return { res, rel };
        }
    });
    return Array.prototype.concat(...files);
};
// Function to extract type aliases and their values from a TypeScript file
const extractTypeAliases = (file) => {
    const sourceFile = ts.createSourceFile(file.res, fs.readFileSync(file.res).toString(), ts.ScriptTarget.Latest, true);
    const typeAliases = [];
    function visit(node) {
        const isTypeAliasDeclaration = ts.isTypeAliasDeclaration(node);
        const isInterfaceDeclaration = ts.isInterfaceDeclaration(node);
        if (isTypeAliasDeclaration || isInterfaceDeclaration) {
            const typeName = node.name.text;
            const typeValue = isTypeAliasDeclaration
                ? node.type.getText(sourceFile)
                : `{${node.members
                    .map((member) => member.getText(sourceFile))
                    .join("\n")}}`;
            // Handling generic type aliases
            let typeParameters = "";
            if (node.typeParameters) {
                typeParameters = `<${node.typeParameters
                    .map((param) => param.getText(sourceFile))
                    .join(", ")}>`;
            }
            typeAliases.push({
                name: typeName + typeParameters,
                value: typeValue,
                path: file.res,
            });
        }
        ts.forEachChild(node, visit);
    }
    ts.forEachChild(sourceFile, visit);
    return typeAliases;
};
// Function to find usage count of each type alias
const findTypeUsage = (files, typeAliases, program) => {
    const typeUsageMap = new Map();
    files.forEach((file) => {
        const sourceFile = program.getSourceFile(file.res);
        if (!sourceFile)
            return [];
        const typeChecker = program.getTypeChecker();
        function visit(node) {
            if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
                const typeName = node.typeName.text;
                const type = typeChecker.getTypeAtLocation(node);
                const symbol = type.symbol || type.aliasSymbol;
                const decls = symbol === null || symbol === void 0 ? void 0 : symbol.getDeclarations();
                // let typeArguments = "";
                // if (node.typeArguments) {
                //   typeArguments = `<${node.typeArguments.map(argument => argument.getText(sourceFile)).join(", ")}>`;
                // }
                decls === null || decls === void 0 ? void 0 : decls.map((decl) => {
                    // const typeName = _typeName;
                    const key = typeName + decl.getSourceFile().fileName;
                    if (typeUsageMap.has(key)) {
                        typeUsageMap.set(key, typeUsageMap.get(key) + 1);
                    }
                    else {
                        typeUsageMap.set(key, 1);
                    }
                });
            }
            ts.forEachChild(node, visit);
        }
        ts.forEachChild(sourceFile, visit);
    });
    const typeUsageList = [];
    typeAliases.forEach((alias, index) => {
        // console.log(Array.from(typeUsageMap.keys()).pop(), alias.parentPath)
        // console.log(alias.parentPath)
        const usageCount = typeUsageMap.get(alias.name.replace(/(\<\w+\>)/, "") + alias.path) || 0;
        typeUsageList.push(Object.assign(Object.assign({}, alias), { usageCount }));
    });
    return typeUsageList;
};
// Function to process all TypeScript files in a directory and write output to sentinel.ts
const processDirectory = (directory, options) => {
    const files = getFiles(directory, options).filter((file) => {
        return file.res.endsWith(".ts") || file.res.endsWith(".tsx");
    });
    let program = ts.createProgram([...files.map((r) => r.res)], {
        allowJs: true,
    });
    const typeAliases = [];
    files.forEach((file) => {
        const aliasesInFile = extractTypeAliases(file);
        typeAliases.push(...aliasesInFile);
    });
    const typeUsageList = findTypeUsage(files, typeAliases, program);
    typeUsageList.sort((a, b) => b.usageCount - a.usageCount);
    const output = [];
    output.push("// Type aliases and their usage count:");
    typeUsageList.forEach((alias) => {
        const typeHash = createUniqueIdentifier(alias.value); // Calculate hash of type value
        // Store type alias in hashmap based on hashed type value
        if (!typeMap.has(typeHash)) {
            typeMap.set(typeHash, []);
        }
        typeMap.get(typeHash).push({
            typeName: alias.name,
            typePath: path.relative(currentDirectory, alias.path),
            typeFullPath: alias.path,
            typeCount: alias.usageCount,
        });
        if (options.collectTypes) {
            output.push(`// Path: ${alias.path}`);
            output.push(`// ${alias.name} used ${alias.usageCount} time${alias.usageCount !== 1 ? "s" : ""}`);
            output.push(`type ${alias.name} = ${alias.value}`);
        }
    });
    if (options.collectTypes) {
        fs.writeFileSync(constants_1.OUTPUT_FILE, output.join("\n"));
    }
    return typeMap;
};
// Map to store type aliases grouped by hashed type value
const typeMap = new Map();
function normalizeString(str, strict) {
    let normalizedString = str;
    if (/^\|/.test(str)) {
        normalizedString = str.slice(1);
    }
    const computedString = normalizedString.replace(/\s+|,+|;+|\n+/g, "");
    if (strict === false) {
        return computedString.toLowerCase();
    }
    return computedString;
}
function createUniqueIdentifier(jsonString) {
    const normalizedString = normalizeString(jsonString);
    return normalizedString;
}
// Example usage: process all TypeScript files in the current directory
const currentDirectory = process.cwd();
// console.log(computedTypeMap.get(createUniqueIdentifier('"hello world" | "hola mundo"')));
// console.log(computedTypeMap.get(createUniqueIdentifier("string")));
// console.log(computedTypeMap.get(createUniqueIdentifier("{ value: T }")));
// console.log(computedTypeMap.get(createUniqueIdentifier("Asofjaooidj & THelloWorld")));
// console.log(computedTypeMap.get(createUniqueIdentifier("{}")));
// console.log(
//   computedTypeMap.get(
//     createUniqueIdentifier(`{
//       children: ReactNode;
//       height?: number;
//       width?: number;
//     }`)
//   )
// );
function filterMapValues(map, searchString) {
    const filteredValues = [];
    map.forEach((value, key) => {
        if (key.includes(searchString)) {
            filteredValues.push(...value);
        }
    });
    return filteredValues;
}
const buildTypesMap = (options) => {
    return new Promise((resolve) => {
        const computedTypeMap = processDirectory(currentDirectory, options);
        resolve(computedTypeMap);
    });
};
const showPrompt = (computedTypeMap, strict) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = new enquirer_1.Input({
        name: "type",
        message: "Write or paste here:",
        multiline: true,
    });
    const answer = yield prompt.run();
    if (answer) {
        const spinner = (0, ora_1.default)({
            text: "Searching...",
            spinner: "fingerDance",
        }).start();
        const arr = filterMapValues(computedTypeMap, normalizeString(answer, strict));
        spinner.stop();
        arr.forEach((el) => {
            console.log((0, colorette_1.bold)((0, colorette_1.blueBright)(el.typeName)), `- ${(0, colorette_1.gray)(el.typePath)}`, `- Used ${el.typeCount} time(s) in your project`);
        });
        yield showPrompt(computedTypeMap, strict);
    }
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const options = readConfig();
    const computedTypeMap = yield buildTypesMap(options);
    spinner.stop();
    try {
        yield showPrompt(computedTypeMap, options.strict);
    }
    catch (err) {
        console.log(err);
    }
});
main();
