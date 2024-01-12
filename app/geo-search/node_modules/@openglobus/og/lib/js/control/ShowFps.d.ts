import { Control, IControlParams } from "./Control";
/**
 * Frame per second(FPS) display control.
 */
export declare class ShowFps extends Control {
    constructor(options: IControlParams);
    oninit(): void;
    protected _draw(): void;
}
