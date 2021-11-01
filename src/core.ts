import { PostHeader } from "./types/post-header";
import { existsSync } from "fs";
import BloggerParser from "./parser/Blogger";

export function process(
  xml: string,
  output: string,
  hostname?: string[],
  // eslint-disable-next-line no-unused-vars
  callback?: (arg0: string, arg1: PostHeader) => string
) {
  if (existsSync(xml)) {
    console.log("processing", xml);
    const parser = new BloggerParser(xml);
    if (Array.isArray(hostname) && hostname.length > 0) {
      parser.setHostname(hostname);
    }

    const parsed = parser.parseEntry().getJsonResult();
    console.log(parsed.getParsedXml().length, "total posts");

    if (typeof callback == "function") {
      parsed.export(output, callback);
    }
  }
}
