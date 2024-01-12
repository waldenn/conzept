import { EventsHandler } from "../Events";
import { IViewParams, View, ViewEventsList } from './View';
interface ISliderParams extends IViewParams {
    label?: string;
    value?: number;
    min?: number;
    max?: number;
}
type SliderEventsList = ["change"];
declare class Slider extends View<null> {
    events: EventsHandler<SliderEventsList> & EventsHandler<ViewEventsList>;
    protected _value: number;
    protected _min: number;
    protected _max: number;
    protected _startPosX: number;
    protected _resizeObserver: ResizeObserver;
    protected $label: HTMLElement | null;
    protected $pointer: HTMLElement | null;
    protected $progress: HTMLElement | null;
    protected $input: HTMLInputElement | null;
    protected $panel: HTMLElement | null;
    constructor(options?: ISliderParams);
    render(params: any): this;
    protected _onResize: () => void;
    set value(val: number);
    get value(): number;
    protected _initEvents(): void;
    protected _clearEvents(): void;
    protected _onMouseWheel: (e: WheelEvent) => void;
    protected _onMouseWheelFF: (e: WheelEvent) => void;
    protected _onInput: (e: Event) => void;
    protected _onMouseDown: (e: MouseEvent) => void;
    protected _setOffset(x: number): void;
    protected _onMouseMove: (e: MouseEvent) => void;
    protected _onMouseUp: () => void;
    remove(): void;
}
export { Slider };
