/// <reference types="node" />
import { EventEmitter } from 'events';
export declare enum ClockSyncerState {
    /**
     * Indicates that the clock syncer has JUST started up.
     */
    Started = 0,
    /**
     * Indicates that the clock syncer is actively synchronizing its time with the server.
     */
    Synchronizing = 1,
    /**
     * Indicates that the clock syncer is not actively synchronizing.
     */
    Idle = 2,
    /**
     * Indicates that the clock syncer has been stopped.
     */
    Stopped = 3,
}
export interface IClockSyncOptions {
    /**
     * How often should we check for a sync status
     */
    checkInterval?: number;
    /**
     * When retrieving a time from the server how many samples should we take?
     */
    sampleSize?: number;
    /**
     * If the clock falls this far out of sync, re-sync from the server
     */
    threshold?: number;
    /**
     * the function to call to check the server time. Should resolve with the unix timestamp of the server.
     */
    sampleFunc: () => Promise<number>;
    /**
     * How long to wait between sampling during a sync call.
     */
    sampleDelay?: number;
}
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
export declare class ClockSync extends EventEmitter {
    state: ClockSyncerState;
    private options;
    private deltas;
    private cachedDelta;
    private checkTimer;
    private expectedTime;
    private syncing;
    constructor(options: IClockSyncOptions);
    /**
     * Starts the clock synchronizer. It will emit `delta` events,
     * when it is able to calculate the delta between the client and the server.
     */
    start(): void;
    private checkClock();
    private sync();
    private sample();
    /**
     * Halts the clock synchronizer.
     */
    stop(): void;
    /**
     * Gets the current delta value from the synchronizer.
     */
    getDelta(forceCalculation?: boolean): number;
    private calculateDelta();
    private processResponse(transmitTime, serverTime);
    private addDelta(delta);
}
