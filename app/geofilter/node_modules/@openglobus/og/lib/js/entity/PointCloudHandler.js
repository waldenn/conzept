import * as shaders from "../shaders/pointCloud";
class PointCloudHandler {
    constructor(entityCollection) {
        /**
         * Picking rendering option.
         * @public
         * @type {boolean}
         */
        this.pickingEnabled = true;
        this.__id = PointCloudHandler.__counter__++;
        this.pickingEnabled = true;
        this._entityCollection = entityCollection;
        this._renderer = null;
        this._pointClouds = [];
    }
    _initProgram() {
        if (this._renderer && this._renderer.handler) {
            if (!this._renderer.handler.programs.pointCloud) {
                this._renderer.handler.addProgram(shaders.pointCloud());
            }
        }
    }
    setRenderNode(renderNode) {
        this._renderer = renderNode.renderer;
        this._initProgram();
        for (let i = 0; i < this._pointClouds.length; i++) {
            this._pointClouds[i].setRenderNode(renderNode);
        }
    }
    add(pointCloud) {
        if (pointCloud._handlerIndex === -1) {
            pointCloud._handler = this;
            pointCloud._handlerIndex = this._pointClouds.length;
            this._pointClouds.push(pointCloud);
            this._entityCollection &&
                this._entityCollection.renderNode &&
                pointCloud.setRenderNode(this._entityCollection.renderNode);
        }
    }
    remove(pointCloud) {
        let index = pointCloud._handlerIndex;
        if (index !== -1) {
            pointCloud._deleteBuffers();
            pointCloud._handlerIndex = -1;
            pointCloud._handler = null;
            this._pointClouds.splice(index, 1);
            this._reindexPointCloudArray(index);
        }
    }
    _reindexPointCloudArray(startIndex) {
        let pc = this._pointClouds;
        for (let i = startIndex; i < pc.length; i++) {
            pc[i]._handlerIndex = i;
        }
    }
    draw() {
        let i = this._pointClouds.length;
        while (i--) {
            this._pointClouds[i].draw();
        }
    }
    drawPicking() {
        if (this.pickingEnabled) {
            let i = this._pointClouds.length;
            while (i--) {
                this._pointClouds[i].drawPicking();
            }
        }
    }
    clear() {
        let i = this._pointClouds.length;
        while (i--) {
            this._pointClouds[i]._deleteBuffers();
            this._pointClouds[i]._handler = null;
            this._pointClouds[i]._handlerIndex = -1;
        }
        this._pointClouds.length = 0;
        this._pointClouds = [];
    }
}
PointCloudHandler.__counter__ = 0;
export { PointCloudHandler };
