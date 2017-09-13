/// <reference types="node" />
import { EventEmitter } from 'events';
import { ConstellationSocket, SocketOptions } from './socket';
export { Subscription } from './subscription';
export { State as SocketState } from './socket';
export * from './errors';
export declare class Carina extends EventEmitter {
    /**
     * Set the websocket implementation.
     * You will likely not need to set this in a browser environment.
     * You will not need to set this if WebSocket is globally available.
     *
     * @example
     * Carina.WebSocket = require('ws');
     */
    static WebSocket: any;
    socket: ConstellationSocket;
    private subscriptions;
    constructor(options?: SocketOptions);
    /**
     * Sets the given options on the socket.
     */
    setOptions(options: SocketOptions): void;
    /**
     * Boots the connection to constellation.
     */
    open(): this;
    /**
     * Frees resources associated with the Constellation connection.
     */
    close(): void;
    /**
     * @callback onSubscriptionCb
     * @param {Object} data - The payload for the update.
     */
    /**
     * Subscribe to a live event
     *
     * @param {string} slug
     * @param {onSubscriptionCb} cb - Called each time we receive an event for this slug.
     * @returns {Promise.<>} Resolves once subscribed. Any errors will reject.
     */
    subscribe<T>(slug: string, cb: (data: T) => void): Promise<void>;
    /**
     * Unsubscribe from a live event.
     *
     * @param {string} slug
     * @returns {Promise.<>} Resolves once unsubscribed. Any errors will reject.
     */
    unsubscribe(slug: string, listener?: (data: any) => void): Promise<void>;
}
