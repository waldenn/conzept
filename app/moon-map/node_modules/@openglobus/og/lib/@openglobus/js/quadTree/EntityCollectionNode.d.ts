import { EntityCollection } from '../entity/EntityCollection';
import { Extent } from '../Extent';
import { LonLat } from '../LonLat';
import { Node } from "../quadTree/Node";
import { Planet } from "../scene/Planet";
import { Sphere } from '../bv/Sphere';
import { Segment } from "../segment/Segment";
import { Vector } from "../layer/Vector";
import { Entity } from "../entity/Entity";
import { EntityCollectionsTreeStrategy } from "./EntityCollectionsTreeStrategy";
export type NodesDict = Record<number, Node>;
/**
 * @todo: remove planet parameter. It's already available in the layer.
 */
declare class EntityCollectionNode {
    layer: Vector;
    strategy: EntityCollectionsTreeStrategy;
    parentNode: EntityCollectionNode | null;
    childrenNodes: EntityCollectionNode[];
    partId: number;
    nodeId: number;
    state: number | null;
    extent: Extent;
    count: number;
    deferredEntities: Entity[];
    entityCollection: EntityCollection | null;
    zoom: number;
    bsphere: Sphere;
    _inTheQueue: boolean;
    constructor(strategy: EntityCollectionsTreeStrategy, partId: number, parent: EntityCollectionNode | null, extent: Extent, planet: Planet, zoom: number);
    insertEntity(entity: Entity, rightNow?: boolean): void;
    protected _addEntitiesToCollection(entities: Entity[], rightNow?: boolean): void;
    protected _setExtentBounds(): void;
    __setLonLat__(entity: Entity): LonLat;
    buildTree(entities: Entity[], rightNow?: boolean): void;
    isInside(entity: Entity): boolean;
    createChildrenNodes(): void;
    collectRenderCollectionsPASS1(visibleNodes: NodesDict, outArr: EntityCollection[]): void;
    collectRenderCollectionsPASS2(visibleNodes: NodesDict, outArr: EntityCollection[], renderingNodeId: number): void;
    applyCollection(): void;
    traverseTree(callback: Function): void;
    renderCollection(outArr: EntityCollection[], visibleNodes: NodesDict, renderingNodeId?: number): void;
    alignEntityToTheGround(entity: Entity, segment: Segment): void;
    isVisible(): boolean;
}
export { EntityCollectionNode };
