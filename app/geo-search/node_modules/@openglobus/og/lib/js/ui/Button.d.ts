import { IViewParams, View, ViewEventsList } from './View';
import { EventsHandler } from "../Events";
interface HTMLElementExt extends HTMLElement {
    __og_button__: Button;
}
export type ButtonEventsList = ["click", "mousedown", "mouseup", "touchstart", "touchend", "touchcancel"];
export interface IButtonParams extends IViewParams {
    icon?: string;
    text?: string;
    title?: string;
    name?: string;
}
declare class Button extends View<null> {
    events: EventsHandler<ButtonEventsList> & EventsHandler<ViewEventsList>;
    el: HTMLElementExt | null;
    name: string;
    $icon: HTMLElement | null;
    $text: HTMLElement | null;
    constructor(options?: IButtonParams);
    render(params: any): this;
    protected _initEvents(): void;
    protected _onMouseDown: (e: MouseEvent) => void;
    protected _onMouseUp: (e: MouseEvent) => void;
    protected _onTouchStart: (e: TouchEvent) => void;
    protected _onTouchEnd: (e: TouchEvent) => void;
    protected _onTouchCancel: (e: TouchEvent) => void;
    protected _mouseClickHandler(e: MouseEvent): void;
    protected _onMouseClick: (e: MouseEvent) => void;
    remove(): void;
    protected _clearEvents(): void;
}
export { Button };
