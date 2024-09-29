import { BaseFramebuffer } from "./BaseFramebuffer";
import { Clock } from "../Clock";
import { EventsHandler } from "../Events";
import { TypedArray } from "../utils/shared";
import { NumberArray2, Vec2 } from "../math/Vec2";
import { ProgramController } from "./ProgramController";
import { Program } from "./Program";
import { Stack } from "../Stack";
export type WebGLContextExt = {
    type: string;
} & WebGL2RenderingContext;
export type WebGLBufferExt = {
    numItems: number;
    itemSize: number;
} & WebGLBuffer;
export type WebGLTextureExt = {
    default?: boolean;
} & WebGLTexture;
export type ImageSource = HTMLCanvasElement | ImageBitmap | ImageData | HTMLImageElement | HTMLVideoElement;
type CreateTextureFunc = (image: ImageSource, internalFormat?: number, texture?: WebGLTextureExt) => WebGLTextureExt | null;
export interface IHandlerParameters {
    anisotropy?: number;
    width?: number;
    height?: number;
    pixelRatio?: number;
    context?: {
        stencil?: boolean;
        alpha?: boolean;
        antialias?: boolean;
        premultipliedAlpha?: boolean;
    };
    extensions?: string[];
    autoActivate?: boolean;
}
export interface Texture3DParams {
    nx: string;
    px: string;
    py: string;
    ny: string;
    pz: string;
    nz: string;
}
export interface IDefaultTextureParams {
    color?: string;
    url?: string;
}
/**
 * A WebGL handler for accessing low-level WebGL capabilities.
 * @class
 * @param {string | HTMLCanvasElement} canvasTarget - Canvas element target.
 * or undefined creates hidden canvas and handler becomes hidden.
 * @param {Object} [params] - Handler options:
 * @param {number} [params.anisotropy] - Anisotropy filter degree. 8 is default.
 * @param {number} [params.width] - Hidden handler width. 256 is default.
 * @param {number} [params.height] - Hidden handler height. 256 is default.
 * @param {Array.<string>} [params.extensions] - Additional WebGL extension list. Available by default: EXT_texture_filter_anisotropic.
 */
