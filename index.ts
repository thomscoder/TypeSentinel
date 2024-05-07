import ora from "ora";
import { Options, TComputedTypeMap } from "./src/types/types";
import { readConfig } from "./src/getFiles";
import { showPrompt } from "./src/prompt";
import { processDirectory } from "./src";

export const currentDirectory = process.cwd();

const spinner = ora({
  text: "Doing some stuff...",
  spinner: "fingerDance",
}).start();

const buildTypesMap = (options: Options): Promise<TComputedTypeMap> => {
  return new Promise((resolve) => {
    const computedTypeMap = processDirectory(currentDirectory, options);
    resolve(computedTypeMap);
  });
};

const start = async () => {
  const options = readConfig();
  const computedTypeMap = await buildTypesMap(options);
  spinner.stop();

  try {
    await showPrompt(computedTypeMap, options.strict);
  } catch (err) {
    console.log(err);
  }
};

start();
