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
                if (this.temporary) {
                    this.onUserEnterEvent.clearCallbacks();
                    this.onUserLeaveEvent.clearCallbacks();
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVHcm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9JbnRlcmFjdGl2ZUdyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFJQSxnREFBNkM7QUFNN0M7SUFhQyxZQUFZLE9BQXVDLEVBQUUsS0FBdUIsRUFBRSxFQUFXO1FBTnpGLGtDQUFrQztRQUMxQixZQUFPLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFFMUMscUJBQWdCLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFDNUUscUJBQWdCLEdBQTJDLElBQUksYUFBSyxFQUFPLENBQUM7UUFHM0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFSyxPQUFPOztZQUNaLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzVDLENBQUM7WUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztnQkFDMUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDdkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7S0FBQTtJQUVELElBQUksT0FBTztRQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsUUFBUTtRQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxhQUFhO1FBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBcUI7UUFDNUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO0lBQ0YsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFxQjtRQUMvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVLLElBQUksQ0FBQyxLQUF1Qjs7WUFDaEMsSUFBWSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDNUIsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0MsQ0FBQztLQUFBO0lBRUQsd0VBQXdFO0lBQ3hFLGFBQWEsQ0FBQyxRQUFnQjtRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNuQixJQUFZLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFDLENBQUM7SUFDRixDQUFDO0lBRUQsZ0JBQWdCO1FBQ2YscUJBQXFCO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO0lBQzNCLENBQUM7Q0FDRDtBQTlFRCw0Q0E4RUMifQ==