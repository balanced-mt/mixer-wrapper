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
var merge_1 = require("../merge");
var StateFactory_1 = require("./StateFactory");
/**
 * A Scene is a collection of controls within an interactive experience. Groups can be
 * set to a scene. Which Scene a group is set to determine which controls they see.
 *
 * You can use scenes to logically group together controls for some meaning.
 */
var Scene = (function (_super) {
    __extends(Scene, _super);
    function Scene(data) {
        var _this = _super.call(this) || this;
        _this.controls = new Map();
        _this.meta = {};
        _this.stateFactory = new StateFactory_1.StateFactory();
        _this.sceneID = data.sceneID;
        _this.meta = data.meta || {};
        return _this;
    }
    Scene.prototype.setClient = function (client) {
        this.client = client;
        this.stateFactory.setClient(client);
    };
    /**
     * Called when controls are added to this scene.
     */
    Scene.prototype.onControlsCreated = function (controls) {
        var _this = this;
        return controls.map(function (control) { return _this.onControlCreated(control); });
    };
    /**
     * Called when a control is added to this scene.
     */
    Scene.prototype.onControlCreated = function (controlData) {
        var control = this.controls.get(controlData.controlID);
        if (control) {
            this.onControlUpdated(controlData);
            return control;
        }
        control = this.stateFactory.createControl(controlData.kind, controlData, this);
        this.controls.set(control.controlID, control);
        this.emit('controlAdded', control);
        return control;
    };
    /**
     * Called when controls are deleted from this scene.
     */
    Scene.prototype.onControlsDeleted = function (controls) {
        var _this = this;
        controls.forEach(function (control) { return _this.onControlDeleted(control); });
    };
    /**
     * Called when a control is deleted from this scene.
     */
    Scene.prototype.onControlDeleted = function (control) {
        this.controls.delete(control.controlID);
        this.emit('controlDeleted', control.controlID);
    };
    /**
     * Called when a control in this scene is updated
     */
    Scene.prototype.onControlUpdated = function (controlData) {
        var control = this.getControl(controlData.controlID);
        if (control) {
            control.onUpdate(controlData);
        }
    };
    /**
     * Called when the controls in this scene are updated.
     */
    Scene.prototype.onControlsUpdated = function (controls) {
        var _this = this;
        controls.forEach(function (control) { return _this.onControlUpdated(control); });
    };
    /**
     * Retrieve a control in this scene by its id.
     */
    Scene.prototype.getControl = function (id) {
        return this.controls.get(id);
    };
    /**
     * Retrieves all the controls in this scene.
     */
    Scene.prototype.getControls = function () {
        return Array.from(this.controls.values());
    };
    /**
     * Creates a control in this scene, sending it to the server.
     */
    Scene.prototype.createControl = function (control) {
        return this.createControls([control]).then(function (res) { return res[0]; });
    };
    /**
     * Creates a collection of controls in this scene, sending it to the server.
     */
    Scene.prototype.createControls = function (controls) {
        return this.client.createControls({ sceneID: this.sceneID, controls: controls });
    };
    /**
     * Updates a collection of controls in this scene, sending it to the server.
     */
    Scene.prototype.updateControls = function (controls) {
        return this.client.updateControls({ sceneID: this.sceneID, controls: controls });
    };
    /**
     * Deletes controls in this scene from the server.
     */
    Scene.prototype.deleteControls = function (controlIDs) {
        return this.client.deleteControls({
            sceneID: this.sceneID,
            controlIDs: controlIDs,
        });
    };
    /**
     * Deletes a single control in this scene from the server.
     */
    Scene.prototype.deleteControl = function (controlId) {
        return this.deleteControls([controlId]);
    };
    /**
     * Fires destruction events for each control in this scene.
     */
    Scene.prototype.destroy = function () {
        var _this = this;
        //TODO find the group they should now be on
        this.controls.forEach(function (control) {
            _this.emit('controlDeleted', control.controlID);
        });
    };
    /**
     * Merges new data from the server into this scene.
     */
    Scene.prototype.update = function (scene) {
        if (scene.meta) {
            merge_1.merge(this.meta, scene.meta);
            this.emit('update', this);
        }
    };
    /**
     * Deletes all controls in this scene from the server.
     */
    Scene.prototype.deleteAllControls = function () {
        var ids = [];
        this.controls.forEach(function (_, key) {
            ids.push(key);
        });
        return this.deleteControls(ids);
    };
    return Scene;
}(events_1.EventEmitter));
exports.Scene = Scene;
//# sourceMappingURL=Scene.js.map