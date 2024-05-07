import crypto from "crypto";

export const hashString = (str: string) => {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  return hash;
};
