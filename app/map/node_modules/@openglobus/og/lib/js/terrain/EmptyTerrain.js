import { binarySearchFast } from "../utils/shared";
import { Geoid } from "./Geoid";
/**
 * Class represents terrain provider without elevation data.
 * @param {IEmptyTerrainParams} [options] - Provider options:
 * @param {string} [options.name="empty"] - Provider name.
 * @param {boolean} [options.equalizeVertices] -
 * @param {number} [options.minZoom=2] - Minimal visible zoom index when terrain handler works.
 * @param {number} [options.minZoom=50] - Maximal visible zoom index when terrain handler works.
 * @param {number} [options.maxNativeZoom=19] - Maximal available terrain zoom level.
 * @param {Array.<number>} [options.gridSizeByZoom] - Array of segment triangulation grid sizes where array index agreed to the segment zoom index.
 * @param {Array.<number>} [gridSizeByZoom] - Array of values, where each value corresponds to the size of a tile(or segment) on the globe. Each value must be power of two.
 * @param {Geoid} [options.geoid] -
 * @param {string} [options.geoidSrc] -
 */
class EmptyTerrain {
    constructor(options = {}) {
        this.__id = EmptyTerrain.__counter__++;
        this.equalizeVertices = options.equalizeVertices || false;
        this.equalizeNormals = false;
        this.isEmpty = true;
        this.name = options.name || "empty";
        this.minZoom = options.minZoom || 2;
        this.maxZoom = options.maxZoom || 19;
        this.maxNativeZoom = options.maxNativeZoom || this.maxZoom;
        this.gridSizeByZoom = options.gridSizeByZoom || [
            64, 32, 16, 8, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2
        ];
        this._maxNodeZoom = this.gridSizeByZoom.length - 1;
        this.plainGridSize = 2;
        this.noDataValues = [];
        this._planet = null;
        this._geoid = options.geoid || new Geoid({
            src: options.geoidSrc || null
        });
        this._isReady = false;
        // const _ellToAltFn = [
        //     (lon, lat, alt, callback) => callback(alt),
        //     (lon, lat, alt, callback) => callback(alt - this._geoid.getHeight(lon, lat)),
        //     (lon, lat, alt, callback) => {
        //         let x = mercator.getTileX(lon, zoom),
        //             y = mercator.getTileY(lat, zoom);
        //         let mslAlt = alt - this._geoid.getHeight(lon, lat);
        //         if (true) {
        //         } else {
        //         }
        //         return callback(mslAlt);
        //     },
        // ];
    }
    get isIdle() {
        return true;
    }
    isEqual(obj) {
        return obj.__id === this.__id;
    }
    static checkNoDataValue(noDataValues, value) {
        return binarySearchFast(noDataValues, value) !== -1;
    }
    isBlur(segment) {
        return false;
    }
    set maxNodeZoom(val) {
        if (val > this.gridSizeByZoom.length - 1) {
            val = this.gridSizeByZoom.length - 1;
        }
        this._maxNodeZoom = val;
    }
    get maxNodeZoom() {
        return this._maxNodeZoom;
    }
    set geoid(geoid) {
        this._geoid = geoid;
    }
    get geoid() {
        return this._geoid;
    }
    getGeoid() {
        return this._geoid;
    }
    /**
     * Loads or creates segment elevation data.
     * @public
     * @param {Segment} segment - Segment to create elevation data.
     */
    handleSegmentTerrain(segment) {
        segment.terrainIsLoading = false;
        segment.terrainReady = true;
        segment.terrainExists = true;
    }
    isReady() {
        return this._isReady;
    }
    abortLoading() {
    }
    clearCache() {
    }
    getHeightAsync(lonLat, callback) {
        callback(0);
        return true;
    }
    loadTerrain(segment, forceLoading = false) {
    }
}
EmptyTerrain.__counter__ = 0;
export { EmptyTerrain };
