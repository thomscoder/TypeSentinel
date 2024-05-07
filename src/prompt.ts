import ora from "ora";
import { TComputedTypeMap } from "./types/types";
import { filterMapValues, normalizeString } from "./functions";
// @ts-ignore
import { Input } from "enquirer";
import { blueBright, bold, gray } from "colorette";

// Recursively show prompt
export const showPrompt = async (
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
    spinner.stop();

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





