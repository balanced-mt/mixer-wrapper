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
const beam_interactive_node2_1 = require("beam-interactive-node2");
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
        this.onStop = new Event_1.Event();
        this.interval = undefined;
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
                let internal = scene.internal;
                if (internal !== undefined) {
                    this.sceneMap.delete(scene.id);
                    yield scene.destroy();
                    this.tempScenes.unshift(internal);
                }
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
                let internal = group.internal;
                if (internal !== undefined) {
                    this.groupMap.delete(group.id);
                    yield group.destroy();
                    this.tempGroups.unshift(internal);
                }
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
    moveUsers(users, group, currentTry = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.execute("updateParticipants", { participants: users.map((user) => { return { sessionID: user.sessionID, groupID: group.id }; }) }, false).then((users) => {
                users.participants.forEach((user) => {
                    this.userIDMap.get(user.userID).setParticipant(user, true);
                });
            }).catch((err) => __awaiter(this, void 0, void 0, function* () {
                if (this.client !== undefined && currentTry < 3) {
                    yield Utils_1.Utils.Timeout(1000 * (currentTry + 1));
                    yield this.moveUsers(users, group, currentTry + 1);
                }
                else {
                    throw err;
                }
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
            if (this.client.state.clockDelta !== 0) {
                this.clockDelta = this.client.state.clockDelta;
            }
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
                yield scene.beamSceneInit(beamScene);
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
            this.client.on('error', (err) => {
                console.error("[InteractiveWrapper] error ", err);
            });
            let delayedJoinEvents = [];
            let isReady = false;
            this.client.state.on('participantJoin', (participant) => {
                let user = this.userIDMap.get(participant.userID);
                if (user === undefined) {
                    user = new InteractiveUser_1.InteractiveUser(this);
                    this.userIDMap.set(participant.userID, user);
                    this.userMap.set(participant.username.toLowerCase(), user);
                    user.setParticipant(participant, true);
                    this.sessionMap.set(participant.sessionID, user);
                }
                else {
                    user.setParticipant(participant);
                    this.sessionMap.set(participant.sessionID, user);
                }
                // console.log(`[InteractiveWrapper] ${participant.username}(${participant.sessionID}) Joined`);
                if (isReady) {
                    this.onUserJoin.execute(user);
                }
                else {
                    // if we are not ready delay!
                    delayedJoinEvents.push(user);
                }
            });
            this.client.state.on('participantLeave', (sessionID) => {
                let user = this.sessionMap.get(sessionID);
                if (user !== undefined) {
                    this.sessionMap.delete(sessionID);
                    user.removeParticipant(sessionID);
                    // console.log(`[InteractiveWrapper] ${sessionID} Left`);
                    if (isReady) {
                        this.onUserLeave.execute(user);
                    }
                    else {
                        // if we are not ready remove
                        const index = delayedJoinEvents.indexOf(user);
                        delayedJoinEvents.splice(index, 1);
                    }
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
                    isReady = true;
                    delayedJoinEvents.forEach((participant) => {
                        let user = this.userIDMap.get(participant.userID);
                        this.onUserJoin.execute(user);
                    });
                }
                else {
                    console.log('Not ready?');
                }
            }));
            if (this.sharecode !== undefined) {
                yield this.client.open({
                    authToken: this.authToken,
                    versionId: this.versionID,
                    sharecode: this.sharecode,
                    autoReconnect: false
                });
            }
            else {
                yield this.client.open({
                    authToken: this.authToken,
                    versionId: this.versionID,
                    autoReconnect: false
                });
            }
            yield this.client.synchronizeScenes();
            yield this.client.synchronizeGroups();
            yield this.client.ready(true);
            this.interval = setInterval(() => {
                this.update();
            }, 10);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVXcmFwcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0ludGVyYWN0aXZlV3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsbUVBTWdDO0FBRWhDLHlCQUF5QjtBQUN6QixnREFBNkM7QUFDN0MseURBQXNEO0FBQ3RELHVEQUFvRDtBQUNwRCx5REFBc0Q7QUFDdEQsZ0RBQTZDO0FBRzdDLHFDQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7QUFxQmpCO0lBMkJDLFlBQVksU0FBaUIsRUFBRSxTQUFpQixFQUFFLFNBQWtCO1FBekIzRCxXQUFNLEdBQTJCLFNBQVMsQ0FBQztRQUUzQyxpQkFBWSxHQUFxQixJQUFJLG1DQUFnQixDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbEYsaUJBQVksR0FBcUIsSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUczRixhQUFRLEdBQWtDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDcEQsYUFBUSxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3BELGVBQVUsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyRCxZQUFPLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbEQsY0FBUyxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTVDLFdBQU0sR0FBc0IsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUM3QyxZQUFPLEdBQXNCLElBQUksYUFBSyxFQUFPLENBQUM7UUFDOUMsZUFBVSxHQUEyQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBQ3RFLGdCQUFXLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFdkUsV0FBTSxHQUFzQixJQUFJLGFBQUssRUFBTyxDQUFDO1FBRXJELGFBQVEsR0FBaUIsU0FBUyxDQUFDO1FBa0JuQyxlQUFVLEdBQWEs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