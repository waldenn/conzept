import { Vector } from "../../layer/Vector";
import { Entity } from "../../entity/Entity";
import { EntityCollection } from "../../entity/EntityCollection";
import { EntityCollectionsTreeStrategy } from "../EntityCollectionsTreeStrategy";
import { EquiEntityCollectionNodeLonLat } from "./EquiEntityCollectionNodeLonLat";
export declare class EquiEntityCollectionsTreeStrategy extends EntityCollectionsTreeStrategy {
    protected _entityCollectionsTreeWest: EquiEntityCollectionNodeLonLat;
    protected _entityCollectionsTreeEast: EquiEntityCollectionNodeLonLat;
    _renderingNodesWest: Record<number, boolean>;
    _renderingNodesEast: Record<number, boolean>;
    constructor(layer: Vector, nodeCapacity: number);
    insertEntity(entity: Entity, rightNow?: boolean): void;
    setPickingEnabled(pickingEnabled: boolean): void;
    dispose(): void;
    insertEntities(entitiesForTree: Entity[]): void;
    collectVisibleEntityCollections(outArr: EntityCollection[]): void;
}
