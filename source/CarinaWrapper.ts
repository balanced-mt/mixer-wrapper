
import { Carina } from "../carina/dist/commonjs";
import * as CarinaInterface from "./CarinaInterface";
import { Event } from "./common/utils/Event";
import { Utils } from "./common/utils/Utils";

import * as ws from "ws";
Carina.WebSocket = ws;

export class CarinaWrapper {

	private ca: Carina;

	/**
	 * Event called when viewer follows the channel.
	 */
	onFollowEvent: Event<(data: CarinaInterface.ChannelFollowed) => void> = new Event<any>();

	/**
	 * Event called when viewer unfollows the channel.
	 */
	onUnfollowEvent: Event<(data: CarinaInterface.ChannelFollowed) => void> = new Event<any>();

	/**
	 * Event called when viewer subscribes the channel.
	 */
	onSubscribeEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void> = new Event<any>();

	/**
	 * Event called when viewer resubscribes the channel.
	 */
	onResubscribeEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void> = new Event<any>();

	/**
	 * Event called when viewer shares the resubscription.
	 */
	onSubscribeShareEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void> = new Event<any>();

	/**
	 * Event called when the channel data updates.
	 * 
	 * Contains partial update data!
	 */
	onChannelUpdateEvent: Event<(data: CarinaInterface.ChannelUpdate) => void> = new Event<any>();

	/**
	 * Event called when the total number of viewers updates.
	 */
	onViewersTotalUpdateEvent: Event<(data: number) => void> = new Event<any>();

	/**
	 * Event called when the current number of viewers updates.
	 */
	onViewersCurrentUpdateEvent: Event<(data: number) => void> = new Event<any>();

	/**
	 * Event called when the total number of followers updates.
	 */
	onNumFollowersUpdateEvent: Event<(data: number) => void> = new Event<any>();

	/**
	 * Event called when audience updates.
	 */
	onAudienceUpdateEvent: Event<(data: "family" | "teen" | "18+") => void> = new Event<any>();

	/**
	 * Event called when viewer hosts the channel.
	 */
	onHostEvent: Event<(data: CarinaInterface.ChannelHosted) => void> = new Event<any>();

	/**
	 * Event called when a channel goes live
	 */
	onChannelGoLive: Event<() => void> = new Event<any>();

	/**
	* Event called when a channel goes offline
	*/
	onChannelGoOffline: Event<() => void> = new Event<any>();

	/**
	 * Event called when a channel game changes
	 */
	onGameChange: Event<(data: CarinaInterface.GameType) => void> = new Event<any>();

	async start(channelID: number) {
		this.ca = new Carina({
			isBot: true
			//replyTimeout: 3000
		}).open();

		this.ca.on("error", (err: any) => {
			console.log("[Carina] error: " + err);
		});

		this.ca.on("warning", (err: any) => {
			console.log("[Carina] warning: " + err);
		});

		this.ca.subscribe<CarinaInterface.ChannelFollowed>(`channel:${channelID}:followed`, data => {
			if (data.following) {
				this.onFollowEvent.execute(data);
			} else {
				this.onUnfollowEvent.execute(data);
			}
		});

		this.ca.subscribe<CarinaInterface.ChannelSubscribed>(`channel:${channelID}:subscribed`, data => {
			this.onSubscribeEvent.execute(data);
		});
		this.ca.subscribe<CarinaInterface.ChannelSubscribed>(`channel:${channelID}:resubscribed`, data => {
			this.onResubscribeEvent.execute(data);
		});
		this.ca.subscribe<CarinaInterface.ChannelSubscribed>(`channel:${channelID}:resubShared`, data => {
			this.onSubscribeShareEvent.execute(data);
		});

		this.ca.subscribe<CarinaInterface.ChannelHosted>(`channel:${channelID}:hosted`, data => {
			this.onHostEvent.execute(data);
		});

		this.ca.subscribe<CarinaInterface.ChannelUpdate>(`channel:${channelID}:update`, data => {
			this.onChannelUpdateEvent.execute(data);

			if (data.online !== undefined) {
				if (data.online) {
					this.onChannelGoLive.execute();
				} else {
					this.onChannelGoOffline.execute();
				}
			}

			if (data.type !== undefined) {
				this.onGameChange.execute({
					id: data.type.id,
					name: data.type.name,
					parent: data.type.parent,
					description: data.type.description,
					source: data.type.source,
					viewersCurrent: data.type.viewersCurrent,
					coverUrl: data.type.coverUrl,
					backgroundUrl: data.type.backgroundUrl,
					online: data.type.online,
					availableAt: data.type.availableAt
				});
			}

			if (data.viewersTotal !== undefined) {
				this.onViewersTotalUpdateEvent.execute(data.viewersTotal);
			}
			if (data.viewersCurrent !== undefined) {
				this.onViewersCurrentUpdateEvent.execute(data.viewersCurrent);
			}
			if (data.numFollowers !== undefined) {
				this.onNumFollowersUpdateEvent.execute(data.numFollowers);
			}
			if (data.audience !== undefined) {
				this.onAudienceUpdateEvent.execute(data.audience);
			}
		});

		await Utils.Timeout(100);

		return true;
	}

	async stop() {
		this.ca.close();
		this.ca.removeAllListeners();
		this.ca = undefined;
		return true;
	}
}