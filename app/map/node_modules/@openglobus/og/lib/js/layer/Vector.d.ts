import { Entity, IEntityParams } from "../entity/Entity";
import { EntityCollection } from "../entity/EntityCollection";
import { EntityCollectionsTreeStrategy } from "../quadTree/EntityCollectionsTreeStrategy";
import { EventsHandler } from "../Events";
import { GeometryHandler } from "../entity/GeometryHandler";
import { ILayerParams, Layer, LayerEventsList } from "./Layer";
import { NumberArray3 } from "../math/Vec3";
import { Planet } from "../scene/Planet";
import { Material } from "./Material";
import { NumberArray4 } from "../math/Vec4";
export interface IVectorParams extends ILayerParams {
    entities?: Entity[] | IEntityParams[];
    polygonOffsetUnits?: number;
    nodeCapacity?: number;
    relativeToGround?: boolean;
    clampToGround?: boolean;
    async?: boolean;
    pickingScale?: number | NumberArray3;
    scaleByDistance?: NumberArray3;
    labelMaxLetters?: number;
    useLighting?: boolean;
}
type VectorEventsList = [
    "draw",
    "entityadd",
    "entityremove"
];
export type VectorEventsType = EventsHandler<VectorEventsList> & EventsHandler<LayerEventsList>;
/**
 * Vector layer represents alternative entities store. Used for geospatial data rendering like
 * points, lines, polygons, geometry objects etc.
 * @class
 * @extends {Layer}
 * @param {string} [name="noname"] - Layer name.
 * @param {IVectorParams} [options] - Layer options:
 * @param {number} [options.minZoom=0] - Minimal visible zoom. 0 is default
 * @param {number} [options.maxZoom=50] - Maximal visible zoom. 50 is default.
 * @param {string} [options.attribution] - Layer attribution.
 * @param {string} [options.zIndex=0] - Layer Z-order index. 0 is default.
 * @param {boolean} [options.visibility=true] - Layer visibility. True is default.
 * @param {boolean} [options.isBaseLayer=false] - Layer base layer. False is default.
 * @param {Array.<Entity>} [options.entities] - Entities array.
 * @param {Array.<number>} [options.scaleByDistance] - Scale by distance parameters. (exactly 3 entries)
 *      First index - near distance to the entity, after entity becomes full scale.
 *      Second index - far distance to the entity, when entity becomes zero scale.
 *      Third index - far distance to the entity, when entity becomes invisible.
 *      Use [1.0, 1.0, 1.0] for real sized objects
 * @param {number} [options.nodeCapacity=30] - Maximum entities quantity in the tree node. Rendering optimization parameter. 30 is default.
 * @param {boolean} [options.async=true] - Asynchronous vector data handling before rendering. True for optimization huge data.
 * @param {boolean} [options.clampToGround = false] - Clamp vector data to the ground.
 * @param {boolean} [options.relativeToGround = false] - Place vector data relative to the ground relief.
 * @param {Number} [options.polygonOffsetUnits=0.0] - The multiplier by which an implementation-specific value is multiplied with to create a constant depth offset.
 *
 * //@fires EventsHandler<VectorEventsList>#entitymove
 * @fires EventsHandler<VectorEventsList>#draw
 * @fires EventsHandler<VectorEventsList>#add
 * @fires EventsHandler<VectorEventsList>#remove
 * @fires EventsHandler<VectorEventsList>#entityadd
 * @fires EventsHandler<VectorEventsList>#entityremove
 * @fires EventsHandler<VectorEventsList>#visibilitychange
 */
