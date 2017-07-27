import { Control } from './controls';
import { IControlData } from './interfaces/controls';
import { IClient } from '../IClient';
import { ISceneData } from './interfaces/IScene';
import { Scene } from './Scene';
/**
 * The StateFactory creates the apropriate instance of a class for a given socket message.
 */
export declare class StateFactory {
    private client;
    setClient(client: IClient): void;
    createControl<T extends IControlData>(controlKind: string, values: T, scene: Scene): Control<T>;
    createScene(values: ISceneData): Scene;
}
