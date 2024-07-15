export class BaseFramebuffer {
    constructor(handler, options = {}) {
        this.handler = handler;
        this._fbo = null;
        this._width = options.width || handler.canvas.width;
        this._height = options.height || handler.canvas.height;
        this._depthComponent = options.depthComponent != undefined ? options.depthComponent : "DEPTH_COMPONENT16";
        this._useDepth = options.useDepth != undefined ? options.useDepth : true;
        this._active = false;
        this._size = options.size || 1;
        this._depthRenderbuffer = null;
        this._filter = options.filter || "NEAREST";
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    /**
     * Sets framebuffer viewport size.
     * @public
     * @param {number} width - Framebuffer width.
     * @param {number} height - Framebuffer height.
     * @param {boolean} [forceDestroy] -
     */
    setSize(width, height, forceDestroy = false) {
        this._width = width;
        this._height = height;
        if (this._active) {
            this.handler.gl.viewport(0, 0, this._width, this._height);
        }
        if (this._useDepth || forceDestroy) {
            this.destroy();
            this.init();
        }
    }
    init() {
    }
    destroy() {
    }
    /**
     * Returns framebuffer completed.
     * @public
     * @returns {boolean} -
     */
    isComplete() {
        let gl = this.handler.gl;
        return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    }
    checkStatus() {
        let gl = this.handler.gl;
        return gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    }
    /**
     * Activate framebuffer frame to draw.
     * @public
     * @returns {Framebuffer} Returns Current framebuffer.
     */
    activate() {
        let gl = this.handler.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
        gl.viewport(0, 0, this._width, this._height);
        this._active = true;
        let c = this.handler.framebufferStack.current().data;
        c && (c._active = false);
        this.handler.framebufferStack.push(this);
        return this;
    }
    /**
     * Deactivate framebuffer frame.
     * @public
     */
    deactivate() {
        let h = this.handler, gl = h.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this._active = false;
        let f = this.handler.framebufferStack.popPrev();
        if (f) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, f._fbo);
            gl.viewport(0, 0, f._width, f._height);
        }
        else {
            gl.viewport(0, 0, h.canvas.width, h.canvas.height);
        }
    }
}
