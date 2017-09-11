/// <reference types="node" />
import { EventEmitter } from 'events';
import { IRawValues } from '../interfaces';
import { Packet, Reply } from './packets';
import { IReconnectionPolicy } from './reconnection';
/**
 * Close codes that are deemed to be recoverable by the reconnection policy
 */
export declare const recoverableCloseCodes: number[];
export declare type CompressionScheme = 'none' | 'gzip';
/**
 * SocketOptions are passed to the Interactive Socket and control behavior.
 */
export interface ISocketOptions {
    reconnectionPolicy?: IReconnectionPolicy;
    autoReconnect?: boolean;
    url?: string;
    compressionScheme?: CompressionScheme;
    queryParams?: IRawValues;
    authToken?: string;
    replyTimeout?: number;
    pingInterval?: number;
    extraHeaders?: IRawValues;
    reconnectChecker?: () => Promise<void>;
}
export interface IWebSocketOptions {
    headers: IRawValues;
}
export interface ICloseEvent {
    code: number;
    reason: string;
    wasClean: boolean;
}
/**
 * SocketState is used to record the status of the websocket connection.
 */
export declare enum SocketState {
    /**
     * A connection attempt has not been made yet.
     */
    Idle = 1,
    /**
     * A connection attempt is currently being made.
     */
    Connecting = 2,
    /**
     * The socket is connection and data may be sent.
     */
    Connected = 3,
    /**
     * The socket is gracefully closing; after this it will become Idle.
     */
    Closing = 4,
    /**
     * The socket is reconnecting after closing unexpectedly.
     */
    Reconnecting = 5,
    /**
     * Connect was called whilst the old socket was still open.
     */
    Refreshing = 6,
}
export declare class InteractiveSocket extends EventEmitter {
    static WebSocket: any;
    private reconnectTimeout;
    private options;
    private state;
    private socket;
    private queue;
    private lastSequenceNumber;
    constructor(options?: ISocketOptions);
    /**
     * Set the given options.
     * Defaults and previous option values will be used if not supplied.
     */
    setOptions(options: ISocketOptions): void;
    /**
     * Open a new socket connection. By default, the socket will auto
     * connect when creating a new instance.
     */
    connect(): this;
    /**
     * Returns the current state of the socket.
     * @return {State}
     */
    getState(): SocketState;
    /**
     * Close gracefully shuts down the websocket.
     */
    close(): void;
    /**
     * Executes an RPC method on the server. Returns a promise which resolves
     * after it completes, or after a timeout occurs.
     */
    execute(method: string, params?: IRawValues, discard?: boolean): Promise<any>;
    /**
     * Send emits a Method over the websocket, wrapped in a Packet to provide queueing and
     * cancellation. It returns a promise which resolves with the reply payload from the Server.
     */
    send(packet: Packet): Promise<any>;
    reply(reply: Reply): void;
    private sendPacketInner(packet);
    private sendRaw(packet);
    private extractMessage(packet);
    getQueueSize(): number;
}
