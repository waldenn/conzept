/**
 * Scene node base class.
 * @class
 * @param {string} name - Node name.
 */
declare class BaseNode {
    static __counter__: number;
    protected __id: number;
    /**
     * Node name.
     * @public
     * @type {string}
     */
    protected _name: string;
    /**
     * Top scene tree node pointer.
     * @public
     * @type {BaseNode}
     */
    topNode: BaseNode;
    protected _dictionary: Record<string, BaseNode>;
    /**
     * Children nodes.
     * @public
     * @type {Array.<BaseNode>}
     */
    childNodes: BaseNode[];
    /**
     * Parent node pointer.
     * @public
     * @type {BaseNode}
     */
    parentNode: BaseNode | null;
    constructor(name?: string);
    get name(): string;
    /**
     * Adds node to the current hierarchy.
     * @public
     * @type {BaseNode}
     */
    addNode(node: BaseNode): void;
    /**
     * Destroy node.
     * @public
     */
    destroy(): void;
    /**
     * Gets node by name in the current.
     * @public
     * @param {string} name - Node name.
     * @return {RenderNode} Node object in the current node.
     */
    getNodeByName(name: string): BaseNode;
    /**
     * Clear current node.
     * @protected
     */
    protected _clear(): void;
    isEqual(node: BaseNode): boolean;
}
export { BaseNode };
