import { print2d } from "../utils/shared";
import { Control } from "./Control";
/**
 * Frame per second(FPS) display control.
 */
export class ShowFps extends Control {
    constructor(options) {
        super(options);
    }
    oninit() {
        let d = document.createElement("div");
        d.className = "defaultText ";
        d.id = "ogShowFpsControl";
        document.body.appendChild(d);
        this.renderer.events.on("draw", this._draw, this);
    }
    _draw() {
        print2d("ogShowFpsControl", (1000.0 / this.renderer.handler.deltaTime).toFixed(1), this.renderer.handler.canvas.clientWidth - 60, 0);
    }
}
