import { IRgbTerrainParams, RgbTerrain } from "./RgbTerrain";
import { Segment } from "../segment/Segment";
export declare class GlobusRgbTerrain extends RgbTerrain {
    constructor(name?: string | null, options?: IRgbTerrainParams);
    isReadyToLoad(segment: Segment): boolean;
}
