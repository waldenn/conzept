import { Entity } from "./Entity";
import { Quat, Vec3, Vec4 } from "../math/index";
import { GeoObjectHandler, InstanceData } from "./GeoObjectHandler";
import { NumberArray3 } from "../math/Vec3";
import { NumberArray4 } from "../math/Vec4";
import { Object3d } from "../Object3d";
export interface IGeoObjectParams {
    object3d?: Object3d;
    objSrc?: string;
    textureSrc?: string;
    tag?: string;
    position?: Vec3 | NumberArray3;
    pitch?: number;
    yaw?: number;
    roll?: number;
    scale?: number | Vec3 | NumberArray3;
    translate?: Vec3 | NumberArray3;
    color?: Vec4 | NumberArray4 | string;
    visibility?: boolean;
}
/**
 * @class
 * @param {Object} options -  Geo object parameters:
 * @param {Vec3} [options.position] - Geo object position.
 *
 * @todo: GeoObject and GeoObjectHandler provides instanced objects only.
 * It would be nice if it could provide not instanced rendering loop too.
 */
declare class GeoObject {
    protected _tag: string;
    instanced: boolean;
    /**
     * Entity instance that holds this geo object.
     * @public
     * @type {Entity}
     */
    _entity: Entity | null;
    /**
     * Geo object center cartesian position.
     * @protected
     * @type {Vec3}
     */
    protected _position: Vec3;
    _positionHigh: Vec3;
    _positionLow: Vec3;
    protected _pitch: number;
    protected _yaw: number;
    protected _roll: number;
    protected _pitchRad: number;
    protected _yawRad: number;
    protected _rollRad: number;
    protected _scale: Vec3;
    protected _translate: Vec3;
    /**
     * RGBA color.
     * @public
     * @type {Vec4}
     */
    _color: Vec4;
    _qRot: Quat;
    protected _direction: Vec3;
    _handler: GeoObjectHandler | null;
    _handlerIndex: number;
    _tagData: InstanceData | null;
    _tagDataIndex: number;
    protected _object3d: Object3d;
    protected _visibility: boolean;
    protected _qNorthFrame: Quat;
    private _textureSrc?;
    _objectSrc?: string;
    protected _children: GeoObject[];
    constructor(options: IGeoObjectParams);
    get tag(): string;
    getPosition(): Vec3;
    getPitch(): number;
    getYaw(): number;
    getRoll(): number;
    get object3d(): Object3d;
    get vertices(): number[];
    get normals(): number[];
    get texCoords(): number[];
    get indices(): number[];
    /**
     * Sets geo object opacity.
     * @public
     * @param {number} a - Billboard opacity.
     */
    setOpacity(a: number): void;
    /**
     * Sets color.
     * @public
     * @param {number} r - Red.
     * @param {number} g - Green.
     * @param {number} b - Blue.
     * @param {number} [a] - Alpha.
     */
    setColor(r: number, g: number, b: number, a?: number): void;
    /**
     * Sets color.
     * @public
     * @param {Vec3 | Vec4} color - RGBA vector.
     */
    setColor4v(color: Vec3 | Vec4): void;
    /**
     * Sets geo object visibility.
     * @public
     * @param {boolean} visibility - Visibility flag.
     */
    setVisibility(visibility: boolean): void;
    /**
     * Returns geo object visibility.
     * @public
     * @returns {boolean}
     */
    getVisibility(): boolean;
    /**
     * Sets geo object position.
     * @public
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} z - Z coordinate.
     */
    setPosition(x: number, y: number, z: number): void;
    /**
     * Sets geo object position.
     * @public
     * @param {Vec3} position - Cartesian coordinates.
     */
    setPosition3v(position: Vec3): void;
    setYaw(yaw: number): void;
    setObject(object: Object3d): void;
    setObjectSrc(src: string): void;
    setTextureSrc(src: string): void;
    setColorHTML(color: string): void;
    /**
     *
     * @param {number} pitch - Pitch in radians
     */
    setPitch(pitch: number): void;
    setRoll(roll: number): void;
    setPitchYawRoll(pitch: number, yaw: number, roll: number): void;
    setScale(scale: number): void;
    setScale3v(scale: Vec3): void;
    getScale(): Vec3;
    setTranslate3v(translate: Vec3): void;
    getTranslate(): Vec3;
    /**
     * Removes geo object from handler.
     * @public
     */
    remove(): void;
    /**
     * Sets billboard picking color.
     * @public
     * @param {Vec3} color - Picking color.
     */
    setPickingColor3v(color: Vec3): void;
    updateRotation(): void;
    getDirection(): Vec3;
}
export { GeoObject };
