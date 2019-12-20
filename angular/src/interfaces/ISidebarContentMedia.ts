export enum MediaType {
    icon = 'icon',
    image = 'image'
}

export interface ISidebarContentMedia {
    mediaType: MediaType;
    mediaLink: string;
    mediaId?: string;
}
