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
var Control_1 = require("./Control");
/**
 * Joysticks can be moved by participants and will report their coordinates down to GameClients
 */
var Joystick = (function (_super) {
    __extends(Joystick, _super);
    function Joystick() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Sets the angle of the direction indicator for this joystick.
     */
    Joystick.prototype.setAngle = function (angle) {
        return this.updateAttribute('angle', angle);
    };
    /**
     * Sets the opacity/strength of the direction indicator for this joystick.
     */
    Joystick.prototype.setIntensity = function (intensity) {
        return this.updateAttribute('intensity', intensity);
    };
    /**
     * Sends an input event from a participant to the server for consumption.
     */
    Joystick.prototype.giveInput = function (input) {
        return this.sendInput(input);
    };
    return Joystick;
}(Control_1.Control));
exports.Joystick = Joystick;
//# sourceMappingURL=Joystick.js.map