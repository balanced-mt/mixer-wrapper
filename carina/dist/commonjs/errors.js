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
var CarinaError = /** @class */ (function (_super) {
    __extends(CarinaError, _super);
    function CarinaError(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, _this.constructor);
            return _this;
        }
        _this.stack = new Error().stack;
        return _this;
    }
    CarinaError.setProto = function (error) {
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(error, this.prototype);
            return;
        }
        error.__proto__ = this.prototype; // Super emergency fallback
    };
    return CarinaError;
}(Error));
exports.CarinaError = CarinaError;
var CancelledError = /** @class */ (function (_super) {
    __extends(CancelledError, _super);
    function CancelledError() {
        var _this = _super.call(this, 'Packet was cancelled or Carina was closed before a reply was received.') || this;
        CancelledError.setProto(_this);
        return _this;
    }
    return CancelledError;
}(CarinaError));
exports.CancelledError = CancelledError;
var EventTimeoutError = /** @class */ (function (_super) {
    __extends(EventTimeoutError, _super);
    function EventTimeoutError(eventName) {
        var _this = _super.call(this, "Timeout out waiting for event " + eventName) || this;
        _this.eventName = eventName;
        EventTimeoutError.setProto(_this);
        return _this;
    }
    return EventTimeoutError;
}(CarinaError));
exports.EventTimeoutError = EventTimeoutError;
var MessageParseError = /** @class */ (function (_super) {
    __extends(MessageParseError, _super);
    function MessageParseError(msg) {
        var _this = _super.call(this, msg) || this;
        MessageParseError.setProto(_this);
        return _this;
    }
    return MessageParseError;
}(CarinaError));
exports.MessageParseError = MessageParseError;
var ConstellationError;
(function (ConstellationError_1) {
    var ConstellationError = /** @class */ (function (_super) {
        __extends(ConstellationError, _super);
        function ConstellationError(code, message) {
            var _this = _super.call(this, message) || this;
            _this.code = code;
            ConstellationError.setProto(_this);
            return _this;
        }
        return ConstellationError;
    }(CarinaError));
    ConstellationError_1.ConstellationError = ConstellationError;
    var errors = {};
    function from(_a) {
        var code = _a.code, message = _a.message;
        if (errors[code]) {
            return new errors[code](message);
        }
        return new ConstellationError(code, message);
    }
    ConstellationError_1.from = from;
    var InvalidPayload = /** @class */ (function (_super) {
        __extends(InvalidPayload, _super);
        function InvalidPayload(message) {
            var _this = _super.call(this, 4000, message) || this;
            InvalidPayload.setProto(_this);
            return _this;
        }
        return InvalidPayload;
    }(ConstellationError));
    ConstellationError_1.InvalidPayload = InvalidPayload;
    errors[4000] = InvalidPayload;
    var PayloadDecompression = /** @class */ (function (_super) {
        __extends(PayloadDecompression, _super);
        function PayloadDecompression(message) {
            var _this = _super.call(this, 4001, message) || this;
            PayloadDecompression.setProto(_this);
            return _this;
        }
        return PayloadDecompression;
    }(ConstellationError));
    ConstellationError_1.PayloadDecompression = PayloadDecompression;
    errors[4001] = PayloadDecompression;
    var UnknownPacketType = /** @class */ (function (_super) {
        __extends(UnknownPacketType, _super);
        function UnknownPacketType(message) {
            var _this = _super.call(this, 4002, message) || this;
            UnknownPacketType.setProto(_this);
            return _this;
        }
        return UnknownPacketType;
    }(ConstellationError));
    ConstellationError_1.UnknownPacketType = UnknownPacketType;
    errors[4002] = UnknownPacketType;
    var UnknownMethodName = /** @class */ (function (_super) {
        __extends(UnknownMethodName, _super);
        function UnknownMethodName(message) {
            var _this = _super.call(this, 4003, message) || this;
            UnknownMethodName.setProto(_this);
            return _this;
        }
        return UnknownMethodName;
    }(ConstellationError));
    ConstellationError_1.UnknownMethodName = UnknownMethodName;
    errors[4003] = UnknownMethodName;
    var InvalidMethodArguments = /** @class */ (function (_super) {
        __extends(InvalidMethodArguments, _super);
        function InvalidMethodArguments(message) {
            var _this = _super.call(this, 4004, message) || this;
            InvalidMethodArguments.setProto(_this);
            return _this;
        }
        return InvalidMethodArguments;
    }(ConstellationError));
    ConstellationError_1.InvalidMethodArguments = InvalidMethodArguments;
    errors[4004] = InvalidMethodArguments;
    var SessionExpired = /** @class */ (function (_super) {
        __extends(SessionExpired, _super);
        function SessionExpired(message) {
            var _this = _super.call(this, 4005, message) || this;
            SessionExpired.setProto(_this);
            return _this;
        }
        return SessionExpired;
    }(ConstellationError));
    ConstellationError_1.SessionExpired = SessionExpired;
    errors[4005] = SessionExpired;
    var LiveUnknownEvent = /** @class */ (function (_super) {
        __extends(LiveUnknownEvent, _super);
        function LiveUnknownEvent(message) {
            var _this = _super.call(this, 4106, message) || this;
            ConstellationError.setProto(_this);
            return _this;
        }
        return LiveUnknownEvent;
    }(ConstellationError));
    ConstellationError_1.LiveUnknownEvent = LiveUnknownEvent;
    errors[4106] = LiveUnknownEvent;
    var LiveAccessDenied = /** @class */ (function (_super) {
        __extends(LiveAccessDenied, _super);
        function LiveAccessDenied(message) {
            var _this = _super.call(this, 4107, message) || this;
            LiveAccessDenied.setProto(_this);
            return _this;
        }
        return LiveAccessDenied;
    }(ConstellationError));
    ConstellationError_1.LiveAccessDenied = LiveAccessDenied;
    errors[4107] = LiveAccessDenied;
    var LiveAlreadySubscribed = /** @class */ (function (_super) {
        __extends(LiveAlreadySubscribed, _super);
        function LiveAlreadySubscribed(message) {
            var _this = _super.call(this, 4108, message) || this;
            LiveAlreadySubscribed.setProto(_this);
            return _this;
        }
        return LiveAlreadySubscribed;
    }(ConstellationError));
    ConstellationError_1.LiveAlreadySubscribed = LiveAlreadySubscribed;
    errors[4108] = LiveAlreadySubscribed;
    var LiveNotSubscribed = /** @class */ (function (_super) {
        __extends(LiveNotSubscribed, _super);
        function LiveNotSubscribed(message) {
            var _this = _super.call(this, 4109, message) || this;
            LiveNotSubscribed.setProto(_this);
            return _this;
        }
        return LiveNotSubscribed;
    }(ConstellationError));
    ConstellationError_1.LiveNotSubscribed = LiveNotSubscribed;
    errors[4109] = LiveNotSubscribed;
})(ConstellationError = exports.ConstellationError || (exports.ConstellationError = {}));
//# sourceMappingURL=errors.js.map