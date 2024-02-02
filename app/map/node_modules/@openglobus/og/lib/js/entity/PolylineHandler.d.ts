import { EntityCollection } from "./EntityCollection";
import { Polyline } from "./Polyline";
import { Renderer } from "../renderer/Renderer";
import { RenderNode } from "../scene/RenderNode";
declare class PolylineHandler {
    static __counter__: number;
    protected __id: number;
    _entityCollection: EntityCollection;
    pickingEnabled: boolean;
    protected _renderer: Renderer | null;
    protected _polylines: Polyline[];
    constructor(entityCollection: EntityCollection);
    protected _initProgram(): void;
    setRenderNode(renderNode: RenderNode): void;
    add(polyline: Polyline): void;
    remove(polyline: Polyline): void;
    reindexPolylineArray(startIndex: number): void;
    draw(): void;
    drawPicking(): void;
    clear(): void;
}
export { PolylineHandler };
