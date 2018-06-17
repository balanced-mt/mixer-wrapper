import {
	IGridPlacement,
	IInputEvent,
	IParticipant,
	ITextboxData,
	ITextbox,
	ITextboxInput
} from "beam-interactive-node2";

import { InteractiveWrapper } from "./InteractiveWrapper";
import { InteractiveControl, ControlVariableFlags } from "./InteractiveControl";
import { InteractiveScene } from "./InteractiveScene";

import { Event } from "./common/utils/Event";
import { InteractiveUser } from "./InteractiveUser";
import { Utils } from "./common/utils/Utils";
/*
	TODO
    submitText?: string;
    hasSubmit?: boolean;
	multiline?: boolean;
*/
export class InteractiveTextbox extends InteractiveControl<ITextbox, ITextboxData>{

	private _placeholder: string;
	private _sparkCost: number | undefined = undefined;
	protected _cooldown: number | undefined = undefined;
	private _disabled: boolean = false;
	private _forceCooldown: boolean = true;
	private _submit: boolean;

	constructor(wrapper: InteractiveWrapper, id: string, submit: boolean = false) {
		super(wrapper, id);
		this._submit = submit;
	}

	/**
	 * [Property] Placeholder text
	 * 
	 * This variable automatically propagates to the server.
	 */
	get placeholder() {
		return this._placeholder;
	}

	set placeholder(placeholder: string) {
		if (this._placeholder !== placeholder) {
			this._placeholder = placeholder;
			this.markDirty(ControlVariableFlags.Placeholder);
		}
	}

	/**
	 * [Property] Disabled state - Textboxes which are disabled cannot be interacted with
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


	onChangeEvent: Event<(event: IInputEvent<ITextboxInput>, participant: InteractiveUser, beamControl: ITextbox) => void> = new Event<any>();


	onSubmitEvent: Event<(event: IInputEvent<ITextboxInput>, participant: InteractiveUser, beamControl: ITextbox) => void> = new Event<any>();

	private _lastClick: number = -1;
	protected onChange(event: IInputEvent<ITextboxInput>, participant: InteractiveUser, beamControl: ITextbox) {
		if (this._disabled) {
			return;
		}
		this._lastClick = participant.userID;
		this.onChangeEvent.execute(event, participant, beamControl);
	}

	protected onSubmit(event: IInputEvent<ITextboxInput>, participant: InteractiveUser, beamControl: ITextbox) {
		if (this._disabled) {
			return;
		}
		this._lastClick = -1;
		this.onSubmitEvent.execute(event, participant, beamControl);
	}

	/**********************************************************************/

	getSceneID(scene: InteractiveScene) {
		return `${scene.id}_${this.id}`;
	}

	getData(scene: InteractiveScene, position: IGridPlacement[]): ITextboxData {
		let id = this.getSceneID(scene);
		return <ITextboxData>{
			controlID: this.getSceneID(scene),
			kind: 'textbox',
			placeholder: this._placeholder,
			position: position,
			cost: this._sparkCost,
			cooldown: this._cooldown,
			disabled: this._disabled,
			hasSubmit: this._submit,
		};
	}

	onAdded(scene: InteractiveScene, beamControl: ITextbox) {
		super.onAdded(scene, beamControl);
		beamControl.on("change", (inputEvent, participant) => {
			let user = this.wrapper.getUser(participant);
			if (user !== undefined) {
				this.onChange(inputEvent, user, beamControl);
			}
		});
		beamControl.on("submit", (inputEvent, participant) => {
			let user = this.wrapper.getUser(participant);
			if (user !== undefined) {
				this.onSubmit(inputEvent, user, beamControl);
			}
		});
	}

	onRemoved(scene: InteractiveScene) {
		super.onRemoved(scene);
	}

	protected gatherUpdates(dirtyBits: number, updates: { attribute: string, value: any }[]) {
		super.gatherUpdates(dirtyBits, updates);

		if ((dirtyBits & ControlVariableFlags.Placeholder) === ControlVariableFlags.Placeholder) {
			updates.push({ attribute: "placeholder", value: this._placeholder });
		}

		if ((dirtyBits & ControlVariableFlags.SparkCost) === ControlVariableFlags.SparkCost) {
			updates.push({ attribute: "cost", value: this._sparkCost });
		}

		if ((dirtyBits & ControlVariableFlags.Cooldown) === ControlVariableFlags.Cooldown) {
			updates.push({ attribute: "cooldown", value: this._cooldown });
		}

		if ((dirtyBits & ControlVariableFlags.Disabled) === ControlVariableFlags.Disabled) {
			updates.push({ attribute: "disabled", value: this._disabled });
		}
	}
}