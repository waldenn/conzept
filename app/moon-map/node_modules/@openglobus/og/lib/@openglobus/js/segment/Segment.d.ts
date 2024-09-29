import { Box } from "../bv/Box";
import { Extent } from "../Extent";
import { Entity } from "../entity/Entity";
import { TypedArray } from "../utils/shared";
import { Handler, WebGLBufferExt, WebGLTextureExt } from "../webgl/Handler";
import { ITerrainWorkerData } from "../utils/TerrainWorker";
import { Layer } from "../layer/Layer";
import { LonLat } from "../LonLat";
import { Material } from "../layer/Material";
import { Node } from "../quadTree/Node";
import { Planet } from "../scene/Planet";
import { PlanetCamera } from "../camera/PlanetCamera";
import { Program } from "../webgl/Program";
import { Proj } from "../proj/Proj";
import { NumberArray6, Sphere } from "../bv/Sphere";
import { Slice } from "./Slice";
import { Vec3 } from "../math/Vec3";
import { IPlainSegmentWorkerData } from "../utils/PlainSegmentWorker";
export declare function getTileCellIndex(coordinate: number, tileSize: number, worldEdge: number): number;
export declare function getTileCellExtent(x: number, y: number, z: number, worldExtent: Extent): Extent;
export declare const TILEGROUP_COMMON = 0;
export declare const TILEGROUP_NORTH = 20;
export declare const TILEGROUP_SOUTH = 300;
export declare function getTileGroupByLat(lat: number, maxLat?: number): number;
/**
 * Planet segment Web Mercator tile class that stored and rendered with a quad-tree.
 * @class
 * @param {Node} node - Segment node.
 * @param {Planet} planet - Planet scene.
 * @param {number} tileZoom - Zoom index.
 * @param {Extent} extent - Segment extent.
 */
