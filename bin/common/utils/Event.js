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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvY29tbW9uL3V0aWxzL0V2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxpQ0FBaUM7Ozs7Ozs7Ozs7QUFPakM7SUFHQztRQUZRLGNBQVMsR0FBdUIsRUFBRSxDQUFDO0lBSTNDLENBQUM7SUFFTSxXQUFXLENBQUMsSUFBTyxFQUFFLE9BQWE7UUFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFDRCxvRkFBb0Y7UUFDcEYsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsSUFBSyxJQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN2RixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxHQUFJLElBQVksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDakYsQ0FBQztRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ25CLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLE9BQU87U0FDYixDQUFDLENBQUM7SUFDSixDQUFDO0lBRU0sY0FBYztRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRU0sY0FBYyxDQUFDLElBQU8sRUFBRSxPQUFhO1FBQzNDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVB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