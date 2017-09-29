import * as CarinaInterface from "./CarinaInterface";
import { Event } from "./common/utils/Event";
export declare class CarinaWrapper {
    private ca;
    /**
     * Event called when viewer follows the channel.
     */
    onFollowEvent: Event<(data: CarinaInterface.ChannelFollowed) => void>;
    /**
     * Event called when viewer unfollows the channel.
     */
    onUnfollowEvent: Event<(data: CarinaInterface.ChannelFollowed) => void>;
    /**
     * Event called when viewer subscribes the channel.
     */
    onSubscribeEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void>;
    /**
     * Event called when viewer resubscribes the channel.
     */
    onResubscribeEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void>;
    /**
     * Event called when viewer shares the resubscription.
     */
    onSubscribeShareEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void>;
    /**
     * Event called when the channel data updates.
     *
     * Contains partial update data!
     */
    onChannelUpdateEvent: Event<(data: CarinaInterface.ChannelUpdate) => void>;
    /**
     * Event called when the total number of viewers updates.
     */
    onViewersTotalUpdateEvent: Event<(data: number) => void>;
    /**
     * Event called when the current number of viewers updates.
     */
    onViewersCurrentUpdateEvent: Event<(data: number) => void>;
    /**
     * Event called when the total number of followers updates.
     */
    onNumFollowersUpdateEvent: Event<(data: number) => void>;
    /**
     * Event called when audience updates.
     */
    onAudienceUpdateEvent: Event<(data: "family" | "teen" | "18+") => void>;
    /**
     * Event called when viewer hosts the channel.
     */
    onHostEvent: Event<(data: CarinaInterface.ChannelHosted) => void>;
    /**
     * Event called when a channel is featured
     */
    onChannelFeatured: Event<(data: CarinaInterface.ChannelFeatured) => void>;
    /**
     * Event called when a channel goes live
     */
    onChannelGoLive: Event<() => void>;
    /**
    * Event called when a channel goes offline
    */
    onChannelGoOffline: Event<() => void>;
    /**
     * Event called when a channel game changes
     */
    onGameChange: Event<(data: CarinaInterface.GameType) => void>;
    start(channelID: number): Promise<boolean>;
    stop(): Promise<boolean>;
}
