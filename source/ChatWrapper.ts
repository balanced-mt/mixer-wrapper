import {
	Client as MixerClient,
	Socket as MixerSocket,
	DefaultRequestRunner,
	OAuthProvider,
	ChatService,
	IChatMessage,
	IDeleteMessage,
	IPurgeMessage,
	IUserUpdate,
	IUserConnection,
	IPollEvent,
	IUserTimeout
} from "beam-client-node";
import * as ws from "ws";

import { Event } from "./common/utils/Event";

export interface ChatClearMessages {
	clearer: {
		user_name: string;
		user_id: number;
		user_roles: string[];
		user_level: number;
	};
}


export class ChatWrapper {
	// Beam-Client Socket
	private client?: MixerClient;
	private socket?: MixerSocket;

	private channelID: number;
	private client_id: string;
	private accessToken: string;
	private tokenExpires: number;

	// The current outgoing command queue
	private commandQueue: Function[] = [];
	private commandQueueInterval: NodeJS.Timer;

	/**
	 * Event called when new user joins the chat.
	 */
	onChatUserJoin: Event<(id: number, username: string, data: IUserConnection) => void> = new Event<any>();

	/**
	 * Event called when user leaves the chat.
	 */
	onChatUserLeave: Event<(id: number, username: string, data: IUserConnection) => void> = new Event<any>();

	/**
	 * Event called when chat is cleared.
	 */
	onChatClearMessages: Event<() => void> = new Event<any>();

	/**
	 * Event called when message is deleted.
	 */
	onChatDeleteMessage: Event<(data: IDeleteMessage) => void> = new Event<any>();

	/**
	 * Event called when messages from a specific user are purged.
	 * 
	 * Example: when user gets timed out or banned.
	 */
	onChatPurgeMessage: Event<(data: IPurgeMessage) => void> = new Event<any>();

	/**
	 * Event called when a user is timed out from chat
	 */
	onChatUserTimeout: Event<(data: IUserTimeout) => void> = new Event<any>();

	/**
	 * Event called when user is updated.
	 */
	onChatUserUpdate: Event<(data: IUserUpdate) => void> = new Event<any>();

	/**
	 * Event called when bot receives a new message.
	 */
	onChatMessage: Event<(data: IChatMessage & { text: string }) => void> = new Event<any>();

	/**
	 * Called when a chat poll is started
	 */
	onPollStart: Event<(data: IPollEvent) => void> = new Event<any>();

	/**
	 * Called when a chat poll ends
	 */
	onPollEnd: Event<(data: IPollEvent) => void> = new Event<any>();

	/**
	 * Event called the ChatWrapper is ready.
	 */
	onBotReady: Event<(client: MixerClient) => void> = new Event<any>();

	constructor(channelID: number, client_id: string, accessToken: string, tokenExpires: number) {
		this.channelID = channelID;
		this.client_id = client_id;
		this.accessToken = accessToken;
		this.tokenExpires = tokenExpires;
	}

	/**
	 * Add an outgoing command to the command-queue
	 */
	private addToQueue(f: Function, pushFront: boolean = false) {
		if (pushFront) {
			this.commandQueue.unshift(f);
		} else {
			this.commandQueue.push(f);
		}
	}

	/**
	 * Send a global chat message
	 */
	sendChatMessage(message: string, pushFront: boolean = false) {
		this.addToQueue(() => {
			this.socket.call("msg", [message]).catch((reason) => {
				if (reason === "Please wait before sending more messages." || reason === "Please wait a moment before sending more messages.") {
					this.sendChatMessage(message, true);
					console.log("Re-queuing message to chat " + reason);
				} else {
					console.log("Error Sending Message to chat for reason: " + reason);
				}
			});
		}, pushFront);
	}

	static CleanUsername(name: string) {
		return name.replace("@", "");
	}

	/**
	 * Send a message to a particular user
	 */
	sendUserMessage(user: string, message: string, pushFront: boolean = false) {
		user = ChatWrapper.CleanUsername(user);

		this.addToQueue(() => {
			this.socket.call("whisper", [user, message]).catch((reason) => {
				if (reason === "Please wait before sending more messages." || reason === "Please wait a moment before sending more messages.") {
					this.sendUserMessage(user, message, true);
					console.log("Re-queuing message to user " + reason);
				} else {
					console.log("Error Sending Message to user for reason: " + reason);
				}
			});
		}, pushFront);
	}

	/**
	 * Remove a particular message from the chat
	 */
	removeMessage(id: string) {
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
					} else if (hasFunc) {
						console.log("Queue is Empty");
						hasFunc = false;
					}
				}
			}, 100);
		}, 1000);
	}

	async start() {
		this.client = new MixerClient(new DefaultRequestRunner());

		// With OAuth we don"t need to login, the OAuth Provider will attach
		// the required information to all of our requests after this call.
		console.log("Bot: Setting up OAUTH");
		this.client.use(new OAuthProvider(this.client, {
			clientId: this.client_id,
			tokens: {
				access: this.accessToken,
				expires: <any>this.tokenExpires
			}
		}));

		console.log("Bot: Connecting to Beam");

		// Get"s the user we have access to with the token
		let currentUser = await this.client.request<any>("GET", `users/current`, {});
		let userInfo = currentUser.body;
		let chat = new ChatService(this.client);
		let joinResponse = await chat.join(this.channelID);

		const body = joinResponse.body;
		console.log("Bot: Creating Chat Socket");

		// Chat connection
		this.socket = new MixerSocket(<any>ws, body.endpoints, {
			clientId: this.client_id,
			pingInterval: 15 * 1000, //default
			pingTimeout: 5 * 1000, //default
			callTimeout: 20 * 1000 //default
		}).boot();

		// React to our !pong command
		this.socket.on("ChatMessage", (data: IChatMessage & { text: string }) => {
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
		})

		this.socket.on("UserUpdate", (data) => {
			this.onChatUserUpdate.execute(data);
		});



		// Handle errors
		try {
			await
				Promise.race(
					[
						new Promise<void>((resolve, reject) => {
							(<MixerSocket>this.socket).on("error", err => { reject(err); });
						}),
						this.socket.auth(this.channelID, userInfo.id, body.authkey)
					]
				);
		} catch (err) {
			throw err;
		}
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