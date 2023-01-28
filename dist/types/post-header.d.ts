import data from './post-header.json';
export interface LooseObject {
    [key: string]: any;
}
export declare type PostHeaderDefault = typeof data;
export interface PostHeader extends LooseObject, PostHeaderDefault {
}
