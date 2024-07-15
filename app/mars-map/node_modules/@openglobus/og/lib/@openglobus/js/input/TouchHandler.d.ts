export type TouchEventExt = TouchEvent & {
    offsetLeft: number;
    offsetTop: number;
};
type TouchHandlerEventCallback = (sys: TouchEventExt) => void;
declare class TouchHandler {
    protected _htmlObject: HTMLElement;
    constructor(htmlObject: HTMLElement);
    setEvent(event: string, sender: any, callback: TouchHandlerEventCallback): void;
}
export { TouchHandler };
