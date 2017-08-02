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
var util_1 = require("./util");
var ClockSyncerState;
(function (ClockSyncerState) {
    /**
     * Indicates that the clock syncer has JUST started up.
     */
    ClockSyncerState[ClockSyncerState["Started"] = 0] = "Started";
    /**
     * Indicates that the clock syncer is actively synchronizing its time with the server.
     */
    ClockSyncerState[ClockSyncerState["Synchronizing"] = 1] = "Synchronizing";
    /**
     * Indicates that the clock syncer is not actively synchronizing.
     */
    ClockSyncerState[ClockSyncerState["Idle"] = 2] = "Idle";
    /**
     * Indicates that the clock syncer has been stopped.
     */
    ClockSyncerState[ClockSyncerState["Stopped"] = 3] = "Stopped";
})(ClockSyncerState = exports.ClockSyncerState || (exports.ClockSyncerState = {}));
var defaultOptions = {
    checkInterval: 30 * 1000,
    sampleSize: 3,
    threshold: 1000,
    sampleDelay: 5000,
};
/**
 * Clock syncer's goal is to keep a local clock in sync with a server clock.
 *
 * It does this by sampling the server time a few times and then monitoring the
 * local clock for any time disturbances. Should these occur it will re-sample the
 * server.
 *
 * After the sample period it is able to provide a delta value for its difference
 * from the server clock, which can be used to make time based adjustments to local
 * time based operations.
 */
var ClockSync = (function (_super) {
    __extends(ClockSync, _super);
    function ClockSync(options) {
        var _this = _super.call(this) || this;
        _this.state = ClockSyncerState.Stopped;
        _this.deltas = [];
        _this.cachedDelta = null;
        _this.options = Object.assign({}, defaultOptions, options);
        return _this;
    }
    /**
     * Starts the clock synchronizer. It will emit `delta` events,
     * when it is able to calculate the delta between the client and the server.
     */
    ClockSync.prototype.start = function () {
        var _this = this;
        this.state = ClockSyncerState.Started;
        this.deltas = [];
        this.sync().then(function () {
            _this.expectedTime = Date.now() + _this.options.checkInterval;
            _this.checkTimer = setInterval(function () { return _this.checkClock(); }, _this.options.checkInterval);
        });
    };
    ClockSync.prototype.checkClock = function () {
        var now = Date.now();
        var diff = Math.abs(now - this.expectedTime);
        if (diff > this.options.threshold && this.syncing === null) {
            this.sync();
        }
        this.expectedTime = Date.now() + this.options.checkInterval;
    };
    ClockSync.prototype.sync = function () {
        var _this = this;
        this.state = ClockSyncerState.Synchronizing;
        var samplePromises = [];
        for (var i = 0; i < this.options.sampleSize; i++) {
            samplePromises.push(util_1.delay(i * this.options.sampleDelay).then(function () { return _this.sample(); }));
        }
        this.syncing = Promise.all(samplePromises).then(function () {
            if (_this.state !== ClockSyncerState.Synchronizing) {
                return;
            }
            _this.state = ClockSyncerState.Idle;
            _this.emit('delta', _this.getDelta());
            return undefined;
        });
        return this.syncing.then(function () { return (_this.syncing = null); });
    };
    ClockSync.prototype.sample = function () {
        var _this = this;
        if (this.state === ClockSyncerState.Stopped) {
            return Promise.resolve(null);
        }
        var transmitTime = Date.now();
        return this.options
            .sampleFunc()
            .then(function (serverTime) { return _this.processResponse(transmitTime, serverTime); })
            .catch(function (err) {
            if (_this.state !== ClockSyncerState.Stopped) {
                return err;
            }
        });
    };
    /**
     * Halts the clock synchronizer.
     */
    ClockSync.prototype.stop = function () {
        this.state = ClockSyncerState.Stopped;
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
        }
    };
    /**
     * Gets the current delta value from the synchronizer.
     */
    ClockSync.prototype.getDelta = function (forceCalculation) {
        if (this.cachedDelta === null || forceCalculation) {
            this.cachedDelta = this.calculateDelta();
        }
        return this.cachedDelta;
    };
    ClockSync.prototype.calculateDelta = function () {
        if (this.deltas.length === 0) {
            return 0;
        }
        if (this.deltas.length === 1) {
            return this.deltas[0];
        }
        var sorted = this.deltas.slice(0).sort();
        var midPoint = Math.floor(sorted.length / 2);
        if (sorted.length % 2) {
            return sorted[midPoint];
        }
        else {
            return (sorted[midPoint + 1] + sorted[midPoint]) / 2;
        }
    };
    ClockSync.prototype.processResponse = function (transmitTime, serverTime) {
        var receiveTime = Date.now();
        var rtt = receiveTime - transmitTime;
        var delta = serverTime - rtt / 2 - transmitTime;
        return this.addDelta(delta);
    };
    ClockSync.prototype.addDelta = function (delta) {
        // Add new one
        this.deltas.push(delta);
        // Re-calculate delta with this number
        return this.getDelta(true);
    };
    return ClockSync;
}(events_1.EventEmitter));
exports.ClockSync = ClockSync;
//# sourceMappingURL=ClockSync.js.map