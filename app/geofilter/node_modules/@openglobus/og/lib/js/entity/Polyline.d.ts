import { Entity } from "./Entity";
import { Extent } from "../Extent";
import { LonLat } from "../LonLat";
import { NumberArray3, Vec3 } from "../math/Vec3";
import { NumberArray2 } from "../math/Vec2";
import { NumberArray4 } from "../math/Vec4";
import { PolylineHandler } from "./PolylineHandler";
import { RenderNode } from "../scene/RenderNode";
import { WebGLBufferExt } from "../webgl/Handler";
import { TypedArray } from "../utils/shared";
import { Ellipsoid } from "../ellipsoid/Ellipsoid";
export type Geodetic = LonLat | NumberArray2 | NumberArray3;
export type Cartesian = Vec3 | NumberArray3;
export type SegmentPath3vExt = Cartesian[];
export type SegmentPathLonLatExt = Geodetic[];
export type SegmentPathColor = NumberArray4[];
export type SegmentPath3v = Vec3[];
export type SegmentPathLonLat = LonLat[];
export interface IPolylineParams {
    altitude?: number;
    thickness?: number;
    opacity?: number;
    color?: string;
    visibility?: boolean;
    isClosed?: boolean;
    pathColors?: SegmentPathColor[];
    path3v?: SegmentPath3vExt[];
    pathLonLat?: SegmentPathLonLatExt[];
}
/**
 * Polyline object.
 * @class
 * @param {Object} [options] - Polyline options:
 * @param {number} [options.thickness] - Thickness in screen pixels 1.5 is default.
 * @param {Number} [options.altitude] - Relative to ground layers altitude value.
 * @param {Vec4} [options.color] - RGBA color.
 * @param {Boolean} [options.opacity] - Line opacity.
 * @param {Boolean} [options.visibility] - Polyline visibility. True default.
 * @param {Boolean} [options.isClosed] - Closed geometry type identification.
 * @param {SegmentPathLonLatExt[]} [options.pathLonLat] - Polyline geodetic coordinates array. [[[0,0,0], [1,1,1],...]]
 * @param {SegmentPath3vExt[]} [options.path3v] - LinesString cartesian coordinates array. [[[0,0,0], [1,1,1],...]]
 * @param {SegmentPathColor[]} [options.pathColors] - Coordinates color. [[[1,0,0,1], [0,1,0,1],...]] for right and green colors.
 */
