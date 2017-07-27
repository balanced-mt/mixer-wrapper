
import BeamClient = require("beam-client-node");
import BeamSocket = require("beam-client-node/lib/ws");

// Internal Objects for Beam Module
import * as Chat from "beam-client-node/defs/chat";

import { Event } from "./common/utils/Event";

export interface ChatClearMessages {
	clearer: {
		user_name: string;
		user_id: number;
		user_roles: string[];
		user_level: number;
	};
}

export interface ChatMessage extends Chat.ChatMessage {
	text: string
}

export class ChatWrapper {
	// Beam-Client Socket
	private client: BeamClient;
	private socket: BeamSocket;

	private channelID: number;
	private client_id: string;
	private accessToken: string;
	private tokenExpires: number;

	// The current outgoing command queue
	private commandQueue: Function[] = [];
	private commandQueueInterval: NodeJS.Timer;

	onChatUserJoin: Event<(id: number, username: string, data: Chat.UserConnection) => void> = new Event<any>();
	onChatUserLeave: Event<(id: number, username: string, data: Chat.UserConnection) => void> = new Event<any>();

	onChatClearMessages: Event<(data: ChatClearMessages) => void> = new Event<any>();
	onChatDeleteMessage: Event<(data: Chat.DeleteMessage) => void> = new Event<any>();
	onChatPurgeMessage: Event<(data: Chat.PurgeMessage) => void> = new Event<any>();
	onChatUserUpdate: Event<(data: Chat.UserUpdate) => void> = new Event<any>();

	onChatMessage: Event<(data: ChatMessage) => void> = new Event<any>();

	onBotReady: Event<(client: BeamClient) => void> = new Event<any>();

	constructor(channelID: number, client_id: string, accessToken: string, tokenExpires: number) {
		this.channelID = channelID;
		this.client_id = client_id;
		this.accessToken = accessToken;
		this.tokenExpires = tokenExpires;
	}

	// Add an outgoing command to the command-queue
	private addToQueue(f: Function, pushFront: boolean = false) {
		if (pushFront) {
			this.commandQueue.unshift(f);
		} else {
			this.commandQueue.push(f);
		}
	}

	// Send a global chat message
	sendChatMessage(message: string, pushFront: boolean = false) {
		this.addToQueue(() => {
			this.socket.call("msg", [message]).catch((reason) => {
				if (reason === "Please wait before sending more messages." || reason === "Please wait a moment before sending more messages.") {
					this.sendChatMessage(message, true);
					console.log("Re-queing message to chat " + reason);
				} else {
					console.log("Error Sending Message to chat for reason: " + reason);
				}
			});
		}, pushFront);
	}

	static CleanUsername(name: string) {
		return name.replace("@", "");
	}

	// Send a message to a particular user
	sendUserMessage(user: string, message: string, pushFront: boolean = false) {
		user = ChatWrapper.CleanUsername(user);

		this.addToQueue(() => {
			this.socket.call("whisper", [user, message]).catch((reason) => {
				if (reason === "Please wait before sending more messages." || reason === "Please wait a moment before sending more messages.") {
					this.sendUserMessage(user, message, true);
					console.log("Re-queing message to user " + reason);
				} else {
					console.log("Error Sending Message to user for reason: " + reason);
				}
			});
		}, pushFront);
	}

	// Remove a particular message from the chat
	removeMessage(id: string) {
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
					} else if (hasFunc) {
						console.log("Queue is Empty");
						hasFunc = false;
					}
				}
			}, 100);
		}, 1000);
	}

	async start() {
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
		let currentUser = await this.client.request("GET", `users/current`, {});
		let userInfo = currentUser.body;
		let joinResponse = await this.client.chat.join(this.channelID);

		const body = joinResponse.body;
		console.log("Bot: Creating Chat Socket");

		// Chat connection
		this.socket = new BeamSocket(body.endpoints).boot();

		// React to our !pong command
		this.socket.on("ChatMessage", (data: ChatMessage) => {
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

		this.socket.on("ClearMessages", (data: ChatClearMessages) => {
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
		await this.socket.auth(this.channelID, userInfo.id, body.authkey);
		console.log("Login successful");

		this.onBotReady.execute(this.client);

		this.startCommandQueue();
	}

	async stop() {
		this.client = undefined;

		this.socket.removeAllListeners();
		this.socket.close();

		clearInterval(this.commandQueueInterval);
		return true;
	}
}