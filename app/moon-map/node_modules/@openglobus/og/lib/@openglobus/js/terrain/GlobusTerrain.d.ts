import { EventsHandler } from "../Events";
import { TypedArray } from "../utils/shared";
import { EmptyTerrain, IEmptyTerrainParams, UrlRewriteFunc } from "./EmptyTerrain";
import { Extent } from "../Extent";
import { Loader } from "../utils/Loader";
import { LonLat } from "../LonLat";
import { Segment } from "../segment/Segment";
export interface IGlobusTerrainParams extends IEmptyTerrainParams {
    subdomains?: string[];
    url?: string;
    extent?: Extent | [[number, number], [number, number]];
    urlRewrite?: UrlRewriteFunc;
    noDataValues?: number[];
    plainGridSize?: number;
    heightFactor?: number;
}
type TileData = {
    heights: number[] | TypedArray | null;
    extent: Extent | null;
};
/**
 * @deprecated
 * Use GlobusRgbTerrain
 * Class that loads segment elevation data, converts it to the array and passes it to the planet segment.
 * @class
 * @extends {GlobusTerrain}
 * @param {string} [name=""] - Terrain provider name.
 * @param {IGlobusTerrainParams} [options] - Provider options:
 * @param {number} [options.minZoom=3] - Minimal visible zoom index when terrain handler works.
 * @param {number} [options.minZoom=14] - Maximal visible zoom index when terrain handler works.
 * @param {number} [options.minNativeZoom=14] - Maximal available terrain zoom level.
 * @param {string} [options.url="//openglobus.org/heights/srtm3/{z}/{y}/{x}.ddm"] - Terrain source path url template. Default is openglobus ddm elevation file.
 * @param {Array.<number>} [options.gridSizeByZoom] - Array of segment triangulation grid sizes where array index agreed to the segment zoom index.
 * @param {number} [options.plainGridSize=32] - Elevation grid size. Default is 32x32. Must be power of two.
 * @param {string} [options.responseType="arraybuffer"] - Response type.
 * @param {number} [options.MAX_LOADING_TILES] - Maximum at one time loading tiles.
 * @param {Array.<number>} [gridSizeByZoom] - Array of values, where each value corresponds to the size of a tile(or segment) on the globe. Each value must be power of two.
 * @param {number} [heightFactor=1] - Elevation height multiplier.
 *
 * @fires GlobusTerrainEvents#load
 * @fires GlobusTerrainEvents#loadend
 */
declare class GlobusTerrain extends EmptyTerrain {
    events: GlobusTerrainEvents;
    protected _s: string[];
    protected _requestCount: number;
    protected _requestsPeerSubdomain: number;
    /**
     * Terrain source path url template.
     * @protected
     * @type {string}
     */
    protected url: string;
    protected _extent: Extent;
    protected _dataType: string;
    protected _elevationCache: Record<string, TileData>;
    protected _fetchCache: Record<string, Promise<any>>;
    protected _loader: Loader<GlobusTerrain>;
    /**
     * Rewrites elevation storage url query.
     * @protected
     * @type {Function} -
     */
    protected _urlRewriteCallback: UrlRewriteFunc | null;
    protected _heightFactor: number;
    constructor(name?: string, options?: IGlobusTerrainParams);
    get loader(): Loader<GlobusTerrain>;
    clearCache(): void;
    isBlur(segment: Segment): boolean;
    setElevationCache(tileIndex: string, tileData: TileData): void;
    getElevationCache(tileIndex: string): TileData | undefined;
    getHeightAsync(lonLat: LonLat, callback: (h: number) => void, zoom?: number, firstAttempt?: boolean): boolean;
    protected _getGroundHeightMerc(merc: LonLat, tileData: TileData): number;
    /**
     * Stop loading.
     * @public
     */
    abortLoading(): void;
    /**
     * Sets terrain data url template.
     * @public
     * @param {string} url - Url template.
     * @example <caption>Default openglobus url template:</caption>:
     * "http://earth3.openglobus.org/{z}/{y}/{x}.ddm"
     */
    setUrl(url: string): void;
    /**
     * Sets provider name.
     * @public
     * @param {string} name - Name.
     */
    setName(name: string): void;
    isReadyToLoad(segment: Segment): boolean;
    /**
     * Starts to load segment elevation data.
     * @public
     * @param {Segment} segment - Segment that wants a terrain data.
     * @param {boolean} [forceLoading] -
     */
    loadTerrain(segment: Segment, forceLoading?: boolean): void;
    protected _getSubdomain(): string;
    buildURL(x: number, y: number, z: number, tileGroup: number): string;
    /**
     * Creates default query url string.
     * @protected
     * @param {Segment} segment -
     * @returns {string} -
     */
    protected _createUrl(segment: Segment): string;
    /**
     * Returns actual url query string.
     * @protected
     * @param {Segment} segment - Segment that loads image data.
     * @returns {string} - Url string.
     */
    protected _getHTTPRequestString(segment: Segment): string;
    /**
     * Sets url rewrite callback, used for custom url rewriting for every tile loading.
     * @public
     * @param {UrlRewriteFunc} ur - The callback that returns tile custom created url.
     */
    setUrlRewriteCallback(ur: UrlRewriteFunc): void;
    /**
     * Converts loaded data to segment elevation data type(column major elevation data array in meters)
     * @public
     * @returns {Array.<number>} -
     */
    protected _createHeights(data: any, segment?: Segment | null, tileGroup?: number, x?: number, y?: number, z?: number, extent?: Extent, isMaxZoom?: boolean): TypedArray | number[];
    /**
     * @protected
     */
    protected _applyElevationsData(segment: Segment, elevations: number[] | TypedArray | null): void;
}
type GlobusTerrainEventsList = [
    "load",
    "loadend"
];
type GlobusTerrainEvents = EventsHandler<GlobusTerrainEventsList>;
export { GlobusTerrain };
