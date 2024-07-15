import { Camera, ICameraParams } from "./Camera";
import { Key } from "../Lock";
import { LonLat } from "../LonLat";
import { Planet } from "../scene/Planet";
import { Vec3 } from "../math/Vec3";
import { Extent } from "../Extent";
import { Segment } from "../segment/Segment";
interface IPlanetCameraParams extends ICameraParams {
    minAltitude?: number;
    maxAltitude?: number;
}
type CameraFrame = {
    eye: Vec3;
    n: Vec3;
    u: Vec3;
    v: Vec3;
};
/**
 * Planet camera.
 * @class
 * @extends {Camera}
 * @param {Planet} planet - Planet render node.
 * @param {IPlanetCameraParams} [options] - Planet camera options:
 * @param {string} [options.name] - Camera name.
 * @param {number} [options.viewAngle] - Camera angle of view.
 * @param {number} [options.near] - Camera near plane distance. Default is 1.0
 * @param {number} [options.far] - Camera far plane distance. Default is og.math.MAX
 * @param {number} [options.minAltitude] - Minimal altitude for the camera. Default is 5
 * @param {number} [options.maxAltitude] - Maximal altitude for the camera. Default is 20000000
 * @param {Vec3} [options.eye] - Camera eye position. Default (0,0,0)
 * @param {Vec3} [options.look] - Camera look position. Default (0,0,0)
 * @param {Vec3} [options.up] - Camera eye position. Default (0,1,0)
 */
