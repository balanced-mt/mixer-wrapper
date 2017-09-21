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
        this.onFollowEvent = new Event_1.Event();
        this.onUnfollowEvent = new Event_1.Event();
        this.onSubscribeEvent = new Event_1.Event();
        this.onResubscribeEvent = new Event_1.Event();
        this.onSubscribeShareEvent = new Event_1.Event();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FyaW5hV3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9DYXJpbmFXcmFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSxzREFBaUQ7QUFFakQsZ0RBQTZDO0FBQzdDLGdEQUE2QztBQUU3Qyx5QkFBeUI7QUFDekIsaUJBQU0sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBRXRCO0lBQUE7UUFJQyxrQkFBYSxHQUEyRCxJQUFJLGFBQUssRUFBTyxDQUFDO1FBQ3pGLG9CQUFlLEdBQTJELElBQUksYUFBSyxFQUFPLENBQUM7UUFFM0YscUJBQWdCLEdBQTZELElBQUksYUFBSyxFQUFPLENBQUM7UUFDOUYsdUJBQWtCLEdBQTZELElBQUksYUFBSyxFQUFPLENBQUM7UUFDaEcsMEJBQXFCLEdBQTZELElBQUksYUFBSyxFQUFPLENBQUM7UUFFbkcsZ0JBQVcsR0FBeUQsSUFBSSxhQUFLLEVBQU8sQ0FBQztJQWtEdEYsQ0FBQztJQS9DTSxLQUFLLENBQUMsU0FBaUI7O1lBQzVCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxpQkFBTSxDQUFDO2dCQUNwQixLQUFLLEVBQUUsSUFBSTtnQkFDWCxvQkFBb0I7YUFDcEIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRVYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBUTtnQkFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQVE7Z0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBa0MsV0FBVyxTQUFTLFdBQVcsRUFBRSxJQUFJO2dCQUN2RixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xDLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ1AsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFvQyxXQUFXLFNBQVMsYUFBYSxFQUFFLElBQUk7Z0JBQzNGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBb0MsV0FBVyxTQUFTLGVBQWUsRUFBRSxJQUFJO2dCQUM3RixJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQW9DLFdBQVcsU0FBUyxjQUFjLEVBQUUsSUFBSTtnQkFDNUYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFnQyxXQUFXLFNBQVMsU0FBUyxFQUFFLElBQUk7Z0JBQ25GLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxhQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXpCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDYixDQUFDO0tBQUE7SUFFSyxJQUFJOztZQUNULElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDYixDQUFDO0tBQUE7Q0FDRDtBQTdERCxzQ0E2REMifQ==