import * as ts from "typescript";
import { createUniqueIdentifier, extractTypeAliases } from "./functions";
import { getFiles } from "./getFiles";
import { Options, TypeAliases } from "./types/types";
import { findTypeUsage } from "./findTypeUsage";
import { currentDirectory } from "..";
import path from "path";
import { OUTPUT_FILE } from "./constants";
import fs from "fs";

const typeMap: Map<
  string,
  Array<{
    typeName: string;
    typePath: string;
    typeCount: number;
    typeFullPath: string;
  }>
> = new Map();

// Function to process all TypeScript files in a directory and write output to sentinel.ts
export const processDirectory = (directory: string, options: Options) => {
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
    const typeHash = createUniqueIdentifier(alias.value);
    // Store type alias in hashmap
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
