"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { EventTimeoutError } from './errors';
/**
 * Returns a promise that's resolved when an event is emitted on the
 * EventEmitter.
 */
function resolveOn(emitter, event, timeout) {
    if (timeout === void 0) { timeout = 120 * 1000; }
    return new Promise(function (resolve /*, reject*/) {
        var timer;
        var listener = function (data) {
            clearTimeout(timer);
            resolve(data);
        };
        emitter.once(event, listener);
        timer = setTimeout(function () {
            emitter.removeListener(event, listener);
            //TODO HAX reject(new EventTimeoutError(event));
        }, timeout);
    });
}
exports.resolveOn = resolveOn;
//# sourceMappingURL=util.js.map