import { Control } from "../Control";
import { LineStringDrawingScene } from "./LineStringDrawingScene";
import { PolygonDrawingScene } from "./PolygonDrawingScene";
class DrawingControl extends Control {
    constructor(options = {}) {
        super(options);
        this._drawingScene = new LineStringDrawingScene({
            name: `drawingScene:${this.__id}`
        });
    }
    activatePolygonDrawing() {
        this.deactivate();
        this._drawingScene = new PolygonDrawingScene({
            name: `polygonDrawingScene:${this.__id}`
        });
        this.activate();
    }
    activateLineStringDrawing() {
        this.deactivate();
        this._drawingScene = new LineStringDrawingScene({
            name: `linestringDrawingScene:${this.__id}`
        });
        this.activate();
    }
    oninit() {
    }
    onactivate() {
        this.planet && this._drawingScene.bindPlanet(this.planet);
        this.renderer && this.renderer.addNode(this._drawingScene);
    }
    ondeactivate() {
        this.renderer && this.renderer.removeNode(this._drawingScene);
    }
}
export { DrawingControl };
