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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var socket_1 = require("./socket");
var subscription_1 = require("./subscription");
var subscription_2 = require("./subscription");
exports.Subscription = subscription_2.Subscription;
var socket_2 = require("./socket");
exports.SocketState = socket_2.State;
__export(require("./errors"));
var Carina = /** @class */ (function (_super) {
    __extends(Carina, _super);
    function Carina(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.subscriptions = Object.create(null);
        _this.socket = new socket_1.ConstellationSocket(options);
        _this.socket.setMaxListeners(100);
        _this.socket.on('error', function (err) { return _this.emit('error', err); });
        return _this;
    }
    Object.defineProperty(Carina, "WebSocket", {
        get: function () {
            return socket_1.ConstellationSocket.WebSocket;
        },
        /**
         * Set the websocket implementation.
         * You will likely not need to set this in a browser environment.
         * You will not need to set this if WebSocket is globally available.
         *
         * @example
         * Carina.WebSocket = require('ws');
         */
        set: function (ws) {
            socket_1.ConstellationSocket.WebSocket = ws;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets the given options on the socket.
     */
    Carina.prototype.setOptions = function (options) {
        this.socket.setOptions(options);
    };
    /**
     * Boots the connection to constellation.
     */
    Carina.prototype.open = function () {
        this.socket.connect();
        return this;
    };
    /**
     * Frees resources associated with the Constellation connection.
     */
    Carina.prototype.close = function () {
        this.socket.close();
    };
    /**
     * @callback onSubscriptionCb
     * @param {Object} data - The payload for the update.
     */
    /**
     * Subscribe to a live event
     *
     * @param {string} slug
     * @param {onSubscriptionCb} cb - Called each time we receive an event for this slug.
     * @returns {Promise.<>} Resolves once subscribed. Any errors will reject.
     */
    Carina.prototype.subscribe = function (slug, cb) {
        var _this = this;
        var subscription = this.subscriptions[slug];
        if (!subscription) {
            subscription = this.subscriptions[slug]
                = new subscription_1.Subscription(this.socket, slug, function (err) { return _this.emit('error', err); });
        }
        subscription.add(cb);
        return Promise.resolve(); // backwards-compat
    };
    /**
     * Unsubscribe from a live event.
     *
     * @param {string} slug
     * @returns {Promise.<>} Resolves once unsubscribed. Any errors will reject.
     */
    Carina.prototype.unsubscribe = function (slug, listener) {
        var subscription = this.subscriptions[slug];
        if (!subscription) {
            return Promise.resolve();
        }
        if (listener) {
            subscription.remove(listener);
        }
        else {
            subscription.removeAll();
        }
        if (subscription.listenerCount() === 0) {
            delete this.subscriptions[slug];
        }
        return Promise.resolve(); // backwards-compat
    };
    return Carina;
}(events_1.EventEmitter));
exports.Carina = Carina;
//# sourceMappingURL=carina.js.map