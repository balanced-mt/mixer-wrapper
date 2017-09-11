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
var BaseError = (function (_super) {
    __extends(BaseError, _super);
    function BaseError(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        if (Error.captureStackTrace) {
            // chrome etc.
            Error.captureStackTrace(_this, _this.constructor);
            return _this;
        }
        var stack = new Error().stack.split('\n'); // removes useless stack frame
        stack.splice(1, 1);
        _this.stack = stack.join('\n');
        return _this;
    }
    BaseError.setProto = function (error) {
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(error, this.prototype);
            return;
        }
        error.__proto__ = this.prototype; // Super emergency fallback
    };
    return BaseError;
}(Error));
exports.BaseError = BaseError;
/**
 * Cancelled errors are thrown when the packet is cancelled by the client before
 * a reply was received.
 */
var CancelledError = (function (_super) {
    __extends(CancelledError, _super);
    function CancelledError() {
        var _this = _super.call(this, 'Packet was cancelled or socket was closed before a reply was received.') || this;
        CancelledError.setProto(_this);
        return _this;
    }
    return CancelledError;
}(BaseError));
exports.CancelledError = CancelledError;
/**
 * HTTPError is used when a request does not respond successfully.
 */
var HTTPError = (function (_super) {
    __extends(HTTPError, _super);
    function HTTPError(code, message, res) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.res = res;
        HTTPError.setProto(_this);
        return _this;
    }
    HTTPError.prototype.cause = function () {
        return this.res;
    };
    return HTTPError;
}(BaseError));
exports.HTTPError = HTTPError;
/**
 * This error is thrown when you try to perform an action which is not supported by an
 * instantiated [Client]{@link Client}.
 */
var PermissionDeniedError = (function (_super) {
    __extends(PermissionDeniedError, _super);
    function PermissionDeniedError(operation, source) {
        var _this = _super.call(this, "You don't have permission to " + operation + " from " + source + "!") || this;
        PermissionDeniedError.setProto(_this);
        return _this;
    }
    return PermissionDeniedError;
}(BaseError));
exports.PermissionDeniedError = PermissionDeniedError;
/**
 * TimeoutErrors occur when a reply is not received from the server after a defined
 * wait period.
 */
var TimeoutError = (function (_super) {
    __extends(TimeoutError, _super);
    function TimeoutError(message) {
        var _this = _super.call(this, message) || this;
        TimeoutError.setProto(_this);
        return _this;
    }
    return TimeoutError;
}(BaseError));
exports.TimeoutError = TimeoutError;
/**
 * MessageParseError indicates that a message received is invalid JSON.
 */
var MessageParseError = (function (_super) {
    __extends(MessageParseError, _super);
    function MessageParseError(message) {
        var _this = _super.call(this, message) || this;
        MessageParseError.setProto(_this);
        return _this;
    }
    return MessageParseError;
}(BaseError));
exports.MessageParseError = MessageParseError;
/**
 * NoInteractiveServersAvailable indicates that a request to retrieve
 * available interactive servers failed and that none can be located.
 */
