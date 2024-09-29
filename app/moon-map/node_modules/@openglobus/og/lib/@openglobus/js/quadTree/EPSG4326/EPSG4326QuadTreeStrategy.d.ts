import { Planet } from "../../scene/Planet";
import { QuadTreeStrategy } from "../QuadTreeStrategy";
export declare class EPSG4326QuadTreeStrategy extends QuadTreeStrategy {
    constructor(planet: Planet);
    init(): void;
}
