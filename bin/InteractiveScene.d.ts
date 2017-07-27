import { IScene, IControl, IControlData, IGridPlacement } from "../beam-interactive-node2";
import { InteractiveControl } from "./InteractiveControl";
import { InteractiveWrapper } from "./InteractiveWrapper";
export declare class InteractiveScene {
    readonly wrapper: InteractiveWrapper | undefined;
    private internal;
    readonly type: string;
    readonly id: string;
    readonly temporary: boolean;
    private controlsData;
    private controlsMap;
    constructor(wrapper: InteractiveWrapper | undefined, type: string, id?: string);
    destroy(): Promise<void>;
    readonly isValid: boolean;
    addControl(control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]): Promise<void>;
    moveControl(control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]): Promise<void>;
    removeControl(control: InteractiveControl<IControl, IControlData>): Promise<void>;
    getControl(name: string): InteractiveControl<IControl, IControlData>;
    forEachControl(callback: (control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]) => void): void;
    asyncEachControl(callback: (control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]) => Promise<void>): Promise<boolean>;
    private controlsInitialized;
    beamSceneInit(internal: IScene): Promise<boolean>;
    beamSceneDestroy(): Promise<void>;
}
