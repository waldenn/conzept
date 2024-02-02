import { Box } from "../bv/Box";
import { Sphere } from "../bv/Sphere";
import { Vec3 } from "./Vec3";
/**
 * Represents a ray that extends infinitely from the provided origin in the provided direction.
 * @class
 * @param {Vec3} origin - The origin of the ray.
 * @param {Vec3} direction - The direction of the ray.
 */
export declare class Ray {
    /**
     * The origin of the ray.
     * @public
     * @type {Vec3}
     */
    origin: Vec3;
    /**
     * The direction of the ray.
     * @public
     * @type {Vec3}
     */
    direction: Vec3;
    constructor(origin?: Vec3, direction?: Vec3);
    /** @const */
    static get OUTSIDE(): number;
    /** @const */
    static get INSIDE(): number;
    /** @const */
    static get INPLANE(): number;
    /** @const */
    static get AWAY(): number;
    /**
     * Sets a ray parameters.
     * @public
     * @param {Vec3} origin - The origin of the ray.
     * @param {Vec3} direction - The direction of the ray.
     * @returns {Ray}
     */
    set(origin: Vec3, direction: Vec3): Ray;
    /**
     * Computes the point along the ray on the distance.
     * @public
     * @param {number} distance - Point distance.
     * @returns {Vec3}
     */
    getPoint(distance: number): Vec3;
    /**
     * Returns ray hit a triange result.
     * @public
     * @param {Vec3} v0 - First triangle corner coordinate.
     * @param {Vec3} v1 - Second triangle corner coordinate.
     * @param {Vec3} v2 - Third triangle corner coordinate.
     * @param {Vec3} res - Hit point object pointer that stores hit result.
     * @returns {number} - Hit code, could 0 - og.Ray.OUTSIDE, 1 - og.Ray.INSIDE,
     *      2 - og.Ray.INPLANE and 3 - og.Ray.AWAY(ray goes away from triangle).
     */
    hitTriangle(v0: Vec3, v1: Vec3, v2: Vec3, res: Vec3): number;
    /**
     * Gets a ray hit a plane result. If the ray cross the plane returns 1 - og.Ray.INSIDE otherwise returns 0 - og.Ray.OUTSIDE.
     * @public
     * @param {Vec3} v0 - First plane point.
     * @param {Vec3} v1 - Second plane point.
     * @param {Vec3} v2 - Third plane point.
     * @param {Vec3} res - Hit point object pointer that stores hit result.
     * @returns {number}
     */
    hitPlane(v0: Vec3, v1: Vec3, v2: Vec3, res: Vec3): number;
    /**
     * Returns a ray hit sphere coordiante. If there isn't hit returns null.
     * @public
     * @param {Sphere} sphere - Sphere object.
     * @returns {Vec3}
     */
    hitSphere(sphere: Sphere): Vec3 | null;
    hitBox(box: Box): void;
}
