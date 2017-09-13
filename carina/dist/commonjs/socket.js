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
var errors_1 = require("./errors");
var reconnection_1 = require("./reconnection");
var events_1 = require("events");
var packets_1 = require("./packets");
var pako = require("pako");
// DO NOT EDIT, THIS IS UPDATE BY THE BUILD SCRIPT
var packageVersion = '0.9.1'; // package version
/**
 * SizeThresholdGzipDetector is a GzipDetector which zips all packets longer
 * than a certain number of bytes.
 */
var SizeThresholdGzipDetector = /** @class */ (function () {
    function SizeThresholdGzipDetector(threshold) {
        this.threshold = threshold;
    }
    SizeThresholdGzipDetector.prototype.shouldZip = function (packet) {
        return packet.length > this.threshold;
    };
    return SizeThresholdGzipDetector;
}());
exports.SizeThresholdGzipDetector = SizeThresholdGzipDetector;
/**
 * State is used to record the status of the websocket connection.
 */
var State;
(function (State) {
    // a connection attempt has not been made yet
    State[State["Idle"] = 1] = "Idle";
    // a connection attempt is currently being made
    State[State["Connecting"] = 2] = "Connecting";
    // the socket is connection and data may be sent
    State[State["Connected"] = 3] = "Connected";
    // the socket is gracefully closing; after this it will become Idle
    State[State["Closing"] = 4] = "Closing";
    // the socket is reconnecting after closing unexpectedly
    State[State["Reconnecting"] = 5] = "Reconnecting";
    // connect was called whilst the old socket was still open
    State[State["Refreshing"] = 6] = "Refreshing";
})(State = exports.State || (exports.State = {}));
function getDefaults() {
    return {
        url: 'wss://constellation.mixer.com',
        userAgent: "Carina " + packageVersion,
        replyTimeout: 10000,
        isBot: false,
        gzip: new SizeThresholdGzipDetector(1024),
        autoReconnect: true,
        reconnectionPolicy: new reconnection_1.ExponentialReconnectionPolicy(),
        pingInterval: 10 * 1000,
    };
}
var jwtValidator = /^[\w_-]+?\.[\w_-]+?\.([\w_-]+)?$/i;
/**
 * The ConstellationSocket provides a somewhat low-level RPC framework for
 * interacting with Constellation over a websocket. It also provides
 * reconnection logic.
 */
