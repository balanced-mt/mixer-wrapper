/// <reference types="node" />
import { EventEmitter } from 'events';
import { IInteractiveError, InteractiveError } from '../errors';
import { IRawValues } from '../interfaces';
export declare enum PacketState {
    /**
     *  The packet has not been sent yet, it may be queued for later sending.
     */
    Pending = 1,
    /**
     * The packet has been sent over the websocket successfully and we are
     * waiting for a reply.
     */
    Sending = 2,
    /**
     * The packet was replied to, and has now been complete.
     */
    Replied = 3,
    /**
     *  The caller has indicated they no longer wish to be notified about this event.
     */
    Cancelled = 4,
}
/**
 * A Packet is a wrapped Method that can be timed-out or canceled whilst it travels over the wire.
 */
export declare class Packet extends EventEmitter {
    private state;
    private timeout;
    private method;
    constructor(method: Method<any>);
    /**
     * Returns the randomly-assigned numeric ID of the packet.
     * @return {number}
     */
    id(): number;
    /**
     * Aborts sending the message, if it has not been sent yet.
     */
    cancel(): void;
    /**
     * toJSON implements is called in JSON.stringify.
     */
    toJSON(): IRawValues;
    /**
     * Sets the timeout duration on the packet. It defaults to the socket's
     * timeout duration.
     */
    setTimeout(duration: number): void;
    /**
     * Returns the packet's timeout duration, or the default if undefined.
     */
    getTimeout(defaultTimeout: number): number;
    /**
     * Returns the current state of the packet.
     * @return {PacketState}
     */
    getState(): PacketState;
    /**
     * Sets the sequence number on the outgoing packet.
     */
    setSequenceNumber(x: number): this;
    setState(state: PacketState): void;
}
/**
 * A method represents a request from a client to call a method on the recipient.
 * They can contain arguments which the recipient will use as arguments for the method.
 *
 * The Recipient can then reply with a result or an error indicating the method failed.
 */
export declare class Method<T> {
    /**
     * The name of this method
     */
    method: string;
    /**
     * Params to be used as arguments for this method.
     */
    params: T;
    /**
     * If discard is set to true it indicates that this method is not expecting a reply.
     *
     * Recipients should however reply with an error if one is caused by this method.
     */
    discard: boolean;
    /**
     * A Unique id for each method sent.
     */
    id: number;
    readonly type: string;
    seq: number;
    constructor(
        /**
         * The name of this method
         */
        method: string, 
        /**
         * Params to be used as arguments for this method.
         */
        params: T, 
        /**
         * If discard is set to true it indicates that this method is not expecting a reply.
         *
         * Recipients should however reply with an error if one is caused by this method.
         */
        discard?: boolean, 
        /**
         * A Unique id for each method sent.
         */
        id?: number);
    /**
     * Creates a method instance from a JSON decoded socket message.
     * @memberOf Method
     */
    static fromSocket(message: any): Method<IRawValues>;
    /**
     * Creates a reply for this method.
     */
    reply(result: IRawValues, error?: InteractiveError.Base): Reply;
}
/**
 * A reply represents a recipients response to a corresponding method with the same id.
 * It can contain a result or an error indicating that the method failed.
 */
export declare class Reply {
    /**
     * A unique id for this reply, which must match the id of the method it is a reply for.
     */
    id: number;
    /**
     * The result of this method call.
     */
    result: IRawValues;
    /**
     * An error which if present indicates that a method call failed.
     */
    error: IInteractiveError;
    readonly type: string;
    constructor(
        /**
         * A unique id for this reply, which must match the id of the method it is a reply for.
         */
        id: number, 
        /**
         * The result of this method call.
         */
        result?: IRawValues, 
        /**
         * An error which if present indicates that a method call failed.
         */
        error?: IInteractiveError);
    /**
     * Constructs a reply packet from raw values coming in from a socket.
     */
    static fromSocket(message: any): Reply;
    /**
     * Construct a reply packet that indicates an error.
     */
    static fromError(id: number, error: InteractiveError.Base): Reply;
}
