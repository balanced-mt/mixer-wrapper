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
/**
 * A Group is a collection of participants.
 */
var Group = (function (_super) {
    __extends(Group, _super);
    function Group(group) {
        var _this = _super.call(this) || this;
        _this.meta = {};
        merge_1.merge(_this, group);
        return _this;
    }
    // TODO: group management, rather than read-only views
    /**
     * Updates this group with new data from the server.
     */
    Group.prototype.update = function (data) {
        merge_1.merge(this, data);
        this.emit('updated', this);
    };
    Group.prototype.destroy = function () {
        this.emit('deleted', this);
    };
    return Group;
}(events_1.EventEmitter));
exports.Group = Group;
//# sourceMappingURL=Group.js.map