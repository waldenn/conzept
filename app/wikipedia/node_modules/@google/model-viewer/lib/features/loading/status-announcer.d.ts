import { EventDispatcher } from 'three';
import ModelViewerElementBase from '../../model-viewer-base.js';
export declare const INITIAL_STATUS_ANNOUNCEMENT = "This page includes one or more 3D models that are loading";
export declare const FINISHED_LOADING_ANNOUNCEMENT = "All 3D models in the page have loaded";
declare const $modelViewerStatusInstance: unique symbol;
declare const $updateStatus: unique symbol;
interface InstanceLoadingStatus {
    onUnregistered: () => void;
}
/**
 * The LoadingStatusAnnouncer manages announcements of loading status across
 * all <model-viewer> elements in the document at any given time. As new
 * <model-viewer> elements are connected to the document, they are registered
 * with a LoadingStatusAnnouncer singleton. As they are disconnected, the are
 * also unregistered. Announcements are made to indicate the following
 * conditions:
 *
 *  1. There are <model-viewer> elements that have yet to finish loading
 *  2. All <model-viewer> elements in the page have finished attempting to load
 */
export declare class LoadingStatusAnnouncer extends EventDispatcher {
    /**
     * The "status" instance is the <model-viewer> instance currently designated
     * to announce the loading status of all <model-viewer> elements in the
     * document at any given time. It might change as <model-viewer> elements are
     * attached or detached over time.
     */
    protected [$modelViewerStatusInstance]: ModelViewerElementBase | null;
    protected registeredInstanceStatuses: Map<ModelViewerElementBase, InstanceLoadingStatus>;
    protected loadingPromises: Array<Promise<any>>;
    /**
     * This element is a node that floats around the document as the status
     * instance changes (see above). It is a singleton that represents the loading
     * status for all <model-viewer> elements currently in the page. It has its
     * role attribute set to "status", which causes screen readers to announce
     * any changes to its text content.
     *
     * @see https://www.w3.org/TR/wai-aria-1.1/#status
     */
    readonly statusElement: HTMLParagraphElement;
    protected statusUpdateInProgress: boolean;
    protected [$updateStatus]: () => void;
    constructor();
    /**
     * Register a <model-viewer> element with the announcer. If it is not yet
     * loaded, its loading status will be tracked by the announcer.
     */
    registerInstance(modelViewer: ModelViewerElementBase): void;
    /**
     * Unregister a <model-viewer> element with the announcer. Its loading status
     * will no longer be tracked by the announcer.
     */
    unregisterInstance(modelViewer: ModelViewerElementBase): void;
    protected get modelViewerStatusInstance(): ModelViewerElementBase | null;
    protected set modelViewerStatusInstance(value: ModelViewerElementBase | null);
    protected updateStatus(): Promise<void>;
}
export {};
