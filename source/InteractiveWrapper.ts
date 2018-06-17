import {
	GameClient,
	IParticipant,
	IScene,
	setWebSocket,
	IGroup,
} from "beam-interactive-node2";

import * as ws from "ws";
import { Event } from "./common/utils/Event";
import { InteractiveScene } from "./InteractiveScene";
import { InteractiveUser } from "./InteractiveUser";
import { InteractiveGroup } from "./InteractiveGroup";
import { Utils } from "./common/utils/Utils";
import { ISocketOptions } from "beam-interactive-node2/lib/wire/Socket";

setWebSocket(ws);

/*
Notes:
[Beam] Controls are not move-able and can only exist in a single place (1 control -> 1 scene)
Full restart (main)
Partial diffs would be pointless but we should be able to replace Scenes and Controls

[Wrapper] Controls can exist in multiple places (using multiple beam controls, 1 per scene)

Decorators magic?
*/

// TODO move
interface IUpdateParticipants {
	participants: {
		sessionID: string;
		groupID: string;
	}[];
}

export class InteractiveWrapper {

	readonly client: GameClient | undefined = undefined;

	readonly defaultScene: InteractiveScene = new InteractiveScene(this, "default", "default");
	readonly defaultGroup: InteractiveGroup = new InteractiveGroup(this, this.defaultScene, "default");


	private sceneMap: Map<string, InteractiveScene> = new Map();
	private groupMap: Map<string, InteractiveGroup> = new Map();
	private sessionMap: Map<string, InteractiveUser> = new Map();
	private userMap: Map<string, InteractiveUser> = new Map();
	private userIDMap: Map<number, InteractiveUser> = new Map();

	public readonly onInit: Event<() => void> = new Event<any>();
	public readonly onReady: Event<() => void> = new Event<any>();
	public readonly onUserJoin: Event<(user: InteractiveUser) => void> = new Event<any>();
	public readonly onUserLeave: Event<(user: InteractiveUser) => void> = new Event<any>();

	public readonly onStop: Event<() => void> = new Event<any>();

	private interval: NodeJS.Timer = undefined;

	authToken: string;
	versionID: number;
	sharecode: string | undefined;

	constructor(authToken: string, versionID: number, sharecode?: string) {
		this.authToken = authToken;
		this.versionID = versionID;
		this.sharecode = sharecode;
		this.addScene(this.defaultScene);
		this.addGroup(this.defaultGroup);

		setInterval(() => {
			this.update();
		}, 10);
	}

	private tempScenes: IScene[] = [];
	private tempScenesCount = 0;

	async addScene(scene: InteractiveScene) {
		if (this.sceneMap.has(scene.id)) {
			throw new Error(`[InteractiveWrapper:addScene] Scene '${scene.id}' already exists!`);
		}
		if (this.scenesInitialized) {
			let beamScene;
			if (scene.temporary === true) {
				beamScene = this.tempScenes.pop();
			}
			if (beamScene === undefined) {
				beamScene = await this.createScene(scene.temporary === false ? scene.id : "temp-" + (this.tempScenesCount++));
			}
			await scene.beamSceneInit(beamScene);
		}

		this.sceneMap.set(scene.id, scene);
	}

	async removeScene(scene: InteractiveScene) {
		if (scene.temporary === true) {
			let internal = (scene as any).internal;

			if (internal !== undefined) {
				this.sceneMap.delete(scene.id);

				await scene.destroy();
				this.tempScenes.unshift(internal);
			}
		} else {
			throw new Error("NYI");
		}
	}

	getScene(name: string) {
		return this.sceneMap.get(name);
	}

	/*async removeScene(scene: InteractiveScene) {
		await this.deleteScene(scene.id, "default");
		this.sceneMap.delete(scene.id);
	}*/

	private tempGroups: IGroup[] = [];
	private tempGroupsCount = 0;

	async addGroup(group: InteractiveGroup) {
		if (this.groupMap.has(group.id)) {
			throw new Error(`[InteractiveWrapper:addGroup] Group '${group.id}' already exists!`);
		}
		if (this.groupsInitialized) {
			let beamGroup;
			if (group.temporary === true) {
				beamGroup = this.tempGroups.pop();

				if (beamGroup !== undefined) {
					await this.updateGroup(beamGroup, group.scene.id);
				}
			}
			if (beamGroup === undefined) {
				beamGroup = await this.createGroup(group.temporary === false ? group.id : "temp-" + (this.tempGroupsCount++), group.scene.id);
			}
			await group.beamGroupInit(beamGroup);
		}

		this.groupMap.set(group.id, group);
	}

