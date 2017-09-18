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
        this.loggingEnabled = false;
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
            return this.client.execute("updateParticipants", { participants: users.map((user) => { return { sessionID: user.sessionID, groupID: group.id }; }) }, false).then((users) => {
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
    static logMessage(message) {
        console.log("[InteractiveWrapper] <<<", message);
    }
    static logSend(message) {
        console.log("[InteractiveWrapper] >>>", message);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = new beam_interactive_node2_1.GameClient();
            if (this.loggingEnabled) {
                this.client.on("message", InteractiveWrapper.logMessage);
                this.client.on("send", InteractiveWrapper.logSend);
            }
            this.client.on("error", (err) => {
                console.error("[InteractiveWrapper] error ", err);
            });
            this.client.state.on("participantJoin", (participant) => {
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
            this.client.state.on("participantLeave", (sessionID) => {
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
            this.client.on("open", () => {
                this.client.socket.options.autoReconnect = false;
                console.log("Connected to interactive");
            });
            this.client.state.on("ready", (ready) => __awaiter(this, void 0, void 0, function* () {
                if (ready) {
                    console.log("Ready!");
                    yield this.beamInit();
                    this.onInit.execute();
                    this.onReady.execute();
                }
                else {
                    console.log("Not ready?");
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
            let reply = yield this.client.updateGroups({ groups: [{ groupID: group.groupID, sceneID: sceneID }] });
            let groupID = reply.groups[0].groupID;
            return this.client.state.getGroup(groupID);
        });
    }
}
exports.InteractiveWrapper = InteractiveWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVXcmFwcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0ludGVyYWN0aXZlV3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsc0VBTW1DO0FBRW5DLHlCQUF5QjtBQUN6QixnREFBNkM7QUFDN0MseURBQXNEO0FBQ3RELHVEQUFvRDtBQUNwRCx5REFBc0Q7QUFDdEQsZ0RBQTZDO0FBRTdDLHFDQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7QUFxQmpCO0lBdUJDLFlBQVksU0FBaUIsRUFBRSxTQUFpQixFQUFFLFNBQWtCO1FBckIzRCxXQUFNLEdBQTJCLFNBQVMsQ0FBQztRQUUzQyxpQkFBWSxHQUFxQixJQUFJLG1DQUFnQixDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbEYsaUJBQVksR0FBcUIsSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUczRixhQUFRLEdBQWtDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDcEQsYUFBUSxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3BELGVBQVUsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyRCxZQUFPLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbEQsY0FBUyxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTVELFdBQU0sR0FBc0IsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUM3QyxZQUFPLEdBQXNCLElBQUksYUFBSyxFQUFPLENBQUM7UUFDOUMsZUFBVSxHQUEyQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBQ3RFLGdCQUFXLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFrQi9ELGVBQVUsR0FBYSxFQUFFLENBQUM7UUFDMUIsb0JBQWUsR0FBRyxDQUFDLENBQUM7UUFxQzVCOzs7V0FHRztRQUVLLGVBQVUsR0FB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