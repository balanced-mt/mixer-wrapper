import { IButton, IButtonData, IButtonUpdate } from '../interfaces/controls/IButton';
import { IButtonInput } from '../interfaces/controls/IInput';
import { Control } from './Control';
/**
 * Buttons can be pushed by participants with their mouse or activated with their keyboards.
 */
export declare class Button extends Control<IButtonData> implements IButton {
    /**
     * The text displayed on a button, presented to the participants.
     * Set this value using [setText]{@link Button.setText}
     */
    text: string;
    /**
     * The tooltip text displayed when the participant hovers over the button.
     * Set this value using [setTooltip]{@link Button.setTooltip}
     */
    tooltip: string;
    /**
     * The spark cost of this button in sparks.
     * Set this value using [setCost]{@link Button.setCost}
     */
    cost: number;
    /**
     * A decimalized percentage (0.0 - 1.0) which controls how wide
     * this button's progress bar is.
     *
     * Set this value using [setProgress]{@link Button.setProgress}
     */
    progress: number;
    /**
     * If set this value is the Unix Timestamp at which this button's cooldown will expire.
     * Set this value using [setCooldown]{@link Button.setCooldown}
     */
    cooldown: number;
    /**
     * A keycode which will trigger this button if pressed on a participant's keyboard.
     */
    keyCode: number;
    /**
     * Sets a new text value for this button.
     */
    setText(text: string): Promise<void>;
    /**
     * Sets a new tooltip value for this button.
     */
    setTooltip(tooltip: string): Promise<void>;
    /**
     * Sets a progress value for this button.
     * A decimalized percentage (0.0 - 1.0)
     */
    setProgress(progress: number): Promise<void>;
    /**
     * Sets the cooldown for this button. Specified in Milliseconds.
     * The Client will convert this to a Unix timestamp for you.
     */
    setCooldown(duration: number): Promise<void>;
    /**
     * Sets the spark cost for this button.
     * An Integer greater than 0
     */
    setCost(cost: number): Promise<void>;
    /**
     * Sends an input event from a participant to the server for consumption.
     */
    giveInput(input: IButtonInput): Promise<void>;
    /**
     * Update this button on the server.
     */
    update(controlUpdate: IButtonUpdate): Promise<void>;
}
