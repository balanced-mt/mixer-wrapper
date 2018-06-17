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
const Event_1 = require("./common/utils/Event");
class InteractiveUser {
    constructor(wrapper) {
        this.data = new Map();
        this.onLeaveEvent = new Event_1.Event();
        this.wrapper = wrapper;
    }
    setParticipant(participant, update) {
        return __awaiter(this, void 0, void 0, function* () {
            this.internal = participant;
            if (this.internal.userID === undefined || this.internal.username === undefined) {
                throw new Error("[InteractiveUser::setupInternal] userID or username is undefined");
            }
            this.setupInternal();
            if (update === true) {
                this.setGroup(this.wrapper.getGroup(this.internal.groupID));
            }
            else if (this.group) {
                if (this.group.isValid && this.group.id !== participant.groupID) {
                    this.wrapper.moveUsers([this], this.group);
                }
            }
        });
    }
    removeParticipant(sessionID) {
        if (this.internal && this.internal.sessionID === sessionID) {
            this.internal = undefined;
            this.onLeaveEvent.execute();
            return true;
        }
        return false;
    }
    /**
     * [Property][Readonly] Returns true is the user is still connected
     */
    get connected() {
        return this.internal !== undefined;
    }
    /**
     * [Property][Readonly] Returns userID
     */
    get userID() {
        return this._userID;
    }
    /**
     * [Property][Readonly] Returns username
     */
    get username() {
        return (this.internal !== undefined ? this.internal.username : this._username);
    }
    /**
     * [Property][Readonly] Returns sessionID
     */
    get sessionID() {
        return (this.internal !== undefined ? this.internal.sessionID : undefined);
    }
    getData(name) {
        let data = this.data.get(name);
        if (data === undefined) {
            data = {};
            this.data.set(name, data);
        }
        return data;
    }
    removeData(name) {
        let data = this.data.get(name);
        if (data === undefined) {
            data = {};
            this.data.set(name, data);
        }
        return data;
    }
    /**
     * Moves the user to a new InteractiveGroup.
     *
     * Returns a promise which will resolve after the user is moved
     */
    move(group) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connected) {
                return this.wrapper.moveUsers([this], group);
            }
            else {
                this.setGroup(group);
                return;
            }
        });
    }
    get group() {
        return this._group;
    }
    setGroup(group) {
        if (this._group !== group) {
            if (this._group) {
                this._group.removeUser(this);
            }
            this._group = group;
            if (this.group) {
                this.group.addUser(this);
            }
        }
    }
    setupInternal() {
        this._userID = this.internal.userID;
        this._username = this.internal.username;
    }
}
exports.InteractiveUser = InteractiveUser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0ludGVyYWN0aXZlVXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBSUEsZ0RBQTZDO0FBSzdDO0lBUUMsWUFBWSxPQUEyQjtRQUovQixTQUFJLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7UUFFdkMsaUJBQVksR0FBc0IsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUdsRSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUssY0FBYyxDQUFDLFdBQXlCLEVBQUUsTUFBZ0I7O1lBQzlELElBQVksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDO1lBRXJDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDL0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO2FBQ3BGO1lBRUQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXJCLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtnQkFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDNUQ7aUJBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUN0QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLFdBQVcsQ0FBQyxPQUFPLEVBQUU7b0JBQ2hFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUMzQzthQUNEO1FBQ0YsQ0FBQztLQUFBO0lBRUQs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