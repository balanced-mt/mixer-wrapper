/// <reference types="node" />
import { EventEmitter } from 'events';
import { IState } from './IState';
import { ClientType } from '../Client';
import { IClient } from '../IClient';
import { Method, Reply } from '../wire/packets';
import { Group } from './Group';
import { IParticipant, IScene, ISceneDataArray } from './interfaces';
import { IControl } from './interfaces/controls/IControl';
import { IGroup, IGroupData, IGroupDataArray } from './interfaces/IGroup';
import { ISceneData } from './interfaces/IScene';
import { Scene } from './Scene';
/**
 * State is a store of all of the components of an interactive session.
 *
 * It contains Scenes, Groups and Participants and keeps them up to date by listening to
 * interactive events which update and change them. You can query State to
 * examine and alter components of the interactive session.
 */
export declare class State extends EventEmitter implements IState {
    private clientType;
    /**
     * A Map of group ids to their corresponding Group Object.
     */
    private groups;
    /**
     * the ready state of this session, is the GameClient in this session ready to recieve input?
     */
    isReady: boolean;
    private methodHandler;
    private stateFactory;
    private scenes;
    private client;
    private participants;
    private clockDelta;
    private clockSyncer;
    /**
     * Constructs a new State instance. Based on the passed client type it will
     * hook into the appropriate methods for that type to keep itself up to date.
     */
    constructor(clientType: ClientType);
    /**
     * Synchronize scenes takes a collection of scenes from the server
     * and hydrates the Scene store with them.
     */
    synchronizeScenes(data: ISceneDataArray): IScene[];
    synchronizeGroups(data: IGroupDataArray): IGroup[];
    private addParticipantHandlers();
    private addGameClientHandlers();
    setClient(client: IClient): void;
    /**
     * Processes a server side method using State's method handler.
     */
    processMethod(method: Method<any>): void | Reply;
    /**
     * Returns the local time matched to the sync of the Mixer server clock.
     */
    synchronizeLocalTime(time?: Date | number): Date;
    /**
     * Returns the remote time matched to the local clock.
     */
    synchronizeRemoteTime(time: Date | number): Date;
    /**
     * Completely clears this state instance emptying all Scene, Group and Participant records
     */
    reset(): void;
    /**
     * Updates an existing scene in the game session.
     */
    onSceneUpdate(scene: ISceneData): void;
    /**
     * Removes a scene and reassigns the groups that were on it.
     */
    onSceneDelete(sceneID: string, reassignSceneID: string): void;
    /**
     * Inserts a new scene into the game session.
     */
    onSceneCreate(data: ISceneData): IScene;
    /**
     * Adds an array of Scenes to its state store.
     */
    addScenes(scenes: ISceneData[]): IScene[];
    /**
     * Updates an existing scene in the game session.
     */
    onGroupUpdate(group: IGroupData): void;
    /**
     * Removes a group and reassigns the participants that were in it.
     */
    onGroupDelete(groupID: string, reassignGroupID: string): void;
    /**
     * Inserts a new group into the game session.
     */
    onGroupCreate(data: IGroupData): Group;
    /**
     * Retrieve all groups.
     */
    getGroups(): Map<string, Group>;
    /**
     * Retrieve a group with the matching ID from the group store.
     */
    getGroup(id: string): Group;
    /**
     * Retrieve all scenes
     */
    getScenes(): Map<string, Scene>;
    /**
     * Retrieve a scene with the matching ID from the scene store.
     */
    getScene(id: string): IScene;
    /**
     * Searches through all stored Scenes to find a Control with the matching ID
     */
    getControl(id: string): IControl;
    /**
     * Retrieve all participants.
     */
    getParticipants(): Map<string, IParticipant>;
    private getParticipantBy<K>(field, value);
    /**
     * Retrieve a participant by their Mixer UserId.
     */
    getParticipantByUserID(id: number): IParticipant;
    /**
     * Retrieve a participant by their Mixer Username.
     */
    getParticipantByUsername(name: string): IParticipant;
    /**
     * Retrieve a participant by their sessionID with the current Interactive session.
     */
    getParticipantBySessionID(id: string): IParticipant;
}
