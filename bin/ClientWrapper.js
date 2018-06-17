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
const beam_client_node_1 = require("beam-client-node");
class ClientWrapper {
    constructor(channelID, client_id, accessToken, tokenExpires) {
        this.channelID = channelID;
        this.client_id = client_id;
        this.accessToken = accessToken;
        this.tokenExpires = tokenExpires;
        this.client = new beam_client_node_1.Client(new beam_client_node_1.DefaultRequestRunner());
        console.log("Client: Setting up OAUTH");
        this.client.use(new beam_client_node_1.OAuthProvider(this.client, {
            clientId: this.client_id,
            tokens: {
                access: this.accessToken,
                expires: this.tokenExpires
            },
        }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50V3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9DbGllbnRXcmFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSx1REFJMEI7QUFLMUI7SUFTQyxZQUFZLFNBQWlCLEVBQUUsU0FBaUIsRUFBRSxXQUFtQixFQUFFLFlBQW9CO1FBQzFGLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSx5QkFBVyxDQUFDLElBQUksdUNBQW9CLEVBQUUsQ0FBQyxDQUFDO1FBRTFELE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGdDQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUM5QyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDeEIsTUFBTSxFQUFFO2dCQUNQLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDeEIsT0FBTyxFQUFPLElBQUksQ0FBQyxZQUFZO2FBQy9CO1NBQ0QsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNVLE9BQU8sQ0FBQyxPQUFpQjs7WUFDckMsSUFBSSxHQUFHLEdBQTZCLEVBQUUsQ0FBQztZQUN2QyxJQUFJO2dCQUNILE9BQU8sT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQzFCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENB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