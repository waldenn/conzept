import { Key } from "../Lock";
import { Control, IControlParams } from "./Control";
import { Renderer } from "../renderer/Renderer";
import { Vec2 } from "../math/Vec2";
/**
 * Planet zoom buttons control.
 */
declare class ZoomControl extends Control {
    protected _keyLock: Key;
    protected _move: number;
    protected _targetPoint: Vec2 | null;
    constructor(options?: IControlParams);
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
    stopZoom(): void;
    protected _draw(e: Renderer): void;
}
export { ZoomControl };
