import * as quadTree from "../quadTree/quadTree";
import { Extent } from "../Extent";
import { EPSG4326 } from "../proj/EPSG4326";
import { Node } from "../quadTree/Node";
import { SegmentLonLatWgs84 } from "../segment/SegmentLonLatWgs84";
import { QuadTreeStrategy } from "./QuadTreeStrategy";
export class MarsQuadTreeStrategy extends QuadTreeStrategy {
    constructor(planet) {
        super(planet, "Mars", EPSG4326);
    }
    init() {
        let earthQuadTreeSouth = new Node(SegmentLonLatWgs84, this.planet, quadTree.NW, null, 0, 0, Extent.createFromArray([-180, -90, 0, 90]));
        let earthQuadTreeWest = new Node(SegmentLonLatWgs84, this.planet, quadTree.NW, null, 0, 0, Extent.createFromArray([0, -90, 180, 90]));
        this._quadTreeList.push(earthQuadTreeSouth);
        this._quadTreeList.push(earthQuadTreeWest);
    }
}
