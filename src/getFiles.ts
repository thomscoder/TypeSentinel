import fs from "fs";
import { CONFIG_FILE } from "./constants";
import { Options } from "./types/types";
import path from "path";

// Function to read the config file
export const readConfig = (): Options => {
  const configFile = CONFIG_FILE;
  if (fs.existsSync(configFile)) {
    const configData = fs.readFileSync(configFile, "utf-8");
    return JSON.parse(configData);
  }
  return { skip: ["node_modules"], collectTypes: false }; // Default empty array if config file not found
};


// Function to recursively traverse a directory and return all TypeScript files
export const getFiles = (
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