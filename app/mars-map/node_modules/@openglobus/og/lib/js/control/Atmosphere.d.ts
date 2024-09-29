import { AtmosphereParameters } from "../shaders/atmos";
import { Framebuffer } from "../webgl/Framebuffer";
import { Control, IControlParams } from "./Control";
import { NumberArray3 } from '../math/Vec3';
export interface IAtmosphereParams extends IControlParams {
    height?: number;
    rayleighScale?: number;
    mieScale?: number;
    groundAlbedo?: number;
    bottomRadius?: number;
    rayleighScatteringCoefficient?: NumberArray3;
    mieScatteringCoefficient?: number;
    mieExtinctionCoefficient?: number;
    ozoneAbsorptionCoefficient?: NumberArray3;
    sunAngularRadius?: number;
    sunIntensity?: number;
    ozoneDensityHeight?: number;
    ozoneDensityWide?: number;
}
export declare class Atmosphere extends Control {
    _transmittanceBuffer: Framebuffer | null;
    _scatteringBuffer: Framebuffer | null;
    opacity: number;
    protected _parameters: AtmosphereParameters;
    constructor(options?: IAtmosphereParams);
    setParameters(parameters: AtmosphereParameters): void;
    get parameters(): AtmosphereParameters;
    initPlanetAtmosphereShader(): void;
    oninit(): void;
    initLookupTexturesShaders(): void;
    initBackgroundShader(): void;
    removeBackgroundShader(): void;
    removeLookupTexturesShaders(): void;
    onactivate(): void;
    ondeactivate(): void;
    protected _initLookupTextures(): void;
    protected _renderLookupTextures(): void;
    drawLookupTextures(): void;
    protected _drawBackground(): void;
}
