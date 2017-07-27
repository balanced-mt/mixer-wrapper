/// <reference types="node" />
import { EventEmitter } from 'events';
import { IClient } from './IClient';
import { onReadyParams } from './methods/methodTypes';
import { IControl, IGroup, IGroupDataArray, IGroupDeletionParams, IInput, IParticipantArray, IScene, ISceneControlDeletion, ISceneData, ISceneDataArray, ISceneDeletionParams, ITransactionCapture } from './state/interfaces';
import { IState } from './state/IState';
import { Method, Reply } from './wire/packets';
import { CompressionScheme, InteractiveSocket, ISocketOptions } from './wire/Socket';
export declare enum ClientType {
    /**
     * A Participant type is used when the client is participating in the session.
     */
    Participant = 0,
    /**
     * A GameClient type is used when the client is running the interactive session.
     */
    GameClient = 1,
}
export declare class Client extends EventEmitter implements IClient {
    /**
     * The type this client instance is running as.
     */
    clientType: ClientType;
    /**
     * The client's state store.
     */
    state: IState;
    /**
     * The client's socket.
     */
    protected socket: InteractiveSocket;
    private methodHandler;
    /**
     * Constructs and sets up a client of the given type.
     */
    constructor(clientType: ClientType);
    /**
     * Processes a method through the client's method handler.
     */
    processMethod(method: Method<any>): void | Reply;
    /**
     * Creates a socket on the client using the specified options.
     * Use [client.open]{@link Client.open} to open the created socket.
     */
    private createSocket(options);
    /**
     * Sets the given options on the socket.
     */
    setOptions(options: ISocketOptions): void;
    /**
     * Opens the connection to interactive.
     */
    open(options: ISocketOptions): Promise<this>;
    /**
     * Closes and frees the resources associated with the interactive connection.
     */
    close(): void;
    /**
     * Begins a negotiation process between the server and this client,
     * the compression preferences of the client are sent to the server and then
     * the server responds with the chosen compression scheme.
     */
    setCompression(preferences: CompressionScheme[]): Promise<void>;
    /**
     * Sends a given reply to the server.
     */
    reply(reply: Reply): void;
    /**
     * Retrieves the scenes stored on the interactive server.
     */
    getScenes(): Promise<ISceneDataArray>;
    /**
     * Retrieves the scenes on the server and hydrates the state store with them.
     */
    synchronizeScenes(): Promise<IScene[]>;
    /**
     * Retrieves the groups stored on the interactive server.
     */
    getGroups(): Promise<IGroupDataArray>;
    /**
     * Retrieves the groups on the server and hydrates the state store with them.
     */
    synchronizeGroups(): Promise<IGroup[]>;
    /**
     * Retrieves and hydrates client side stores with state from the server
     */
    synchronizeState(): Promise<[IGroup[], IScene[]]>;
    /**
     * Gets the time from the server as a unix timestamp in UTC.
     */
    getTime(): Promise<number>;
    /**
     * `createControls` will instruct the server to create your provided controls in the active,
     * project. Participants will see the new controls as they are added.
     */
    execute(method: 'createControls', params: ISceneData, discard: false): Promise<ISceneData>;
    /**
     * `ready` allows you to indicate to the server the ready state of your GameClient.
     * By specifying `isReady` false you can pause participant interaction whilst you
     * setup scenes and controls.
     */
    execute(method: 'ready', params: onReadyParams, discard: false): Promise<void>;
    /**
     * `capture` is used to capture a spark transaction that you have received from the server.
     */
    execute(method: 'capture', params: ITransactionCapture, discard: false): Promise<void>;
    /**
     * `getTime` retrieves the server's unix timestamp. You can use this to synchronize your clock with
     * the servers. See [ClockSync]{@link ClockSync} for a Clock Synchronizer.
     */
    execute(method: 'getTime', params: null, discard: false): Promise<{
        time: number;
    }>;
    /**
     * `getScenes` retrieves scenes stored ont he server. If you've used the studio to create your project,
     * then you can use this to retrieve the scenes and controls created there.
     */
    execute(method: 'getScenes', params: null, discard: false): Promise<ISceneDataArray>;
    /**
     * `giveInput` is used to send participant interactive events to the server.
     * These events will be received by the corresponding GameClient.
     */
    execute<K extends IInput>(method: 'giveInput', params: K, discard: false): Promise<void>;
    /**
     * `updateControls` is used to update control properties within a scene, such as disabling a control.
     */
    execute(method: 'updateControls', params: ISceneData, discard: false): Promise<void>;
    /**
     * `deleteControls` will delete the specified controls from the server. Participants will see these controls
     * vanish and will not be able to interact with them.
     */
    execute(method: 'deleteControls', params: ISceneControlDeletion, discard: false): Promise<void>;
    execute<T>(method: string, params: T, discard: boolean): Promise<any>;
    createControls(_: ISceneData): Promise<IControl[]>;
    createGroups(_: IGroupDataArray): Promise<IGroupDataArray>;
    createScene(_: ISceneData): Promise<ISceneData>;
    createScenes(_: ISceneDataArray): Promise<ISceneDataArray>;
    updateControls(_: ISceneData): Promise<void>;
    updateGroups(_: IGroupDataArray): Promise<IGroupDataArray>;
    updateScenes(_: ISceneDataArray): Promise<void>;
    updateParticipants(_: IParticipantArray): Promise<void>;
    giveInput<T extends IInput>(_: T): Promise<void>;
    deleteControls(_: ISceneControlDeletion): Promise<void>;
    deleteGroup(_: IGroupDeletionParams): Promise<void>;
    deleteScene(_: ISceneDeletionParams): Promise<void>;
    ready(_: boolean): Promise<void>;
}
