export interface ChannelUpdate {
	online?: boolean;
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