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
var Client_1 = require("./Client");
var ParticipantClient = (function (_super) {
    __extends(ParticipantClient, _super);
    function ParticipantClient() {
        return _super.call(this, Client_1.ClientType.Participant) || this;
    }
    ParticipantClient.prototype.open = function (options) {
        return _super.prototype.open.call(this, {
            url: options.url,
            reconnectChecker: options.reconnectChecker,
            queryParams: __assign({ 'x-protocol-version': '2.0', key: options.key }, options.extraParams),
        });
    };
    /**
     * Sends an input event to the Interactive Server. This should only be called
     * by controls.
     */
    ParticipantClient.prototype.giveInput = function (input) {
        return this.execute('giveInput', input, false);
    };
    return ParticipantClient;
}(Client_1.Client));
exports.ParticipantClient = ParticipantClient;
//# sourceMappingURL=ParticipantClient.js.map