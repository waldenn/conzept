import { BaseFramebuffer, IBaseFramebufferParams } from "./BaseFramebuffer";
import { Handler } from "./Handler";
export interface IFrameBufferParams extends IBaseFramebufferParams {
    isBare?: boolean;
    format?: string | string[];
    type?: string | string[];
    attachment?: string | string[];
    renderbufferTarget?: string;
    textures?: WebGLTexture[];
}
/**
 * Class represents framebuffer.
 * @class
 * @param {Handler} handler - WebGL handler.
 * @param {IFrameBufferParams} [options] - Framebuffer options:
 */
export declare class Framebuffer extends BaseFramebuffer {
    protected _isBare: boolean;
    protected _internalFormatArr: string[];
    protected _formatArr: string[];
    protected _typeArr: string[];
    protected _attachmentArr: string[];
    protected _renderbufferTarget: string;
    /**
     * Framebuffer texture.
     * @public
     * @type {number}
     */
    textures: WebGLTexture[];
    constructor(handler: Handler, options?: IFrameBufferParams);
    destroy(): void;
    /**
     * Framebuffer initialization.
     * @public
     * @override
     */
    init(): void;
    /**
     * Bind buffer texture.
     * @public
     * @param {WebGLTexture} texture - Output texture.
     * @param {number} [glAttachment=0] - color attachment index.
     */
    bindOutputTexture(texture: WebGLTexture, glAttachment?: number): void;
    /**
     * Gets pixel RGBA color from framebuffer by coordinates.
     * @public
     * @param {Uint8Array} res - Normalized x - coordinate.
     * @param {number} nx - Normalized x - coordinate.
     * @param {number} ny - Normalized y - coordinate.
     * @param {number} [w=1] - Normalized width.
     * @param {number} [h=1] - Normalized height.
     * @param {number} [index=0] - color attachment index.
     */
    readPixels(res: Uint8Array, nx: number, ny: number, index?: number, w?: number, h?: number): void;
    /**
     * Reads all pixels(RGBA colors) from framebuffer.
     * @public
     * @param {Uint8Array} res - Result array.
     * @param {number} [attachmentIndex=0] - color attachment index.
     */
    readAllPixels(res: Uint8Array, attachmentIndex?: number): void;
    /**
     * Gets JavaScript image that in the framebuffer.
     * @public
     * @returns {HTMLImageElement} -
     */
    getImage(): HTMLImageElement;
}
