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
var Client_1 = require("./Client");
var EndpointDiscovery_1 = require("./EndpointDiscovery");
var Requester_1 = require("./Requester");
var GameClient = (function (_super) {
    __extends(GameClient, _super);
    function GameClient() {
        var _this = _super.call(this, Client_1.ClientType.GameClient) || this;
        _this.discovery = new EndpointDiscovery_1.EndpointDiscovery(new Requester_1.Requester());
        return _this;
    }
    /**
     * Opens a connection to the interactive service using the provided options.
     */
    GameClient.prototype.open = function (options) {
        var _this = this;
        var extraHeaders = {
            'X-Interactive-Version': options.versionId,
        };
        if (options.sharecode) {
            extraHeaders['X-Interactive-Sharecode'] = options.sharecode;
        }
        return this.discovery
            .retrieveEndpoints(options.discoveryUrl)
            .then(function (endpoints) {
            return _super.prototype.open.call(_this, {
                authToken: options.authToken,
                url: endpoints[0].address,
                extraHeaders: extraHeaders,
            });
        });
    };
    /**
     * Creates instructs the server to create new controls on a scene within your project.
     * Participants will see the new controls automatically if they are on the scene the
     * new controls are added to.
     */
    GameClient.prototype.createControls = function (data) {
        var _this = this;
        return this.execute('createControls', data, false).then(function (res) {
            var scene = _this.state.getScene(res.sceneID);
            if (!scene) {
                return _this.state.onSceneCreate(res).getControls();
            }
            return scene.onControlsCreated(res.controls);
        });
    };
    /**
     * Instructs the server to create new groups with the specified parameters.
     */
    GameClient.prototype.createGroups = function (groups) {
        return this.execute('createGroups', groups, false);
    };
    /**
     * Instructs the server to create a new scene with the specified parameters.
     */
    GameClient.prototype.createScene = function (scene) {
        return this.createScenes({ scenes: [scene] }).then(function (scenes) {
            return scenes.scenes[0];
        });
    };
    /**
     * Instructs the server to create new scenes with the specified parameters.
     */
    GameClient.prototype.createScenes = function (scenes) {
        return this.execute('createScenes', scenes, false);
    };
    /**
     * Updates a sessions' ready state, when a client is not ready participants cannot
     * interact with the controls.
     */
    GameClient.prototype.ready = function (isReady) {
        if (isReady === void 0) { isReady = true; }
        return this.execute('ready', { isReady: isReady }, false);
    };
    /**
     * Instructs the server to update controls within a scene with your specified parameters.
     * Participants on the scene will see the controls update automatically.
     */
    GameClient.prototype.updateControls = function (params) {
        return this.execute('updateControls', params, false);
    };
    /**
     * Instructs the server to update the participant within the session with your specified parameters.
     * Participants within the group will see applicable scene changes automatically.
     */
    GameClient.prototype.updateGroups = function (groups) {
        return this.execute('updateGroups', groups, false);
    };
    /**
     * Instructs the server to update a scene within the session with your specified parameters.
     */
    GameClient.prototype.updateScenes = function (scenes) {
        return this.execute('updateScenes', scenes, false);
    };
    /**
     * Instructs the server to update the participant within the session with your specified parameters.
     */
    GameClient.prototype.updateParticipants = function (participants) {
        return this.execute('updateParticipants', participants, false);
    };
    /**
     * Makes an attempt to capture a spark transaction and deduct the sparks from the participant
     * who created the transaction.
     *
     * A transaction can fail to capture if:
     *  * The participant does not have enough sparks.
     *  * The transaction is expired.
     */
    GameClient.prototype.captureTransaction = function (transactionID) {
        return this.execute('capture', { transactionID: transactionID }, false);
    };
    /**
     * Instructs the server to delete the provided controls.
     */
    GameClient.prototype.deleteControls = function (data) {
        return this.execute('deleteControls', data, false);
    };
    /**
     * Instructs the server to delete the provided group.
     */
    GameClient.prototype.deleteGroup = function (data) {
        return this.execute('deleteGroup', data, false);
    };
    /**
     * Instructs the server to delete the provided scene.
     */
    GameClient.prototype.deleteScene = function (data) {
        return this.execute('deleteScene', data, false);
    };
    return GameClient;
}(Client_1.Client));
exports.GameClient = GameClient;
//# sourceMappingURL=GameClient.js.map