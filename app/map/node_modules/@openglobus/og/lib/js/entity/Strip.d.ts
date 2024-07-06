import { Entity } from "./Entity";
import { RenderNode } from "../scene/RenderNode";
import { NumberArray3, Vec3 } from "../math/Vec3";
import { NumberArray4, Vec4 } from "../math/Vec4";
import { StripHandler } from "./StripHandler";
import { WebGLBufferExt } from "../webgl/Handler";
type TPoiExt = Vec3 | NumberArray3;
type TStripExt = [TPoiExt, TPoiExt];
type TPoi = Vec3;
type TStrip = [TPoi, TPoi];
export interface IStripParams {
    visibility?: boolean;
    color?: string | NumberArray4 | Vec4;
    opacity?: number;
    path?: TStrip[];
}
/**
 * Strip object.
 * @class
 * @param {*} [options] - Strip options:
 * @param {boolean} [options.visibility] - Strip visibility.
 * @example <caption>Stripe example</caption>
 * new og.Entity({
 *     strip: {
 *         gridSize: 10,
 *         path: [
 *             [[],[]],
 *             [[],[]]
 *         ]
 *     }
 * });
 */
declare class Strip {
    static __counter__: number;
    protected __id: number;
    /**
     * Strip visibility.
     * @public
     * @type {boolean}
     */
    visibility: boolean;
    color: Float32Array;
    /**
     * Parent collection render node.
     * @protected
     * @type {RenderNode}
     */
    protected _renderNode: RenderNode | null;
    /**
     * Entity instance that holds this strip.
     * @public
     * @type {Entity}
     */
    _entity: Entity | null;
    protected _verticesHighBuffer: WebGLBufferExt | null;
    protected _verticesLowBuffer: WebGLBufferExt | null;
    protected _indexBuffer: WebGLBufferExt | null;
    protected _verticesHigh: number[];
    protected _verticesLow: number[];
    protected _indexes: number[];
    protected _path: TStrip[];
    protected _pickingColor: Float32Array;
    protected _gridSize: number;
    /**
     * Handler that stores and renders this object.
     * @public
     * @type {StripHandler | null}
     */
    _handler: StripHandler | null;
    _handlerIndex: number;
    constructor(options?: IStripParams);
    /**
     * Assign picking color.
     * @public
     * @param {Vec3} color - Picking RGB color.
     */
    setPickingColor3v(color: Vec3): void;
    /**
     * Clears object
     * @public
     */
    clear(): void;
    /**
     * Sets RGBA color. Each channel from 0.0 to 1.0.
     * @public
     * @param {Vec4} color - RGBA vector.
     */
    setColor4v(color: Vec4): void;
    /**
     * Sets strip color.
     * @public
     * @param {string} color - HTML style color.
     */
    setColorHTML(color: string): void;
    setColor(r: number, g: number, b: number, a?: number): void;
    /**
     * Set strip opacity.
     * @public
     * @param {number} opacity - opacity.
     */
    setOpacity(opacity: number): void;
    /**
     * Sets cloud visibility.
     * @public
     * @param {boolean} visibility - Visibility flag.
     */
    setVisibility(visibility: boolean): void;
    /**
     * @return {boolean} Strip visibility.
     */
    getVisibility(): boolean;
    /**
     * Assign rendering scene node.
     * @public
     * @param {RenderNode}  renderNode - Assigned render node.
     */
    setRenderNode(renderNode: RenderNode): void;
    /**
     * Removes from entity.
     * @public
     */
    remove(): void;
    draw(): void;
    drawPicking(): void;
    /**
     * Delete buffers
     * @public
     */
    _deleteBuffers(): void;
    protected _createBuffers(): void;
    addEdge3v(p2: Vec3, p3: Vec3): void;
    setEdge3v(p2: Vec3, p3: Vec3, index: number): void;
    removeEdge(index: number): void;
    setGridSize(gridSize: number): void;
    getPath(): TStrip[];
    setPath(path: TStripExt[] | TStrip[]): void;
    insertEdge3v(p0: Vec3, p1: Vec3, index: number): void;
}
export { Strip };
