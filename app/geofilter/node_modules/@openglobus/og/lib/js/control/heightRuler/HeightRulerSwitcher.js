import { RulerSwitcher } from "../RulerSwitcher";
import { HeightRuler } from "./HeightRuler";
export class HeightRulerSwitcher extends RulerSwitcher {
    constructor(options = {}) {
        super({
            name: `HeightRulerSwitcher`,
            ...options
        });
        this.ruler = new HeightRuler({
            ignoreTerrain: options.ignoreTerrain
        });
    }
}
