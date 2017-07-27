import {
	IControlData,
	IControl,
	IGridPlacement
} from "../beam-interactive-node2";

import { InteractiveScene } from "./InteractiveScene";
import { InteractiveWrapper } from "./InteractiveWrapper";
import { Event } from "./common/utils/Event";

export enum ControlVariableFlags {
	Text = 1 << 1,
	SparkCost = 1 << 2,
	Cooldown = 1 << 3,
	Disabled = 1 << 4,
	Progress = 1 << 5
}

export abstract class InteractiveControl<T extends IControl, K extends IControlData> {

	public readonly wrapper: InteractiveWrapper | undefined;
	public readonly id: string;

	protected activeScenes: Map<string, InteractiveScene> = new Map();
	protected activeControls: Map<InteractiveScene, T> = new Map();

	constructor(wrapper: InteractiveWrapper | undefined, id: string) {
		this.wrapper = wrapper;
		this.id = id;
	}

	onUpdate: Event<(time: number) => void> = new Event<any>();
	onDeleted: Event<() => void> = new Event<any>();

	/**********************************************************************/

	abstract getSceneID(scene: InteractiveScene): string;

	abstract getData(scene: InteractiveScene, position: IGridPlacement[]): K;

	protected static async UpdateAttribute<T extends IControl, K extends keyof T>(beamControl: T, attribute: K, value: T[K]): Promise<void> {
		const packet: T = <T>{};
		packet.etag = beamControl.etag;
		packet.controlID = beamControl.controlID;

		packet[attribute] = value;

		return beamControl.client.updateControls({
			sceneID: (beamControl as any).scene.sceneID,
			controls: [packet],
		});
	}

	protected static async UpdateAttributes<T extends IControl, K extends keyof T>(beamControl: T, updates: { attribute: K, value: T[K] }[]): Promise<void> {
		const packet: T = <T>{};
		packet.etag = beamControl.etag;
		packet.controlID = beamControl.controlID;

		updates.forEach((update) => {
			packet[update.attribute] = update.value;
		});
		return beamControl.client.updateControls({
			sceneID: (beamControl as any).scene.sceneID,
			controls: [packet],
		});
	}

	onAdded(scene: InteractiveScene, beamControl: T) {
		if (this.activeScenes.has(scene.id)) {
			throw new Error(`[InteractiveControl:onAdded] Scene '${scene.id}' already contains control '${this.id}'!`);
		}

		this.activeScenes.set(scene.id, scene);
		this.activeControls.set(scene, beamControl);
	}

	onRemoved(scene: InteractiveScene) {
		if (!this.activeScenes.has(scene.id)) {
			throw new Error(`[InteractiveControl:onRemoved] Scene '${scene.id}' doesn't contain control '${this.id}'!`);
		}
		this.onDeleted.execute();
		this.activeScenes.delete(scene.id);
		this.activeControls.delete(scene);
	}

	getBeamControl(scene: InteractiveScene) {
		return this.activeControls.get(scene);
	}

	private dirtyFlags = 0;

	protected markDirty(flag: number) {
		if (this.activeControls.size > 0) {
			this.dirtyFlags |= flag;
		}
	}

	protected gatherUpdates(dirtyBits: number, updates: { attribute: string, value: any }[]) {

	}

	lastUpdate: number = undefined;
	private updateLock = false;
	internalUpdate(time: number) {
		this.onUpdate.execute(time);


		// TODO
		// Try to batch first then if something fails mark as no-batch on the next run!


		if (this.activeControls.size <= 0) {
			this.dirtyFlags = 0;
		} else if (this.activeControls.size > 1) {
			throw new Error("NYI");
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
						console.error("Handling reject", error);
						// FIXME hax "fix" the broken etag
						this.wrapper.client.getScenes().then((scenes) => {
							if (scenes.scenes) {
								scenes.scenes.forEach((scene) => {
									if (scene.controls) {
										scene.controls.forEach((control) => {
											if (control.controlID === beamControl.controlID) {
												console.error("Fixing etag", beamControl.etag, control.etag);
												beamControl.etag = control.etag;
											}
										});
									}
								});
							}
						});
					});
				});
			} else {
				throw new Error("Dirty but no updates!");
			}
		}
	}
}