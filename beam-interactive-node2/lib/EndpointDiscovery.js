"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./errors");
var EndpointDiscovery = (function () {
    function EndpointDiscovery(requester) {
        this.requester = requester;
    }
    /**
     * Retrieves available interactive servers from Mixer's REST API.
     * Game Clients should connect to the first one in the list and use
     * other servers in the list should a connection attempt to the first
     * fail.
     */
    EndpointDiscovery.prototype.retrieveEndpoints = function (endpoint) {
        if (endpoint === void 0) { endpoint = 'https://mixer.com/api/v1/interactive/hosts'; }
        return this.requester.request(endpoint).then(function (res) {
            if (res.length > 0) {
                return res;
            }
            throw new errors_1.NoInteractiveServersAvailable('No Interactive servers are available, please try again.');
        });
    };
    return EndpointDiscovery;
}());
exports.EndpointDiscovery = EndpointDiscovery;
//# sourceMappingURL=EndpointDiscovery.js.map