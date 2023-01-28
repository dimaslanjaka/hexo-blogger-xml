import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import * as fs from 'fs';

/**
 * @example
 * ```js
 * truncate('This is a long message', 20, '...');
 * ```
 * @param str
 * @param max
 * @param suffix
 * @returns
 */
export const truncate = (str: string, max: number, suffix: string | any[]) =>
  str.length < max ? str : `${str.substr(0, str.substr(0, max - suffix.length).lastIndexOf(' '))}${suffix}`;

export function writeFileSync(pathfile: string, content: any) {
  if (!existsSync(dirname(pathfile))) mkdirSync(dirname(pathfile), { recursive: true });
  fs.writeFileSync(pathfile, content);
}
