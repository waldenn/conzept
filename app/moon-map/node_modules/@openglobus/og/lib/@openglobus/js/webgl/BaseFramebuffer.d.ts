import { Handler } from "./Handler";
export interface IBaseFramebufferParams {
    internalFormat?: string | string[];
    width?: number;
    height?: number;
    useDepth?: boolean;
    depthComponent?: string;
    size?: number;
    filter?: string;
}
export declare class BaseFramebuffer {
    handler: Handler;
    _fbo: WebGLFramebuffer | null;
    protected _depthRenderbuffer: WebGLRenderbuffer | null;
    _width: number;
    _height: number;
    protected _depthComponent: string;
    protected _size: number;
    protected _active: boolean;
    protected _useDepth: boolean;
    protected _filter: string;
    constructor(handler: Handler, options?: IBaseFramebufferParams);
    get width(): number;
    get height(): number;
    /**
     * Sets framebuffer viewport size.
     * @public
     * @param {number} width - Framebuffer width.
     * @param {number} height - Framebuffer height.
     * @param {boolean} [forceDestroy] -
     */
    setSize(width: number, height: number, forceDestroy?: boolean): void;
    init(): void;
    destroy(): void;
    /**
     * Returns framebuffer completed.
     * @public
     * @returns {boolean} -
     */
    isComplete(): boolean;
    checkStatus(): number;
    /**
     * Activate framebuffer frame to draw.
     * @public
     * @returns {Framebuffer} Returns Current framebuffer.
     */
    activate(): this;
    /**
     * Deactivate framebuffer frame.
     * @public
     */
    deactivate(): void;
}
