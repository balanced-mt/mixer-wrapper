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
            this.internal = undefined;
        });
    }
}
exports.InteractiveScene = InteractiveScene;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVTY2VuZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9JbnRlcmFjdGl2ZVNjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxzRUFNbUM7QUFVbkM7SUFZQyxZQUFZLE9BQXVDLEVBQUUsSUFBWSxFQUFFLEVBQVc7UUFIdEUsaUJBQVksR0FBa0IsRUFBRSxDQUFDO1FBQ2pDLGdCQUFXLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUEwSGxELHdCQUFtQixHQUFHLEtBQUssQ0FBQztRQXZIbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0csT0FBTzs7WUFDWixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDbEIsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBTyxPQUFPO29CQUN6QyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6QixDQUFDLENBQUEsQ0FBQyxDQUFDO2dCQUNILE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN4QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztZQUMzQixDQUFDO1FBQ0YsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDSCxJQUFJLE9BQU87UUFDVixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDRyxVQUFV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