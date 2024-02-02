import * as utils from "../utils/shared";
import { Vec3 } from "../math/Vec3";
/**
 * Ray class.
 * @class
 * @param {Object} [options] - Options:
 * @param {Vec3|Array.<number>} [options.startPosition] - Ray start point position.
 * @param {Vec3|Array.<number>} [options.endPosition] - Ray end point position.
 * @param {Vec3|Array.<number>} [options.startColor] - Ray start point color.
 * @param {Vec3|Array.<number>} [options.endColor] - Ray end point color.
 * @param {boolean} [options.visibility] - Visibility.
 */
class Ray {
    constructor(options = {}) {
        this.__id = Ray.__counter__++;
        this._thickness = options.thickness || 2.0;
        this._startPosition = utils.createVector3(options.startPosition);
        this._startPositionHigh = new Vec3();
        this._startPositionLow = new Vec3();
        Vec3.doubleToTwoFloats(this._startPosition, this._startPositionHigh, this._startPositionLow);
        this._endPosition = utils.createVector3(options.endPosition);
        this._endPositionHigh = new Vec3();
        this._endPositionLow = new Vec3();
        Vec3.doubleToTwoFloats(this._endPosition, this._endPositionHigh, this._endPositionLow);
        this._startColor = utils.createColorRGBA(options.startColor);
        this._endColor = utils.createColorRGBA(options.endColor);
        this._visibility = options.visibility != undefined ? options.visibility : true;
        this._entity = null;
        this._handler = null;
        this._handlerIndex = -1;
    }
    /**
     * Sets ray start position.
     * @public
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} z - Z coordinate.
     */
    setStartPosition(x, y, z) {
        this._startPosition.x = x;
        this._startPosition.y = y;
        this._startPosition.z = z;
        Vec3.doubleToTwoFloats(this._startPosition, this._startPositionHigh, this._startPositionLow);
        this._handler &&
            this._handler.setStartPositionArr(this._handlerIndex, this._startPositionHigh, this._startPositionLow);
    }
    getLength() {
        return this._startPosition.distance(this._endPosition);
    }
    /**
     * Sets ray start position.
     * @public
     * @param {Vec3} position - Cartesian coordinates.
     */
    setStartPosition3v(position) {
        this._startPosition.x = position.x;
        this._startPosition.y = position.y;
        this._startPosition.z = position.z;
        Vec3.doubleToTwoFloats(this._startPosition, this._startPositionHigh, this._startPositionLow);
        this._handler &&
            this._handler.setStartPositionArr(this._handlerIndex, this._startPositionHigh, this._startPositionLow);
    }
    /**
     * Sets ray end position.
     * @public
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} z - Z coordinate.
     */
    setEndPosition(x, y, z) {
        this._endPosition.x = x;
        this._endPosition.y = y;
        this._endPosition.z = z;
        Vec3.doubleToTwoFloats(this._endPosition, this._endPositionHigh, this._endPositionLow);
        this._handler &&
            this._handler.setEndPositionArr(this._handlerIndex, this._endPositionHigh, this._endPositionLow);
    }
    /**
     * Sets ray end position.
     * @public
     * @param {Vec3} position - Cartesian coordinates.
     */
    setEndPosition3v(position) {
        this._endPosition.x = position.x;
        this._endPosition.y = position.y;
        this._endPosition.z = position.z;
        Vec3.doubleToTwoFloats(this._endPosition, this._endPositionHigh, this._endPositionLow);
        this._handler &&
            this._handler.setEndPositionArr(this._handlerIndex, this._endPositionHigh, this._endPositionLow);
    }
    setThickness(thickness) {
        this._thickness = thickness;
        this._handler && this._handler.setThicknessArr(this._handlerIndex, thickness);
    }
    setColors4v(startColor, endColor) {
        if (startColor) {
            this._startColor.x = startColor.x;
            this._startColor.y = startColor.y;
            this._startColor.z = startColor.z;
            this._startColor.w = startColor.w;
        }
        if (endColor) {
            this._endColor.x = endColor.x;
            this._endColor.y = endColor.y;
            this._endColor.z = endColor.z;
            this._endColor.w = endColor.w;
        }
        this._handler &&
            this._handler.setRgbaArr(this._handlerIndex, this._startColor, this._endColor);
    }
    setColorsHTML(startColor, endColor) {
        if (startColor) {
            this._startColor = utils.htmlColorToRgba(startColor);
        }
        if (endColor) {
            this._endColor = utils.htmlColorToRgba(endColor);
        }
        this._handler && this._handler.setRgbaArr(this._handlerIndex, this._startColor, this._endColor);
    }
    /**
     * Returns ray start position.
     * @public
     * @returns {Vec3}
     */
    getStartPosition() {
        return this._startPosition;
    }
    /**
     * Returns ray end position.
     * @public
     * @returns {Vec3}
     */
    getEndPosition() {
        return this._endPosition;
    }
    /**
     * Sets visibility.
     * @public
     * @param {boolean} visibility - Visibility flag.
     */
    setVisibility(visibility) {
        this._visibility = visibility;
        this._handler && this._handler.setVisibility(this._handlerIndex, visibility);
    }
    /**
     * Returns visibility.
     * @public
     * @returns {boolean}
     */
    getVisibility() {
        return this._visibility;
    }
    /**
     * Remove from handler.
     * @public
     */
    remove() {
        this._entity = null;
        this._handler && this._handler.remove(this);
    }
    /**
     * Set picking color.
     * @public
     * @param {Vec3} color - Picking color.
     */
    setPickingColor3v(color) {
        this._handler && this._handler.setPickingColorArr(this._handlerIndex, color);
    }
}
Ray.__counter__ = 0;
export { Ray };
