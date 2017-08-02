import { Client } from './Client';
import { IGroupDataArray, IGroupDeletionParams, IParticipantArray, ISceneControlDeletion, ISceneData, ISceneDataArray, ISceneDeletionParams } from './state/interfaces';
import { IControl } from './state/interfaces/controls/IControl';
export interface IGameClientOptions {
    /**
     * Your project version id is a unique id to your Interactive Project Version. You can retrieve one
     * from the Interactive Studio on Mixer.com in the Code step.
     */
    versionId: number;
    /**
     * Optional project sharecode to your Interactive Project Version. You can retrieve one
     * from the Interactive Studio on Mixer.com in the Code step.
     */
    sharecode?: string;
    /**
     * An OAuth Bearer token as defined in {@link https://art.tools.ietf.org/html/rfc6750| OAuth 2.0 Bearer Token Usage}.
     */
    authToken: string;
    /**
     * A url which can be used to discover interactive servers.
     * Defaults to https://mixer.com/api/v1/interactive/hosts
     */
    discoveryUrl?: string;
}
export declare class GameClient extends Client {
    private discovery;
    constructor();
    /**
     * Opens a connection to the interactive service using the provided options.
     */
    open(options: IGameClientOptions): Promise<this>;
    /**
     * Creates instructs the server to create new controls on a scene within your project.
     * Participants will see the new controls automatically if they are on the scene the
     * new controls are added to.
     */
    createControls(data: ISceneData): Promise<IControl[]>;
    /**
     * Instructs the server to create new groups with the specified parameters.
     */
    createGroups(groups: IGroupDataArray): Promise<IGroupDataArray>;
    /**
     * Instructs the server to create a new scene with the specified parameters.
     */
    createScene(scene: ISceneData): Promise<ISceneData>;
    /**
     * Instructs the server to create new scenes with the specified parameters.
     */
    createScenes(scenes: ISceneDataArray): Promise<ISceneDataArray>;
    /**
     * Updates a sessions' ready state, when a client is not ready participants cannot
     * interact with the controls.
     */
    ready(isReady?: boolean): Promise<void>;
    /**
     * Instructs the server to update controls within a scene with your specified parameters.
     * Participants on the scene will see the controls update automatically.
     */
    updateControls(params: ISceneData): Promise<void>;
    /**
     * Instructs the server to update the participant within the session with your specified parameters.
     * Participants within the group will see applicable scene changes automatically.
     */
    updateGroups(groups: IGroupDataArray): Promise<IGroupDataArray>;
    /**
     * Instructs the server to update a scene within the session with your specified parameters.
     */
    updateScenes(scenes: ISceneDataArray): Promise<void>;
    /**
     * Instructs the server to update the participant within the session with your specified parameters.
     */
    updateParticipants(participants: IParticipantArray): Promise<void>;
    /**
     * Makes an attempt to capture a spark transaction and deduct the sparks from the participant
     * who created the transaction.
     *
     * A transaction can fail to capture if:
     *  * The participant does not have enough sparks.
     *  * The transaction is expired.
     */
    captureTransaction(transactionID: string): Promise<void>;
    /**
     * Instructs the server to delete the provided controls.
     */
    deleteControls(data: ISceneControlDeletion): Promise<void>;
    /**
     * Instructs the server to delete the provided group.
     */
    deleteGroup(data: IGroupDeletionParams): Promise<void>;
    /**
     * Instructs the server to delete the provided scene.
     */
    deleteScene(data: ISceneDeletionParams): Promise<void>;
}
