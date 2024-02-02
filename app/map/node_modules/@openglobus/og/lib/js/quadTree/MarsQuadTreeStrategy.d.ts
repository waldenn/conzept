import { Planet } from "../scene/Planet";
import { QuadTreeStrategy } from "./QuadTreeStrategy";
export declare class MarsQuadTreeStrategy extends QuadTreeStrategy {
    constructor(planet: Planet);
    init(): void;
}
