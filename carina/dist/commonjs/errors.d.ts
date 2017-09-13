export declare abstract class CarinaError extends Error {
    readonly message: string;
    constructor(message: string);
    protected static setProto(error: CarinaError): void;
}
export declare class CancelledError extends CarinaError {
    constructor();
}
export declare class EventTimeoutError extends CarinaError {
    eventName: string;
    constructor(eventName: string);
}
export declare class MessageParseError extends CarinaError {
    constructor(msg: string);
}
export declare module ConstellationError {
    class ConstellationError extends CarinaError {
        code: number;
        constructor(code: number, message: string);
    }
    function from({code, message}: {
        code: number;
        message: string;
    }): ConstellationError;
    class InvalidPayload extends ConstellationError {
        constructor(message: string);
    }
    class PayloadDecompression extends ConstellationError {
        constructor(message: string);
    }
    class UnknownPacketType extends ConstellationError {
        constructor(message: string);
    }
    class UnknownMethodName extends ConstellationError {
        constructor(message: string);
    }
    class InvalidMethodArguments extends ConstellationError {
        constructor(message: string);
    }
    class SessionExpired extends ConstellationError {
        constructor(message: string);
    }
    class LiveUnknownEvent extends ConstellationError {
        constructor(message: string);
    }
    class LiveAccessDenied extends ConstellationError {
        constructor(message: string);
    }
    class LiveAlreadySubscribed extends ConstellationError {
        constructor(message: string);
    }
    class LiveNotSubscribed extends ConstellationError {
        constructor(message: string);
    }
}
