import { Control, IControlParams } from "./Control";
import { Key } from "../Lock";
import { Quat } from "../math/Quat";
import { Sphere } from "../bv/Sphere";
import { Vec3 } from "../math/Vec3";
import { Vec2 } from "../math/Vec2";
import { Planet } from "../scene/Planet";
import { PlanetCamera } from "../camera/PlanetCamera";
import { IMouseState } from "../renderer/RendererEvents";
export interface IStepForward {
    eye: Vec3;
    v: Vec3;
    u: Vec3;
    n: Vec3;
}
interface IMouseNavigationParams extends IControlParams {
    minSlope?: number;
}
/**
 * Mouse planet camera dragging control.
 */
export declare class MouseNavigation extends Control {
    protected grabbedPoint: Vec3;
    protected _eye0: Vec3;
    protected pointOnEarth: Vec3;
    protected earthUp: Vec3;
    inertia: number;
    protected grabbedSpheroid: Sphere;
    protected qRot: Quat;
    protected scaleRot: number;
    protected distDiff: number;
    protected stepsCount: number;
    protected stepsForward: IStepForward[] | null;
    protected stepIndex: number;
    protected _lmbDoubleClickActive: boolean;
    minSlope: number;
    protected _wheelDirection: number;
    protected _keyLock: Key;
    protected _deactivate: boolean;
    protected _shiftBusy: boolean;
    constructor(options?: IMouseNavigationParams);
    static getMovePointsFromPixelTerrain(cam: PlanetCamera, planet: Planet, stepsCount: number, delta: number, point: Vec2, forward: boolean, dir?: Vec3 | null): IStepForward[] | undefined;
    onactivate(): void;
    ondeactivate(): void;
    activateDoubleClickZoom(): void;
    deactivateDoubleClickZoom(): void;
    protected onMouseEnter(e: IMouseState): void;
    protected onMouseLeave(): void;
    protected onMouseWheel(e: IMouseState): void;
    oninit(): void;
    protected onMouseLeftButtonDoubleClick(e: IMouseState): void;
    protected onMouseLeftButtonClick(): void;
    stopRotation(): void;
    protected onMouseLeftButtonUp(e: IMouseState): void;
    protected onMouseLeftButtonDown(e: IMouseState): void;
    protected onMouseRightButtonClick(e: IMouseState): void;
    protected onMouseRightButtonDown(e: IMouseState): void;
    onShiftFree(): void;
    protected onMouseMove(e: IMouseState): void;
    protected onDraw(): void;
    lockPlanet(skipTerrain?: boolean): void;
    freePlanet(): void;
}
export {};
