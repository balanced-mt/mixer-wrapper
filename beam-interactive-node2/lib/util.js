"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./errors");
/**
 * Returns a promise that's resolved when an event is emitted on the
 * EventEmitter.
 * @param  {EventEmitter} emitter
 * @param  {string}       event
 * @para   {number}       timeout used to prevent memory leaks
 * @return {Promise<any>}
 */
function resolveOn(emitter, event, timeout) {
    if (timeout === void 0) { timeout = 120 * 1000; }
    var timer;
    var resolved = false;
    var listener;
    var promise = new Promise(function (resolve, reject) {
        listener = function (data) {
            resolved = true;
            resolve(data);
            clearTimeout(timer);
        };
        emitter.once(event, listener);
        timer = setTimeout(function () {
            if (!resolved) {
                emitter.removeListener(event, listener);
                reject(new errors_1.TimeoutError("Expected to get event " + event));
            }
        }, timeout);
    });
    promise.clear = function () {
        if (!resolved) {
            clearTimeout(timer);
            emitter.removeListener(event, listener);
        }
    };
    return promise;
}
exports.resolveOn = resolveOn;
/**
 * Return a promise which is rejected with a TimeoutError after the
 * provided delay.
 * @param  {Number} delay
 * @return {Promise}
 */
function timeout(message, delay) {
    // Capture the stacktrace here, since timeout stacktraces
    // often get mangled or dropped.
    var err = new errors_1.TimeoutError(message);
    return new Promise(function (_, reject) {
        setTimeout(function () { return reject(err); }, delay);
    });
}
exports.timeout = timeout;
function delay(delay, value) {
    return new Promise(function (resolve) {
        setTimeout(function () { return resolve(value); }, delay);
    });
}
exports.delay = delay;
/**
 * Returns a function that calls the wrapped function with only instances of
 * the provided class, and throws them otherwise. This is meant to be used
 * inside `.catch` blocks of promises.
 *
 * Imported from frontend2
 *
 * @example
 * // Suppress an error
 * return foo.catch(only(AlreadyExistsError));
 * // Handle a error
 * return foo.catch(only(AdapterResponseError, err => alert(err.toLocaleString())));
 */
function only(cls, handler) {
    if (handler === void 0) { handler = function () { return null; }; }
    return function (err) {
        if (!(err instanceof cls)) {
            throw err;
        }
        return handler(err);
    };
}
exports.only = only;
//# sourceMappingURL=util.js.map