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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FyaW5hV3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9DYXJpbmFXcmFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSxzREFBaUQ7QUFFakQsZ0RBQTZDO0FBQzdDLGdEQUE2QztBQUU3Qyx5QkFBeUI7QUFDekIsaUJBQU0sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBRXRCO0lBQUE7UUFJQzs7V0FFRztRQUNILGtCQUFhLEdBQTJELElBQUksYUFBSyxFQUFPLENBQUM7UUFFekY7O1dBRUc7UUFDSCxvQkFBZSxHQUEyRCxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTNGOztXQUVHO1FBQ0gscUJBQWdCLEdBQTZELElBQUksYUFBSyxFQUFPLENBQUM7UUFFOUY7O1dBRUc7UUFDSCx1QkFBa0IsR0FBNkQsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUVoRzs7V0FFRztRQUNILDBCQUFxQixHQUE2RCxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRW5HOzs7O1dBSUc7UUFDSCx5QkFBb0IsR0FBeUQsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUU5Rjs7V0FFRztRQUNILDhCQUF5QixHQUFrQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTVFOztXQUVHO1FBQ0gsZ0NBQTJCLEdBQWtDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFOUU7O1dBRUc7UUFDSCw4QkFBeUIsR0FBa0MsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUU1RTs7V0FFRztRQUNILDBCQUFxQixHQUFxRCxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTNGLGdCQUFXLEdBQXlELElBQUksYUFBSyxFQUFPLENBQUM7SUFtRXRGLENBQUM7SUFoRU0sS0FBSyxDQUFDLFNBQWlCOztZQUM1QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksaUJBQU0sQ0FBQztnQkFDcEIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsb0JBQW9CO2FBQ3BCLENBQUMsQ0FBQyxJQUFJLEVB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