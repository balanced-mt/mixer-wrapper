"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var controls_1 = require("./controls");
var Scene_1 = require("./Scene");
/**
 * The StateFactory creates the apropriate instance of a class for a given socket message.
 */
var StateFactory = (function () {
    function StateFactory() {
    }
    StateFactory.prototype.setClient = function (client) {
        this.client = client;
    };
    StateFactory.prototype.createControl = function (controlKind, values, scene) {
        var control;
        switch (controlKind) {
            case 'button':
                control = new controls_1.Button(values);
                break;
            case 'joystick':
                control = new controls_1.Joystick(values);
                break;
            default:
                throw new Error('Unknown control type');
        }
        control.setClient(this.client);
        control.setScene(scene);
        return control;
    };
    StateFactory.prototype.createScene = function (values) {
        var scene = new Scene_1.Scene(values);
        scene.setClient(this.client);
        return scene;
    };
    return StateFactory;
}());
exports.StateFactory = StateFactory;
//# sourceMappingURL=StateFactory.js.map