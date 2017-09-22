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
    constructor(authToken, versionID, sharecode) {
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
        this.versionID = versionID;
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
                this.sceneMap.delete(scene.id);
                let internal = scene.internal;
                yield scene.destroy();
                yield this.deleteScene(internal.sceneID, "default");
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
                this.groupMap.delete(group.id);
                let internal = group.internal;
                yield group.destroy();
                yield this.deleteGroup(internal.groupID, "default");
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
                    versionId: this.versionID,
                    sharecode: this.sharecode
                });
            }
            else {
                yield this.client.open({
                    authToken: this.authToken,
                    versionId: this.versionID
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
    deleteScene(id, reassignSceneID) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.execute("deleteScene", {
                "sceneID": id,
                "reassignSceneID": reassignSceneID
            }, false);
        });
    }
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
    deleteGroup(id, reassignGroupID) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.execute("deleteGroup", {
                "groupID": id,
                "reassignGroupID": reassignGroupID
            }, false);
        });
    }
}
exports.InteractiveWrapper = InteractiveWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVXcmFwcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0ludGVyYWN0aXZlV3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsc0VBTW1DO0FBRW5DLHlCQUF5QjtBQUN6QixnREFBNkM7QUFDN0MseURBQXNEO0FBQ3RELHVEQUFvRDtBQUNwRCx5REFBc0Q7QUFDdEQsZ0RBQTZDO0FBRTdDLHFDQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7QUFxQmpCO0lBdUJDLFlBQVksU0FBaUIsRUFBRSxTQUFpQixFQUFFLFNBQWtCO1FBckIzRCxXQUFNLEdBQTJCLFNBQVMsQ0FBQztRQUUzQyxpQkFBWSxHQUFxQixJQUFJLG1DQUFnQixDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbEYsaUJBQVksR0FBcUIsSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUczRixhQUFRLEdBQWtDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDcEQsYUFBUSxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3BELGVBQVUsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyRCxZQUFPLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbEQsY0FBUyxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTVELFdBQU0sR0FBc0IsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUM3QyxZQUFPLEdBQXNCLElBQUksYUFBSyxFQUFPLENBQUM7UUFDOUMsZUFBVSxHQUEyQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBQ3RFLGdCQUFXLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFrQi9ELGVBQVUsR0FBYSxFQUFFLENBQUM7UUFDMUIsb0JBQWUsR0FBRyxDQUFDLENBQUM7UUF3QzVCOzs7V0FHRztRQUVLLGVBQVUsR0FB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