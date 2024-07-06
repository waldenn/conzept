import { TypedArray } from "../utils/shared";
import { Geoid } from "./Geoid";
import { LonLat } from "../LonLat";
import { Planet } from "../scene/Planet";
import { Segment } from "../segment/Segment";
export interface IEmptyTerrainParams {
    equalizeVertices?: boolean;
    name?: string;
    minZoom?: number;
    maxZoom?: number;
    maxNativeZoom?: number;
    geoidSrc?: string;
    geoid?: Geoid;
    gridSizeByZoom?: number[];
}
export type UrlRewriteFunc = (tileX: number, tileY: number, tileZoom: number, tileGroup: number) => string | null | undefined;
/**
 * Class represents terrain provider without elevation data.
 * @param {IEmptyTerrainParams} [options] - Provider options:
 * @param {string} [options.name="empty"] - Provider name.
 * @param {boolean} [options.equalizeVertices] -
 * @param {number} [options.minZoom=2] - Minimal visible zoom index when terrain handler works.
 * @param {number} [options.minZoom=50] - Maximal visible zoom index when terrain handler works.
 * @param {number} [options.maxNativeZoom=19] - Maximal available terrain zoom level.
 * @param {Array.<number>} [options.gridSizeByZoom] - Array of segment triangulation grid sizes where array index agreed to the segment zoom index.
 * @param {Array.<number>} [gridSizeByZoom] - Array of values, where each value corresponds to the size of a tile(or segment) on the globe. Each value must be power of two.
 * @param {Geoid} [options.geoid] -
 * @param {string} [options.geoidSrc] -
 */
declare class EmptyTerrain {
    static __counter__: number;
    /**
     * Uniq identifier.
     * @public
     * @type {number}
     */
    __id: number;
    equalizeVertices: boolean;
    equalizeNormals: boolean;
    isEmpty: boolean;
    /**
     * Provider name is "empty"
     * @public
     * @type {string}
     */
    name: string;
    /**
     * Minimal z-index value for segment elevation data handling.
     * @public
     * @type {number}
     */
    minZoom: number;
    /**
     * Maximal z-index value for segment elevation data handling.
     * @public
     * @type {number}
     */
    maxZoom: number;
    noDataValues: number[];
    /**
     * Maximal existent available zoom
     * @type {number}
     */
    maxNativeZoom: number;
    /**
     * @public
     * @type {Array.<number>}
     */
    gridSizeByZoom: number[];
    _maxNodeZoom: number;
    /**
     * Elevation grid size. Current is 2x2 is the smallest grid size.
     * @public
     * @type {number}
     */
    plainGridSize: number;
    /**
     * Planet scene.
     * @public
     * @type {Planet}
     */
    _planet: Planet | null;
    _geoid: Geoid;
    _isReady: boolean;
    constructor(options?: IEmptyTerrainParams);
    /**
     * Sets url rewrite callback, used for custom url rewriting for every tile loading.
     * @public
     * @param {UrlRewriteFunc} ur - The callback that returns tile custom created url.
     */
    setUrlRewriteCallback(ur: UrlRewriteFunc): void;
    get isIdle(): boolean;
    isEqual(obj: this): boolean;
    static checkNoDataValue(noDataValues: number[] | TypedArray, value: number): boolean;
    isBlur(segment?: Segment): boolean;
    set maxNodeZoom(val: number);
    get maxNodeZoom(): number;
    set geoid(geoid: Geoid);
    get geoid(): Geoid;
    getGeoid(): Geoid;
    /**
     * Loads or creates segment elevation data.
     * @public
     * @param {Segment} segment - Segment to create elevation data.
     */
    handleSegmentTerrain(segment: Segment): void;
    isReady(): boolean;
    abortLoading(): void;
    clearCache(): void;
    getHeightAsync(lonLat: LonLat, callback: (height: number) => void): boolean;
    loadTerrain(segment: Segment, forceLoading?: boolean): void;
}
export { EmptyTerrain };
