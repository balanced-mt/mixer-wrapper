export declare class ClientWrapper {
    private client;
    private channelID;
    private client_id;
    private accessToken;
    private tokenExpires;
    constructor(channelID: number, client_id: string, accessToken: string, tokenExpires: number);
    /**
     * Returns a promise that will resolve to an object that will contain userID to true mappings for each mod.
     *
     * The object will only include mods.
     */
    areMods(userIDs: number[]): Promise<{
        [K: number]: boolean;
    }>;
    /**
     * Returns a promise that will resolve to either true or false depending on if user with userID is a mod or not.
     */
    isMod(userID: number): Promise<boolean>;
    /**
     * Returns a promise that will resolve to an object that will contain userID to true mappings for each subscriber.
     *
     * The object will only include subscribers.
     */
    areSubscribers(userIDs: number[]): Promise<{
        [K: number]: boolean;
    }>;
    /**
     * Returns a promise that will resolve to either true or false depending on if user with userID is a subscriber or not.
     */
    isSubscriber(userID: number): Promise<boolean>;
    /**
     * Returns a promise that will resolve to an object that will contain userID to true mappings for each follower.
     *
     * The object will only include followers.
     */
    areFollowers(userIDs: number[]): Promise<{
        [K: number]: boolean;
    }>;
    /**
     * Returns a promise that will resolve to either true or false depending on if user with userID is a follower or not.
     */
    isFollower(userID: number): Promise<boolean>;
}
