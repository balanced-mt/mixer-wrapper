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
    isSubscriber(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.areSubscribers([userID]))[userID] === true;
        });
    }
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
    isFollower(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.areFollowers([userID]))[userID] === true;
        });
    }
}
exports.ClientWrapper = ClientWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50V3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9DbGllbnRXcmFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSwrQ0FBZ0Q7QUFLaEQ7SUFTQyxZQUFZLFNBQWlCLEVBQUUsU0FBaUIsRUFBRSxXQUFtQixFQUFFLFlBQW9CO1FBQzFGLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUUvQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO1lBQ3hCLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN4QixNQUFNLEVBQUU7Z0JBQ1AsTUFBTSxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7YUFDMUI7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRVksY0FBYyxDQUFDLE9BQWlCOztZQUM1QyxJQUFJLEdBQUcsR0FBNkIsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQztnQkFDSixPQUFPLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzNCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxZQUFZLElBQUksQ0FBQyxTQUFTLG1CQUFtQixFQUFFO3dC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