import { EventsHandler } from "../Events";
import { Frustum } from "./Frustum";
import { Mat3, NumberArray9 } from "../math/Mat3";
import { Mat4, NumberArray16 } from "../math/Mat4";
import { Renderer } from "../renderer/Renderer";
import { Vec2, NumberArray2 } from "../math/Vec2";
import { Vec3 } from "../math/Vec3";
import { Sphere } from "../bv/Sphere";
type CameraEvents = ["viewchange", "moveend"];
export interface ICameraParams {
    eye?: Vec3;
    aspect?: number;
    viewAngle?: number;
    look?: Vec3;
    up?: Vec3;
    frustums?: NumberArray2[];
}
/**
 * Camera class.
 * @class
 * @param {Renderer} [renderer] - Renderer uses the camera instance.
 * @param {Object} [options] - Camera options:
 * @param {Object} [options.name] - Camera name.
 * @param {number} [options.viewAngle=47] - Camera angle of view. Default is 47.0
 * @param {number} [options.near=1] - Camera near plane distance. Default is 1.0
 * @param {number} [options.far=og.math.MAX] - Camera far plane distance. Default is og.math.MAX
 * @param {Vec3} [options.eye=[0,0,0]] - Camera eye position. Default (0,0,0)
 * @param {Vec3} [options.look=[0,0,0]] - Camera look position. Default (0,0,0)
 * @param {Vec3} [options.up=[0,1,0]] - Camera eye position. Default (0,1,0)
 *
 * @fires EventsHandler<CameraEvents>#viewchange
 * @fires EventsHandler<CameraEvents>#moveend
 */
