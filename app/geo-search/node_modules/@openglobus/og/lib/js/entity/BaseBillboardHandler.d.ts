import { TypedArray } from "../utils/shared";
import { EntityCollection } from "./EntityCollection";
import { Renderer } from "../renderer/Renderer";
import { Vec3 } from "../math/Vec3";
import { Vec4 } from "../math/Vec4";
import { WebGLBufferExt } from "../webgl/Handler";
import { BaseBillboard } from "./BaseBillboard";
/**
 * @class BaseBillboardHandler
 */
declare class BaseBillboardHandler {
    static __counter__: number;
    __id: number;
    /**
     * Picking rendering option.
     * @public
     * @type {boolean}
     */
    pickingEnabled: boolean;
    _entityCollection: EntityCollection;
    protected _renderer: Renderer | null;
    protected _billboards: BaseBillboard[];
    protected _positionHighBuffer: WebGLBufferExt | null;
    protected _positionLowBuffer: WebGLBufferExt | null;
    protected _sizeBuffer: WebGLBufferExt | null;
    protected _offsetBuffer: WebGLBufferExt | null;
    protected _rgbaBuffer: WebGLBufferExt | null;
    protected _rotationBuffer: WebGLBufferExt | null;
    protected _texCoordBuffer: WebGLBufferExt | null;
    protected _vertexBuffer: WebGLBufferExt | null;
    protected _texCoordArr: Float32Array;
    protected _vertexArr: Float32Array;
    protected _positionHighArr: Float32Array;
    protected _positionLowArr: Float32Array;
    protected _sizeArr: Float32Array;
    protected _offsetArr: Float32Array;
    protected _rgbaArr: Float32Array;
    protected _rotationArr: Float32Array;
    protected _pickingColorBuffer: WebGLBufferExt | null;
    protected _pickingColorArr: Float32Array;
    protected _buffersUpdateCallbacks: Function[];
    protected _changedBuffers: boolean[];
    constructor(entityCollection: EntityCollection);
    isEqual(handler: BaseBillboardHandler): boolean;
    static concArr(dest: number[], curr: number[]): void;
    initProgram(): void;
    setRenderer(renderer: Renderer): void;
    refresh(): void;
    protected _removeBillboards(): void;
    clear(): void;
    protected _deleteBuffers(): void;
    update(): void;
    add(billboard: BaseBillboard): void;
    protected _displayPASS(): void;
    protected _pickingPASS(): void;
    draw(): void;
    drawPicking(): void;
    reindexBillboardsArray(startIndex: number): void;
    protected _removeBillboard(billboard: BaseBillboard): void;
    setAlignedAxisArr(index: number, alignedAxis: Vec3): void;
    remove(billboard: BaseBillboard): void;
    setPositionArr(index: number, positionHigh: Vec3, positionLow: Vec3): void;
    setPickingColorArr(index: number, color: Vec3): void;
    setSizeArr(index: number, width: number, height: number): void;
    setOffsetArr(index: number, offset: Vec3): void;
    setRgbaArr(index: number, rgba: Vec4): void;
    setRotationArr(index: number, rotation: number): void;
    setTexCoordArr(index: number, tcoordArr: number[] | TypedArray): void;
    setVisibility(index: number, visibility: boolean): void;
    setVertexArr(index: number, vertexArr: number[] | Float32Array): void;
    createPositionBuffer(): void;
    createSizeBuffer(): void;
    createOffsetBuffer(): void;
    createRgbaBuffer(): void;
    createRotationBuffer(): void;
    createVertexBuffer(): void;
    createTexCoordBuffer(): void;
    createPickingColorBuffer(): void;
    refreshTexCoordsArr(): void;
}
export { BaseBillboardHandler };
