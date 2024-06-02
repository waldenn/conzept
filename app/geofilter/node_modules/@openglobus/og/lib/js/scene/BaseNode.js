/**
 * Scene node base class.
 * @class
 * @param {string} name - Node name.
 */
class BaseNode {
    constructor(name) {
        this.__id = BaseNode.__counter__++;
        this._name = name || `nonameNode:${this.__id}`;
        this.topNode = this;
        this._dictionary = {};
        this._dictionary[this._name] = this;
        this.childNodes = [];
        this.parentNode = null;
    }
    get name() {
        return this._name;
    }
    /**
     * Adds node to the current hierarchy.
     * @public
     * @type {BaseNode}
     */
    addNode(node) {
        if (this.parentNode == null) {
            node.topNode = this;
        }
        else {
            node.topNode = this.topNode;
        }
        node.parentNode = this;
        node._dictionary = this.topNode._dictionary;
        this.childNodes.push(node);
        this.topNode._dictionary[node.name] = node;
    }
    /**
     * Destroy node.
     * @public
     */
    destroy() {
        for (let i = 0; i < this.childNodes.length; i++) {
            this.childNodes[i].destroy();
        }
        this._clear();
    }
    /**
     * Gets node by name in the current.
     * @public
     * @param {string} name - Node name.
     * @return {RenderNode} Node object in the current node.
     */
    getNodeByName(name) {
        return this._dictionary[name];
    }
    /**
     * Clear current node.
     * @protected
     */
    _clear() {
        this.parentNode = null;
        this.topNode = this;
        this.childNodes.length = 0;
    }
    isEqual(node) {
        return node.__id === this.__id;
    }
}
BaseNode.__counter__ = 0;
export { BaseNode };
