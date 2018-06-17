"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    static RangeInt(min, max) {
        min = (min) | 0;
        max = (max) | 0;
        return ((Math.random() * (max - min)) + min) | 0;
    }
    static RangeFloat(min, max) {
        min = +(min);
        max = +(max);
        return +((Math.random() * (max - min)) + min);
    }
    static PickArray(array) {
        if (array.length <= 0) {
            return undefined;
        }
        return array[Utils.RangeInt(0, array.length)];
    }
    static Timeout(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastTime = Date.now();
            return new Promise(resolve => {
                setTimeout((args, ms) => {
                    resolve(Date.now() - lastTime);
                }, ms);
            });
        });
    }
    static Immediate(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                setImmediate(() => resolve(value));
            });
        });
    }
    static NextTick(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                if (process !== undefined) {
                    process.nextTick(() => resolve(value));
                }
                else {
                    setImmediate(() => resolve(value));
                }
            });
        });
    }
    static generateHID() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let text = "";
        const time = new Date().valueOf();
        for (let i = 0; i < 8; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        for (let i = 0; i < 2; i++) {
            text += chars.charAt(Math.floor(i > 0 ? Utils.hidIndex / Math.pow(chars.length, i) : Utils.hidIndex) % chars.length);
        }
        Utils.hidIndex++;
        for (let i = 0; i < 6; i++) {
            text += chars.charAt(Math.floor(i > 0 ? time / Math.pow(chars.length, i) : time) % chars.length);
        }
        return text;
    }
}
Utils.hidIndex = 0;
exports.Utils = Utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvY29tbW9uL3V0aWxzL1V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQTtJQUVRLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBVyxFQUFFLEdBQVc7UUFDOUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBVyxFQUFFLEdBQVc7UUFDaEQsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDYixPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFTSxNQUFNLENBQUMsU0FBUyxDQUFJLEtBQVU7UUFDcEMsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUN0QixPQUFPLFNBQVMsQ0FBQztTQUNqQjtRQUNELE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFTSxNQUFNLENBQU8sT0FBTyxDQUFDLEVBQVU7O1lBQ3JDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMxQixPQUFPLElBQUks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