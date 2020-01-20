import { IAuthor } from './IAuthor';

export interface IMessage {
    content_type: string;
    author: IAuthor;
    content: string;
    timestamp: string;
    full_timestamp: string;
    append_allow: boolean;
    priority: string;
}
