import {
	IControlData,
	IControl,
	IGridPlacement
} from "beam-interactive-node2";

import { InteractiveScene } from "./InteractiveScene";
import { InteractiveWrapper } from "./InteractiveWrapper";
import { Event } from "./common/utils/Event";

export enum ControlVariableFlags {
	Text = 1 << 1,
	SparkCost = 1 << 2,
	Cooldown = 1 << 3,
	Disabled = 1 << 4,
	Progress = 1 << 5,
	Tooltip = 1 << 6,
	Placeholder = 1 << 7,
	BackgroundColor = 1 << 8,
	TextColor = 1 << 9,
	FocusColor = 1 << 10,
	AccentColor = 1 << 11,
	BorderColor = 1 << 12,
}

export abstract class InteractiveControl<T extends IControl, K extends IControlData> {

	/**
	 * Instance of InteractiveWrapper that was used to create this control.
	 */
	public readonly wrapper: InteractiveWrapper | undefined;
	/**
	 * Internal control id.
	 */
	public readonly id: string;

	protected activeScenes: Map<string, InteractiveScene> = new Map();
	protected activeControls: Map<InteractiveScene, T> = new Map();

	constructor(wrapper: InteractiveWrapper | undefined, id: string) {
		this.wrapper = wrapper;
		this.id = id;
	}

	/**
	 * Event called when control is updated.
	 */
	onUpdate: Event<(time: number) => void> = new Event<any>();

	/**
	 * Event called when control is deleted.
	 */
	onDeleted: Event<() => void> = new Event<any>();

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
	protected static async UpdateAttribute<T extends IControl, K extends keyof T>(beamControl: T, attribute: K, value: T[K]): Promise<void> {
		const packet: T = <T>{};
		packet.controlID = beamControl.controlID;

		packet[attribute] = value;

		return beamControl.client.updateControls({
			sceneID: (beamControl as any).scene.sceneID,
			controls: [packet],
		});
	}

	/**
	 * Updates attributes.
	 */
	protected static async UpdateAttributes<T extends IControl, K extends keyof T>(beamControl: T, updates: { attribute: K, value: T[K] }[]): Promise<void> {
		const packet: T = <T>{};
		packet.controlID = beamControl.controlID;

		updates.forEach((update) => {
			packet[update.attribute] = update.value;
		});
		return beamControl.client.updateControls({
			sceneID: (beamControl as any).scene.sceneID,
			controls: [packet],
		});
	}

	/**
	 * @Internal
	 * 
	 * Called when control is added to a scene.
	 */
	onAdded(scene: InteractiveScene, beamControl: T) {
		if (this.activeScenes.has(scene.id)) {
			throw new Error(`[InteractiveControl:onAdded] Scene '${scene.id}' already contains control '${this.id}'!`);
		}

		this.activeScenes.set(scene.id, scene);
		this.activeControls.set(scene, beamControl);
	}

	/**
	 * @Internal
	 * 
	 * Called when control is removed from a scene.
	 */
	onRemoved(scene: InteractiveScene) {
		if (!this.activeScenes.has(scene.id)) {
			throw new Error(`[InteractiveControl:onRemoved] Scene '${scene.id}' doesn't contain control '${this.id}'!`);
		}
		this.onDeleted.execute();
		this.activeScenes.delete(scene.id);
		this.activeControls.delete(scene);
	}

	/**
	 * @Internal
	 * 
	 * Return the raw Interactive control.
	 */
	getBeamControl(scene: InteractiveScene) {
		return this.activeControls.get(scene);
	}

	/**
	 * @Internal
	 * 
	 * Dirty flags
	 */
	private dirtyFlags = 0;

	/**
	 * @Internal
	 * 
	 * Marks flag as dirty forcing an update.
	 */
	protected markDirty(flag: number) {
		if (this.activeControls.size > 0) {
			this.dirtyFlags |= flag;
		}
	}

	/**
	 * @Internal
	 * 
	 * Gathers updates from the control based on dirty flags to send to the server.
	 */
	protected gatherUpdates(dirtyBits: number, updates: { attribute: string, value: any }[]) {

	}

	lastUpdate: number = undefined;
	private updateLock = false;

	/**
	 * @Internal
	 */
	internalUpdate(time: number) {
		this.onUpdate.execute(time);


		// TODO
		// Try to batch first then if something fails mark as no-batch on the next run!


		if (this.activeControls.size <= 0) {
			this.dirtyFlags = 0;
		} else if (!this.updateLock && this.dirtyFlags !== 0 && (this.lastUpdate === undefined || this.lastUpdate + 50 < time)) {
			let dirtyBits = this.dirtyFlags;
			this.dirtyFlags = 0;
			this.updateLock = true;
			this.lastUpdate = time;

			let updates: { attribute: string, value: any }[] = [];
			this.gatherUpdates(dirtyBits, updates);
			if (updates.length > 0) {
				let timeout = setTimeout(() => {
					this.markDirty(dirtyBits);
					this.updateLock = false;
				}, 10000);
				Array.from(this.activeControls.values()).forEach((beamControl) => {
					// TODO handle more than 1 button
					InteractiveControl.UpdateAttributes<any, any>(beamControl, updates).then((data) => {
						clearTimeout(timeout);
						this.updateLock = false;
					}).catch((error) => {
						clearTimeout(timeout);
						this.markDirty(dirtyBits);
						this.updateLock = false;
						console.error("reject", error);
					});
				});
			} else {
				throw new Error("Dirty but no updates!");
			}
		}
	}
}