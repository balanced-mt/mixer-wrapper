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
            packet.etag = beamControl.etag;
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
            packet.etag = beamControl.etag;
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
        else if (this.activeControls.size > 1) {
            throw new Error("NYI");
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
                        console.error("Handling reject", error);
                        // FIXME hax "fix" the broken etag
                        this.wrapper.client.getScenes().then((scenes) => {
                            if (scenes.scenes) {
                                scenes.scenes.forEach((scene) => {
                                    if (scene.controls) {
                                        scene.controls.forEach((control) => {
                                            if (control.controlID === beamControl.controlID) {
                                                console.error("Fixing etag", beamControl.etag, control.etag);
                                                beamControl.etag = control.etag;
                                            }
                                        });
                                    }
                                });
                            }
                        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVDb250cm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0ludGVyYWN0aXZlQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBUUEsZ0RBQTZDO0FBRTdDLElBQVksb0JBTVg7QUFORCxXQUFZLG9CQUFvQjtJQUMvQiwrREFBYSxDQUFBO0lBQ2IseUVBQWtCLENBQUE7SUFDbEIsdUVBQWlCLENBQUE7SUFDakIsd0VBQWlCLENBQUE7SUFDakIsd0VBQWlCLENBQUE7QUFDbEIsQ0FBQyxFQU5XLG9CQUFvQixHQUFwQiw0QkFBb0IsS0FBcEIsNEJBQW9CLFFBTS9CO0FBRUQ7SUFRQyxZQUFZLE9BQXVDLEVBQUUsRUFBVTtRQUhyRCxpQkFBWSxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3hELG1CQUFjLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUFPL0QsYUFBUSxHQUFrQyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBQzNELGNBQVMsR0FBc0IsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQXlEeEMsZUFBVSxHQUFHLENBQUMsQ0FBQztRQVl2QixlQUFVLEdBQVcsU0FBUyxDQUFDO1FBQ3ZCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUEzRTFCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQVdTLE1BQU0sQ0FBTyxlQUFlLENBQXdDLFdBQWMsRUFBRSxTQUFZLEVBQUUsS0FBVzs7WUFDdEgsTUFBTSxNQUFNLEdBQVMsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztZQUMvQixNQUFNLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUM7WUFFekMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUUxQixNQUFNLENB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