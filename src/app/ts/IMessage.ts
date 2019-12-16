import { IAuthor } from "./IAuthor";
import { ITimestamp } from "./ITimestamp";

export interface IMessage {
    content_type: string;
    author: IAuthor;
    content: string;
    timestamp: ITimestamp;
    append_allow: boolean;
    priority: string;
}