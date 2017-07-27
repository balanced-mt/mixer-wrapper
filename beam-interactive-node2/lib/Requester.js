"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var https = require("https");
var errors_1 = require("./errors");
var Requester = (function () {
    function Requester() {
    }
    Requester.prototype.request = function (url) {
        return new Promise(function (resolve, reject) {
            var req = https.get(url, function (res) {
                if (res.statusCode !== 200) {
                    reject(new errors_1.HTTPError(res.statusCode, res.statusMessage, res));
                }
                var body = '';
                res.on('data', function (str) { return body = body + str.toString(); });
                res.on('end', function () { return resolve(JSON.parse(body)); });
            });
            req.setTimeout(15 * 1000); //tslint:disable-line
            req.on('error', function (err) { return reject(err); });
            req.on('timeout', function () { return reject(new errors_1.TimeoutError('Request timed out')); });
        });
    };
    return Requester;
}());
exports.Requester = Requester;
//# sourceMappingURL=Requester.js.map