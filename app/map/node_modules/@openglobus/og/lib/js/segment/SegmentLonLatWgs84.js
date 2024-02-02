import { SegmentLonLat } from "./SegmentLonLat";
import { TILEGROUP_COMMON } from "./Segment";
export class SegmentLonLatWgs84 extends SegmentLonLat {
    constructor(node, planet, tileZoom, extent) {
        super(node, planet, tileZoom, extent);
        this.isPole = false;
        this._tileGroup = TILEGROUP_COMMON;
    }
    _getMaxZoom() {
        return 150;
    }
    _assignTileYIndexes(extent) {
        this.tileY = Math.round((90.0 - extent.northEast.lat) / (extent.northEast.lat - extent.southWest.lat));
        this.tileYN = this.tileY - 1;
        this.tileYS = this.tileY + 1;
    }
    _assignTileXIndexes(extent) {
        this.tileX = Math.round(Math.abs(-180.0 - extent.southWest.lon) / (extent.northEast.lon - extent.southWest.lon));
        let p2 = (1 << this.tileZoom) * 2;
        this.tileXE = (this.tileX + 1) % p2;
        this.tileXW = (p2 + this.tileX - 1) % p2;
    }
}
