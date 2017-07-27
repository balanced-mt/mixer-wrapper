import { IRequester } from './Requester';
export interface IInteractiveEndpoint {
    address: string;
}
export declare class EndpointDiscovery {
    private requester;
    constructor(requester: IRequester);
    /**
     * Retrieves available interactive servers from Mixer's REST API.
     * Game Clients should connect to the first one in the list and use
     * other servers in the list should a connection attempt to the first
     * fail.
     */
    retrieveEndpoints(endpoint?: string): Promise<IInteractiveEndpoint[]>;
}
