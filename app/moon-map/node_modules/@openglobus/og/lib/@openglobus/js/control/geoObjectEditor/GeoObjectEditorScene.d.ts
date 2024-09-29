import { EventsHandler } from '../../Events';
import { Planet } from "../../scene/Planet";
import { RenderNode } from '../../scene/RenderNode';
import { Vector } from '../../layer/Vector';
import { Vec2 } from '../../math/Vec2';
import { IMouseState } from "../../renderer/RendererEvents";
import { Ellipsoid } from "../../ellipsoid/Ellipsoid";
export interface IGeoObjectEditorSceneParams {
    planet?: Planet;
}
type GeoObjectSceneEventsList = [
    "mousemove",
    "mouseenter",
    "mouseleave",
    "lclick",
    "rclick",
    "mclick",
    "ldblclick",
    "rdblclick",
    "mdblclick",
    "lup",
    "rup",
    "mup",
    "ldown",
    "rdown",
    "mdown",
    "lhold",
    "rhold",
    "mhold",
    "mousewheel",
    "touchmove",
    "touchstart",
    "touchend",
    "doubletouch",
    "touchleave",
    "touchenter"
];
declare class GeoObjectEditorScene extends RenderNode {
    events: EventsHandler<GeoObjectSceneEventsList>;
    protected _planet: Planet | null;
    protected _startPos: Vec2 | null;
    protected _startClick: Vec2;
    protected _axisLayer: Vector;
    protected _rotLayer: Vector;
    constructor(options?: IGeoObjectEditorSceneParams);
    init(): void;
    onremove(): void;
    _activate(): void;
    protected _deactivate(): void;
    protected _onLUp: () => void;
    setVisibility(visibility: boolean): void;
    protected _onLclick: (e: IMouseState) => void;
    protected _onMouseMove: (e: IMouseState) => void;
    clear(): void;
    frame(): void;
    get ellipsoid(): Ellipsoid | null;
}
export { GeoObjectEditorScene };
