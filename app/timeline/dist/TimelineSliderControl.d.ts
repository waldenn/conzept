/** @ignore */
import L = require("leaflet");
interface TimelineSliderControlOptions extends L.ControlOptions {
    /**
     * Minimum time, in ms, for the playback to take. Will almost certainly
     * actually take at least a bit longer; after each frame, the next one
     * displays in `duration/steps` ms, so each frame really takes frame
     * processing time PLUS step time.
     *
     * Default: 10000
     */
    duration?: number;
    /**
     * Allow playback to be controlled using the spacebar (play/pause) and
     * right/left arrow keys (next/previous).
     *
     * Default: false
     */
    enableKeyboardControls?: boolean;
    /**
     * Show playback controls (i.e.  prev/play/pause/next).
     *
     * Default: true
     */
    enablePlayback?: boolean;
    /**
     * Show ticks on the timeline (if the browser supports it)
     *
     * See here for support:
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#Browser_compatibility
     *
     * Default: true
     */
    showTicks?: boolean;
    /**
     * Wait until the user is finished changing the date to update the map. By
     * default, both the map and the date update for every change. With complex
     * data, this can slow things down, so set this to true to only update the
     * displayed date.
     */
    waitToUpdateMap?: boolean;
    /**
     * The start time of the timeline. If unset, this will be calculated
     * automatically based on the timelines registered to this control.
     */
    start?: number;
    /**
     * The end time of the timeline. If unset, this will be calculated
     * automatically based on the timelines registered to this control.
     */
    end?: number;
    /**
     * How many steps to break the timeline into. Each step will then be
     * `(end-start) / steps`. Only affects playback.
     *
     * Default: 1000
     */
    steps?: number;
    /**
     * Start playback of the timeline as soon as the page is loaded.
     *
     * Default: false
     */
    autoPlay?: boolean;
    /**
     * A function which takes the current time value (a Unix timestamp) and
     * outputs a string that is displayed beneath the control buttons.
     */
    formatOutput?(time: number): string;
}
/** @ignore */
declare type PlaybackControl = "play" | "pause" | "prev" | "next";
/** @ignore */
declare type TSC = L.TimelineSliderControl;
declare module "leaflet" {
    class TimelineSliderControl extends L.Control {
        container: HTMLElement;
        options: Required<TimelineSliderControlOptions>;
        timelines: L.Timeline[];
        start: number;
        end: number;
        map: L.Map;
        time: number;
        syncedControl: TSC[];
        /** @ignore */
        _datalist?: HTMLDataListElement;
        /** @ignore */
        _output?: HTMLOutputElement;
        /** @ignore */
        _stepDuration: number;
        /** @ignore */
        _stepSize: number;
        /** @ignore */
        _timeSlider: HTMLInputElement;
        /** @ignore */
        _playing: boolean;
        /** @ignore */
        _timer: number;
        /** @ignore */
        _listener: (ev: KeyboardEvent) => any;
        /** @ignore */
        initialize(this: TSC, options: TimelineSliderControlOptions): void;
        /** @ignore */
        _getTimes(this: TSC): number[];
        /** @ignore */
        _nearestEventTime(this: TSC, findTime: number, mode?: 1 | -1): number;
        /** @ignore */
        _recalculate(this: TSC): void;
        /** @ignore */
        _createDOM(this: TSC): void;
        /** @ignore */
        _addKeyListeners(this: TSC): void;
        /** @ignore */
        _removeKeyListeners(this: TSC): void;
        /** @ignore */
        _buildDataList(this: TSC, container: HTMLElement): void;
        /** @ignore */
        _rebuildDataList(this: TSC): void;
        /** @ignore */
        _makeButton(this: TSC, container: HTMLElement, name: PlaybackControl): void;
        /** @ignore */
        _makeButtons(this: TSC, container: HTMLElement): void;
        /** @ignore */
        _makeOutput(this: TSC, container: HTMLElement): void;
        /** @ignore */
        _makeSlider(this: TSC, container: HTMLElement): void;
        /** @ignore */
        _onKeydown(this: TSC, ev: KeyboardEvent): void;
        /** @ignore */
        _sliderChanged(this: TSC, e: Event): void;
        /** @ignore */
        _setTime(this: TSC, time: number, type: string): void;
        /** @ignore */
        _setDuration(this: TSC, time: number, type: string): void;
        /** @ignore */
        _setTime(this: TSC, time: number, type: string): void;
        /** @ignore */
        _disableMapDragging(this: TSC): void;
        /** @ignore */
        _enableMapDragging(this: TSC): void;
        /** @ignore */
        _resetIfTimelinesChanged(this: TSC, oldTimelineCount: number): void;
        /** @ignore */
        _autoPlay(this: TSC): void;
        play(this: TSC, fromSynced?: boolean): void;
        pause(this: TSC, fromSynced?: boolean): void;
        prev(this: TSC): void;
        next(this: TSC): void;
        toggle(this: TSC): void;
        setTime(this: TSC, time: number): void;
        setDuration(this: TSC, time: number): void;
        addTimelines(this: TSC, ...timelines: L.Timeline[]): void;
        removeTimelines(this: TSC, ...timelines: L.Timeline[]): void;
        syncControl(this: TSC, controlToSync: TSC): void;
    }
    let timelineSliderControl: (options?: TimelineSliderControlOptions) => TSC;
}
export {};
