import { AtmosphereParameters } from "./atmos";
import { Program } from "../webgl/Program";
export declare function drawnode_screen_nl(): Program;
export declare function drawnode_screen_wl_webgl1NoAtmos(): Program;
export declare function drawnode_screen_wl_webgl2NoAtmos(): Program;
export declare function drawnode_screen_wl_webgl2Atmos(atmosParams?: AtmosphereParameters): Program;
export declare function drawnode_colorPicking(): Program;
export declare function drawnode_heightPicking(): Program;
export declare function drawnode_depth(): Program;
