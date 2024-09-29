import { Extent } from "../Extent";
import { GlobusTerrain, IGlobusTerrainParams } from "./GlobusTerrain";
import { LonLat } from "../LonLat";
import { Segment } from "../segment/Segment";
import { TypedArray } from "../utils/shared";
export interface IRgbTerrainParams extends IGlobusTerrainParams {
    equalizeNormals?: boolean;
    key?: string;
    imageSize?: number;
    minHeight?: number;
    resolution?: number;
}
/**
 * @class
 * @extends {GlobusTerrain}
 * @param {string} [name=""] - Terrain provider name.
 * @param {IRgbTerrainParams} [options]:
 * @param {boolean} [equalizeNormals=true] - Make normal equalization on the edges of the tiles.
 * @param {string} [key=""] - API key.
 * @param {number} [imageSize=256] - Image size.
 * @param {number} [minHeight=-10000] - Minimal height for rgb to height converter.
 * @param {number} [resolution=0.1] - Height converter resolution.
 */
declare class RgbTerrain extends GlobusTerrain {
    protected _imageSize: number;
    protected _ctx: CanvasRenderingContext2D;
    protected _imageDataCache: Record<string, Uint8ClampedArray>;
    protected _minHeight: number;
    protected _resolution: number;
    constructor(name: string | null, options?: IRgbTerrainParams);
    static checkNoDataValue(noDataValues: number[] | TypedArray, value: number): boolean;
    rgb2Height(r: number, g: number, b: number): number;
    isBlur(segment: Segment): boolean;
    protected _createTemporalCanvas(size: number): CanvasRenderingContext2D;
    protected _createHeights(data: HTMLImageElement | ImageBitmap, segment: Segment | null, tileGroup: number, tileX: number, tileY: number, tileZoom: number, extent: Extent, preventChildren: boolean): TypedArray | number[];
    getHeightAsync(lonLat: LonLat, callback: (h: number) => void, zoom?: number): boolean;
    extractElevationSimple(rgbaData: number[] | TypedArray, noDataValues: number[] | TypedArray, availableParentData: (TypedArray | number[] | null) | undefined, availableParentOffsetX: number, availableParentOffsetY: number, availableZoomDiff: number, skipPositiveHeights: boolean, outCurrenElevations: number[] | TypedArray, heightFactor: number | undefined, imageSize: number): void;
    extractElevationTilesRgbNonPowerOfTwo(rgbaData: number[] | TypedArray, outCurrenElevations: number[] | TypedArray, heightFactor?: number): void;
    extractElevationTilesRgb(rgbaData: number[] | TypedArray, heightFactor: number, noDataValues: number[] | TypedArray, availableParentData: (TypedArray | number[] | null) | undefined, availableParentTileX: number, availableParentTileY: number, availableParentTileZoom: number, currentTileX: number, currentTileY: number, currentTileZoom: number, skipPositiveHeights: boolean, outCurrenElevations: number[] | TypedArray, outChildrenElevations: number[][][] | TypedArray[][]): void;
    extractElevationTilesRgbNoChildren(rgbaData: number[] | TypedArray, heightFactor: number, noDataValues: number[] | TypedArray, availableParentData: (TypedArray | number[] | null) | undefined, availableParentTileX: number, availableParentTileY: number, availableParentTileZoom: number, currentTileX: number, currentTileY: number, currentTileZoom: number, skipPositiveHeights: boolean, outCurrenElevations: number[] | TypedArray): void;
}
export { RgbTerrain };
