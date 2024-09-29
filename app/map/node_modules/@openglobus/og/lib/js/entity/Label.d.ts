import { BaseBillboard, IBaseBillboardParams } from "./BaseBillboard";
import { NumberArray4, Vec4 } from "../math/Vec4";
import { FontAtlas } from "../utils/FontAtlas";
import { LabelHandler } from "./LabelHandler";
export interface ILabelParams extends IBaseBillboardParams {
    text?: string;
    face?: string;
    size?: number;
    opacity?: number;
    outline?: number;
    outlineColor?: string | NumberArray4 | Vec4;
    align?: string;
    isRTL?: boolean;
    letterSpacing?: number;
}
declare const ALIGN: Record<string, number>;
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
declare class Label extends BaseBillboard {
    _handler: LabelHandler | null;
    /**
     * Label text string.
     * @protected
     * @type {string}
     */
    protected _text: string;
    /**
     * HTML5 font face.
     * @private
     * @type {string}
     */
    protected _face: string;
    /**
     * Font size in pixels.
     * @protected
     * @type {number}
     */
    protected _size: number;
    /**
     * Label outline.
     * @protected
     * @type {number}
     */
    protected _outline: number;
    /**
     * Label outline color.
     * @protected
     * @type {Vec4}
     */
    protected _outlineColor: Vec4;
    /**
     * Text horizontal align: "left", "right" and "center".
     * @private
     * @type {Label.ALIGN}
     */
    protected _align: number;
    /**
     * Label font atlas index.
     * @protected
     * @type {number}
     */
    protected _fontIndex: number;
    /**
     * Font atlas pointer.
     * @private
     * @type {FontAtlas}
     */
    protected _fontAtlas: FontAtlas | null;
    protected _isRTL: boolean;
    protected _letterSpacing: number;
    constructor(options?: ILabelParams);
    /**
     * Set label text.
     * @public
     * @param {string} text - Text string.
     * It can't be bigger than maximum labelHandler _maxLetters value.
     */
    setText(text: string): void;
    /**
     * Set text letter spacing.
     * @public
     * @param {number} spacing - Letter spacing.
     */
    setLetterSpacing(letterSpacing: number): void;
    /**
     * Returns label text letter spacing.
     * @public
     * @param {number} spacing - Letter spacing.
     */
    getLetterSpacing(): number;
    /**
     * Change text direction.
     * @public
     * @param {boolean} isRTL - Text string.
     */
    setRtl(isRTL: boolean): void;
    /**
     * Gets current text string.
     * @public
     * @returns {string}
     */
    getText(): string;
    /**
     * Sets label text align. Could be center, left or right. Left is default.
     * @public
     * @param {string} align - Text align.
     */
    setAlign(align: string): void;
    /**
     * Gets label text current alignment.
     * @public
     * @returns {string}
     */
    getAlign(): number;
    /**
     * Sets font face family.
     * @public
     * @param {string} face - Font face family.
     */
    setFace(face: string): void;
    /**
     * Gets current font face.
     * @public
     * @returns {string}
     */
    getFace(): string;
    /**
     * Sets label font size in pixels.
     * @public
     * @param {number} size - Label size in pixels.
     */
    setSize(size: number): void;
    /**
     * Gets label size in pixels.
     * @public
     * @returns {number}
     */
    getSize(): number;
    /**
     * Sets text outline border size. Where 0 - is no outline, and 1 - is the maximum outline size.
     * @public
     * @param {number} outline - Text outline size.
     */
    setOutline(outline: number): void;
    /**
     * Gets text current outline size.
     * @public
     * @returns {number}
     */
    getOutline(): number;
    /**
     * Sets label opacity.
     * @public
     * @param {number} a - Label opacity.
     */
    setOpacity(a: number): void;
    /**
     * Sets text outline color.
     * @public
     * @param {number} r - Red.
     * @param {number} g - Green.
     * @param {number} b - Blue.
     * @param {number} a - Alpha.
     */
    setOutlineColor(r: number, g: number, b: number, a: number): void;
    /**
     * Sets text outline color.
     * @public
     * @param {Vec4} rgba - Color vector.
     */
    setOutlineColor4v(rgba: Vec4): void;
    /**
     * Sets text outline color HTML string.
     * @public
     * @param {string} color - HTML string color.
     */
    setOutlineColorHTML(color: string): void;
    /**
     * Gets outline color vector.
     * @public
     * @returns {Vec4}
     */
    getOutlineColor(): Vec4;
    /**
     * Sets outline opacity. Actually outline color alpha value.
     * @public
     * @param {number} opacity - Outline opacity.
     */
    setOutlineOpacity(opacity: number): void;
    /**
     * Gets outline opacity value.
     * @public
     * @returns {number}
     */
    getOutlineOpacity(): number;
    /**
     * Updates label parameters.
     * @public
     */
    update(): Promise<void>;
    protected _applyFontIndex(fontIndex: number): void;
    /**
     * Assigns font atlas and update.
     * @public
     * @param {FontAtlas} fontAtlas - Font atlas.
     */
    assignFontAtlas(fontAtlas: FontAtlas): void;
    serializeWorkerData(workerId: number): Float32Array | null;
}
export { Label, ALIGN };
