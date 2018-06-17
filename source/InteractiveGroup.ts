import {
	IGroup
} from "beam-interactive-node2";

import { Event } from "./common/utils/Event";

import { InteractiveWrapper } from "./InteractiveWrapper";
import { InteractiveScene } from "./InteractiveScene";
import { InteractiveUser } from "./InteractiveUser";

export class InteractiveGroup {

	public readonly wrapper: InteractiveWrapper;
	private internal?: IGroup;
	public readonly id?: string;
	public readonly temporary: boolean;
	public readonly scene: InteractiveScene;
	// protected readonly internal: ?;
	private userMap: Map<number, InteractiveUser> = new Map();

	public readonly onUserEnterEvent: Event<(user: InteractiveUser) => void> = new Event<any>();
	public readonly onUserLeaveEvent: Event<(user: InteractiveUser) => void> = new Event<any>();

	constructor(wrapper: InteractiveWrapper, scene: InteractiveScene, id?: string) {
		this.wrapper = wrapper;
		this.id = id;
		this.scene = scene;
		this.temporary = (id === undefined);
	}

	async destroy() {
		for (var [key, user] of this.userMap) {
			await user.move(this.wrapper.defaultGroup);
		}
		this.userMap.clear();
		if (this.isValid) {
			this.internal = undefined;
			(this as any).id = undefined;
			this.onUserEnterEvent.clearCallbacks();
			this.onUserLeaveEvent.clearCallbacks();
		}
	}

	get isValid() {
		return this.internal !== undefined;
	}

	getUsers() {
		return this.userMap;
	}

	getUsersCount() {
		return this.userMap.size;
	}

	addUser(user: InteractiveUser) {
		if (!this.userMap.has(user.userID)) {
			this.userMap.set(user.userID, user);
			this.onUserEnterEvent.execute(user);
		}
	}

	removeUser(user: InteractiveUser) {
		if (this.userMap.delete(user.userID)) {
			if (user.connected) {
				this.onUserLeaveEvent.execute(user);
			}
		}
	}

	async move(scene: InteractiveScene) {
		(this as any).scene = scene;
		await this.wrapper.moveGroup(this, scene);
	}

	/**********************************************************************/
	beamGroupInit(internal: IGroup) {
		this.internal = internal;
		if (this.temporary) {
			(this as any).id = this.internal.groupID;
		}
	}

	beamGroupDestroy() {
		this.internal = undefined;
	}
}