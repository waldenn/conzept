import { BaseNode } from "./BaseNode";
import { Renderer } from "../renderer/Renderer";
import { LightSource } from "../light/LightSource";
import { EntityCollection } from "../entity/EntityCollection";
/**
 * Render node is a logical part of a render mechanism. Represents scene rendering.
 * For example one scene node for rendering the Earth, another one for rendering the Moon, another node for rendering stars etc.
 * Each render node has own model view space defined with matrices(scale, rotation, translation, transformation).
 * There are collections of light sources, entities and so on in the node.
 * Access to the node is renderer.renderNodes["Earth"]
 * @class
 * @extends {BaseNode}
 * @param {string} name - Node name.
 */
declare class RenderNode extends BaseNode {
    /**
     * Renderer that calls frame() callback.
     * @public
     * @type {Renderer}
     */
    renderer: Renderer | null;
    drawMode: number;
    /** Show rendering.
     * @public
     */
    show: boolean;
    protected _isActive: boolean;
    childNodes: RenderNode[];
    /**
     * Lighting calculations.
     * @public
     * @type {boolean}
     */
    lightEnabled: boolean;
    /**
     * Point light array.
     * @public
     * @type {Array.<LightSource>}
     */
    _lights: LightSource[];
    _lightsNames: string[];
    _lightsPositions: number[];
    _lightsParamsv: number[];
    _lightsParamsf: number[];
    /**
     * Entity collection array.
     * @public
     * @type {Array.<EntityCollection>}
     */
    entityCollections: EntityCollection[];
    protected _pickingId: number;
    constructor(name?: string);
    /**
     * Adds node to the current hierarchy.
     * @public
     * @type {RenderNode}
     */
    addNode(node: RenderNode): void;
    /**
     * Assign render node with renderer.
     * @public
     * @param {Renderer} renderer - Render node's renderer.
     */
    assign(renderer: Renderer): void;
    initialize(): void;
    init(): void;
    onremove(): void;
    remove(): void;
    /**
     * Adds entity collection.
     * @public
     * @param {EntityCollection} entityCollection - Entity collection.
     * @param {boolean} [isHidden] - If it's true that this collection has specific rendering.
     * @returns {RenderNode} -
     */
    addEntityCollection(entityCollection: EntityCollection, isHidden?: boolean): RenderNode;
    /**
     * Removes entity collection.
     * @public
     * @param {EntityCollection} entityCollection - Entity collection for remove.
     */
    removeEntityCollection(entityCollection: EntityCollection): void;
    /**
     * Adds point light source.
     * @public
     * @param {LightSource} light - Light source.
     * @returns {RenderNode}
     */
    addLight(light: LightSource): RenderNode;
    /**
     * Gets light object by its name.
     * @public
     * @param {string} name - Point light name.
     * @returns {LightSource}
     */
    getLightByName(name: string): LightSource | undefined;
    /**
     * Removes light source.
     * @public
     * @param {LightSource} light - Light source object.
     */
    removeLight(light: LightSource): void;
    /**
     * Calls render frame node's callback. Used in renderer.
     * @public
     */
    preDrawNode(): void;
    /**
     * Calls render frame node's callback. Used in renderer.
     * @public
     */
    drawNode(): void;
    /**
     * Gets render node activity.
     * @public
     * @returns {Boolean} -
     */
    isActive(): boolean;
    /**
     * Rendering activation.
     * @public
     * @param {boolean} isActive - Activation flag.
     */
    setActive(isActive: boolean): void;
    /**
     * Sets draw mode
     * @public
     * @param {Number} mode - Draw mode, such as gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.LINES etc.
     */
    setDrawMode(mode: number): void;
    /**
     * IMPORTANT: This function have to be called manually in each render node frame callback, before drawing scene geometry.
     * @public
     */
    transformLights(): void;
    updateBillboardsTexCoords(): void;
    frame(): void;
    preFrame(): void;
    protected _preDrawNodes(): void;
    protected _drawNodes(): void;
    drawEntityCollections(ec: EntityCollection[]): void;
    /**
     * Draw entity collections picking frame.
     * @public
     * @param {Array<EntityCollection>} ec - Entity collection array.
     */
    drawPickingEntityCollections(ec: EntityCollection[]): void;
    protected _entityCollectionPickingCallback(): void;
}
export { RenderNode };
