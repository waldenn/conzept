import { Control, IControlParams } from "./Control";
import { Key } from "../Lock";
import { Quat } from "../math/Quat";
import { Sphere } from "../bv/Sphere";
import { Vec2 } from "../math/Vec2";
import { Vec3 } from "../math/Vec3";
import { ITouchState } from "../renderer/RendererEvents";
interface ITouchNavigationParams extends IControlParams {
}
declare class TouchExt {
    x: number;
    y: number;
    prev_x: number;
    prev_y: number;
    grabbedPoint: Vec3 | null;
    grabbedSpheroid: Sphere;
    protected _vec: Vec2;
    protected _vecPrev: Vec2;
    constructor();
    get dY(): number;
    get dX(): number;
    get vec(): Vec2;
    get vecPrev(): Vec2;
}
/**
 * Touch pad planet camera dragging control.
 */
export declare class TouchNavigation extends Control {
    grabbedPoint: Vec3;
    inertia: number;
    protected grabbedSpheroid: Sphere;
    protected qRot: Quat;
    protected scaleRot: number;
    protected rot: number;
    protected _eye0: Vec3;
    protected pointOnEarth: Vec3 | null;
    protected earthUp: Vec3 | null;
    protected touches: TouchExt[];
    protected _keyLock: Key;
    protected _touching: boolean;
    constructor(options?: ITouchNavigationParams);
    oninit(): void;
    protected onTouchStart(e: ITouchState): void;
    protected _startTouchOne(e: ITouchState): void;
    stopRotation(): void;
    protected onDoubleTouch(e: ITouchState): void;
    protected onTouchEnd(e: ITouchState): void;
    protected onTouchCancel(e: ITouchState): void;
    protected onTouchMove(e: ITouchState): void;
    protected onDraw(): void;
}
export {};
