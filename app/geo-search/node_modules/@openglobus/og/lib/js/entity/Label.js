import * as utils from "../utils/shared";
import { BaseBillboard } from "./BaseBillboard";
import { LOCK_FREE, LOCK_UPDATE } from "./LabelWorker";
import { Vec4 } from "../math/Vec4";
const ALIGN = {
    RIGHT: 0,
    LEFT: 1,
    CENTER: 2
};
/**
 * Text align options.
 * @readonly
 * @enum {number}
 */
const STR2ALIGN = {
    left: ALIGN.LEFT,
    right: ALIGN.RIGHT,
    center: ALIGN.CENTER
};
/**
 * Billboard text label.
 * @class
 * @extends {BaseBillboard}
 * @param {Object} [options] - Label options:
 * @param {Vec3|Array.<number>} [options.position] - Billboard spatial position.
 * @param {number} [options.rotation] - Screen angle rotation.
 * @param {Vec4|string|Array.<number>} [options.color] - Billboard color.
 * @param {Vec3|Array.<number>} [options.alignedAxis] - Billboard aligned vector.
 * @param {Vec3|Array.<number>} [options.offset] - Billboard center screen offset.
 * @param {boolean} [options.visibility] - Visibility.
 * @param {string} [options.text] - Text string.
 * @param {string} [options.face] - HTML5 font face.
 * @param {number} [options.size] - Font size in pixels.
 * @param {string} [options.style] - HTML5 font style. Example 'normal', 'italic'.
 * @param {string} [options.weight] - HTML5 font weight. Example 'normal', 'bold'.
 * @param {number} [options.outline] - Text outline size. 0 - no outline, 1 - maximum outline. Default 0.58.
 * @param {Vec4|string|Array.<number>} [options.outlineColor] - Outline color.
 * @param {string} [options.align] - Text horizontal align: "left", "right" and "center".
 */
