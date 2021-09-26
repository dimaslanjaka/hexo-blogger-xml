import data from "./entry.json";
import comments from "./entry-comments.json";
import replies from "./entry-replies.json";

export type Entry = typeof data;
export type EntryComments = typeof comments;
export type EntryReplies = typeof replies;

//export interface Entry extends EntryMain, EntryComments, EntryReplies {}
