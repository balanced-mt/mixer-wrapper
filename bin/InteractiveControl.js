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
var ControlVariableFlags;
(function (ControlVariableFlags) {
    ControlVariableFlags[ControlVariableFlags["Text"] = 2] = "Text";
    ControlVariableFlags[ControlVariableFlags["SparkCost"] = 4] = "SparkCost";
    ControlVariableFlags[ControlVariableFlags["Cooldown"] = 8] = "Cooldown";
    ControlVariableFlags[ControlVariableFlags["Disabled"] = 16] = "Disabled";
    ControlVariableFlags[ControlVariableFlags["Progress"] = 32] = "Progress";
    ControlVariableFlags[ControlVariableFlags["Tooltip"] = 64] = "Tooltip";
    ControlVariableFlags[ControlVariableFlags["Placeholder"] = 128] = "Placeholder";
    ControlVariableFlags[ControlVariableFlags["BackgroundColor"] = 256] = "BackgroundColor";
    ControlVariableFlags[ControlVariableFlags["TextColor"] = 512] = "TextColor";
    ControlVariableFlags[ControlVariableFlags["FocusColor"] = 1024] = "FocusColor";
    ControlVariableFlags[ControlVariableFlags["AccentColor"] = 2048] = "AccentColor";
    ControlVariableFlags[ControlVariableFlags["BorderColor"] = 4096] = "BorderColor";
})(ControlVariableFlags = exports.ControlVariableFlags || (exports.ControlVariableFlags = {}));
class InteractiveControl {
    constructor(wrapper, id) {
        this.activeScenes = new Map();
        this.activeControls = new Map();
        /**
         * Event called when control is updated.
         */
        this.onUpdate = new Event_1.Event();
        /**
         * Event called when control is deleted.
         */
        this.onDeleted = new Event_1.Event();
        /**
         * @Internal
         *
         * Dirty flags
         */
        this.dirtyFlags = 0;
        this.lastUpdate = undefined;
        this.updateLock = false;
        this.wrapper = wrapper;
        this.id = id;
    }
    /**
     * Updates a specific attribute.
     */
    static UpdateAttribute(beamControl, attribute, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const packet = {};
            packet.controlID = beamControl.controlID;
            packet[attribute] = value;
            return beamControl.client.updateControls({
                sceneID: beamControl.scene.sceneID,
                controls: [packet],
            });
        });
    }
    /**
     * Updates attributes.
     */
    static UpdateAttributes(beamControl, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const packet = {};
            packet.controlID = beamControl.controlID;
            updates.forEach((update) => {
                packet[update.attribute] = update.value;
            });
            return beamControl.client.updateControls({
                sceneID: beamControl.scene.sceneID,
                controls: [packet],
            });
        });
    }
    /**
     * @Internal
     *
     * Called when control is added to a scene.
     */
    onAdded(scene, beamControl) {
        if (this.activeScenes.has(scene.id)) {
            throw new Error(`[InteractiveControl:onAdded] Scene '${scene.id}' already contains control '${this.id}'!`);
        }
        this.activeScenes.set(scene.id, scene);
        this.activeControls.set(scene, beamControl);
    }
    /**
     * @Internal
     *
     * Called when control is removed from a scene.
     */
    onRemoved(scene) {
        if (!this.activeScenes.has(scene.id)) {
            throw new Error(`[InteractiveControl:onRemoved] Scene '${scene.id}' doesn't contain control '${this.id}'!`);
        }
        this.onDeleted.execute();
        this.activeScenes.delete(scene.id);
        this.activeControls.delete(scene);
    }
    /**
     * @Internal
     *
     * Return the raw Interactive control.
     */
    getBeamControl(scene) {
        return this.activeControls.get(scene);
    }
    /**
     * @Internal
     *
     * Marks flag as dirty forcing an update.
     */
    markDirty(flag) {
        if (this.activeControls.size > 0) {
            this.dirtyFlags |= flag;
        }
    }
    /**
     * @Internal
     *
     * Gathers updates from the control based on dirty flags to send to the server.
     */
    gatherUpdates(dirtyBits, updates) {
    }
    /**
     * @Internal
     */
    internalUpdate(time) {
        this.onUpdate.execute(time);
        // TODO
        // Try to batch first then if something fails mark as no-batch on the next run!
        if (this.activeControls.size <= 0) {
            this.dirtyFlags = 0;
        }
        else if (!this.updateLock && this.dirtyFlags !== 0 && (this.lastUpdate === undefined || this.lastUpdate + 50 < time)) {
            let dirtyBits = this.dirtyFlags;
            this.dirtyFlags = 0;
            this.updateLock = true;
            this.lastUpdate = time;
            let updates = [];
            this.gatherUpdates(dirtyBits, updates);
            if (updates.length > 0) {
                let timeout = setTimeout(() => {
                    this.markDirty(dirtyBits);
                    this.updateLock = false;
                }, 10000);
                Array.from(this.activeControls.values()).forEach((beamControl) => {
                    // TODO handle more than 1 button
                    InteractiveControl.UpdateAttributes(beamControl, updates).then((data) => {
                        clearTimeout(timeout);
                        this.updateLock = false;
                    }).catch((error) => {
                        clearTimeout(timeout);
                        this.markDirty(dirtyBits);
                        this.updateLock = false;
                        console.error("reject", error);
                    });
                });
            }
            else {
                throw new Error("Dirty but no updates!");
            }
        }
    }
}
exports.InteractiveControl = InteractiveControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVDb250cm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0ludGVyYWN0aXZlQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBUUEsZ0RBQTZDO0FBRTdDLElBQVksb0JBYVg7QUFiRCxXQUFZLG9CQUFvQjtJQUMvQiwrREFBYSxDQUFBO0lBQ2IseUVBQWtCLENBQUE7SUFDbEIsdUVBQWlCLENBQUE7SUFDakIsd0VBQWlCLENBQUE7SUFDakIsd0VBQWlCLENBQUE7SUFDakIsc0VBQWdCLENBQUE7SUFDaEIsK0VBQW9CLENBQUE7SUFDcEIsdUZBQXdCLENBQUE7SUFDeEIsMkVBQWtCLENBQUE7SUFDbEIsOEVBQW9CLENBQUE7SUFDcEIsZ0ZBQXFCLENBQUE7SUFDckIsZ0ZBQXFCLENBQUE7QUFDdEIsQ0FBQyxFQWJXLG9CQUFvQixHQUFwQiw0QkFBb0IsS0FBcEIsNEJBQW9CLFFBYS9CO0FBRUQ7SUFjQyxZQUFZLE9BQXVDLEVBQUUsRUFBVTtRQUhyRCxpQkFBWSxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3hELG1CQUFjLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUFPL0Q7O1dBRUc7UUFDSCxhQUFRLEdBQWtDLElBQUksYUFBSyxFQUFPLENBQUM7UUFFM0Q7O1dBRUc7UUFDSCxjQUFTLEdBQXNCLElBQUksYUFBSyxFQUFPLENBQUM7UUFrRmhEOzs7O1dBSUc7UUFDSyxlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBc0J2QixlQUFVLEdBQVcsU0FBUyxDQUFDO1FBQ3ZCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUExSDFCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQXdCRDs7T0FFRztJQUNPLE1BQU0sQ0FBTyxlQUFlLENBQXdDLFdBQWMsRUFBRSxTQUFZLEVBQUUsS0FBVzs7WUFDdEgsTUFBTSxNQUFNLEdBQVMsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUV6QyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBRTFCLE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7Z0JBQ3hDLE9BQU8sRUFBRyxXQUFtQixDQUFDLEtBQUssQ0FBQyxPQUFPO2dCQUMzQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUM7YUFDbEIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDTyxNQUFNLENBQU8sZ0JBQWdCLENBQXdDLFdBQWMsRUFBRSxPQUF3Qzs7WUFDdEksTUFBTSxNQUFNLEdBQVMsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUV6QyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7Z0JBQ3hDLE9BQU8sRUFBRyxXQUFtQixDQUFDLEtBQUssQ0FBQyxPQUFPO2dCQUMzQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUM7YUFDbEIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxLQUF1QixFQUFFLFdBQWM7UUFDOUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsS0FBSyxDQUFDLEVBQUUsK0JBQStCLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNHO1FBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLENBQUMsS0FBdUI7UUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxLQUFLLENBQUMsRUFBRSw4QkFBOEIsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDNUc7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGNBQWMsQ0FBQyxLQUF1QjtRQUNyQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFTRDs7OztPQUlHO0lBQ08sU0FBUyxDQUFDLElBQVk7UUFDL0IsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7WUFDakMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUM7U0FDeEI7SUFDRixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLGFBQWEsQ0FBQyxTQUFpQixFQUFFLE9BQTRDO0lBRXZGLENBQUM7SUFLRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxJQUFZO1FBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRzVCLE9BQU87UUFDUCwrRUFBK0U7UUFHL0UsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUU7WUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7U0FDcEI7YUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFO1lBQ3ZILElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDaEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFFdkIsSUFBSSxPQUFPLEdBQXdDLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN2QyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztnQkFDekIsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNWLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUNoRSxpQ0FBaUM7b0JBQ2pDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFXLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTt3QkFDakYsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztvQkFDekIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7d0JBQ2xCLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7d0JBQ3hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNoQyxDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQzthQUNIO2lCQUFNO2dCQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUN6QztTQUNEO0lBQ0YsQ0FBQztDQUNEO0FBdExELGdEQXNMQyJ9