declare class Handler {
    protected _throttledDrawFrame: () => void;
    /**
     * Events.
     * @public
     * @type {EventsHandler<["visibilitychange", "resize"]>}
     */
    events: EventsHandler<["visibilitychange", "resize"]>;
    /**
     * Application default timer.
     * @public
     * @type {Clock}
     */
    defaultClock: Clock;
    /**
     * Custom timers.
     * @protected
     * @type{Clock[]}
     */
    protected _clocks: Clock[];
    /**
     * Draw frame time in milliseconds.
     * @public
     * @type {number}
     */
    deltaTime: number;
    /**
     * WebGL rendering canvas element.
     * @public
     * @type {HTMLCanvasElement | null}
     */
    canvas: HTMLCanvasElement | null;
    /**
     * WebGL context.
     * @public
     * @type {WebGLContextExt | null}
     */
    gl: WebGLContextExt | null;
    /**
     * Shader program controller list.
     * @public
     * @type {Record<string, ProgramController>}
     */
    programs: Record<string, ProgramController>;
    /**
     * Current active shader program controller.
     * @public
     * @type {ProgramController}
     */
    activeProgram: ProgramController | null;
    /**
     * Handler parameters.
     * @private
     * @type {Object}
     */
    protected _params: {
        anisotropy: number;
        width: number;
        height: number;
        pixelRatio: number;
        context: {
            stencil?: boolean;
            alpha?: boolean;
            antialias?: boolean;
            premultipliedAlpha?: boolean;
        };
        extensions: string[];
    };
    _oneByHeight: number;
    /**
     * Current WebGL extensions. Becomes here after context initialization.
     * @public
     * @type {Record<string, any>}
     */
    extensions: Record<string, any>;
    /**
     * HTML Canvas target.
     * @private
     * @type {string | HTMLCanvasElement | undefined}
     */
    protected _canvasTarget: string | HTMLCanvasElement | undefined;
    protected _lastAnimationFrameTime: number;
    protected _initialized: boolean;
    /**
     * Animation frame function assigned from outside(Ex. from Renderer).
     * @private
     * @type {Function}
     */
    protected _frameCallback: Function;
    protected _canvasSize: NumberArray2;
    transparentTexture: WebGLTextureExt | null;
    defaultTexture: WebGLTextureExt | null;
    framebufferStack: Stack<BaseFramebuffer>;
    createTexture: Record<string, CreateTextureFunc>;
    createTextureDefault: CreateTextureFunc;
    ONCANVASRESIZE: Function | null;
    createTexture_n: CreateTextureFunc;
    createTexture_l: CreateTextureFunc;
    createTexture_mm: CreateTextureFunc;
    createTexture_a: CreateTextureFunc;
    intersectionObserver?: IntersectionObserver;
    resizeObserver?: ResizeObserver;
    protected _requestAnimationFrameId: number;
    constructor(canvasTarget: string | HTMLCanvasElement | undefined, params?: IHandlerParameters);
    set frameDelay(delay: number);
    isInitialized(): boolean;
    protected _createCanvas(): void;
    /**
     * The return value is null if the extension is not supported, or an extension object otherwise.
     * @param {WebGLRenderingContext | WebGL2RenderingContext | null} gl - WebGl context pointer.
     * @param {string} name - Extension name.
     * @returns {any} -
     */
    static getExtension(gl: WebGLRenderingContext | WebGL2RenderingContext | null, name: string): any | undefined;
    /**
     * Returns a drawing context on the canvas, or null if the context identifier is not supported.
     * @param {HTMLCanvasElement} canvas - HTML canvas object.
     * @param {any} [contextAttributes] - See canvas.getContext contextAttributes.
     * @returns {WebGLContextExt | null} -
     */
    static getContext(canvas: HTMLCanvasElement, contextAttributes?: any): WebGLContextExt | null;
    /**
     * Sets animation frame function.
     * @public
     * @param {Function} callback - Frame callback.
     */
    setFrameCallback(callback: Function): void;
    /**
     * Creates empty texture.
     * @public
     * @param {number} [width=1] - Specifies the width of the texture image.
     * @param {number} [height=1] - Specifies the width of the texture image.
     * @param {string} [filter="NEAREST"] - Specifies GL_TEXTURE_MIN(MAX)_FILTER texture value.
     * @param {string} [internalFormat="RGBA"] - Specifies the color components in the texture.
     * @param {string} [format="RGBA"] - Specifies the format of the texel data.
     * @param {string} [type="UNSIGNED_BYTE"] - Specifies the data type of the texel data.
     * @param {number} [level=0] - Specifies the level-of-detail number. Level 0 is the base image level. Level n is the nth mipmap reduction image.
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createEmptyTexture2DExt(width?: number, height?: number, filter?: string, internalFormat?: string, format?: string, type?: string, level?: number): WebGLTexture | null;
    /**
     * Creates Empty NEAREST filtered texture.
     * @public
     * @param {number} width - Empty texture width.
     * @param {number} height - Empty texture height.
     * @param {number} [internalFormat]
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createEmptyTexture_n(width: number, height: number, internalFormat?: number): WebGLTexture | null;
    /**
     * Creates empty LINEAR filtered texture.
     * @public
     * @param {number} width - Empty texture width.
     * @param {number} height - Empty texture height.
     * @param {number} [internalFormat]
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createEmptyTexture_l(width: number, height: number, internalFormat?: number): WebGLTexture | null;
    /**
     * Creates NEAREST filter texture.
     * @public
     * @param {HTMLCanvasElement | Image} image - Image or Canvas object.
     * @param {number} [internalFormat]
     * @param {WebGLTexture | null} [texture=null]
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createTexture_n_webgl1(image: ImageSource, internalFormat?: number, texture?: WebGLTexture | null): WebGLTexture | null;
    /**
     * Creates LINEAR filter texture.
     * @public
     * @param {ImageSource} image - Image or Canvas object.
     * @param {number} [internalFormat]
     * @param {WebGLTexture | null} [texture]
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createTexture_l_webgl1(image: ImageSource, internalFormat?: number, texture?: WebGLTexture | null): WebGLTexture | null;
    /**
     * Creates MIPMAP filter texture.
     * @public
     * @param {ImageSource} image - Image or Canvas object.
     * @param {number} [internalFormat]
     * @param {WebGLTexture | null} [texture]
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createTexture_mm_webgl1(image: ImageSource, internalFormat?: number, texture?: WebGLTexture | null): WebGLTexture | null;
    /**
     * Creates ANISOTROPY filter texture.
     * @public
     * @param {ImageSource} image - Image or Canvas object.
     * @param {number} [internalFormat]
     * @param {WebGLTexture | null} [texture]
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createTexture_a_webgl1(image: ImageSource, internalFormat?: number, texture?: WebGLTexture | null): WebGLTexture | null;
    /**
     * Creates NEAREST filter texture.
     * @public
     * @param {ImageSource} image - Image or Canvas object.
     * @param {number} [internalFormat]
     * @param {WebGLTexture | null} [texture]
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createTexture_n_webgl2(image: ImageSource, internalFormat?: number, texture?: WebGLTexture | null): WebGLTexture | null;
    /**
     * Creates LINEAR filter texture.
     * @public
     * @param {ImageSource} image - Image or Canvas object.
     * @param {number} [internalFormat]
     * @param {WebGLTexture | null} [texture]
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createTexture_l_webgl2(image: ImageSource, internalFormat?: number, texture?: WebGLTexture | null): WebGLTexture | null;
    /**
     * Creates MIPMAP filter texture.
     * @public
     * @param {ImageSource} image - Image or Canvas object.
     * @param {number} [internalFormat]
     * @param {WebGLTexture | null} [texture]
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createTexture_mm_webgl2(image: ImageSource, internalFormat?: number, texture?: WebGLTexture | null): WebGLTexture | null;
    /**
     * Creates ANISOTROPY filter texture.
     * @public
     * @param {ImageSource} image - Image or Canvas object.
     * @param {number} [internalFormat]
     * @param {WebGLTexture | null} [texture]
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    createTexture_a_webgl2(image: ImageSource, internalFormat?: number, texture?: WebGLTexture | null): WebGLTexture | null;
    /**
     * Creates cube texture.
     * @public
     * @param {Texture3DParams} params - Face image urls:
     * @param {string} params.px - Positive X or right image url.
     * @param {string} params.nx - Negative X or left image url.
     * @param {string} params.py - Positive Y or up image url.
     * @param {string} params.ny - Negative Y or bottom image url.
     * @param {string} params.pz - Positive Z or face image url.
     * @param {string} params.nz - Negative Z or back image url.
     * @returns {WebGLTexture | null} - WebGL texture object.
     */
    loadCubeMapTexture(params: Texture3DParams): WebGLTexture | null;
    /**
     * Adds shader program to the handler.
     * @public
     * @param {Program} program - Shader program.
     * @param {boolean} [notActivate] - If it's true program will not compile.
     * @return {Program} -
     */
    addProgram(program: Program, notActivate?: boolean): Program;
    /**
     * Removes shader program from handler.
     * @public
     * @param {string} name - Shader program name.
     */
    removeProgram(name: string): void;
    /**
     * Adds shader programs to the handler.
     * @public
     * @param {Array.<Program>} programsArr - Shader program array.
     */
    addPrograms(programsArr: Program[]): void;
    /**
     * Used in addProgram
     * @protected
     * @param {ProgramController} sc - Program controller
     */
    protected _initProgramController(sc: ProgramController): void;
    /**
     * Used in init function.
     * @private
     */
    protected _initPrograms(): void;
    /**
     * Initialize additional WebGL extensions.
     * @public
     * @param {string} extensionStr - Extension name.
     * @param {boolean} showLog - Show logging.
     * @return {any} -
     */
    initializeExtension(extensionStr: string, showLog?: boolean): any;
    /**
     * Main function that initialize handler.
     * @public
     */
    initialize(): void;
    protected _toggleVisibilityChange(visibility: boolean): void;
    /**
     * Sets default gl render parameters. Used in init function.
     * @protected
     */
    protected _setDefaults(): void;
    getCanvasSize(): NumberArray2;
    /**
     * Creates STREAM_DRAW ARRAY buffer.
     * @public
     * @param {number} itemSize - Array item size.
     * @param {number} numItems - Items quantity.
     * @param {number} [usage=STATIC_DRAW] - Parameter of the bufferData call can be one of STATIC_DRAW, DYNAMIC_DRAW, or STREAM_DRAW.
     * @param {number} [bytes=4] -
     * @return {WebGLBufferExt} -
     */
    createStreamArrayBuffer(itemSize: number, numItems: number, usage?: number, bytes?: number): WebGLBufferExt;
    /**
     * Sets stream buffer.
     * @public
     * @param {WebGLBufferExt} buffer -
     * @param {TypedArray} array -
     * @param {number} [offset=0] -
     * @return {WebGLBufferExt} -
     */
    setStreamArrayBuffer(buffer: WebGLBufferExt, array: TypedArray, offset?: number): WebGLBufferExt;
    /**
     * Creates ARRAY buffer.
     * @public
     * @param {TypedArray} array - Input array.
     * @param {number} itemSize - Array item size.
     * @param {number} numItems - Items quantity.
     * @param {number} [usage=STATIC_DRAW] - Parameter of the bufferData call can be one of STATIC_DRAW, DYNAMIC_DRAW, or STREAM_DRAW.
     * @return {WebGLBufferExt} -
     */
    createArrayBuffer(array: TypedArray, itemSize: number, numItems: number, usage?: number): WebGLBufferExt;
    /**
     * Creates ARRAY buffer specific length.
     * @public
     * @param {number} size -
     * @param {number} [usage=STATIC_DRAW] - Parameter of the bufferData call can be one of STATIC_DRAW, DYNAMIC_DRAW, or STREAM_DRAW.
     * @return {WebGLBufferExt} -
     */
    createArrayBufferLength(size: number, usage?: number): WebGLBufferExt;
    /**
     * Creates ELEMENT ARRAY buffer.
     * @public
     * @param {TypedArray} array - Input array.
     * @param {number} itemSize - Array item size.
     * @param {number} numItems - Items quantity.
     * @param {number} [usage=STATIC_DRAW] - Parameter of the bufferData call can be one of STATIC_DRAW, DYNAMIC_DRAW, or STREAM_DRAW.
     * @return {Object} -
     */
    createElementArrayBuffer(array: TypedArray, itemSize: number, numItems?: number, usage?: number): WebGLBufferExt;
    /**
     * Sets handler canvas size.
     * @public
     * @param {number} w - Canvas width.
     * @param {number} h - Canvas height.
     */
    setSize(w: number, h: number): void;
    get pixelRatio(): number;
    set pixelRatio(pr: number);
    /**
     * Returns context screen width.
     * @public
     * @returns {number} -
     */
    getWidth(): number;
    /**
     * Returns context screen height.
     * @public
     * @returns {number} -
     */
    getHeight(): number;
    /**
     * Returns canvas aspect ratio.
     * @public
     * @returns {number} -
     */
    getClientAspect(): number;
    /**
     * Returns canvas center coordinates.
     * @public
     * @returns {number} -
     */
    getCenter(): Vec2;
    /**
     * Draw single frame.
     * @public
     */
    drawFrame: () => void;
    /**
     * Clearing gl frame.
     * @public
     */
    clearFrame(): void;
    /**
     * Starts animation loop.
     * @public
     */
    start(): void;
    stop(): void;
    isStopped(): boolean;
    /**
     * Check is gl context type equals webgl2
     * @public
     */
    isWebGl2(): boolean;
    /**
     * Make animation.
     * @protected
     */
    protected _animationFrameCallback(): void;
    /**
     * Creates default texture object
     * @public
     * @param {IDefaultTextureParams | null} params - Texture parameters:
     * @param {(texture: WebGLTextureExt) => void} [success] - Creation callback
     */
    createDefaultTexture(params: IDefaultTextureParams | null, success: (texture: WebGLTextureExt) => void): void;
    deleteTexture(texture: WebGLTextureExt | null | undefined): void;
    /**
     * @public
     */
    destroy(): void;
    addClock(clock: Clock): void;
    addClocks(clockArr: Clock[]): void;
    removeClock(clock: Clock): void;
}
export { Handler };