declare class Vector extends Layer {
    events: VectorEventsType;
    /**
     * Entities collection.
     * @protected
     */
    protected _entities: Entity[];
    /**
     * First index - near distance to the entity, after that entity becomes full scale.
     * Second index - far distance to the entity, when entity becomes zero scale.
     * Third index - far distance to the entity, when entity becomes invisible.
     * @public
     * @type {NumberArray3} - (exactly 3 entries)
     */
    scaleByDistance: NumberArray3;
    pickingScale: Float32Array;
    /**
     * Asynchronous data handling before rendering.
     * @public
     * @type {boolean}
     */
    async: boolean;
    /**
     * Maximum entities quantity in the tree node.
     * @public
     */
    _nodeCapacity: number;
    /**
     * Clamp vector data to the ground.
     * @public
     * @type {boolean}
     */
    clampToGround: boolean;
    /**
     * Sets vector data relative to the ground relief.
     * @public
     * @type {boolean}
     */
    relativeToGround: boolean;
    /** todo: combine into one */
    protected _stripEntityCollection: EntityCollection;
    protected _polylineEntityCollection: EntityCollection;
    protected _geoObjectEntityCollection: EntityCollection;
    _geometryHandler: GeometryHandler;
    protected _entityCollectionsTreeStrategy: EntityCollectionsTreeStrategy | null;
    /**
     * Specifies the scale Units for gl.polygonOffset function to calculate depth values, 0.0 is default.
     * @public
     * @type {Number}
     */
    polygonOffsetUnits: number;
    protected _labelMaxLetters: number;
    protected _useLighting: boolean;
    constructor(name?: string | null, options?: IVectorParams);
    get useLighting(): boolean;
    set useLighting(f: boolean);
    get labelMaxLetters(): number;
    get instanceName(): string;
    protected _bindPicking(): void;
    /**
     * Adds layer to the planet.
     * @public
     * @param {Planet} planet - Planet scene object.
     * @returns {Vector} -
     */
    addTo(planet: Planet): void;
    remove(): this;
    /**
     * Returns stored entities.
     * @public
     * @returns {Array.<Entity>} -
     */
    getEntities(): Entity[];
    /**
     * Adds entity to the layer.
     * @public
     * @param {Entity} entity - Entity.
     * @param {boolean} [rightNow=false] - Entity insertion option. False is default.
     * @returns {Vector} - Returns this layer.
     */
    add(entity: Entity, rightNow?: boolean): this;
    /**
     * Adds entity to the layer in the index position.
     * @public
     * @param {Entity} entity - Entity.
     * @param {Number} index - Index position.
     * @param {boolean} [rightNow] - Entity insertion option. False is default.
     * @returns {Vector} - Returns this layer.
     */
    insert(entity: Entity, index: number, rightNow?: boolean): this;
    protected _proceedEntity(entity: Entity, rightNow?: boolean): void;
    /**
     * Adds entity array to the layer.
     * @public
     * @param {Array.<Entity>} entities - Entities array.
     * @param {boolean} [rightNow=false] - Entity insertion option. False is default.
     * @returns {Vector} - Returns this layer.
     */
    addEntities(entities: Entity[], rightNow?: boolean): this;
    /**
     * Remove entity from layer.
     * TODO: memory leaks.
     * @public
     * @param {Entity} entity - Entity to remove.
     * @returns {Vector} - Returns this layer.
     */
    removeEntity(entity: Entity): this;
    /**
     * Set layer picking events active.
     * @public
     * @param {boolean} picking - Picking enable flag.
     */
    set pickingEnabled(picking: boolean);
    /**
     * Refresh collected entities indexes from startIndex entities collection array position.
     * @protected
     * @param {number} startIndex - Entity array index.
     */
    protected _reindexEntitiesArray(startIndex: number): void;
    /**
     * Removes entities from layer.
     * @public
     * @param {Array.<Entity>} entities - Entity array.
     * @returns {Vector} - Returns this layer.
     */
    removeEntities(entities: Entity[]): this;
    /**
     * Clear the layer.
     * @public
     */
    clear(): void;
    /**
     * Safety entities loop.
     * @public
     * @param {(entity: Entity, index?: number) => void} callback - Entity callback.
     */
    each(callback: (entity: Entity, index?: number) => void): void;
    /**
     * Removes current entities from layer and adds new entities.
     * @public
     * @param {Array.<Entity>} entities - New entity array.
     * @returns {Vector} - Returns layer instance.
     */
    setEntities(entities: Entity[]): this;
    protected _createEntityCollectionsTree(entitiesForTree: Entity[]): void;
    /**
     * @todo (refactoring) could be used in something like bindEntityCollectionQuad(...)
     * @param entityCollection
     */
    _bindEventsDefault(entityCollection: EntityCollection): void;
    protected _collectStripCollectionPASS(outArr: EntityCollection[]): void;
    protected _collectPolylineCollectionPASS(outArr: EntityCollection[]): void;
    protected _collectGeoObjectCollectionPASS(outArr: EntityCollection[]): void;
    collectVisibleCollections(outArr: EntityCollection[]): void;
    /**
     * Start to load tile material.
     * @public
     * @virtual
     * @param {Material} material - Current material.
     */
    loadMaterial(material: Material): void;
    /**
     * Abort exact material loading.
     * @public
     * @override
     * @param {Material} material - Segment material.
     */
    abortMaterialLoading(material: Material): void;
    applyMaterial(material: Material, isForced?: boolean): NumberArray4;
    clearMaterial(material: Material): void;
    update(): void;
}
export { Vector };
