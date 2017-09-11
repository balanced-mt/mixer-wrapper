/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare class BaseError extends Error {
    readonly message: string;
    constructor(message: string);
    protected static setProto(error: BaseError): void;
}
/**
 * Cancelled errors are thrown when the packet is cancelled by the client before
 * a reply was received.
 */
export declare class CancelledError extends BaseError {
    constructor();
}
/**
 * HTTPError is used when a request does not respond successfully.
 */
export declare class HTTPError extends BaseError {
    code: number;
    private res;
    constructor(code: number, message: string, res: IncomingMessage);
    cause(): IncomingMessage;
}
/**
 * This error is thrown when you try to perform an action which is not supported by an
 * instantiated [Client]{@link Client}.
 */
export declare class PermissionDeniedError extends BaseError {
    constructor(operation: string, source: string);
}
/**
 * TimeoutErrors occur when a reply is not received from the server after a defined
 * wait period.
 */
export declare class TimeoutError extends BaseError {
    constructor(message: string);
}
/**
 * MessageParseError indicates that a message received is invalid JSON.
 */
export declare class MessageParseError extends BaseError {
    constructor(message: string);
}
/**
 * NoInteractiveServersAvailable indicates that a request to retrieve
 * available interactive servers failed and that none can be located.
 */
export declare class NoInteractiveServersAvailable extends BaseError {
    constructor(message: string);
}
/**
 * An interactive error, sent in a reply to a method that failed.
 */
export interface IInteractiveError {
    /**
     * A unique numerical code for this error.
     *
     * @example `4019`
     */
    code: number;
    /**
     * A human readable message detailing the cause of this error.
     */
    message: string;
    /**
     * An optional path that points at the element within an interactive session that
     * caused this error to occur.
     */
    path?: string;
}
export declare namespace InteractiveError {
    class Base extends BaseError {
        code: number;
        path: string | null;
        constructor(message: string, code: number);
    }
    const errors: {
        [code: number]: typeof Base;
    };
    const startOfRange = 4000;
    function fromSocketMessage(error: IInteractiveError): Base;
    class CloseUnknown extends Base {
        constructor(message: string);
    }
    class CloseRestarting extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that a message received at the server is invalid JSON.
     */
    class InvalidPayload extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that the server was unable to decompress a frame
     * sent from the client.
     */
    class PayloadDecompression extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that the server did not recognize the type of packet sent to it.
     */
    class UnknownPacketType extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that the server did not recognize the method name sent to it.
     */
    class UnknownMethodName extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that the server was unable to parse the method's arguments.
     */
    class InvalidMethodArguments extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that an invalid transactionId was specified in a `capture` method.
     */
    class InvalidTransactionId extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that a transaction failed to capture because the participant does not have enough sparks.
     */
    class NotEnoughSparks extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that an operation was attempted on a Group that the server does not know about.
     */
    class UnknownGroup extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that the group you're trying to create already exists.
     */
    class GroupAlreadyExists extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that a scene that you're trying to operate on is not known by the server.
     */
    class UnknownSceneId extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that the scene you're trying to create already exists.
     */
    class SceneAlreadyExists extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that you're trying to perform an operation on a control
     * that is not known by the server.
     */
    class UnknownControlId extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that the control you're trying to create already exists.
     */
    class ControlAlreadyExists extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that you're trying to create a control whose type is not
     * recognized by the server.
     */
    class UnknownControlType extends Base {
        constructor(message: string);
    }
    /**
     * Indicates that you're trying to perform an operation on a Participant
     * that the server is not aware of.
     */
    class UnknownParticipant extends Base {
        constructor(message: string);
    }
    /**
     * Sent in a Close frame when the interactive session is ending.
     */
    class SessionClosing extends Base {
        constructor(message: string);
    }
    /**
     * Sent in a close frame when the GameClient exceeds memory usage limits on the server.
     */
    class OutOfMemory extends Base {
        constructor(message: string);
    }
    /**
     * Thrown when an attempt is made to delete a default resource such as a Scene or Group.
     */
    class CannotDeleteDefault extends Base {
        constructor(message: string);
    }
    /**
     * CannotAuthenticate occurs when the server fails to authenticate the client.
     * This is usually caused by the provided Authentication details be invalid or missing.
     */
    class CannotAuthenticate extends Base {
        constructor(message: string);
    }
    /**
     * NoInteractiveVersion occurs when the server is unable to validate your Interactive
     * Project Version ID. This can occur if your project version id is invalid or missing,
     * or if you do not have access to this version.
     */
    class NoInteractiveVersion extends Base {
        constructor(message: string);
    }
    /**
     * SessionConflict occurs when the server detects a conflicting connection from the client.
     * This can occur if the requested channel is already interactive or as a participant if
     * you're already connected to a channel.
     */
    class SessionConflict extends Base {
        constructor(message: string);
    }
    /**
     * ChannelNotInteractive occurs when you try to connect to a channel that is not interactive.
     */
    class ChannelNotInteractive extends Base {
        constructor(message: string);
    }
    /**
     * Indicates input sent from a participant is invalid.
     */
    class BadUserInput extends Base {
        constructor(message: string);
    }
}
