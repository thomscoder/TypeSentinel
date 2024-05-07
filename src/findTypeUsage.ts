import * as ts from "typescript";
import { TypeAliases, TypeUsage } from "./types/types";

// Function to find usage count of each type alias
export const findTypeUsage = (
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

        decls?.map((decl) => {
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
    const usageCount =
      typeUsageMap.get(alias.name.replace(/(\<\w+\>)/, "") + alias.path) || 0;
    typeUsageList.push({ ...alias, usageCount });
  });

  return typeUsageList;
};
