import { RenderNode } from './RenderNode';
import { WebGLBufferExt, WebGLTextureExt, Texture3DParams } from "../webgl/Handler";
declare class SkyBox extends RenderNode {
    params: Texture3DParams;
    vertexPositionBuffer: WebGLBufferExt | null;
    texture: WebGLTextureExt | null;
    constructor(params: Texture3DParams);
    static createDefault(RESOURCES_URL: string): SkyBox;
    init(): void;
    frame(): void;
    protected _createBuffers(): void;
}
export { SkyBox };