	async removeGroup(group: InteractiveGroup) {
		if (group.temporary === true) {
			let internal = (group as any).internal;
			if (internal !== undefined) {
				this.groupMap.delete(group.id);

				await group.destroy();
				this.tempGroups.unshift(internal);
			}
		} else {
			throw new Error("NYI");
		}
	}

	async moveGroup(group: InteractiveGroup, scene: InteractiveScene) {
		if (!this.groupMap.has(group.id)) {
			throw new Error(`[InteractiveWrapper:moveGroup] Group '${group.id}' doesn't exist!`);
		}
		if (this.groupsInitialized) {
			await this.updateGroup((group as any).internal, group.scene.id);
		}
		this.groupMap.set(group.id, group);
	}

	getGroup(name: string) {
		return this.groupMap.get(name);
	}

	async moveUsers(users: InteractiveUser[], group: InteractiveGroup, currentTry: number = 0) {
		return this.client.execute<IUpdateParticipants>(
			"updateParticipants",
			{ participants: users.map((user) => { return { sessionID: user.sessionID, groupID: group.id }; }) },
			false).then((users) => {
				users.participants.forEach((user: IParticipant) => {
					this.userIDMap.get(user.userID).setParticipant(user, true);
				});
			}).catch(async (err) => {
				if (this.client !== undefined && currentTry < 3) {
					await Utils.Timeout(1000 * (currentTry + 1));
					await this.moveUsers(users, group, currentTry + 1);
				} else {
					throw err;
				}
			});
	}

	findUser(username: string) {
		return this.userMap.get(username.toLowerCase());
	}

	getUser(participant: IParticipant) {
		return (participant !== undefined && participant.sessionID !== undefined) ? this.sessionMap.get(participant.sessionID) : undefined;
	}


	private clockDelta = 0;
	get now() {
		if (this.client && this.client.state) {
			if ((this.client.state as any).clockDelta !== 0) {
				this.clockDelta = (this.client.state as any).clockDelta;
			}
			return this.client.state.synchronizeLocalTime().getTime();
		} else if (this.clockDelta !== 0) {
			return new Date(Date.now() - this.clockDelta).getTime();
		} else {
			console.error("Clock not synced!");
			return undefined;
		}
	}


	/**********************************************************************/
	private scenesInitialized = false;
	private groupsInitialized = false;
	private async beamInit() {

		this.scenesInitialized = true;
		for (let [key, scene] of this.sceneMap) {
			let beamScene;
			if (scene.id === "default") {
				beamScene = this.client.state.getScene("default");
			} else {
				beamScene = await this.createScene(scene.id);
			}
			await scene.beamSceneInit(beamScene);
		}

		this.groupsInitialized = true;
		for (let [key, group] of this.groupMap) {
			let beamGroup;
			if (group.id === "default") {
				// await this.client.execute<any>("updateGroups", { "groups": [{ "sceneID": "default" }] }, false); // setup the default group
				beamGroup = this.client.state.getGroup("default");
				if (group.scene.id !== "default") {
					this.updateGroup(beamGroup, group.scene.id);
				}
			} else {
				beamGroup = await this.createGroup(group.id, group.scene.id);
			}
			group.beamGroupInit(beamGroup);
		}
	}

	private loggingEnabled = false;

	enableLogging() {
		if (this.client && !this.loggingEnabled) {
			this.client.on("message", InteractiveWrapper.logMessage);
			this.client.on("send", InteractiveWrapper.logSend);
		}
		this.loggingEnabled = true;
	}

	disableLogging() {
		if (this.client && this.loggingEnabled) {
			this.client.removeListener("message", InteractiveWrapper.logMessage);
			this.client.removeListener("send", InteractiveWrapper.logSend);
		}
		this.loggingEnabled = false;
	}

	static logMessage(message: any) {
		console.log("[InteractiveWrapper] <<<", message);
	}

	static logSend(message: any) {
		console.log("[InteractiveWrapper] >>>", message);
	}

