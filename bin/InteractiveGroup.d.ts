import { IGroup } from "../beam-interactive-node2";
import { Event } from "./common/utils/Event";
import { InteractiveWrapper } from "./InteractiveWrapper";
import { InteractiveScene } from "./InteractiveScene";
import { InteractiveUser } from "./InteractiveUser";
export declare class InteractiveGroup {
    readonly wrapper: InteractiveWrapper;
    private internal;
    readonly id: string;
    readonly temporary: boolean;
    readonly scene: InteractiveScene;
    private userMap;
    readonly onUserEnterEvent: Event<(user: InteractiveUser) => void>;
    readonly onUserLeaveEvent: Event<(user: InteractiveUser) => void>;
    constructor(wrapper: InteractiveWrapper | undefined, scene: InteractiveScene, id?: string);
    destroy(): Promise<void>;
    readonly isValid: boolean;
    getUsers(): Map<number, InteractiveUser>;
    getUsersCount(): number;
    addUser(user: InteractiveUser): void;
    removeUser(user: InteractiveUser): void;
    move(scene: InteractiveScene): Promise<void>;
    /**********************************************************************/
    beamGroupInit(internal: IGroup): void;
    beamGroupDestroy(): void;
}
