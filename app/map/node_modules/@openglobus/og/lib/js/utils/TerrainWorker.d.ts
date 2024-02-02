import { BaseWorker } from "./BaseWorker";
import { Segment } from "../segment/Segment";
import { NumberArray6 } from "../bv/Sphere";
interface TerrainInfo {
    segment: Segment;
    elevations: Float32Array;
}
export interface ITerrainWorkerData {
    id: number;
    normalMapNormals: Float32Array | null;
    normalMapVertices: Float64Array | null;
    normalMapVerticesHigh: Float32Array | null;
    normalMapVerticesLow: Float32Array | null;
    terrainVertices: Float64Array | null;
    terrainVerticesHigh: Float32Array | null;
    terrainVerticesLow: Float32Array | null;
    noDataVertices: Uint8Array | null;
    bounds: NumberArray6;
}
type MessageEventExt = MessageEvent & {
    data: ITerrainWorkerData;
};
declare class TerrainWorker extends BaseWorker<TerrainInfo> {
    constructor(numWorkers?: number);
    protected _onMessage(e: MessageEventExt): void;
    make(info: TerrainInfo): void;
}
export { TerrainWorker };
