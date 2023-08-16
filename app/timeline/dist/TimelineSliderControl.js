"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @ignore */
var L = require("leaflet");
// @ts-ignore
L.TimelineSliderControl = L.Control.extend({
    initialize: function (options) {
        if (options === void 0) { options = {}; }
        var defaultOptions = {
            duration: 10000,
            enableKeyboardControls: false,
            enablePlayback: true,
            formatOutput: function (output) { return "" + (output || ""); },
            showTicks: true,
            waitToUpdateMap: false,
            position: "bottomleft",
            steps: 1000,
            autoPlay: false,
        };
        this.timelines = [];
        L.Util.setOptions(this, defaultOptions);
        L.Util.setOptions(this, options);
        this.start = options.start || 0;
        this.end = options.end || 0;
    },
    /* INTERNAL API *************************************************************/
    /**
     * @private
     * @returns A flat, sorted list of all the times of all layers
     */
    _getTimes: function () {
        var _this = this;
        var times = [];
        this.timelines.forEach(function (timeline) {
            var timesInRange = timeline.times.filter(function (time) { return time >= _this.start && time <= _this.end; });
            times.push.apply(times, timesInRange);
        });
        if (times.length) {
            times.sort(function (a, b) { return a - b; });
            var dedupedTimes_1 = [times[0]];
            times.reduce(function (a, b) {
                if (a !== b) {
                    dedupedTimes_1.push(b);
                }
                return b;
            });
            return dedupedTimes_1;
        }
        return times;
    },
    /**
     * Adjusts start/end/step size. Should be called if any of those might
     * change (e.g. when adding a new layer).
     *
     * @private
     */
    _recalculate: function () {
        var manualStart = typeof this.options.start !== "undefined";
        var manualEnd = typeof this.options.end !== "undefined";
        var duration = this.options.duration;
        var min = Infinity;
        var max = -Infinity;
        this.timelines.forEach(function (timeline) {
            if (timeline.start < min) {
                min = timeline.start;
            }
            if (timeline.end > max) {
                max = timeline.end;
            }
        });
        if (!manualStart) {
            this.start = min;
            this._timeSlider.min = (min === Infinity ? 0 : min).toString();
            this._timeSlider.value = this._timeSlider.min;
        }
        if (!manualEnd) {
            this.end = max;
            this._timeSlider.max = (max === -Infinity ? 0 : max).toString();
        }
        this._stepSize = Math.max(1, (this.end - this.start) / this.options.steps);
        this._stepDuration = Math.max(1, duration / this.options.steps);
    },
    /**
     * @private
     * @param findTime The time to find events around
     * @param mode The operating mode.
     * If `mode` is 1, finds the event immediately after `findTime`.
     * If `mode` is -1, finds the event immediately before `findTime`.
     * @returns The time of the nearest event.
     */
    _nearestEventTime: function (findTime, mode) {
        if (mode === void 0) { mode = 1; }
        var times = this._getTimes();
        var retNext = false;
        var lastTime = times[0];
        for (var i = 1; i < times.length; i++) {
            var time = times[i];
            if (retNext) {
                return time;
            }
            if (time >= findTime) {
                if (mode === -1) {
                    return lastTime;
                }
                if (time === findTime) {
                    retNext = true;
                }
                else {
                    return time;
                }
            }
            lastTime = time;
        }
        return lastTime;
    },
    /* DOM CREATION & INTERACTION ***********************************************/
    /**
     * Create all of the DOM for the control.
     *
     * @private
     */
    _createDOM: function () {
        var classes = [
            "leaflet-control-layers",
            "leaflet-control-layers-expanded",
            "leaflet-timeline-control",
        ];
        var container = L.DomUtil.create("div", classes.join(" "));
        this.container = container;
        if (this.options.enablePlayback) {
            var sliderCtrlC = L.DomUtil.create("div", "sldr-ctrl-container", container);
            var buttonContainer = L.DomUtil.create("div", "button-container", sliderCtrlC);
            this._makeButtons(buttonContainer);
            if (this.options.enableKeyboardControls) {
                this._addKeyListeners();
            }
            this._makeOutput(sliderCtrlC);
        }
        this._makeSlider(container);
        if (this.options.showTicks) {
            this._buildDataList(container);
        }
        if (this.options.autoPlay) {
            this._autoPlay();
        }
    },
    /**
     * Add keyboard listeners for keyboard control
     *
     * @private
     */
    _addKeyListeners: function () {
        var _this = this;
        this._listener = function (ev) { return _this._onKeydown(ev); };
        document.addEventListener("keydown", this._listener);
    },
    /**
     * Remove keyboard listeners
     *
     * @private
     */
    _removeKeyListeners: function () {
        document.removeEventListener("keydown", this._listener);
    },
    /**
     * Constructs a <datalist>, for showing ticks on the range input.
     *
     * @private
     * @param container The container to which to add the datalist
     */
    _buildDataList: function (container) {
        this._datalist = L.DomUtil.create("datalist", "", container);
        var idNum = Math.floor(Math.random() * 1000000);
        this._datalist.id = "timeline-datalist-" + idNum;
        this._timeSlider.setAttribute("list", this._datalist.id);
        this._rebuildDataList();
    },
    /**
     * Reconstructs the <datalist>. Should be called when new data comes in.
     */
    _rebuildDataList: function () {
        var datalist = this._datalist;
        if (!datalist)
            return;
        while (datalist.firstChild) {
            datalist.removeChild(datalist.firstChild);
        }
        var datalistSelect = L.DomUtil.create("select", "", this._datalist);
        datalistSelect.setAttribute("aria-label", "List of times");
        this._getTimes().forEach(function (time) {
            L.DomUtil.create("option", "", datalistSelect).value = time.toString();
        });
    },
    /**
     * Makes a button with the passed name as a class, which calls the
     * corresponding function when clicked. Attaches the button to container.
     *
     * @private
     * @param container The container to which to add the button
     * @param name The class to give the button and the function to call
     */
    _makeButton: function (container, name) {
        var _this = this;
        var button = L.DomUtil.create("button", name, container);
        button.setAttribute("aria-label", name);
        button.addEventListener("click", function () { return _this[name](); });
        L.DomEvent.disableClickPropagation(button);
    },
    /**
     * Makes the prev, play, pause, and next buttons
     *
     * @private
     * @param container The container to which to add the buttons
     */
    _makeButtons: function (container) {
        this._makeButton(container, "prev");
        this._makeButton(container, "play");
        this._makeButton(container, "pause");
        this._makeButton(container, "next");
    },
    /**
     * DOM event handler to disable dragging on map
     *
     * @private
     */
    _disableMapDragging: function () {
        this.map.dragging.disable();
    },
    /**
     * DOM event handler to enable dragging on map
     *
     * @private
     */
    _enableMapDragging: function () {
        this.map.dragging.enable();
    },
    /**
     * Creates the range input
     *
     * @private
     * @param container The container to which to add the input
     */
    _makeSlider: function (container) {
        var slider = L.DomUtil.create("input", "time-slider", container);
        slider.setAttribute("aria-label", "Slider");
        slider.type = "range";
        slider.min = (this.start || 0).toString();
        slider.max = (this.end || 0).toString();
        slider.value = (this.start || 0).toString();
        this._timeSlider = slider;
        // register events using leaflet for easy removal
        L.DomEvent.on(this._timeSlider, "mousedown mouseup click touchstart", L.DomEvent.stopPropagation);
        L.DomEvent.on(this._timeSlider, "change input", this._sliderChanged, this);
        L.DomEvent.on(this._timeSlider, "mouseenter", this._disableMapDragging, this);
        L.DomEvent.on(this._timeSlider, "mouseleave", this._enableMapDragging, this);
    },
    _makeOutput: function (container) {
        this._output = L.DomUtil.create("output", "time-text", container);
        this._output.innerHTML = this.options.formatOutput(this.start);
    },
    _onKeydown: function (e) {
        var target = (e.target || e.srcElement);
        if (!/INPUT|TEXTAREA/.test(target.tagName)) {
            switch (e.keyCode || e.which) {
                case 37:
                    this.prev();
                    break;
                case 39:
                    this.next();
                    break;
                case 32:
                    this.toggle();
                    break;
                default:
                    return;
            }
            e.preventDefault();
        }
    },
    _sliderChanged: function (e) {
        var target = e.target;
        var time = parseFloat(target instanceof HTMLInputElement ? target.value : "0");
        this._setTime(time, e.type);
    },
    _setTime: function (time, type) {
        this.time = time;
        if (!this.options.waitToUpdateMap || type === "change") {
            this.timelines.forEach(function (timeline) { return timeline.setTime(time); });
        }
        if (this._output) {
            this._output.innerHTML = this.options.formatOutput(time);
        }
    },
    _resetIfTimelinesChanged: function (oldTimelineCount) {
        if (this.timelines.length !== oldTimelineCount) {
            this._recalculate();
            if (this.options.showTicks) {
                this._rebuildDataList();
            }
            this.setTime(this.start);
        }
    },
    _autoPlay: function () {
        var _this = this;
        if (document.readyState === "loading") {
            window.addEventListener("load", function () { return _this._autoPlay(); });
        }
        else {
            this.play();
        }
    },
    /* EXTERNAL API *************************************************************/
    /**
     * Register timeline layers with this control. This could change the start and
     * end points of the timeline (unless manually set). It will also reset the
     * playback.
     *
     * @param timelines The `L.Timeline`s to register
     */
    addTimelines: function () {
        var _this = this;
        var timelines = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            timelines[_i] = arguments[_i];
        }
        this.pause();
        var timelineCount = this.timelines.length;
        timelines.forEach(function (timeline) {
            if (_this.timelines.indexOf(timeline) === -1) {
                _this.timelines.push(timeline);
            }
        });
        this._resetIfTimelinesChanged(timelineCount);
    },
    /**
     * Unregister timeline layers with this control. This could change the start
     * and end points of the timeline unless manually set. It will also reset the
     * playback.
     *
     * @param timelines The `L.Timeline`s to unregister
     */
    removeTimelines: function () {
        var _this = this;
        var timelines = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            timelines[_i] = arguments[_i];
        }
        this.pause();
        var timelineCount = this.timelines.length;
        timelines.forEach(function (timeline) {
            var index = _this.timelines.indexOf(timeline);
            if (index !== -1) {
                _this.timelines.splice(index, 1);
            }
        });
        this._resetIfTimelinesChanged(timelineCount);
    },
    /**
     * Toggles play/pause state.
     */
    toggle: function () {
        if (this._playing) {
            this.pause();
        }
        else {
            this.play();
        }
    },
    /**
     * Pauses playback and goes to the previous event.
     */
    prev: function () {
        this.pause();
        var prevTime = this._nearestEventTime(this.time, -1);
        this._timeSlider.value = prevTime.toString();
        this.setTime(prevTime);
    },
    /**
     * Pauses playback.
     */
    pause: function (fromSynced) {
        var _a;
        window.clearTimeout(this._timer);
        this._playing = false;
        (_a = this.container) === null || _a === void 0 ? void 0 : _a.classList.remove("playing");
        if (this.syncedControl && !fromSynced) {
            this.syncedControl.map(function (control) {
                control.pause(true);
            });
        }
    },
    /**
     * Starts playback.
     */
    play: function (fromSynced) {
        var _this = this;
        var _a, _b;
        window.clearTimeout(this._timer);
        if (parseFloat(this._timeSlider.value) === this.end) {
            this._timeSlider.value = this.start.toString();
        }
        this._timeSlider.value = (parseFloat(this._timeSlider.value) + this._stepSize).toString();
        this.setTime(+this._timeSlider.value);
        if (parseFloat(this._timeSlider.value) === this.end) {
            this._playing = false;
            (_a = this.container) === null || _a === void 0 ? void 0 : _a.classList.remove("playing");
        }
        else {
            this._playing = true;
            (_b = this.container) === null || _b === void 0 ? void 0 : _b.classList.add("playing");
            this._timer = window.setTimeout(function () { return _this.play(true); }, this._stepDuration);
        }
        if (this.syncedControl && !fromSynced) {
            this.syncedControl.map(function (control) {
                control.play(true);
            });
        }
    },
    /**
     * Pauses playback and goes to the next event.
     */
    next: function () {
        this.pause();
        var nextTime = this._nearestEventTime(this.time, 1);
        this._timeSlider.value = nextTime.toString();
        this.setTime(nextTime);
    },
    /**
     * Set the time displayed.
     *
     * @param time The time to set
     */
    setTime: function (time) {
        if (this._timeSlider)
            this._timeSlider.value = time.toString();
        this._setTime(time, "change");
    },
    /**
     * Set the duration time.
     *
     * @param time The duration time to set
     */
    setDuration: function (time) {
        this.options.duration = time;
        this._recalculate();
    },
    onAdd: function (map) {
        this.map = map;
        this._createDOM();
        this.setTime(this.start);
        return this.container;
    },
    onRemove: function () {
        /* istanbul ignore else */
        if (this.options.enableKeyboardControls) {
            this._removeKeyListeners();
        }
        // cleanup events registered in _makeSlider
        L.DomEvent.off(this._timeSlider, "change input", this._sliderChanged, this);
        L.DomEvent.off(this._timeSlider, "pointerdown mousedown touchstart", this._disableMapDragging, this);
        L.DomEvent.off(document.body, "pointerup mouseup touchend", this._enableMapDragging, this);
        // make sure that dragging is restored to enabled state
        this._enableMapDragging();
    },
    syncControl: function (controlToSync) {
        if (!this.syncedControl) {
            this.syncedControl = [];
        }
        this.syncedControl.push(controlToSync);
    },
});
L.timelineSliderControl = function (options) {
    return new L.TimelineSliderControl(options);
};
