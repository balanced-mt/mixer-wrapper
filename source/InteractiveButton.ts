import {
	IButton,
	IButtonData,
	IGridPlacement,
	IInputEvent,
	IParticipant,
	IButtonInput
} from "../beam-interactive-node2";

import { InteractiveWrapper } from "./InteractiveWrapper";
import { InteractiveControl, ControlVariableFlags } from "./InteractiveControl";
import { InteractiveScene } from "./InteractiveScene";

import { Event } from "./common/utils/Event";
import { InteractiveUser } from "./InteractiveUser";

export class InteractiveButton extends InteractiveControl<IButton, IButtonData>{

	private _text: string;
	private _sparkCost: number | undefined = undefined;
	protected _cooldown: number | undefined = undefined;
	protected _progress: number | undefined = undefined;
	private _disabled: boolean = false;
	private _forceCooldown: boolean = true;

	constructor(wrapper: InteractiveWrapper | undefined, id: string, text: string) {
		super(wrapper, id);
		this.text = text;
	}

	get text() {
		return this._text;
	}

	set text(text: string) {
		if (this._text !== text) {
			this._text = text;
			this.markDirty(ControlVariableFlags.Text);
		}
	}

	get disabled() {
		return this._disabled;
	}

	set disabled(value: boolean) {
		if (this._disabled !== value) {
			this._disabled = value;
			this.markDirty(ControlVariableFlags.Disabled);
		}
	}

	get sparkCost() {
		return this._sparkCost;
	}

	set sparkCost(sparkCost: number | undefined) {
		if (this._sparkCost !== sparkCost) {
			this._sparkCost = sparkCost;
			this.markDirty(ControlVariableFlags.SparkCost);
		}
	}

	setCooldown(cooldown: number, force?: boolean) {
		let time = this.wrapper.now + cooldown;
		if (force || this._cooldown === undefined || time > this._cooldown) {
			this._cooldown = time;
			this.markDirty(ControlVariableFlags.Cooldown);
		}
	}

	getCooldown() {
		return this._cooldown - this.wrapper.now;
	}

	get forceCooldownCheck() {
		return this._forceCooldown;
	}

	set forceCooldownCheck(forceCooldown: boolean) {
		this._forceCooldown = (forceCooldown == true);
	}

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

	getProgress() {
		return this._progress;
	}

	onMouseDownEvent: Event<(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) => void> = new Event<any>();
	onMouseUpEvent: Event<(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) => void> = new Event<any>();

	private _lastClick: number = -1;
	onMouseDown(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) {
		if (this._forceCooldown && (this._cooldown - this.wrapper.now) > 1) {
			return;
		}
		this._lastClick = participant.userID;
		this.onMouseDownEvent.execute(event, participant, beamControl);
	}

	onMouseUp(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) {
		if (this._forceCooldown && (this._cooldown - this.wrapper.now) > 1 && this._lastClick !== participant.userID) {
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
			text: this.text,
			position: position,
			cost: this._sparkCost,
			cooldown: this._cooldown,
			disabled: this._disabled
		};
	}

	// TODO merge into dirty flag
	// TODO async
	/*private async internalChangeText(text: string) {
		for (var [key, beamControl] of this.activeControls) {
			await InteractiveControl.UpdateAttribute(beamControl, "text", text).then((result: any) => {
				console.log("result:");
				console.log(result);
			}).catch((error: any) => {
				console.log("error:");
				console.log(error);
			});
		};
		return true;
	}*/

	// TODO merge into dirty flag
	// TODO async
	/*private async internalChangeCooldown(time: number) {
		for (var [key, beamControl] of this.activeControls) {
			await InteractiveControl.UpdateAttribute(beamControl, "cooldown", time);
		}
		return true;
	}*/

	/*private async internalChangeCost(cost: number) {
		for (var [key, beamControl] of this.activeControls) {
			await InteractiveControl.UpdateAttribute(beamControl, "cost", cost);
		}
		return true;
	}*/

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
	}
}