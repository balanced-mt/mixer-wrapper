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
})(ControlVariableFlags = exports.ControlVariableFlags || (exports.ControlVariableFlags = {}));
class InteractiveControl {
    constructor(wrapper, id) {
        this.activeScenes = new Map();
        this.activeControls = new Map();
        this.onUpdate = new Event_1.Event();
        this.onDeleted = new Event_1.Event();
        this.dirtyFlags = 0;
        this.lastUpdate = undefined;
        this.updateLock = false;
        this.wrapper = wrapper;
        this.id = id;
    }
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
    onAdded(scene, beamControl) {
        if (this.activeScenes.has(scene.id)) {
            throw new Error(`[InteractiveControl:onAdded] Scene '${scene.id}' already contains control '${this.id}'!`);
        }
        this.activeScenes.set(scene.id, scene);
        this.activeControls.set(scene, beamControl);
    }
    onRemoved(scene) {
        if (!this.activeScenes.has(scene.id)) {
            throw new Error(`[InteractiveControl:onRemoved] Scene '${scene.id}' doesn't contain control '${this.id}'!`);
        }
        this.onDeleted.execute();
        this.activeScenes.delete(scene.id);
        this.activeControls.delete(scene);
    }
    getBeamControl(scene) {
        return this.activeControls.get(scene);
    }
    markDirty(flag) {
        if (this.activeControls.size > 0) {
            this.dirtyFlags |= flag;
        }
    }
    gatherUpdates(dirtyBits, updates) {
    }
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
                        console.error("[InteractiveControl] Handling reject", error);
                    });
                });
            }
            else {
                throw new Error("[InteractiveControl] Dirty but no updates!");
            }
        }
    }
}
exports.InteractiveControl = InteractiveControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVDb250cm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0ludGVyYWN0aXZlQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBUUEsZ0RBQTZDO0FBRTdDLElBQVksb0JBTVg7QUFORCxXQUFZLG9CQUFvQjtJQUMvQiwrREFBYSxDQUFBO0lBQ2IseUVBQWtCLENBQUE7SUFDbEIsdUVBQWlCLENBQUE7SUFDakIsd0VBQWlCLENBQUE7SUFDakIsd0VBQWlCLENBQUE7QUFDbEIsQ0FBQyxFQU5XLG9CQUFvQixHQUFwQiw0QkFBb0IsS0FBcEIsNEJBQW9CLFFBTS9CO0FBRUQ7SUFRQyxZQUFZLE9BQXVDLEVBQUUsRUFBVTtRQUhyRCxpQkFBWSxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3hELG1CQUFjLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUFPL0QsYUFBUSxHQUFrQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBQzNELGNBQVMsR0FBc0IsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQXVEeEMsZUFBVSxHQUFHLENBQUMsQ0FBQztRQVl2QixlQUFVLEdBQVcsU0FBUyxDQUFDO1FBQ3ZCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUF6RTFCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQVdTLE1BQU0sQ0FBTyxlQUFlLENBQXdDLFdBQWMsRUFBRSxTQUFZLEVBQUUsS0FBVzs7WUFDdEgsTUFBTSxNQUFNLEdBQVMsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUV6QyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBRTFCLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztnQkFDeEMsT0FBTyxF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