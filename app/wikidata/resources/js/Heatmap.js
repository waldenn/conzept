/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Renderer/Canvas.js
 */

/**
 * Class: OpenLayers.Renderer.Heatmap
 *
 * Inherits:
 *  - <OpenLayers.Renderer.Canvas>
 */
OpenLayers.Renderer.Heatmap = OpenLayers.Class(OpenLayers.Renderer.Canvas, {

    hitDetection: false,

    drawPoint: function(geometry, style, featureId) {
        var pt = this.getLocalXY(geometry), p0 = pt[0], p1 = pt[1];
        if (style.weight && !isNaN(p0) && !isNaN(p1)) {
            var gradient = this.canvas.createRadialGradient(p0, p1, 0, p0, p1, style.pointRadius);
            gradient.addColorStop(0, 'rgba(255, 255, 255,' + String(style.weight) + ')');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.canvas.fillStyle = gradient;
            this.canvas.fillRect(p0 - style.pointRadius, p1 - style.pointRadius, style.pointRadius * 2, style.pointRadius * 2);
        }
    },

    drawLineString: function(geometry, style, featureId) {},
    drawLinearRing: function(geometry, style, featureId) {},
    drawPolygon: function(geometry, style, featureId) {},

    redraw: function() {
        OpenLayers.Renderer.Canvas.prototype.redraw.apply(this, arguments);
        if (!this.locked) {
            var values = this.canvas.getImageData(0, 0, this.root.width, this.root.height);

            for (var x = 0; x < this.root.width; x++) {
                for (var y = 0; y < this.root.height; y++) {
                    var idx = 4 * (y * this.root.width + x);
                    var alpha = values.data[idx + 3];
                    if (alpha > 0) {
                        var theta = (1 - alpha / 255) * 270;
                        var rgb = OpenLayers.Util.hsl2rgb([theta, 100, 50]);

                        values.data[idx] = rgb[0];
                        values.data[idx+1] = rgb[1];
                        values.data[idx+2] = rgb[2];
                    }
                }
            }
            this.canvas.putImageData(values, 0, 0);
        }
    },

    CLASS_NAME: "OpenLayers.Renderer.Heatmap"
});

// from: https://github.com/harthur/color-convert
OpenLayers.Util.hsl2rgb = function(hsl) {
    var h = hsl[0] / 360, s = hsl[1] / 100, l = hsl[2] / 100,
        t1, t2, t3, rgb, val;

    if (s == 0) {
        val = l * 255;
        return [val, val, val];
    }

    if (l < 0.5) {
        t2 = l * (1 + s);
    } else {
        t2 = l + s - l * s;
    }
    t1 = 2 * l - t2;

    rgb = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * - (i - 1);
        t3 < 0 && t3++;
        t3 > 1 && t3--;

        if (6 * t3 < 1) {
            val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
            val = t2;
        } else if (3 * t3 < 2) {
            val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
            val = t1;
        }

        rgb[i] = val * 255;
    }

    return rgb;
};