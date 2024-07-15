import { Vec3 } from "./Vec3";
import { Line3 } from "./Line3";
/**
 * Plane class.
 * @constructor
 * @param {Vec3} [p] - Plane point.
 * @param {Vec3} [n] - Planet normal.
 */
declare class Plane {
    p: Vec3;
    n: Vec3;
    constructor(p: Vec3, n: Vec3);
    set(p: Vec3, n: Vec3): void;
    getNormal(): Vec3;
    distance(p: Vec3): number;
    getProjection(v: Vec3, def?: Vec3): Vec3;
    getProjectionPoint(p: Vec3, vh?: Vec3): Vec3;
    getIntersection(Pn1: Plane, Pn2: Plane, L: Line3): number;
}
export { Plane };
