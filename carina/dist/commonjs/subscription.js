"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_1 = require("./socket");
var errors_1 = require("./errors");
/**
 * Subscription is attached to a socket and tracks listening functions.
 */
var Subscription = /** @class */ (function () {
    function Subscription(socket, slug, onError) {
        this.socket = socket;
        this.slug = slug;
        this.onError = onError;
        this.listeners = [];
    }
    /**
     * add inserts the listener into the subscription
     */
    Subscription.prototype.add = function (listener) {
        if (this.listeners.length === 0) {
            this.addSocketListener();
        }
        this.listeners.push(listener);
    };
    /**
     * remove removes the listening function.
     */
    Subscription.prototype.remove = function (listener) {
        this.listeners = this.listeners.filter(function (l) { return l !== listener; });
        if (this.listeners.length === 0) {
            this.removeSocketListener();
        }
    };
    /**
     * removeAll destroys all listening functions and unsubscribes from the socket.
     */
    Subscription.prototype.removeAll = function () {
        this.listeners = [];
        this.removeSocketListener();
    };
    /**
     * Returns the number of listening functions attached to the subscription.
     */
    Subscription.prototype.listenerCount = function () {
        return this.listeners.length;
    };
    Subscription.prototype.addSocketListener = function () {
        var _this = this;
        this.socketStateListener = function (state) {
            if (state === socket_1.State.Connected) {
                _this.socket
                    .execute('livesubscribe', { events: [_this.slug] })
                    .catch(function (err) {
                    if (!(err instanceof errors_1.CancelledError)) {
                        _this.onError(err);
                    }
                });
            }
        };
        this.socketDataListener = function (ev) {
            if (ev.channel === _this.slug) {
                _this.listeners.forEach(function (l) { return l(ev.payload); });
            }
        };
        this.socket.on('state', this.socketStateListener);
        this.socket.on('event:live', this.socketDataListener);
        this.socketStateListener(this.socket.getState());
    };
    Subscription.prototype.removeSocketListener = function () {
        if (!this.socketStateListener) {
            return;
        }
        if (this.socket.getState() === socket_1.State.Connected) {
            this.socket
                .execute('liveunsubscribe', { events: [this.slug] })
                .catch(function () { return undefined; }); // don't care about anything here
        }
        this.socket.removeListener('state', this.socketStateListener);
        this.socket.removeListener('event:live', this.socketDataListener);
        this.socketStateListener = null;
        this.socketDataListener = null;
    };
    return Subscription;
}());
exports.Subscription = Subscription;
//# sourceMappingURL=subscription.js.map