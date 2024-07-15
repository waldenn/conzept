import { Sphere } from "../bv/Sphere";
import { Key } from "../Lock";
import { Quat } from "../math/Quat";
import { Vec3 } from "../math/Vec3";
import { Control, IControlParams } from "./Control";
import { IStepForward } from "./MouseNavigation";
interface IMouseWheelZoomControl extends IControlParams {
    minSlope?: number;
}
export declare class MouseWheelZoomControl extends Control {
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
    protected minSlope: number;
    protected _keyLock: Key;
    protected _deactivate: boolean;
    protected _move: number;
    constructor(options?: IMouseWheelZoomControl);
    oninit(): void;
    /**
     * Planet zoom in.
     * @public
     */
    zoomIn(): void;
    /**
     * Planet zoom out.
     * @public
     */
    zoomOut(): void;
    stopRotation(): void;
    stopZoom(): void;
    protected _draw(): void;
}
export {};
