export type TypeAliases = { name: string; value: string; path: string }[];

export type TComputedTypeMap = Map<
  string,
  {
    typeName: string;
    typePath: string;
    typeCount: number;
    typeFullPath: string;
  }[]
>;


export interface TypeUsage {
  name: string;
  value: string;
  usageCount: number;
  path: string;
}

export interface Options {
  skip: string[]; // Directories or files to skip
  collectTypes?: boolean;
  strict?: boolean;
}