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
var Url = require("url");
var errors_1 = require("../errors");
var packets_1 = require("./packets");
var reconnection_1 = require("./reconnection");
/**
 * Close codes that are deemed to be recoverable by the reconnection policy
 */
exports.recoverableCloseCodes = [1000, 1011];
/**
 * SocketState is used to record the status of the websocket connection.
 */
var SocketState;
(function (SocketState) {
    /**
     * A connection attempt has not been made yet.
     */
    SocketState[SocketState["Idle"] = 1] = "Idle";
    /**
     * A connection attempt is currently being made.
     */
    SocketState[SocketState["Connecting"] = 2] = "Connecting";
    /**
     * The socket is connection and data may be sent.
     */
    SocketState[SocketState["Connected"] = 3] = "Connected";
    /**
     * The socket is gracefully closing; after this it will become Idle.
     */
    SocketState[SocketState["Closing"] = 4] = "Closing";
    /**
     * The socket is reconnecting after closing unexpectedly.
     */
    SocketState[SocketState["Reconnecting"] = 5] = "Reconnecting";
    /**
     * Connect was called whilst the old socket was still open.
     */
    SocketState[SocketState["Refreshing"] = 6] = "Refreshing";
})(SocketState = exports.SocketState || (exports.SocketState = {}));
function getDefaults() {
    return {
        url: '',
        replyTimeout: 10000,
        compressionScheme: 'none',
        autoReconnect: true,
        reconnectionPolicy: new reconnection_1.ExponentialReconnectionPolicy(),
        pingInterval: 10 * 1000,
        extraHeaders: {},
        queryParams: {},
    };
}
var InteractiveSocket = (function (_super) {
    __extends(InteractiveSocket, _super);
    function InteractiveSocket(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.state = SocketState.Idle;
        _this.queue = new Set();
        _this.setMaxListeners(Infinity);
        _this.setOptions(options);
        if (InteractiveSocket.WebSocket === undefined) {
            throw new Error('Cannot find a websocket implementation; please provide one by ' +
                'running InteractiveSocket.WebSocket = myWebSocketModule;');
        }
        _this.on('message', function (msg) {
            _this.extractMessage(msg);
        });
        _this.on('open', function () {
            _this.options.reconnectionPolicy.reset();
            _this.state = SocketState.Connected;
            _this.queue.forEach(function (data) { return _this.send(data); });
        });
        _this.on('close', function (evt) {
            // If this close event's code is not within our recoverable code array
            // We raise it as an error and refuse to connect.
            if (exports.recoverableCloseCodes.indexOf(evt.code) === -1) {
                var err = errors_1.InteractiveError.fromSocketMessage({
                    code: evt.code,
                    message: evt.reason,
                });
                _this.state = SocketState.Closing;
                _this.emit('error', err);
                // Refuse to continue, these errors usually mean something is very wrong with our connection.
                return;
            }
            if (_this.state === SocketState.Refreshing) {
                _this.state = SocketState.Idle;
                _this.connect();
                return;
            }
            if (_this.state === SocketState.Closing ||
                !_this.options.autoReconnect) {
                _this.state = SocketState.Idle;
                return;
            }
            _this.state = SocketState.Reconnecting;
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
    InteractiveSocket.prototype.setOptions = function (options) {
        this.options = Object.assign({}, this.options || getDefaults(), options);
        //TODO: Clear up auth here later
        if (this.options.jwt && this.options.authToken) {
            throw new Error('Cannot connect to Constellation with both JWT and OAuth token.');
        }
    };
    /**
     * Open a new socket connection. By default, the socket will auto
     * connect when creating a new instance.
     */
    InteractiveSocket.prototype.connect = function () {
        var _this = this;
        if (this.state === SocketState.Closing) {
            this.state = SocketState.Refreshing;
            return this;
        }
        var defaultHeaders = {
            'X-Protocol-Version': '2.0',
        };
        var headers = Object.assign({}, defaultHeaders, this.options.extraHeaders);
        var extras = {
            headers: headers,
        };
        var url = Url.parse(this.options.url, true);
        // Clear out search so it populates query using the query
        // https://nodejs.org/api/url.html#url_url_format_urlobject
        url.search = null;
        if (this.options.authToken) {
            extras.headers['Authorization'] = "Bearer " + this.options
                .authToken;
        }
        if (this.options.jwt) {
            this.options.queryParams['Authorization'] = "JWT " + this.options
                .jwt;
        }
        url.query = Object.assign({}, url.query, this.options.queryParams);
        this.socket = new InteractiveSocket.WebSocket(Url.format(url), [], extras);
        this.state = SocketState.Connecting;
        this.socket.addEventListener('close', function (evt) {
            return _this.emit('close', evt);
        });
        this.socket.addEventListener('open', function () { return _this.emit('open'); });
        this.socket.addEventListener('message', function (evt) {
            return _this.emit('message', evt.data);
        });
        this.socket.addEventListener('error', function (err) {
            if (_this.state === SocketState.Closing) {
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
    InteractiveSocket.prototype.getState = function () {
        return this.state;
    };
    /**
     * Close gracefully shuts down the websocket.
     */
    InteractiveSocket.prototype.close = function () {
        if (this.state === SocketState.Reconnecting) {
            clearTimeout(this.reconnectTimeout);
            this.state = SocketState.Idle;
            return;
        }
        if (this.state !== SocketState.Idle) {
            this.state = SocketState.Closing;
            this.socket.close(1000, 'Closed normally.');
            this.queue.forEach(function (packet) { return packet.cancel(); });
            this.queue.clear();
        }
    };
    /**
     * Executes an RPC method on the server. Returns a promise which resolves
     * after it completes, or after a timeout occurs.
     */
    InteractiveSocket.prototype.execute = function (method, params, discard) {
        if (params === void 0) { params = {}; }
        if (discard === void 0) { discard = false; }
        var methodObj = new packets_1.Method(method, params, discard);
        return this.send(new packets_1.Packet(methodObj));
    };
    /**
     * Send emits a Method over the websocket, wrapped in a Packet to provide queueing and
     * cancellation. It returns a promise which resolves with the reply payload from the Server.
     */
    InteractiveSocket.prototype.send = function (packet) {
        var _this = this;
        if (packet.getState() === packets_1.PacketState.Cancelled) {
            return Promise.reject(new errors_1.CancelledError());
        }
        this.queue.add(packet);
        // If the socket has not said hello, queue the request and return
        // the promise eventually emitted when it is sent.
        if (this.state !== SocketState.Connected) {
            return new Promise(function (resolve, reject) {
                var timer;
                var onSend;
                var onCancel;
                var onClose;
                onSend = function (data) {
                    clearTimeout(timer);
                    packet.removeListener('cancel', onCancel);
                    _this.removeListener('close', onClose);
                    resolve(data);
                };
                onCancel = function () {
                    clearTimeout(timer);
                    packet.removeListener('send', onSend);
                    _this.removeListener('close', onClose);
                    reject(new errors_1.CancelledError());
                };
                onClose = function () {
                    clearTimeout(timer);
                    packet.removeListener('send', onSend);
                    packet.removeListener('cancel', onCancel);
                    // reject(new CancelledError()); // TODO handle close
                };
                packet.once('send', onSend);
                packet.once('cancel', onCancel);
                _this.once('close', onClose);
                timer = setTimeout(function () {
                    packet.removeListener('send', onSend);
                    packet.removeListener('cancel', onCancel);
                    _this.removeListener('close', onClose);
                    reject(new TimeoutError("Expected to get event send " + JSON.stringify(packet)));
                }, 120 * 1000);
            });
        }
        var timeout = packet.getTimeout(this.options.replyTimeout);
        var promise = new Promise(function (resolve, reject) {
            var timer;
            var onReply;
            var onCancel;
            var onClose;
            onReply = function (data) {
                _this.queue.delete(packet);
                clearTimeout(timer);
                packet.removeListener('cancel', onCancel);
                _this.removeListener('close', onClose);
                if (data.error) {
                    reject(data.error);
                }
                else {
                    resolve(data.result);
                }
            };
            onCancel = function () {
                _this.queue.delete(packet);
                clearTimeout(timer);
                _this.removeListener("reply:" + packet.id(), onReply);
                _this.removeListener('close', onClose);
                reject(new errors_1.CancelledError());
            };
            onClose = function () {
                clearTimeout(timer);
                _this.removeListener("reply:" + packet.id(), onReply);
                packet.removeListener('cancel', onCancel);
                reject(new errors_1.CancelledError()); // if the connection is closed I want to cancel the event
                /*if (this.queue.has(packet)) { // resend if packet is still in the queue
                    packet.setState(PacketState.Pending);
                    this.send(packet).then(
                        (data) => { resolve(data); },
                        (error) => { reject(error); }
                    );
                }*/
            };
            _this.once("reply:" + packet.id(), onReply);
            packet.once('cancel', onCancel);
            _this.once('close', onClose);
            timer = setTimeout(function () {
                _this.removeListener("reply:" + packet.id(), onReply);
                packet.removeListener('cancel', onCancel);
                _this.removeListener('close', onClose);
                reject(new TimeoutError("Expected to get event reply:" + packet.id()));
            }, timeout);
        });
        packet.emit('send', promise);
        packet.setState(packets_1.PacketState.Sending);
        this.sendPacketInner(packet);
        return promise;
    };
    InteractiveSocket.prototype.reply = function (reply) {
        this.sendRaw(reply);
    };
    InteractiveSocket.prototype.sendPacketInner = function (packet) {
        this.sendRaw(packet);
    };
    InteractiveSocket.prototype.sendRaw = function (packet) {
        var data = JSON.stringify(packet);
        var payload = data;
        this.emit('send', payload);
        this.socket.send(payload);
    };
    InteractiveSocket.prototype.extractMessage = function (packet) {
        var messageString;
        messageString = packet;
        var message;
        try {
            message = JSON.parse(messageString);
        }
        catch (err) {
            throw new errors_1.MessageParseError('Message returned was not valid JSON');
        }
        switch (message.type) {
            case 'method':
                this.emit('method', packets_1.Method.fromSocket(message));
                break;
            case 'reply':
                this.emit("reply:" + message.id, packets_1.Reply.fromSocket(message));
                break;
            default:
                throw new errors_1.MessageParseError("Unknown message type \"" + message.type + "\"");
        }
    };
    InteractiveSocket.prototype.getQueueSize = function () {
        return this.queue.size;
    };
    return InteractiveSocket;
}(events_1.EventEmitter));
// WebSocket constructor, may be overridden if the environment
// does not natively support it.
//tslint:disable-next-line:variable-name
InteractiveSocket.WebSocket = typeof WebSocket === 'undefined'
    ? null
    : WebSocket;
exports.InteractiveSocket = InteractiveSocket;
//# sourceMappingURL=Socket.js.map