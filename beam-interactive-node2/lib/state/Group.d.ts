/// <reference types="node" />
import { EventEmitter } from 'events';
import { IMeta } from './interfaces/controls';
import { IGroup, IGroupData } from './interfaces/IGroup';
/**
 * A Group is a collection of participants.
 */
export declare class Group extends EventEmitter implements IGroup {
    groupID: string;
    sceneID: string;
    /** @deprecated etags are no longer used, you can always omit/ignore this */
    etag: string;
    meta: IMeta;
    constructor(group: IGroupData);
    /**
     * Updates this group with new data from the server.
     */
    update(data: IGroupData): void;
    destroy(): void;
}
