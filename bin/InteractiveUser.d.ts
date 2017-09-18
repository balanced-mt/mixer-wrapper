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
    readonly connected: boolean;
    readonly userID: number;
    readonly username: string;
    readonly sessionID: string;
    getData(name: string): {
        [K: string]: any;
    };
    removeData(name: string): {
        [K: string]: any;
    };
    move(group: InteractiveGroup): Promise<void>;
    /**********************************************************************/
    protected _userID: number;
    protected _username: string;
    protected _group: InteractiveGroup;
    readonly group: InteractiveGroup;
    private setGroup(group);
    setupInternal(): void;
}
