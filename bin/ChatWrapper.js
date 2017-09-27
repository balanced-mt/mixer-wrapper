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
        /**
         * Event called when new user joins the chat.
         */
        this.onChatUserJoin = new Event_1.Event();
        /**
         * Event called when user leaves the chat.
         */
        this.onChatUserLeave = new Event_1.Event();
        /**
         * Event called when chat is cleared.
         */
        this.onChatClearMessages = new Event_1.Event();
        /**
         * Event called when message is deleted.
         */
        this.onChatDeleteMessage = new Event_1.Event();
        /**
         * Event called when messages from a specific user are purged.
         *
         * Example: when user gets timed out or banned.
         */
        this.onChatPurgeMessage = new Event_1.Event();
        /**
         * Event called when a user is timed out from chat
         */
        this.onChatUserTimeout = new Event_1.Event();
        /**
         * Event called when user is updated.
         */
        this.onChatUserUpdate = new Event_1.Event();
        /**
         * Event called when bot receives a new message.
         */
        this.onChatMessage = new Event_1.Event();
        /**
         * Called when a chat poll is started
         */
        this.onPollStart = new Event_1.Event();
        /**
         * Called when a chat poll ends
         */
        this.onPollEnd = new Event_1.Event();
        /**
         * Event called the ChatWrapper is ready.
         */
        this.onBotReady = new Event_1.Event();
        this.channelID = channelID;
        this.client_id = client_id;
        this.accessToken = accessToken;
        this.tokenExpires = tokenExpires;
    }
    /**
     * Add an outgoing command to the command-queue
     */
    addToQueue(f, pushFront = false) {
        if (pushFront) {
            this.commandQueue.unshift(f);
        }
        else {
            this.commandQueue.push(f);
        }
    }
    /**
     * Send a global chat message
     */
    sendChatMessage(message, pushFront = false) {
        this.addToQueue(() => {
            this.socket.call("msg", [message]).catch((reason) => {
                if (reason === "Please wait before sending more messages." || reason === "Please wait a moment before sending more messages.") {
                    this.sendChatMessage(message, true);
                    console.log("Re-queuing message to chat " + reason);
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
    /**
     * Send a message to a particular user
     */
    sendUserMessage(user, message, pushFront = false) {
        user = ChatWrapper.CleanUsername(user);
        this.addToQueue(() => {
            this.socket.call("whisper", [user, message]).catch((reason) => {
                if (reason === "Please wait before sending more messages." || reason === "Please wait a moment before sending more messages.") {
                    this.sendUserMessage(user, message, true);
                    console.log("Re-queuing message to user " + reason);
                }
                else {
                    console.log("Error Sending Message to user for reason: " + reason);
                }
            });
        }, pushFront);
    }
    /**
     * Remove a particular message from the chat
     */
    removeMessage(id) {
        this.socket.call("deleteMessage", [id]).catch((reason) => {
            console.log("Delete Message Error: " + reason);
        });
    }
    /**
     * Start processing the command queue to funnel outgoing messages
     */
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
            this.socket.on("PollStart", (data) => {
                this.onPollStart.execute(data);
            });
            this.socket.on("PollEnd", (data) => {
                this.onPollEnd.execute(data);
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
            this.socket.on("UserTimeout", (data) => {
                this.onChatUserTimeout.execute(data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhdFdyYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvQ2hhdFdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLCtDQUFnRDtBQUNoRCxzREFBdUQ7QUFLdkQsZ0RBQTZDO0FBZTdDO0lBdUVDLFlBQVksU0FBaUIsRUFBRSxTQUFpQixFQUFFLFdBQW1CLEVBQUUsWUFBb0I7UUE3RDNGLHFDQUFxQztRQUM3QixpQkFBWSxHQUFlLEVBQUUsQ0FBQztRQUd0Qzs7V0FFRztRQUNILG1CQUFjLEdBQTZFLElBQUksYUFBSyxFQUFPLENBQUM7UUFFNUc7O1dBRUc7UUFDSCxvQkFBZSxHQUE2RSxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTdHOztXQUVHO1FBQ0gsd0JBQW1CLEdBQTZDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFakY7O1dBRUc7UUFDSCx3QkFBbUIsR0FBOEMsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUVsRjs7OztXQUlHO1FBQ0gsdUJBQWtCLEdBQTZDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFaEY7O1dBRUc7UUFDSCxzQkFBaUIsR0FBNEMsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUU5RTs7V0FFRztRQUNILHFCQUFnQixHQUEyQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTVFOztXQUVHO1FBQ0gsa0JBQWEsR0FBdUMsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUVyRTs7V0FFRztRQUNILGdCQUFXLEdBQTBDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFdEU7O1dBRUc7UUFDSCxjQUFTLEdBQTBDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFcEU7O1dBRUc7UUFDSCxlQUFVLEdBQXdDLElBQUksYUFBSyxFQUFPLENBQUM7UUFHbEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FB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