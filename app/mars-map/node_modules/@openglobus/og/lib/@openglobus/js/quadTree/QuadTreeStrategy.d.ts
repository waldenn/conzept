import { Layer } from "../layer/Layer";
import { Vector } from "../layer/Vector";
import { Node } from "../quadTree/Node";
import { Planet } from "../scene/Planet";
import { Proj } from "../proj/Proj";
import { LonLat } from "../LonLat";
import { EntityCollectionsTreeStrategy } from "./EntityCollectionsTreeStrategy";
export declare class QuadTreeStrategy {
    name: string;
    projection: Proj;
    protected _planet: Planet;
    /**
     * grid tree list.
     * @protected
     * @type {Node[]}
     */
    protected _quadTreeList: Node[];
    /**
     * Current visible mercator segments tree nodes array.
     * @public
     * @type {Node}
     */
    _visibleNodes: Record<number, Node>;
    constructor(planet: Planet, name?: string, proj?: Proj);
    createEntitiCollectionsTreeStrategy(layer: Vector, nodeCapacity: number): EntityCollectionsTreeStrategy;
    destroyBranches(): void;
    clearLayerMaterial(layer: Layer): void;
    get planet(): Planet;
    init(): void;
    preRender(): void;
    preLoad(): void;
    protected _clearVisibleNodes(): void;
    collectRenderNodes(): void;
    clear(): void;
    get quadTreeList(): Node[];
    getTileXY(lonLat: LonLat, zoom: number): [number, number, number, number];
    getLonLatTileOffset(lonLat: LonLat, x: number, y: number, z: number, gridSize: number): [number, number];
    collectVisibleNode(node: Node): void;
}
