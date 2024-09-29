import { Extent } from "../Extent";
import { Layer } from "../layer/Layer";
import { Node } from "../quadTree/Node";
import { Planet } from "../scene/Planet";
import { Segment } from "./Segment";
import { LonLat } from "../LonLat";
import { Entity } from "../entity/Entity";
import { PlanetCamera } from "../camera/PlanetCamera";
import { WebGLTextureExt } from "../webgl/Handler";
export declare const POLE_PIECE_SIZE: number;
/**
 * Planet segment Web Mercator tile class that stored and rendered with quad tree.
 * @class
 * @extends {Segment}
 */
declare class SegmentLonLat extends Segment {
    constructor(node: Node, planet: Planet, tileZoom: number, extent: Extent);
    _setExtentLonLat(): void;
    projectNative(coords: LonLat): LonLat;
    getInsideLonLat(obj: Entity | PlanetCamera): LonLat;
    protected _getMaxZoom(): number;
    checkZoom(): boolean;
    protected _assignTileIndexes(): void;
    protected _assignTileXIndexes(extent: Extent): void;
    protected _assignTileYIndexes(extent: Extent): void;
    protected _projToDeg(lon: number, lat: number): LonLat;
    protected _assignGlobalTextureCoordinates(): void;
    /**
     * @param layer
     * @protected
     *
     * @todo simplify layer._extentMerc in layer.getNativeExtent(this)
     *
     */
    protected _getLayerExtentOffset(layer: Layer): [number, number, number, number];
    layerOverlap(layer: Layer): boolean;
    getDefaultTexture(): WebGLTextureExt | null;
    getExtentLonLat(): Extent;
}
export { SegmentLonLat };
