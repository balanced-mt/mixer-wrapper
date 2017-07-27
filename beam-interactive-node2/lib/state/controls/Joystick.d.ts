import { IJoystickInput } from '../interfaces/controls/IInput';
import { IJoystick, IJoystickData } from '../interfaces/controls/IJoystick';
import { Control } from './Control';
/**
 * Joysticks can be moved by participants and will report their coordinates down to GameClients
 */
export declare class Joystick extends Control<IJoystickData> implements IJoystick {
    angle: number;
    intensity: number;
    sampleRate: number;
    /**
     * Sets the angle of the direction indicator for this joystick.
     */
    setAngle(angle: number): Promise<void>;
    /**
     * Sets the opacity/strength of the direction indicator for this joystick.
     */
    setIntensity(intensity: number): Promise<void>;
    /**
     * Sends an input event from a participant to the server for consumption.
     */
    giveInput(input: IJoystickInput): Promise<void>;
}
