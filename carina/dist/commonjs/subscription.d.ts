import { ConstellationSocket } from './socket';
/**
 * Subscription is attached to a socket and tracks listening functions.
 */
export declare class Subscription<T> {
    private socket;
    private slug;
    private onError;
    private listeners;
    private socketStateListener;
    private socketDataListener;
    constructor(socket: ConstellationSocket, slug: string, onError: (err: Error) => void);
    /**
     * add inserts the listener into the subscription
     */
    add(listener: (data: T) => void): void;
    /**
     * remove removes the listening function.
     */
    remove(listener: (data: T) => void): void;
    /**
     * removeAll destroys all listening functions and unsubscribes from the socket.
     */
    removeAll(): void;
    /**
     * Returns the number of listening functions attached to the subscription.
     */
    listenerCount(): number;
    private addSocketListener();
    private removeSocketListener();
}