var ConstellationSocket = /** @class */ (function (_super) {
    __extends(ConstellationSocket, _super);
    function ConstellationSocket(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.setOptions(options);
        if (ConstellationSocket.WebSocket === undefined) {
            throw new Error('Cannot find a websocket implementation; please provide one by ' +
                'running ConstellationSocket.WebSocket = myWebSocketModule;');
        }
        _this.on('message', function (msg) { return _this.extractMessage(msg.data); });
        _this.on('open', function () { return _this.schedulePing(); });
        _this.on('event:hello', function () {
            _this.options.reconnectionPolicy.reset();
            _this.setState(State.Connected);
        });
        // this.on('close', (err: CloseEvent) => this.handleSocketClose(err));
        _this.on('close', function () {
            if (_this.state === State.Refreshing) {
                _this.setState(State.Idle);
                _this.connect();
                return;
            }
            if (_this.state === State.Closing || !_this.options.autoReconnect) {
                _this.setState(State.Idle);
                return;
            }
            _this.setState(State.Reconnecting);
            _this.reconnectTimeout = setTimeout(function () {
                _this.connect();
            }, _this.options.reconnectionPolicy.next());
        });
        return _this;
    }
    /**
     * Set the given options.
     * Defaults and previous option values will be used if not supplied.
     */
    ConstellationSocket.prototype.setOptions = function (options) {
        this.options = __assign({}, getDefaults(), this.options, options);
        if (this.options.jwt && !jwtValidator.test(this.options.jwt)) {
            throw new Error('Invalid jwt');
        }
        if (this.options.jwt && this.options.authToken) {
            throw new Error('Cannot connect to Constellation with both JWT and OAuth token.');
        }
    };
    /**
     * Open a new socket connection. By default, the socket will auto
     * connect when creating a new instance.
     */
    ConstellationSocket.prototype.connect = function () {
        var _this = this;
        if (this.state === State.Closing) {
            this.setState(State.Refreshing);
            return this;
        }
        var protocol = this.options.gzip ? 'cnstl-gzip' : 'cnstl';
        var extras = {
            headers: {
                'User-Agent': this.options.userAgent,
                'X-Is-Bot': this.options.isBot,
            },
        };
        var url = this.options.url;
        if (this.options.authToken) {
            extras.headers['Authorization'] = "Bearer " + this.options.authToken;
        }
        else if (this.options.jwt) {
            url += "?jwt=" + this.options.jwt; // invalid JWTs will cause errors
        }
        this.socket = new ConstellationSocket.WebSocket(url, protocol, extras);
        this.socket.binaryType = 'arraybuffer';
        this.setState(State.Connecting);
        this.rebroadcastEvent('open');
        this.rebroadcastEvent('close');
        this.rebroadcastEvent('message');
        this.socket.addEventListener('error', function (err) {
            if (_this.state === State.Closing) {
                // Ignore errors on a closing socket.
                return;
            }
            _this.emit('error', err);
        });
        return this;
    };
    /**
     * Returns the current state of the socket.
     * @return {State}
     */
    ConstellationSocket.prototype.getState = function () {
        return this.state;
    };
    /**
     * Close gracefully shuts down the websocket.
     */
    ConstellationSocket.prototype.close = function () {
        if (this.state === State.Reconnecting) {
            clearTimeout(this.reconnectTimeout);
            this.setState(State.Idle);
            return;
        }
        this.setState(State.Closing);
        this.socket.close();
        clearTimeout(this.pingTimeout);
    };
    /**
     * Executes an RPC method on the server. Returns a promise which resolves
     * after it completes, or after a timeout occurs.
     */
    ConstellationSocket.prototype.execute = function (method, params) {
        if (params === void 0) { params = {}; }
        return this.send(new packets_1.Packet(method, params));
    };
    /**
     * Send emits a packet over the websocket.
     */
    ConstellationSocket.prototype.send = function (packet) {
        var _this = this;
        var timeout = packet.getTimeout(this.options.replyTimeout);
        var promise = new Promise(function (resolve, reject) {
            var timer;
            var onReply;
            var onClose;
            onReply = function (data) {
                clearTimeout(timer);
                _this.removeListener("close", onClose);
                resolve(data);
            };
            onClose = function () {
                clearTimeout(timer);
                _this.removeListener("reply:" + packet.id(), onReply);
                reject(new errors_1.CancelledError());
            };
            _this.once("reply:" + packet.id(), onReply);
            _this.once("close", onClose);
            timer = setTimeout(function () {
                _this.removeListener("reply:" + packet.id(), onReply);
                _this.removeListener("close", onClose);
                reject(new errors_1.EventTimeoutError("" + packet.id()));
            }, timeout);
        });
        packet.emit('send', promise);
        packet.setState(packets_1.PacketState.Sending);
        this.sendPacketInner(packet);
        return promise;
    };
    ConstellationSocket.prototype.setState = function (state) {
        if (this.state === state) {
            return;
        }
        this.state = state;
        this.emit('state', state);
    };
    ConstellationSocket.prototype.sendPacketInner = function (packet) {
        var data = JSON.stringify(packet);
        var payload = this.options.gzip.shouldZip(data, packet.toJSON())
            ? pako.gzip(data)
            : data;
        this.emit('send', payload);
        this.socket.send(payload);
    };
    ConstellationSocket.prototype.extractMessage = function (packet) {
        var messageString;
        // If the packet is binary, then we need to unzip it
        if (typeof packet !== 'string') {
            messageString = pako.ungzip(packet, { to: 'string' });
        }
        else {
            messageString = packet;
        }
        var message;
        try {
            message = JSON.parse(messageString);
        }
        catch (err) {
            throw new errors_1.MessageParseError('Message returned was not valid JSON');
        }
        // Bump the ping timeout whenever we get a message reply.
        this.schedulePing();
        switch (message.type) {
            case 'event':
                this.emit("event:" + message.event, message.data);
                break;
            case 'reply':
                var err = message.error ? errors_1.ConstellationError.from(message.error) : null;
                this.emit("reply:" + message.id, { err: err, result: message.result });
                break;
            default:
                throw new errors_1.MessageParseError("Unknown message type \"" + message.type + "\"");
        }
    };
    ConstellationSocket.prototype.rebroadcastEvent = function (name) {
        var _this = this;
        this.socket.addEventListener(name, function (evt) { return _this.emit(name, evt); });
    };
    ConstellationSocket.prototype.schedulePing = function () {
        var _this = this;
        clearTimeout(this.pingTimeout);
        this.pingTimeout = setTimeout(function () {
            if (_this.state !== State.Connected) {
                return;
            }
            var packet = new packets_1.Packet('ping', null);
            var timeout = _this.options.replyTimeout;
            setTimeout(function () {
                _this.sendPacketInner(packet);
                _this.emit('ping');
            });
            var timer;
            var onReply;
            var onClose;
            onReply = function () {
                clearTimeout(timer);
                _this.removeListener("close", onClose);
                _this.emit('pong');
            };
            onClose = function () {
                clearTimeout(timer);
                _this.removeListener("reply:" + packet.id(), onReply);
                _this.socket.close();
                _this.emit('warning', new errors_1.CancelledError());
            };
            _this.once("reply:" + packet.id(), onReply);
            _this.once("close", onClose);
            timer = setTimeout(function () {
                _this.removeListener("reply:" + packet.id(), onReply);
                _this.removeListener("close", onClose);
                _this.socket.close();
                _this.emit('warning', new errors_1.EventTimeoutError("ping"));
            }, timeout);
        }, this.options.pingInterval);
    };
    // WebSocket constructor, may be overridden if the environment
    // does not natively support it.
    ConstellationSocket.WebSocket = typeof WebSocket === 'undefined' ? null : WebSocket;
    return ConstellationSocket;
}(events_1.EventEmitter));
exports.ConstellationSocket = ConstellationSocket;
//# sourceMappingURL=socket.js.map