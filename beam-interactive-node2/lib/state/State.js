"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var Client_1 = require("../Client");
var ClockSync_1 = require("../ClockSync");
var errors_1 = require("../errors");
var merge_1 = require("../merge");
var MethodHandlerManager_1 = require("../methods/MethodHandlerManager");
var packets_1 = require("../wire/packets");
var Group_1 = require("./Group");
var StateFactory_1 = require("./StateFactory");
/**
 * State is a store of all of the components of an interactive session.
 *
 * It contains Scenes, Groups and Participants and keeps them up to date by listening to
 * interactive events which update and change them. You can query State to
 * examine and alter components of the interactive session.
 */
var State = (function (_super) {
    __extends(State, _super);
    /**
     * Constructs a new State instance. Based on the passed client type it will
     * hook into the appropriate methods for that type to keep itself up to date.
     */
    function State(clientType) {
        var _this = _super.call(this) || this;
        _this.clientType = clientType;
        /**
         * A Map of group ids to their corresponding Group Object.
         */
        _this.groups = new Map();
        _this.methodHandler = new MethodHandlerManager_1.MethodHandlerManager();
        _this.stateFactory = new StateFactory_1.StateFactory();
        _this.scenes = new Map();
        _this.participants = new Map();
        _this.clockDelta = 0;
        _this.clockSyncer = new ClockSync_1.ClockSync({
            sampleFunc: function () { return _this.client.getTime(); },
        });
        _this.methodHandler.addHandler('onReady', function (readyMethod) {
            _this.isReady = readyMethod.params.isReady;
            _this.emit('ready', _this.isReady);
        });
        // Scene Events
        _this.methodHandler.addHandler('onSceneCreate', function (res) {
            res.params.scenes.forEach(function (scene) { return _this.onSceneCreate(scene); });
        });
        _this.methodHandler.addHandler('onSceneDelete', function (res) {
            _this.onSceneDelete(res.params.sceneID, res.params.reassignSceneID);
        });
        _this.methodHandler.addHandler('onSceneUpdate', function (res) {
            res.params.scenes.forEach(function (scene) { return _this.onSceneUpdate(scene); });
        });
        // Group Events
        _this.methodHandler.addHandler('onGroupCreate', function (res) {
            res.params.groups.forEach(function (group) { return _this.onGroupCreate(group); });
        });
        _this.methodHandler.addHandler('onGroupDelete', function (res) {
            _this.onGroupDelete(res.params.groupID, res.params.reassignGroupID);
        });
        _this.methodHandler.addHandler('onGroupUpdate', function (res) {
            res.params.groups.forEach(function (group) { return _this.onGroupUpdate(group); });
        });
        // Control Events
        _this.methodHandler.addHandler('onControlCreate', function (res) {
            var scene = _this.scenes.get(res.params.sceneID);
            if (scene) {
                scene.onControlsCreated(res.params.controls);
            }
        });
        _this.methodHandler.addHandler('onControlDelete', function (res) {
            var scene = _this.scenes.get(res.params.sceneID);
            if (scene) {
                scene.onControlsDeleted(res.params.controls);
            }
        });
        _this.methodHandler.addHandler('onControlUpdate', function (res) {
            var scene = _this.scenes.get(res.params.sceneID);
            if (scene) {
                scene.onControlsUpdated(res.params.controls);
            }
        });
        _this.clockSyncer.on('delta', function (delta) {
            _this.clockDelta = delta;
        });
        if (_this.clientType === Client_1.ClientType.GameClient) {
            _this.addGameClientHandlers();
        }
        else {
            _this.addParticipantHandlers();
        }
        return _this;
    }
    /**
     * Synchronize scenes takes a collection of scenes from the server
     * and hydrates the Scene store with them.
     */
    State.prototype.synchronizeScenes = function (data) {
        var _this = this;
        return data.scenes.map(function (scene) { return _this.onSceneCreate(scene); });
    };
    State.prototype.synchronizeGroups = function (data) {
        var _this = this;
        return data.groups.map(function (group) { return _this.onGroupCreate(group); });
    };
    State.prototype.addParticipantHandlers = function () {
        var _this = this;
        // A participant only gets onParticipantUpdate/Join events for themselves.
        this.methodHandler.addHandler('onParticipantUpdate', function (res) {
            _this.emit('selfUpdate', res.params.participants[0]);
        });
        this.methodHandler.addHandler('onParticipantJoin', function (res) {
            _this.emit('selfUpdate', res.params.participants[0]);
        });
    };
    State.prototype.addGameClientHandlers = function () {
        var _this = this;
        this.methodHandler.addHandler('onParticipantJoin', function (res) {
            res.params.participants.forEach(function (participant) {
                _this.participants.set(participant.sessionID, participant);
                _this.emit('participantJoin', participant);
            });
        });
        this.methodHandler.addHandler('onParticipantLeave', function (res) {
            res.params.participants.forEach(function (participant) {
                _this.participants.delete(participant.sessionID);
                _this.emit('participantLeave', participant.sessionID, participant);
            });
        });
        this.methodHandler.addHandler('onParticipantUpdate', function (res) {
            res.params.participants.forEach(function (participant) {
                merge_1.merge(_this.participants.get(participant.sessionID), participant);
            });
        });
        this.methodHandler.addHandler('giveInput', function (res) {
            var control = _this.getControl(res.params.input.controlID);
            if (control) {
                var participant = _this.getParticipantBySessionID(res.params.participantID);
                control.receiveInput(res.params, participant);
            }
        });
    };
    State.prototype.setClient = function (client) {
        var _this = this;
        this.client = client;
        this.client.on('open', function () { return _this.clockSyncer.start(); });
        this.client.on('close', function () { return _this.clockSyncer.stop(); });
        this.stateFactory.setClient(client);
    };
    /**
     * Processes a server side method using State's method handler.
     */
    State.prototype.processMethod = function (method) {
        try {
            return this.methodHandler.handle(method);
        }
        catch (e) {
            if (e instanceof errors_1.InteractiveError.Base) {
                return packets_1.Reply.fromError(method.id, e);
            }
            throw e;
        }
    };
    /**
     * Returns the local time matched to the sync of the Mixer server clock.
     */
    State.prototype.synchronizeLocalTime = function (time) {
        if (time === void 0) { time = Date.now(); }
        if (time instanceof Date) {
            time = time.getTime();
        }
        return new Date(time - this.clockDelta);
    };
    /**
     * Returns the remote time matched to the local clock.
     */
    State.prototype.synchronizeRemoteTime = function (time) {
        if (time instanceof Date) {
            time = time.getTime();
        }
        return new Date(time + this.clockDelta);
    };
    /**
     * Completely clears this state instance emptying all Scene, Group and Participant records
     */
    State.prototype.reset = function () {
        this.scenes.forEach(function (scene) { return scene.destroy(); });
        this.scenes.clear();
        this.clockDelta = 0;
        this.isReady = false;
        this.participants.clear();
        this.groups.clear();
    };
    /**
     * Updates an existing scene in the game session.
     */
    State.prototype.onSceneUpdate = function (scene) {
        var targetScene = this.getScene(scene.sceneID);
        if (targetScene) {
            targetScene.update(scene);
        }
    };
    /**
     * Removes a scene and reassigns the groups that were on it.
     */
    State.prototype.onSceneDelete = function (sceneID, reassignSceneID) {
        var targetScene = this.getScene(sceneID);
        if (targetScene) {
            targetScene.destroy();
            this.scenes.delete(sceneID);
            this.emit('sceneDeleted', sceneID, reassignSceneID);
        }
    };
    /**
     * Inserts a new scene into the game session.
     */
    State.prototype.onSceneCreate = function (data) {
        var scene = this.scenes.get(data.sceneID);
        if (scene) {
            this.onSceneUpdate(data);
            return scene;
        }
        scene = this.stateFactory.createScene(data);
        if (data.controls) {
            scene.onControlsCreated(data.controls);
        }
        this.scenes.set(data.sceneID, scene);
        this.emit('sceneCreated', scene);
        return scene;
    };
    /**
     * Adds an array of Scenes to its state store.
     */
    State.prototype.addScenes = function (scenes) {
        var _this = this;
        return scenes.map(function (scene) { return _this.onSceneCreate(scene); });
    };
    /**
     * Updates an existing scene in the game session.
     */
    State.prototype.onGroupUpdate = function (group) {
        var targetGroup = this.getGroup(group.groupID);
        if (targetGroup) {
            targetGroup.update(group);
        }
    };
    /**
     * Removes a group and reassigns the participants that were in it.
     */
    State.prototype.onGroupDelete = function (groupID, reassignGroupID) {
        var targetGroup = this.getGroup(groupID);
        if (targetGroup) {
            targetGroup.destroy();
            this.groups.delete(groupID);
            this.emit('groupDeleted', groupID, reassignGroupID);
        }
    };
    /**
     * Inserts a new group into the game session.
     */
    State.prototype.onGroupCreate = function (data) {
        var group = this.groups.get(data.groupID);
        if (group) {
            this.onGroupUpdate(data);
            return group;
        }
        group = new Group_1.Group(data);
        this.groups.set(data.groupID, group);
        this.emit('groupCreated', group);
        return group;
    };
    /**
     * Retrieve all groups.
     */
    State.prototype.getGroups = function () {
        return this.groups;
    };
    /**
     * Retrieve a group with the matching ID from the group store.
     */
    State.prototype.getGroup = function (id) {
        return this.groups.get(id);
    };
    /**
     * Retrieve all scenes
     */
    State.prototype.getScenes = function () {
        return this.scenes;
    };
    /**
     * Retrieve a scene with the matching ID from the scene store.
     */
    State.prototype.getScene = function (id) {
        return this.scenes.get(id);
    };
    /**
     * Searches through all stored Scenes to find a Control with the matching ID
     */
    State.prototype.getControl = function (id) {
        var result;
        this.scenes.forEach(function (scene) {
            var found = scene.getControl(id);
            if (found) {
                result = found;
            }
        });
        return result;
    };
    /**
     * Retrieve all participants.
     */
    State.prototype.getParticipants = function () {
        return this.participants;
    };
    State.prototype.getParticipantBy = function (field, value) {
        var result;
        this.participants.forEach(function (participant) {
            if (participant[field] === value) {
                result = participant;
            }
        });
        return result;
    };
    /**
     * Retrieve a participant by their Mixer UserId.
     */
    State.prototype.getParticipantByUserID = function (id) {
        return this.getParticipantBy('userID', id);
    };
    /**
     * Retrieve a participant by their Mixer Username.
     */
    State.prototype.getParticipantByUsername = function (name) {
        return this.getParticipantBy('username', name);
    };
    /**
     * Retrieve a participant by their sessionID with the current Interactive session.
     */
    State.prototype.getParticipantBySessionID = function (id) {
        return this.participants.get(id);
    };
    return State;
}(events_1.EventEmitter));
exports.State = State;
//# sourceMappingURL=State.js.map