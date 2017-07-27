import { IInput, IInputEvent } from '../state/interfaces/controls/IInput';
import { IParticipantArray } from '../state/interfaces/IParticipant';
import { Method, Reply } from '../wire/packets';
import { onReadyParams } from './methodTypes';
import { IGroupDataArray, IGroupDeletionParams } from '../state/interfaces/IGroup';
import { ISceneData, ISceneDataArray, ISceneDeletionParams } from '../state/interfaces/IScene';
/**
 * A Method handler takes a given method and handles it, optionally replying with a reply instance.
 */
export interface IMethodHandler<T> {
    (method: Method<T>): Reply | void;
}
/**
 * A manager class which allows for methods on the interactive protocol to have handlers registered.
 * When the manager is handed a method, it will look up the relevant method handler and call it.
 */
export declare class MethodHandlerManager {
    private handlers;
    addHandler(method: 'onParticipantJoin', handler: IMethodHandler<IParticipantArray>): void;
    addHandler(method: 'onParticipantLeave', handler: IMethodHandler<IParticipantArray>): void;
    addHandler(method: 'onParticipantUpdate', handler: IMethodHandler<IParticipantArray>): void;
    addHandler(method: 'onSceneCreate', handler: IMethodHandler<ISceneDataArray>): void;
    addHandler(method: 'onSceneDelete', handler: IMethodHandler<ISceneDeletionParams>): void;
    addHandler(method: 'onSceneUpdate', handler: IMethodHandler<ISceneDataArray>): void;
    addHandler(method: 'onGroupCreate', handler: IMethodHandler<IGroupDataArray>): void;
    addHandler(method: 'onGroupDelete', handler: IMethodHandler<IGroupDeletionParams>): void;
    addHandler(method: 'onGroupUpdate', handler: IMethodHandler<IGroupDataArray>): void;
    addHandler(method: 'onControlCreate', handler: IMethodHandler<ISceneData>): void;
    addHandler(method: 'onControlDelete', handler: IMethodHandler<ISceneData>): void;
    addHandler(method: 'onControlUpdate', handler: IMethodHandler<ISceneData>): void;
    addHandler(method: 'onReady', handler: IMethodHandler<onReadyParams>): void;
    addHandler(method: 'hello', handler: IMethodHandler<void>): void;
    addHandler<T extends IInput>(method: 'giveInput', handler: IMethodHandler<IInputEvent<T>>): void;
    addHandler<T>(method: string, handler: IMethodHandler<T>): void;
    /**
     * Removes a handler for a method.
     */
    removeHandler(method: string): void;
    /**
     * Looks up a handler for a given method and calls it.
     */
    handle<T>(method: Method<T>): Reply | void;
}
