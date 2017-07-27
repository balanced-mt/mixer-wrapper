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
var Control_1 = require("./Control");
/**
 * Buttons can be pushed by participants with their mouse or activated with their keyboards.
 */
var Button = (function (_super) {
    __extends(Button, _super);
    function Button() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Sets a new text value for this button.
     */
    Button.prototype.setText = function (text) {
        return this.updateAttribute('text', text);
    };
    /**
     * Sets a progress value for this button.
     * A decimalized percentage (0.0 - 1.0)
     */
    Button.prototype.setProgress = function (progress) {
        return this.updateAttribute('progress', progress);
    };
    /**
     * Sets the cooldown for this button. Specified in Milliseconds.
     * The Client will convert this to a Unix timestamp for you.
     */
    Button.prototype.setCooldown = function (duration) {
        var target = this.client.state.synchronizeLocalTime().getTime() + duration;
        return this.updateAttribute('cooldown', target);
    };
    /**
     * Sets the spark cost for this button.
     * An Integer greater than 0
     */
    Button.prototype.setCost = function (cost) {
        return this.updateAttribute('cost', cost);
    };
    /**
     * Sends an input event from a participant to the server for consumption.
     */
    Button.prototype.giveInput = function (input) {
        return this.sendInput(input);
    };
    /**
     * Update this button on the server.
     */
    Button.prototype.update = function (controlUpdate) {
        // Clone to prevent mutations
        var changedData = __assign({}, controlUpdate);
        if (changedData.cooldown) {
            changedData.cooldown = this.client.state.synchronizeLocalTime().getTime() + changedData.cooldown;
        }
        return _super.prototype.update.call(this, changedData);
    };
    return Button;
}(Control_1.Control));
exports.Button = Button;
//# sourceMappingURL=Button.js.map