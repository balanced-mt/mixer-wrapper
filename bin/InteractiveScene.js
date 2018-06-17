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
const beam_interactive_node2_1 = require("beam-interactive-node2");
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
    /**
     * @Internal
     *
     * Removes all buttons and deletes the scene.
     */
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
    /**
     * @Internal
     *
     * Removes all buttons and deletes the scene.
     */
    destroyOnStop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isValid && this.internal !== undefined) {
                this.internal = undefined;
                yield this.asyncEachControl((control) => __awaiter(this, void 0, void 0, function* () {
                    control.onRemoved(this);
                }));
                this.controlsInitialized = false;
                this.id = undefined;
            }
        });
    }
    /**
     * [Property][Readonly] Returns true is the scene is still valid.
     */
    get isValid() {
        return this.internal !== undefined;
    }
    /**
     * Adds a control to the scene.
     *
     * Returns a promise which will resolve after the control is fully setup
     */
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
    /**
     * Moves a control to a new position.
     *
     * Returns a promise which will resolve after the control is fully moved
     */
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
    /**
     * Removes a control from the scene.
     *
     * Returns a promise which will resolve after the control is fully removed
     */
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
    /**
     * Return an InteractiveControl for `name`
     */
    getControl(name) {
        let controlData = this.controlsMap.get(name);
        return controlData !== undefined ? controlData.control : undefined;
    }
    /**
     * Iterates over all controls and executes `callback` for each of them.
     */
    forEachControl(callback) {
        this.controlsData.forEach((controlData) => {
            callback(controlData.control, controlData.position);
        });
    }
    /**
     * Iterates over all controls in async and executes `callback` for each of them.
     *
     * Returns a promise which is resolved after all callbacks have been executed for each control.
     */
    asyncEachControl(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var i = 0; i < this.controlsData.length; i++) {
                var controlData = this.controlsData[i];
                yield callback(controlData.control, controlData.position);
            }
            return true;
        });
    }
    /**
     * @Internal
     */
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
    /**
     * @Internal
     */
    beamSceneDestroy() {
        return __awaiter(this, void 0, void 0, function* () {
            this.forEachControl((control, position) => {
                control.onRemoved(this);
            });
            yield this.internal.deleteAllControls();
            this.controlsInitialized = false;
            this.internal = undefined;
        });
    }
}
exports.InteractiveScene = InteractiveScene;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVTY2VuZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9JbnRlcmFjdGl2ZVNjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxtRUFNZ0M7QUFVaEM7SUFZQyxZQUFZLE9BQXVDLEVBQUUsSUFBWSxFQUFFLEVBQVc7UUFIdEUsaUJBQVksR0FBa0IsRUFBRSxDQUFDO1FBQ2pDLGdCQUFXLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUEwSWxELHdCQUFtQixHQUFHLEtBQUssQ0FBQztRQXZJbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0csT0FBTzs7WUFDWixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQU8sT0FBTyxFQUFFLEVBQUU7b0JBQzdDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQSxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO2FBQzFCO1FBQ0YsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNHLGFBQWE7O1lBQ2xCLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENB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