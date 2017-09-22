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
const commonjs_1 = require("../carina/dist/commonjs");
const Event_1 = require("./common/utils/Event");
const Utils_1 = require("./common/utils/Utils");
const ws = require("ws");
commonjs_1.Carina.WebSocket = ws;
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
    }
    start(channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ca = new commonjs_1.Carina({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FyaW5hV3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9DYXJpbmFXcmFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSxzREFBaUQ7QUFFakQsZ0RBQTZDO0FBQzdDLGdEQUE2QztBQUU3Qyx5QkFBeUI7QUFDekIsaUJBQU0sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBRXRCO0lBQUE7UUFJQzs7V0FFRztRQUNILGtCQUFhLEdBQTJELElBQUksYUFBSyxFQUFPLENBQUM7UUFFekY7O1dBRUc7UUFDSCxvQkFBZSxHQUEyRCxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTNGOztXQUVHO1FBQ0gscUJBQWdCLEdBQTZELElBQUksYUFBSyxFQUFPLENBQUM7UUFFOUY7O1dBRUc7UUFDSCx1QkFBa0IsR0FBNkQsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUVoRzs7V0FFRztRQUNILDBCQUFxQixHQUE2RCxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRW5HOzs7O1dBSUc7UUFDSCx5QkFBb0IsR0FBeUQsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUU5Rjs7V0FFRztRQUNILDhCQUF5QixHQUFrQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTVFOztXQUVHO1FBQ0gsZ0NBQTJCLEdBQWtDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFOUU7O1dBRUc7UUFDSCw4QkFBeUIsR0FBa0MsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUU1RTs7V0FFRztRQUNILDBCQUFxQixHQUFxRCxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTNGOztXQUVHO1FBQ0gsZ0JBQVcsR0FBeUQsSUFBSSxhQUFLLEVBQU8sQ0FBQztJQW1FdEYsQ0FBQztJQWhFTSxLQUFLLENBQUMsU0FBaUI7O1lBQzVCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxpQkFBTSxDQUFDO2dCQUNwQixLQUFLLEVBQUUsSUFBSTtnQkFDWCxvQkFBb0I7YUFDcEIsQ0FBQyxD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