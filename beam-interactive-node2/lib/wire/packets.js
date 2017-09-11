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
var errors_1 = require("../errors");
var PacketState;
(function (PacketState) {
    /**
     *  The packet has not been sent yet, it may be queued for later sending.
     */
    PacketState[PacketState["Pending"] = 1] = "Pending";
    /**
     * The packet has been sent over the websocket successfully and we are
     * waiting for a reply.
     */
    PacketState[PacketState["Sending"] = 2] = "Sending";
    /**
     * The packet was replied to, and has now been complete.
     */
    PacketState[PacketState["Replied"] = 3] = "Replied";
    /**
     *  The caller has indicated they no longer wish to be notified about this event.
     */
    PacketState[PacketState["Cancelled"] = 4] = "Cancelled";
})(PacketState = exports.PacketState || (exports.PacketState = {}));
var maxInt32 = 0xffffffff;
/**
 * A Packet is a wrapped Method that can be timed-out or canceled whilst it travels over the wire.
 */
var Packet = (function (_super) {
    __extends(Packet, _super);
    function Packet(method) {
        var _this = _super.call(this) || this;
        _this.state = PacketState.Pending;
        _this.method = method;
        return _this;
    }
    /**
     * Returns the randomly-assigned numeric ID of the packet.
     * @return {number}
     */
    Packet.prototype.id = function () {
        return this.method.id;
    };
    /**
     * Aborts sending the message, if it has not been sent yet.
     */
    Packet.prototype.cancel = function () {
        this.emit('cancel');
        this.setState(PacketState.Cancelled);
    };
    /**
     * toJSON implements is called in JSON.stringify.
     */
    Packet.prototype.toJSON = function () {
        return this.method;
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
     * Sets the sequence number on the outgoing packet.
     */
    Packet.prototype.setSequenceNumber = function (x) {
        this.method.seq = x;
        return this;
    };
    Packet.prototype.setState = function (state) {
        if (state === this.state) {
            return;
        }
        this.state = state;
    };
    return Packet;
}(events_1.EventEmitter));
exports.Packet = Packet;
/**
 * A method represents a request from a client to call a method on the recipient.
 * They can contain arguments which the recipient will use as arguments for the method.
 *
 * The Recipient can then reply with a result or an error indicating the method failed.
 */
var Method = (function () {
    function Method(
        /**
         * The name of this method
         */
        method, 
        /**
         * Params to be used as arguments for this method.
         */
        params, 
        /**
         * If discard is set to true it indicates that this method is not expecting a reply.
         *
         * Recipients should however reply with an error if one is caused by this method.
         */
        discard, 
        /**
         * A Unique id for each method sent.
         */
        id) {
        if (discard === void 0) { discard = false; }
        if (id === void 0) { id = Math.floor(Math.random() * maxInt32); }
        this.method = method;
        this.params = params;
        this.discard = discard;
        this.id = id;
        this.type = 'method'; //tslint:disable-line
    }
    /**
     * Creates a method instance from a JSON decoded socket message.
     * @memberOf Method
     */
    Method.fromSocket = function (message) {
        return new Method(message.method, message.params, message.discard, message.id);
    };
    /**
     * Creates a reply for this method.
     */
    Method.prototype.reply = function (result, error) {
        if (error === void 0) { error = null; }
        return new Reply(this.id, result, error);
    };
    return Method;
}());
exports.Method = Method;
/**
 * A reply represents a recipients response to a corresponding method with the same id.
 * It can contain a result or an error indicating that the method failed.
 */
var Reply = (function () {
    function Reply(
        /**
         * A unique id for this reply, which must match the id of the method it is a reply for.
         */
        id, 
        /**
         * The result of this method call.
         */
        result, 
        /**
         * An error which if present indicates that a method call failed.
         */
        error) {
        if (result === void 0) { result = null; }
        if (error === void 0) { error = null; }
        this.id = id;
        this.result = result;
        this.error = error;
        this.type = 'reply'; //tslint:disable-line
    }
    /**
     * Constructs a reply packet from raw values coming in from a socket.
     */
    Reply.fromSocket = function (message) {
        var err = message.error
            ? errors_1.InteractiveError.fromSocketMessage(message.error)
            : null;
        return new Reply(message.id, message.result, err);
    };
    /**
     * Construct a reply packet that indicates an error.
     */
    Reply.fromError = function (id, error) {
        return new Reply(id, null, {
            message: error.message,
            code: error.code,
        });
    };
    return Reply;
}());
exports.Reply = Reply;
//# sourceMappingURL=packets.js.map