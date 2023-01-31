interface ErrorTrace {
    getTypeName(): string;
    getFunctionName(): string;
    getMethodName(): string;
    getFileName(): string;
    getLineNumber(): number;
    getColumnNumber(): string;
    isNative(): boolean;
}
export declare function get(belowFn?: any): ErrorTrace[];
export declare function parse(err: any): any;
export {};
