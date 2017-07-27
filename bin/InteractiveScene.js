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
                this.id = undefined;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVTY2VuZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9JbnRlcmFjdGl2ZVNjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxzRUFNbUM7QUFVbkM7SUFZQyxZQUFZLE9BQXVDLEVBQUUsSUFBWSxFQUFFLEVBQVc7UUFIdEUsaUJBQVksR0FBa0IsRUFBRSxDQUFDO1FBQ2pDLGdCQUFXLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUF3RmxELHdCQUFtQixHQUFHLEtBQUssQ0FBQztRQXJGbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFSyxPQUFPOztZQUNaLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFPLE9BQU87b0JBQ3pDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQSxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO2dCQUN6QixJQUFZLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztZQUM5QixDQUFDO1FBQ0YsQ0FBQztLQUFBO0lBRUQsSUFBSSxPQUFPO1FBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDO0lBQ3BDLENBQUM7SUFFSyxVQUFV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