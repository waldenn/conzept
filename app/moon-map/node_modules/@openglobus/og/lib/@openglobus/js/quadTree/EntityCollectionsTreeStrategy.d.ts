import { Vector } from "../layer/Vector";
import { EntityCollectionNode } from "./EntityCollectionNode";
import { Entity } from "../entity/Entity";
import { EntityCollection } from "../entity/EntityCollection";
import { QueueArray } from "../QueueArray";
export declare class EntityCollectionsTreeStrategy {
    _layer: Vector;
    /**
     * Maximum entities quantity in the tree node.
     * @public
     */
    _nodeCapacity: number;
    _secondPASS: EntityCollectionNode[];
    protected _counter: number;
    protected _deferredEntitiesPendingQueue: QueueArray<EntityCollectionNode>;
    _renderingNodes: Record<number, boolean>;
    constructor(layer: Vector, nodeCapacity: number);
    insertEntity(entity: Entity, rightNow?: boolean): void;
    setPickingEnabled(pickingEnabled: boolean): void;
    dispose(): void;
    insertEntities(entitiesForTree: Entity[]): void;
    collectVisibleEntityCollections(outArr: EntityCollection[]): void;
    _queueDeferredNode(node: EntityCollectionNode): void;
    protected _execDeferredNode(node: EntityCollectionNode): void;
}
