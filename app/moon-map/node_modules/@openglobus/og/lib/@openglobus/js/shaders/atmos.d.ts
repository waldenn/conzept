import { Program } from '../webgl/Program';
import { NumberArray3 } from "../math/Vec3";
export interface AtmosphereParameters {
    ATMOS_HEIGHT: number;
    RAYLEIGH_SCALE: number;
    MIE_SCALE: number;
    GROUND_ALBEDO: number;
    BOTTOM_RADIUS: number;
    rayleighScatteringCoefficient: NumberArray3;
    mieScatteringCoefficient: number;
    mieExtinctionCoefficient: number;
    ozoneAbsorptionCoefficient: NumberArray3;
    SUN_ANGULAR_RADIUS: number;
    SUN_INTENSITY: number;
    ozoneDensityHeight: number;
    ozoneDensityWide: number;
}
export declare const COMMON: (atmosParams?: AtmosphereParameters) => string;
export declare function transmittance(atmosParams?: AtmosphereParameters): Program;
export declare function scattering(atmosParams?: AtmosphereParameters): Program;
