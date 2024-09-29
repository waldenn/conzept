import { Planet } from "../../scene/Planet";
import { QuadTreeStrategy } from "../QuadTreeStrategy";
export declare class Wgs84QuadTreeStrategy extends QuadTreeStrategy {
    constructor(planet: Planet);
    init(): void;
}
