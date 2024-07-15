import { Control, IControlParams } from "./Control";
interface IKeyboardNavigationParams extends IControlParams {
    step?: number;
}
/**
 * Planet camera keyboard navigation. Use W,S,A,D and left shift key for fly around a planet.
 */
export declare class KeyboardNavigation extends Control {
    step: number;
    constructor(options?: IKeyboardNavigationParams);
    onactivate(): void;
    ondeactivate(): void;
    oninit(): void;
    protected onCameraMoveForward(): void;
    protected onCameraMoveBackward(): void;
    protected onCameraStrifeLeft(): void;
    protected onCameraStrifeRight(): void;
    protected onCameraLookUp(): void;
    protected onCameraLookDown(): void;
    protected onCameraLookLeft(): void;
    protected onCameraLookRight(): void;
    protected onCameraTurnLeft(): void;
    protected onCameraTurnRight(): void;
    protected onCameraRollNorth(): void;
    protected onCameraRollLeft(): void;
    protected onCameraRollRight(): void;
}
export {};
