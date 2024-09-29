import { Atmosphere, IAtmosphereParams } from "../control/Atmosphere";
import { Control } from "../control/Control";
import { EventsHandler } from "../Events";
import { EmptyTerrain } from "../terrain/EmptyTerrain";
import { Extent } from "../Extent";
import { Entity } from "../entity/Entity";
import { Ellipsoid } from "../ellipsoid/Ellipsoid";
import { EntityCollection } from "../entity/EntityCollection";
import { GeoImageCreator } from "../utils/GeoImageCreator";
import { IBaseInputState } from "../renderer/RendererEvents";
import { Key, Lock } from "../Lock";
import { Layer } from "../layer/Layer";
import { Loader } from "../utils/Loader";
import { LonLat } from "../LonLat";
import { Node } from "../quadTree/Node";
import { NormalMapCreator } from "../utils/NormalMapCreator";
import { PlainSegmentWorker } from "../utils/PlainSegmentWorker";
import { PlanetCamera } from "../camera/PlanetCamera";
import { Quat } from "../math/Quat";
import { QuadTreeStrategy } from "../quadTree/QuadTreeStrategy";
import { Ray } from "../math/Ray";
import { RenderNode } from "./RenderNode";
import { TerrainWorker } from "../utils/TerrainWorker";
import { Vec2, Vec3, NumberArray2, NumberArray3, NumberArray4 } from "../math/index";
import { VectorTileCreator } from "../utils/VectorTileCreator";
import { WebGLBufferExt, WebGLTextureExt, IDefaultTextureParams } from "../webgl/Handler";
import { Program } from "../webgl/Program";
import { Segment } from "../segment/Segment";
import { AtmosphereParameters } from "../shaders/atmos";
export interface IPlanetParams {
    name?: string;
    ellipsoid?: Ellipsoid;
    minAltitude?: number;
    maxAltitude?: number;
    frustums?: NumberArray2[];
    maxEqualZoomAltitude?: number;
    minEqualZoomAltitude?: number;
    minEqualZoomCameraSlope?: number;
    quadTreeStrategyPrototype?: typeof QuadTreeStrategy;
    ambient?: string | NumberArray3 | Vec3;
    diffuse?: string | NumberArray3 | Vec3;
    specular?: string | NumberArray3 | Vec3;
    shininess?: number;
    nightTextureSrc?: string | null;
    specularTextureSrc?: string | null;
    maxGridSize?: number;
    maxLoadingRequests?: number;
    atmosphereEnabled?: boolean;
    transitionOpacityEnabled?: boolean;
    atmosphereParameters?: IAtmosphereParams;
}
export type PlanetEventsList = [
    "draw",
    "layeradd",
    "baselayerchange",
    "layerremove",
    "layervisibilitychange",
    "rendercompleted",
    "terraincompleted",
    "layerloadend"
];
type IndexBufferCacheData = {
    buffer: WebGLBufferExt | null;
};
/**
 * Main class for rendering planet
 * @class
 * @extends {RenderNode}
 * @param {string} [options.name="Earth"] - Planet name(Earth by default)
 * @param {Ellipsoid} [options.ellipsoid] - Planet ellipsoid(WGS84 by default)
 * @param {Number} [options.maxGridSize=128] - Segment maximal grid size
 * @param {Number} [options.maxEqualZoomAltitude=15000000.0] - Maximal altitude since segments on the screen become the same zoom level
 * @param {Number} [options.minEqualZoomAltitude=10000.0] - Minimal altitude since segments on the screen become the same zoom level
 * @param {Number} [options.minEqualZoomCameraSlope=0.8] - Minimal camera slope above te globe where segments on the screen become the same zoom level
 *
 * @fires EventsHandler<PlanetEventList>#draw
 * @fires EventsHandler<PlanetEventList>#layeradd
 * @fires EventsHandler<PlanetEventList>#baselayerchange
 * @fires EventsHandler<PlanetEventList>#layerremove
 * @fires EventsHandler<PlanetEventList>#layervisibilitychange
 * @fires EventsHandler<PlanetEventList>#geoimageadd
 */
