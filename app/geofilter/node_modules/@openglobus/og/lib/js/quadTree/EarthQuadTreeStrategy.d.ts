import { Planet } from "../scene/Planet";
import { QuadTreeStrategy } from "./QuadTreeStrategy";
export declare class EarthQuadTreeStrategy extends QuadTreeStrategy {
    constructor(planet: Planet);
    init(): void;
}
