import { GLTF, GLTFLoaderPlugin, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader.js';
export default class GLTFMaterialsVariantsExtension implements GLTFLoaderPlugin {
    parser: GLTFParser;
    name: string;
    constructor(parser: GLTFParser);
    afterRoot(gltf: GLTF): Promise<void> | null;
}
