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
var PacketState;
(function (PacketState) {
    // The packet has not been sent yet, it may be queued for later sending
    PacketState[PacketState["Pending"] = 1] = "Pending";
    // The packet has been sent over the websocket successfully and we are
    // waiting for a reply.
    PacketState[PacketState["Sending"] = 2] = "Sending";
    // The packet was replied to, and has now been complete.
    PacketState[PacketState["Replied"] = 3] = "Replied";
})(PacketState = exports.PacketState || (exports.PacketState = {}));
/**
 * A Packet is a data type that can be sent over the wire to Constellation.
 */
var Packet = /** @class */ (function (_super) {
    __extends(Packet, _super);
    function Packet(method, params) {
        var _this = _super.call(this) || this;
        _this.state = PacketState.Pending;
        _this.data = {
            id: Packet.packetIncr++,
            type: 'method',
            method: method,
            params: params,
        };
        return _this;
    }
    /**
     * Returns the randomly-assigned numeric ID of the packet.
     * @return {number}
     */
    Packet.prototype.id = function () {
        return this.data.id;
    };
    /**
     * toJSON implements is called in JSON.stringify.
     */
    Packet.prototype.toJSON = function () {
        return this.data;
    };
    /**
     * Sets the timeout duration on the packet. It defaults to the socket's
     * timeout duration.
     */
    Packet.prototype.setTimeout = function (duration) {
        this.timeout = duration;
    };
    /**
     * Returns the packet's timeout duration, or the default if undefined.
     */
    Packet.prototype.getTimeout = function (defaultTimeout) {
        return this.timeout || defaultTimeout;
    };
    /**
     * Returns the current state of the packet.
     * @return {PacketState}
     */
    Packet.prototype.getState = function () {
        return this.state;
    };
    /**
     * Updates the state of the packet.
     * @param {PacketState} state
     */
    Packet.prototype.setState = function (state) {
        if (state === this.state) {
            return;
        }
        this.state = state;
    };
    Packet.packetIncr = 0;
    return Packet;
}(events_1.EventEmitter));
exports.Packet = Packet;
/**
 * Call represents a Constellation method call.
 */
var Call = /** @class */ (function (_super) {
    __extends(Call, _super);
    function Call() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Call;
}(Packet));
exports.Call = Call;
//# sourceMappingURL=packets.js.map