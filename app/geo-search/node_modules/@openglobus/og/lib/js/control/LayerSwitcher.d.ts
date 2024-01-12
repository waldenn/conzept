import { Control, IControlParams } from "./Control";
import { Dialog } from "../ui/Dialog";
import { Layer } from "../layer/Layer";
import { ToggleButton } from "../ui/ToggleButton";
interface ILayerSwitcherParams extends IControlParams {
}
/**
 * Advanced :) layer switcher, includes base layers, overlays, geo images etc. groups.
 * Double click for zoom, drag-and-drop to change zIndex
 */
export declare class LayerSwitcher extends Control {
    dialog: Dialog<null>;
    protected _menuBtn: ToggleButton;
    constructor(options?: ILayerSwitcherParams);
    oninit(): void;
    addNewLayer: (layer: Layer) => void;
    removeLayer: (layer: Layer) => void;
    onactivate(): void;
    ondeactivate(): void;
}
export {};
