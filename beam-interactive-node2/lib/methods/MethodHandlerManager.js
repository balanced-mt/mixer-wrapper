"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../errors");
/**
 * A manager class which allows for methods on the interactive protocol to have handlers registered.
 * When the manager is handed a method, it will look up the relevant method handler and call it.
 */
var MethodHandlerManager = (function () {
    function MethodHandlerManager() {
        this.handlers = {};
    }
    /**
     * Registers a handler for a method name.
     */
    MethodHandlerManager.prototype.addHandler = function (method, handler) {
        this.handlers[method] = handler;
    };
    /**
     * Removes a handler for a method.
     */
    MethodHandlerManager.prototype.removeHandler = function (method) {
        delete this.handlers[method];
    };
    /**
     * Looks up a handler for a given method and calls it.
     */
    MethodHandlerManager.prototype.handle = function (method) {
        if (this.handlers[method.method]) {
            return this.handlers[method.method](method);
        }
        /**
         * When Discard is true a reply is not required,
         * If an error occurs though, we expect the client to tell
         * the server about it.
         *
         * So in the case of a missing method handler, resolve with no reply
         * if discard is true, otherwise throw UnknownMethodName
         */
        if (method.discard) {
            return null;
        }
        throw new errors_1.InteractiveError.UnknownMethodName("Client cannot process " + method.method);
    };
    return MethodHandlerManager;
}());
exports.MethodHandlerManager = MethodHandlerManager;
//# sourceMappingURL=MethodHandlerManager.js.map