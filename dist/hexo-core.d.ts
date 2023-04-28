import { LooseObject } from './types/post-header';
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
    /**
     * Site title
     */
    site_title?: string;
    /**
     * Default thumbnail if no image inside post
     */
    thumbnail?: string;
}
/**
 * Hexo preprocessor
 * @param hexo
 */
declare const hexoCore: (hexo: Hexo) => void;
export default hexoCore;
