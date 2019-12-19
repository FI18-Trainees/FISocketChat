import { IFields } from "./IFields";
import { IMedia } from "./IMedia";
import { IMessage } from "./IMessage";

export interface IEmbed extends IMessage {
    title: string;
    text?: string;
    fields?: IFields[];
    media?: IMedia;
    thumbnail?: string;
    color?: string;
    footer?: string;
}