declare class Polyline {
    static __counter__: number;
    /**
     * Object uniq identifier.
     * @protected
     * @type {number}
     */
    protected __id: number;
    altitude: number;
    /**
     * Polyline thickness in screen pixels.
     * @public
     * @type {number}
     */
    thickness: number;
    protected _opacity: number;
    /**
     * Polyline RGBA color.
     * @protected
     * @type {Float32Array} - (exactly 4 entries)
     */
    protected _defaultColor: Float32Array | NumberArray4;
    /**
     * Polyline visibility.
     * @public
     * @type {boolean}
     */
    visibility: boolean;
    /**
     * Polyline geometry ring type identification.
     * @protected
     * @type {Boolean}
     */
    protected _closedLine: boolean;
    /**
     * Polyline cartesian coordinates.
     * @public
     * @type {Array.<Vec3>}
     */
    _path3v: SegmentPath3vExt[];
    protected _pathLengths: number[];
    /**
     * Polyline geodetic degrees coordinates.
     * @private
     * @type {Array.<LonLat>}
     */
    protected _pathLonLat: SegmentPathLonLatExt[];
    /**
     * Polyline geodetic mercator coordinates.
     * @public
     * @type {Array.<LonLat>}
     */
    _pathLonLatMerc: LonLat[][];
    protected _pathColors: SegmentPathColor[];
    /**
     * Polyline geodetic extent.
     * @protected
     * @type {Extent}
     */
    _extent: Extent;
    protected _verticesHigh: TypedArray | number[];
    protected _verticesLow: TypedArray | number[];
    protected _orders: TypedArray | number[];
    protected _indexes: TypedArray | number[];
    protected _colors: TypedArray | number[];
    protected _verticesHighBuffer: WebGLBufferExt | null;
    protected _verticesLowBuffer: WebGLBufferExt | null;
    protected _ordersBuffer: WebGLBufferExt | null;
    protected _indexesBuffer: WebGLBufferExt | null;
    protected _colorsBuffer: WebGLBufferExt | null;
    protected _pickingColor: NumberArray3;
    protected _renderNode: RenderNode | null;
    /**
     * Entity instance that holds this Polyline.
     * @public
     * @type {Entity}
     */
    _entity: Entity | null;
    /**
     * Handler that stores and renders this Polyline object.
     * @public
     * @type {PolylineHandler | null}
     */
    _handler: PolylineHandler | null;
    _handlerIndex: number;
    protected _buffersUpdateCallbacks: Function[];
    protected _changedBuffers: boolean[];
    constructor(options?: IPolylineParams);
    /**
     * Appends to the line array new cartesian coordinates line data.
     * @static
     */
    static appendLineData3v(path3v: SegmentPath3vExt[], pathColors: SegmentPathColor[], defaultColor: NumberArray4, isClosed: boolean, outVerticesHigh: number[], outVerticesLow: number[], outOrders: number[], outIndexes: number[], ellipsoid: Ellipsoid, outTransformedPathLonLat: SegmentPathLonLatExt[], outPath3v: SegmentPath3vExt[], outTransformedPathMerc: LonLat[][], outExtent: Extent, outColors: number[]): void;
    /**
     * Appends to the line new cartesian coordinates point data.
     * @static
     */
    static appendPoint3v(path3v: SegmentPath3vExt[], point3v: Vec3, pathColors: SegmentPathColor[], color: NumberArray4, isClosed: boolean, outVerticesHigh: number[], outVerticesLow: number[], outColors: number[], outOrders: number[], outIndexes: number[], ellipsoid: Ellipsoid | null, outTransformedPathLonLat: SegmentPathLonLatExt[], outTransformedPathMerc: LonLat[][], outExtent: Extent): void;
    static setPathColors(pathLonLat: SegmentPathLonLatExt[], pathColors: SegmentPathColor[], defaultColor: NumberArray4, outColors: number[]): void;
    /**
     * Appends to the line array new geodetic coordinates line data.
     * @static
     */
    static appendLineDataLonLat(pathLonLat: SegmentPathLonLatExt[], pathColors: SegmentPathColor[], defaultColor: NumberArray4, isClosed: boolean, outVerticesHigh: number[], outVerticesLow: number[], outOrders: number[], outIndexes: number[], ellipsoid: Ellipsoid, outTransformedPathCartesian: SegmentPath3vExt[], outPathLonLat: SegmentPathLonLatExt[], outTransformedPathMerc: LonLat[][], outExtent: Extent, outColors: number[]): void;
    /**
     * Sets polyline path with cartesian coordinates.
     * @protected
     * @param {SegmentPath3vExt[]} path3v - Cartesian coordinates.
     */
    protected _setEqualPath3v(path3v: SegmentPath3vExt[]): void;
    /**
     * Sets polyline with geodetic coordinates.
     * @protected
     * @param {SegmentPathLonLat[]} pathLonLat - Geodetic polyline path coordinates.
     */
    protected _setEqualPathLonLat(pathLonLat: SegmentPathLonLat[]): void;
    setPointLonLat(lonlat: LonLat, index: number, segmentIndex: number): void;
    /**
     * Changes cartesian point coordinates of the path
     * @param {Vec3} coordinates - New coordinates
     * @param {number} [index=0] - Path segment index
     * @param {number} [segmentIndex=0] - Index of the point in the path segment
     * @param {boolean} [skipLonLat=false] - Do not update geodetic coordinates
     */
    setPoint3v(coordinates: Vec3, index?: number, segmentIndex?: number, skipLonLat?: boolean): void;
    protected _resizePathLengths(index?: number): void;
    /**
     * Remove path segment
     * @param {number} index - Path segment index
     */
    removeSegment(index: number): void;
    /**
     * Remove point from the path
     * @param {number} index - Point index in a path segment
     * @param {number} [multiLineIndex=0] - Segment path index
     */
    removePoint(index: number, multiLineIndex?: number): void;
    /**
     * Insert point coordinates in a path segment
     * @param {Vec3} point3v - Point coordinates
     * @param {number} [index=0] - Index in the path
     * @param {NumberArray4} [color] - Point color
     * @param {number} [multilineIndex=0] - Path segment index
     */
    insertPoint3v(point3v: Vec3, index?: number, color?: NumberArray4, multilineIndex?: number): void;
    /**
     * Adds a new cartesian point in the end of the path in a last line segment.
     * @public
     * @param {Vec3} point3v - New coordinates.
     * @param {NumberArray4} [color] -
     * @param {boolean} [skipEllipsoid] -
     */
    appendPoint3v(point3v: Vec3, color?: NumberArray4, skipEllipsoid?: boolean): void;
    /**
     * Append new point in the end of the path.
     * @public
     * @param {Vec3} point3v - New point coordinates.
     * @param {number} [multiLineIndex=0] - Path segment index, first by default.
     */
    addPoint3v(point3v: Vec3, multiLineIndex?: number): void;
    /**
     * Append new geodetic point in the end of the path.
     * @public
     * @param {LonLat} lonLat - New coordinate.
     * @param {number} [multiLineIndex=0] - Path segment index, first by default.
     */
    addPointLonLat(lonLat: LonLat, multiLineIndex?: number): void;
    /**
     * Clear polyline data.
     * @public
     */
    clear(): void;
    /**
     * Change path point color
     * @param {NumberArray4} color - New color
     * @param {number} [index=0] - Point index
     * @param {number} [segmentIndex=0] - Path segment index
     */
    setPointColor(color: NumberArray4, index?: number, segmentIndex?: number): void;
    /**
     * Sets polyline opacity.
     * @public
     * @param {number} opacity - Opacity.
     */
    setOpacity(opacity: number): void;
    /**
     * Sets Polyline thickness in screen pixels.
     * @public
     * @param {number} thickness - Thickness.
     */
    setAltitude(altitude: number): void;
    /**
     * Sets Polyline thickness in screen pixels.
     * @public
     * @param {number} thickness - Thickness.
     */
    setThickness(thickness: number): void;
    /**
     * Returns thickness.
     * @public
     * @return {number} Thickness in screen pixels.
     */
    getThickness(): number;
    /**
     * Sets visibility.
     * @public
     * @param {boolean} visibility - Polyline visibility.
     */
    setVisibility(visibility: boolean): void;
    /**
     * Gets Polyline visibility.
     * @public
     * @return {boolean} Polyline visibility.
     */
    getVisibility(): boolean;
    /**
     * Assign with render node.
     * @public
     * @param {RenderNode} renderNode -
     */
    setRenderNode(renderNode: RenderNode): void;
    protected _clearData(): void;
    protected _createData3v(path3v: SegmentPath3vExt[]): void;
    protected _createDataLonLat(pathLonlat: SegmentPathLonLatExt[]): void;
    /**
     * Removes from an entity.
     * @public
     */
    remove(): void;
    setPickingColor3v(color: Vec3): void;
    /**
     * Returns polyline geodetic extent.
     * @public
     * @returns {Extent} - Geodetic extent
     */
    getExtent(): Extent;
    /**
     * Returns path cartesian coordinates.
     * @return {SegmentPath3vExt[]} Polyline path.
     */
    getPath3v(): SegmentPath3vExt[];
    /**
     * Returns geodetic path coordinates.
     * @return {SegmentPathLonLatExt[]} Polyline path.
     */
    getPathLonLat(): SegmentPathLonLatExt[];
    getPathColors(): NumberArray4[][];
    /**
     * @todo
     * @param {NumberArray4[][]} pathColors
     */
    setPathColors(pathColors: SegmentPathColor[]): void;
    /**
     * Sets polyline color
     * @param {string} htmlColor- HTML color
     */
    setColorHTML(htmlColor: string): void;
    /**
     * Sets polyline geodetic coordinates.
     * @public
     * @param {SegmentPathLonLat[]} pathLonLat - Polyline path cartesian coordinates.
     * @param {Boolean} [forceEqual=false] - OPTIMIZATION FLAG: Makes assigning faster for size equal coordinates array.
     */
    setPathLonLat(pathLonLat: SegmentPathLonLatExt[], forceEqual?: boolean): void;
    /**
     * Sets Polyline cartesian coordinates.
     * @public
     * @param {SegmentPath3vExt[]} path3v - Polyline path cartesian coordinates. (exactly 3 entries)
     * @param {SegmentPathColor[]} [pathColors] - Polyline path cartesian coordinates. (exactly 3 entries)
     * @param {Boolean} [forceEqual=false] - Makes assigning faster for size equal coordinates array.
     */
    setPath3v(path3v: SegmentPath3vExt[], pathColors?: SegmentPathColor[], forceEqual?: boolean): void;
    draw(): void;
    drawPicking(): void;
    /**
     * Refresh buffers.
     * @protected
     */
    protected _refresh(): void;
    /**
     * Updates render buffers.
     * @protected
     */
    protected _update(): void;
    /**
     * Clear GL buffers.
     * @public
     */
    _deleteBuffers(): void;
    /**
     * Creates vertices buffers.
     * @protected
     */
    protected _createVerticesBuffer(): void;
    /**
     * Creates gl index and order buffer.
     * @protected
     */
    protected _createIndexBuffer(): void;
    protected _createColorsBuffer(): void;
}
export { Polyline };
