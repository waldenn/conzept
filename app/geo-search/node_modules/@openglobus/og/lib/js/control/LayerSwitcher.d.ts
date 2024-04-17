import { Control, IControlParams } from "./Control";
import { Dialog } from "../ui/Dialog";
import { Layer } from "../layer/Layer";
import { ToggleButton } from "../ui/ToggleButton";
import { IViewParams, View } from "../ui/View";
interface ILayerSwitcherParams extends IControlParams {
}
declare class LayerButtonView extends View<Layer> {
    constructor(params: IViewParams);
    render(params?: any): this;
    protected _onVisibilityChange: (layer: Layer) => void;
    protected _onClick: () => void;
    protected _onDblClick: () => void;
    remove(): void;
}
/**
 * Advanced :) layer switcher, includes base layers, overlays, geo images etc. groups.
 * Double click for zoom, drag-and-drop to change zIndex
 */
export declare class LayerSwitcher extends Control {
    protected _dialog: Dialog<null>;
    protected _toggleBtn: ToggleButton;
    protected _panel: View<null>;
    $baseLayers: HTMLElement | null;
    $overlays: HTMLElement | null;
    _layerViews: LayerButtonView[];
    constructor(options?: ILayerSwitcherParams);
    oninit(): void;
    protected _initLayers(): void;
    protected _createLayerButton(layer: Layer): LayerButtonView;
    addLayer: (layer: Layer) => void;
    removeLayer: (layer: Layer) => void;
    onactivate(): void;
    ondeactivate(): void;
}
export {};
