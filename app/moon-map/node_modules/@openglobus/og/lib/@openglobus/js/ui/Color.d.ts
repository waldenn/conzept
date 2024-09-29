import { EventsHandler } from "../Events";
import { IViewParams, View, ViewEventsList } from './View';
interface IColorParams extends IViewParams {
    label?: string;
    value?: string;
}
type ColorEventsList = ["input"];
declare class Color extends View<null> {
    events: EventsHandler<ColorEventsList> & EventsHandler<ViewEventsList>;
    protected _value: string;
    protected $label: HTMLElement | null;
    protected $input: HTMLInputElement | null;
    constructor(options?: IColorParams);
    render(params: any): this;
    set value(val: string);
    get value(): string;
    protected _initEvents(): void;
    protected _clearEvents(): void;
    protected _onInput: (e: Event) => void;
    remove(): void;
}
export { Color };
