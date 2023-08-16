"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var diesal_1 = require("diesal");
/** @ignore */
var L = require("leaflet");
// @ts-ignore
L.Timeline = L.GeoJSON.extend({
    times: null,
    ranges: null,
    initialize: function (geojson, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.times = [];
        this.ranges = new diesal_1.IntervalTree();
        var defaultOptions = {
            drawOnSetTime: true
        };
        // @ts-ignore
        L.GeoJSON.prototype.initialize.call(this, null, options);
        L.Util.setOptions(this, defaultOptions);
        L.Util.setOptions(this, options);
        if (this.options.getInterval) {
            this._getInterval = function (feature) {
                return _this.options.getInterval(feature);
            };
        }
        if (geojson) {
            this._process(geojson);
        }
    },
    _getInterval: function (feature) {
        if (feature.properties &&
            "start" in feature.properties &&
            "end" in feature.properties) {
            var _a = feature.properties, startExclusive = _a.startExclusive, endExclusive = _a.endExclusive;
            return {
                start: new Date(feature.properties.start).getTime(),
                end: new Date(feature.properties.end).getTime(),
                startExclusive: startExclusive === true || startExclusive === "true",
                endExclusive: endExclusive === true || endExclusive === "true",
            };
        }
        return false;
    },
    /**
     * Finds the first and last times in the dataset, adds all times into an
     * array, and puts everything into an IntervalTree for quick lookup.
     *
     * @param data GeoJSON to process
     */
    _process: function (data) {
        var _this = this;
        var _a, _b, _c, _d;
        data.features.forEach(function (feature) {
            var interval = _this._getInterval(feature);
            if (!interval) {
                return;
            }
            _this.ranges.insert(interval.start + (interval.startExclusive ? 1 : 0), interval.end - (interval.endExclusive ? 1 : 0), feature);
            _this.times.push(interval.start);
            _this.times.push(interval.end);
        });
        if (this.times.length === 0) {
            this.start = (_a = this.options.start) !== null && _a !== void 0 ? _a : Infinity;
            this.end = (_b = this.options.end) !== null && _b !== void 0 ? _b : -Infinity;
            this.time = this.start;
            return;
        }
        // default sort is lexicographic, even for number types. so need to
        // specify sorting function.
        this.times.sort(function (a, b) { return a - b; });
        // de-duplicate the times
        this.times = this.times.reduce(function (newList, x, i) {
            if (i === 0) {
                return newList;
            }
            var lastTime = newList[newList.length - 1];
            if (lastTime !== x) {
                newList.push(x);
            }
            return newList;
        }, [this.times[0]]);
        this.start = (_c = this.options.start) !== null && _c !== void 0 ? _c : this.times[0];
        this.end = (_d = this.options.end) !== null && _d !== void 0 ? _d : this.times[this.times.length - 1];
        this.time = this.start;
    },
    /**
     * Sets the time for this layer.
     *
     * @param time The time to set. Usually a number, but if your
     * data is really time-based then you can pass a string (e.g. '2015-01-01')
     * and it will be processed into a number automatically.
     */
    setTime: function (time) {
        this.time = typeof time === "number" ? time : new Date(time).getTime();
        if (this.options.drawOnSetTime) {
            this.updateDisplayedLayers();
        }
        this.fire("change");
    },
    /**
     * Update the layer to show only the features that are relevant at the current
     * time. Usually shouldn't need to be called manually, unless you set
     * `drawOnSetTime` to `false`.
     */
    updateDisplayedLayers: function () {
        var _this = this;
        // This loop is intended to help optimize things a bit. First, we find all
        // the features that should be displayed at the current time.
        var features = this.ranges.lookup(this.time);
        var layers = this.getLayers();
        var layersToRemove = [];
        // Then we try to match each currently displayed layer up to a feature. If
        // we find a match, then we remove it from the feature list. If we don't
        // find a match, then the displayed layer is no longer valid at this time.
        // We should remove it.
        layers.forEach(function (layer) {
            var found = false;
            for (var j = 0; j < features.length; j++) {
                if (layer.feature === features[j]) {
                    found = true;
                    features.splice(j, 1);
                    break;
                }
            }
            if (!found) {
                layersToRemove.push(layer);
            }
        });
        layersToRemove.forEach(function (layer) { return _this.removeLayer(layer); });
        // Finally, with any features left, they must be new data! We can add them.
        features.forEach(function (feature) { return _this.addData(feature); });
    }
});
L.timeline = function (geojson, options) { return new L.Timeline(geojson, options); };
