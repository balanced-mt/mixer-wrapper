import { Client as MixerClient, IChatMessage, IDeleteMessage, IPurgeMessage, IUserUpdate, IUserConnection, IPollEvent, IUserTimeout } from "beam-client-node";
import { Event } from "./common/utils/Event";
export interface ChatClearMessages {
    clearer: {
        user_name: string;
        user_id: number;
        user_roles: string[];
        user_level: number;
    };
}
export declare class ChatWrapper {
    private client?;
    private socket?;
    private channelID;
    private client_id;
    private accessToken;
    private tokenExpires;
    private commandQueue;
    private commandQueueInterval;
    /**
     * Event called when new user joins the chat.
     */
    onChatUserJoin: Event<(id: number, username: string, data: IUserConnection) => void>;
    /**
     * Event called when user leaves the chat.
     */
    onChatUserLeave: Event<(id: number, username: string, data: IUserConnection) => void>;
    /**
     * Event called when chat is cleared.
     */
    onChatClearMessages: Event<() => void>;
    /**
     * Event called when message is deleted.
     */
    onChatDeleteMessage: Event<(data: IDeleteMessage) => void>;
    /**
     * Event called when messages from a specific user are purged.
     *
     * Example: when user gets timed out or banned.
     */
    onChatPurgeMessage: Event<(data: IPurgeMessage) => void>;
    /**
     * Event called when a user is timed out from chat
     */
    onChatUserTimeout: Event<(data: IUserTimeout) => void>;
    /**
     * Event called when user is updated.
     */
    onChatUserUpdate: Event<(data: IUserUpdate) => void>;
    /**
     * Event called when bot receives a new message.
     */
    onChatMessage: Event<(data: IChatMessage & {
        text: string;
    }) => void>;
    /**
     * Called when a chat poll is started
     */
    onPollStart: Event<(data: IPollEvent) => void>;
    /**
     * Called when a chat poll ends
     */
    onPollEnd: Event<(data: IPollEvent) => void>;
    /**
     * Event called the ChatWrapper is ready.
     */
    onBotReady: Event<(client: MixerClient) => void>;
    constructor(channelID: number, client_id: string, accessToken: string, tokenExpires: number);
    /**
     * Add an outgoing command to the command-queue
     */
    private addToQueue;
    /**
     * Send a global chat message
     */
    sendChatMessage(message: string, pushFront?: boolean): void;
    static CleanUsername(name: string): string;
    /**
     * Send a message to a particular user
     */
    sendUserMessage(user: string, message: string, pushFront?: boolean): void;
    /**
     * Remove a particular message from the chat
     */
    removeMessage(id: string): void;
    /**
     * Start processing the command queue to funnel outgoing messages
     */
    startCommandQueue(): void;
    start(): Promise<void>;
    stop(): Promise<boolean>;
}
