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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var merge_1 = require("../../merge");
/**
 * Control is used a base class for all other controls within an interactive session.
 * It contains shared logic which all types of controls can utilize.
 */
var Control = (function (_super) {
    __extends(Control, _super);
    function Control(control) {
        var _this = _super.call(this) || this;
        merge_1.merge(_this, control);
        return _this;
    }
    /**
     * Sets the scene this control belongs to.
     */
    Control.prototype.setScene = function (scene) {
        this.scene = scene;
    };
    /**
     * Sets the client instance this control can use to execute methods.
     */
    Control.prototype.setClient = function (client) {
        this.client = client;
    };
    /**
     * Called by client when it recieves an input event for this control from the server.
     */
    Control.prototype.receiveInput = function (inputEvent, participant) {
        this.emit(inputEvent.input.event, inputEvent, participant);
    };
    Control.prototype.sendInput = function (input) {
        // We add this on behalf of the controls so that they don't have to worry about the
        // Protocol side too much
        input.controlID = this.controlID;
        return this.client.giveInput(input);
    };
    /**
     * Disables this control, preventing participant interaction.
     */
    Control.prototype.disable = function () {
        return this.updateAttribute('disabled', true);
    };
    /**
     * Enables this control, allowing participant interaction.
     */
    Control.prototype.enable = function () {
        return this.updateAttribute('disabled', false);
    };
    Control.prototype.updateAttribute = function (attribute, value) {
        var packet = {};
        packet.etag = this.etag;
        packet.controlID = this.controlID;
        packet[attribute] = value;
        return this.client.updateControls({
            sceneID: this.scene.sceneID,
            controls: [packet],
        });
    };
    /**
     * Merges in values from the server in response to an update operation from the server.
     */
    Control.prototype.onUpdate = function (controlData) {
        merge_1.merge(this, controlData);
        this.emit('updated', this);
    };
    /**
     * Update this control on the server.
     */
    Control.prototype.update = function (controlUpdate) {
        var changedData = __assign({}, controlUpdate, { controlID: this.controlID, etag: this.etag });
        return this.client.updateControls({
            sceneID: this.scene.sceneID,
            controls: [changedData],
        });
    };
    Control.prototype.destroy = function () {
        this.emit('deleted', this);
    };
    return Control;
}(events_1.EventEmitter));
exports.Control = Control;
//# sourceMappingURL=Control.js.map