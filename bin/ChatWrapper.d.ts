import BeamClient = require("beam-client-node");
import * as Chat from "beam-client-node/defs/chat";
import { Event } from "./common/utils/Event";
export interface ChatClearMessages {
    clearer: {
        user_name: string;
        user_id: number;
        user_roles: string[];
        user_level: number;
    };
}
export interface ChatMessage extends Chat.ChatMessage {
    text: string;
}
export declare class ChatWrapper {
    private client;
    private socket;
    private channelID;
    private client_id;
    private accessToken;
    private tokenExpires;
    private commandQueue;
    private commandQueueInterval;
    onChatUserJoin: Event<(id: number, username: string, data: Chat.UserConnection) => void>;
    onChatUserLeave: Event<(id: number, username: string, data: Chat.UserConnection) => void>;
    onChatClearMessages: Event<(data: ChatClearMessages) => void>;
    onChatDeleteMessage: Event<(data: Chat.DeleteMessage) => void>;
    onChatPurgeMessage: Event<(data: Chat.PurgeMessage) => void>;
    onChatUserUpdate: Event<(data: Chat.UserUpdate) => void>;
    onChatMessage: Event<(data: ChatMessage) => void>;
    onBotReady: Event<(client: BeamClient) => void>;
    constructor(channelID: number, client_id: string, accessToken: string, tokenExpires: number);
    private addToQueue(f, pushFront?);
    sendChatMessage(message: string, pushFront?: boolean): void;
    static CleanUsername(name: string): string;
    sendUserMessage(user: string, message: string, pushFront?: boolean): void;
    removeMessage(id: string): void;
    startCommandQueue(): void;
    start(): Promise<void>;
    stop(): Promise<boolean>;
}
