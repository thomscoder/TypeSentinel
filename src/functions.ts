import * as ts from "typescript";
import { TComputedTypeMap, TypeAliases } from "./types/types";
import fs from "fs";

// Search values in map
export const filterMapValues = (
  map: TComputedTypeMap,
  searchString: string
): Array<any> => {
  const filteredValues: Array<any> = [];

  map.forEach((value, key) => {
    if (key.includes(searchString)) {
      filteredValues.push(...value);
    }
  });

  return filteredValues;
};

// Normalize string
export const normalizeString = (str: string, strict?: boolean): string => {
  let normalizedString = str;

  if (/^\|/.test(str)) {
    normalizedString = str.slice(1);
  }

  const computedString = normalizedString.replace(/\s+|,+|;+|\n+/g, "");

  if (strict === false) {
    return computedString.toLowerCase();
  }

  return computedString;
};

// Create Unique identifier
export const createUniqueIdentifier = (jsonString: string): string => {
  const normalizedString = normalizeString(jsonString);
  return normalizedString;
};

// Function to extract type aliases and their values from a TypeScript file
export const extractTypeAliases = (file: {
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
