import { IScene, IControl, IControlData, IGridPlacement } from "beam-interactive-node2";
import { InteractiveControl } from "./InteractiveControl";
import { InteractiveWrapper } from "./InteractiveWrapper";
export declare class InteractiveScene {
    readonly wrapper: InteractiveWrapper;
    private internal?;
    readonly type: string;
    readonly id?: string;
    readonly temporary: boolean;
    private controlsData;
    private controlsMap;
    constructor(wrapper: InteractiveWrapper | undefined, type: string, id?: string);
    /**
     * @Internal
     *
     * Removes all buttons and deletes the scene.
     */
    destroy(): Promise<void>;
    /**
     * @Internal
     *
     * Removes all buttons and deletes the scene.
     */
    destroyOnStop(): Promise<void>;
    /**
     * [Property][Readonly] Returns true is the scene is still valid.
     */
    readonly isValid: boolean;
    /**
     * Adds a control to the scene.
     *
     * Returns a promise which will resolve after the control is fully setup
     */
    addControl(control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]): Promise<void>;
    /**
     * Moves a control to a new position.
     *
     * Returns a promise which will resolve after the control is fully moved
     */
    moveControl(control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]): Promise<void>;
    /**
     * Removes a control from the scene.
     *
     * Returns a promise which will resolve after the control is fully removed
     */
    removeControl(control: InteractiveControl<IControl, IControlData>): Promise<void>;
    /**
     * Return an InteractiveControl for `name`
     */
    getControl(name: string): InteractiveControl<IControl, IControlData>;
    /**
     * Iterates over all controls and executes `callback` for each of them.
     */
    forEachControl(callback: (control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]) => void): void;
    /**
     * Iterates over all controls in async and executes `callback` for each of them.
     *
     * Returns a promise which is resolved after all callbacks have been executed for each control.
     */
    asyncEachControl(callback: (control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]) => Promise<void>): Promise<boolean>;
    private controlsInitialized;
    /**
     * @Internal
     */
    beamSceneInit(internal: IScene): Promise<boolean>;
    /**
     * @Internal
     */
    beamSceneDestroy(): Promise<void>;
}
