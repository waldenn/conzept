import { EarthEntityCollectionsTreeStrategy } from "./EarthEntityCollectionsTreeStrategy";
import { Extent } from "../../Extent";
import { Planet } from "../../scene/Planet";
import { LonLat } from "../../LonLat";
import { Entity } from "../../entity/Entity";
import { EntityCollection } from "../../entity/EntityCollection";
import { EntityCollectionNode, NodesDict } from "../EntityCollectionNode";
export declare class EarthEntityCollectionNodeLonLat extends EntityCollectionNode {
    isNorth: boolean;
    strategy: EarthEntityCollectionsTreeStrategy;
    constructor(strategy: EarthEntityCollectionsTreeStrategy, partId: number, parent: EarthEntityCollectionNodeLonLat | null, extent: Extent, planet: Planet, zoom: number);
    createChildrenNodes(): void;
    protected _setExtentBounds(): void;
    __setLonLat__(entity: Entity): LonLat;
    isVisible(): boolean;
    isInside(entity: Entity): boolean;
    renderCollection(outArr: EntityCollection[], visibleNodes: NodesDict, renderingNode: number): void;
}