class Label extends BaseBillboard {
    constructor(options = {}) {
        super(options);
        this._handler = null;
        this._text = options.text || "";
        this._face = utils.defaultString(options.face, "arial");
        this._size = options.size || 24;
        this._outline = options.outline != undefined ? options.outline : 0.0;
        this._outlineColor = utils.createColorRGBA(options.outlineColor, new Vec4(0.0, 0.0, 0.0, 1.0));
        this._align = options.align ? STR2ALIGN[options.align.trim().toLowerCase()] || ALIGN.RIGHT : ALIGN.RIGHT;
        this._fontIndex = 0;
        this._fontAtlas = null;
        this._isRTL = options.isRTL || false;
    }
    /**
     * Set label text.
     * @public
     * @param {string} text - Text string.
     * It can't be bigger than maximum labelHandler _maxLetters value.
     */
    setText(text) {
        this._text = text.toString();
        if (this._isReady && this._handler) {
            this._handler.setText(this._handlerIndex, text, this._fontIndex, this._align, this._isRTL);
        }
    }
    /**
     * Gets current text string.
     * @public
     * @returns {string}
     */
    getText() {
        return this._text;
    }
    /**
     * Sets label text align. Could be center, left or right. Left is default.
     * @public
     * @param {string} align - Text align.
     */
    setAlign(align) {
        this._align = STR2ALIGN[align.trim().toLowerCase()];
        if (this._isReady && this._handler) {
            this._handler.setText(this._handlerIndex, this._text, this._fontIndex, this._align, this._isRTL);
        }
        else if (this._lockId !== LOCK_FREE) {
            this._lockId = LOCK_UPDATE;
        }
    }
    /**
     * Gets label text current alignment.
     * @public
     * @returns {string}
     */
    getAlign() {
        return this._align;
    }
    /**
     * Sets font face family.
     * @public
     * @param {string} face - Font face family.
     */
    setFace(face) {
        this._face = face.trim();
        this.update();
    }
    /**
     * Gets current font face.
     * @public
     * @returns {string}
     */
    getFace() {
        return this._face;
    }
    /**
     * Sets label font size in pixels.
     * @public
     * @param {number} size - Label size in pixels.
     */
    setSize(size) {
        if (size !== this._size) {
            this._size = size;
            if (this._isReady && this._handler) {
                this._handler.setSizeArr(this._handlerIndex, size);
            }
            else if (this._lockId !== LOCK_FREE) {
                this._lockId = LOCK_UPDATE;
            }
        }
    }
    /**
     * Gets label size in pixels.
     * @public
     * @returns {number}
     */
    getSize() {
        return this._size;
    }
    /**
     * Sets text outline border size. Where 0 - is no outline, and 1 - is the maximum outline size.
     * @public
     * @param {number} outline - Text outline size.
     */
    setOutline(outline) {
        this._outline = outline;
        if (this._isReady && this._handler) {
            this._handler.setOutlineArr(this._handlerIndex, outline);
        }
        else if (this._lockId !== LOCK_FREE) {
            this._lockId = LOCK_UPDATE;
        }
    }
    /**
     * Gets text current outline size.
     * @public
     * @returns {number}
     */
    getOutline() {
        return this._outline;
    }
    /**
     * Sets label opacity.
     * @public
     * @param {number} a - Label opacity.
     */
    setOpacity(a) {
        super.setOpacity(a);
        this.setOutlineOpacity(a);
    }
    /**
     * Sets text outline color.
     * @public
     * @param {number} r - Red.
     * @param {number} g - Green.
     * @param {number} b - Blue.
     * @param {number} a - Alpha.
     */
    setOutlineColor(r, g, b, a) {
        if (a !== this._outlineColor.w || r !== this._outlineColor.x || g !== this._outlineColor.y || b !== this._outlineColor.z) {
            this._outlineColor.x = r;
            this._outlineColor.y = g;
            this._outlineColor.z = b;
            this._outlineColor.w = a;
            if (this._isReady && this._handler) {
                this._handler.setOutlineColorArr(this._handlerIndex, this._outlineColor);
            }
            else if (this._lockId !== LOCK_FREE) {
                this._lockId = LOCK_UPDATE;
            }
        }
    }
    /**
     * Sets text outline color.
     * @public
     * @param {Vec4} rgba - Color vector.
     */
    setOutlineColor4v(rgba) {
        this.setOutlineColor(rgba.x, rgba.y, rgba.z, rgba.w);
    }
    /**
     * Sets text outline color HTML string.
     * @public
     * @param {string} color - HTML string color.
     */
    setOutlineColorHTML(color) {
        this.setOutlineColor4v(utils.htmlColorToRgba(color));
    }
    /**
     * Gets outline color vector.
     * @public
     * @returns {Vec4}
     */
    getOutlineColor() {
        return this._outlineColor;
    }
    /**
     * Sets outline opacity. Actually outline color alpha value.
     * @public
     * @param {number} opacity - Outline opacity.
     */
    setOutlineOpacity(opacity) {
        if (opacity !== this._outlineColor.w) {
            this._outlineColor.w = opacity;
            if (this._isReady && this._handler) {
                this._handler.setOutlineColorArr(this._handlerIndex, this._outlineColor);
            }
            else if (this._lockId !== LOCK_FREE) {
                this._lockId = LOCK_UPDATE;
            }
        }
    }
    /**
     * Gets outline opacity value.
     * @public
     * @returns {number}
     */
    getOutlineOpacity() {
        return this._outlineColor.w;
    }
    /**
     * Updates label parameters.
     * @public
     */
    async update() {
        if (this._fontAtlas) {
            const fontIndex = await this._fontAtlas.getFontIndex(this._face);
            this._applyFontIndex(fontIndex);
        }
    }
    _applyFontIndex(fontIndex) {
        this._fontIndex = fontIndex;
        if (this._isReady && this._handler) {
            this._handler.setFontIndexArr(this._handlerIndex, this._fontIndex);
            this._handler.setText(this._handlerIndex, this._text, this._fontIndex, this._align, this._isRTL);
        }
        else if (this._lockId !== LOCK_FREE) {
            this._lockId = LOCK_UPDATE;
        }
    }
    /**
     * Assigns font atlas and update.
     * @public
     * @param {FontAtlas} fontAtlas - Font atlas.
     */
    assignFontAtlas(fontAtlas) {
        if (!this._fontAtlas) {
            this._fontAtlas = fontAtlas;
        }
        this.update();
    }
    serializeWorkerData(workerId) {
        if (this._handler) {
            return new Float32Array([
                /*0*/ workerId,
                /*1*/ this._handler._maxLetters,
                /*2*/ this.getVisibility() ? 1 : 0,
                /*3, 4, 5*/ this._positionHigh.x, this._positionHigh.y, this._positionHigh.z,
                /*6, 7, 8*/ this._positionLow.x, this._positionLow.y, this._positionLow.z,
                /*9*/ this._size,
                /*10, 11, 12*/ this._offset.x, this._offset.y, this._offset.z,
                /*13, 14, 15, 16*/ this._color.x, this._color.y, this._color.z, this._color.w,
                /*17*/ this._rotation,
                /*18, 19, 20*/ this._alignedAxis.x, this._alignedAxis.y, this._alignedAxis.z,
                /*21*/ this._fontIndex,
                /*22*/ this._outline,
                /*23, 24, 25, 26*/ this._outlineColor.x, this._outlineColor.y, this._outlineColor.z, this._outlineColor.w,
                /*27, 28, 29*/ this._entity._pickingColor.x, this._entity._pickingColor.y, this._entity._pickingColor.z
            ]);
        }
        return null;
    }
}
export { Label, ALIGN };
