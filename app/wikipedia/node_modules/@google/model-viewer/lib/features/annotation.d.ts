import ModelViewerElementBase, { Vector3D } from '../model-viewer-base.js';
import { HotspotConfiguration } from '../three-components/Hotspot.js';
import { Constructor } from '../utilities.js';
export declare interface AnnotationInterface {
    updateHotspot(config: HotspotConfiguration): void;
    positionAndNormalFromPoint(pixelX: number, pixelY: number): {
        position: Vector3D;
        normal: Vector3D;
    } | null;
}
/**
 * AnnotationMixin implements a declarative API to add hotspots and annotations.
 * Child elements of the <model-viewer> element that have a slot name that
 * begins with "hotspot" and data-position and data-normal attributes in
 * the format of the camera-target attribute will be added to the scene and
 * track the specified model coordinates.
 */
export declare const AnnotationMixin: <T extends Constructor<ModelViewerElementBase, object>>(ModelViewerElement: T) => {
    new (...args: any[]): AnnotationInterface;
    prototype: AnnotationInterface;
} & object & T;
