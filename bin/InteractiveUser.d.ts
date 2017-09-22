import { IParticipant } from "../beam-interactive-node2";
import { Event } from "./common/utils/Event";
import { InteractiveWrapper } from "./InteractiveWrapper";
import { InteractiveGroup } from "./InteractiveGroup";
export declare class InteractiveUser {
    readonly wrapper: InteractiveWrapper;
    protected readonly internal: IParticipant;
    private data;
    readonly onLeaveEvent: Event<() => void>;
    constructor(wrapper: InteractiveWrapper, participant: IParticipant);
    setParticipant(participant: IParticipant, update?: boolean): void;
    removeParticipant(sessionID: string): boolean;
    /**
     * [Property][Readonly] Returns true is the user is still connected
     */
    readonly connected: boolean;
    /**
     * [Property][Readonly] Returns userID
     */
    readonly userID: number;
    /**
     * [Property][Readonly] Returns username
     */
    readonly username: string;
    /**
     * [Property][Readonly] Returns sessionID
     */
    readonly sessionID: string;
    getData(name: string): {
        [K: string]: any;
    };
    removeData(name: string): {
        [K: string]: any;
    };
    /**
     * Moves the user to a new InteractiveGroup.
     *
     * Returns a promise which will resolve after the user is moved
     */
    move(group: InteractiveGroup): Promise<void>;
    /**********************************************************************/
    protected _userID: number;
    protected _username: string;
    protected _group: InteractiveGroup;
    readonly group: InteractiveGroup;
    private setGroup(group);
    /**********************************************************************/
    private setupInternal();
}
