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
const BeamSocket = require("beam-client-node/lib/ws");
const Event_1 = require("./common/utils/Event");
class ChatWrapper {
    constructor(channelID, client_id, accessToken, tokenExpires) {
        // The current outgoing command queue
        this.commandQueue = [];
        this.onChatUserJoin = new Event_1.Event();
        this.onChatUserLeave = new Event_1.Event();
        this.onChatClearMessages = new Event_1.Event();
        this.onChatDeleteMessage = new Event_1.Event();
        this.onChatPurgeMessage = new Event_1.Event();
        this.onChatUserUpdate = new Event_1.Event();
        this.onChatMessage = new Event_1.Event();
        this.onBotReady = new Event_1.Event();
        this.channelID = channelID;
        this.client_id = client_id;
        this.accessToken = accessToken;
        this.tokenExpires = tokenExpires;
    }
    // Add an outgoing command to the command-queue
    addToQueue(f, pushFront = false) {
        if (pushFront) {
            this.commandQueue.unshift(f);
        }
        else {
            this.commandQueue.push(f);
        }
    }
    // Send a global chat message
    sendChatMessage(message, pushFront = false) {
        this.addToQueue(() => {
            this.socket.call("msg", [message]).catch((reason) => {
                if (reason === "Please wait before sending more messages." || reason === "Please wait a moment before sending more messages.") {
                    this.sendChatMessage(message, true);
                    console.log("Re-queing message to chat " + reason);
                }
                else {
                    console.log("Error Sending Message to chat for reason: " + reason);
                }
            });
        }, pushFront);
    }
    static CleanUsername(name) {
        return name.replace("@", "");
    }
    // Send a message to a particular user
    sendUserMessage(user, message, pushFront = false) {
        user = ChatWrapper.CleanUsername(user);
        this.addToQueue(() => {
            this.socket.call("whisper", [user, message]).catch((reason) => {
                if (reason === "Please wait before sending more messages." || reason === "Please wait a moment before sending more messages.") {
                    this.sendUserMessage(user, message, true);
                    console.log("Re-queing message to user " + reason);
                }
                else {
                    console.log("Error Sending Message to user for reason: " + reason);
                }
            });
        }, pushFront);
    }
    // Remove a particular message from the chat
    removeMessage(id) {
        this.socket.call("deleteMessage", [id]).catch((reason) => {
            console.log("Delete Message Error: " + reason);
        });
    }
    // Start processing the command queue to funnel outgoing messages
    startCommandQueue() {
        setTimeout(() => {
            let hasFunc = false;
            // Start an interval that every 100ms attempts to send a beam-chat-api command
            this.commandQueueInterval = setInterval(() => {
                if (this.socket) {
                    let fn = this.commandQueue.shift();
                    if (fn) {
                        fn();
                        hasFunc = true;
                    }
                    else if (hasFunc) {
                        console.log("Queue is Empty");
                        hasFunc = false;
                    }
                }
            }, 100);
        }, 1000);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = new BeamClient();
            // With OAuth we don"t need to login, the OAuth Provider will attach
            // the required information to all of our requests after this call.
            console.log("Bot: Setting up OAUTH");
            this.client.use("oauth", {
                clientId: this.client_id,
                tokens: {
                    access: this.accessToken,
                    expires: this.tokenExpires
                },
            });
            console.log("Bot: Connecting to Beam");
            // Get"s the user we have access to with the token
            let currentUser = yield this.client.request("GET", `users/current`, {});
            let userInfo = currentUser.body;
            let joinResponse = yield this.client.chat.join(this.channelID);
            const body = joinResponse.body;
            console.log("Bot: Creating Chat Socket");
            // Chat connection
            this.socket = new BeamSocket(body.endpoints).boot();
            // React to our !pong command
            this.socket.on("ChatMessage", (data) => {
                let text = "";
                for (let i = 0; i < data.message.message.length; i++) {
                    text += data.message.message[i].text;
                }
                text = text.split(/\s+/).join(" ");
                data.text = text;
                this.onChatMessage.execute(data);
            });
            this.socket.on("UserJoin", (data) => {
                this.onChatUserJoin.execute(data.id, data.username, data);
            });
            this.socket.on("UserLeave", (data) => {
                this.onChatUserLeave.execute(data.id, data.username, data);
            });
            this.socket.on("ClearMessages", (data) => {
                this.onChatClearMessages.execute(data);
            });
            this.socket.on("DeleteMessage", (data) => {
                this.onChatDeleteMessage.execute(data);
            });
            this.socket.on("PurgeMessage", (data) => {
                this.onChatPurgeMessage.execute(data);
            });
            this.socket.on("UserUpdate", (data) => {
                this.onChatUserUpdate.execute(data);
            });
            // Handle errors
            this.socket.on("error", error => {
                console.error("Socket error", error);
            });
            yield this.socket.auth(this.channelID, userInfo.id, body.authkey);
            console.log("Login successful");
            this.onBotReady.execute(this.client);
            this.startCommandQueue();
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = undefined;
            this.socket.removeAllListeners();
            this.socket.close();
            clearInterval(this.commandQueueInterval);
            return true;
        });
    }
}
exports.ChatWrapper = ChatWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhdFdyYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvQ2hhdFdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLCtDQUFnRDtBQUNoRCxzREFBdUQ7QUFLdkQsZ0RBQTZDO0FBZTdDO0lBMEJDLFlBQVksU0FBaUIsRUFBRSxTQUFpQixFQUFFLFdBQW1CLEVBQUUsWUFBb0I7UUFoQjNGLHFDQUFxQztRQUM3QixpQkFBWSxHQUFlLEVBQUUsQ0FBQztRQUd0QyxtQkFBYyxHQUE2RSxJQUFJLGFBQUssRUFBTyxDQUFDO1FBQzVHLG9CQUFlLEdBQTZFLElBQUksYUFBSyxFQUFPLENBQUM7UUFFN0csd0JBQW1CLEdBQTZDLElBQUksYUFBSyxFQUFPLENBQUM7UUFDakYsd0JBQW1CLEdBQThDLElBQUksYUFBSyxFQUFPLENBQUM7UUFDbEYsdUJBQWtCLEdBQTZDLElBQUksYUFBSyxFQUFPLENBQUM7UUFDaEYscUJBQWdCLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFNUUsa0JBQWEsR0FBdUMsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUVyRSxlQUFVLEdBQXdDLElBQUksYUFBSyxFQUFPLENBQUM7UUFHbEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7SUFDbEMsQ0FBQztJQUVELCtDQUErQztJQUN2QyxVQUFVLENBQUMsQ0FBVyxFQUFFLFlBQXFCLEtBQUs7UUFDekQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLENBQUM7SUFDRixDQUFDO0lBRUQsNkJBQTZCO0lBQzdCLGVBQWUsQ0FBQyxPQUFlLEVBQUUsWUFBcUIsS0FBSztRQUMxRCxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNO2dCQUMvQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssMkNBQTJDLElBQUksTUFBTSxLQUFLLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztvQkFDL0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEdBQUcsTUFBTSxDQUFDLENBQUM7Z0JBQ3BELENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsR0FBRyxNQUFNLENBQUMsQ0FBQztnQkFDcEUsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUVELE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBWTtRQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxlQUFlLENBQUMsSUFBWSxFQUFFLE9BQWUsRUFBRSxZQUFxQixLQUFLO1FBQ3hFLElBQUksR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNO2dCQUN6RCxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssMkNBQTJDLElBQUksTUFBTSxLQUFLLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztvQkFDL0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixHQUFHLE1BQU0sQ0FBQyxDQUFDO2dCQUNwRCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLEdBQUcsTUFBTSxDQUFDLENBQUM7Z0JBQ3BFLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRCw0Q0FBNEM7SUFDNUMsYUFBYSxDQUFDLEVBQVU7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNO1lBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsaUVBQWlFO0lBQ2pFLGlCQUFpQjtRQUNoQixVQUFVLENBQUM7WUFDVixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFFcEIsOEVBQThFO1lBQzlFLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxXQUFXLENBQUM7Z0JBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNqQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNuQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUNSLEVBQUUsRUFBRSxDQUFDO3dCQUNMLE9BQU8sR0FBRyxJQUFJLENBQUM7b0JBQ2hCLENBQUM7b0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDOUIsT0FBTyxHQUFHLEtBQUssQ0FBQztvQkFDakIsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUVLLEtBQUs7O1lBQ1YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBRS9CLG9FQUFvRTtZQUNwRSxtRUFBbUU7WUFDbkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRTtnQkFDeEIsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN4QixNQUFNLEVBQUU7b0JBQ1AsTUFBTSxFQUFFLElBQUksQ0FBQyxXQUFXO29CQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7aUJBQzFCO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBRXZDLGtEQUFrRDtZQUNsRCxJQUFJLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztZQUNoQyxJQUFJLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFL0QsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQztZQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFFekMsa0JBQWtCO1lBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXBELDZCQUE2QjtZQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFpQjtnQkFDL0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUVkLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3RELElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RDLENBQUM7Z0JBRUQsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVuQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFFakIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJO2dCQUMvQixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJO2dCQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUQsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUF1QjtnQkFDdkQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUk7Z0JBQ3BDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJO2dCQUNuQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSTtnQkFDakMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztZQUlILGdCQUFnQjtZQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSztnQkFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRWhDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVyQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO0tBQUE7SUFFSyxJQUFJOztZQUNULElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1lBRXhCLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRXBCLGFBQWEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2IsQ0FBQztLQUFBO0NBQ0Q7QUFqTUQsa0NBaU1DIn0=