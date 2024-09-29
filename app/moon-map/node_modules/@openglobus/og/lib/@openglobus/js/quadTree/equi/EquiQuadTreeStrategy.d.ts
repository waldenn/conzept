import { Node } from "../Node";
import { Planet } from "../../scene/Planet";
import { QuadTreeStrategy } from "../QuadTreeStrategy";
import { LonLat } from "../../LonLat";
import { Vector } from "../../layer/Vector";
import { EntityCollectionsTreeStrategy } from "../EntityCollectionsTreeStrategy";
export declare class EquiQuadTreeStrategy extends QuadTreeStrategy {
    private _westExtent;
    private _eastExtent;
    _visibleNodesWest: Record<number, Node>;
    _visibleNodesEast: Record<number, Node>;
    constructor(planet: Planet);
    init(): void;
    getTileXY(lonLat: LonLat, zoom: number): [number, number, number, number];
    getLonLatTileOffset(lonLat: LonLat, x: number, y: number, z: number, gridSize: number): [number, number];
    createEntitiCollectionsTreeStrategy(layer: Vector, nodeCapacity: number): EntityCollectionsTreeStrategy;
    collectVisibleNode(node: Node): void;
    protected _clearVisibleNodes(): void;
}
