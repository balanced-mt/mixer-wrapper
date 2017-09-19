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
const beam_interactive_node2_1 = require("../beam-interactive-node2");
class InteractiveScene {
    constructor(wrapper, type, id) {
        this.controlsData = [];
        this.controlsMap = new Map();
        this.controlsInitialized = false;
        this.wrapper = wrapper;
        this.type = type;
        this.id = id;
        this.temporary = (id === undefined);
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isValid) {
                yield this.asyncEachControl((control) => __awaiter(this, void 0, void 0, function* () {
                    control.onRemoved(this);
                }));
                yield this.internal.deleteAllControls();
                this.controlsInitialized = false;
                this.internal = undefined;
            }
        });
    }
    get isValid() {
        return this.internal !== undefined;
    }
    addControl(control, position) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.controlsMap.has(control.id)) {
                throw new Error(`[InteractiveScene:addControl] Scene '${this.id}' already contains control '${control.id}'!`);
            }
            let controlData = {
                control: control,
                position: position
            };
            this.controlsData.push(controlData);
            this.controlsMap.set(control.id, controlData);
            if (this.controlsInitialized) {
                let newBeamControl = yield this.internal.createControl(control.getData(this, position));
                control.onAdded(this, newBeamControl);
            }
        });
    }
    moveControl(control, position) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.controlsMap.has(control.id)) {
                throw new Error(`[InteractiveScene:moveControl] Scene '${this.id}' doesn't contain control '${control.id}'!`);
            }
            yield this.removeControl(control);
            yield beam_interactive_node2_1.delay(1000);
            yield this.addControl(control, position);
        });
    }
    removeControl(control) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.controlsMap.has(control.id)) {
                throw new Error(`[InteractiveScene:removeControl] Scene '${this.id}' doesn't contain control '${control.id}'!`);
            }
            let controlData = this.controlsMap.get(control.id);
            for (let i = this.controlsData.length - 1; i >= 0; i--) {
                if (this.controlsData[i].control === control) {
                    this.controlsData.splice(i, 1);
                }
            }
            if (this.controlsInitialized) {
                let beamControl = controlData.control.getBeamControl(this);
                yield this.internal.deleteControl(beamControl.controlID);
                controlData.control.onRemoved(this);
            }
            this.controlsMap.delete(control.id);
        });
    }
    getControl(name) {
        let controlData = this.controlsMap.get(name);
        return controlData !== undefined ? controlData.control : undefined;
    }
    forEachControl(callback) {
        this.controlsData.forEach((controlData) => {
            callback(controlData.control, controlData.position);
        });
    }
    asyncEachControl(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var i = 0; i < this.controlsData.length; i++) {
                var controlData = this.controlsData[i];
                yield callback(controlData.control, controlData.position);
            }
            return true;
        });
    }
    beamSceneInit(internal) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.controlsInitialized) {
                throw new Error(`[InteractiveScene:beamSceneInit] Scene '${this.id}' is already initialized!`);
            }
            this.internal = internal;
            if (this.temporary) {
                this.id = this.internal.sceneID;
            }
            let controlsData = [];
            let controlsMapping = new Map();
            this.controlsInitialized = true;
            this.forEachControl((control, position) => {
                let controlData = control.getData(this, position);
                controlsData.push(controlData);
                controlsMapping.set(controlData.controlID, control);
            });
            let beamControls = yield this.internal.createControls(controlsData);
            beamControls.forEach((beamControl) => {
                controlsMapping.get(beamControl.controlID).onAdded(this, beamControl);
            });
            return true;
        });
    }
    beamSceneDestroy() {
        return __awaiter(this, void 0, void 0, function* () {
            this.forEachControl((control, position) => {
                control.onRemoved(this);
            });
            yield this.internal.deleteAllControls();
            this.internal = undefined;
        });
    }
}
exports.InteractiveScene = InteractiveScene;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVTY2VuZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9JbnRlcmFjdGl2ZVNjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxzRUFNbUM7QUFVbkM7SUFZQyxZQUFZLE9BQXVDLEVBQUUsSUFBWSxFQUFFLEVBQVc7UUFIdEUsaUJBQVksR0FBa0IsRUFBRSxDQUFDO1FBQ2pDLGdCQUFXLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUF1RmxELHdCQUFtQixHQUFHLEtBQUssQ0FBQztRQXBGbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFSyxPQUFPOztZQUNaLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFPLE9BQU87b0JBQ3pDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQSxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1lBQzNCLENBQUM7UUFDRixDQUFDO0tBQUE7SUFFRCxJQUFJLE9BQU87UUFDVixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUM7SUFDcEMsQ0FBQztJQUVLLFVBQVUsQ0FBQyxPQUFtRCxFQUFFLFFBQTBCOztZQUMvRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxJQUFJLENBQUMsRUFBRSwrQkFBK0IsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0csQ0FBQztZQUNELElBQUksV0FBVyxHQUFHO2dCQUNqQixPQUFPLEVBQUUsT0FBTztnQkFDaEIsUUFBUSxFQUFFLFFBQVE7YUFDbEIsQ0FBQztZQUNGLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFOUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN4RixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0YsQ0FBQztLQUFBO0lBRUssV0FBVyxDQUFDLE9BQW1ELEVBQUUsUUFBMEI7O1lBQ2hHLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsSUFBSSxDQUFDLEVBQUUsOEJBQThCLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQy9HLENBQUM7WUFDRCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEMsTUFBTSw4QkFBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQztLQUFBO0lBRUssYUFBYSxDQUFDLE9BQW1EOztZQUN0RSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLElBQUksQ0FBQyxFQUFFLDhCQUE4QixPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNqSCxDQUFDO1lBQ0QsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3hELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQzlDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEMsQ0FBQztZQUNGLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3pELFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRUQsVUFBVSxDQUFDLElBQVk7UUFDdEIsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsTUFBTSxDQUFDLFdBQVcsS0FBSyxTQUFTLEdBQUcsV0FBVyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7SUFDcEUsQ0FBQztJQUVELGNBQWMsQ0FBQyxRQUFtRztRQUNqSCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVc7WUFDckMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUNLLGdCQUFnQixDQUFDLFFBQTRHOztZQUNsSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ25ELElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNELENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2IsQ0FBQztLQUFBO0lBSUssYUFBYSxDQUFDLFFBQWdCOztZQUNuQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxJQUFJLENBQUMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBQ2hHLENBQUM7WUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsSUFBWSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUMxQyxDQUFDO1lBQ0QsSUFBSSxZQUFZLEdBQW1CLEVBQUUsQ0FBQztZQUN0QyxJQUFJLGVBQWUsR0FBNEQsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUV6RixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLEVBQUUsUUFBUTtnQkFDckMsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2xELFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQy9CLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDcEUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVc7Z0JBQ2hDLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2IsQ0FBQztLQUFBO0lBRUssZ0JBQWdCOztZQUNyQixJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxFQUFFLFFBQVE7Z0JBQ3JDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztRQUMzQixDQUFDO0tBQUE7Q0FDRDtBQXJJRCw0Q0FxSUMifQ==