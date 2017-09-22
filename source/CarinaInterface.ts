export interface ChannelUpdate {
	online?: boolean;
	featured?: boolean;
	featureLevel?: number;
	partnered?: boolean;
	audience?: "family" | "teen" | "18+";
	viewersTotal?: number;
	viewersCurrent?: number;
	numFollowers?: number;
}

export interface ChannelFollowed {
	following?: boolean;
	user?: {
		id: number;
		username: string;
	};
}

export interface ChannelSubscribed {
	user?: {
		username: string;
	};
	totalMonths?: number;
}

export interface ChannelHosted {
	hoster?: {
		token?: string;
	};
}