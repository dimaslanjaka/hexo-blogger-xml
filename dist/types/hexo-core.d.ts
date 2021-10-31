import { LooseObject } from "./types/post-header";
export interface BloggerXmlConfig extends LooseObject {
    /**
     * Blogger xml files
     */
    input: string[];
    /**
     * Folder output
     */
    output: string;
    /**
     * Blog hostname/domain
     */
    hostname?: string[];
    /**
     * Script to process each post content
     */
    callback?: string;
}
