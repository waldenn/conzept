import { BaseWorker } from "./BaseWorker";
import { Segment } from "../segment/Segment";
import { Geoid } from "../terrain/Geoid";
export interface IPlainSegmentWorkerData {
    plainVertices: Float64Array | null;
    plainVerticesHigh: Float32Array | null;
    plainVerticesLow: Float32Array | null;
    plainNormals: Float32Array | null;
    plainRadius: number;
    normalMapNormals: Float32Array | null;
    normalMapVertices: Float64Array | null;
    normalMapVerticesHigh: Float32Array | null;
    normalMapVerticesLow: Float32Array | null;
}
type MessageEventExt = MessageEvent & {
    data: IPlainSegmentWorkerData;
};
declare class PlainSegmentWorker extends BaseWorker<Segment> {
    constructor(numWorkers?: number);
    protected _onMessage(e: MessageEventExt): void;
    setGeoid(geoid: Geoid): void;
    make(segment: Segment): void;
}
export { PlainSegmentWorker };
