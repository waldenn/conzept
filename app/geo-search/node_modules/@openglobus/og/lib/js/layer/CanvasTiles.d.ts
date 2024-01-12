import { EventCallback, EventsHandler } from "../Events";
import { ILayerParams, Layer, LayerEventsList } from "./Layer";
import { Material } from "../layer/Material";
import { NumberArray4 } from "../math/Vec4";
import { Planet } from "../scene/Planet";
type ApplyImageFunc = (material: HTMLCanvasElement | ImageBitmap | HTMLImageElement) => void;
type DrawTileCallback = (material: Material, applyImage: ApplyImageFunc) => void;
export interface ICanvasTilesParams extends ILayerParams {
    drawTile: DrawTileCallback;
    animated?: boolean;
    minNativeZoom?: number;
    maxNativeZoom?: number;
}
type CanvasTilesEventsList = [
    "load",
    "loadend"
];
type CanvasTilesEventsType = EventsHandler<CanvasTilesEventsList> & EventsHandler<LayerEventsList>;
/**
 * Layer used to rendering each tile as a separate canvas object.
 * @class
 * @extends {Layer}
 * @param {String} [name="noname"] - Layer name.
 * @param {ICanvasTilesParams} options:
 * @param {number} [options.opacity=1.0] - Layer opacity.
 * @param {number} [options.minZoom=0] - Minimal visibility zoom level.
 * @param {number} [options.maxZoom=0] - Maximal visibility zoom level.
 * @param {string} [options.attribution] - Layer attribution that displayed in the attribution area on the screen.
 * @param {boolean} [options.isBaseLayer=false] - Base layer flag.
 * @param {boolean} [options.visibility=true] - Layer visibility.
 * @param {DrawTileCallback} options.drawTile - Draw tile callback.
 * @fires EventsHandler<CanvasTilesEventsList>#load
 * @fires EventsHandler<CanvasTilesEventsList>#loadend
 */
declare class CanvasTiles extends Layer {
    static MAX_REQUESTS: number;
    static __requestsCounter: number;
    events: CanvasTilesEventsType;
    animated: boolean;
    minNativeZoom: number;
    maxNativeZoom: number;
    /**
     * Current creating tiles counter.
     * @protected
     * @type {number}
     */
    protected _counter: number;
    /**
     * Tile pending queue that waiting for create.
     * @protected
     * @type {Material[]}
     */
    protected _pendingsQueue: Material[];
    /**
     * Draw tile callback.
     * @type {DrawTileCallback}
     * @public
     */
    drawTile: DrawTileCallback;
    protected _onLoadend_: EventCallback | null;
    constructor(name: string | null, options: ICanvasTilesParams);
    addTo(planet: Planet): void;
    remove(): this;
    _onLoadend(): void;
    get instanceName(): string;
    get isIdle(): boolean;
    /**
     * Abort loading tiles.
     * @public
     */
    abortLoading(): void;
    /**
     * Sets layer visibility.
     * @public
     * @param {boolean} visibility - Layer visibility.
     */
    setVisibility(visibility: boolean): void;
    /**
     * Start to load tile material.
     * @public
     * @virtual
     * @param {Material} material -
     */
    loadMaterial(material: Material): void;
    /**
     * Loads material image and apply it to the planet segment.
     * @protected
     * @param {Material} material - Loads material image.
     */
    protected _exec(material: Material): void;
    protected _correctCounter(): void;
    /**
     * Abort exact material loading.
     * @public
     * @param {Material} material - Segment material.
     */
    abortMaterialLoading(material: Material): void;
    protected _dequeueRequest(): void;
    protected _whilePendings(): Material | null;
    applyMaterial(material: Material): NumberArray4;
    clearMaterial(material: Material): void;
}
export { CanvasTiles };
