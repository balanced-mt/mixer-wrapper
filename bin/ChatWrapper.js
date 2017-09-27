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
        this.onChatTimeout = new Event_1.Event();
        /**
         * Event called when user is updated.
         */
        this.onChatUserUpdate = new Event_1.Event();
        /**
         * Event called when bot receives a new message.
         */
        this.onChatMessage = new Event_1.Event();
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
                this.onChatTimeout.execute(data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhdFdyYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvQ2hhdFdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLCtDQUFnRDtBQUNoRCxzREFBdUQ7QUFLdkQsZ0RBQTZDO0FBZTdDO0lBNkRDLFlBQVksU0FBaUIsRUFBRSxTQUFpQixFQUFFLFdBQW1CLEVBQUUsWUFBb0I7UUFuRDNGLHFDQUFxQztRQUM3QixpQkFBWSxHQUFlLEVBQUUsQ0FBQztRQUd0Qzs7V0FFRztRQUNILG1CQUFjLEdBQTZFLElBQUksYUFBSyxFQUFPLENBQUM7UUFFNUc7O1dBRUc7UUFDSCxvQkFBZSxHQUE2RSxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTdHOztXQUVHO1FBQ0gsd0JBQW1CLEdBQTZDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFakY7O1dBRUc7UUFDSCx3QkFBbUIsR0FBOEMsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUVsRjs7OztXQUlHO1FBQ0gsdUJBQWtCLEdBQTZDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFaEY7O1dBRUc7UUFDSCxrQkFBYSxHQUE0QyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRTFFOztXQUVHO1FBQ0gscUJBQWdCLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFNUU7O1dBRUc7UUFDSCxrQkFBYSxHQUF1QyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRXJFOztXQUVHO1FBQ0gsZUFBVSxHQUF3QyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBR2xFLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7T0FFRztJQUNLLFVBQVUsQ0FBQyxDQUFXLEVBQUUsWUFB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