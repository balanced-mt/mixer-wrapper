"use strict";
// export type TestEvent = Event;
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
    constructor() {
        this.callbacks = [];
    }
    addCallback(func, thisArg) {
        if (!func) {
            throw new Error("Callback can't be null!");
        }
        // Detect the usage of func.bind() - it kills optimization therefore is not allowed.
        if (typeof func.prototype !== "object" && func.name.substr(0, 5) === "bound") {
            throw new Error("Don't use .bind() on functions! (" + func.name + ")");
        }
        this.callbacks.push({
            func: func,
            this: thisArg
        });
    }
    clearCallbacks() {
        this.callbacks = [];
    }
    removeCallback(func, thisArg) {
        const callbacks = Array.from(this.callbacks);
        for (let i = callbacks.length - 1; i >= 0; i--) {
            const callback = callbacks[i];
            if (callback.func === func && callback.this === thisArg) {
                callbacks.splice(i, 1);
            }
        }
        this.callbacks = callbacks;
    }
    hasCallback(func, thisArg) {
        for (let i = this.callbacks.length - 1; i >= 0; i--) {
            const callback = this.callbacks[i];
            if (callback.func === func && callback.this === thisArg) {
                return true;
            }
        }
        return false;
    }
}
exports.Event = Event;
Event.prototype.execute = function () {
    const callbacks = this.callbacks;
    const length = callbacks.length;
    for (let i = 0; i < length; i++) {
        const callback = callbacks[i];
        callback.func.apply(callback.this, arguments);
    }
};
class PromiseEvent {
    constructor() {
        this.callbacks = [];
    }
    addCallback(func, thisArg) {
        if (!func) {
            throw new Error("Callback can't be null!");
        }
        // Detect the usage of func.bind() - it kills optimization therefore is not allowed.
        if (typeof func.prototype !== "object" && func.name.substr(0, 5) === "bound") {
            throw new Error("Don't use .bind() on functions! (" + func.name + ")");
        }
        this.callbacks.push({
            func: func,
            this: thisArg
        });
    }
    clearCallbacks() {
        this.callbacks = [];
    }
    removeCallback(func, thisArg) {
        const callbacks = Array.from(this.callbacks);
        for (let i = callbacks.length - 1; i >= 0; i--) {
            const callback = callbacks[i];
            if (callback.func === func && callback.this === thisArg) {
                callbacks.splice(i, 1);
            }
        }
        this.callbacks = callbacks;
    }
    hasCallback(func, thisArg) {
        for (let i = this.callbacks.length - 1; i >= 0; i--) {
            const callback = this.callbacks[i];
            if (callback.func === func && callback.this === thisArg) {
                return true;
            }
        }
        return false;
    }
}
exports.PromiseEvent = PromiseEvent;
PromiseEvent.prototype.execute = function () {
    return __awaiter(this, arguments, void 0, function* () {
        const callbacks = this.callbacks;
        const length = callbacks.length;
        for (let i = 0; i < length; i++) {
            const callback = callbacks[i];
            yield callback.func.apply(callback.this, arguments);
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvY29tbW9uL3V0aWxzL0V2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxpQ0FBaUM7Ozs7Ozs7Ozs7QUFPakM7SUFHQztRQUZRLGNBQVMsR0FBdUIsRUFBRSxDQUFDO0lBSTNDLENBQUM7SUFFTSxXQUFXLENBQUMsSUFBTyxFQUFFLE9BQWE7UUFDeEMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUMzQztRQUNELG9GQUFvRjtRQUNwRixJQUFJLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLElBQUssSUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLE9BQU8sRUFBRTtZQUN0RixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxHQUFJLElBQVksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDaEY7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztZQUNuQixJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxPQUFPO1NBQ2IsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVNLGNBQWM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVNLGNBQWMsQ0FBQyxJQUFPLEVBQUUsT0FBYTtRQUMzQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3QyxLQUFLLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDL0MsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUks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