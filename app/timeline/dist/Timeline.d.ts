import { GenericGeoJSONFeatureCollection } from "@yaga/generic-geojson";
import { IntervalTree } from "diesal";
/** @ignore */
import L = require("leaflet");
export declare type TimedGeoJSON = GenericGeoJSONFeatureCollection<GeoJSON.Geometry, {
    start: string | number;
    end: string | number;
    startExclusive?: string | boolean;
    endExclusive?: string | boolean;
}>;
export interface TimelineOptions extends L.GeoJSONOptions {
    /**
     * If true (default), the layer will update as soon as `setTime` is called.
     *
     * If `false`, you must call `updateDisplayedLayers()` to update the display to
     * the current time. This is useful if you have complex data and performance
     * becomes a concern.
     */
    drawOnSetTime?: boolean;
    /**
     * Called for each feature, and should return either a time range for the
     * feature or `false`, indicating that it should not be included in the
     * timeline.
     *
     * If not provided, it assumes that the start/end are already part of the
     * feature object.
     */
    getInterval?(feature: GeoJSON.Feature): TimeBounds | false;
    start?: number;
    end?: number;
}
export interface TimeBounds {
    start: number;
    end: number;
    /**
     * Consider the `start` bound to exclusive, i.e., only matching `time > start` (instead of `time >= start`)
     */
    startExclusive?: boolean;
    /**
     * Consider the `end` bound to exclusive, i.e., only matching `time < end` (instead of `time <= end`)
     */
    endExclusive?: boolean;
}
declare module "leaflet" {
    class Timeline extends L.GeoJSON {
        start: number;
        end: number;
        time: number;
        times: number[];
        ranges: IntervalTree<GeoJSON.Feature>;
        options: Required<TimelineOptions>;
        /** @ignore */
        initialize(geojson: TimedGeoJSON | GeoJSON.FeatureCollection, options?: TimelineOptions): void;
        /** @ignore */
        _getInterval(feature: GeoJSON.Feature): TimeBounds | false;
        /** @ignore */
        _process(geojson: TimedGeoJSON | GeoJSON.FeatureCollection): void;
        updateDisplayedLayers(): void;
        getLayers(): L.GeoJSON[];
        setTime(time: number | string): void;
    }
    let timeline: (geojson?: TimedGeoJSON | GeoJSON.FeatureCollection, options?: TimelineOptions) => L.Timeline;
}
