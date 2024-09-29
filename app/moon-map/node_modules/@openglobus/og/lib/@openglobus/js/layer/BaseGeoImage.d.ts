import { Extent } from "../Extent";
import { EventCallback, EventsHandler } from "../Events";
import { Layer, LayerEventsList, ILayerParams } from "./Layer";
import { LonLat } from "../LonLat";
import { Material } from "./Material";
import { NumberArray2 } from "../math/Vec2";
import { NumberArray4 } from "../math/Vec4";
import { Planet } from "../scene/Planet";
import { WebGLBufferExt, WebGLTextureExt } from "../webgl/Handler";
export interface IBaseGeoImageParams extends ILayerParams {
    fullExtent?: boolean;
    corners?: NumberArray2[];
}
type BaseGeoImageEventsList = [
    "loadend"
];
export type BaseGeoImageEventsType = EventsHandler<BaseGeoImageEventsList> & EventsHandler<LayerEventsList>;
/**
 * BaseGeoImage layer represents square imagery layer that
 * could be a static image, or animated video or webgl buffer
 * object displayed on the globe.
 * @class
 * @extends {Layer}
 */
declare class BaseGeoImage extends Layer {
    events: BaseGeoImageEventsType;
    protected _projType: number;
    protected _frameWidth: number;
    protected _frameHeight: number;
    protected _sourceReady: boolean;
    protected _sourceTexture: WebGLTextureExt | null;
    protected _materialTexture: WebGLTextureExt | null;
    protected _gridBufferLow: WebGLBufferExt | null;
    protected _gridBufferHigh: WebGLBufferExt | null;
    protected _extentWgs84ParamsHigh: Float32Array;
    protected _extentWgs84ParamsLow: Float32Array;
    protected _extentMercParamsHigh: Float32Array;
    protected _extentMercParamsLow: Float32Array;
    protected _refreshFrame: boolean;
    protected _frameCreated: boolean;
    protected _sourceCreated: boolean;
    _animate: boolean;
    protected _ready: boolean;
    _creationProceeding: boolean;
    _isRendering: boolean;
    protected _extentWgs84: Extent;
    protected _cornersWgs84: LonLat[];
    protected _cornersMerc: LonLat[];
    protected _isFullExtent: number;
    /**
     * rendering function pointer
     * @type {Function}
     */
    rendering: Function;
    protected _onLoadend_: EventCallback | null;
    constructor(name: string | null, options?: IBaseGeoImageParams);
    get isIdle(): boolean;
    addTo(planet: Planet): void;
    protected _onLoadend(): void;
    remove(): this;
    get instanceName(): string;
    /**
     * Gets corners coordinates.
     * @public
     * @return {Array.<LonLat>} - (exactly 4 entries)
     */
    getCornersLonLat(): LonLat[];
    /**
     * Gets corners coordinates.
     * @public
     * @return {Array.<Array<number>>} - (exactly 3 entries)
     */
    getCorners(): NumberArray2[];
    /**
     * Sets geoImage geographical corners coordinates.
     * @public
     * @param {Array.<Array.<number>>} corners - GeoImage corners coordinates. Where first coordinate (exactly 3 entries)
     * coincedents to the left top image corner, secont to the right top image corner, third to the right bottom
     * and fourth - left bottom image corner.
     */
    setCorners(corners: NumberArray2[]): void;
    /**
     * Sets geoImage geographical corners coordinates.
     * @public
     * @param {Array.<LonLat>} corners - GeoImage corners coordinates. Where first coordinate
     * coincedents to the left top image corner, secont to the right top image corner, third to the right bottom
     * and fourth - left bottom image corner. (exactly 4 entries)
     */
    setCornersLonLat(corners: LonLat[]): void;
    /**
     * Creates geoImage frame.
     * @protected
     */
    protected _createFrame(): void;
    /**
     * @public
     * @override
     * @param {Material} material - GeoImage material.
     */
    abortMaterialLoading(material: Material): void;
    /**
     * Clear layer material.
     * @public
     * @override
     */
    clear(): void;
    /**
     * Sets layer visibility.
     * @public
     * @override
     * @param {boolean} visibility - GeoImage visibility.
     */
    setVisibility(visibility: boolean): void;
    /**
     * @public
     * @param {Material} material - GeoImage material.
     */
    clearMaterial(material: Material): void;
    /**
     * @public
     * @override
     * @returns {Array<number>} -
     */
    applyMaterial(material: Material): NumberArray4;
    /**
     * Gets frame width size in pixels.
     * @public
     * @returns {Number} Frame width.
     */
    get getFrameWidth(): number;
    /**
     * Gets frame height size in pixels.
     * @public
     * @returns {Number} Frame height.
     */
    get getFrameHeight(): number;
    /**
     * Method depends on GeoImage instance
     * @protected
     */
    protected _createSourceTexture(): void;
    _renderingProjType1(): void;
    protected _renderingProjType0(): void;
}
export { BaseGeoImage };
