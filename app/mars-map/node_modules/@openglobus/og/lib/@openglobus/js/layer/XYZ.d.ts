import { Layer, ILayerParams, LayerEventsList } from "./Layer";
import { Segment } from "../segment/Segment";
import { EventsHandler } from "../Events";
import { Material } from "./Material";
import { NumberArray4 } from "../math/Vec4";
export interface IXYZParams extends ILayerParams {
    url?: string;
    subdomains?: string[];
    minNativeZoom?: number;
    maxNativeZoom?: number;
    urlRewrite?: Function;
}
type XYZEventsList = [
    "load",
    "loadend"
];
type XYZEventsType = EventsHandler<XYZEventsList> & EventsHandler<LayerEventsList>;
/**
 * Represents an imagery tiles source provider.
 * @class
 * @extends {Layer}
 * @param {string} name - Layer name.
 * @param {IXYZParams} options:
 * @param {number} [options.opacity=1.0] - Layer opacity.
 * @param {Array.<string>} [options.subdomains=['a','b','c']] - Subdomains of the tile service.
 * @param {number} [options.minZoom=0] - Minimal visibility zoom level.
 * @param {number} [options.maxZoom=0] - Maximal visibility zoom level.
 * @param {number} [options.minNativeZoom=0] - Minimal available zoom level.
 * @param {number} [options.maxNativeZoom=19] - Maximal available zoom level.
 * @param {string} [options.attribution] - Layer attribution that displayed in the attribution area on the screen.
 * @param {boolean} [options.isBaseLayer=false] - Base layer flag.
 * @param {boolean} [options.visibility=true] - Layer visibility.
 * @param {string} [options.crossOrigin=true] - If true, all tiles will have their crossOrigin attribute set to ''.
 * @param {string} options.url - Tile url source template(see example below).
 * @param {string} options.textureFilter - texture gl filter. NEAREST, LINEAR, MIPMAP, ANISOTROPIC.
 * @param {Function} options.urlRewrite - Url rewrite function.
 *
 * @fires EventsHandler<XYZEventsList>#load
 * @fires EventsHandler<XYZEventsList>#loadend
 *
 * @example <caption>Creates OpenStreetMap base tile layer</caption>
 * new og.layer.XYZ("OpenStreetMap", {
 *     isBaseLayer: true,
 *     url: "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
 *     visibility: true,
 *     attribution: 'Data @ <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="http://www.openstreetmap.org/copyright">ODbL</a>'
 * });
 */
export declare class XYZ extends Layer {
    events: XYZEventsType;
    /**
     * Tile url source template.
     * @public
     * @type {string}
     */
    url: string;
    /**
     * @protected
     */
    protected _s: string[];
    /**
     * Minimal native zoom level when tiles are available.
     * @public
     * @type {number}
     */
    minNativeZoom: number;
    /**
     * Maximal native zoom level when tiles are available.
     * @public
     * @type {number}
     */
    maxNativeZoom: number;
    /**
     * Rewrites imagery tile url query.
     * @private
     * @param {Segment} segment - Segment to load.
     * @param {string} url - Created url.
     * @returns {string} - Url query string.
     */
    protected _urlRewriteCallback: Function | null;
    protected _requestsPeerSubdomains: number;
    protected _requestCount: number;
    constructor(name: string | null, options?: IXYZParams);
    /**
     * @warning Use XYZ.isIdle in requestAnimationFrame(after setVisibility)
     */
    get isIdle(): boolean;
    get instanceName(): string;
    /**
     * Abort loading tiles.
     * @public
     */
    abortLoading(): void;
    /**
     * Sets layer visibility.
     * @public
     * @param {boolean} visibility - Layer visibility.
     */
    setVisibility(visibility: boolean): void;
    remove(): this;
    /**
     * Sets imagery tiles url source template.
     * @public
     * @param {string} url - Url template.
     * @example
     * http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
     * where {z}, {x} and {y} - replaces by current tile values, {s} - random domain.
     */
    setUrl(url: string): void;
    _checkSegment(segment: Segment): boolean;
    /**
     * Start to load tile material.
     * @public
     * @virtual
     * @param {Material} material - Loads current material.
     * @param {boolean} [forceLoading=false] -
     */
    loadMaterial(material: Material, forceLoading?: boolean): void;
    /**
     * Creates query url.
     * @protected
     * @virtual
     * @param {Segment} segment - Creates specific url for current segment.
     * @returns {string} - Returns url string.
     */
    protected _createUrl(segment: Segment): string;
    protected _getSubdomain(): string;
    /**
     * Returns actual url query string.
     * @protected
     * @param {Segment} segment - Segment that loads image data.
     * @returns {string} - Url string.
     */
    protected _getHTTPRequestString(segment: Segment): any;
    /**
     * Sets url rewrite callback, used for custom url rewriting for every tile loading.
     * @public
     * @param {Function} ur - The callback that returns tile custom created url.
     */
    setUrlRewriteCallback(ur: Function): void;
    applyMaterial(material: Material, forceLoading?: boolean): NumberArray4;
    clearMaterial(material: Material): void;
    /**
     * @protected
     */
    protected _correctFullExtent(): void;
}
export {};
