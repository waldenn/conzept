import { Control, IControlParams } from "../Control";
import { PolygonDrawingScene } from "./PolygonDrawingScene";
declare class DrawingControl extends Control {
    protected _drawingScene: PolygonDrawingScene;
    constructor(options?: IControlParams);
    activatePolygonDrawing(): void;
    activateLineStringDrawing(): void;
    oninit(): void;
    onactivate(): void;
    ondeactivate(): void;
}
export { DrawingControl };
