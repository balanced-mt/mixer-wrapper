
import { Carina } from "../carina/dist/commonjs";
import * as CarinaInterface from "./CarinaInterface";
import { Event } from "./common/utils/Event";
import { Utils } from "./common/utils/Utils";

import * as ws from "ws";
Carina.WebSocket = ws;

export class CarinaWrapper {

	private ca: Carina;

	onFollowEvent: Event<(data: CarinaInterface.ChannelFollowed) => void> = new Event<any>();
	onUnfollowEvent: Event<(data: CarinaInterface.ChannelFollowed) => void> = new Event<any>();

	onSubscribeEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void> = new Event<any>();
	onResubscribeEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void> = new Event<any>();
	onSubscribeShareEvent: Event<(data: CarinaInterface.ChannelSubscribed) => void> = new Event<any>();

	onHostEvent: Event<(data: CarinaInterface.ChannelHosted) => void> = new Event<any>();

	
	async start(channelID:number) {
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