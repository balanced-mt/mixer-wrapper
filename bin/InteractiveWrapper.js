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
    constructor(authToken, versionId) {
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
            yield this.client.open({
                authToken: this.authToken,
                versionId: this.versionId
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVXcmFwcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0ludGVyYWN0aXZlV3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsc0VBT21DO0FBRW5DLHlCQUF5QjtBQUN6QixnREFBNkM7QUFDN0MseURBQXNEO0FBQ3RELHVEQUFvRDtBQUNwRCx5REFBc0Q7QUFDdEQsZ0RBQTZDO0FBRTdDLHFDQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7QUF1QmpCO0lBc0JDLFlBQVksU0FBaUIsRUFBRSxTQUFpQjtRQXBCdkMsV0FBTSxHQUEyQixTQUFTLENBQUM7UUFFM0MsaUJBQVksR0FBcUIsSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2xGLGlCQUFZLEdBQXFCLElBQUksbUNBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFHM0YsYUFBUSxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3BELGFBQVEsR0FBa0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNwRCxlQUFVLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckQsWUFBTyxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2xELGNBQVMsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUU1RCxXQUFNLEdBQXNCLElBQUksYUFBSyxFQUFPLENBQUM7UUFDN0MsWUFBTyxHQUFzQixJQUFJLGFBQUssRUFBTyxDQUFDO1FBQzlDLGVBQVUsR0FBMkMsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUN0RSxnQkFBVyxHQUEyQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBZ0IvRCxlQUFVLEdBQWEsRUFBRSxDQUFDO1FBQzFCLG9CQUFlLEdBQUcsQ0FBQyxDQUFDO1FBcUM1Qjs7O1dBR0c7UUFFSyxlQUFVLEdBQWEsRUFBRSxDQUFD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