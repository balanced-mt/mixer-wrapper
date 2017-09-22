import { IControlData, IControl, IGridPlacement } from "../beam-interactive-node2";
import { InteractiveScene } from "./InteractiveScene";
import { InteractiveWrapper } from "./InteractiveWrapper";
import { Event } from "./common/utils/Event";
export declare enum ControlVariableFlags {
    Text = 2,
    SparkCost = 4,
    Cooldown = 8,
    Disabled = 16,
    Progress = 32,
}
export declare abstract class InteractiveControl<T extends IControl, K extends IControlData> {
    /**
     * Instance of InteractiveWrapper that was used to create this control.
     */
    readonly wrapper: InteractiveWrapper | undefined;
    /**
     * Internal control id.
     */
    readonly id: string;
    protected activeScenes: Map<string, InteractiveScene>;
    protected activeControls: Map<InteractiveScene, T>;
    constructor(wrapper: InteractiveWrapper | undefined, id: string);
    /**
     * Event called when control is updated.
     */
    onUpdate: Event<(time: number) => void>;
    /**
     * Event called when control is deleted.
     */
    onDeleted: Event<() => void>;
    /**********************************************************************/
    /**
     * Return the sceneID for the control for a specific InteractiveScene.
     */
    abstract getSceneID(scene: InteractiveScene): string;
    /**
     * Return control data, ready to be sent to the server.
     */
    abstract getData(scene: InteractiveScene, position: IGridPlacement[]): K;
    /**
     * Updates a specific attribute.
     */
    protected static UpdateAttribute<T extends IControl, K extends keyof T>(beamControl: T, attribute: K, value: T[K]): Promise<void>;
    /**
     * Updates attributes.
     */
    protected static UpdateAttributes<T extends IControl, K extends keyof T>(beamControl: T, updates: {
        attribute: K;
        value: T[K];
    }[]): Promise<void>;
    /**
     * @Internal
     *
     * Called when control is added to a scene.
     */
    onAdded(scene: InteractiveScene, beamControl: T): void;
    /**
     * @Internal
     *
     * Called when control is removed from a scene.
     */
    onRemoved(scene: InteractiveScene): void;
    /**
     * @Internal
     *
     * Return the raw Interactive control.
     */
    getBeamControl(scene: InteractiveScene): T;
    /**
     * @Internal
     *
     * Dirty flags
     */
    private dirtyFlags;
    /**
     * @Internal
     *
     * Marks flag as dirty forcing an update.
     */
    protected markDirty(flag: number): void;
    /**
     * @Internal
     *
     * Gathers updates from the control based on dirty flags to send to the server.
     */
    protected gatherUpdates(dirtyBits: number, updates: {
        attribute: string;
        value: any;
    }[]): void;
    lastUpdate: number;
    private updateLock;
    /**
     * @Internal
     */
    internalUpdate(time: number): void;
}
