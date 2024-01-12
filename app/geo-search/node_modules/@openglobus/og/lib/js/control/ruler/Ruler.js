import { Control } from "../Control";
import { RulerScene } from "./RulerScene";
export class Ruler extends Control {
    constructor(options = {}) {
        super(options);
        this._rulerScene = new RulerScene({
            name: `rulerScene:${this.__id}`,
            ignoreTerrain: options.ignoreTerrain
        });
    }
    set ignoreTerrain(v) {
        this._rulerScene.ignoreTerrain = v;
    }
    oninit() {
        this._rulerScene.bindPlanet(this.planet);
    }
    onactivate() {
        this.renderer && this.renderer.addNode(this._rulerScene);
    }
    ondeactivate() {
        this.renderer && this.renderer.removeNode(this._rulerScene);
    }
}
