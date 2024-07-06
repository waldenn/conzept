import { Box } from "../bv/Box";
import { Mat4, NumberArray16 } from "../math/Mat4";
import { NumberArray4 } from "../math/Vec4";
import { Sphere } from "../bv/Sphere";
import { Vec3 } from "../math/Vec3";
interface IFrustumParams {
    cameraFrustumIndex?: number;
    fov?: number;
    aspect?: number;
    near?: number;
    far?: number;
}
/**
 * Frustum object, part of the camera object.
 * @class
 * @param {*} options
 */
declare class Frustum {
    protected _f: [NumberArray4, NumberArray4, NumberArray4, NumberArray4, NumberArray4, NumberArray4];
    /**
     * Camera projection matrix.
     * @protected
     * @type {Mat4}
     */
    projectionMatrix: Mat4;
    /**
     * Camera inverse projection matrix.
     * @protected
     * @type {Mat4}
     */
    inverseProjectionMatrix: Mat4;
    /**
     * Product of projection and view matrices.
     * @protected
     * @type {Mat4}
     */
    projectionViewMatrix: Mat4;
    /**
     * Inverse projectionView Matrix.
     * @protected
     * @type {Mat4}
     */
    inverseProjectionViewMatrix: Mat4;
    /**
     * Projection frustum left value.
     * @public
     */
    left: number;
    /**
     * Projection frustum right value.
     * @public
     */
    right: number;
    /**
     * Projection frustum bottom value.
     * @public
     */
    bottom: number;
    /**
     * Projection frustum top value.
     * @public
     */
    top: number;
    /**
     * Projection frustum near value.
     * @public
     */
    near: number;
    /**
     * Projection frustum far value.
     * @public
     */
    far: number;
    cameraFrustumIndex: number;
    _pickingColorU: Float32Array;
    constructor(options?: IFrustumParams);
    getRightPlane(): NumberArray4;
    getLeftPlane(): NumberArray4;
    getBottomPlane(): NumberArray4;
    getTopPlane(): NumberArray4;
    getBackwardPlane(): NumberArray4;
    getForwardPlane(): NumberArray4;
    getProjectionViewMatrix(): NumberArray16;
    getProjectionMatrix(): NumberArray16;
    getInverseProjectionMatrix(): NumberArray16;
    /**
     * Sets up camera projection matrix.
     * @public
     * @param {number} angle - Camera's view angle.
     * @param {number} aspect - Screen aspect ratio.
     * @param {number} near - Near camera distance.
     * @param {number} far - Far camera distance.
     */
    setProjectionMatrix(angle: number, aspect: number, near: number, far: number): void;
    /**
     * Camera's projection matrix values.
     * @public
     * @param {Mat4} viewMatrix - View matrix.
     */
    setViewMatrix(viewMatrix: Mat4): void;
    /**
     * Returns true if a point in the frustum.
     * @public
     * @param {Vec3} point - Cartesian point.
     * @returns {boolean} -
     */
    containsPoint(point: Vec3): boolean;
    /**
     * Returns true if the frustum contains a bonding sphere, but bottom plane exclude.
     * @public
     * @param {Sphere} sphere - Bounding sphere.
     * @returns {boolean} -
     */
    containsSphereBottomExc(sphere: Sphere): boolean;
    containsSphereButtom(sphere: Sphere): boolean;
    /**
     * Returns true if the frustum contains a bonding sphere.
     * @public
     * @param {Sphere} sphere - Bounding sphere.
     * @returns {boolean} -
     */
    containsSphere(sphere: Sphere): boolean;
    /**
     * Returns true if the frustum contains a bonding sphere.
     * @public
     * @param {Vec3} center - Sphere center.
     * @param {number} radius - Sphere radius.
     * @returns {boolean} -
     */
    containsSphere2(center: Vec3, radius: number): boolean;
    /**
     * Returns true if the frustum contains a bounding box.
     * @public
     * @param {Box} box - Bounding box.
     * @returns {boolean} -
     */
    containsBox(box: Box): boolean;
}
export { Frustum };
