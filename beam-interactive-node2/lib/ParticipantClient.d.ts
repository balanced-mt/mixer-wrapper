import { Client } from './Client';
import { IJSON } from './interfaces';
import { IInput } from './state/interfaces/controls';
export interface IParticipantOptions {
    /**
     * A JWT representing a Mixer.com session
     */
    jwt: string;
    /**
     * A url for the Interactive session you'd like to join.
     * This should be retrieved from https://mixer.com/api/v1/interactive/{channelId}
     * @example wss://interactive1-dal.mixer.com/participant?channel=<channelid>
     */
    url: string;
    /**
     * Any extra query parameters you'd like to include on the connection, usually used for debugging.
     */
    extraParams?: IJSON;
}
export declare class ParticipantClient extends Client {
    constructor();
    open(options: IParticipantOptions): Promise<this>;
    /**
     * Sends an input event to the Interactive Server. This should only be called
     * by controls.
     */
    giveInput<T extends IInput>(input: T): Promise<void>;
}
