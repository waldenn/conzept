import { EPSG3857 } from "../proj/EPSG3857";
export class QuadTreeStrategy {
    constructor(planet, name = "", proj = EPSG3857) {
        this.name = name;
        this.projection = proj;
        this._planet = planet;
        this._quadTreeList = [];
    }
    destroyBranches() {
        for (let i = 0, len = this._quadTreeList.length; i < len; i++) {
            this._quadTreeList[i].destroyBranches();
        }
    }
    clearLayerMaterial(layer) {
        let lid = layer.__id;
        for (let i = 0, len = this._quadTreeList.length; i < len; i++) {
            this._quadTreeList[i].traverseTree(function (node) {
                let mats = node.segment.materials;
                if (mats[lid]) {
                    mats[lid].clear();
                    //@ts-ignore
                    mats[lid] = null;
                    //delete mats[lid];
                }
            });
        }
    }
    get planet() {
        return this._planet;
    }
    init() {
    }
    preRender() {
        for (let i = 0; i < this._quadTreeList.length; i++) {
            let quadTree = this._quadTreeList[i];
            quadTree.createChildrenNodes();
            quadTree.segment.createPlainSegment();
            for (let j = 0; j < quadTree.nodes.length; j++) {
                quadTree.nodes[j].segment.createPlainSegment();
            }
        }
    }
    preLoad() {
        for (let i = 0; i < this._quadTreeList.length; i++) {
            let quadTree = this._quadTreeList[i];
            quadTree.segment.passReady = true;
            quadTree.renderNode(1);
            this._planet.normalMapCreator.drawSingle(quadTree.segment);
            for (let j = 0; j < quadTree.nodes.length; j++) {
                quadTree.nodes[j].segment.passReady = true;
                quadTree.nodes[j].renderNode(1);
                this._planet._normalMapCreator.drawSingle(quadTree.nodes[j].segment);
            }
        }
    }
    collectRenderNodes() {
        for (let i = 0; i < this._quadTreeList.length; i++) {
            this._quadTreeList[i].renderTree(this._planet.camera, 0, null);
        }
    }
    clear() {
        for (let i = 0; i < this._quadTreeList.length; i++) {
            this._quadTreeList[i].clearTree();
        }
    }
    get quadTreeList() {
        return this._quadTreeList;
    }
}
