import { Layer } from "../layer/Layer";
import { Node } from "../quadTree/Node";
import { Planet } from "../scene/Planet";
import { Proj } from "../proj/Proj";
export declare class QuadTreeStrategy {
    name: string;
    projection: Proj;
    protected _planet: Planet;
    /**
     * grid tree list.
     * @protected
     * @type {Node[]}
     */
    protected _quadTreeList: Node[];
    constructor(planet: Planet, name?: string, proj?: Proj);
    destroyBranches(): void;
    clearLayerMaterial(layer: Layer): void;
    get planet(): Planet;
    init(): void;
    preRender(): void;
    preLoad(): void;
    collectRenderNodes(): void;
    clear(): void;
    get quadTreeList(): Node[];
}
