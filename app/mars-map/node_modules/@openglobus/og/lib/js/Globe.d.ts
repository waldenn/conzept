import { Control } from "./control/Control";
import { Ellipsoid } from "./ellipsoid/Ellipsoid";
import { EmptyTerrain } from "./terrain/EmptyTerrain";
import { Layer } from "./layer/Layer";
import { NumberArray2 } from "./math/Vec2";
import { NumberArray4 } from "./math/Vec4";
import { Planet } from "./scene/Planet";
import { Sun } from "./control/Sun";
import { HTMLDivElementExt, Renderer } from "./renderer/Renderer";
import { RenderNode } from "./scene/RenderNode";
import { Extent } from "./Extent";
import { IAtmosphereParams } from "./control/Atmosphere";
export interface IGlobeParams {
    attributionContainer?: HTMLElement;
    target?: string | HTMLElement;
    skybox?: RenderNode;
    dpi?: number;
    msaa?: number;
    name?: string;
    frustums?: NumberArray2[];
    ellipsoid?: Ellipsoid;
    maxGridSize?: number;
    nightTextureSrc?: string | null;
    specularTextureSrc?: string | null;
    minAltitude?: number;
    maxAltitude?: number;
    maxEqualZoomAltitude?: number;
    minEqualZoomAltitude?: number;
    minEqualZoomCameraSlope?: number;
    quadTreeStrategyPrototype?: any;
    maxLoadingRequests?: number;
    atmosphereEnabled?: boolean;
    transitionOpacityEnabled?: boolean;
    terrain?: EmptyTerrain;
    controls?: Control[];
    useEarthNavigation?: boolean;
    minSlope?: number;
    sun?: {
        active?: boolean;
        stopped?: boolean;
    };
    layers?: Layer[];
    viewExtent?: Extent | NumberArray4;
    autoActivate?: boolean;
    fontsSrc?: string;
    resourcesSrc?: string;
    atmosphereParameters?: IAtmosphereParams;
    gamma?: number;
    exposure?: number;
}
/**
 * Creates a WebGL context with globe.
 * @class
 *
 * @example <caption>Basic initialization</caption>
 * globus = new Globe({
 *     'atmosphere': false,
 *     'target': 'globus',
 *     'name': 'Earth',
 *     'controls': [
 *          new control.MouseNavigation({ autoActivate: true }),
 *          new control.KeyboardNavigation({ autoActivate: true }),
 *          new control.EarthCoordinates({ autoActivate: true, center: false }),
 *          new control.LayerSwitcher({ autoActivate: true }),
 *          new control.ZoomControl({ autoActivate: true }),
 *          new control.TouchNavigation({ autoActivate: true }),
 *          new control.Sun({ autoActivate: true })
 *      ],
 *     'terrain': new GlobusTerrain(),
 *     'layers': [
 *          new XYZ("OpenStreetMap", { isBaseLayer: true, url: "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png", visibility: true, attribution: 'Data @ <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="http://www.openstreetmap.org/copyright">ODbL</a>' })
 *      ],
 *     'autoActivate': true
 * });
 *
 * @param {IGlobeParams} options - Options:
 * @param {string|HTMLElement} options.target - HTML element id where planet canvas have to be created.
 * @param {string} [options.name] - Planet name. Default is uniq identifier.
 * @param {EmptyTerrain} [options.terrain] - Terrain provider. Default no terrain - og.terrain.EmptyTerrain.
 * @param {Array.<Control>} [options.controls] - Renderer controls array.
 * @param {Array.<Layer>} [options.layers] - Planet layers.
 * @param {Extent| [[number, number],[number, number]]} [options.viewExtent] - Viewable starting extent.
 * @param {boolean} [options.autoActivate=true] - Globe rendering auto activation flag. True is default.
 * @param {HTMLElement} [options.attributionContainer] - Container for attribution list.
 * @param {number} [options.maxGridSize=128] = Maximal segment grid size. 128 is default
 * @param {string} [options.fontsSrc] -  Fonts collection url.
 * @param {string} [options.resourcesSrc] - Resources root src.
 * @param {string} [options.nightTextureSrc] - Night glowing image sources
 * @param {string} [options.specularTextureSrc] - Specular water mask image sourcr
 * @param {number} [options.maxAltitude=15000000.0] - Maximal camera altitude above terrain
 * @param {number} [options.minAltitude=1.0] - Minimal camera altitude above terrain
 * @param {number} [options.maxEqualZoomAltitude=15000000.0] - Maximal altitude since segments on the screen became the same zoom level
 * @param {number} [options.minEqualZoomAltitude=10000.0] - Minimal altitude since segments on the screen became the same zoom level
 * @param {number} [options.minEqualZoomCameraSlope=0.8] - Minimal camera slope above te globe where segments on the screen became the same zoom level
 * @param {number} [options.loadingBatchSize=12] -
 * @param {number} [options.quadTreeStrategyPrototype] - Prototype of quadTree. QuadTreeStrategy for Earth is default.
 * @param {number} [options.msaa=0] - MSAA antialiasing parameter: 2,4,8,16. Default is 0.
 * @param {number} [options.dpi] - Device pixel ratio. Default is current screen DPI.
 * @param {boolean} [options.atmosphereEnabled] - Enables atmosphere effect.
 * @param {boolean} [options.transtitionOpacityEnabled] - Enables terrain smooth opacity transition effect.
 * @param {IAtmosphereParams} [options.atmosphereParameters] - Atmosphere model parameters.
 * @param {number} [options.gamma] - Gamma
 * @param {number} [options.exposure] - Exposure
 */
declare class Globe {
    static __counter__: number;
    $target: HTMLElement | null;
    protected _instanceID: string;
    protected _canvas: HTMLCanvasElement;
    $inner: HTMLDivElementExt;
    /**
     * Interface for the renderer context(events, input states, renderer nodes etc.)
     * @public
     * @type {Renderer}
     */
    renderer: Renderer;
    /**
     * Planet node name. Access with this.renderer.<name>
     * @private
     * @type {String}
     */
    protected _planetName: string;
    planet: Planet;
    sun: Sun;
    constructor(options: IGlobeParams);
    start(): void;
    /**
     * Starts screen brightness fading in effect by the duration time.
     * @public
     */
    fadeIn(): void;
    /**
     * Starts screen brightness fading out effect by the duration time.
     * @public
     */
    fadeOut(): void;
    attachTo(target: HTMLElement | string, isFirst?: boolean): void;
    detach(): void;
    destroy(): void;
}
export { Globe };
