import { Control, IControlParams } from "./Control";
interface ISimpleNavigationParams extends IControlParams {
    speed?: number;
}
/**
 * Simple keyboard camera navigation with W,S,A,D and shift keys to fly around the scene.
 */
export declare class SimpleNavigation extends Control {
    speed: number;
    constructor(options?: ISimpleNavigationParams);
    oninit(): void;
    onactivate(): void;
    ondeactivate(): void;
    protected onCameraMoveForward(): void;
    protected onCameraMoveBackward(): void;
    protected onCameraStrifeLeft(): void;
    protected onCameraStrifeRight(): void;
    protected onCameraLookUp(): void;
    protected onCameraLookDown(): void;
    protected onCameraTurnLeft(): void;
    protected onCameraTurnRight(): void;
    protected onCameraRollLeft(): void;
    protected onCameraRollRight(): void;
}
export {};
