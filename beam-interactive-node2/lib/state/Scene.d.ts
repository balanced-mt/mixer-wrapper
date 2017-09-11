/// <reference types="node" />
import { EventEmitter } from 'events';
import { IClient } from '../IClient';
import { IControl, IControlData } from './interfaces/controls/IControl';
import { IMeta } from './interfaces/controls/IMeta';
import { IScene, ISceneData } from './interfaces/IScene';
/**
 * A Scene is a collection of controls within an interactive experience. Groups can be
 * set to a scene. Which Scene a group is set to determine which controls they see.
 *
 * You can use scenes to logically group together controls for some meaning.
 */
export declare class Scene extends EventEmitter implements IScene {
    sceneID: string;
    controls: Map<string, IControl>;
    groups: any;
    /**
     * @deprecated etags are no longer used, you can always omit/ignore this
     */
    etag: string;
    meta: IMeta;
    private client;
    setClient(client: IClient): void;
    private stateFactory;
    constructor(data: ISceneData);
    /**
     * Called when controls are added to this scene.
     */
    onControlsCreated(controls: IControlData[]): IControl[];
    /**
     * Called when a control is added to this scene.
     */
    private onControlCreated(controlData);
    /**
     * Called when controls are deleted from this scene.
     */
    onControlsDeleted(controls: IControlData[]): void;
    /**
     * Called when a control is deleted from this scene.
     */
    private onControlDeleted(control);
    /**
     * Called when a control in this scene is updated
     */
    private onControlUpdated(controlData);
    /**
     * Called when the controls in this scene are updated.
     */
    onControlsUpdated(controls: IControlData[]): void;
    /**
     * Retrieve a control in this scene by its id.
     */
    getControl(id: string): IControl;
    /**
     * Retrieves all the controls in this scene.
     */
    getControls(): IControl[];
    /**
     * Creates a control in this scene, sending it to the server.
     */
    createControl(control: IControlData): Promise<IControl>;
    /**
     * Creates a collection of controls in this scene, sending it to the server.
     */
    createControls(controls: IControlData[]): Promise<IControl[]>;
    /**
     * Updates a collection of controls in this scene, sending it to the server.
     */
    updateControls(controls: IControlData[]): Promise<void>;
    /**
     * Deletes controls in this scene from the server.
     */
    deleteControls(controlIDs: string[]): Promise<void>;
    /**
     * Deletes a single control in this scene from the server.
     */
    deleteControl(controlId: string): Promise<void>;
    /**
     * Fires destruction events for each control in this scene.
     */
    destroy(): void;
    /**
     * Merges new data from the server into this scene.
     */
    update(scene: ISceneData): void;
    /**
     * Deletes all controls in this scene from the server.
     */
    deleteAllControls(): Promise<void>;
}