	async start() {
		(this as any).client = new GameClient();

		if (this.loggingEnabled) {
			this.client.on("message", InteractiveWrapper.logMessage);
			this.client.on("send", InteractiveWrapper.logSend);
		}
		
		this.client.on('error', (err: any) => {
			console.error("[InteractiveWrapper] error ", err);
		});

		let delayedJoinEvents: IParticipant[] = [];
		let isReady = false;

		this.client.state.on('participantJoin', (participant: IParticipant) => {

			let user = this.userIDMap.get(participant.userID);
			if (user === undefined) {
				user = new InteractiveUser(this);

				this.userIDMap.set(participant.userID, user);
				this.userMap.set(participant.username.toLowerCase(), user);

				user.setParticipant(participant, true);
				this.sessionMap.set(participant.sessionID, user);
			} else {
				user.setParticipant(participant);
				this.sessionMap.set(participant.sessionID, user);
			}

			// console.log(`[InteractiveWrapper] ${participant.username}(${participant.sessionID}) Joined`);

			if (isReady) {
				this.onUserJoin.execute(user);
			} else {
				// if we are not ready delay!
				delayedJoinEvents.push(user);
			}
		});

		this.client.state.on('participantLeave', (sessionID: string) => {
			let user = this.sessionMap.get(sessionID);
			if (user !== undefined) {
				this.sessionMap.delete(sessionID);
				user.removeParticipant(sessionID);
				// console.log(`[InteractiveWrapper] ${sessionID} Left`);

				if (isReady) {
					this.onUserLeave.execute(user);
				} else {
					// if we are not ready remove
					const index = delayedJoinEvents.indexOf(user);
					delayedJoinEvents.splice(index, 1);
				}
			}
		});

		// Log when we're connected to interactive
		this.client.on('open', () => {
			(this.client as any).socket.options.autoReconnect = false;
			console.log('Connected to interactive');
		});

		this.client.state.on("ready", async (ready) => {
			if (ready) {
				console.log('Ready!');
				await this.beamInit();
				this.onInit.execute();
				this.onReady.execute();
				isReady = true;
				delayedJoinEvents.forEach((participant) => {
					let user = this.userIDMap.get(participant.userID);
					this.onUserJoin.execute(user);
				})
			} else {
				console.log('Not ready?');
			}
		});
		
		if (this.sharecode !== undefined) {
			await this.client.open(<any><ISocketOptions>{
				authToken: this.authToken,
				versionId: this.versionID,
				sharecode: this.sharecode,
				autoReconnect: false
			});
		} else {
			await this.client.open(<any><ISocketOptions>{
				authToken: this.authToken,
				versionId: this.versionID,
				autoReconnect: false
			});
		}

		await this.client.synchronizeScenes();
		await this.client.synchronizeGroups();
		await this.client.ready(true);

		this.interval = setInterval(() => {
			this.update();
		}, 10);
	}

	stop() {
		// TODO clean up
		this.client.close();
		(this as any).client = undefined;

		for (let [key, scene] of this.sceneMap) {
			scene.beamSceneDestroy();
		}
		for (let [key, group] of this.groupMap) {
			group.beamGroupDestroy();
		}
	}

	update() {
		let now = this.now;
		if (this.client && this.client.state && now) {
			this.sceneMap.forEach((scene) => {
				scene.forEachControl((control) => {
					control.internalUpdate(now);
				});
			});
		}
	}


	private async createScene(id: string) {
		let reply = await this.client.createScenes({ scenes: [{ sceneID: id, controls: [] }] });
		let sceneID = reply.scenes[0].sceneID;

		for (let i = 0; i < 10; i++) {
			await Utils.Timeout(100 * i);
			if (this.client.state.getScene(sceneID)) {
				return this.client.state.getScene(sceneID);
			}
		}
		return undefined;
	}

	private async deleteScene(id: string, reassignSceneID: string) {
		return this.client.execute<any>("deleteScene", {
			"sceneID": id,
			"reassignSceneID": reassignSceneID
		}, false);
	}

	private async createGroup(id: string, sceneID: string) {
		let reply = await this.client.createGroups({ groups: [{ groupID: id, sceneID: sceneID }] });
		let groupID = reply.groups[0].groupID;


		for (let i = 0; i < 10; i++) {
			await Utils.Timeout(100 * i);
			if (this.client.state.getGroup(groupID)) {
				return this.client.state.getGroup(groupID);
			}
		}
		return undefined;
	}

	private async updateGroup(group: IGroup, sceneID: string) {
		let reply = await this.client.updateGroups({ groups: [{ groupID: group.groupID, sceneID: sceneID }] });
		let groupID = reply.groups[0].groupID;

		return this.client.state.getGroup(groupID);
	}

	private async deleteGroup(id: string, reassignGroupID: string) {
		return await this.client.execute<any>("deleteGroup", {
			"groupID": id,
			"reassignGroupID": reassignGroupID
		}, false);
	}
}