import { Extent } from "../Extent";
import { GlobusTerrain, IGlobusTerrainParams } from "./GlobusTerrain";
import { LonLat } from "../LonLat";
import { Segment } from "../segment/Segment";
import { TypedArray } from "../utils/shared";
interface IMapboxTerrainParams extends IGlobusTerrainParams {
    equalizeNormals?: boolean;
    key?: string;
    imageSize?: number;
}
declare class MapboxTerrain extends GlobusTerrain {
    protected _imageSize: number;
    protected _ctx: CanvasRenderingContext2D;
    protected _imageDataCache: Record<string, Uint8ClampedArray>;
    constructor(name: string | null, options?: IMapboxTerrainParams);
    isBlur(segment: Segment): boolean;
    protected _createTemporalCanvas(size: number): CanvasRenderingContext2D;
    protected _createHeights(data: HTMLImageElement | ImageBitmap, tileIndex: string, tileX: number, tileY: number, tileZoom: number, extent: Extent, preventChildren: boolean): TypedArray | number[];
    getHeightAsync(lonLat: LonLat, callback: (h: number) => void, zoom?: number): boolean;
}
export { MapboxTerrain };