declare class Camera {
    /**
     * Assigned renderer
     * @public
     * @type {Renderer}
     */
    renderer: Renderer | null;
    /**
     * Camera events handler
     * @public
     * @type {Events}
     */
    events: EventsHandler<CameraEvents>;
    /**
     * Camera position.
     * @public
     * @type {Vec3}
     */
    eye: Vec3;
    /**
     * Camera RTE high position
     * @public
     * @type {Float32Array}
     */
    eyeHigh: Float32Array;
    /**
     * Camera RTE low position
     * @public
     * @type {Float32Array}
     */
    eyeLow: Float32Array;
    /**
     * Aspect ratio.
     * @protected
     * @type {Number}
     */
    protected _aspect: number;
    /**
     * Camera view angle in degrees
     * @protected
     * @type {Number}
     */
    protected _viewAngle: number;
    /**
     * Camera view matrix.
     * @protected
     * @type {Mat4}
     */
    protected _viewMatrix: Mat4;
    /**
     * Camera normal matrix.
     * @protected
     * @type {Mat3}
     */
    protected _normalMatrix: Mat3;
    /**
     * Camera right vector.
     * @public
     * @type {Vec3}
     */
    _r: Vec3;
    /**
     * Camera up vector.
     * @public
     * @type {Vec3}
     */
    _u: Vec3;
    /**
     * Camera backward vector.
     * @public
     * @type {Vec3}
     */
    _b: Vec3;
    protected _pr: Vec3;
    protected _pu: Vec3;
    protected _pb: Vec3;
    protected _peye: Vec3;
    isMoving: boolean;
    protected _tanViewAngle_hrad: number;
    _tanViewAngle_hradOneByHeight: number;
    protected _projSizeConst: number;
    frustums: Frustum[];
    frustumColors: number[];
    FARTHEST_FRUSTUM_INDEX: number;
    currentFrustumIndex: number;
    isFirstPass: boolean;
    constructor(renderer: Renderer | null, options?: ICameraParams);
    checkMoveEnd(): void;
    bindRenderer(renderer: Renderer): void;
    /**
     * Camera initialization.
     * @public
     * @param {Object} [options] - Camera options:
     * @param {number} [options.viewAngle] - Camera angle of view.
     * @param {number} [options.near] - Camera near plane distance. Default is 1.0
     * @param {number} [options.far] - Camera far plane distance. Default is math.MAX
     * @param {Vec3} [options.eye] - Camera eye position. Default (0,0,0)
     * @param {Vec3} [options.look] - Camera look position. Default (0,0,0)
     * @param {Vec3} [options.up] - Camera eye position. Default (0,1,0)
     */
    protected _init(options: ICameraParams): void;
    getUp(): Vec3;
    getDown(): Vec3;
    getRight(): Vec3;
    getLeft(): Vec3;
    getForward(): Vec3;
    getBackward(): Vec3;
    /**
     * Updates camera view space
     * @public
     * @virtual
     */
    update(): void;
    /**
     * Refresh camera matrices
     * @public
     */
    refresh(): void;
    /**
     * Sets aspect ratio
     * @public
     * @param {Number} aspect - Camera aspect ratio
     */
    setAspectRatio(aspect: number): void;
    /**
     * Returns aspect ratio
     * @public
     * @returns {number} - Aspect ratio
     */
    getAspectRatio(): number;
    /**
     * Sets up camera projection
     * @public
     * @param {number} angle - Camera view angle
     * @param {number} aspect - Screen aspect ratio
     */
    protected _setProj(angle: number, aspect: number): void;
    /**
     * Sets camera view angle in degrees
     * @public
     * @param {number} angle - View angle
     */
    setViewAngle(angle: number): void;
    /**
     * Gets camera view angle in degrees
     * @public
     * @returns {number} angle -
     */
    getViewAngle(): number;
    get viewAngle(): number;
    /**
     * Sets camera to eye position
     * @public
     * @param {Vec3} eye - Camera position
     * @param {Vec3} look - Look point
     * @param {Vec3} up - Camera up vector
     * @returns {Camera} - This camera
     */
    set(eye: Vec3, look?: Vec3, up?: Vec3): this;
    /**
     * Sets camera look point
     * @public
     * @param {Vec3} look - Look point
     * @param {Vec3} [up] - Camera up vector otherwise camera current up vector(this._u)
     */
    look(look: Vec3, up?: Vec3): void;
    /**
     * Slides camera to vector d - (du, dv, dn)
     * @public
     * @param {number} du - delta X
     * @param {number} dv - delta Y
     * @param {number} dn - delta Z
     */
    slide(du: number, dv: number, dn: number): void;
    /**
     * Roll the camera to the angle in degrees
     * @public
     * @param {number} angle - Delta roll angle in degrees
     */
    roll(angle: number): void;
    /**
     * Pitch the camera to the angle in degrees
     * @public
     * @param {number} angle - Delta pitch angle in degrees
     */
    pitch(angle: number): void;
    /**
     * Yaw the camera to the angle in degrees
     * @public
     * @param {number} angle - Delta yaw angle in degrees
     */
    yaw(angle: number): void;
    /**
     * Returns normal vector direction to the unprojected screen point from camera eye
     * @public
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @returns {Vec3} - Direction vector
     */
    unproject(x: number, y: number): Vec3;
    /**
     * Gets projected 3d point to the 2d screen coordinates
     * @public
     * @param {Vec3} v - Cartesian 3d coordinates
     * @returns {Vec2} - Screen point coordinates
     */
    project(v: Vec3): Vec2;
    /**
     * Rotates camera around center point
     * @public
     * @param {number} angle - Rotation angle in radians
     * @param {boolean} [isArc] - If true camera up vector gets from current up vector every frame,
     * otherwise up is always input parameter.
     * @param {Vec3} [center] - Point that the camera rotates around
     * @param {Vec3} [up] - Camera up vector
     */
    rotateAround(angle: number, isArc?: boolean, center?: Vec3 | null, up?: Vec3 | null): void;
    /**
     * Rotates camera around center point by horizontal.
     * @public
     * @param {number} angle - Rotation angle in radians.
     * @param {boolean} [isArc] - If true camera up vector gets from current up vector every frame,
     * otherwise up is always input parameter.
     * @param {Vec3} [center] - Point that the camera rotates around.
     * @param {Vec3} [up] - Camera up vector.
     */
    rotateHorizontal(angle: number, isArc?: boolean, center?: Vec3 | null, up?: Vec3 | null): void;
    /**
     * Rotates camera around center point by vertical.
     * @param {number} angle - Rotation angle in radians.
     * @param {Vec3} [center] - Point that the camera rotates around.
     */
    rotateVertical(angle: number, center?: Vec3): void;
    /**
     * Gets 3d size factor. Uses in LOD distance calculation.
     * @public
     * @param {Vec3} p - Far point.
     * @param {Vec3} r - Far point.
     * @returns {number} - Size factor.
     */
    projectedSize(p: Vec3, r: number): number;
    /**
     * Returns model matrix.
     * @public
     * @returns {NumberArray16} - View matrix.
     */
    getViewMatrix(): NumberArray16;
    /**
     * Returns normal matrix.
     * @public
     * @returns {NumberArray9} - Normal matrix.
     */
    getNormalMatrix(): NumberArray9;
    setCurrentFrustum(k: number): void;
    getCurrentFrustum(): number;
    containsSphere(sphere: Sphere): boolean;
    get frustum(): Frustum;
    /**
     * Returns projection matrix.
     * @public
     * @returns {Mat4} - Projection matrix.
     */
    getProjectionMatrix(): NumberArray16;
    /**
     * Returns projection and model matrix product.
     * @public
     * @return {Mat4} - Projection-view matrix.
     */
    getProjectionViewMatrix(): NumberArray16;
    /**
     * Returns inverse projection and model matrix product.
     * @public
     * @returns {Mat4} - Inverse projection-view matrix.
     */
    getInverseProjectionViewMatrix(): NumberArray16;
    /**
     * Returns inverse projection matrix.
     * @public
     * @returns {Mat4} - Inverse projection-view matrix.
     */
    getInverseProjectionMatrix(): NumberArray16;
}
export { Camera };
