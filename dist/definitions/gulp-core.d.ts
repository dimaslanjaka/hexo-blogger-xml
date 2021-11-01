import { LooseObject, PostHeader } from "./types/post-header";
export interface gulpConfig extends LooseObject {
    /**
     * Blogger xml files
     */
    input: string[];
    /**
     * Folder output
     */
    output: string;
    /**
     * Blog hostname/domain list / internal link list by domain name
     */
    hostname?: string[];
    callback: (arg0: string, arg1: PostHeader) => string;
    on?: {
        /**
         * On Process Started
         */
        init?: () => any;
        /**
         * On Process Finished
         */
        finish?: () => any;
    };
}
declare function gulpFunction(bloggerConfig: gulpConfig): void;
export default gulpFunction;
