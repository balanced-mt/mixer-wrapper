
import BeamClient = require("beam-client-node");

import { Event } from "./common/utils/Event";


export class ClientWrapper {
	// Beam-Client Socket
	private client: BeamClient;

	private channelID: number;
	private client_id: string;
	private accessToken: string;
	private tokenExpires: number;

	constructor(channelID: number, client_id: string, accessToken: string, tokenExpires: number) {
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
	public async areMods(userIDs: number[]): Promise<{ [K: number]: boolean }> {
		let out: { [K: string]: boolean } = {};
		try {
			while (userIDs.length > 0) {
				let currentIDs = userIDs.splice(0, 100);
				let response = await this.client.request('GET', `channels/${this.channelID}/users/mod`, {
					qs: {
						where: "id:in:" + currentIDs.join(";"),
						limit: 100
					}
				});
				response.body.forEach((data: { id: number, groups: { name: string }[] }) => {
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
		} catch (err) {
			console.error(`GET /channels/${this.channelID}/users/mod`, err);
		}
		return out;
	}

	/**
	 * Returns a promise that will resolve to either true or false depending on if user with userID is a mod or not.
	 */
	public async isMod(userID: number) {
		return (await this.areMods([userID]))[userID] === true;
	}

	/**
	 * Returns a promise that will resolve to an object that will contain userID to true mappings for each subscriber.
	 * 
	 * The object will only include subscribers.
	 */
	public async areSubscribers(userIDs: number[]): Promise<{ [K: number]: boolean }> {
		let out: { [K: string]: boolean } = {};
		try {
			while (userIDs.length > 0) {
				let currentIDs = userIDs.splice(0, 100);
				let response = await this.client.request('GET', `channels/${this.channelID}/users/subscriber`, {
					qs: {
						where: "id:in:" + currentIDs.join(";"),
						limit: 100
					}
				});
				response.body.forEach((data: { id: number, groups: { name: string }[] }) => {
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
		} catch (err) {
			console.error(`GET /channels/${this.channelID}/users/subscriber`, err);
		}
		return out;
	}

	/**
	 * Returns a promise that will resolve to either true or false depending on if user with userID is a subscriber or not.
	 */
	public async isSubscriber(userID: number) {
		return (await this.areSubscribers([userID]))[userID] === true;
	}

	/**
	 * Returns a promise that will resolve to an object that will contain userID to true mappings for each follower.
	 * 
	 * The object will only include followers.
	 */
	public async areFollowers(userIDs: number[]): Promise<{ [K: number]: boolean }> {
		let out: { [K: string]: boolean } = {};
		try {
			while (userIDs.length > 0) {
				let currentIDs = userIDs.splice(0, 100);
				let response = await this.client.request('GET', `/channels/${this.channelID}/follow`, {
					qs: {
						where: "id:in:" + currentIDs.join(";"),
						fields: "id,followed",
						limit: 100
					}
				});
				response.body.forEach((data: { followed: { user: number }, channel: { token: string } }) => {
					if (data.followed) {
						out[data.followed.user] = true;
					}
				});
			}
		} catch (err) {
			console.error(`GET /channels/${this.channelID}/follow`, err);
		}
		return out;
	}

	/**
	 * Returns a promise that will resolve to either true or false depending on if user with userID is a follower or not.
	 */
	public async isFollower(userID: number) {
		return (await this.areFollowers([userID]))[userID] === true;
	}

}