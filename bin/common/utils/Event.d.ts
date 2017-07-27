export declare class Event<T extends Function> {
    private callbacks;
    constructor();
    addCallback(func: T, thisArg?: any): void;
    clearCallbacks(): void;
    removeCallback(func: T, thisArg?: any): void;
    hasCallback(func: T, thisArg?: any): boolean;
    execute: T;
}
export declare class PromiseEvent<T extends Function> {
    private callbacks;
    constructor();
    addCallback(func: T, thisArg?: any): void;
    clearCallbacks(): void;
    removeCallback(func: T, thisArg?: any): void;
    hasCallback(func: T, thisArg?: any): boolean;
    execute: T;
}
