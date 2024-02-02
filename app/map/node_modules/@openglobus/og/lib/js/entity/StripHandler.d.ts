import { EntityCollection } from "./EntityCollection";
import { Renderer } from "../renderer/Renderer";
import { RenderNode } from "../scene/RenderNode";
import { Strip } from "./Strip";
declare class StripHandler {
    static __counter__: number;
    protected __id: number;
    /**
     * Picking rendering option.
     * @public
     * @type {boolean}
     */
    pickingEnabled: boolean;
    /**
     * Parent collection
     * @protected
     * @type {EntityCollection}
     */
    protected _entityCollection: EntityCollection;
    /**
     * Renderer
     * @protected
     * @type {Renderer | null}
     */
    protected _renderer: Renderer | null;
    /**
     * Strip objects array
     * @protected
     * @type {Array.<Strip>}
     */
    protected _strips: Strip[];
    constructor(entityCollection: EntityCollection);
    protected _initProgram(): void;
    setRenderNode(renderNode: RenderNode): void;
    add(strip: Strip): void;
    remove(strip: Strip): void;
    reindexStripArray(startIndex: number): void;
    draw(): void;
    drawPicking(): void;
    clear(): void;
}
export { StripHandler };
