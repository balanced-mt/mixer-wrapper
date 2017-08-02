"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const beam_interactive_node2_1 = require("../beam-interactive-node2");
const ws = require("ws");
const Event_1 = require("./common/utils/Event");
const InteractiveScene_1 = require("./InteractiveScene");
const InteractiveUser_1 = require("./InteractiveUser");
const InteractiveGroup_1 = require("./InteractiveGroup");
const Utils_1 = require("./common/utils/Utils");
beam_interactive_node2_1.setWebSocket(ws);
class InteractiveWrapper {
    constructor(authToken, versionId, sharecode) {
        this.client = undefined;
        this.defaultScene = new InteractiveScene_1.InteractiveScene(this, "default", "default");
        this.defaultGroup = new InteractiveGroup_1.InteractiveGroup(this, this.defaultScene, "default");
        this.sceneMap = new Map();
        this.groupMap = new Map();
        this.sessionMap = new Map();
        this.userMap = new Map();
        this.userIDMap = new Map();
        this.onInit = new Event_1.Event();
        this.onReady = new Event_1.Event();
        this.onUserJoin = new Event_1.Event();
        this.onUserLeave = new Event_1.Event();
        this.tempScenes = [];
        this.tempScenesCount = 0;
        /*async removeScene(scene: InteractiveScene) {
            await this.deleteScene(scene.id, "default");
            this.sceneMap.delete(scene.id);
        }*/
        this.tempGroups = [];
        this.tempGroupsCount = 0;
        this.clockDelta = 0;
        /**********************************************************************/
        this.scenesInitialized = false;
        this.groupsInitialized = false;
        this.authToken = authToken;
        this.versionId = versionId;
        this.sharecode = sharecode;
        this.addScene(this.defaultScene);
        this.addGroup(this.defaultGroup);
        setInterval(() => {
            this.update();
        }, 10);
    }
    addScene(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sceneMap.has(scene.id)) {
                throw new Error(`[InteractiveWrapper:addScene] Scene '${scene.id}' already exists!`);
            }
            if (this.scenesInitialized) {
                let beamScene;
                if (scene.temporary === true) {
                    beamScene = this.tempScenes.pop();
                }
                if (beamScene === undefined) {
                    beamScene = yield this.createScene(scene.temporary === false ? scene.id : "temp-" + (this.tempScenesCount++));
                }
                yield scene.beamSceneInit(beamScene);
            }
            this.sceneMap.set(scene.id, scene);
        });
    }
    removeScene(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scene.temporary === true) {
                this.sceneMap.delete(scene.id);
                let internal = scene.internal;
                yield scene.destroy();
                this.tempScenes.unshift(internal);
            }
            else {
                throw new Error("NYI");
            }
        });
    }
    getScene(name) {
        return this.sceneMap.get(name);
    }
    addGroup(group) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.groupMap.has(group.id)) {
                throw new Error(`[InteractiveWrapper:addGroup] Group '${group.id}' already exists!`);
            }
            if (this.groupsInitialized) {
                let beamGroup;
                if (group.temporary === true) {
                    beamGroup = this.tempGroups.pop();
                    if (beamGroup !== undefined) {
                        yield this.updateGroup(beamGroup, group.scene.id);
                    }
                }
                if (beamGroup === undefined) {
                    beamGroup = yield this.createGroup(group.temporary === false ? group.id : "temp-" + (this.tempGroupsCount++), group.scene.id);
                }
                yield group.beamGroupInit(beamGroup);
            }
            this.groupMap.set(group.id, group);
        });
    }
    removeGroup(group) {
        return __awaiter(this, void 0, void 0, function* () {
            if (group.temporary === true) {
                this.groupMap.delete(group.id);
                let internal = group.internal;
                yield group.destroy();
                this.tempGroups.unshift(internal);
            }
            else {
                throw new Error("NYI");
            }
        });
    }
    moveGroup(group, scene) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.groupMap.has(group.id)) {
                throw new Error(`[InteractiveWrapper:moveGroup] Group '${group.id}' doesn't exist!`);
            }
            if (this.groupsInitialized) {
                yield this.updateGroup(group.internal, group.scene.id);
            }
            this.groupMap.set(group.id, group);
        });
    }
    getGroup(name) {
        return this.groupMap.get(name);
    }
    /*async removeGroup(group: InteractiveGroup) {
        await this.deleteGroup(group.id, "default");
        this.groupMap.delete(group.id);
    }*/
    moveUsers(users, group, currentTry = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.execute("updateParticipants", { participants: users.map((user) => { return { sessionID: user.sessionID, etag: user.etag, groupID: group.id }; }) }, false).then((users) => {
                users.participants.forEach((user) => {
                    this.userIDMap.get(user.userID).setParticipant(user, true);
                });
            }).catch((err) => __awaiter(this, void 0, void 0, function* () {
                //if (currentTry < 3) {
                //	await this.moveUsers(users, group, currentTry + 1);
                //} else {
                throw err;
                //}
            }));
        });
    }
    findUser(username) {
        return this.userMap.get(username.toLowerCase());
    }
    getUser(participant) {
        return (participant !== undefined && participant.sessionID !== undefined) ? this.sessionMap.get(participant.sessionID) : undefined;
    }
    get now() {
        if (this.client && this.client.state) {
            this.clockDelta = this.client.state.clockDelta;
            return this.client.state.synchronizeLocalTime().getTime();
        }
        else if (this.clockDelta !== 0) {
            return new Date(Date.now() - this.clockDelta).getTime();
        }
        else {
            console.error("Clock not synced!");
            return undefined;
        }
    }
    beamInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.scenesInitialized = true;
            for (let [key, scene] of this.sceneMap) {
                let beamScene;
                if (scene.id === "default") {
                    beamScene = this.client.state.getScene("default");
                }
                else {
                    beamScene = yield this.createScene(scene.id);
                }
                scene.beamSceneInit(beamScene);
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
                }
                else {
                    beamGroup = yield this.createGroup(group.id, group.scene.id);
                }
                group.beamGroupInit(beamGroup);
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = new beam_interactive_node2_1.GameClient();
            //this.client.on('message', (err: any) => {
            //	console.log('<<<', err);
            //});
            //this.client.on('send', (err: any) => {
            //	console.log('>>>', err);
            //});
            this.client.on('error', (err) => {
                console.error("[InteractiveWrapper] error ", err);
            });
            this.client.state.on('participantJoin', (participant) => {
                let user = this.userIDMap.get(participant.userID);
                if (user === undefined) {
                    user = new InteractiveUser_1.InteractiveUser(this, participant);
                    this.userIDMap.set(participant.userID, user);
                    this.userMap.set(participant.username.toLowerCase(), user);
                }
                else {
                    user.setParticipant(participant);
                }
                this.sessionMap.set(participant.sessionID, user);
                console.log(`[InteractiveWrapper] ${participant.username}(${participant.sessionID}) Joined`);
                // if we are not ready delay!
                this.onUserJoin.execute(user);
            });
            this.client.state.on('participantLeave', (sessionID) => {
                let user = this.sessionMap.get(sessionID);
                if (user !== undefined) {
                    this.sessionMap.delete(sessionID);
                    user.removeParticipant(sessionID);
                    console.log(`[InteractiveWrapper] ${sessionID} Left`);
                    // if we are not ready do what?
                    this.onUserLeave.execute(user);
                }
            });
            // Log when we're connected to interactive
            this.client.on('open', () => {
                this.client.socket.options.autoReconnect = false;
                console.log('Connected to interactive');
            });
            this.client.state.on("ready", (ready) => __awaiter(this, void 0, void 0, function* () {
                if (ready) {
                    console.log('Ready!');
                    yield this.beamInit();
                    this.onInit.execute();
                    this.onReady.execute();
                }
                else {
                    console.log('Not ready?');
                }
            }));
            if (this.sharecode !== undefined) {
                yield this.client.open({
                    authToken: this.authToken,
                    versionId: this.versionId,
                    sharecode: this.sharecode
                });
            }
            else {
                yield this.client.open({
                    authToken: this.authToken,
                    versionId: this.versionId
                });
            }
            yield this.client.synchronizeScenes();
            yield this.client.synchronizeGroups();
            yield this.client.ready(true);
        });
    }
    stop() {
        // TODO clean up
        this.client.close();
        this.client = undefined;
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
    createScene(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let reply = yield this.client.createScenes({ scenes: [{ sceneID: id, controls: [] }] });
            let sceneID = reply.scenes[0].sceneID;
            for (let i = 0; i < 10; i++) {
                yield Utils_1.Utils.Timeout(100 * i);
                if (this.client.state.getScene(sceneID)) {
                    return this.client.state.getScene(sceneID);
                }
            }
            return undefined;
        });
    }
    /*private async deleteScene(id: string, reassignSceneID: string) {
        return this.client.execute<any>("deleteScene", {
            "sceneID": id,
            "reassignSceneID": reassignSceneID
        }, false);
    }*/
    createGroup(id, sceneID) {
        return __awaiter(this, void 0, void 0, function* () {
            let reply = yield this.client.createGroups({ groups: [{ groupID: id, sceneID: sceneID }] });
            let groupID = reply.groups[0].groupID;
            for (let i = 0; i < 10; i++) {
                yield Utils_1.Utils.Timeout(100 * i);
                if (this.client.state.getGroup(groupID)) {
                    return this.client.state.getGroup(groupID);
                }
            }
            return undefined;
        });
    }
    updateGroup(group, sceneID) {
        return __awaiter(this, void 0, void 0, function* () {
            let reply = yield this.client.updateGroups({ groups: [{ groupID: group.groupID, etag: group.etag, sceneID: sceneID }] });
            let groupID = reply.groups[0].groupID;
            return this.client.state.getGroup(groupID);
        });
    }
}
exports.InteractiveWrapper = InteractiveWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVXcmFwcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0ludGVyYWN0aXZlV3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsc0VBT21DO0FBRW5DLHlCQUF5QjtBQUN6QixnREFBNkM7QUFDN0MseURBQXNEO0FBQ3RELHVEQUFvRDtBQUNwRCx5REFBc0Q7QUFDdEQsZ0RBQTZDO0FBRTdDLHFDQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7QUF1QmpCO0lBdUJDLFlBQVksU0FBaUIsRUFBRSxTQUFpQixFQUFFLFNBQWtCO1FBckIzRCxXQUFNLEdBQTJCLFNBQVMsQ0FBQztRQUUzQyxpQkFBWSxHQUFxQixJQUFJLG1DQUFnQixDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbEYsaUJBQVksR0FBcUIsSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUczRixhQUFRLEdBQWtDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDcEQsYUFBUSxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3BELGVBQVUsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyRCxZQUFPLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbEQsY0FBUyxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTVELFdBQU0sR0FBc0IsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUM3QyxZQUFPLEdBQXNCLElBQUksYUFBSyxFQUFPLENBQUM7UUFDOUMsZUFBVSxHQUEyQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBQ3RFLGdCQUFXLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFrQi9ELGVBQVUsR0FBYSxFQUFFLENBQUM7UUFDMUIsb0JBQWUsR0FBRyxDQUFDLENBQUM7UUFxQzVCOzs7V0FHRztRQUVLLGVBQVUsR0FB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