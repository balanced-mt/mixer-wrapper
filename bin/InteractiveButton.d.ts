import { IButton, IButtonData, IGridPlacement, IInputEvent, IButtonInput } from "beam-interactive-node2";
import { InteractiveWrapper } from "./InteractiveWrapper";
import { InteractiveControl } from "./InteractiveControl";
import { InteractiveScene } from "./InteractiveScene";
import { Event } from "./common/utils/Event";
import { InteractiveUser } from "./InteractiveUser";
export declare class InteractiveButton extends InteractiveControl<IButton, IButtonData> {
    private _text;
    private _tooltip;
    private _sparkCost;
    protected _cooldown: number | undefined;
    protected _progress: number | undefined;
    private _disabled;
    private _forceCooldown;
    private _backgroundColor;
    private _textColor;
    private _focusColor;
    private _accentColor;
    private _borderColor;
    constructor(wrapper: InteractiveWrapper | undefined, id: string, text: string);
    /**
     * [Property] Text displayed on the button
     *
     * This variable automatically propagates to the server.
     */
    text: string;
    /**
     * [Property] Tooltip text
     *
     * This variable automatically propagates to the server.
     */
    tooltip: string;
    /**
     * [Property] Background color
     *
     * This variable automatically propagates to the server.
     */
    backgroundColor: string;
    /**
     * [Property] Text color
     *
     * This variable automatically propagates to the server.
     */
    textColor: string;
    /**
     * [Property] Focus/hover color
     *
     * This variable automatically propagates to the server.
     */
    focusColor: string;
    /**
     * [Property] Accent color (progressbar)
     *
     * This variable automatically propagates to the server.
     */
    accentColor: string;
    /**
     * [Property] Border color
     *
     * This variable automatically propagates to the server.
     */
    borderColor: string;
    /**
     * [Property] Disabled state - Buttons which are disabled cannot be interacted with
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
     * [Property] Progress of the progress bar which is displayed at the bottom of a button
     *
     * This variable automatically propagates to the server.
     */
    progress: number | undefined;
    /**
     * @Deprecated Look at InteractiveButton.progress
     */
    getProgress(): number;
    /**
     * @Deprecated Look at InteractiveButton.progress
     */
    setProgress(progress: number): void;
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
    /**
     * Event called when viewer presses a button.
     */
    onMouseDownEvent: Event<(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) => void>;
    /**
     * Event called when viewer releases a button.
     */
    onMouseUpEvent: Event<(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) => void>;
    private _lastClick;
    protected onMouseDown(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton): void;
    protected onMouseUp(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton): void;
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
