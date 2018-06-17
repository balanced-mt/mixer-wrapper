"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const carina_1 = require("carina");
const Event_1 = require("./common/utils/Event");
const Utils_1 = require("./common/utils/Utils");
const ws = require("ws");
carina_1.Carina.WebSocket = ws;
class CarinaWrapper {
    constructor() {
        /**
         * Event called when viewer follows the channel.
         */
        this.onFollowEvent = new Event_1.Event();
        /**
         * Event called when viewer unfollows the channel.
         */
        this.onUnfollowEvent = new Event_1.Event();
        /**
         * Event called when viewer subscribes the channel.
         */
        this.onSubscribeEvent = new Event_1.Event();
        /**
         * Event called when viewer resubscribes the channel.
         */
        this.onResubscribeEvent = new Event_1.Event();
        /**
         * Event called when viewer shares the resubscription.
         */
        this.onSubscribeShareEvent = new Event_1.Event();
        /**
         * Event called when the channel data updates.
         *
         * Contains partial update data!
         */
        this.onChannelUpdateEvent = new Event_1.Event();
        /**
         * Event called when the total number of viewers updates.
         */
        this.onViewersTotalUpdateEvent = new Event_1.Event();
        /**
         * Event called when the current number of viewers updates.
         */
        this.onViewersCurrentUpdateEvent = new Event_1.Event();
        /**
         * Event called when the total number of followers updates.
         */
        this.onNumFollowersUpdateEvent = new Event_1.Event();
        /**
         * Event called when audience updates.
         */
        this.onAudienceUpdateEvent = new Event_1.Event();
        /**
         * Event called when viewer hosts the channel.
         */
        this.onHostEvent = new Event_1.Event();
        /**
         * Event called when a channel is featured
         */
        this.onChannelFeatured = new Event_1.Event();
        /**
         * Event called when a channel goes live
         */
        this.onChannelGoLive = new Event_1.Event();
        /**
        * Event called when a channel goes offline
        */
        this.onChannelGoOffline = new Event_1.Event();
        /**
         * Event called when a channel game changes
         */
        this.onGameChange = new Event_1.Event();
    }
    start(channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ca = new carina_1.Carina({
                isBot: true
                //replyTimeout: 3000
            }).open();
            this.ca.on("error", (err) => {
                console.log("[Carina] error: " + err);
            });
            this.ca.on("warning", (err) => {
                console.log("[Carina] warning: " + err);
            });
            this.ca.subscribe(`channel:${channelID}:followed`, data => {
                if (data.following) {
                    this.onFollowEvent.execute(data);
                }
                else {
                    this.onUnfollowEvent.execute(data);
                }
            });
            this.ca.subscribe(`channel:${channelID}:subscribed`, data => {
                this.onSubscribeEvent.execute(data);
            });
            this.ca.subscribe(`channel:${channelID}:resubscribed`, data => {
                this.onResubscribeEvent.execute(data);
            });
            this.ca.subscribe(`channel:${channelID}:resubShared`, data => {
                this.onSubscribeShareEvent.execute(data);
            });
            this.ca.subscribe(`channel:${channelID}:hosted`, data => {
                this.onHostEvent.execute(data);
            });
            this.ca.subscribe(`channel:${channelID}:update`, data => {
                this.onChannelUpdateEvent.execute(data);
                if (data.online !== undefined) {
                    if (data.online) {
                        this.onChannelGoLive.execute();
                    }
                    else {
                        this.onChannelGoOffline.execute();
                    }
                }
                if (data.featured !== undefined) {
                    this.onChannelFeatured.execute({
                        featured: data.featured,
                        featureLevel: data.featureLevel
                    });
                }
                if (data.type !== undefined) {
                    this.onGameChange.execute(data.type);
                }
                if (data.viewersTotal !== undefined) {
                    this.onViewersTotalUpdateEvent.execute(data.viewersTotal);
                }
                if (data.viewersCurrent !== undefined) {
                    this.onViewersCurrentUpdateEvent.execute(data.viewersCurrent);
                }
                if (data.numFollowers !== undefined) {
                    this.onNumFollowersUpdateEvent.execute(data.numFollowers);
                }
                if (data.audience !== undefined) {
                    this.onAudienceUpdateEvent.execute(data.audience);
                }
            });
            yield Utils_1.Utils.Timeout(100);
            return true;
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ca.close();
            this.ca.removeAllListeners();
            this.ca = undefined;
            return true;
        });
    }
}
exports.CarinaWrapper = CarinaWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FyaW5hV3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9DYXJpbmFXcmFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSxtQ0FBZ0M7QUFFaEMsZ0RBQTZDO0FBQzdDLGdEQUE2QztBQUU3Qyx5QkFBeUI7QUFDekIsZUFBTSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFFdEI7SUFBQTtRQUlDOztXQUVHO1FBQ0gsa0JBQWEsR0FBMkQsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUV6Rjs7V0FFRztRQUNILG9CQUFlLEdBQTJELElBQUksYUFBSyxFQUFPLENBQUM7UUFFM0Y7O1dBRUc7UUFDSCxxQkFBZ0IsR0FBNkQsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUU5Rjs7V0FFRztRQUNILHVCQUFrQixHQUE2RCxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRWhHOztXQUVHO1FBQ0gsMEJBQXFCLEdBQTZELElBQUksYUFBSyxFQUFPLENBQUM7UUFFbkc7Ozs7V0FJRztRQUNILHlCQUFvQixHQUF5RCxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTlGOztXQUVHO1FBQ0gsOEJBQXlCLEdBQWtDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFNUU7O1dBRUc7UUFDSCxnQ0FBMkIsR0FBa0MsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUU5RTs7V0FFRztRQUNILDhCQUF5QixHQUFrQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTVFOztXQUVHO1FBQ0gsMEJBQXFCLEdBQXFELElBQUksYUFBSyxFQUFPLENBQUM7UUFFM0Y7O1dBRUc7UUFDSCxnQkFBVyxHQUF5RCxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRXJGOztXQUVHO1FBQ0gsc0JBQWlCLEdBQTJELElBQUksYUFBSyxFQUFPLENBQUM7UUFFN0Y7O1dBRUc7UUFDSCxvQkFBZSxHQUFzQixJQUFJLGFBQUssRUFBTyxDQUFDO1FBRXREOztVQUVFO1FBQ0YsdUJBQWtCLEdB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