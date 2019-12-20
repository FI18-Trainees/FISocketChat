export enum MediaType {
    icon,
    image
}

export interface ISitebarContentMedia {
    mediaType: MediaType;
    mediaLink: string;
    mediaId?: string;
}
