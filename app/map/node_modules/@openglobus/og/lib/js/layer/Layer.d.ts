import { EventsHandler } from "../Events";
import { Extent } from "../Extent";
import { Node } from "../quadTree/Node";
import { Material } from "./Material";
import { Planet } from "../scene/Planet";
import { Segment } from "../segment/Segment";
import { Vec3, NumberArray3 } from "../math/Vec3";
import { NumberArray4 } from "../math/Vec4";
import { IDefaultTextureParams } from "../webgl/Handler";
export interface ILayerParams {
    properties?: any;
    labelMaxLetters?: number;
    hideInLayerSwitcher?: boolean;
    opacity?: number;
    minZoom?: number;
    maxZoom?: number;
    attribution?: string;
    zIndex?: number;
    isBaseLayer?: boolean;
    defaultTextures?: [IDefaultTextureParams, IDefaultTextureParams];
    visibility?: boolean;
    fading?: boolean;
    height?: number;
    textureFilter?: string;
    isSRGB?: boolean;
    pickingEnabled?: boolean;
    preLoadZoomLevels?: number[];
    extent?: Extent | [[number, number], [number, number]];
    ambient?: string | NumberArray3 | Vec3;
    diffuse?: string | NumberArray3 | Vec3;
    specular?: string | NumberArray3 | Vec3;
    shininess?: number;
    nightTextureCoefficient?: number;
    iconSrc?: string | null;
}
/**
 * @class
 * Base class; normally only used for creating subclasses and not instantiated in apps.
 * A visual representation of raster or vector map data well known as a layer.
 * @class
 * @param {String} [name="noname"] - Layer name.
 * @param {Object} [options] - Layer options:
 * @param {number} [options.opacity=1.0] - Layer opacity.
 * @param {number} [options.minZoom=0] - Minimal visibility zoom level.
 * @param {number} [options.maxZoom=0] - Maximal visibility zoom level.
 * @param {string} [options.attribution] - Layer attribution that displayed in the attribution area on the screen.
 * @param {boolean} [options.isBaseLayer=false] - This is a base layer.
 * @param {boolean} [options.visibility=true] - Layer visibility.
 * @param {boolean} [options.hideInLayerSwitcher=false] - Presence of layer in dialog window of LayerSwitcher control.
 * @param {boolean} [options.isSRGB=false] - Layer image webgl internal format.
 * @param {Extent} [options.extent=[[-180.0, -90.0], [180.0, 90.0]]] - Visible extent.
 * @param {string} [options.textureFilter="anisotropic"] - Image texture filter. Available values: "nearest", "linear", "mipmap" and "anisotropic".
 * @param {string} [options.icon] - Icon for LayerSwitcher
 * @fires EventsHandler<LayerEventsList>#visibilitychange
 * @fires EventsHandler<LayerEventsList>#add
 * @fires EventsHandler<LayerEventsList>#remove
 * @fires EventsHandler<LayerEventsList>#mousemove
 * @fires EventsHandler<LayerEventsList>#mouseenter
 * @fires EventsHandler<LayerEventsList>#mouseleave
 * @fires EventsHandler<LayerEventsList>#lclick
 * @fires EventsHandler<LayerEventsList>#rclick
 * @fires EventsHandler<LayerEventsList>#mclick
 * @fires EventsHandler<LayerEventsList>#ldblclick
 * @fires EventsHandler<LayerEventsList>#rdblclick
 * @fires EventsHandler<LayerEventsList>#mdblclick
 * @fires EventsHandler<LayerEventsList>#lup
 * @fires EventsHandler<LayerEventsList>#rup
 * @fires EventsHandler<LayerEventsList>#mup
 * @fires EventsHandler<LayerEventsList>#ldown
 * @fires EventsHandler<LayerEventsList>#rdown
 * @fires EventsHandler<LayerEventsList>#mdown
 * @fires EventsHandler<LayerEventsList>#lhold
 * @fires EventsHandler<LayerEventsList>#rhold
 * @fires EventsHandler<LayerEventsList>#mhold
 * @fires EventsHandler<LayerEventsList>#mousewheel
 * @fires EventsHandler<LayerEventsList>#touchmove
 * @fires EventsHandler<LayerEventsList>#touchstart
 * @fires EventsHandler<LayerEventsList>#touchend
 * @fires EventsHandler<LayerEventsList>#doubletouch
 */
