import { Layer } from "./Layer";
import { Node } from "../quadTree/Node";
import { Segment } from "../segment/Segment";
import { WebGLTextureExt } from "../webgl/Handler";
import { NumberArray4 } from "../math/Vec4";
/**
 * @class Material
 * @param {Segment} segment
 * @param {Layer} layer
 */
declare class Material {
    segment: Segment;
    layer: Layer;
    isReady: boolean;
    isLoading: boolean;
    texture: WebGLTextureExt | null;
    pickingMask: WebGLTextureExt | null;
    textureExists: boolean;
    appliedNodeId: number;
    appliedNode: Node | null;
    texOffset: NumberArray4;
    loadingAttempts: number;
    _updateTexture: WebGLTextureExt | null;
    _updatePickingMask: WebGLTextureExt | null;
    pickingReady: boolean;
    constructor(segment: Segment, layer: Layer);
    abortLoading(): void;
    _createTexture(img: HTMLCanvasElement | ImageBitmap | HTMLImageElement): any;
    applyImage(img: HTMLCanvasElement | ImageBitmap | HTMLImageElement): void;
    applyTexture(texture: WebGLTextureExt | null, pickingMask?: WebGLTextureExt | null): void;
    textureNotExists(): void;
    clear(): void;
}
export { Material };