declare class Segment {
    _isNorth?: boolean;
    isPole: boolean;
    _tileGroup: number;
    _projection: Proj;
    elevationData: TypedArray | null;
    /**
     * Quad tree node of the segment.
     * @type {Node}
     */
    node: Node;
    /**
     * Planet pointer.
     * @type {Planet}
     */
    planet: Planet;
    /**
     * WebGl handler pointer.
     * @type {Handler}
     */
    handler: Handler;
    /**
     * Segment bounding sphere
     * @type {Sphere}
     */
    bsphere: Sphere;
    _plainRadius: number;
    /**
     * Segment bounding box.
     * @type {Box}
     */
    bbox: Box;
    _sw: Vec3;
    _nw: Vec3;
    _se: Vec3;
    _ne: Vec3;
    centerNormal: Vec3;
    /**
     * Geographical extent.
     * @type {Extent}
     */
    _extent: Extent;
    _extentMerc: Extent;
    _extentLonLat: Extent;
    /**
     * Vertices grid size.
     * @type {number}
     */
    gridSize: number;
    fileGridSize: number;
    /**
     * Tile zoom index.
     * @type {number}
     */
    tileZoom: number;
    /**
     * Equals to pow(2, tileZoom).
     * @type {number}
     */
    powTileZoom: number;
    /**
     * Horizontal tile index.
     * @type {number}
     */
    tileX: number;
    tileXE: number;
    tileXW: number;
    tileYN: number;
    tileYS: number;
    /**
     * Vertical tile index.
     * @type {number}
     */
    tileY: number;
    tileIndex: string;
    /**
     * Texture materials array.
     * @type {Array.<Material>}
     *
     * @toso: Check it should be Map<number, Material> instead of array
     *
     */
    materials: Material[];
    /**
     * Plain segment vertices was created.
     * @type {boolean}
     */
    plainReady: boolean;
    /**
     * Segment is ready to create plain vertices.
     * @type {boolean}
     */
    initialized: boolean;
    /**
     * Normal map is allready made.
     * @type {boolean}
     */
    normalMapReady: boolean;
    /**
     * Terrain is allready applied flag.
     * @type {boolean}
     */
    terrainReady: boolean;
    /**
     * Terrain is loading now flag.
     * @type {boolean}
     */
    terrainIsLoading: boolean;
    /**
     * Terrain existing flag.
     * @type {boolean}
     */
    terrainExists: boolean;
    /**
     * Means that tree passage reach the segment, and the segment terrain is ready.
     * @type {boolean}
     */
    passReady: boolean;
    plainVertices: Float64Array | null;
    plainVerticesHigh: Float32Array | null;
    plainVerticesLow: Float32Array | null;
    plainNormals: Float32Array | null;
    terrainVertices: Float64Array | null;
    terrainVerticesHigh: Float32Array | null;
    terrainVerticesLow: Float32Array | null;
    noDataVertices: Uint8Array | null;
    tempVertices: Float64Array | null;
    tempVerticesHigh: Float32Array | null;
    tempVerticesLow: Float32Array | null;
    normalMapTexture: WebGLTextureExt | null;
    normalMapTextureBias: Float32Array;
    normalMapVertices: Float64Array | null;
    normalMapVerticesHigh: Float32Array | null;
    normalMapVerticesLow: Float32Array | null;
    normalMapNormals: Float32Array | null;
    vertexNormalBuffer: WebGLBufferExt | null;
    vertexPositionBuffer: WebGLBufferExt | null;
    vertexPositionBufferHigh: WebGLBufferExt | null;
    vertexPositionBufferLow: WebGLBufferExt | null;
    vertexTextureCoordBuffer: WebGLBufferExt | null;
    _globalTextureCoordinates: Float32Array;
    _inTheQueue: boolean;
    _appliedNeighborsZoom: [number, number, number, number];
    _slices: Slice[];
    _indexBuffer: WebGLBufferExt | null;
    readyToEngage: boolean;
    plainProcessing: boolean;
    normalMapTexturePtr: WebGLTextureExt | null;
    _transitionOpacity: number;
    _transitionTimestamp: number;
    constructor(node: Node, planet: Planet, tileZoom: number, extent: Extent);
    checkZoom(): boolean;
    /**
     * Returns entity terrain point.
     * @public
     * @param {Entity} entity - Entity.
     * @param {Vec3} res - Point coordinates.
     * @returns {Vec3} -
     */
    getEntityTerrainPoint(entity: Entity, res: Vec3): number;
    getInsideLonLat(obj: Entity | PlanetCamera): LonLat;
    isEntityInside(entity: Entity): boolean;
    /**
     * Returns distance from object to terrain coordinates and terrain point that calculates out in the res parameter.
     * @public
     * @param {Vec3} xyz - Cartesian object position.
     * @param {LonLat} insideSegmentPosition - Geodetic object position.
     * @param {Vec3} [res] - Result cartesian coordinates on the terrain.
     * @returns {number} -
     */
    getTerrainPoint(xyz: Vec3, insideSegmentPosition: LonLat, res: Vec3): number;
    /**
     * Project wgs86 to segment native projection.
     * @public
     * @param {LonLat} lonlat - Coordinates to project.
     * @returns {LonLat} -
     */
    projectNative(lonlat: LonLat): LonLat;
    loadTerrain(forceLoading?: boolean): void;
    /**
     * Terrain obtained from server.
     * @param {Float32Array} elevations - Elevation data.
     */
    elevationsExists(elevations: number[] | TypedArray): void;
    /**
     * Keep plain elevation segment for rendering
     *
     * 'this.tileZoom <= this.planet.terrain.maxZoom' it means, that the segment is plain
     *
     */
    elevationsNotExists(): void;
    protected _checkEqualization(neighborSide: number, neigborNode: Node): boolean;
    equalize(): void;
    engage(): void;
    _terrainWorkerCallback(data: ITerrainWorkerData): void;
    _normalMapEdgeEqualize(side: number): void;
    applyTerrain(elevations?: number[] | TypedArray | null): void;
    deleteBuffers(): void;
    deleteMaterials(): void;
    deleteElevations(): void;
    clearSegment(): void;
    childrenInitialized(): boolean;
    destroySegment(): void;
    /**
     * @todo: looks like it could be simplified in Segment contructor
     */
    _setExtentLonLat(): void;
    protected _createExtentNormals(): void;
    createBoundsByExtent(): void;
    createBoundsByParent(): void;
    setBoundingSphere(x: number, y: number, z: number, v: Vec3): void;
    setBoundingVolume(xmin: number, ymin: number, zmin: number, xmax: number, ymax: number, zmax: number): void;
    setBoundingVolume3v(vmin: Vec3, vmax: Vec3): void;
    setBoundingVolumeArr(bounds: NumberArray6): void;
    createCoordsBuffers(verticesHigh: Float32Array, verticesLow: Float32Array, gridSize: number): void;
    _addViewExtent(): void;
    protected _assignTileIndexes(): void;
    initialize(): void;
    protected _assignGlobalTextureCoordinates(): void;
    createPlainSegmentAsync(): void;
    _plainSegmentWorkerCallback(data: IPlainSegmentWorkerData): void;
    createPlainSegment(): void;
    protected _projToDeg(lon: number, lat: number): LonLat;
    protected _createPlainVertices(): void;
    /**
     * Gets specific layer material.
     * @public
     * @param {Layer} layer - Layer object.
     * @returns {Material | undefined} - Segment material.
     */
    getMaterialByLayer(layer: Layer): Material | undefined;
    /**
     * @param layer
     * @protected
     *
     * @todo siplify layer._extentMerc in this.getLayerExtent(layer)
     *
     */
    protected _getLayerExtentOffset(layer: Layer): [number, number, number, number];
    initSlice(sliceIndex: number): Slice;
    screenRendering(sh: Program, layerSlice: Layer[], sliceIndex: number, defaultTexture?: WebGLTextureExt | null, isOverlay?: boolean, forcedOpacity?: number): void;
    heightPickingRendering(sh: Program, layerSlice: Layer[]): void;
    increaseTransitionOpacity(): void;
    fadingTransitionOpacity(): void;
    colorPickingRendering(sh: Program, layerSlice: Layer[], sliceIndex: number, defaultTexture?: WebGLTextureExt | null, isOverlay?: boolean): void;
    depthRendering(sh: Program, layerSlice: Layer[]): void;
    protected _getIndexBuffer(): WebGLBufferExt;
    layerOverlap(layer: Layer): boolean;
    getDefaultTexture(): WebGLTextureExt | null;
    getExtentLonLat(): Extent;
    getExtentMerc(): Extent;
    getExtent(): Extent;
    getNeighborSide(b: Segment): 0 | 1 | 2 | 3 | -1;
}
export { Segment };
