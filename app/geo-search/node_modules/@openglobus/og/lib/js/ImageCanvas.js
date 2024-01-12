/**
 * Usefull class for working with JS canvas object.
 * @class
 * @param {number} [width] - Canvas width. Default 256.
 * @param {number} [height] - Canvas height. Default 256.
 */
class ImageCanvas {
    constructor(width = 256, height = 256) {
        this._canvas = document.createElement("canvas");
        this._canvas.width = width;
        this._canvas.height = height;
        this._context = this._canvas.getContext("2d", {
            willReadFrequently: true
        });
    }
    /**
     * Returns canvas object.
     * @public
     * @returns {HTMLCanvasElement}
     */
    getCanvas() {
        return this._canvas;
    }
    /**
     * Returns canvas context pointer.
     * @public
     * @returns {CanvasRenderingContext2D}
     */
    getContext() {
        return this._context;
    }
    /**
     * Fills canvas RGBA with zeroes.
     * @public
     */
    fillEmpty() {
        let imgd = this._context.getImageData(0, 0, this._canvas.width, this._canvas.height);
        let pixels = imgd.data;
        for (let i = 0, n = pixels.length; i < n; i += 4) {
            pixels[i] = pixels[i + 1] = pixels[i + 2] = pixels[i + 3] = 0;
        }
        this._context.putImageData(imgd, 0, 0);
    }
    /**
     * Fills canvas RGBA with color.
     * @public
     * @param {string} color - CSS string color.
     */
    fill(color) {
        this._context.fillStyle = color;
        this._context.fill();
    }
    /**
     * Gets canvas pixels RGBA data.
     * @public
     * @returns {Uint8ClampedArray}
     */
    getData() {
        let imgd = this._context.getImageData(0, 0, this._canvas.width, this._canvas.height);
        return imgd.data;
    }
    /**
     * Fill the canvas by color.
     * @public
     * @param {string} color - CSS string color.
     */
    fillColor(color) {
        this._context.fillStyle = color;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
    /**
     * Sets RGBA pixel data.
     * @public
     * @param {Array.<number>} data - Array RGBA data.
     */
    setData(data) {
        let imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
        imageData.data.set(data);
        this._context.putImageData(imageData, 0, 0);
    }
    /**
     * Resize canvas.
     * @public
     * @param {number} width - Width.
     * @param {number} height - Height.
     */
    resize(width, height) {
        this._canvas.width = width;
        this._canvas.height = height;
        this._context = this._canvas.getContext("2d");
    }
    /**
     * Draw an image on the canvas.
     * @public
     * @param {Image} img - Draw image.
     * @param {number} [x] - Left top image corner X coordinate on the canvas.
     * @param {number} [y] - Left top image corner Y coordinate on the canvas.
     * @param {number} [width] - Image width slice. Image width is default.
     * @param {number} [height] - Image height slice. Image height is default.
     */
    drawImage(img, x, y, width, height) {
        this._context.drawImage(img, x || 0, y || 0, width || img.width, height || img.height);
    }
    /**
     * Converts canvas to JS image object.
     * @public
     * @returns {Image}
     */
    getImage() {
        let img = new Image();
        img.width = this.getWidth();
        img.height = this.getHeight();
        img.src = this._canvas.toDataURL("image/png");
        return img;
    }
    /**
     * Get measured text width.
     * @public
     * @param {string} text - Measured text.
     * @returns {number}
     */
    getTextWidth(text) {
        let metrics = this._context.measureText(text);
        return Math.round(metrics.width);
    }
    /**
     * Draw a text on the canvas.
     * @public
     * @param {string} text - Text.
     * @param {number} [x] - Canvas X - coordinate. 0 - default.
     * @param {number} [y] - Canvas Y - coordinate. 0 - default.
     * @param {string} [font] - Font style. 'normal 14px Verdana' - is default.
     * @param {string} [color] - Css font color.
     */
    drawText(text, x = 0, y = 14, font = "normal 14px Verdana", color = "black") {
        this._context.fillStyle = color;
        this._context.font = font;
        this._context.fillText(text, x, y);
    }
    /**
     * Gets canvas width.
     * @public
     * @returns {number}
     */
    getWidth() {
        return this._canvas.width;
    }
    /**
     * Gets canvas height.
     * @public
     * @returns {number}
     */
    getHeight() {
        return this._canvas.height;
    }
    /**
     * Load image to canvas.
     * @public
     * @param {string} url - Image url.
     * @param {Function} [callback] - Image onload callback.
     */
    load(url, callback) {
        let img = new Image();
        let that = this;
        img.onload = function () {
            that.resize(img.width, img.height);
            that._context.drawImage(img, 0, 0, img.width, img.height);
            callback && callback(img);
        };
        img.src = url;
    }
    /**
     * Open canvas image in the new window.
     * @public
     */
    openImage() {
        let img = this.getImage();
        let dataUrl = img.src;
        let windowContent = "<!DOCTYPE html>";
        windowContent += "<html>";
        windowContent += "<head><title>Print</title></head>";
        windowContent += "<body>";
        windowContent += '<img src="' + dataUrl + '">';
        windowContent += "</body>";
        windowContent += "</html>";
        let printWin = window.open("", "", "width=" + img.width + "px ,height=" + img.height + "px");
        if (printWin) {
            printWin.document.open();
            printWin.document.write(windowContent);
            printWin.document.close();
            printWin.focus();
        }
    }
    destroy() {
        this._canvas.width = 1;
        this._canvas.height = 1;
        //@ts-ignore
        this._canvas = null;
        //@ts-ignore
        this._context = null;
    }
}
export { ImageCanvas };
