import { Framebuffer } from "../webgl/Framebuffer";
import { Control, IControlParams } from "./Control";
interface IAtmosphereParams extends IControlParams {
}
export declare class Atmosphere extends Control {
    _transmittanceBuffer: Framebuffer | null;
    _scatteringBuffer: Framebuffer | null;
    opacity: number;
    constructor(options?: IAtmosphereParams);
    oninit(): void;
    onactivate(): void;
    ondeactivate(): void;
    protected _drawAtmosphereTextures(): void;
    protected _drawBackground(): void;
}
export {};
