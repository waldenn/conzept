import * as math from "../math";
import { createEvents } from "../Events";
import { Frustum } from "./Frustum";
import { Mat3 } from "../math/Mat3";
import { Mat4 } from "../math/Mat4";
import { Vec2 } from "../math/Vec2";
import { Vec3 } from "../math/Vec3";
import { Vec4 } from "../math/Vec4";
const EVENT_NAMES = [
    /**
     * When camera has been updated.
     * @event og.Camera#viewchange
     */
    "viewchange",
    /**
     * Camera is stopped.
     * @event og.Camera#moveend
     */
    "moveend"
];
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
class Camera {
    constructor(renderer, options = {}) {
        this.renderer = renderer;
        this.events = createEvents(EVENT_NAMES, this);
        this.eye = options.eye || new Vec3();
        this.eyeHigh = new Float32Array(3);
        this.eyeLow = new Float32Array(3);
        this._aspect = options.aspect || 1.0;
        this._viewAngle = options.viewAngle || 47.0;
        this._viewMatrix = new Mat4();
        this._normalMatrix = new Mat3();
        this._r = new Vec3(1.0, 0.0, 0.0);
        this._u = new Vec3(0.0, 1.0, 0.0);
        this._b = new Vec3(0.0, 0.0, 1.0);
        // Previous frame values
        this._pr = this._r.clone();
        this._pu = this._u.clone();
        this._pb = this._b.clone();
        this._peye = this.eye.clone();
        this.isMoving = false;
        this._tanViewAngle_hrad = 0.0;
        this._tanViewAngle_hradOneByHeight = 0.0;
        this.frustums = [];
        this.frustumColors = [];
        if (options.frustums) {
            for (let i = 0, len = options.frustums.length; i < len; i++) {
                let fi = options.frustums[i];
                let fr = new Frustum({
                    fov: this._viewAngle,
                    aspect: this._aspect,
                    near: fi[0],
                    far: fi[1]
                });
                fr.cameraFrustumIndex = this.frustums.length;
                this.frustums.push(fr);
                //this.frustumColors.push.apply(this.frustumColors, fr._pickingColorU);
                this.frustumColors.push(fr._pickingColorU[0], fr._pickingColorU[1], fr._pickingColorU[2]);
            }
        }
        else {
            let near = 1.0, far = 10000.0;
            let fr = new Frustum({
                fov: this._viewAngle,
                aspect: this._aspect,
                near: near,
                far: far
            });
            fr.cameraFrustumIndex = this.frustums.length;
            this.frustums.push(fr);
            //this.frustumColors.push.apply(this.frustumColors, fr._pickingColorU);
            this.frustumColors.push(fr._pickingColorU[0], fr._pickingColorU[1], fr._pickingColorU[2]);
        }
        this.FARTHEST_FRUSTUM_INDEX = this.frustums.length - 1;
        this.currentFrustumIndex = 0;
        this.isFirstPass = false;
        this._projSizeConst = 0;
        this.set(options.eye || new Vec3(0.0, 0.0, 1.0), options.look || new Vec3(), options.up || new Vec3(0.0, 1.0, 0.0));
    }
    checkMoveEnd() {
        let r = this._r, u = this._u, b = this._b, eye = this.eye;
        if (this._peye.equal(eye) && this._pr.equal(r) && this._pu.equal(u) && this._pb.equal(b)) {
            if (this.isMoving) {
                this.events.dispatch(this.events.moveend, this);
            }
            this.isMoving = false;
        }
        else {
            this.isMoving = true;
        }
        this._pr.copy(r);
        this._pu.copy(u);
        this._pb.copy(b);
        this._peye.copy(eye);
    }
    bindRenderer(renderer) {
        this.renderer = renderer;
        for (let i = 0; i < this.frustums.length; i++) {
            this.renderer.assignPickingColor(this.frustums[i]);
        }
        this._aspect = this.renderer.handler.getClientAspect();
        this._setProj(this._viewAngle, this._aspect);
    }
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
    _init(options) {
        this._setProj(this._viewAngle, this._aspect);
        this.set(options.eye || new Vec3(0.0, 0.0, 1.0), options.look || new Vec3(), options.up || new Vec3(0.0, 1.0, 0.0));
    }
    getUp() {
        return this._u.clone();
    }
    getDown() {
        return this._u.negateTo();
    }
    getRight() {
        return this._r.clone();
    }
    getLeft() {
        return this._r.negateTo();
    }
    getForward() {
        return this._b.negateTo();
    }
    getBackward() {
        return this._b.clone();
    }
    /**
     * Updates camera view space
     * @public
     * @virtual
     */
    update() {
        let u = this._r, v = this._u, n = this._b, eye = this.eye;
        Vec3.doubleToTwoFloat32Array(eye, this.eyeHigh, this.eyeLow);
        this._viewMatrix.set([
            u.x, v.x, n.x, 0.0,
            u.y, v.y, n.y, 0.0,
            u.z, v.z, n.z, 0.0,
            -eye.dot(u), -eye.dot(v), -eye.dot(n), 1.0
        ]);
        // do not clean up, someday it will be using
        //this._normalMatrix = this._viewMatrix.toMatrix3(); // this._viewMatrix.toInverseMatrix3().transposeTo();
        for (let i = 0, len = this.frustums.length; i < len; i++) {
            this.frustums[i].setViewMatrix(this._viewMatrix);
        }
        this.events.dispatch(this.events.viewchange, this);
    }
    /**
     * Refresh camera matrices
     * @public
     */
    refresh() {
        this._setProj(this._viewAngle, this._aspect);
        this.update();
    }
    /**
     * Sets aspect ratio
     * @public
     * @param {Number} aspect - Camera aspect ratio
     */
    setAspectRatio(aspect) {
        this._aspect = aspect;
        this.refresh();
    }
    /**
     * Returns aspect ratio
     * @public
     * @returns {number} - Aspect ratio
     */
    getAspectRatio() {
        return this._aspect;
    }
    /**
     * Sets up camera projection
     * @public
     * @param {number} angle - Camera view angle
     * @param {number} aspect - Screen aspect ratio
     */
    _setProj(angle, aspect) {
        this._viewAngle = angle;
        this._aspect = aspect;
        this._tanViewAngle_hrad = Math.tan(angle * math.RADIANS_HALF);
        this._tanViewAngle_hradOneByHeight =
            this._tanViewAngle_hrad * this.renderer.handler._oneByHeight;
        let c = this.renderer.handler.canvas;
        this._projSizeConst = Math.min(c.clientWidth < 512 ? 512 : c.clientWidth, c.clientHeight < 512 ? 512 : c.clientHeight) / (angle * math.RADIANS);
        for (let i = 0, len = this.frustums.length; i < len; i++) {
            this.frustums[i].setProjectionMatrix(angle, aspect, this.frustums[i].near, this.frustums[i].far);
        }
    }
    /**
     * Sets camera view angle in degrees
     * @public
     * @param {number} angle - View angle
     */
    setViewAngle(angle) {
        this._viewAngle = angle;
        this.refresh();
    }
    /**
     * Gets camera view angle in degrees
     * @public
     * @returns {number} angle -
     */
    getViewAngle() {
        return this._viewAngle;
    }
    get viewAngle() {
        return this._viewAngle;
    }
    /**
     * Sets camera to eye position
     * @public
     * @param {Vec3} eye - Camera position
     * @param {Vec3} look - Look point
     * @param {Vec3} up - Camera up vector
     * @returns {Camera} - This camera
     */
    set(eye, look, up) {
        this.eye.x = eye.x;
        this.eye.y = eye.y;
        this.eye.z = eye.z;
        look = look || this._b;
        up = up || this._u;
        this._b.x = eye.x - look.x;
        this._b.y = eye.y - look.y;
        this._b.z = eye.z - look.z;
        this._r.copy(up.cross(this._b));
        this._b.normalize();
        this._r.normalize();
        this._u.copy(this._b.cross(this._r));
        return this;
    }
    /**
     * Sets camera look point
     * @public
     * @param {Vec3} look - Look point
     * @param {Vec3} [up] - Camera up vector otherwise camera current up vector(this._u)
     */
    look(look, up) {
        this._b.set(this.eye.x - look.x, this.eye.y - look.y, this.eye.z - look.z);
        this._r.copy((up || this._u).cross(this._b));
        this._b.normalize();
        this._r.normalize();
        this._u.copy(this._b.cross(this._r));
    }
    /**
     * Slides camera to vector d - (du, dv, dn)
     * @public
     * @param {number} du - delta X
     * @param {number} dv - delta Y
     * @param {number} dn - delta Z
     */
    slide(du, dv, dn) {
        this.eye.x += du * this._r.x + dv * this._u.x + dn * this._b.x;
        this.eye.y += du * this._r.y + dv * this._u.y + dn * this._b.y;
        this.eye.z += du * this._r.z + dv * this._u.z + dn * this._b.z;
    }
    /**
     * Roll the camera to the angle in degrees
     * @public
     * @param {number} angle - Delta roll angle in degrees
     */
    roll(angle) {
        let cs = Math.cos(math.RADIANS * angle);
        let sn = Math.sin(math.RADIANS * angle);
        let t = this._r.clone();
        this._r.set(cs * t.x - sn * this._u.x, cs * t.y - sn * this._u.y, cs * t.z - sn * this._u.z);
        this._u.set(sn * t.x + cs * this._u.x, sn * t.y + cs * this._u.y, sn * t.z + cs * this._u.z);
    }
    /**
     * Pitch the camera to the angle in degrees
     * @public
     * @param {number} angle - Delta pitch angle in degrees
     */
    pitch(angle) {
        let cs = Math.cos(math.RADIANS * angle);
        let sn = Math.sin(math.RADIANS * angle);
        let t = this._b.clone();
        this._b.set(cs * t.x - sn * this._u.x, cs * t.y - sn * this._u.y, cs * t.z - sn * this._u.z);
        this._u.set(sn * t.x + cs * this._u.x, sn * t.y + cs * this._u.y, sn * t.z + cs * this._u.z);
    }
    /**
     * Yaw the camera to the angle in degrees
     * @public
     * @param {number} angle - Delta yaw angle in degrees
     */
    yaw(angle) {
        let cs = Math.cos(math.RADIANS * angle);
        let sn = Math.sin(math.RADIANS * angle);
        let t = this._r.clone();
        this._r.set(cs * t.x - sn * this._b.x, cs * t.y - sn * this._b.y, cs * t.z - sn * this._b.z);
        this._b.set(sn * t.x + cs * this._b.x, sn * t.y + cs * this._b.y, sn * t.z + cs * this._b.z);
    }
    /**
     * Returns normal vector direction to the unprojected screen point from camera eye
     * @public
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @returns {Vec3} - Direction vector
     */
    unproject(x, y) {
        let c = this.renderer.handler.canvas, w = c.width * 0.5, h = c.height * 0.5;
        let px = (x - w) / w, py = -(y - h) / h;
        let world1 = this.frustums[0].inverseProjectionViewMatrix.mulVec4(new Vec4(px, py, -1.0, 1.0)).affinity(), world2 = this.frustums[0].inverseProjectionViewMatrix.mulVec4(new Vec4(px, py, 0.0, 1.0)).affinity();
        return world2.subA(world1).toVec3().normalize();
    }
    /**
     * Gets projected 3d point to the 2d screen coordinates
     * @public
     * @param {Vec3} v - Cartesian 3d coordinates
     * @returns {Vec2} - Screen point coordinates
     */
    project(v) {
        let r = this.frustums[0].projectionViewMatrix.mulVec4(v.toVec4()), c = this.renderer.handler.canvas;
        return new Vec2((1 + r.x / r.w) * c.width * 0.5, (1 - r.y / r.w) * c.height * 0.5);
    }
    /**
     * Rotates camera around center point
     * @public
     * @param {number} angle - Rotation angle in radians
     * @param {boolean} [isArc] - If true camera up vector gets from current up vector every frame,
     * otherwise up is always input parameter.
     * @param {Vec3} [center] - Point that the camera rotates around
     * @param {Vec3} [up] - Camera up vector
     */
    rotateAround(angle, isArc, center, up) {
        center = center || Vec3.ZERO;
        up = up || Vec3.UP;
        let rot = new Mat4().setRotation(isArc ? this._u : up, angle);
        let tr = new Mat4().setIdentity().translate(center);
        let ntr = new Mat4().setIdentity().translate(center.negateTo());
        let trm = tr.mul(rot).mul(ntr);
        this.eye = trm.mulVec3(this.eye);
        this._u = rot.mulVec3(this._u).normalize();
        this._r = rot.mulVec3(this._r).normalize();
        this._b = rot.mulVec3(this._b).normalize();
    }
    /**
     * Rotates camera around center point by horizontal.
     * @public
     * @param {number} angle - Rotation angle in radians.
     * @param {boolean} [isArc] - If true camera up vector gets from current up vector every frame,
     * otherwise up is always input parameter.
     * @param {Vec3} [center] - Point that the camera rotates around.
     * @param {Vec3} [up] - Camera up vector.
     */
    rotateHorizontal(angle, isArc, center, up) {
        this.rotateAround(angle, isArc, center, up);
    }
    /**
     * Rotates camera around center point by vertical.
     * @param {number} angle - Rotation angle in radians.
     * @param {Vec3} [center] - Point that the camera rotates around.
     */
    rotateVertical(angle, center) {
        this.rotateAround(angle, false, center, this._r);
    }
    /**
     * Gets 3d size factor. Uses in LOD distance calculation.
     * @public
     * @param {Vec3} p - Far point.
     * @param {Vec3} r - Far point.
     * @returns {number} - Size factor.
     */
    projectedSize(p, r) {
        return Math.atan(r / this.eye.distance(p)) * this._projSizeConst;
    }
    /**
     * Returns model matrix.
     * @public
     * @returns {NumberArray16} - View matrix.
     */
    getViewMatrix() {
        return this._viewMatrix._m;
    }
    /**
     * Returns normal matrix.
     * @public
     * @returns {NumberArray9} - Normal matrix.
     */
    getNormalMatrix() {
        return this._normalMatrix._m;
    }
    setCurrentFrustum(k) {
        this.currentFrustumIndex = k;
        this.isFirstPass = k === this.FARTHEST_FRUSTUM_INDEX;
    }
    getCurrentFrustum() {
        return this.currentFrustumIndex;
    }
    get frustum() {
        return this.frustums[this.currentFrustumIndex];
    }
    /**
     * Returns projection matrix.
     * @public
     * @returns {Mat4} - Projection matrix.
     */
    getProjectionMatrix() {
        return this.frustum.projectionMatrix._m;
    }
    /**
     * Returns projection and model matrix product.
     * @public
     * @return {Mat4} - Projection-view matrix.
     */
    getProjectionViewMatrix() {
        return this.frustum.projectionViewMatrix._m;
    }
    /**
     * Returns inverse projection and model matrix product.
     * @public
     * @returns {Mat4} - Inverse projection-view matrix.
     */
    getInverseProjectionViewMatrix() {
        return this.frustum.inverseProjectionViewMatrix._m;
    }
    /**
     * Returns inverse projection matrix.
     * @public
     * @returns {Mat4} - Inverse projection-view matrix.
     */
    getInverseProjectionMatrix() {
        return this.frustum.inverseProjectionMatrix._m;
    }
}
export { Camera };
