import { Deferred } from '../Deferred';
import { Rectangle } from '../Rectangle';
import { TextureAtlas, TextureAtlasNode } from './TextureAtlas';
import { Handler } from "../webgl/Handler";
import { HTMLImageElementExt } from "./ImagesCacheManager";
interface IChar {
    id: number;
    char: string;
    width: number;
    height: number;
    x: number;
    y: number;
    chnl: number;
    index: number;
    page: number;
    xadvance: number;
    xoffset: number;
    yoffset: number;
}
interface IKerning {
    first: number;
    second: number;
    amount: number;
}
export interface IFontParams {
    common: {
        scaleH: number;
        scaleW: number;
    };
    info: {
        size: number;
    };
    distanceField: {
        distanceRange: number;
    };
    chars: IChar[];
    kernings: IKerning[];
    pages: string[];
}
declare class FontTextureAtlas extends TextureAtlas {
    width: number;
    height: number;
    gliphSize: number;
    distanceRange: number;
    nodes: Map<number, FontTextureAtlasNode>;
    kernings: Record<number, Record<number, number>>;
    constructor(width?: number, height?: number);
    get(key: number): FontTextureAtlasNode | undefined;
}
interface IMetrics extends IChar {
    nChar: string;
    nCode: number;
    nWidth: number;
    nHeight: number;
    nAdvance: number;
    nXOffset: number;
    nYOffset: number;
}
declare class FontTextureAtlasNode extends TextureAtlasNode {
    metrics: IMetrics;
    emptySize: number;
    constructor(rect: Rectangle, texCoords: number[]);
}
declare class FontAtlas {
    atlasesArr: FontTextureAtlas[];
    samplerArr: Uint32Array;
    sdfParamsArr: Float32Array;
    catalogSrc: string;
    protected atlasIndexes: Record<string, number>;
    protected atlasIndexesDeferred: Record<string, Deferred<number>>;
    protected tokenImageSize: number;
    protected _handler: Handler | null;
    constructor(catalogSrc?: string);
    assignHandler(handler: Handler): void;
    getFontIndex(face: string): Promise<number>;
    getFullIndex(face: string): string;
    protected _applyFontDataToAtlas(atlas: FontTextureAtlas, data: IFontParams, index?: number): void;
    initFont(faceName: string, dataJson: IFontParams, imageBase64: string): void;
    protected _createTexture(atlas: FontTextureAtlas, img: HTMLImageElementExt): void;
    loadFont(faceName: string, srcDir: string, atlasUrl: string): void;
}
export { FontAtlas };
