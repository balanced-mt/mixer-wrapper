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
class InteractiveGroup {
    constructor(wrapper, scene, id) {
        // protected readonly internal: ?;
        this.userMap = new Map();
        this.onUserEnterEvent = new Event_1.Event();
        this.onUserLeaveEvent = new Event_1.Event();
        this.wrapper = wrapper;
        this.id = id;
        this.scene = scene;
        this.temporary = (id === undefined);
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            for (var [key, user] of this.userMap) {
                yield user.move(this.wrapper.defaultGroup);
            }
            this.userMap.clear();
            if (this.isValid) {
                this.internal = undefined;
                this.id = undefined;
                this.onUserEnterEvent.clearCallbacks();
                this.onUserLeaveEvent.clearCallbacks();
            }
        });
    }
    get isValid() {
        return this.internal !== undefined;
    }
    getUsers() {
        return this.userMap;
    }
    getUsersCount() {
        return this.userMap.size;
    }
    addUser(user) {
        if (!this.userMap.has(user.userID)) {
            this.userMap.set(user.userID, user);
            this.onUserEnterEvent.execute(user);
        }
    }
    removeUser(user) {
        if (this.userMap.delete(user.userID)) {
            if (user.connected) {
                this.onUserLeaveEvent.execute(user);
            }
        }
    }
    move(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene = scene;
            yield this.wrapper.moveGroup(this, scene);
        });
    }
    /**********************************************************************/
    beamGroupInit(internal) {
        this.internal = internal;
        if (this.temporary) {
            this.id = this.internal.groupID;
        }
    }
    beamGroupDestroy() {
        // TODO delete groups
        this.internal = undefined;
    }
}
exports.InteractiveGroup = InteractiveGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVHcm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9JbnRlcmFjdGl2ZUdyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFJQSxnREFBNkM7QUFNN0M7SUFhQyxZQUFZLE9BQXVDLEVBQUUsS0FBdUIsRUFBRSxFQUFXO1FBTnpGLGtDQUFrQztRQUMxQixZQUFPLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFFMUMscUJBQWdCLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFDNUUscUJBQWdCLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFHM0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFSyxPQUFPOztZQUNaLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzVDLENBQUM7WUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztnQkFDekIsSUFBWSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3hDLENBQUM7UUFDRixDQUFDO0tBQUE7SUFFRCxJQUFJLE9BQU87UUFDVixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUM7SUFDcEMsQ0FBQztJQUVELFFBQVE7UUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNyQixDQUFDO0lBRUQsYUFBYTtRQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQXFCO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztJQUNGLENBQUM7SUFFRCxVQUFVLENBQUMsSUFBcUI7UUFDL0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFFSyxJQUFJLENBQUMsS0FBdUI7O1lBQ2hDLElBQVksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQzVCLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNDLENBQUM7S0FBQTtJQUVELHdFQUF3RTtJQUN4RSxhQUFhLENBQUMsUUFBZ0I7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsSUFBWSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUMxQyxDQUFDO0lBQ0YsQ0FBQztJQUVELGdCQUFnQjtRQUNmLHFCQUFxQjtRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztJQUMzQixDQUFDO0NBQ0Q7QUE3RUQsNENBNkVDIn0=