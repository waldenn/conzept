import { Control, IControlParams } from "./Control";
import { ITouchState } from "../renderer/RendererEvents";
import { IMouseState } from "../renderer/RendererEvents";
import { Quat } from "../math/Quat";
import { Sphere } from "../bv/Sphere";
import { Vec3 } from "../math/Vec3";
interface IEarthNavigationParams extends IControlParams {
}
declare class TouchExt {
    x: number;
    y: number;
    prev_x: number;
    prev_y: number;
    grabbedPoint: Vec3 | null;
    grabbedSpheroid: Sphere;
    constructor();
    dX(): number;
    dY(): number;
}
export declare class EarthNavigation extends Control {
    protected grabbedPoint: Vec3 | null;
    protected grabbedDir: Vec3;
    inertia: number;
    protected grabbedSpheroid: Sphere;
    protected _vRot: Quat;
    protected _hRot: Quat;
    protected _a: number;
    protected scaleRot: number;
    protected currState: number;
    protected positionState: {
        h: number;
        max: number;
        min: number;
    }[];
    protected touches: TouchExt[];
    constructor(options?: IEarthNavigationParams);
    switchZoomState(wheelDelta: number): void;
    protected onMouseWheel(event: IMouseState): void;
    oninit(): void;
    onactivate(): void;
    protected onTouchStart(e: ITouchState): void;
    protected onTouchEnd(e: ITouchState): void;
    protected onTouchMove(e: ITouchState): void;
    protected onMouseLeftButtonClick(e: IMouseState): void;
    stopRotation(): void;
    protected onMouseLeftButtonUp(e: IMouseState): void;
    protected onMouseLeftButtonDown(e: IMouseState): void;
    protected onDraw(): void;
}
export {};
