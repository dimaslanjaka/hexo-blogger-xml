import { existsSync, PathLike, readFileSync } from "fs";
import { JSDOM } from "jsdom";

export function fromFile(path: string | PathLike) {
  if (existsSync(path)) {
    const dom = new JSDOM(readFileSync(path));
    return dom;
  }
  return false;
}

export function fromString(str: string) {
  const dom = new JSDOM(str);
  return dom;
}

export function title(str: string) {
  const dom = new JSDOM(str);
  return dom.window.document.querySelector("title").textContent;
}
