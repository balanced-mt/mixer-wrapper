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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvY29tbW9uL3V0aWxzL1V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQTtJQUVRLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBVyxFQUFFLEdBQVc7UUFDOUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFXLEVBQUUsR0FBVztRQUNoRCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNiLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRU0sTUFBTSxDQUFDLFNBQVMsQ0FBSSxLQUFVO1FBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFTSxNQUFNLENBQU8sT0FBTyxDQUFDLEVBQVU7O1lBQ3JDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMxQixNQUFNLENBQUMsSUFBSSxPQUFPLENBQVMsT0FBTztnQkFDakMsVUFBVSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzlCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNSLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUFBO0lBRU0sTUFBTSxDQUFPLFNBQVMsQ0FBSSxLQUFTOztZQUN6QyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUksT0FBTztnQkFDNUIsWUFBWSxDQUFDLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQUE7SUFFTSxNQUFNLENBQU8sUUFBUSxDQUFJLEtBQVM7O1lBQ3hDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBSSxPQUFPO2dCQUM1QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDM0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNQLFlBQVksQ0FBQyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQUE7SUFHTSxNQUFNLENBQUMsV0FBVztRQUN4QixNQUFNLEtBQUssR0FBRyxnRUFBZ0UsQ0FBQztRQUMvRSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDNUIsSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUNELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDNUIsSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEgsQ0FBQztRQUNELEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVCLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRyxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNiLENBQUM7O0FBaEJjLGNBQVEsR0FBRyxDQUFDLENBQUM7QUE5QzdCLHNCQStEQyJ9