declare class Layer {
    static __counter__: number;
    /**
     * Uniq identifier.
     * @public
     * @type {number}
     */
    __id: number;
    /**
     * Events handler.
     * @public
     * @type {Events}
     */
    events: EventsHandler<LayerEventsList>;
    /**
     * Layer user name.
     * @public
     * @type {string}
     */
    name: string;
    properties: any;
    hideInLayerSwitcher: boolean;
    /**
     * Minimal zoom level when layer is visible.
     * @public
     * @type {number}
     */
    minZoom: number;
    /**
     * Maximal zoom level when layer is visible.
     * @public
     * @type {number}
     */
    maxZoom: number;
    /**
     * Planet node.
     * @public
     * @type {Planet}
     */
    _planet: Planet | null;
    createTexture: Function | null;
    nightTextureCoefficient: number;
    protected _hasImageryTiles: boolean;
    /**
     * Layer global opacity.
     * @public
     * @type {number}
     */
    protected _opacity: number;
    /**
     * Layer attribution.
     * @protected
     * @type {string}
     */
    protected _attribution: string;
    /**
     * Layer z-index.
     * @protected
     * @type {number}
     */
    protected _zIndex: number;
    /**
     * Base layer type flag.
     * @protected
     * @type {boolean}
     */
    protected _isBaseLayer: boolean;
    _defaultTextures: [IDefaultTextureParams | null, IDefaultTextureParams | null];
    /**
     * Layer visibility.
     * @protected
     * @type {boolean}
     */
    protected _visibility: boolean;
    _fading: boolean;
    protected _fadingFactor: number;
    _fadingOpacity: number;
    /**
     * Height over the ground.
     * @public
     * @type {number}
     */
    _height: number;
    protected _textureFilter: string;
    protected _isSRGB: boolean;
    _internalFormat: number | null;
    /**
     * Visible degrees extent.
     * @public
     * @type {Extent}
     */
    _extent: Extent;
    /**
     * Visible mercator extent.
     * @public
     * @type {Extent}
     */
    _extentMerc: Extent;
    /**
     * Layer picking color. Assign when added to the planet.
     * @public
     * @type {Vec3}
     */
    _pickingColor: Vec3;
    _pickingEnabled: boolean;
    protected _isPreloadDone: boolean;
    protected _preLoadZoomLevels: number[];
    _ambient: Float32Array | null;
    _diffuse: Float32Array | null;
    _specular: Float32Array | null;
    isVector: boolean;
    protected _iconSrc: string | null;
    constructor(name?: string | null, options?: ILayerParams);
    get iconSrc(): string | null;
    set iconSrc(src: string | null);
    set diffuse(rgb: string | NumberArray3 | Vec3 | null | undefined);
    set ambient(rgb: string | NumberArray3 | Vec3 | null | undefined);
    set specular(rgb: string | NumberArray3 | Vec3 | null | undefined);
    set shininess(v: number);
    static getTMS(x: number, y: number, z: number): {
        x: number;
        y: number;
        z: number;
    };
    static getTileIndex(x: number, y: number, z: number, tileGroup: number): string;
    get instanceName(): string;
    get rendererEvents(): EventsHandler<LayerEventsList>;
    set opacity(opacity: number);
    set pickingEnabled(picking: boolean);
    get pickingEnabled(): boolean;
    /**
     * Returns true if a layer has imagery tiles.
     * @public
     * @virtual
     * @returns {boolean} - Imagery tiles flag.
     */
    hasImageryTiles(): boolean;
    /**
     * Gets layer identifier.
     * @public
     * @returns {string} - Layer object id.
     */
    getID(): number;
    get id(): number;
    /**
     * @todo: remove after all
     */
    get _id(): number;
    /**
     * Compares layers instances.
     * @public
     * @param {Layer} layer - Layer instance to compare.
     * @returns {boolean} - Returns true if the layers is the same instance of the input.
     */
    isEqual(layer: Layer): boolean;
    /**
     * Assign the planet.
     * @protected
     * @virtual
     * @param {Planet} planet - Planet render node.
     */
    _assignPlanet(planet: Planet): void;
    get isIdle(): boolean;
    /**
     * Assign picking color to the layer.
     * @protected
     * @virtual
     */
    protected _bindPicking(): void;
    /**
     * Adds layer to the planet.
     * @public
     * @param {Planet} planet - Adds layer to the planet.
     */
    addTo(planet: Planet): void;
    /**
     * Removes from planet.
     * @public
     * @returns {Layer} -This layer.
     */
    remove(): this;
    /**
     * Clears layer material.
     * @virtual
     */
    clear(): void;
    /**
     * Returns planet instance.
     */
    get planet(): Planet | null;
    /**
     * Sets layer attribution text.
     * @public
     * @param {string} html - HTML code that represents layer attribution, it could be just a text.
     */
    setAttribution(html: string): void;
    /**
     * Gets layer attribution.
     * @public
     * @returns {string} Layer attribution
     */
    getAttribution(): string;
    /**
     * Sets height over the ground.
     * @public
     * @param {number} height - Layer height.
     */
    setHeight(height: number): void;
    /**
     * Gets layer height.
     * @public
     * @returns {number} -
     */
    getHeight(): number;
    /**
     * Sets z-index.
     * @public
     * @param {number} zIndex - Layer z-index.
     */
    setZIndex(zIndex: number): void;
    /**
     * Gets z-index.
     * @public
     * @returns {number} -
     */
    getZIndex(): number;
    /**
     * Set zIndex to the maximal value depend on other layers on the planet.
     * @public
     */
    bringToFront(): void;
    /**
     * Returns true if the layer is a base.
     * @public
     * @returns {boolean} - Base layer flag.
     */
    isBaseLayer(): boolean;
    /**
     * Sets base layer type true.
     * @public
     * @param {boolean} isBaseLayer -
     */
    setBaseLayer(isBaseLayer: boolean): void;
    /**
     * Sets layer visibility.
     * @public
     * @virtual
     * @param {boolean} visibility - Layer visibility.
     */
    setVisibility(visibility: boolean): void;
    protected _forceMaterialApply(segment: Segment): void;
    clearMaterial(material: Material): void;
    loadMaterial(material: Material, forceLoading?: boolean): void;
    applyMaterial(m: Material, isForced?: boolean): NumberArray4;
    protected _preLoadRecursive(node: Node, maxZoom: number): void;
    protected _preLoad(): void;
    /**
     * Gets layer visibility.
     * @public
     * @returns {boolean} - Layer visibility.
     */
    getVisibility(): boolean;
    /**
     * Sets visible geographical extent.
     * @public
     * @param {Extent} extent - Layer visible geographical extent.
     */
    setExtent(extent: Extent): void;
    /**
     * Gets layer extent.
     * @public
     * @return {Extent} - Layer geodetic extent.
     */
    getExtent(): Extent;
    /**
     * Gets layer web-mercator extent.
     * @public
     * @return {Extent} - Layer extent.
     */
    getExtentMerc(): Extent;
    /**
     * Fly extent.
     * @public
     */
    flyExtent(): void;
    /**
     * View extent.
     * @public
     */
    viewExtent(): void;
    /**
     * Special correction of the whole globe extent.
     * @protected
     */
    protected _correctFullExtent(): void;
    get opacity(): number;
    get screenOpacity(): number;
    _refreshFadingOpacity(): boolean;
    createMaterial(segment: Segment): Material;
    redraw(): void;
    abortMaterialLoading(material: Material): void;
    abortLoading(): void;
}
export type LayerEventsList = [
    "visibilitychange",
    "add",
    "remove",
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
export declare const LAYER_EVENTS: LayerEventsList;
export { Layer };
