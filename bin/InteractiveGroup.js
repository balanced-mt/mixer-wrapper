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
        this.internal = undefined;
    }
}
exports.InteractiveGroup = InteractiveGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVHcm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9JbnRlcmFjdGl2ZUdyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFJQSxnREFBNkM7QUFNN0M7SUFhQyxZQUFZLE9BQTJCLEVBQUUsS0FBdUIsRUFBRSxFQUFXO1FBTjdFLGtDQUFrQztRQUMxQixZQUFPLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFFMUMscUJBQWdCLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFDNUUscUJBQWdCLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFHM0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFSyxPQUFPOztZQUNaLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNyQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUMzQztZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztnQkFDekIsSUFBWSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQ3ZDO1FBQ0YsQ0FBQztLQUFBO0lBRUQsSUFBSSxPQUFPO1FBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsUUFBUTtRQUNQLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNyQixDQUFDO0lBRUQsYUFBYTtRQUNaLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFxQjtRQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQztJQUNGLENBQUM7SUFFRCxVQUFVLENBQUMsSUFBcUI7UUFDL0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDckMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNuQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3BDO1NBQ0Q7SUFDRixDQUFDO0lBRUssSUFBSSxDQUFDLEtBQXVCOztZQUNoQyxJQUFZLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUM1QixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxDQUFDO0tBQUE7SUFFRCx3RUFBd0U7SUFDeEUsYUFBYSxDQUFDLFFBQWdCO1FBQzdCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixJQUFZLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1NBQ3pDO0lBQ0YsQ0FBQztJQUVELGdCQUFnQjtRQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO0lBQzNCLENBQUM7Q0FDRDtBQTVFRCw0Q0E0RUMifQ==