import { ProgramVariable } from "./variableHandlers";
import { WebGLBufferExt } from "./Handler";
type WebGLProgramExt = WebGLProgram & {
    [id: string]: WebGLUniformLocation;
};
type ProgramMaterial = {
    attributes: Record<string, any>;
    uniforms: Record<string, any>;
    vertexShader: string;
    fragmentShader: string;
};
/**
 * Represents more comfortable using WebGL shader program.
 * @class
 * @param {string} name - Program name.
 * @param {ProgramMaterial} material - Object stores uniforms, attributes and program codes:
 * @param {Record<string, any>} material.uniforms - Uniforms definition section.
 * @param {Record<string, any>} material.attributes - Attributes definition section.
 * @param {string} material.vertexShader - Vertex glsl code.
 * @param {string} material.fragmentShader - Fragment glsl code.
 */
declare class Program {
    /**
     * Shader program name.
     * @public
     * @type {string}
     */
    name: string;
    attributes: {
        [id: string]: number;
    };
    uniforms: {
        [id: string]: WebGLUniformLocation;
    };
    _attributes: Record<string, ProgramVariable>;
    _uniforms: Record<string, ProgramVariable>;
    vertexShader: string;
    fragmentShader: string;
    drawElementsInstanced: Function | null;
    vertexAttribDivisor: Function | null;
    /**
     * Webgl context.
     * @public
     * @type {WebGL2RenderingContext | null}
     */
    gl: WebGL2RenderingContext | null;
    /**
     * All program variables.
     * @private
     * @type {Record<string, ProgramVariable>}
     */
    protected _variables: Record<string, ProgramVariable>;
    /**
     * Program pointer.
     * @private
     * @type {WebGLProgramExt | null}
     */
    _p: WebGLProgramExt | null;
    /**
     * Texture counter.
     * @protected
     * @type {number}
     */
    _textureID: number;
    /**
     * Program attributes array.
     * @private
     * @type {number[]}
     */
    protected _attribArrays: number[];
    /**
     * Program attributes divisors.
     * @protected
     * @type {number[]}
     */
    protected _attribDivisor: number[];
    constructor(name: string, material: ProgramMaterial);
    /**
     * Bind program buffer.
     * @function
     * @param {Program} program - Used program.
     * @param {Object} variable - Variable represents buffer data.
     */
    static bindBuffer(program: Program, variable: ProgramVariable): void;
    /**
     * Sets the current program frame.
     * @public
     */
    use(): void;
    /**
     * Sets program variables.
     * @public
     * @param {Object} material - Variables and values object.
     */
    set(material: Record<string, any>): void;
    /**
     * Apply current variables.
     * @public
     */
    apply(): void;
    /**
     * Calls drawElements index buffer function.
     * @public
     * @param {number} mode - Draw mode(GL_TRIANGLES, GL_LINESTRING etc.).
     * @param {Object} buffer - Index buffer.
     */
    drawIndexBuffer(mode: number, buffer: WebGLBufferExt): void;
    /**
     * Calls drawArrays function.
     * @public
     * @param {number} mode - Draw mode GL_TRIANGLES, GL_LINESTRING, etc.
     * @param {number} numItems - Items to draw
     */
    drawArrays(mode: number, numItems: number): void;
    /**
     * Check and log for a shader compile errors and warnings. Returns True - if no errors otherwise returns False.
     * @private
     * @param {WebGLShader} shader - WebGl shader program.
     * @param {string} src - Shader program source.
     * @returns {boolean} -
     */
    protected _getShaderCompileStatus(shader: WebGLShader, src: string): boolean;
    /**
     * Returns compiled vertex shader program pointer.
     * @private
     * @param {string} src - Vertex shader source code.
     * @returns {Object} -
     */
    protected _createVertexShader(src: string): WebGLShader | undefined;
    /**
     * Returns compiled fragment shader program pointer.
     * @private
     * @param {string} src - Vertex shader source code.
     * @returns {Object} -
     */
    protected _createFragmentShader(src: string): WebGLShader | undefined;
    /**
     * Disable current program vertexAttribArrays.
     * @public
     */
    disableAttribArrays(): void;
    /**
     * Enable current program vertexAttribArrays.
     * @public
     */
    enableAttribArrays(): void;
    /**
     * Delete program.
     * @public
     */
    delete(): void;
    /**
     * Creates program.
     * @public
     * @param {Object} gl - WebGl context.
     */
    createProgram(gl: WebGL2RenderingContext): void;
}
export { Program };
