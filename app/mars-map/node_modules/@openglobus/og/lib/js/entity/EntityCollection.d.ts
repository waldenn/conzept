import { BillboardHandler } from "./BillboardHandler";
import { EventsHandler } from "../Events";
import { Entity } from "./Entity";
import { Ellipsoid } from "../ellipsoid/Ellipsoid";
import { EntityCollectionNode } from "../quadTree/EntityCollectionNode";
import { GeoObjectHandler } from "./GeoObjectHandler";
import { LabelHandler } from "./LabelHandler";
import { NumberArray3 } from "../math/Vec3";
import { PointCloudHandler } from "./PointCloudHandler";
import { PolylineHandler } from "./PolylineHandler";
import { RayHandler } from "./RayHandler";
import { RenderNode } from "../scene/RenderNode";
import { StripHandler } from "./StripHandler";
import { Vector } from "../layer/Vector";
export type EntityCollectionEvents = EventsHandler<EntityCollectionEventList>;
interface IEntityCollectionParams {
    polygonOffsetUnits?: number;
    visibility?: boolean;
    labelMaxLetters?: number;
    pickingEnabled?: boolean;
    scaleByDistance?: NumberArray3;
    pickingScale?: number | NumberArray3;
    opacity?: number;
    useLighting?: boolean;
    entities?: Entity[];
}
/**
 * An observable collection of og.Entity instances where each entity has a unique id.
 * Entity collection provide handlers for each type of entity like billboard, label or 3ds object.
 * @constructor
 * @param {Object} [options] - Entity options:
 * @param {Array.<Entity>} [options.entities] - Entities array.
 * @param {boolean} [options.visibility=true] - Entity visibility.
 * @param {Array.<number>} [options.scaleByDistance] - Entity scale by distance parameters. (exactly 3 entries)
 * First index - near distance to the entity, after entity becomes full scale.
 * Second index - far distance to the entity, when entity becomes zero scale.
 * Third index - far distance to the entity, when entity becomes invisible.
 * @param {number} [options.opacity] - Entity global opacity.
 * @param {boolean} [options.pickingEnabled=true] - Entity picking enable.
 * @param {Number} [options.polygonOffsetUnits=0.0] - The multiplier by which an implementation-specific value is multiplied with to create a constant depth offset. The default value is 0.
 * //@fires EntityCollection#entitymove
 * @fires EntityCollection#draw
 * @fires EntityCollection#drawend
 * @fires EntityCollection#add
 * @fires EntityCollection#remove
 * @fires EntityCollection#entityadd
 * @fires EntityCollection#entityremove
 * @fires EntityCollection#visibilitychange
 * @fires EntityCollection#mousemove
 * @fires EntityCollection#mouseenter
 * @fires EntityCollection#mouseleave
 * @fires EntityCollection#lclick
 * @fires EntityCollection#rclick
 * @fires EntityCollection#mclick
 * @fires EntityCollection#ldblclick
 * @fires EntityCollection#rdblclick
 * @fires EntityCollection#mdblclick
 * @fires EntityCollection#lup
 * @fires EntityCollection#rup
 * @fires EntityCollection#mup
 * @fires EntityCollection#ldown
 * @fires EntityCollection#rdown
 * @fires EntityCollection#mdown
 * @fires EntityCollection#lhold
 * @fires EntityCollection#rhold
 * @fires EntityCollection#mhold
 * @fires EntityCollection#mousewheel
 * @fires EntityCollection#touchmove
 * @fires EntityCollection#touchstart
 * @fires EntityCollection#touchend
 * @fires EntityCollection#doubletouch
 * @fires EntityCollection#touchleave
 * @fires EntityCollection#touchenter
 */
