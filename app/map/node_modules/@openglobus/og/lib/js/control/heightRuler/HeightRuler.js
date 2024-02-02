import { Ruler } from "../ruler/Ruler";
import { HeightRulerScene } from "./HeightRulerScene";
export class HeightRuler extends Ruler {
    constructor(options = {}) {
        super(options);
        this._rulerScene = new HeightRulerScene({
            name: `heightRulerScene:${this.__id}`,
            ignoreTerrain: false
        });
    }
}