var NoInteractiveServersAvailable = (function (_super) {
    __extends(NoInteractiveServersAvailable, _super);
    function NoInteractiveServersAvailable(message) {
        var _this = _super.call(this, message) || this;
        NoInteractiveServersAvailable.setProto(_this);
        return _this;
    }
    return NoInteractiveServersAvailable;
}(BaseError));
exports.NoInteractiveServersAvailable = NoInteractiveServersAvailable;
var InteractiveError;
(function (InteractiveError) {
    var Base = (function (_super) {
        __extends(Base, _super);
        function Base(message, code) {
            var _this = _super.call(this, message) || this;
            _this.code = code;
            Base.setProto(_this);
            return _this;
        }
        return Base;
    }(BaseError));
    InteractiveError.Base = Base;
    InteractiveError.errors = {};
    InteractiveError.startOfRange = 4000;
    function fromSocketMessage(error) {
        if (InteractiveError.errors[error.code]) {
            var err = new InteractiveError.errors[error.code](error.message, error.code);
            err.path = error.path;
            return err;
        }
        return new Base(error.message, error.code);
    }
    InteractiveError.fromSocketMessage = fromSocketMessage;
    var CloseUnknown = (function (_super) {
        __extends(CloseUnknown, _super);
        function CloseUnknown(message) {
            var _this = _super.call(this, message, 1011) || this;
            CloseUnknown.setProto(_this);
            return _this;
        }
        return CloseUnknown;
    }(Base));
    InteractiveError.CloseUnknown = CloseUnknown;
    InteractiveError.errors[1011] = CloseUnknown;
    var CloseRestarting = (function (_super) {
        __extends(CloseRestarting, _super);
        function CloseRestarting(message) {
            var _this = _super.call(this, message, 1012) || this;
            CloseRestarting.setProto(_this);
            return _this;
        }
        return CloseRestarting;
    }(Base));
    InteractiveError.CloseRestarting = CloseRestarting;
    InteractiveError.errors[1012] = CloseRestarting;
    /**
     * Indicates that a message received at the server is invalid JSON.
     */
    var InvalidPayload = (function (_super) {
        __extends(InvalidPayload, _super);
        function InvalidPayload(message) {
            var _this = _super.call(this, message, 4000) || this;
            InvalidPayload.setProto(_this);
            return _this;
        }
        return InvalidPayload;
    }(Base));
    InteractiveError.InvalidPayload = InvalidPayload;
    InteractiveError.errors[4000] = InvalidPayload;
    /**
     * Indicates that the server was unable to decompress a frame
     * sent from the client.
     */
    var PayloadDecompression = (function (_super) {
        __extends(PayloadDecompression, _super);
        function PayloadDecompression(message) {
            var _this = _super.call(this, message, 4001) || this;
            PayloadDecompression.setProto(_this);
            return _this;
        }
        return PayloadDecompression;
    }(Base));
    InteractiveError.PayloadDecompression = PayloadDecompression;
    InteractiveError.errors[4001] = PayloadDecompression;
    /**
     * Indicates that the server did not recognize the type of packet sent to it.
     */
    var UnknownPacketType = (function (_super) {
        __extends(UnknownPacketType, _super);
        function UnknownPacketType(message) {
            var _this = _super.call(this, message, 4002) || this;
            UnknownPacketType.setProto(_this);
            return _this;
        }
        return UnknownPacketType;
    }(Base));
    InteractiveError.UnknownPacketType = UnknownPacketType;
    InteractiveError.errors[4002] = UnknownPacketType;
    /**
     * Indicates that the server did not recognize the method name sent to it.
     */
    var UnknownMethodName = (function (_super) {
        __extends(UnknownMethodName, _super);
        function UnknownMethodName(message) {
            var _this = _super.call(this, message, 4003) || this;
            UnknownMethodName.setProto(_this);
            return _this;
        }
        return UnknownMethodName;
    }(Base));
    InteractiveError.UnknownMethodName = UnknownMethodName;
    InteractiveError.errors[4003] = UnknownMethodName;
    /**
     * Indicates that the server was unable to parse the method's arguments.
     */
    var InvalidMethodArguments = (function (_super) {
        __extends(InvalidMethodArguments, _super);
        function InvalidMethodArguments(message) {
            var _this = _super.call(this, message, 4004) || this;
            InvalidMethodArguments.setProto(_this);
            return _this;
        }
        return InvalidMethodArguments;
    }(Base));
    InteractiveError.InvalidMethodArguments = InvalidMethodArguments;
    InteractiveError.errors[4004] = InvalidMethodArguments;
    /**
     * Indicates that an invalid transactionId was specified in a `capture` method.
     */
    var InvalidTransactionId = (function (_super) {
        __extends(InvalidTransactionId, _super);
        function InvalidTransactionId(message) {
            var _this = _super.call(this, message, 4006) || this;
            InvalidTransactionId.setProto(_this);
            return _this;
        }
        return InvalidTransactionId;
    }(Base));
    InteractiveError.InvalidTransactionId = InvalidTransactionId;
    InteractiveError.errors[4006] = InvalidTransactionId;
    /**
     * Indicates that a transaction failed to capture because the participant does not have enough sparks.
     */
    var NotEnoughSparks = (function (_super) {
        __extends(NotEnoughSparks, _super);
        function NotEnoughSparks(message) {
            var _this = _super.call(this, message, 4007) || this;
            NotEnoughSparks.setProto(_this);
            return _this;
        }
        return NotEnoughSparks;
    }(Base));
    InteractiveError.NotEnoughSparks = NotEnoughSparks;
    InteractiveError.errors[4007] = NotEnoughSparks;
    /**
     * Indicates that an operation was attempted on a Group that the server does not know about.
     */
    var UnknownGroup = (function (_super) {
        __extends(UnknownGroup, _super);
        function UnknownGroup(message) {
            var _this = _super.call(this, message, 4008) || this;
            UnknownGroup.setProto(_this);
            return _this;
        }
        return UnknownGroup;
    }(Base));
    InteractiveError.UnknownGroup = UnknownGroup;
    InteractiveError.errors[4008] = UnknownGroup;
    /**
     * Indicates that the group you're trying to create already exists.
     */
    var GroupAlreadyExists = (function (_super) {
        __extends(GroupAlreadyExists, _super);
        function GroupAlreadyExists(message) {
            var _this = _super.call(this, message, 4009) || this;
            GroupAlreadyExists.setProto(_this);
            return _this;
        }
        return GroupAlreadyExists;
    }(Base));
    InteractiveError.GroupAlreadyExists = GroupAlreadyExists;
    InteractiveError.errors[4009] = GroupAlreadyExists;
    /**
     * Indicates that a scene that you're trying to operate on is not known by the server.
     */
    var UnknownSceneId = (function (_super) {
        __extends(UnknownSceneId, _super);
        function UnknownSceneId(message) {
            var _this = _super.call(this, message, 4010) || this;
            UnknownSceneId.setProto(_this);
            return _this;
        }
        return UnknownSceneId;
    }(Base));
    InteractiveError.UnknownSceneId = UnknownSceneId;
    InteractiveError.errors[4010] = UnknownSceneId;
    /**
     * Indicates that the scene you're trying to create already exists.
     */
    var SceneAlreadyExists = (function (_super) {
        __extends(SceneAlreadyExists, _super);
        function SceneAlreadyExists(message) {
            var _this = _super.call(this, message, 4011) || this;
            SceneAlreadyExists.setProto(_this);
            return _this;
        }
        return SceneAlreadyExists;
    }(Base));
    InteractiveError.SceneAlreadyExists = SceneAlreadyExists;
    InteractiveError.errors[4011] = SceneAlreadyExists;
    /**
     * Indicates that you're trying to perform an operation on a control
     * that is not known by the server.
     */
    var UnknownControlId = (function (_super) {
        __extends(UnknownControlId, _super);
        function UnknownControlId(message) {
            var _this = _super.call(this, message, 4012) || this;
            UnknownControlId.setProto(_this);
            return _this;
        }
        return UnknownControlId;
    }(Base));
    InteractiveError.UnknownControlId = UnknownControlId;
    InteractiveError.errors[4012] = UnknownControlId;
    /**
     * Indicates that the control you're trying to create already exists.
     */
    var ControlAlreadyExists = (function (_super) {
        __extends(ControlAlreadyExists, _super);
        function ControlAlreadyExists(message) {
            var _this = _super.call(this, message, 4013) || this;
            ControlAlreadyExists.setProto(_this);
            return _this;
        }
        return ControlAlreadyExists;
    }(Base));
    InteractiveError.ControlAlreadyExists = ControlAlreadyExists;
    InteractiveError.errors[4013] = ControlAlreadyExists;
    /**
     * Indicates that you're trying to create a control whose type is not
     * recognized by the server.
     */
    var UnknownControlType = (function (_super) {
        __extends(UnknownControlType, _super);
        function UnknownControlType(message) {
            var _this = _super.call(this, message, 4014) || this;
            UnknownControlType.setProto(_this);
            return _this;
        }
        return UnknownControlType;
    }(Base));
    InteractiveError.UnknownControlType = UnknownControlType;
    InteractiveError.errors[4014] = UnknownControlType;
    /**
     * Indicates that you're trying to perform an operation on a Participant
     * that the server is not aware of.
     */
    var UnknownParticipant = (function (_super) {
        __extends(UnknownParticipant, _super);
        function UnknownParticipant(message) {
            var _this = _super.call(this, message, 4015) || this;
            UnknownParticipant.setProto(_this);
            return _this;
        }
        return UnknownParticipant;
    }(Base));
    InteractiveError.UnknownParticipant = UnknownParticipant;
    InteractiveError.errors[4015] = UnknownParticipant;
    /**
     * Sent in a Close frame when the interactive session is ending.
     */
    var SessionClosing = (function (_super) {
        __extends(SessionClosing, _super);
        function SessionClosing(message) {
            var _this = _super.call(this, message, 4016) || this;
            SessionClosing.setProto(_this);
            return _this;
        }
        return SessionClosing;
    }(Base));
    InteractiveError.SessionClosing = SessionClosing;
    InteractiveError.errors[4016] = SessionClosing;
    /**
     * Sent in a close frame when the GameClient exceeds memory usage limits on the server.
     */
    var OutOfMemory = (function (_super) {
        __extends(OutOfMemory, _super);
        function OutOfMemory(message) {
            var _this = _super.call(this, message, 4017) || this;
            OutOfMemory.setProto(_this);
            return _this;
        }
        return OutOfMemory;
    }(Base));
    InteractiveError.OutOfMemory = OutOfMemory;
    InteractiveError.errors[4017] = OutOfMemory;
    /**
     * Thrown when an attempt is made to delete a default resource such as a Scene or Group.
     */
    var CannotDeleteDefault = (function (_super) {
        __extends(CannotDeleteDefault, _super);
        function CannotDeleteDefault(message) {
            var _this = _super.call(this, message, 4018) || this;
            CannotDeleteDefault.setProto(_this);
            return _this;
        }
        return CannotDeleteDefault;
    }(Base));
    InteractiveError.CannotDeleteDefault = CannotDeleteDefault;
    InteractiveError.errors[4018] = CannotDeleteDefault;
    /**
     * CannotAuthenticate occurs when the server fails to authenticate the client.
     * This is usually caused by the provided Authentication details be invalid or missing.
     */
    var CannotAuthenticate = (function (_super) {
        __extends(CannotAuthenticate, _super);
        function CannotAuthenticate(message) {
            var _this = _super.call(this, message, 4019) || this;
            CannotAuthenticate.setProto(_this);
            return _this;
        }
        return CannotAuthenticate;
    }(Base));
    InteractiveError.CannotAuthenticate = CannotAuthenticate;
    InteractiveError.errors[4019] = CannotAuthenticate;
    /**
     * NoInteractiveVersion occurs when the server is unable to validate your Interactive
     * Project Version ID. This can occur if your project version id is invalid or missing,
     * or if you do not have access to this version.
     */
    var NoInteractiveVersion = (function (_super) {
        __extends(NoInteractiveVersion, _super);
        function NoInteractiveVersion(message) {
            var _this = _super.call(this, message, 4020) || this;
            NoInteractiveVersion.setProto(_this);
            return _this;
        }
        return NoInteractiveVersion;
    }(Base));
    InteractiveError.NoInteractiveVersion = NoInteractiveVersion;
    InteractiveError.errors[4020] = NoInteractiveVersion;
    /**
     * SessionConflict occurs when the server detects a conflicting connection from the client.
     * This can occur if the requested channel is already interactive or as a participant if
     * you're already connected to a channel.
     */
    var SessionConflict = (function (_super) {
        __extends(SessionConflict, _super);
        function SessionConflict(message) {
            var _this = _super.call(this, message, 4021) || this;
            SessionConflict.setProto(_this);
            return _this;
        }
        return SessionConflict;
    }(Base));
    InteractiveError.SessionConflict = SessionConflict;
    InteractiveError.errors[4021] = SessionConflict;
    /**
     * ChannelNotInteractive occurs when you try to connect to a channel that is not interactive.
     */
    var ChannelNotInteractive = (function (_super) {
        __extends(ChannelNotInteractive, _super);
        function ChannelNotInteractive(message) {
            var _this = _super.call(this, message, 4022) || this;
            ChannelNotInteractive.setProto(_this);
            return _this;
        }
        return ChannelNotInteractive;
    }(Base));
    InteractiveError.ChannelNotInteractive = ChannelNotInteractive;
    InteractiveError.errors[4022] = ChannelNotInteractive;
    /**
     * Indicates input sent from a participant is invalid.
     */
    var BadUserInput = (function (_super) {
        __extends(BadUserInput, _super);
        function BadUserInput(message) {
            var _this = _super.call(this, message, 4999) || this;
            BadUserInput.setProto(_this);
            return _this;
        }
        return BadUserInput;
    }(Base));
    InteractiveError.BadUserInput = BadUserInput;
    InteractiveError.errors[4999] = BadUserInput;
})(InteractiveError = exports.InteractiveError || (exports.InteractiveError = {}));
//# sourceMappingURL=errors.js.map