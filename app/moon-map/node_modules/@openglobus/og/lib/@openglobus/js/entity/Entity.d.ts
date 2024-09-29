import { Billboard, IBillboardParams } from "./Billboard";
import { EntityCollection, EntityCollectionEvents } from "./EntityCollection";
import { Extent } from "../Extent";
import { Geometry, IGeometryParams } from "./Geometry";
import { GeoObject, IGeoObjectParams } from "./GeoObject";
import { LonLat } from "../LonLat";
import { Label, ILabelParams } from "./Label";
import { NumberArray3, Vec3 } from "../math/Vec3";
import { NumberArray2 } from "../math/Vec2";
import { IPointCloudParams, PointCloud } from "./PointCloud";
import { IPolylineParams, Polyline } from "./Polyline";
import { IRayParams, Ray } from "./Ray";
import { Strip, IStripParams } from "./Strip";
import { Vector, VectorEventsType } from "../layer/Vector";
import { EntityCollectionNode } from "../quadTree/EntityCollectionNode";
export interface IEntityParams {
    name?: string;
    properties?: any;
    cartesian?: Vec3 | NumberArray3;
    lonlat?: LonLat | NumberArray3 | NumberArray2;
    altitude?: number;
    visibility?: boolean;
    billboard?: Billboard | IBillboardParams;
    label?: Label | ILabelParams;
    polyline?: Polyline | IPolylineParams;
    ray?: Ray | IRayParams;
    pointCloud?: PointCloud | IPointCloudParams;
    geometry?: Geometry | IGeometryParams;
    geoObject?: GeoObject | IGeoObjectParams;
    strip?: Strip | IStripParams;
    independentPicking?: boolean;
}
/**
 * Entity instances aggregate multiple forms of visualization into a single high-level object.
 * They can be created manually and added to entity collection.
 *
 * @class
 * @param {Object} [options] - Entity options:
 * @param {string} [options.name] - A human-readable name to display to users. It does not have to be unique.
 * @param {Vec3|Array.<number>} [options.cartesian] - Spatial entities like billboard, label etc. cartesian position.
 * @param {LonLat} [options.lonlat] - Geodetic coordinates for an entities like billboard, label etc.
 * @param {boolean} [options.aground] - True for entities that have to be placed on the relief.
 * @param {boolean} [options.visibility] - Entity visibility.
 * @param {*} [options.billboard] - Billboard options(see {@link Billboard}).
 * @param {*} [options.label] - Label options(see {@link Label}).
 * @param {*} [options.polyline] - Polyline options(see {@link Polyline}).
 * @param {*} [options.ray] - Ray options(see {@link Ray}).
 * @param {*} [options.pointCloud] - Point cloud options(see {@link PointCloud}).
 * @param {*} [options.geometry] - Geometry options (see {@link Geometry}), available for vector layer only.
 * @param {*} [options.properties] - Entity custom properties.
 */
