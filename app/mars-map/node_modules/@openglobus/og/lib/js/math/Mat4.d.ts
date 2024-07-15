import { Mat3 } from "./Mat3";
import { Vec3 } from "./Vec3";
import { Vec4 } from "./Vec4";
export type NumberArray16 = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
/**
 * Class represents a 4x4 matrix.
 * @class
 */
export declare class Mat4 {
    /**
     * A 4x4 matrix, index-able as a column-major order array.
     * @public
     * @type {Array.<number>}
     */
    _m: NumberArray16;
    constructor();
    /**
     * Returns identity matrix instance.
     * @static
     * @returns {Mat4} -
     */
    static identity(): Mat4;
    /**
     * Sets column-major order array matrix.
     * @public
     * @param {Array.<number>} m - Matrix array.
     * @returns {Mat4} -
     */
    set(m: NumberArray16): Mat4;
    /**
     * Duplicates a Matrix3 instance.
     * @public
     * @returns {Mat4} -
     */
    clone(): Mat4;
    /**
     * Copy matrix.
     * @public
     * @param {Mat4} a - Matrix to copy.
     * @return {Mat4}
     */
    copy(a: Mat4): Mat4;
    /**
     * Converts to 3x3 matrix.
     * @public
     * @returns {Mat3} -
     */
    toMatrix3(): Mat3;
    /**
     * Multiply to 3d vector.
     * @public
     * @param {Vec3} p - 3d vector.
     * @returns {Vec3} -
     */
    mulVec3(p: Vec3): Vec3;
    /**
     * Multiply to 4d vector.
     * @public
     * @param {Vec4} p - 4d vector.
     * @returns {Vec4} -
     */
    mulVec4(p: Vec4): Vec4;
    /**
     * Creates an inverse 3x3 matrix of the current.
     * @public
     * @returns {Mat3} -
     */
    toInverseMatrix3(): Mat3 | undefined;
    /**
     * Creates an inverse matrix of the current.
     * @public
     * @returns {Mat4} -
     */
    inverseTo(res?: Mat4): Mat4;
    /**
     * Creates a transposed matrix of the current.
     * @public
     * @returns {Mat4} -
     */
    transposeTo(): Mat4;
    /**
     * Sets matrix to identity.
     * @public
     * @returns {Mat4} -
     */
    setIdentity(): Mat4;
    /**
     * Computes the product of two matrices.
     * @public
     * @param {Mat4} mx - Matrix to multiply.
     * @returns {Mat4} -
     */
    mul(mx: Mat4): Mat4;
    /**
     * Add translation vector to the current matrix.
     * @public
     * @param {Vec3} v - Translate vector.
     * @returns {Mat4} -
     */
    translate(v: Vec3): Mat4;
    /**
     * Sets translation matrix to the position.
     * @public
     * @param {Vec3} v - Translate to position.
     * @returns {Mat4} -
     */
    translateToPosition(v: Vec3): Mat4;
    /**
     * Rotate current matrix around the aligned axis and angle.
     * @public
     * @param {Vec3} u - Aligned axis.
     * @param {number} angle - Aligned axis angle in radians.
     * @returns {Mat4} -
     */
    rotate(u: Vec3, angle: number): Mat4;
    /**
     * Sets current rotation matrix around the aligned axis and angle.
     * @public
     * @param {Vec3} u - Aligned axis.
     * @param {number} angle - Aligned axis angle in radians.
     * @returns {Mat4} -
     */
    setRotation(u: Vec3, angle: number): Mat4;
    /**
     * Gets the rotation matrix from one vector to another.
     * @public
     * @param {Vec3} a - First vector.
     * @param {Vec3} b - Second vector.
     * @returns {Mat4} -
     */
    rotateBetweenVectors(a: Vec3, b: Vec3): Mat4;
    /**
     * Scale current matrix to the vector values.
     * @public
     * @param {Vec3} v - Scale vector.
     * @returns {Mat4} -
     */
    scale(v: Vec3): Mat4;
    /**
     * Sets perspective projection matrix frustum values.
     * @public
     * @param {number} left -
     * @param {number} right -
     * @param {number} bottom -
     * @param {number} top -
     * @param {number} near -
     * @param {number} far -
     * @returns {Mat4} -
     */
    setPerspective(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4;
    /**
     * Creates current orthographic projection matrix.
     * @public
     * @param {number} left -
     * @param {number} right -
     * @param {number} bottom -
     * @param {number} top -
     * @param {number} near -
     * @param {number} far -
     * @return {Mat4} -
     */
    setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4;
    /**
     * Sets current rotation matrix by euler's angles.
     * @public
     * @param {number} ax - Rotation angle in radians around X axis.
     * @param {number} ay - Rotation angle in radians around Y axis.
     * @param {number} az - Rotation angle in radians around Z axis.
     * @returns {Mat4} -
     */
    eulerToMatrix(ax: number, ay: number, az: number): Mat4;
}
/**
 * Mat4 factory.
 * @static
 * @returns {Mat4} -
 */
export declare function mat4(): Mat4;
