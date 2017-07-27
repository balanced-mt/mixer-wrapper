/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Returns a promise that's resolved when an event is emitted on the
 * EventEmitter.
 * @param  {EventEmitter} emitter
 * @param  {string}       event
 * @para   {number}       timeout used to prevent memory leaks
 * @return {Promise<any>}
 */
export declare function resolveOn(emitter: EventEmitter, event: string, timeout?: number): Promise<any> & {
    clear: () => void;
};
/**
 * Return a promise which is rejected with a TimeoutError after the
 * provided delay.
 * @param  {Number} delay
 * @return {Promise}
 */
export declare function timeout(message: string, delay: number): Promise<void>;
/**
 * Returns a promise which is resolved with an optional value after the provided delay
 * @param delay The time in milliseconds to wait before resolving the promise
 * @param value The value to resolve the promise with optional
 */
export declare function delay(delay: number): Promise<void>;
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
export declare function only<T extends Error, U>(cls: {
    new (...args: any[]): T;
}, handler?: (err: T) => U): (err: any) => U;
