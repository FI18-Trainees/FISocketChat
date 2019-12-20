import { ISitebarContentMedia } from './ISitebarContentMedia';

export interface ISitebarContent {
    header: string;
    id?: string;
    text?: string;
    link?: string;
    media?: ISitebarContentMedia;
}
