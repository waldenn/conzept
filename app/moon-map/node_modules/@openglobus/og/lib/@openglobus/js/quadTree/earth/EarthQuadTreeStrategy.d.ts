import { Node } from "../Node";
import { Planet } from "../../scene/Planet";
import { QuadTreeStrategy } from "../QuadTreeStrategy";
import { LonLat } from "../../LonLat";
import { Vector } from "../../layer/Vector";
import { EarthEntityCollectionsTreeStrategy } from "./EarthEntityCollectionsTreeStrategy";
export declare class EarthQuadTreeStrategy extends QuadTreeStrategy {
    /**
     * Current visible north pole nodes tree nodes array.
     * @public
     * @type {Node}
     * @todo
     */
    _visibleNodesNorth: Record<number, Node>;
    /**
     * Current visible south pole nodes tree nodes array.
     * @public
     * @type {Node}
     * @todo
     */
    _visibleNodesSouth: Record<number, Node>;
    constructor(planet: Planet);
    collectVisibleNode(node: Node): void;
    protected _clearVisibleNodes(): void;
    createEntitiCollectionsTreeStrategy(layer: Vector, nodeCapacity: number): EarthEntityCollectionsTreeStrategy;
    init(): void;
    getTileXY(lonLat: LonLat, zoom: number): [number, number, number, number];
    getLonLatTileOffset(lonLat: LonLat, x: number, y: number, z: number, gridSize: number): [number, number];
}
