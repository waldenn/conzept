import { Handler, WebGLBufferExt } from "./Handler";
import { Program } from "./Program";
/**
 * This is shader program controller that used by handler object to access the shader
 * program capabilities, like switching program during the rendering.
 * Get access to the program from ...handler.programs.<program name> etc.
 * @class
 * @param {Handler} handler - Handler.
 * @param {Program} program - Shader program.
 */
export declare class ProgramController {
    /**
     * Handler.
     * @protected
     * @type {Handler}
     */
    protected _handler: Handler;
    /**
     * Shader program.
     * @public
     * @type {Program}
     */
    _program: Program;
    /**
     * Program current frame activation flag.
     * @public
     * @type {boolean}
     */
    _activated: boolean;
    constructor(handler: Handler, program: Program);
    /**
     * Lazy create program call.
     * @public
     */
    initialize(): void;
    /**
     * Returns controller's shader program.
     * @public
     * @return {Program} -
     */
    getProgram(): Program;
    /**
     * Activates current shader program.
     * @public
     * @returns {ProgramController} -
     */
    activate(): this;
    /**
     * Remove program from handler
     * @public
     */
    remove(): void;
    /**
     * Deactivate shader program. This is not necessary while activate function used.
     * @public
     */
    deactivate(): void;
    /**
     * Returns program activity.
     * @public
     * @return {boolean} -
     */
    isActive(): boolean;
    /**
     * Sets program uniforms and attributes values and return controller instance.
     * @public
     * @param {Record<string, any>} params - Object with variable name and value like { value: 12, someArray:[1,2,3], uSampler: texture,... }
     * @return {ProgramController} -
     */
    set(params: Record<string, any>): this;
    /**
     * Draw index buffer with this program.
     * @public
     * @param {number} mode - Gl draw mode
     * @param {WebGLBuffer} buffer - Buffer to draw.
     * @return {ProgramController} Returns current shader controller instance.
     */
    drawIndexBuffer(mode: number, buffer: WebGLBufferExt): ProgramController;
    /**
     * Calls Gl drawArray function.
     * @param {number} mode - Gl draw mode.
     * @param {number} numItems - draw items count.
     * @return {ProgramController} Returns current shader controller instance.
     */
    drawArrays(mode: number, numItems: number): ProgramController;
}
