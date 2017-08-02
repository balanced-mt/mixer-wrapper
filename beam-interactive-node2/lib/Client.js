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
var errors_1 = require("./errors");
var MethodHandlerManager_1 = require("./methods/MethodHandlerManager");
var State_1 = require("./state/State");
var util_1 = require("./util");
var Socket_1 = require("./wire/Socket");
var ClientType;
(function (ClientType) {
    /**
     * A Participant type is used when the client is participating in the session.
     */
    ClientType[ClientType["Participant"] = 0] = "Participant";
    /**
     * A GameClient type is used when the client is running the interactive session.
     */
    ClientType[ClientType["GameClient"] = 1] = "GameClient";
})(ClientType = exports.ClientType || (exports.ClientType = {}));
var Client = (function (_super) {
    __extends(Client, _super);
    /**
     * Constructs and sets up a client of the given type.
     */
    function Client(clientType) {
        var _this = _super.call(this) || this;
        _this.methodHandler = new MethodHandlerManager_1.MethodHandlerManager();
        _this.clientType = clientType;
        _this.state = new State_1.State(clientType);
        _this.state.setClient(_this);
        _this.methodHandler.addHandler('hello', function () {
            _this.emit('hello');
        });
        return _this;
    }
    /**
     * Processes a method through the client's method handler.
     */
    Client.prototype.processMethod = function (method) {
        return this.methodHandler.handle(method);
    };
    /**
     * Creates a socket on the client using the specified options.
     * Use [client.open]{@link Client.open} to open the created socket.
     */
    Client.prototype.createSocket = function (options) {
        var _this = this;
        if (this.socket) {
            // GC the old socket
            if (this.socket.getState() !== Socket_1.SocketState.Closing) {
                this.socket.close();
            }
            this.socket = null;
        }
        this.socket = new Socket_1.InteractiveSocket(options);
        this.socket.on('method', function (method) {
            // Sometimes the client may also want to handle methods,
            // in these cases, if it replies we value it at a higher
            // priority than anything the state handler has. So we
            // only send that one.
            var clientReply = _this.processMethod(method);
            if (clientReply) {
                _this.reply(clientReply);
                return;
            }
            // Replying to a method is sometimes optional, here we let the state system
            // process a message and if it wants replies.
            var reply = _this.state.processMethod(method);
            if (reply) {
                _this.reply(reply);
            }
        });
        this.socket.on('open', function () { return _this.emit('open'); });
        this.socket.on('error', function (err) { return _this.emit('error', err); });
        // Re-emit these for debugging reasons
        this.socket.on('message', function (data) { return _this.emit('message', data); });
        this.socket.on('send', function (data) { return _this.emit('send', data); });
        this.socket.on('close', function (data) { return _this.emit('close', data); });
    };
    /**
     * Sets the given options on the socket.
     */
    Client.prototype.setOptions = function (options) {
        this.socket.setOptions(options);
    };
    /**
     * Opens the connection to interactive.
     */
    Client.prototype.open = function (options) {
        var _this = this;
        this.state.reset();
        this.createSocket(options);
        this.socket.connect();
        return util_1.resolveOn(this, 'open').then(function () { return _this; });
    };
    /**
     * Closes and frees the resources associated with the interactive connection.
     */
    Client.prototype.close = function () {
        if (this.socket) {
            this.socket.close();
        }
    };
    //TODO: Actually implement compression
    /**
     * Begins a negotiation process between the server and this client,
     * the compression preferences of the client are sent to the server and then
     * the server responds with the chosen compression scheme.
     */
    Client.prototype.setCompression = function (preferences) {
        var _this = this;
        return this.socket
            .execute('setCompression', {
            params: preferences,
        })
            .then(function (res) {
            _this.socket.setOptions({
                compressionScheme: res.scheme,
            });
        });
    };
    /**
     * Sends a given reply to the server.
     */
    Client.prototype.reply = function (reply) {
        return this.socket.reply(reply);
    };
    /**
     * Retrieves the scenes stored on the interactive server.
     */
    Client.prototype.getScenes = function () {
        return this.execute('getScenes', null, false);
    };
    /**
     * Retrieves the scenes on the server and hydrates the state store with them.
     */
    Client.prototype.synchronizeScenes = function () {
        var _this = this;
        return this.getScenes().then(function (res) { return _this.state.synchronizeScenes(res); });
    };
    /**
     * Retrieves the groups stored on the interactive server.
     */
    Client.prototype.getGroups = function () {
        return this.execute('getGroups', null, false);
    };
    /**
     * Retrieves the groups on the server and hydrates the state store with them.
     */
    Client.prototype.synchronizeGroups = function () {
        var _this = this;
        return this.getGroups().then(function (res) { return _this.state.synchronizeGroups(res); });
    };
    /**
     * Retrieves and hydrates client side stores with state from the server
     */
    Client.prototype.synchronizeState = function () {
        return Promise.all([
            this.synchronizeGroups(),
            this.synchronizeScenes(),
        ]);
    };
    /**
     * Gets the time from the server as a unix timestamp in UTC.
     */
    Client.prototype.getTime = function () {
        return this.execute('getTime', null, false).then(function (res) {
            return res.time;
        });
    };
    /**
     * Execute will construct and send a method to the server for execution.
     * It will resolve with the server's reply. It is recommended that you use an
     * existing Client method if available instead of manually calling `execute`.
     */
    Client.prototype.execute = function (method, params, discard) {
        return this.socket.execute(method, params, discard);
    };
    Client.prototype.createControls = function (_) {
        throw new errors_1.PermissionDeniedError('createControls', 'Participant');
    };
    Client.prototype.createGroups = function (_) {
        throw new errors_1.PermissionDeniedError('createGroups', 'Participant');
    };
    Client.prototype.createScene = function (_) {
        throw new errors_1.PermissionDeniedError('createScene', 'Participant');
    };
    Client.prototype.createScenes = function (_) {
        throw new errors_1.PermissionDeniedError('createScenes', 'Participant');
    };
    Client.prototype.updateControls = function (_) {
        throw new errors_1.PermissionDeniedError('updateControls', 'Participant');
    };
    Client.prototype.updateGroups = function (_) {
        throw new errors_1.PermissionDeniedError('updateGroups', 'Participant');
    };
    Client.prototype.updateScenes = function (_) {
        throw new errors_1.PermissionDeniedError('updateScenes', 'Participant');
    };
    Client.prototype.updateParticipants = function (_) {
        throw new errors_1.PermissionDeniedError('updateParticipants', 'Participant');
    };
    Client.prototype.giveInput = function (_) {
        throw new errors_1.PermissionDeniedError('giveInput', 'GameClient');
    };
    Client.prototype.deleteControls = function (_) {
        throw new errors_1.PermissionDeniedError('deleteControls', 'Participant');
    };
    Client.prototype.deleteGroup = function (_) {
        throw new errors_1.PermissionDeniedError('deleteGroup', 'Participant');
    };
    Client.prototype.deleteScene = function (_) {
        throw new errors_1.PermissionDeniedError('deleteScene', 'Participant');
    };
    Client.prototype.ready = function (_) {
        throw new errors_1.PermissionDeniedError('ready', 'Participant');
    };
    return Client;
}(events_1.EventEmitter));
exports.Client = Client;
//# sourceMappingURL=Client.js.map