declare class PlanetCamera extends Camera {
    /**
     * Assigned camera's planet.
     * @public
     * @type {Planet}
     */
    planet: Planet;
    /**
     * Minimal altitude that camera can reach over the terrain.
     * @public
     * @type {number}
     */
    minAltitude: number;
    /**
     * Maximal altitude that camera can reach over the globe.
     * @public
     * @type {number}
     */
    maxAltitude: number;
    /**
     * Current geographical degree position.
     * @public
     * @type {LonLat}
     */
    _lonLat: LonLat;
    /**
     * Current geographical mercator position.
     * @public
     * @type {LonLat}
     */
    _lonLatMerc: LonLat;
    /**
     * Current altitude.
     * @protected
     * @type {number}
     */
    protected _terrainAltitude: number;
    /**
     * Cartesian coordinates on the terrain.
     * @protected
     * @type {Vec3}
     */
    protected _terrainPoint: Vec3;
    /**
     * Quad node that camera flies over.
     * @protected
     * @type {Segment}
     */
    _insideSegment: Segment | null;
    slope: number;
    protected _keyLock: Key;
    protected _framesArr: CameraFrame[];
    protected _framesCounter: number;
    protected _numFrames: number;
    protected _completeCallback: Function | null;
    protected _frameCallback: Function | null;
    protected _flying: boolean;
    protected _checkTerrainCollision: boolean;
    eyeNorm: Vec3;
    constructor(planet: Planet, options?: IPlanetCameraParams);
    setTerrainCollisionActivity(isActive: boolean): void;
    /**
     * Updates camera view space.
     * @public
     * @virtual
     */
    update(): void;
    updateGeodeticPosition(): void;
    /**
     * Sets altitude over the terrain.
     * @public
     * @param {number} alt - Altitude over the terrain.
     */
    setAltitude(alt: number): void;
    /**
     * Gets altitude over the terrain.
     * @public
     */
    getAltitude(): number;
    /**
     * Places camera to view to the geographical point.
     * @public
     * @param {LonLat} lonlat - New camera and camera view position.
     * @param {LonLat} [lookLonLat] - Look up coordinates.
     * @param {Vec3} [up] - Camera UP vector. Default (0,1,0)
     */
    setLonLat(lonlat: LonLat, lookLonLat?: LonLat, up?: Vec3): void;
    /**
     * Returns camera geographical position.
     * @public
     * @returns {LonLat}
     */
    getLonLat(): LonLat;
    /**
     * Returns camera height.
     * @public
     * @returns {number}
     */
    getHeight(): number;
    /**
     * Gets position by viewable extent.
     * @public
     * @param {Extent} extent - Viewable extent.
     * @param {Number} height - Camera height
     * @returns {Vec3}
     */
    getExtentPosition(extent: Extent, height?: number | null): Vec3;
    /**
     * View current extent.
     * @public
     * @param {Extent} extent - Current extent.
     * @param {number} [height]
     */
    viewExtent(extent: Extent, height?: number): void;
    /**
     * Flies to the current extent.
     * @public
     * @param {Extent} extent - Current extent.
     * @param {number} [height] - Destination height.
     * @param {Vec3} [up] - Camera UP in the end of flying. Default - (0,1,0)
     * @param {Number} [ampl] - Altitude amplitude factor.
     * @param {Function} [completeCallback] - Callback that calls after flying when flying is finished.
     * @param {Function} [startCallback] - Callback that calls before the flying begins.
     * @param {Function} [frameCallback] - Each frame callback
     */
    flyExtent(extent: Extent, height?: number | null, up?: Vec3 | null, ampl?: number | null, completeCallback?: Function | null, startCallback?: Function | null, frameCallback?: Function | null): void;
    viewDistance(cartesian: Vec3, distance?: number): void;
    flyDistance(cartesian: Vec3, distance?: number, ampl?: number, completeCallback?: Function, startCallback?: Function, frameCallback?: Function): void;
    /**
     * Flies to the cartesian coordinates.
     * @public
     * @param {Vec3} cartesian - Finish cartesian coordinates.
     * @param {Vec3} [look] - Camera LOOK in the end of flying. Default - (0,0,0)
     * @param {Vec3} [up] - Camera UP vector in the end of flying. Default - (0,1,0)
     * @param {Number} [ampl=1.0] - Altitude amplitude factor.
     * @param {Function} [completeCallback] - Callback that calls after flying when flying is finished.
     * @param {Function} [startCallback] - Callback that calls before the flying begins.
     * @param {Function} [frameCallback] - Each frame callback
     */
    flyCartesian(cartesian: Vec3, look?: Vec3 | LonLat | null, up?: Vec3 | null, ampl?: number, completeCallback?: Function | null, startCallback?: Function | null, frameCallback?: Function | null): void;
    /**
     * Flies to the geo coordinates.
     * @public
     * @param {LonLat} lonlat - Finish coordinates.
     * @param {Vec3 | LonLat} [look] - Camera LOOK in the end of flying. Default - (0,0,0)
     * @param {Vec3} [up] - Camera UP vector in the end of flying. Default - (0,1,0)
     * @param {number} [ampl] - Altitude amplitude factor.
     * @param {Function} [completeCallback] - Callback that calls after flying when flying is finished.
     * @param {Function} [startCallback] - Callback that calls befor the flying begins.
     * @param {Function} [frameCallback] - each frame callback
     */
    flyLonLat(lonlat: LonLat, look?: Vec3 | LonLat, up?: Vec3, ampl?: number, completeCallback?: Function, startCallback?: Function, frameCallbak?: Function): void;
    /**
     * Breaks the flight.
     * @public
     */
    stopFlying(): void;
    /**
     * Returns camera is flying.
     * @public
     * @returns {boolean}
     */
    isFlying(): boolean;
    /**
     * Rotates around planet to the left.
     * @public
     * @param {number} angle - Rotation angle.
     * @param {boolean} [spin] - If its true rotates around globe spin.
     */
    rotateLeft(angle: number, spin: boolean): void;
    /**
     * Rotates around planet to the right.
     * @public
     * @param {number} angle - Rotation angle.
     * @param {boolean} [spin] - If its true rotates around globe spin.
     */
    rotateRight(angle: number, spin: boolean): void;
    /**
     * Rotates around planet to the North Pole.
     * @public
     * @param {number} angle - Rotation angle.
     */
    rotateUp(angle: number): void;
    /**
     * Rotates around planet to the South Pole.
     * @public
     * @param {number} angle - Rotation angle.
     */
    rotateDown(angle: number): void;
    rotateVertical(angle: number, center: Vec3, minSlope?: number): void;
    /**
     * Prepare camera to the frame. Used in render node frame function.
     * @public
     */
    checkFly(): void;
    checkTerrainCollision(): Vec3 | undefined;
    getSurfaceVisibleDistance(d: number): number;
    getHeading(): number;
    isVisible(poi: Vec3): boolean;
}
export { PlanetCamera };
