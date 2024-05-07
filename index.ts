import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { CONFIG_FILE, OUTPUT_FILE } from "./common/constants";
// @ts-ignore
import { Input } from "enquirer";
import { blueBright, bold, gray } from "colorette";
import ora from "ora";

type TComputedTypeMap = Map<
  string,
  {
    typeName: string;
    typePath: string;
    typeCount: number;
    typeFullPath: string;
  }[]
>;


const spinner = ora({
  text: "Doing some stuff...",
  spinner: "fingerDance",
}).start();

type TypeAliases = { name: string; value: string; path: string }[];

interface TypeUsage {
  name: string;
  value: string;
  usageCount: number;
  path: string;
}

interface Options {
  skip: string[]; // Directories or files to skip
  collectTypes?: boolean;
  strict?: boolean;
}

// Function to read the config file
const readConfig = (): Options => {
  const configFile = CONFIG_FILE;
  if (fs.existsSync(configFile)) {
    const configData = fs.readFileSync(configFile, "utf-8");
    return JSON.parse(configData);
  }
  return { skip: ["node_modules"], collectTypes: false }; // Default empty array if config file not found
};

// Function to recursively traverse a directory and return all TypeScript files
const getFiles = (
  dir: string,
  options: Options
): { res: string; rel: string }[] => {
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
    } else {
      if (options.skip.includes(rel)) {
        return [];
      }
      return { res, rel };
    }
  });
  return Array.prototype.concat(...files);
};

// Function to extract type aliases and their values from a TypeScript file
const extractTypeAliases = (file: {
  res: string;
  rel: string;
}): TypeAliases => {
  const sourceFile = ts.createSourceFile(
    file.res,
    fs.readFileSync(file.res).toString(),
    ts.ScriptTarget.Latest,
    true
  );

  const typeAliases: TypeAliases = [];

  function visit(node: ts.Node) {
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
const findTypeUsage = (
  files: { res: string; rel: string }[],
  typeAliases: TypeAliases,
  program: ts.Program
): TypeUsage[] => {
  const typeUsageMap = new Map<string, number>();
  files.forEach((file) => {
    const sourceFile = program.getSourceFile(file.res);
    if (!sourceFile) return [];

    const typeChecker = program.getTypeChecker();

    function visit(node: ts.Node) {
      if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
        const typeName = node.typeName.text;

        const type = typeChecker.getTypeAtLocation(node);
        const symbol = type.symbol || type.aliasSymbol;
        const decls = symbol?.getDeclarations() as ts.Declaration[];

        // let typeArguments = "";
        // if (node.typeArguments) {
        //   typeArguments = `<${node.typeArguments.map(argument => argument.getText(sourceFile)).join(", ")}>`;
        // }

        decls?.map((decl) => {
          // const typeName = _typeName;
          const key = typeName + decl.getSourceFile().fileName;

          if (typeUsageMap.has(key)) {
            typeUsageMap.set(key, typeUsageMap.get(key)! + 1);
          } else {
            typeUsageMap.set(key, 1);
          }
        });
      }
      ts.forEachChild(node, visit);
    }

    ts.forEachChild(sourceFile, visit);
  });

  const typeUsageList: TypeUsage[] = [];
  typeAliases.forEach((alias, index) => {
    // console.log(Array.from(typeUsageMap.keys()).pop(), alias.parentPath)
    // console.log(alias.parentPath)
    const usageCount =
      typeUsageMap.get(alias.name.replace(/(\<\w+\>)/, "") + alias.path) || 0;
    typeUsageList.push({ ...alias, usageCount });
  });

  return typeUsageList;
};

// Function to process all TypeScript files in a directory and write output to sentinel.ts
const processDirectory = (directory: string, options: Options) => {
  const files = getFiles(directory, options).filter((file) => {
    return file.res.endsWith(".ts") || file.res.endsWith(".tsx");
  });

  let program = ts.createProgram([...files.map((r) => r.res)], {
    allowJs: true,
  });

  const typeAliases: TypeAliases = [];
  files.forEach((file) => {
    const aliasesInFile = extractTypeAliases(file);
    typeAliases.push(...aliasesInFile);
  });

  const typeUsageList = findTypeUsage(files, typeAliases, program);

  typeUsageList.sort((a, b) => b.usageCount - a.usageCount);

  const output: string[] = [];
  output.push("// Type aliases and their usage count:");
  typeUsageList.forEach((alias) => {
    const typeHash = createUniqueIdentifier(alias.value); // Calculate hash of type value
    // Store type alias in hashmap based on hashed type value
    if (!typeMap.has(typeHash)) {
      typeMap.set(typeHash, []);
    }
    typeMap.get(typeHash)!.push({
      typeName: alias.name,
      typePath: path.relative(currentDirectory, alias.path),
      typeFullPath: alias.path,
      typeCount: alias.usageCount,
    });
    if (options.collectTypes) {
      output.push(`// Path: ${alias.path}`);
      output.push(
        `// ${alias.name} used ${alias.usageCount} time${
          alias.usageCount !== 1 ? "s" : ""
        }`
      );
      output.push(`type ${alias.name} = ${alias.value}`);
    }
  });

  if (options.collectTypes) {
    fs.writeFileSync(OUTPUT_FILE, output.join("\n"));
  }
  return typeMap;
};

// Map to store type aliases grouped by hashed type value
const typeMap: Map<
  string,
  Array<{
    typeName: string;
    typePath: string;
    typeCount: number;
    typeFullPath: string;
  }>
> = new Map();

function normalizeString(str: string, strict?: boolean): string {
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

function createUniqueIdentifier(jsonString: string): string {
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

function filterMapValues(
  map: Map<string, Array<any>>,
  searchString: string
): Array<any> {
  const filteredValues: Array<any> = [];

  map.forEach((value, key) => {
    if (key.includes(searchString)) {
      filteredValues.push(...value);
    }
  });

  return filteredValues;
}

const buildTypesMap = (options: Options): Promise<
  TComputedTypeMap
> => {
  return new Promise((resolve) => {
    const computedTypeMap = processDirectory(currentDirectory, options);
    resolve(computedTypeMap);
  });
};

const showPrompt = async (
  computedTypeMap: TComputedTypeMap,
  strict?: boolean
) => {
  const prompt = new Input({
    name: "type",
    message: "Write or paste here:",
    multiline: true,
  });
  const answer = await prompt.run();
  if (answer) {
    const spinner = ora({
      text: "Searching...",
      spinner: "fingerDance",
    }).start();
    const arr = filterMapValues(
      computedTypeMap,
      normalizeString(answer, strict)
    );
    spinner.stop()

    arr.forEach((el) => {
      console.log(
        bold(blueBright(el.typeName)),
        `- ${gray(el.typePath)}`,
        `- Used ${el.typeCount} time(s) in your project`
      );
    });
    await showPrompt(computedTypeMap, strict);
  }
};

const main = async () => {
  const options = readConfig();
  const computedTypeMap = await buildTypesMap(options);
  spinner.stop();

  try {
    await showPrompt(computedTypeMap, options.strict);
  } catch (err) {
    console.log(err);
  }
};

main();
