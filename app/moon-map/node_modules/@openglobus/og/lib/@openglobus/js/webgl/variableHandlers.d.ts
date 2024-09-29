/**
 * @module og/webgl/variableHandlers
 */
import { WebGLBufferExt } from "./Handler";
export type VariableHandler = {
    u: {
        [id: number]: Function;
    };
    a: {
        [id: number]: Function;
    };
};
export type ProgramVariable = {
    type: string | number;
    func: Function;
    _pName: WebGLUniformLocation | number;
    value: number | Float32Array | Int32Array | WebGLBufferExt;
    itemType: string | number;
    normalized: boolean;
    divisor: number;
};
export declare const variableHandlers: VariableHandler;
