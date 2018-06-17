import {
	IButton,
	IButtonData,
	IGridPlacement,
	IInputEvent,
	IParticipant,
	IButtonInput
} from "beam-interactive-node2";

import { InteractiveWrapper } from "./InteractiveWrapper";
import { InteractiveControl, ControlVariableFlags } from "./InteractiveControl";
import { InteractiveScene } from "./InteractiveScene";

import { Event } from "./common/utils/Event";
import { InteractiveUser } from "./InteractiveUser";

export class InteractiveButton extends InteractiveControl<IButton, IButtonData>{

	private _text: string;
	private _tooltip: string;
	private _sparkCost: number | undefined = undefined;
	protected _cooldown: number | undefined = undefined;
	protected _progress: number | undefined = undefined;
	private _disabled: boolean = false;
	private _forceCooldown: boolean = true;

	// style
	private _backgroundColor: string = "#222222";
	private _textColor: string = "#FFFFFF";
	private _focusColor: string = "#444444";
	private _accentColor: string = "#AAAAAA";
	private _borderColor: string = "#666666";

	constructor(wrapper: InteractiveWrapper | undefined, id: string, text: string) {
		super(wrapper, id);
		this.text = text;
	}

	/**
	 * [Property] Text displayed on the button
	 * 
	 * This variable automatically propagates to the server.
	 */
	get text() {
		return this._text;
	}

	set text(text: string) {
		if (this._text !== text) {
			this._text = text;
			this.markDirty(ControlVariableFlags.Text);
		}
	}

	/**
	 * [Property] Tooltip text
	 * 
	 * This variable automatically propagates to the server.
	 */
	get tooltip() {
		return this._tooltip;
	}

	set tooltip(tooltip: string) {
		if (this._tooltip !== tooltip) {
			// this._tooltip = tooltip;
			// this.markDirty(ControlVariableFlags.Tooltip);
		}
	}


	/**
	 * [Property] Background color
	 * 
	 * This variable automatically propagates to the server.
	 */
	get backgroundColor() {
		return this._backgroundColor;
	}

	set backgroundColor(color: string) {
		if (this._backgroundColor !== color) {
			this._backgroundColor = color;
			this.markDirty(ControlVariableFlags.BackgroundColor);
		}
	}

	/**
	 * [Property] Text color
	 * 
	 * This variable automatically propagates to the server.
	 */
	get textColor() {
		return this._textColor;
	}

	set textColor(color: string) {
		if (this._textColor !== color) {
			this._textColor = color;
			this.markDirty(ControlVariableFlags.TextColor);
		}
	}

	/**
	 * [Property] Focus/hover color
	 * 
	 * This variable automatically propagates to the server.
	 */
	get focusColor() {
		return this._focusColor;
	}

	set focusColor(color: string) {
		if (this._focusColor !== color) {
			this._focusColor = color;
			this.markDirty(ControlVariableFlags.FocusColor);
		}
	}

	/**
	 * [Property] Accent color (progressbar)
	 * 
	 * This variable automatically propagates to the server.
	 */
	get accentColor() {
		return this._accentColor;
	}

	set accentColor(color: string) {
		if (this._accentColor !== color) {
			this._accentColor = color;
			this.markDirty(ControlVariableFlags.AccentColor);
		}
	}

	/**
	 * [Property] Border color
	 * 
	 * This variable automatically propagates to the server.
	 */
	get borderColor() {
		return this._borderColor;
	}

	set borderColor(color: string) {
		if (this._borderColor !== color) {
			this._borderColor = color;
			this.markDirty(ControlVariableFlags.BorderColor);
		}
	}

	/**
	 * [Property] Disabled state - Buttons which are disabled cannot be interacted with
	 * 
	 * This variable automatically propagates to the server.
	 */
	get disabled() {
		return this._disabled;
	}

	set disabled(value: boolean) {
		if (this._disabled !== value) {
			this._disabled = value;
			this.markDirty(ControlVariableFlags.Disabled);
		}
	}

	/**
	 * [Property] Spark cost
	 * 
	 * This variable automatically propagates to the server.
	 */
	get sparkCost() {
		return this._sparkCost;
	}

	set sparkCost(sparkCost: number | undefined) {
		if (this._sparkCost !== sparkCost) {
			this._sparkCost = sparkCost;
			this.markDirty(ControlVariableFlags.SparkCost);
		}
	}

	/**
	 * [Property] Progress of the progress bar which is displayed at the bottom of a button
	 * 
	 * This variable automatically propagates to the server.
	 */
	get progress() {
		return this._sparkCost;
	}

	set progress(progress: number | undefined) {
		progress = progress || 0;
		if (progress < 0.0) {
			progress = 0.0;
		}
		if (progress > 1.0) {
			progress = 1.0;
		}
		if (this._progress !== progress) {
			this._progress = progress;
			this.markDirty(ControlVariableFlags.Progress);
		}
	}

	// TODO remove
	/**
	 * @Deprecated Look at InteractiveButton.progress
	 */
	getProgress() {
		return this._progress;
	}

	/**
	 * @Deprecated Look at InteractiveButton.progress
	 */
	setProgress(progress: number) {
		if (progress < 0.0) {
			progress = 0.0;
		}
		if (progress > 1.0) {
			progress = 1.0;
		}
		if (this._progress !== progress) {
			this._progress = progress;
			this.markDirty(ControlVariableFlags.Progress);
		}
	}

