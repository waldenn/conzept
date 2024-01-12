import { Control, IControlParams } from "./Control";
import { Clock } from "../Clock";
import { LightSource } from "../light/LightSource";
interface ISunParams extends IControlParams {
    activationHeight?: number;
    offsetVertical?: number;
    offsetHorizontal?: number;
    stopped?: boolean;
}
/**
 * Real Sun geocentric position control that place the Sun on the right place by the Earth.
 */
export declare class Sun extends Control {
    activationHeight: number;
    offsetVertical: number;
    offsetHorizontal: number;
    sunlight: LightSource;
    protected _currDate: number;
    protected _prevDate: number;
    protected _clockPtr: Clock | null;
    protected _lightOn: boolean;
    protected _stopped: boolean;
    protected _f: number;
    protected _k: number;
    constructor(options?: ISunParams);
    oninit(): void;
    stop(): void;
    start(): void;
    onactivate(): void;
    bindClock(clock: Clock): void;
    protected _draw(): void;
}
export {};