declare class Entity {
    static __counter__: number;
    /**
     * Uniq identifier.
     * @public
     * @readonly
     */
    protected __id: number;
    /**
     * Entity user defined properties.
     * @public
     * @type {Object}
     */
    properties: any;
    /**
     * Children entities.
     * @public
     * @type {Array.<Entity>}
     */
    childrenNodes: Entity[];
    /**
     * Parent entity.
     * @public
     * @type {Entity}
     */
    parent: Entity | null;
    /**
     * Entity cartesian position.
     * @protected
     * @type {Vec3}
     */
    _cartesian: Vec3;
    /**
     * Geodetic entity coordinates.
     * @public
     * @type {LonLat}
     */
    _lonLat: LonLat;
    /**
     * World Mercator entity coordinates.
     * @public
     * @type {LonLat}
     */
    _lonLatMerc: LonLat;
    /**
     * Entity visible terrain altitude.
     * @public
     * @type {number}
     */
    _altitude: number;
    /**
     * Visibility flag.
     * @protected
     * @type {boolean}
     */
    protected _visibility: boolean;
    /**
     * Entity collection that this entity belongs to.
     * @public
     * @type {EntityCollection}
     */
    _entityCollection: EntityCollection | null;
    /**
     * Entity collection array store index.
     * @public
     * @type {number}
     */
    _entityCollectionIndex: number;
    /**
     * Assigned vector layer pointer.
     * @public
     * @type {Vector}
     */
    _layer: Vector | null;
    /**
     * Assigned vector layer entity array index.
     * @public
     * @type {number}
     */
    _layerIndex: number;
    /**
     * Picking color.
     * @public
     * @type {Vec3}
     */
    _pickingColor: Vec3;
    _independentPicking: boolean;
    protected _featureConstructorArray: Record<string, [any, Function]>;
    /**
     * Billboard entity.
     * @public
     * @type {Billboard | null}
     */
    billboard: Billboard | null;
    /**
     * Text label entity.
     * @public
     * @type {Label | null}
     */
    label: Label | null;
    /**
     * Polyline entity.
     * @public
     * @type {Polyline | null}
     */
    polyline: Polyline | null;
    /**
     * Ray entity.
     * @public
     * @type {Ray | null}
     */
    ray: Ray | null;
    /**
     * PointCloud entity.
     * @public
     * @type {PointCloud | null}
     */
    pointCloud: PointCloud | null;
    /**
     * Geometry entity(available for vector layer only).
     * @public
     * @type {Geometry | null}
     */
    geometry: Geometry | null;
    /**
     * Geo object entity
     * @public
     * @type {Geometry | null}
     */
    geoObject: GeoObject | null;
    /**
     * Strip entity.
     * @public
     * @type {Strip | null}
     */
    strip: Strip | null;
    _nodePtr?: EntityCollectionNode;
    constructor(options?: IEntityParams);
    get id(): number;
    isEqual(entity: Entity): boolean;
    get layerIndex(): number;
    get instanceName(): string;
    protected _createOptionFeature<T, K>(featureName: string, options?: T | K): T | null;
    getCollectionIndex(): number;
    /**
     * Adds current entity into the specified entity collection.
     * @public
     * @param {EntityCollection | Vector} collection - Specified entity collection or vector layer.
     * @param {Boolean} [rightNow=false] - Entity insertion option for vector layer.
     * @returns {Entity} - This object.
     */
    addTo(collection: EntityCollection | Vector, rightNow?: boolean): this;
    /**
     * Removes current entity from collection and layer.
     * @public
     */
    remove(): void;
    /**
     * Sets the entity visibility.
     * @public
     * @param {boolean} visibility - Entity visibility.
     */
    setVisibility(visibility: boolean): void;
    /**
     * Returns entity visibility.
     * @public
     * @returns {boolean} -
     */
    getVisibility(): boolean;
    /**
     * Sets entity cartesian position.
     * @public
     * @param {Vec3} cartesian - Cartesian position in 3d space.
     */
    setCartesian3v(cartesian: Vec3): void;
    /**
     * Sets entity cartesian position.
     * @public
     * @param {number} x - 3d space X - position.
     * @param {number} y - 3d space Y - position.
     * @param {number} z - 3d space Z - position.
     */
    setCartesian(x?: number, y?: number, z?: number): void;
    /**
     * Sets entity cartesian position without event dispatching.
     * @public
     * @param {Vec3} cartesian - Cartesian position in 3d space.
     * @param {boolean} skipLonLat - skip geodetic calculation.
     */
    _setCartesian3vSilent(cartesian: Vec3, skipLonLat?: boolean): void;
    /**
     * Gets entity geodetic coordinates.
     * @public
     * @returns {LonLat} -
     */
    getLonLat(): LonLat;
    /**
     * Sets geodetic coordinates of the entity point object.
     * @public
     * @param {LonLat} lonlat - WGS84 coordinates.
     */
    setLonLat(lonlat: LonLat): void;
    /**
     * Sets geodetic coordinates of the entity point object.
     * @public
     * @param {number} lon - Longitude.
     * @param {number} lat - Latitude
     * @param {number} [height] - Height
     */
    setLonLat2(lon: number, lat: number, height?: number): void;
    /**
     * Sets entity altitude over the planet.
     * @public
     * @param {number} altitude - Altitude.
     */
    setAltitude(altitude: number): void;
    /**
     * Sets entity altitude over the planet.
     * @public
     * @return {number} Altitude.
     */
    getAltitude(): number;
    /**
     * Returns cartesian position.
     * @public
     * @returns {Vec3} -
     */
    getCartesian(): Vec3;
    /**
     * Sets entity billboard.
     * @public
     * @param {Billboard} billboard - Billboard object.
     * @returns {Billboard} -
     */
    setBillboard(billboard: Billboard): Billboard;
    /**
     * Sets entity label.
     * @public
     * @param {Label} label - Text label.
     * @returns {Label} -
     */
    setLabel(label: Label): Label;
    /**
     * Sets entity ray.
     * @public
     * @param {Ray} ray - Ray object.
     * @returns {Ray} -
     */
    setRay(ray: Ray): Ray;
    /**
     * Sets entity polyline.
     * @public
     * @param {Polyline} polyline - Polyline object.
     * @returns {Polyline} -
     */
    setPolyline(polyline: Polyline): Polyline;
    /**
     * Sets entity pointCloud.
     * @public
     * @param {PointCloud} pointCloud - PointCloud object.
     * @returns {PointCloud} -
     */
    setPointCloud(pointCloud: PointCloud): PointCloud;
    /**
     * Sets entity geometry.
     * @public
     * @param {Geometry} geometry - Geometry object.
     * @returns {Geometry} -
     */
    setGeometry(geometry: Geometry): Geometry;
    /**
     * Sets entity geoObject.
     * @public
     * @param {GeoObject} geoObject - GeoObject.
     * @returns {GeoObject} -
     */
    setGeoObject(geoObject: GeoObject): GeoObject;
    /**
     * Sets entity strip.
     * @public
     * @param {Strip} strip - Strip object.
     * @returns {Strip} -
     */
    setStrip(strip: Strip): Strip;
    get layer(): Vector | null;
    get rendererEvents(): VectorEventsType | EntityCollectionEvents | null;
    /**
     * Append child entity.
     * @public
     * @param {Entity} entity - Child entity.
     */
    appendChild(entity: Entity): void;
    /**
     * Appends entity items(billboard, label etc.) picking color.
     * @public
     */
    setPickingColor(): void;
    /**
     * Return geodetic extent.
     * @public
     * @returns {Extent} -
     */
    getExtent(): Extent;
}
export { Entity };
