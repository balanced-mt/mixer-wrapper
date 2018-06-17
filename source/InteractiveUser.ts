import {
	IParticipant
} from "beam-interactive-node2";

import { Event } from "./common/utils/Event";

import { InteractiveWrapper } from "./InteractiveWrapper";
import { InteractiveGroup } from "./InteractiveGroup";

export class InteractiveUser {
	public readonly wrapper: InteractiveWrapper;
	protected readonly internal: IParticipant & { userID: number; username: string; };

	private data = new Map<string, { [K: string]: any }>();

	public readonly onLeaveEvent: Event<() => void> = new Event<any>();

	constructor(wrapper: InteractiveWrapper) {
		this.wrapper = wrapper;
	}

	async setParticipant(participant: IParticipant, update?: boolean) {
		(this as any).internal = participant;

		if (this.internal.userID === undefined || this.internal.username === undefined) {
			throw new Error("[InteractiveUser::setupInternal] userID or username is undefined");
		}

		this.setupInternal();

		if (update === true) {
			this.setGroup(this.wrapper.getGroup(this.internal.groupID));
		} else if (this.group) {
			if (this.group.isValid && this.group.id !== participant.groupID) {
				this.wrapper.moveUsers([this], this.group);
			}
		}
	}

	removeParticipant(sessionID: string) {
		if (this.internal && this.internal.sessionID === sessionID) {
			(this as any).internal = undefined;
			this.onLeaveEvent.execute();
			return true;
		}
		return false;
	}

	/**
	 * [Property][Readonly] Returns true is the user is still connected
	 */
	get connected() {
		return this.internal !== undefined;
	}

	/**
	 * [Property][Readonly] Returns userID
	 */
	get userID() {
		return this._userID;
	}

	/**
	 * [Property][Readonly] Returns username
	 */
	get username() {
		return (this.internal !== undefined ? this.internal.username : this._username);
	}

	/**
	 * [Property][Readonly] Returns sessionID
	 */
	get sessionID() {
		return (this.internal !== undefined ? this.internal.sessionID : undefined);
	}

	getData(name: string) {
		let data = this.data.get(name);
		if (data === undefined) {
			data = {};
			this.data.set(name, data);
		}
		return data;
	}

	removeData(name: string) {
		let data = this.data.get(name);
		if (data === undefined) {
			data = {};
			this.data.set(name, data);
		}
		return data;
	}

	/**
	 * Moves the user to a new InteractiveGroup.
	 * 
	 * Returns a promise which will resolve after the user is moved
	 */
	async move(group: InteractiveGroup) {
		if (this.connected) {
			return this.wrapper.moveUsers([this], group);
		} else {
			this.setGroup(group);
			return;
		}
	}

	/**********************************************************************/

	protected _userID: number;
	protected _username: string;
	protected _group: InteractiveGroup;

	get group() {
		return this._group;
	}

	private setGroup(group: InteractiveGroup) {
		if (this._group !== group) {
			if (this._group) {
				this._group.removeUser(this);
			}
			this._group = group;
			if (this.group) {
				this.group.addUser(this);
			}
		}
	}

	setupInternal() {
		this._userID = this.internal.userID;
		this._username = this.internal.username;
	}

}