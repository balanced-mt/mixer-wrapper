import { IGridPlacement, IInputEvent, ITextboxData, ITextbox, ITextboxInput } from "beam-interactive-node2";
import { InteractiveWrapper } from "./InteractiveWrapper";
import { InteractiveControl } from "./InteractiveControl";
import { InteractiveScene } from "./InteractiveScene";
import { Event } from "./common/utils/Event";
import { InteractiveUser } from "./InteractiveUser";
export declare class InteractiveTextbox extends InteractiveControl<ITextbox, ITextboxData> {
    private _placeholder;
    private _sparkCost;
    protected _cooldown: number | undefined;
    private _disabled;
    private _forceCooldown;
    private _submit;
    constructor(wrapper: InteractiveWrapper, id: string, submit?: boolean);
    /**
     * [Property] Placeholder text
     *
     * This variable automatically propagates to the server.
     */
    placeholder: string;
    /**
     * [Property] Disabled state - Textboxes which are disabled cannot be interacted with
     *
     * This variable automatically propagates to the server.
     */
    disabled: boolean;
    /**
     * [Property] Spark cost
     *
     * This variable automatically propagates to the server.
     */
    sparkCost: number | undefined;
    /**
     * Returns the current cooldown.
     *
     * Cooldown prevents interaction until it expires
     */
    getCooldown(): number;
    /**
     * Sets the cooldown, if there is another cooldown already active it will pick the highest one.
     *
     * Optional force parameter will force the cooldown.
     *
     * Marks Cooldown as dirty when needed.
     */
    setCooldown(cooldown: number, force?: boolean): void;
    /**
     * [Property] Force cooldown check
     *
     * Force cooldown check will enforce the cooldowns on this end.
     */
    /**
    * [Property] Force cooldown check.
    *
    * Force cooldown check will enforce the cooldowns on this end.
    */
    forceCooldownCheck: boolean;
    onChangeEvent: Event<(event: IInputEvent<ITextboxInput>, participant: InteractiveUser, beamControl: ITextbox) => void>;
    onSubmitEvent: Event<(event: IInputEvent<ITextboxInput>, participant: InteractiveUser, beamControl: ITextbox) => void>;
    private _lastClick;
    protected onChange(event: IInputEvent<ITextboxInput>, participant: InteractiveUser, beamControl: ITextbox): void;
    protected onSubmit(event: IInputEvent<ITextboxInput>, participant: InteractiveUser, beamControl: ITextbox): void;
    /**********************************************************************/
    getSceneID(scene: InteractiveScene): string;
    getData(scene: InteractiveScene, position: IGridPlacement[]): ITextboxData;
    onAdded(scene: InteractiveScene, beamControl: ITextbox): void;
    onRemoved(scene: InteractiveScene): void;
    protected gatherUpdates(dirtyBits: number, updates: {
        attribute: string;
        value: any;
    }[]): void;
}
