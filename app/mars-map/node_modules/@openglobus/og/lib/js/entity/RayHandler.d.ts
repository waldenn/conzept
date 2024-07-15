import { TypedArray } from "../utils/shared";
import { EntityCollection } from "./EntityCollection";
import { Ray } from "./Ray";
import { Renderer } from "../renderer/Renderer";
import { Vec3 } from "../math/Vec3";
import { Vec4 } from "../math/Vec4";
import { WebGLBufferExt } from "../webgl/Handler";
declare class RayHandler {
    static __counter__: number;
    protected __id: number;
    /**
     * Picking rendering option.
     * @public
     * @type {boolean}
     */
    pickingEnabled: boolean;
    protected _entityCollection: EntityCollection;
    protected _renderer: Renderer | null;
    protected _rays: Ray[];
    protected _vertexBuffer: WebGLBufferExt | null;
    protected _startPositionHighBuffer: WebGLBufferExt | null;
    protected _startPositionLowBuffer: WebGLBufferExt | null;
    protected _endPositionHighBuffer: WebGLBufferExt | null;
    protected _endPositionLowBuffer: WebGLBufferExt | null;
    protected _thicknessBuffer: WebGLBufferExt | null;
    protected _rgbaBuffer: WebGLBufferExt | null;
    protected _pickingColorBuffer: WebGLBufferExt | null;
    protected _vertexArr: TypedArray | number[];
    protected _startPositionHighArr: TypedArray | number[];
    protected _startPositionLowArr: TypedArray | number[];
    protected _endPositionHighArr: TypedArray | number[];
    protected _endPositionLowArr: TypedArray | number[];
    protected _thicknessArr: TypedArray | number[];
    protected _rgbaArr: TypedArray | number[];
    protected _pickingColorArr: TypedArray | number[];
    protected _buffersUpdateCallbacks: Function[];
    protected _changedBuffers: boolean[];
    constructor(entityCollection: EntityCollection);
    static concArr(dest: number[], curr: number[]): void;
    initProgram(): void;
    setRenderer(renderer: Renderer): void;
    refresh(): void;
    protected _removeRays(): void;
    clear(): void;
    protected _deleteBuffers(): void;
    update(): void;
    add(ray: Ray): void;
    protected _addRayToArrays(ray: Ray): void;
    protected _displayPASS(): void;
    protected _pickingPASS(): void;
    draw(): void;
    drawPicking(): void;
    reindexRaysArray(startIndex: number): void;
    protected _removeRay(ray: Ray): void;
    remove(ray: Ray): void;
    setStartPositionArr(index: number, positionHigh: Vec3, positionLow: Vec3): void;
    setEndPositionArr(index: number, positionHigh: Vec3, positionLow: Vec3): void;
    setPickingColorArr(index: number, color: Vec3): void;
    setRgbaArr(index: number, startColor: Vec4, endColor: Vec4): void;
    setThicknessArr(index: number, thickness: number): void;
    setVisibility(index: number, visibility: boolean): void;
    setVertexArr(index: number, vertexArr: number[]): void;
    createStartPositionBuffer(): void;
    createEndPositionBuffer(): void;
    createRgbaBuffer(): void;
    createThicknessBuffer(): void;
    createVertexBuffer(): void;
    createPickingColorBuffer(): void;
}
export { RayHandler };
