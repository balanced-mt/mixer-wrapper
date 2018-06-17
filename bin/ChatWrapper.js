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
const ws = require("ws");
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
            this.client = new beam_client_node_1.Client(new beam_client_node_1.DefaultRequestRunner());
            // With OAuth we don"t need to login, the OAuth Provider will attach
            // the required information to all of our requests after this call.
            console.log("Bot: Setting up OAUTH");
            this.client.use(new beam_client_node_1.OAuthProvider(this.client, {
                clientId: this.client_id,
                tokens: {
                    access: this.accessToken,
                    expires: this.tokenExpires
                }
            }));
            console.log("Bot: Connecting to Beam");
            // Get"s the user we have access to with the token
            let currentUser = yield this.client.request("GET", `users/current`, {});
            let userInfo = currentUser.body;
            let chat = new beam_client_node_1.ChatService(this.client);
            let joinResponse = yield chat.join(this.channelID);
            const body = joinResponse.body;
            console.log("Bot: Creating Chat Socket");
            // Chat connection
            this.socket = new beam_client_node_1.Socket(ws, body.endpoints, {
                clientId: this.client_id,
                pingInterval: 15 * 1000,
                pingTimeout: 5 * 1000,
                callTimeout: 20 * 1000 //default
            }).boot();
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
            this.socket.on("ClearMessages", () => {
                this.onChatClearMessages.execute();
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
            try {
                yield Promise.race([
                    new Promise((resolve, reject) => {
                        this.socket.on("error", err => { reject(err); });
                    }),
                    this.socket.auth(this.channelID, userInfo.id, body.authkey)
                ]);
            }
            catch (err) {
                throw err;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhdFdyYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvQ2hhdFdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHVEQWEwQjtBQUMxQix5QkFBeUI7QUFFekIsZ0RBQTZDO0FBWTdDO0lBdUVDLFlBQVksU0FBaUIsRUFBRSxTQUFpQixFQUFFLFdBQW1CLEVBQUUsWUFBb0I7UUE3RDNGLHFDQUFxQztRQUM3QixpQkFBWSxHQUFlLEVBQUUsQ0FBQztRQUd0Qzs7V0FFRztRQUNILG1CQUFjLEdBQXlFLElBQUksYUFBSyxFQUFPLENBQUM7UUFFeEc7O1dBRUc7UUFDSCxvQkFBZSxHQUF5RSxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRXpHOztXQUVHO1FBQ0gsd0JBQW1CLEdBQXNCLElBQUksYUFBSyxFQUFPLENBQUM7UUFFMUQ7O1dBRUc7UUFDSCx3QkFBbUIsR0FBMEMsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUU5RTs7OztXQUlHO1FBQ0gsdUJBQWtCLEdBQXlDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFNUU7O1dBRUc7UUFDSCxzQkFBaUIsR0FBd0MsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUUxRTs7V0FFRztRQUNILHFCQUFnQixHQUF1QyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRXhFOztXQUVHO1FBQ0gsa0JBQWEsR0FBMkQsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUV6Rjs7V0FFRztRQUNILGdCQUFXLEdBQXNDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFbEU7O1dBRUc7UUFDSCxjQUFTLEdBQXNDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFaEU7O1dBRUc7UUFDSCxlQUFVLEdBQXlDLElBQUksYUFBSyxFQUFPLENBQUM7UUFHbkUsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FB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