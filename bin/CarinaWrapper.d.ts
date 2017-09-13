import * as CarinaInterface from "./CarinaInterface";
import { Event } from "./common/utils/Event";
export declare class CarinaWrapper {
    private ca;
    onFollowEvent: Event<(data: CarinaInterface.ChannelFollowed) => void>;
    onUnfollowEvent: Event<(data: CarinaInterface.ChannelFollowed) => void>;
    onSubscribeEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void>;
    onResubscribeEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void>;
    onSubscribeShareEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void>;
    onHostEvent: Event<(data: CarinaInterface.ChannelHosted) => void>;
    start(channelID: number): Promise<boolean>;
    stop(): Promise<boolean>;
}
