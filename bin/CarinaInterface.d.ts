export interface ChannelUpdate {
    online?: boolean;
    featured?: boolean;
    featureLevel?: number;
    partnered?: boolean;
    audience?: "family" | "teen" | "18+";
    viewersTotal?: number;
    viewersCurrent?: number;
    numFollowers?: number;
    typeId?: number;
    type?: GameType;
}
export interface ChannelFollowed {
    following?: boolean;
    user?: {
        id: number;
        username: string;
    };
}
export interface ChannelSubscribed {
    user?: {
        username: string;
    };
    totalMonths?: number;
}
export interface ChannelHosted {
    hoster?: {
        token?: string;
    };
}
export interface GameType {
    id?: number;
    name?: string;
    parent?: string;
    description?: string;
    source?: string;
    viewersCurrent?: number;
    coverUrl?: string;
    backgroundUrl?: string;
    online?: number;
}
export interface ChannelFeatured {
    featured?: boolean;
    featureLevel?: number;
}
