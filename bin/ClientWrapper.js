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
const BeamClient = require("beam-client-node");
class ClientWrapper {
    constructor(channelID, client_id, accessToken, tokenExpires) {
        this.channelID = channelID;
        this.client_id = client_id;
        this.accessToken = accessToken;
        this.tokenExpires = tokenExpires;
        this.client = new BeamClient();
        console.log("Client: Setting up OAUTH");
        this.client.use("oauth", {
            clientId: this.client_id,
            tokens: {
                access: this.accessToken,
                expires: this.tokenExpires
            },
        });
    }
    /**
     * Returns a promise that will resolve to an object that will contain userID to true mappings for each mod.
     *
     * The object will only include mods.
     */
    areMods(userIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            let out = {};
            try {
                while (userIDs.length > 0) {
                    let currentIDs = userIDs.splice(0, 100);
                    let response = yield this.client.request('GET', `channels/${this.channelID}/users/mod`, {
                        qs: {
                            where: "id:in:" + currentIDs.join(";"),
                            limit: 100
                        }
                    });
                    response.body.forEach((data) => {
                        let isSub = false;
                        data.groups.forEach((group) => {
                            if (group.name.toLowerCase() === "mod") {
                                isSub = true;
                            }
                        });
                        if (isSub) {
                            out[data.id] = isSub;
                        }
                    });
                }
            }
            catch (err) {
                console.error(`GET /channels/${this.channelID}/users/mod`, err);
            }
            return out;
        });
    }
    /**
     * Returns a promise that will resolve to either true or false depending on if user with userID is a mod or not.
     */
    isMod(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.areMods([userID]))[userID] === true;
        });
    }
    /**
     * Returns a promise that will resolve to an object that will contain userID to true mappings for each subscriber.
     *
     * The object will only include subscribers.
     */
    areSubscribers(userIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            let out = {};
            try {
                while (userIDs.length > 0) {
                    let currentIDs = userIDs.splice(0, 100);
                    let response = yield this.client.request('GET', `channels/${this.channelID}/users/subscriber`, {
                        qs: {
                            where: "id:in:" + currentIDs.join(";"),
                            limit: 100
                        }
                    });
                    response.body.forEach((data) => {
                        let isSub = false;
                        data.groups.forEach((group) => {
                            if (group.name.toLowerCase() === "subscriber") {
                                isSub = true;
                            }
                        });
                        if (isSub) {
                            out[data.id] = isSub;
                        }
                    });
                }
            }
            catch (err) {
                console.error(`GET /channels/${this.channelID}/users/subscriber`, err);
            }
            return out;
        });
    }
    /**
     * Returns a promise that will resolve to either true or false depending on if user with userID is a subscriber or not.
     */
    isSubscriber(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.areSubscribers([userID]))[userID] === true;
        });
    }
    /**
     * Returns a promise that will resolve to an object that will contain userID to true mappings for each follower.
     *
     * The object will only include followers.
     */
    areFollowers(userIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            let out = {};
            try {
                while (userIDs.length > 0) {
                    let currentIDs = userIDs.splice(0, 100);
                    let response = yield this.client.request('GET', `/channels/${this.channelID}/follow`, {
                        qs: {
                            where: "id:in:" + currentIDs.join(";"),
                            fields: "id,followed",
                            limit: 100
                        }
                    });
                    response.body.forEach((data) => {
                        if (data.followed) {
                            out[data.followed.user] = true;
                        }
                    });
                }
            }
            catch (err) {
                console.error(`GET /channels/${this.channelID}/follow`, err);
            }
            return out;
        });
    }
    /**
     * Returns a promise that will resolve to either true or false depending on if user with userID is a follower or not.
     */
    isFollower(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.areFollowers([userID]))[userID] === true;
        });
    }
}
exports.ClientWrapper = ClientWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50V3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9DbGllbnRXcmFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSwrQ0FBZ0Q7QUFLaEQ7SUFTQyxZQUFZLFNBQWlCLEVBQUUsU0FBaUIsRUFBRSxXQUFtQixFQUFFLFlBQW9CO1FBQzFGLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUUvQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO1lBQ3hCLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN4QixNQUFNLEVBQUU7Z0JBQ1AsTUFBTSxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7YUFDMUI7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNVLE9BQU8sQ0FBQyxPQUFpQjs7WUFDckMsSUFBSSxHQUFHLEdBQTZCLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUM7Z0JBQ0osT0FBTyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUMzQixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsWUFBWSxJQUFJLENBQUMsU0FBUyxZ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