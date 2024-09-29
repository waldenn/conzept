import { Camera } from "../camera/Camera";
import { Control } from "../control/Control";
import { RendererEventsHandler } from "./RendererEvents";
import { EntityCollection } from "../entity/EntityCollection";
import { Framebuffer, Multisample } from "../webgl/index";
import { FontAtlas } from "../utils/FontAtlas";
import { Handler, WebGLBufferExt } from "../webgl/Handler";
import { LabelWorker } from "../entity/LabelWorker";
import { RenderNode } from "../scene/RenderNode";
import { TextureAtlas } from "../utils/TextureAtlas";
import { Vec2 } from "../math/Vec2";
import { NumberArray3, Vec3 } from "../math/Vec3";
import { Vec4 } from "../math/Vec4";
interface IRendererParams {
    controls?: Control[];
    msaa?: number;
    autoActivate?: boolean;
    fontsSrc?: string;
    gamma?: number;
    exposure?: number;
}
interface IPickingObject {
    _pickingColor?: Vec3;
    _pickingColorU?: Float32Array;
}
interface IFrameCallbackHandler {
    id: number;
    callback: Function;
    sender: any;
}
export interface HTMLDivElementExt extends HTMLDivElement {
    attributions?: HTMLElement;
}
declare class Renderer {
    /**
     * Div element with WebGL canvas. Assigned in Globe class.
     * @public
     * @type {HTMLElement | null}
     */
    div: HTMLDivElementExt | null;
    /**
     * WebGL handler context.
     * @public
     * @type {Handler}
     */
    handler: Handler;
    exposure: number;
    gamma: number;
    whitepoint: number;
    brightThreshold: number;
    /**
     * Render nodes drawing queue.
     * @public
     * @type {Array.<RenderNode>}
     */
    _renderNodesArr: RenderNode[];
    /**
     * Render nodes store for the comfortable access by the node name.
     * @public
     * @type {Object.<RenderNode>}
     */
    renderNodes: Record<string, RenderNode>;
    /**
     * Current active camera.
     * @public
     * @type {Camera}
     */
    activeCamera: Camera | null;
    /**
     * Renderer events. Represents interface for setting events like mousemove, draw, keypress etc.
     * @public
     * @type {RendererEvents}
     */
    events: RendererEventsHandler;
    /**
     * Controls array.
     * @public
     * @type {Object}
     */
    controls: Record<string, Control>;
    /**
     * Provides exchange between controls.
     * @public
     * @type {any}
     */
    controlsBag: any;
    /**
     * Hash table for drawing objects.
     * @public
     * @type {Map<string, any>}
     */
    colorObjects: Map<string, any>;
    /**
     * Color picking objects rendering queue.
     * @type {Function[]}
     */
    protected _pickingCallbacks: IFrameCallbackHandler[];
    /**
     * Picking objects(labels and billboards) framebuffer.
     * @public
     * @type {Framebuffer}
     */
    pickingFramebuffer: Framebuffer | null;
    protected _tempPickingPix_: Uint8Array;
    /**
     * @public
     * @type {Framebuffer}
     */
    distanceFramebuffer: Framebuffer | null;
    /**
     * @type {Function[]}
     */
    protected _distanceCallbacks: IFrameCallbackHandler[];
    protected _tempDistancePix_: Uint8Array;
    /**
     * Depth objects rendering queue.
     * @type {Function[]}
     */
    protected _depthCallbacks: IFrameCallbackHandler[];
    depthFramebuffer: Framebuffer | null;
    protected _msaa: number;
    protected _internalFormat: string;
    protected _format: string;
    protected _type: string;
    sceneFramebuffer: Framebuffer | Multisample | null;
    protected blitFramebuffer: Framebuffer | null;
    protected toneMappingFramebuffer: Framebuffer | null;
    protected _initialized: boolean;
    /**
     * Texture atlas for the billboards images. One atlas per node.
     * @public
     * @type {TextureAtlas}
     */
    billboardsTextureAtlas: TextureAtlas;
    /**
     * Texture atlas for the billboards images. One atlas per node.
     * @public
     * @type {TextureAtlas}
     */
    geoObjectsTextureAtlas: TextureAtlas;
    /**
     * Texture font atlas for the font families and styles. One atlas per node.
     * @public
     * @type {FontAtlas}
     */
    fontAtlas: FontAtlas;
    protected _entityCollections: EntityCollection[];
    protected _currentOutput: string;
    protected _fnScreenFrame: Function | null;
    labelWorker: LabelWorker;
    __useDistanceFramebuffer__: boolean;
    screenDepthFramebuffer: Framebuffer | null;
    screenFramePositionBuffer: WebGLBufferExt | null;
    screenTexture: Record<string, WebGLTexture>;
    outputTexture: WebGLTexture | null;
    protected _skipDistanceFrame: boolean;
    protected _distancePixelBuffer: WebGLBuffer | null;
    protected _skipPickingFrame: boolean;
    protected _pickingPixelBuffer: WebGLBuffer | null;
    protected _readDistanceBuffer: () => void;
    protected _readPickingBuffer: () => void;
    constructor(handler: Handler, params?: IRendererParams);
    enableBlendOneSrcAlpha(): void;
    enableBlendDefault(): void;
    /**
     * Sets renderer events activity.
     * @param {Boolean} activity - Events activity.
     */
    setEventsActivity(activity: boolean): void;
    addDepthCallback(sender: any, callback: Function): number;
    removeDepthCallback(id: number): void;
    addDistanceCallback(sender: any, callback: Function): number;
    removeDistanceCallback(id: number): void;
    /**
     * Adds picking rendering callback function.
     * @param {object} sender - Callback context.
     * @param {Function} callback - Rendering callback.
     * @returns {Number} Handler id
     */
    addPickingCallback(sender: any, callback: Function): number;
    /**
     * Removes picking rendering callback function.
     * @param {Number} id - Handler id to remove.
     */
    removePickingCallback(id: number): void;
    getPickingObject<T>(r: number, g: number, b: number): T;
    getPickingObjectArr<T>(arr: NumberArray3 | Uint8Array): T;
    getPickingObject3v<T>(vec: Vec3 | Vec4): T;
    /**
     * Assign picking color to the object.
     * @public
     * @param {Object} obj - Object that presume to be picked.
     */
    assignPickingColor<T>(obj: T & IPickingObject): void;
    /**
     * Removes picking color from object.
     * @public
     * @param {Object} obj - Object to remove picking color.
     */
    clearPickingColor<T>(obj: T & IPickingObject): void;
    /**
     * Get the client width.
     * @public
     * @returns {number} -
     */
    getWidth(): number;
    /**
     * Get the client height.
     * @public
     * @returns {number} -
     */
    getHeight(): number;
    /**
     * Get center of the canvas
     * @public
     * @returns {Vec2} -
     */
    getCenter(): Vec2;
    /**
     * Get center of the screen viewport
     * @public
     * @returns {Vec2} -
     */
    getClientCenter(): Vec2;
    /**
     * Add the given control to the renderer.
     * @param {Control} control - Control.
     */
    addControl(control: Control): void;
    /**
     * Add the given controls array to the planet node.
     * @param {Array.<Control>} cArr - Control array.
     */
    addControls(cArr: Control[]): void;
    /**
     * Remove control from the renderer.
     * @param {Control} control  - Control.
     */
    removeControl(control: Control): void;
    isInitialized(): boolean;
    /**
     * Renderer initialization.
     * @public
     */
    initialize(): void;
    _initReadPixelsBuffers(): void;
    _initializeControls(): void;
    resize(): void;
    setCurrentScreen(screenName: string): void;
    _resizeStart(): void;
    _resizeEnd(): void;
    removeNode(renderNode: RenderNode): void;
    /**
     * Adds render node to the renderer.
     * @public
     * @param {RenderNode} renderNode - Render node.
     */
    addNode(renderNode: RenderNode): void;
    protected _initializeRenderNodes(): void;
    /**
     * Adds render node to the renderer before specific node.
     * @public
     * @param {RenderNode} renderNode - Render node.
     * @param {RenderNode} renderNodeBefore - Insert before the renderNodeBefore node.
     */
    addNodeBefore(renderNode: RenderNode, renderNodeBefore: RenderNode): void;
    /**
     * Adds render nodes array to the renderer.
     * @public
     * @param {Array.<RenderNode>} nodesArr - Render nodes array.
     */
    addNodes(nodesArr: RenderNode[]): void;
    getMaxMSAA(internalFormat: string): any;
    getMSAA(): number;
    /**
     * TODO: replace with cache friendly linked list by BillboardHandler, LabelHandler etc.
     */
    enqueueEntityCollectionsToDraw(ecArr: EntityCollection[]): void;
    /**
     * Draws opaque items entity collections.
     * @protected
     */
    protected _drawOpaqueEntityCollections(): void;
    /**
     * Draws transparent items entity collections.
     * @protected
     */
    protected _drawTransparentEntityCollections(): void;
    protected _clearEntityCollectionQueue(): void;
    /**
     * Draw nodes.
     * @public
     */
    draw(): void;
    protected _screenFrameMSAA(): void;
    protected _screenFrameNoMSAA(): void;
    /**
     * Draw picking objects framebuffer.
     * @private
     */
    protected _drawPickingBuffer(): void;
    /**
     * Draw picking objects framebuffer.
     * @protected
     */
    protected _drawDistanceBuffer(): void;
    protected _drawDepthBuffer(): void;
    protected _readPickingBuffer_webgl1: () => void;
    protected _readPickingBuffer_webgl2: () => void;
    protected _readDistanceBuffer_webgl1: () => void;
    protected _readDistanceBuffer_webgl2: () => void;
    readPickingColor(x: number, y: number, outColor: NumberArray3 | Uint8Array): void;
    readDistanceColor(x: number, y: number, outColor: NumberArray3 | Uint8Array): void;
    /**
     * Function starts renderer
     * @public
     */
    start(): void;
    destroy(): void;
}
export { Renderer };
