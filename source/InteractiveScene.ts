import {
	IScene,
	IControl,
	IControlData,
	IGridPlacement,
	delay
} from "../beam-interactive-node2";

import { InteractiveControl } from "./InteractiveControl";
import { InteractiveWrapper } from "./InteractiveWrapper";

type ControlData = {
	control: InteractiveControl<IControl, IControlData>;
	position: IGridPlacement[];
};

export class InteractiveScene {

	public readonly wrapper: InteractiveWrapper | undefined;
	private internal: IScene;
	public readonly type: string;
	public readonly id: string;
	public readonly temporary: boolean;


	private controlsData: ControlData[] = [];
	private controlsMap: Map<string, ControlData> = new Map();

	constructor(wrapper: InteractiveWrapper | undefined, type: string, id?: string) {
		this.wrapper = wrapper;
		this.type = type;
		this.id = id;
		this.temporary = (id === undefined);
	}

	/**
	 * @Internal
	 * 
	 * Removes all buttons and deletes the scene.
	 */
	async destroy() {
		if (this.isValid) {
			await this.asyncEachControl(async (control) => {
				control.onRemoved(this);
			});
			await this.internal.deleteAllControls();
			this.controlsInitialized = false;
			this.internal = undefined;
		}
	}

	/**
	 * [Property][Readonly] Returns true is the scene is still valid.
	 */
	get isValid() {
		return this.internal !== undefined;
	}

	/**
	 * Adds a control to the scene.
	 * 
	 * Returns a promise which will resolve after the control is fully setup
	 */
	async addControl(control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]) {
		if (this.controlsMap.has(control.id)) {
			throw new Error(`[InteractiveScene:addControl] Scene '${this.id}' already contains control '${control.id}'!`);
		}
		let controlData = {
			control: control,
			position: position
		};
		this.controlsData.push(controlData);
		this.controlsMap.set(control.id, controlData);

		if (this.controlsInitialized) {
			let newBeamControl = await this.internal.createControl(control.getData(this, position));
			control.onAdded(this, newBeamControl);
		}
	}

	/**
	 * Moves a control to a new position.
	 * 
	 * Returns a promise which will resolve after the control is fully moved
	 */
	async moveControl(control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]) {
		if (!this.controlsMap.has(control.id)) {
			throw new Error(`[InteractiveScene:moveControl] Scene '${this.id}' doesn't contain control '${control.id}'!`);
		}
		await this.removeControl(control);
		await delay(1000);
		await this.addControl(control, position);
	}

	/**
	 * Removes a control from the scene.
	 * 
	 * Returns a promise which will resolve after the control is fully removed
	 */
	async removeControl(control: InteractiveControl<IControl, IControlData>) {
		if (!this.controlsMap.has(control.id)) {
			throw new Error(`[InteractiveScene:removeControl] Scene '${this.id}' doesn't contain control '${control.id}'!`);
		}
		let controlData = this.controlsMap.get(control.id);
		for (let i = this.controlsData.length - 1; i >= 0; i--) {
			if (this.controlsData[i].control === control) {
				this.controlsData.splice(i, 1);
			}
		}

		if (this.controlsInitialized) {
			let beamControl = controlData.control.getBeamControl(this);
			await this.internal.deleteControl(beamControl.controlID);
			controlData.control.onRemoved(this);
		}
		this.controlsMap.delete(control.id);
	}

	/**
	 * Return an InteractiveControl for `name`
	 */
	getControl(name: string) {
		let controlData = this.controlsMap.get(name);
		return controlData !== undefined ? controlData.control : undefined;
	}

	/**
	 * Iterates over all controls and executes `callback` for each of them.
	 */
	forEachControl(callback: (control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]) => void) {
		this.controlsData.forEach((controlData) => {
			callback(controlData.control, controlData.position);
		});
	}

	/**
	 * Iterates over all controls in async and executes `callback` for each of them.
	 * 
	 * Returns a promise which is resolved after all callbacks have been executed for each control.
	 */
	async asyncEachControl(callback: (control: InteractiveControl<IControl, IControlData>, position: IGridPlacement[]) => Promise<void>) {
		for (var i = 0; i < this.controlsData.length; i++) {
			var controlData = this.controlsData[i];
			await callback(controlData.control, controlData.position);
		}
		return true;
	}

	private controlsInitialized = false;

	/**
	 * @Internal
	 */
	async beamSceneInit(internal: IScene) {
		if (this.controlsInitialized) {
			throw new Error(`[InteractiveScene:beamSceneInit] Scene '${this.id}' is already initialized!`);
		}
		this.internal = internal;
		if (this.temporary) {
			(this as any).id = this.internal.sceneID;
		}
		let controlsData: IControlData[] = [];
		let controlsMapping: Map<string, InteractiveControl<IControl, IControlData>> = new Map();

		this.controlsInitialized = true;
		this.forEachControl((control, position) => {
			let controlData = control.getData(this, position);
			controlsData.push(controlData);
			controlsMapping.set(controlData.controlID, control);
		});

		let beamControls = await this.internal.createControls(controlsData);
		beamControls.forEach((beamControl) => {
			controlsMapping.get(beamControl.controlID).onAdded(this, beamControl);
		});

		return true;
	}

	/**
	 * @Internal
	 */
	async beamSceneDestroy() {
		this.forEachControl((control, position) => {
			control.onRemoved(this);
		});

		await this.internal.deleteAllControls();
		this.internal = undefined;
	}
}