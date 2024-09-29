import { EntityCollectionNode } from "../EntityCollectionNode";
import { EarthEntityCollectionNodeLonLat } from "./EarthEntityCollectionNodeLonLat";
import { Vector } from "../../layer/Vector";
import { Entity } from "../../entity/Entity";
import { EntityCollection } from "../../entity/EntityCollection";
import { EntityCollectionsTreeStrategy } from "../EntityCollectionsTreeStrategy";
export declare class EarthEntityCollectionsTreeStrategy extends EntityCollectionsTreeStrategy {
    protected _entityCollectionsTree: EntityCollectionNode;
    protected _entityCollectionsTreeNorth: EarthEntityCollectionNodeLonLat;
    protected _entityCollectionsTreeSouth: EarthEntityCollectionNodeLonLat;
    _renderingNodesNorth: Record<number, boolean>;
    _renderingNodesSouth: Record<number, boolean>;
    constructor(layer: Vector, nodeCapacity: number);
    insertEntity(entity: Entity, rightNow?: boolean): void;
    setPickingEnabled(pickingEnabled: boolean): void;
    dispose(): void;
    insertEntities(entitiesForTree: Entity[]): void;
    collectVisibleEntityCollections(outArr: EntityCollection[]): void;
}
