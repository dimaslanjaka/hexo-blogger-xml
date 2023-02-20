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
export declare const truncate: (str: string, max: number, suffix: string | any[]) => string;
export declare function writeFileSync(pathfile: string, content: any): void;