	/**
	 * Returns the current cooldown.
	 * 
	 * Cooldown prevents interaction until it expires
	 */
	getCooldown() {
		return this._cooldown - this.wrapper.now;
	}

	/**
	 * Sets the cooldown, if there is another cooldown already active it will pick the highest one.
	 * 
	 * Optional force parameter will force the cooldown.
	 * 
	 * Marks Cooldown as dirty when needed.
	 */
	setCooldown(cooldown: number, force?: boolean) {
		let time = this.wrapper.now + cooldown;
		if (force || this._cooldown === undefined || time > this._cooldown) {
			this._cooldown = time;
			this.markDirty(ControlVariableFlags.Cooldown);
		}
	}

	/**
	 * [Property] Force cooldown check
	 * 
	 * Force cooldown check will enforce the cooldowns on this end.
	 */
	get forceCooldownCheck() {
		return this._forceCooldown;
	}

	/**
	 * [Property] Force cooldown check.
	 * 
	 * Force cooldown check will enforce the cooldowns on this end.
	 */
	set forceCooldownCheck(forceCooldown: boolean) {
		this._forceCooldown = (forceCooldown == true);
	}

	/**
	 * Event called when viewer presses a button.
	 */
	onMouseDownEvent: Event<(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) => void> = new Event<any>();

	/**
	 * Event called when viewer releases a button.
	 */
	onMouseUpEvent: Event<(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) => void> = new Event<any>();

	private _lastClick: number = -1;
	protected onMouseDown(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) {
		if (this._disabled || (this._forceCooldown && (this._cooldown - this.wrapper.now) > 1)) {
			return;
		}
		this._lastClick = participant.userID;
		this.onMouseDownEvent.execute(event, participant, beamControl);
	}

	protected onMouseUp(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) {
		if (this._disabled || (this._forceCooldown && (this._cooldown - this.wrapper.now) > 1 && this._lastClick !== participant.userID)) {
			return;
		}
		this._lastClick = -1;
		this.onMouseUpEvent.execute(event, participant, beamControl);
	}

	/**********************************************************************/

	getSceneID(scene: InteractiveScene) {
		return `${scene.id}_${this.id}`;
	}

	getData(scene: InteractiveScene, position: IGridPlacement[]): IButtonData {
		return <IButtonData>{
			controlID: this.getSceneID(scene),
			kind: 'button',
			text: this._text,
			tooltip: this._tooltip,
			position: position,
			cost: this._sparkCost,
			cooldown: this._cooldown,
			progress: this._progress,
			disabled: this._disabled,

			backgroundColor: this._backgroundColor,
			textColor: this._textColor,
			focusColor: this._focusColor,
			accentColor: this._accentColor,
			borderColor: this._borderColor,
		};
	}

	onAdded(scene: InteractiveScene, beamControl: IButton) {
		super.onAdded(scene, beamControl);
		beamControl.on("mousedown", (inputEvent, participant) => {
			let user = this.wrapper.getUser(participant);
			if (user !== undefined) {
				this.onMouseDown(inputEvent, user, beamControl);
			}
		});
		beamControl.on("mouseup", (inputEvent, participant) => {
			let user = this.wrapper.getUser(participant);
			if (user !== undefined) {
				this.onMouseUp(inputEvent, user, beamControl);
			}
		});
	}

	onRemoved(scene: InteractiveScene) {
		super.onRemoved(scene);
	}

	protected gatherUpdates(dirtyBits: number, updates: { attribute: string, value: any }[]) {
		super.gatherUpdates(dirtyBits, updates);

		if ((dirtyBits & ControlVariableFlags.Text) === ControlVariableFlags.Text) {
			updates.push({ attribute: "text", value: this._text });
		}

		if ((dirtyBits & ControlVariableFlags.Tooltip) === ControlVariableFlags.Tooltip) {
			updates.push({ attribute: "tooltip", value: this._tooltip });
		}

		if ((dirtyBits & ControlVariableFlags.SparkCost) === ControlVariableFlags.SparkCost) {
			updates.push({ attribute: "cost", value: this._sparkCost });
		}

		if ((dirtyBits & ControlVariableFlags.Cooldown) === ControlVariableFlags.Cooldown) {
			updates.push({ attribute: "cooldown", value: this._cooldown });
		}

		if ((dirtyBits & ControlVariableFlags.Progress) === ControlVariableFlags.Progress) {
			updates.push({ attribute: "progress", value: this._progress });
		}

		if ((dirtyBits & ControlVariableFlags.Disabled) === ControlVariableFlags.Disabled) {
			updates.push({ attribute: "disabled", value: this._disabled });
		}

		if ((dirtyBits & ControlVariableFlags.BackgroundColor) === ControlVariableFlags.BackgroundColor) {
			updates.push({ attribute: "backgroundColor", value: this._backgroundColor });
		}

		if ((dirtyBits & ControlVariableFlags.TextColor) === ControlVariableFlags.TextColor) {
			updates.push({ attribute: "textColor", value: this._textColor });
		}

		if ((dirtyBits & ControlVariableFlags.FocusColor) === ControlVariableFlags.FocusColor) {
			updates.push({ attribute: "focusColor", value: this._focusColor });
		}

		if ((dirtyBits & ControlVariableFlags.AccentColor) === ControlVariableFlags.AccentColor) {
			updates.push({ attribute: "accentColor", value: this._accentColor });
		}

		if ((dirtyBits & ControlVariableFlags.BorderColor) === ControlVariableFlags.BorderColor) {
			updates.push({ attribute: "borderColor", value: this._borderColor });
		}
	}
}