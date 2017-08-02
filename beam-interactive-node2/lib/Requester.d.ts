export interface IRequester {
    request(url: string): Promise<any>;
}
export declare class Requester implements IRequester {
    request(url: string): Promise<any>;
    private getRequestFn(url);
}
