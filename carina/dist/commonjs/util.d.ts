/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Returns a promise that's resolved when an event is emitted on the
 * EventEmitter.
 */
export declare function resolveOn<T>(emitter: EventEmitter, event: string, timeout?: number): Promise<T>;
