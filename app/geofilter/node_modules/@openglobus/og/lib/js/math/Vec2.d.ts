import { Vec3 } from "./Vec3";
export type NumberArray2 = [number, number];
/**
 * Class represents a 3d vector.
 * @class
 * @param {number} [x] - First value.
 * @param {number} [y] - Second value.
 */
export declare class Vec2 {
    /**
     * @public
     * @type {number}
     */
    x: number;
    /**
     * @public
     * @type {number}
     */
    y: number;
    constructor(x?: number, y?: number);
    /** @const */
    static get UP(): Vec2;
    /** @const */
    static get DOWN(): Vec2;
    /** @const */
    static get RIGHT(): Vec2;
    /** @const */
    static get LEFT(): Vec2;
    /** @const */
    static get ZERO(): Vec2;
    /**
     * Returns summary vector.
     * @static
     * @param {Vec2} a - First vector.
     * @param {Vec2} b - Second vector.
     * @returns {Vec2} - Summary vector.
     */
    static add(a: Vec2, b: Vec2): Vec2;
    /**
     * Returns two vectors subtraction.
     * @static
     * @param {Vec2} a - First vector.
     * @param {Vec2} b - Second vector.
     * @returns {Vec2} - Vectors subtraction.
     */
    static sub(a: Vec2, b: Vec2): Vec2;
    /**
     * Returns scaled vector.
     * @static
     * @param {Vec2} a - Input vector.
     * @param {number} scale - Scale value.
     * @returns {Vec2}
     */
    static scale(a: Vec2, scale: number): Vec2;
    /**
     * Returns two vectors production.
     * @static
     * @param {Vec2} a - First vector.
     * @param {Vec2} b - Second vector.
     * @returns {Vec2}
     */
    static mul(a: Vec2, b: Vec2): Vec2;
    /**
     * Returns vector components division product one to another.
     * @static
     * @param {Vec2} a - First vector.
     * @param {Vec2} b - Second vector.
     * @returns {Vec2}
     */
    static div(a: Vec2, b: Vec2): Vec2;
    /**
     * Get projection of the first vector to the second.
     * @static
     * @param {Vec2} b - First vector.
     * @param {Vec2} a - Second vector.
     * @returns {Vec2}
     */
    static proj_b_to_a(b: Vec2, a: Vec2): Vec2;
    /**
     * Gets angle between two vectors.
     * @static
     * @param {Vec2} a - First vector.
     * @param {Vec2} b - Second vector.
     * @returns {number}
     */
    static angle(a: Vec2, b: Vec2): number;
    /**
     * Makes vectors normalized and orthogonal to each other.
     * @static
     * @param {Vec2} normal - Normal vector.
     * @param {Vec2} tangent - Tangent vector.
     * @returns {Vec2}
     */
    static orthoNormalize(normal: Vec2, tangent: Vec2): Vec2;
    /**
     * Converts to 3d vector, third value is 0.0.
     * @public
     * @returns {Vec3}
     */
    toVector3(): Vec3;
    /**
     * Returns clone vector.
     * @public
     * @returns {Vec2}
     */
    clone(): Vec2;
    /**
     * Compares with vector. Returns true if it equals another.
     * @public
     * @param {Vec2} p - Vector to compare.
     * @returns {boolean}
     */
    equal(p: Vec2): boolean;
    /**
     * Copy input vector's values.
     * @param {Vec2} point2 - Vector to copy.
     * @returns {Vec2}
     */
    copy(point2: Vec2): Vec2;
    /**
     * Gets vector's length.
     * @public
     * @returns {number}
     */
    length(): number;
    /**
     * Returns squared vector's length.
     * @public
     * @returns {number}
     */
    length2(): number;
    /**
     * Adds vector to the current.
     * @public
     * @param {Vec2}
     * @returns {Vec2}
     */
    addA(v: Vec2): Vec2;
    /**
     * Summarize two vectors.
     * @public
     * @param {Vec2}
     * @returns {Vec2}
     */
    add(v: Vec2): Vec2;
    /**
     * Subtract vector from the current where results saved on the current instance.
     * @public
     * @param {Vec2} v - Subtract vector.
     * @returns {Vec2}
     */
    subA(v: Vec2): Vec2;
    /**
     * Subtract vector from the current.
     * @public
     * @param {Vec2} v - Subtract vector.
     * @returns {Vec2}
     */
    sub(v: Vec2): Vec2;
    /**
     * Scale current vector.
     * @public
     * @param {number} scale - Scale value.
     * @returns {Vec2}
     */
    scale(scale: number): Vec2;
    /**
     * Scale current vector to another instance.
     * @public
     * @param {number} scale - Scale value.
     * @returns {Vec2}
     */
    scaleTo(scale: number): Vec2;
    /**
     * Multiply current vector object to another and store result in the current instance.
     * @public
     * @param {Vec2} vec - Multiply vector.
     * @returns {Vec2}
     */
    mulA(vec: Vec2): Vec2;
    /**
     * Multiply current vector object to another and returns new vector instance.
     * @public
     * @param {Vec2} vec - Multiply vector.
     * @returns {Vec2}
     */
    mul(vec: Vec2): Vec2;
    /**
     * Divide current vector's components to another. Results stores in the current vector object.
     * @public
     * @param {Vec2}
     * @returns {Vec2}
     */
    divA(vec: Vec2): Vec2;
    /**
     * Gets vectors dot production.
     * @public
     * @param {Vec2} v - Another vector.
     * @returns {number}
     */
    dot(v: Vec2): number;
    /**
     * Gets vectors dot production.
     * @public
     * @param {Array.<number>} arr - Array vector. (exactly 2 entries)
     * @returns {number}
     */
    dotArr(arr: NumberArray2): number;
    /**
     * Gets vectors cross production.
     * @public
     * @param {Vec2} v - Another vector.
     * @returns {number}
     */
    cross(v: Vec2): number;
    /**
     * Sets vector to zero.
     * @public
     * @returns {Vec2}
     */
    clear(): Vec2;
    /**
     * Returns normalized vector.
     * @public
     * @returns {Vec2}
     */
    normal(): Vec2;
    /**
     * Normalize current vector.
     * @public
     * @returns {Vec2}
     */
    normalize(): Vec2;
    /**
     * Converts vector to a number array.
     * @public
     * @returns {Array.<number>} - (exactly 2 entries)
     */
    toVec(): NumberArray2;
    /**
     * Gets distance to point.
     * @public
     * @param {Vec2} p - Distant point.
     * @returns {number}
     */
    distance(p: Vec2): number;
    /**
     * Sets vector's values.
     * @public
     * @param {number} x - Value X.
     * @param {number} y - Value Y.
     * @returns {Vec2}
     */
    set(x: number, y: number): Vec2;
    /**
     * Negate current vector.
     * @public
     * @returns {Vec2}
     */
    negate(): Vec2;
    /**
     * Negate current vector to another instance.
     * @public
     * @returns {Vec2}
     */
    negateTo(): Vec2;
    /**
     * Gets projected point coordinates of the current vector on the ray.
     * @public
     * @param {Vec2} pos - Ray position.
     * @param {Vec2} direction - Ray direction.
     * @returns {Vec2}
     */
    projToRay(pos: Vec2, direction: Vec2): Vec2;
    /**
     * Gets angle between two vectors.
     * @public
     * @param {Vec2} a - Another vector.
     * @returns {number}
     */
    angle(a: Vec2): number;
    /**
     * Returns two vectors linear interpolation.
     * @public
     * @param {Vec2} v2 - End vector.
     * @param {number} l - Interpolate value.
     * @returns {Vec2}
     */
    lerp(v1: Vec2, v2: Vec2, l: number): Vec2;
    static get LERP_DELTA(): number;
    /**
     * Spherically interpolates between two vectors.
     * Interpolates between current and v2 vector by amount t. The difference between this and linear interpolation (aka, "lerp") is that
     * the vectors are treated as directions rather than points in space. The direction of the returned vector is interpolated
     * by the angle and its magnitude is interpolated between the magnitudes of from and to.
     * @public
     * @param {Vec2} v2
     * @param {number} t - The parameter t is clamped to the range [0, 1].
     * @returns {Vec2}
     */
    slerp(v2: Vec2, t: number): Vec2;
}
/**
 * Vector 2d object creator.
 * @function
 * @param {number} [x] - First cvalue.
 * @param {number} [y] - Second value.
 * @returns {Vec2}
 */
export declare function vec2(x?: number, y?: number): Vec2;
