import { IAuthor } from "./IAuthor";
import { ITimestamp } from "./ITimestamp";
import { IFields } from "./IFields";
import { IMedia } from "./IMedia";

export interface IEmbed {
    author: IAuthor;
    timestamp: ITimestamp;
    append_allow: boolean;
    priority: string;
    title: string;
    text?: string;
    fields?: IFields[];
    media?: IMedia;
    thumbnail?: string;
    color?: string;
    footer?: string;
}