import { RenderNode } from './RenderNode';
import { WebGLBufferExt } from "../webgl/Handler";
declare class Axes extends RenderNode {
    size: number;
    axesBuffer: WebGLBufferExt | null;
    axesColorBuffer: WebGLBufferExt | null;
    constructor(size?: number);
    init(): void;
    frame(): void;
    createAxesBuffer(gridSize: number): void;
}
export { Axes };