declare class EntityCollection {
    static __counter__: number;
    /**
     * Uniq identifier.
     * @public
     * @readonly
     */
    protected __id: number;
    /**
     * Render node collections array index.
     * @protected
     * @type {number}
     */
    protected _renderNodeIndex: number;
    /**
     * Render node context.
     * @public
     * @type {RenderNode}
     */
    renderNode: RenderNode | null;
    /**
     * Visibility option.
     * @public
     * @type {boolean}
     */
    _visibility: boolean;
    /**
     * Specifies the scale Units for gl.polygonOffset function to calculate depth values, 0.0 is default.
     * @public
     * @type {Number}
     */
    polygonOffsetUnits: number;
    /**
     * Billboards handler
     * @public
     * @type {BillboardHandler}
     */
    billboardHandler: BillboardHandler;
    /**
     * Labels handler
     * @public
     * @type {LabelHandler}
     */
    labelHandler: LabelHandler;
    /**
     * Polyline handler
     * @public
     * @type {PolylineHandler}
     */
    polylineHandler: PolylineHandler;
    /**
     * Ray handler
     * @public
     * @type {RayHandler}
     */
    rayHandler: RayHandler;
    /**
     * PointCloud handler
     * @public
     * @type {PointCloudHandler}
     */
    pointCloudHandler: PointCloudHandler;
    /**
     * Strip handler
     * @public
     * @type {StripHandler}
     */
    stripHandler: StripHandler;
    /**
     * Geo object handler
     * @public
     * @type {GeoObjectHandler}
     */
    geoObjectHandler: GeoObjectHandler;
    /**
     * Entities array.
     * @public
     * @type {Array.<Entity>}
     */
    _entities: Entity[];
    /**
     * First index - near distance to the entity, after entity becomes full scale.
     * Second index - far distance to the entity, when entity becomes zero scale.
     * Third index - far distance to the entity, when entity becomes invisible.
     * @public
     * @type {Array.<number>} - (exactly 3 entries)
     */
    scaleByDistance: NumberArray3;
    pickingScale: Float32Array;
    /**
     * Global opacity.
     * @protected
     * @type {number}
     */
    protected _opacity: number;
    /**
     * Opacity state during the animated opacity.
     * @public
     * @type {number}
     */
    _fadingOpacity: number;
    /**
     * Entity collection events handler.
     * @public
     * @type {EntityCollectionEvents}
     */
    events: EntityCollectionEvents;
    rendererEvents: EntityCollectionEvents;
    /**
     * Used in EntityCollectionNode, also could be merged with _quadNode
     */
    _layer?: Vector;
    _quadNode?: EntityCollectionNode;
    _useLighting: number;
    constructor(options?: IEntityCollectionParams);
    isEmpty(): boolean;
    get id(): number;
    get useLighting(): boolean;
    set useLighting(f: boolean);
    isEqual(ec: EntityCollection): boolean;
    /**
     * Sets collection visibility.
     * @public
     * @param {boolean} visibility - Visibility flag.
     */
    setVisibility(visibility: boolean): void;
    /**
     * Returns collection visibility.
     * @public
     * @returns {boolean} -
     */
    getVisibility(): boolean;
    /**
     * Sets collection opacity.
     * @public
     * @param {number} opacity - Opacity.
     */
    setOpacity(opacity: number): void;
    /**
     * Sets collection picking ability.
     * @public
     * @param {boolean} enable - Picking enable flag.
     */
    setPickingEnabled(enable: boolean): void;
    /**
     * Gets collection opacity.
     * @public
     * @returns {number} -
     */
    getOpacity(): number;
    /**
     * Sets scale by distance parameters.
     * @public
     * @param {number} near - Full scale entity distance.
     * @param {number} far - Zero scale entity distance.
     * @param {number} [farInvisible] - Entity visibility distance.
     */
    setScaleByDistance(near: number, far: number, farInvisible?: number): void;
    appendChildEntity(entity: Entity): void;
    protected _addRecursively(entity: Entity): void;
    /**
     * Adds entity to the collection and returns collection.
     * @public
     * @param {Entity} entity - Entity.
     * @returns {EntityCollection} -
     */
    add(entity: Entity): EntityCollection;
    /**
     * Adds entities array to the collection and returns collection.
     * @public
     * @param {Array.<Entity>} entities - Entities array.
     * @returns {EntityCollection} -
     */
    addEntities(entities: Entity[]): EntityCollection;
    /**
     * Returns true if the entity belongs this collection, otherwise returns false.
     * @public
     * @param {Entity} entity - Entity.
     * @returns {boolean} -
     */
    belongs(entity: Entity): boolean | null;
    protected _removeRecursively(entity: Entity): void;
    /**
     * Removes entity from this collection.
     * @public
     * @param {Entity} entity - Entity to remove.
     */
    removeEntity(entity: Entity): void;
    _removeEntitySilent(entity: Entity): void;
    /**
     * Creates or refresh collected entities picking color.
     * @public
     */
    createPickingColors(): void;
    /**
     * Refresh collected entities indexes from startIndex entities collection array position.
     * @public
     * @param {number} startIndex - Entities collection array index.
     */
    reindexEntitiesArray(startIndex: number): void;
    /**
     * Adds this collection to render node.
     * @public
     * @param {RenderNode} renderNode - Render node.
     * @param {boolean} [isHidden] - Uses in vector layers that render in planet render specific function.
     * @returns {EntityCollection} -
     */
    addTo(renderNode: RenderNode, isHidden?: boolean): this;
    /**
     * This function is called in the RenderNode assign function.
     * @public
     * @param {RenderNode} renderNode
     */
    bindRenderNode(renderNode: RenderNode): void;
    /**
     * Updates coordinates all lonLat entities in collection after collection attached to the planet node.
     * @protected
     * @param {Ellipsoid} ellipsoid - Globe ellipsoid.
     */
    protected _updateGeodeticCoordinates(ellipsoid: Ellipsoid): void;
    /**
     * Updates billboard texture atlas.
     * @public
     */
    updateBillboardsTextureAtlas(): void;
    /**
     * Updates labels font atlas.
     * @public
     */
    updateLabelsFontAtlas(): void;
    /**
     * Removes collection from render node.
     * @public
     */
    remove(): void;
    /**
     * Gets entity array.
     * @public
     * @returns {Array.<Entity>} -
     */
    getEntities(): Entity[];
    /**
     * Safety entities loop.
     * @public
     * @param {function} callback - Entity callback.
     */
    each(callback: Function): void;
    /**
     * Removes all entities from collection and clear handlers.
     * @public
     */
    clear(): void;
    /**
     * Clears entity recursively.
     * @private
     * @param {Entity} entity - Entity to clear.
     */
    protected _clearEntity(entity: Entity): void;
}
type EntityCollectionEventList = [
    "draw",
    "drawend",
    "add",
    "remove",
    "entityadd",
    "entityremove",
    "visibilitychange",
    "mousemove",
    "mouseenter",
    "mouseleave",
    "lclick",
    "rclick",
    "mclick",
    "ldblclick",
    "rdblclick",
    "mdblclick",
    "lup",
    "rup",
    "mup",
    "ldown",
    "rdown",
    "mdown",
    "lhold",
    "rhold",
    "mhold",
    "mousewheel",
    "touchmove",
    "touchstart",
    "touchend",
    "doubletouch",
    "touchleave",
    "touchenter"
];
export { EntityCollection };
