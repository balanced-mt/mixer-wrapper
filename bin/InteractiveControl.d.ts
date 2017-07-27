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
    readonly wrapper: InteractiveWrapper | undefined;
    readonly id: string;
    protected activeScenes: Map<string, InteractiveScene>;
    protected activeControls: Map<InteractiveScene, T>;
    constructor(wrapper: InteractiveWrapper | undefined, id: string);
    onUpdate: Event<(time: number) => void>;
    onDeleted: Event<() => void>;
    /**********************************************************************/
    abstract getSceneID(scene: InteractiveScene): string;
    abstract getData(scene: InteractiveScene, position: IGridPlacement[]): K;
    protected static UpdateAttribute<T extends IControl, K extends keyof T>(beamControl: T, attribute: K, value: T[K]): Promise<void>;
    protected static UpdateAttributes<T extends IControl, K extends keyof T>(beamControl: T, updates: {
        attribute: K;
        value: T[K];
    }[]): Promise<void>;
    onAdded(scene: InteractiveScene, beamControl: T): void;
    onRemoved(scene: InteractiveScene): void;
    getBeamControl(scene: InteractiveScene): T;
    private dirtyFlags;
    protected markDirty(flag: number): void;
    protected gatherUpdates(dirtyBits: number, updates: {
        attribute: string;
        value: any;
    }[]): void;
    lastUpdate: number;
    private updateLock;
    internalUpdate(time: number): void;
}