export declare class Planet extends RenderNode {
    events: EventsHandler<PlanetEventsList>;
    /**
     * @public
     * @type {Ellipsoid}
     */
    ellipsoid: Ellipsoid;
    /**
     * @public
     * @override
     * @type {Boolean}
     */
    lightEnabled: boolean;
    /**
     * Squared ellipsoid radius.
     * @public
     * @type {number}
     */
    _planetRadius2: number;
    /**
     * Layers array.
     * @public
     * @type {Array.<Layer>}
     */
    _layers: Layer[];
    /**
     * Flag to trigger layer update in a next frame
     * @type {boolean}
     * @protected
     */
    protected _updateLayer: boolean;
    /**
     * Current visible imagery tile layers array.
     * @public
     * @type {Array.<Layer>}
     */
    visibleTileLayers: Layer[];
    /**
     * Current visible vector layers array.
     * @protected
     * @type {Array.<Layer>}
     */
    protected visibleVectorLayers: Layer[];
    protected _visibleTileLayerSlices: Layer[][];
    /**
     * Vector layers visible nodes with collections.
     * @protected
     * @type {Array.<EntityCollection>}
     */
    protected _frustumEntityCollections: EntityCollection[];
    /**
     * There is only one base layer on the globe when layer.isBaseLayer is true.
     * @public
     * @type {Layer}
     */
    baseLayer: Layer | null;
    /**
     * Terrain provider.
     * @public
     * @type {EmptyTerrain}
     */
    terrain: EmptyTerrain | null;
    /**
     * Camera is this.renderer.activeCamera pointer.
     * @public
     * @type {PlanetCamera}
     */
    camera: PlanetCamera;
    maxEqualZoomAltitude: number;
    minEqualZoomAltitude: number;
    minEqualZoomCameraSlope: number;
    /**
     * Screen mouse pointer projected to planet cartesian position.
     * @public
     * @type {Vec3}
     */
    mousePositionOnEarth: Vec3;
    emptyTexture: WebGLTextureExt | null;
    transparentTexture: WebGLTextureExt | null;
    defaultTexture: WebGLTextureExt | null;
    /**
     * Current visible minimal zoom index planet segment.
     * @public
     * @type {number}
     */
    minCurrZoom: number;
    /**
     * Current visible maximal zoom index planet segment.
     * @public
     * @type {number}
     */
    maxCurrZoom: number;
    _viewExtent: Extent;
    protected _initialViewExtent: Extent | null;
    _createdNodesCount: number;
    /**
     * Planet's segments collected for rendering frame.
     * @public
     * @type {Node}
     */
    _renderedNodes: Node[];
    _renderedNodesInFrustum: Node[][];
    _fadingNodes: Map<number, Node>;
    _fadingNodesInFrustum: Node[][];
    /**
     * Layers activity lock.
     * @public
     * @type {Lock}
     */
    layerLock: Lock;
    /**
     * Terrain providers activity lock.
     * @public
     * @type {Lock}
     */
    terrainLock: Lock;
    /**
     * Height scale factor. 1 - is normal elevation scale.
     * @public
     * @type {number}
     */
    _heightFactor: number;
    /**
     * Precomputed indexes array for different grid size segments.
     * @protected
     * @type {Array.<Array.<number>>}
     */
    _indexesCache: IndexBufferCacheData[][][][][];
    protected _indexesCacheToRemove: IndexBufferCacheData[];
    _indexesCacheToRemoveCounter: number;
    /**
     * Precomputed texture coordinates buffers for different grid size segments.
     * @public
     * @type {Array.<Array.<number>>}
     */
    _textureCoordsBufferCache: WebGLBufferExt[];
    quadTreeStrategy: QuadTreeStrategy;
    /**
     * Night glowing gl texture.
     * @protected
     */
    protected _nightTexture: WebGLTextureExt | null;
    /**
     * Specular mask gl texture.
     * @protected
     */
    protected _specularTexture: WebGLTextureExt | null;
    _ambient: Float32Array;
    _diffuse: Float32Array;
    _specular: Float32Array;
    protected _maxGridSize: number;
    /**
     * Segment multiple textures size.(4 - convenient value for the most devices)
     * @const
     * @public
     */
    SLICE_SIZE: number;
    SLICE_SIZE_4: number;
    SLICE_SIZE_3: number;
    /**
     * Level of details of visible segments.
     * @protected
     * @type {number}
     */
    protected _lodSize: number;
    protected _curLodSize: number;
    protected _minLodSize: number;
    _maxLodSize: number;
    _pickingColorArr: Float32Array;
    _samplerArr: Int32Array;
    _pickingMaskArr: Int32Array;
    /**
     * GeoImage creator.
     * @public
     * @type{GeoImageCreator}
     */
    _geoImageCreator: GeoImageCreator;
    /**
     * VectorTileCreator creator.
     * @public
     * @type{VectorTileCreator}
     */
    _vectorTileCreator: VectorTileCreator;
    /**
     * NormalMapCreator creator.
     * @public
     * @type{NormalMapCreator}
     */
    _normalMapCreator: NormalMapCreator;
    _terrainWorker: TerrainWorker;
    _plainSegmentWorker: PlainSegmentWorker;
    _tileLoader: Loader<Layer>;
    protected _memKey: Key;
    _distBeforeMemClear: number;
    protected _prevCamEye: Vec3;
    protected _initialized: boolean;
    protected always: any[];
    _renderCompleted: boolean;
    _renderCompletedActivated: boolean;
    _terrainCompleted: boolean;
    _terrainCompletedActivated: boolean;
    protected _collectRenderNodesIsActive: boolean;
    /**
     * Night texture brightness coefficient
     * @type {number}
     */
    nightTextureCoefficient: number;
    protected _renderScreenNodesPASS: () => void;
    protected _renderScreenNodesWithHeightPASS: () => void;
    protected _atmosphereEnabled: boolean;
    protected _atmosphereMaxMinOpacity: Float32Array;
    solidTextureOne: WebGLTextureExt | null;
    solidTextureTwo: WebGLTextureExt | null;
    protected _skipPreRender: boolean;
    protected _nightTextureSrc: string | null;
    protected _specularTextureSrc: string | null;
    transitionTime: number;
    _prevNodes: Map<number, Node>;
    _currNodes: Map<number, Node>;
    protected _transitionOpacityEnabled: boolean;
    protected _atmosphere: Atmosphere;
    constructor(options?: IPlanetParams);
    /**
     * Returns true if current terrain data set is loaded
     */
    get terrainReady(): boolean;
    get maxGridSize(): number;
    getNorthFrameRotation(cartesian: Vec3): Quat;
    set atmosphereMaxOpacity(opacity: number);
    get atmosphereMaxOpacity(): number;
    set atmosphereMinOpacity(opacity: number);
    get atmosphereMinOpacity(): number;
    set atmosphereEnabled(enabled: boolean);
    get atmosphereEnabled(): boolean;
    set diffuse(rgb: string | NumberArray3 | Vec3);
    set ambient(rgb: string | NumberArray3 | Vec3);
    set specular(rgb: string | NumberArray3 | Vec3);
    set shininess(v: number);
    get normalMapCreator(): NormalMapCreator;
    get layers(): Layer[];
    /**
     * @todo: remove after tests
     * Get the collection of layers associated with this planet.
     * @return {Array.<Layer>} Layers array.
     * @public
     */
    getLayers(): Layer[];
    get sunPos(): Vec3;
    /**
     * Add the given control to the renderer of the planet scene.
     * @param {Control} control - Control.
     */
    addControl(control: Control): void;
    get lodSize(): number;
    setLodSize(currentLodSize: number, minLodSize?: number, maxLodSize?: number): void;
    /**
     * Add the given controls array to the renderer of the planet.
     * @param {Array.<Control>} cArr - Control array.
     */
    addControls(cArr: Control[]): void;
    /**
     * Return layer by it name
     * @param {string} name - Name of the layer. og.Layer.prototype.name
     * @public
     * @returns {Layer} -
     */
    getLayerByName(name: string): Layer | undefined;
    /**
     * Adds layer to the planet.
     * @param {Layer} layer - Layer object.
     * @public
     */
    addLayer(layer: Layer): void;
    /**
     * Dispatch layer visibility changing event.
     * @param {Layer} layer - Changed layer.
     * @public
     */
    _onLayerVisibilityChanged(layer: Layer): void;
    /**
     * Adds the given layers array to the planet.
     * @param {Array.<Layer>} layers - Layers array.
     * @public
     */
    addLayers(layers: Layer[]): void;
    /**
     * Removes the given layer from the planet.
     * @param {Layer} layer - Layer to remove.
     * @public
     */
    removeLayer(layer: Layer): void;
    /**
     *
     * @public
     * @param {Layer} layer - Material layer.
     */
    _clearLayerMaterial(layer: Layer): void;
    /**
     * Sets base layer coverage to the planet.
     * @param {Layer} layer - Layer object.
     * @public
     */
    setBaseLayer(layer: Layer): void;
    /**
     * Sets elevation scale. 1.0 is default.
     * @param {number} factor - Elevation scale.
     */
    setHeightFactor(factor: number): void;
    /**
     * Gets elevation scale.
     * @returns {number} Terrain elevation scale
     */
    getHeightFactor(): number;
    /**
     * Sets terrain provider
     * @public
     * @param {EmptyTerrain} terrain - Terrain provider.
     */
    setTerrain(terrain: EmptyTerrain): void;
    initAtmosphereShader(atmosParams?: AtmosphereParameters): void;
    get atmosphereControl(): Atmosphere;
    protected _initializeAtmosphere(): void;
    protected _initializeShaders(): void;
    protected _onLayerLoadend(layer: Layer): void;
    init(): void;
    initLayers(): void;
    protected _clearIndexesCache(): void;
    protected _preRender(): void;
    protected _preLoad(): void;
    /**
     * Creates default textures first for the North Pole and whole globe and second for the South Pole.
     * @public
     * @param{IDefaultTextureParams} param0 -
     * @param{IDefaultTextureParams} param1 -
     */
    createDefaultTextures(param0: IDefaultTextureParams, param1: IDefaultTextureParams): void;
    protected _getLayerAttributionHTML(layer: Layer): string;
    /**
     * Updates attribution lists
     * @public
     */
    updateAttributionsList(): void;
    updateVisibleLayers(): void;
    protected _updateVisibleLayers(): void;
    /**
     * Apply to render list of layer attributions
     * @protected
     */
    protected _applyAttribution(html: string): void;
    /**
     * Sort visible layer - preparing for rendering.
     * @protected
     */
    protected _sortLayers(): void;
    protected _clearRenderedNodeList(): void;
    protected _clearRenderNodesInFrustum(): void;
    protected _collectRenderedNodesMaxZoom(cam: PlanetCamera): void;
    set transitionOpacityEnabled(isEnabled: boolean);
    get transitionOpacityEnabled(): boolean;
    /**
     * Collects visible quad nodes.
     * @protected
     */
    protected _collectRenderNodes(cam: PlanetCamera): void;
    protected _renderScreenNodesPASSNoAtmos(): void;
    protected _renderScreenNodesPASSAtmos(): void;
    protected _renderScreenNodesWithHeightPASSNoAtmos(): void;
    protected _renderScreenNodesWithHeightPASSAtmos(): void;
    protected _globalPreDraw(): void;
    /**
     * Render node callback.
     * @public
     */
    preFrame(): void;
    /**
     * Render node callback.
     * Frame function is called for each renderer activrCamera frustum.
     * @public
     * @override
     */
    frame(): void;
    protected _checkRendercompleted(): void;
    lockQuadTree(): void;
    unlockQuadTree(): void;
    protected _setUniformsNoAtmos(cam: PlanetCamera): Program;
    protected _setUniformsAtmos(cam: PlanetCamera): Program;
    protected _renderingFadingNodes: (nodes: Map<number, boolean>, sh: Program, currentNode: Node, sl: Layer[], sliceIndex: number, outTransparentSegments?: Segment[]) => void;
    protected _renderingFadingNodesNoDepth: (nodes: Map<number, boolean>, sh: Program, currentNode: Node, sl: Layer[], sliceIndex: number) => void;
    /**
     * Drawing nodes
     */
    protected _renderingScreenNodes(sh: Program, cam: PlanetCamera, renderedNodes: Node[]): void;
    protected _renderingScreenNodesWithHeight(sh: Program, cam: PlanetCamera, renderedNodes: Node[]): void;
    protected _renderDistanceFramebufferPASS(): void;
    protected _renderColorPickingFramebufferPASS(): void;
    protected _renderDepthFramebufferPASS(): void;
    protected _collectVectorLayerCollections(): void;
    protected _frustumEntityCollectionPickingCallback(): void;
    /**
     * Starts clear memory thread.
     * @public
     */
    memClear(): void;
    /**
     * Returns ray vector hit ellipsoid coordinates.
     * If the ray doesn't hit ellipsoid it returns 'undefined'.
     * @public
     * @param {Ray} ray - Ray.
     * @returns {Vec3 | undefined} -
     */
    getRayIntersectionEllipsoid(ray: Ray): Vec3 | undefined;
    /**
     * Project screen coordinates to the planet ellipsoid.
     * @public
     * @param {Vec2 | IBaseInputState } px - Screen coordinates.
     * @returns {Vec3 | undefined} - Cartesian coordinates.
     */
    getCartesianFromPixelEllipsoid(px: Vec2 | IBaseInputState): Vec3 | undefined;
    /**
     * Project screen coordinates to the planet ellipsoid.
     * @public
     * @param {Vec2 | IBaseInputState} px - Screen coordinates.
     * @returns {LonLat | undefined} - Geodetic coordinates.
     */
    getLonLatFromPixelEllipsoid(px: Vec2): LonLat | undefined;
    /**
     * Returns mouse position cartesian coordinates on the current terrain.
     * @public
     * @returns {Vec3 | undefined} -
     */
    getCartesianFromMouseTerrain(): Vec3 | undefined;
    /**
     * Returns screen coordinates cartesian coordinates on the current terrain.
     * position or null if input coordinates is outside the planet.
     * @public
     * @param {Vec2} px - Pixel screen 2d coordinates.
     * @returns {Vec3 | undefined} -
     */
    getCartesianFromPixelTerrain(px: Vec2 | IBaseInputState): Vec3 | undefined;
    /**
     * Returns geodetic coordinates on the current terrain planet by its screen coordinates.
     * position or null if input coordinates is outside the planet.
     * @public
     * @param {Vec2 | IBaseInputState} px - Pixel screen 2d coordinates.
     * @returns {LonLat | undefined} -
     */
    getLonLatFromPixelTerrain(px: Vec2 | IBaseInputState): LonLat | undefined;
    /**
     * Project cartesian coordinates to screen space.
     * @public
     * @param {Vec3} coords - Cartesian coordinates.
     * @returns {Vec2} - Screen coordinates.
     */
    getPixelFromCartesian(coords: Vec3): Vec2;
    /**
     * Project geodetic coordinates to screen space.
     * @public
     * @param {LonLat} lonlat - Geodetic coordinates.
     * @returns {Vec2 | undefined} - Screen coordinates.
     */
    getPixelFromLonLat(lonlat: LonLat): Vec2 | undefined;
    /**
     * Returns distance from an active (screen) camera to the planet ellipsoid.
     * @public
     * @param {Vec2} px - Screen coordinates.
     * @returns {number} -
     */
    getDistanceFromPixelEllipsoid(px: Vec2 | IBaseInputState): number | undefined;
    /**
     * Returns distance from active (screen) camera to the planet terrain by screen coordinates.
     * @public
     * @param {Vec2 | IBaseInputState} px - Screen coordinates.
     * @returns {number | undefined} -
     */
    getDistanceFromPixel(px: Vec2 | IBaseInputState): number;
    /**
     * Sets camera to the planet geographical extent.
     * @public
     * @param {Extent} extent - Geographical extent.
     */
    viewExtent(extent: Extent): void;
    /**
     * Fits camera position for the view extent.
     * @public
     * @param {Array.<number>} extentArr - Geographical extent array, (exactly 4 entries)
     * where index 0 - southwest longitude, 1 - latitude southwest, 2 - longitude northeast, 3 - latitude northeast.
     */
    viewExtentArr(extentArr: NumberArray4): void;
    /**
     * Gets current camera view extent.
     * @public
     * @returns {Extent} -
     */
    getViewExtent(): Extent;
    /**
     * Sets camera to the planet geographical position.
     * @public
     * @param {LonLat} lonlat - Camera position.
     * @param {LonLat} [lookLonLat] - Viewpoint.
     * @param {Vec3} [up] - Camera up vector.
     */
    viewLonLat(lonlat: LonLat, lookLonLat?: LonLat, up?: Vec3): void;
    /**
     * Fly active camera to the view extent.
     * @public
     * @param {Extent} extent - Geographical extent.
     * @param {Number} [height] - Height on the end of the flight route.
     * @param {Vec3} [up] - Camera UP vector on the end of a flying.
     * @param {Number} [ampl] - Altitude amplitude factor.
     * @param {Function} [startCallback] - Callback that calls before the flying begins.
     * @param {Function} [completeCallback] - Callback that calls after flying when flying is finished.
     */
    flyExtent(extent: Extent, height?: number, up?: Vec3, ampl?: number, completeCallback?: Function, startCallback?: Function): void;
    /**
     * Fly camera to the point.
     * @public
     * @param {Vec3} cartesian - Point coordinates.
     * @param {Vec3} [look] - Camera "look at" point.
     * @param {Vec3} [up] - Camera UP vector on the end of a flying.
     * @param {Number} [ampl] - Altitude amplitude factor.
     * @param {Function} [completeCallback] - Call the function in the end of flight
     * @param {Function} [startCallback] - Call the function in the beginning
     * @param {Function} [frameCallback] - Each frame callback
     */
    flyCartesian(cartesian: Vec3, look?: Vec3 | null, up?: Vec3 | null, ampl?: number, completeCallback?: Function | null, startCallback?: Function | null, frameCallback?: Function | null): void;
    /**
     * Fly camera to the geodetic position.
     * @public
     * @param {LonLat} lonlat - Fly geographical coordinates.
     * @param {Vec3 | LonLat} [look] - Camera viewpoint in the end of the flight.
     * @param {Vec3} [up] - Camera UP vector on the end of a flying.
     * @param {Number} [ampl] - Altitude amplitude factor.
     * @param [completeCallback]
     * @param [startCallback]
     * @param [frameCallback]
     */
    flyLonLat(lonlat: LonLat, look?: Vec3 | LonLat, up?: Vec3, ampl?: number, completeCallback?: Function, startCallback?: Function, frameCallback?: Function): void;
    /**
     * Stop current flight.
     * @public
     */
    stopFlying(): void;
    updateBillboardsTexCoords(): void;
    getEntityTerrainPoint(entity: Entity, res: Vec3): number | undefined;
    getHeightDefault(lonLat: LonLat): Promise<number>;
    getHeightAboveELL(lonLat: LonLat): Promise<number>;
    onremove(): void;
}
export {};
