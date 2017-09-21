export declare class ClientWrapper {
    private client;
    private channelID;
    private client_id;
    private accessToken;
    private tokenExpires;
    constructor(channelID: number, client_id: string, accessToken: string, tokenExpires: number);
    areSubscribers(userIDs: number[]): Promise<{
        [K: number]: boolean;
    }>;
    isSubscriber(userID: number): Promise<boolean>;
    areFollowers(userIDs: number[]): Promise<{
        [K: number]: boolean;
    }>;
    isFollower(userID: number): Promise<boolean>;
}
