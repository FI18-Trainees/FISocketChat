import { ISidebarContentMedia } from './ISidebarContentMedia';

export interface ISidebarContent {
    header: string;
    id?: string;
    text?: string;
    link?: string;
    media?: ISidebarContentMedia;
}
