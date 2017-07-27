/// <reference types="node" />
import { EventEmitter } from 'events';
import { IClient } from '../../IClient';
import { IParticipant } from '../interfaces';
import { ControlKind, IControl, IControlData, IControlUpdate, IGridPlacement } from '../interfaces/controls/IControl';
import { IInput, IInputEvent } from '../interfaces/controls/IInput';
import { IMeta } from '../interfaces/controls/IMeta';
import { Scene } from '../Scene';
/**
 * Control is used a base class for all other controls within an interactive session.
 * It contains shared logic which all types of controls can utilize.
 */
export declare abstract class Control<T extends IControlData> extends EventEmitter implements IControl {
    controlID: string;
    kind: ControlKind;
    disabled: boolean;
    position: IGridPlacement[];
    etag: string;
    meta: IMeta;
    protected scene: Scene;
    client: IClient;
    /**
     * Sets the scene this control belongs to.
     */
    setScene(scene: Scene): void;
    /**
     * Sets the client instance this control can use to execute methods.
     */
    setClient(client: IClient): void;
    constructor(control: T);
    abstract giveInput<T extends IInput>(input: T): Promise<void>;
    /**
     * Called by client when it recieves an input event for this control from the server.
     */
    receiveInput<T extends IInput>(inputEvent: IInputEvent<T>, participant: IParticipant): void;
    protected sendInput<K extends IInput>(input: K): Promise<void>;
    /**
     * Disables this control, preventing participant interaction.
     */
    disable(): Promise<void>;
    /**
     * Enables this control, allowing participant interaction.
     */
    enable(): Promise<void>;
    protected updateAttribute<K extends keyof T>(attribute: K, value: T[K]): Promise<void>;
    /**
     * Merges in values from the server in response to an update operation from the server.
     */
    onUpdate(controlData: IControlData): void;
    /**
     * Update this control on the server.
     */
    update<T2 extends IControlUpdate>(controlUpdate: T2): Promise<void>;
    destroy(): void;
}
