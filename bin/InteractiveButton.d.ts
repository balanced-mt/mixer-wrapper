import { IButton, IButtonData, IGridPlacement, IInputEvent, IButtonInput } from "../beam-interactive-node2";
import { InteractiveWrapper } from "./InteractiveWrapper";
import { InteractiveControl } from "./InteractiveControl";
import { InteractiveScene } from "./InteractiveScene";
import { Event } from "./common/utils/Event";
import { InteractiveUser } from "./InteractiveUser";
export declare class InteractiveButton extends InteractiveControl<IButton, IButtonData> {
    private _text;
    private _sparkCost;
    protected _cooldown: number | undefined;
    protected _progress: number | undefined;
    private _disabled;
    constructor(wrapper: InteractiveWrapper | undefined, id: string, text: string);
    text: string;
    disabled: boolean;
    sparkCost: number | undefined;
    setCooldown(cooldown: number, force?: boolean): void;
    getCooldown(): number;
    setProgress(progress: number): void;
    getProgress(): number;
    onMouseDownEvent: Event<(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) => void>;
    onMouseUpEvent: Event<(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) => void>;
    onMouseDown(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton): void;
    onMouseUp(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton): void;
    /**********************************************************************/
    getSceneID(scene: InteractiveScene): string;
    getData(scene: InteractiveScene, position: IGridPlacement[]): IButtonData;
    onAdded(scene: InteractiveScene, beamControl: IButton): void;
    onRemoved(scene: InteractiveScene): void;
    protected gatherUpdates(dirtyBits: number, updates: {
        attribute: string;
        value: any;
    }[]): void;
}
