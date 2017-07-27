"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var Socket_1 = require("./wire/Socket");
__export(require("./state/Scene"));
__export(require("./state/Group"));
__export(require("./GameClient"));
__export(require("./ParticipantClient"));
__export(require("./constants"));
__export(require("./errors"));
__export(require("./util"));
/**
 * This allows you to specify which WebSocket implementation your
 * environment is using. You do not need to do this in Browser environments.
 *
 * @example `Interactive.setWebsocket(require('ws'));`
 */
function setWebSocket(ws) {
    Socket_1.InteractiveSocket.WebSocket = ws;
}
exports.setWebSocket = setWebSocket;
//# sourceMappingURL=index.js.map