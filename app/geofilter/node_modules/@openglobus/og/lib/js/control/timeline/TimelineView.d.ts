import { EventsHandler } from "../../Events";
import { ButtonGroup } from "../../ui/ButtonGroup";
import { IViewParams, View, ViewEventsList } from '../../ui/View';
import { ToggleButton } from "../../ui/ToggleButton";
import { TimelineModel } from './TimelineModel';
import { MouseEventExt } from "../../input/MouseHandler";
interface ITimelineViewParams extends IViewParams {
    currentDate?: Date;
    rangeStart?: Date;
    rangeEnd?: Date;
    minDate?: Date;
    maxDate?: Date;
    fillStyle?: string;
}
type TimelineViewEventsList = [
    'startdrag',
    'stopdrag',
    'startdragcurrent',
    'stopdragcurrent',
    'setcurrent',
    'reset',
    'play',
    'playback',
    'pause',
    'visibility'
];
declare class TimelineView extends View<TimelineModel> {
    events: EventsHandler<TimelineViewEventsList> & EventsHandler<ViewEventsList>;
    fillStyle: string;
    $controls: HTMLElement | null;
    protected _frameEl: HTMLElement | null;
    protected _currentEl: HTMLElement | null;
    protected _canvasEl: HTMLCanvasElement;
    protected _ctx: CanvasRenderingContext2D;
    protected _isMouseOver: boolean;
    protected _isDragging: boolean;
    protected _isCurrentDragging: boolean;
    protected _isCurrentMouseOver: boolean;
    protected _minWidth: number;
    protected _canvasScale: number;
    protected _millisecondsInPixel: number;
    protected _clickPosX: number;
    protected _clickRangeStart: Date;
    protected _clickRangeEnd: Date;
    protected _clickCurrentDate: Date;
    protected _clickTime: number;
    protected _clickDelay: number;
    protected _onResizeObserver_: () => void;
    protected _resizeObserver: ResizeObserver;
    protected _pauseBtn: ToggleButton;
    protected _playBtn: ToggleButton;
    protected _buttons: ButtonGroup;
    protected _visibility: boolean;
    constructor(options?: ITimelineViewParams);
    protected _onResizeObserver(): void;
    get canvasScale(): number;
    set canvasScale(scale: number);
    resize(): void;
    afterRender(parentNode: HTMLElement): void;
    render(): this;
    setVisibility(visibility: boolean): void;
    reset(): void;
    play(): void;
    pause(): void;
    playBack(): void;
    protected _onMouseWheel: (e: MouseEventExt) => void;
    protected _onMouseWheelFF: (e: MouseEventExt) => void;
    protected _zoom(pointerTime: number, pointerCenterOffsetX: number, dir: number): void;
    protected _onMouseDown: (e: MouseEvent) => void;
    protected _onMouseUp: (e: MouseEvent) => void;
    protected _onMouseEnter: () => void;
    protected _onMouseOut: () => void;
    protected _onCurrentMouseEnter: () => void;
    protected _onCurrentMouseOut: () => void;
    protected _onMouseMove: (e: MouseEvent) => void;
    get clientWidth(): number;
    get clientHeight(): number;
    protected _resize(): void;
    getOffsetByTime(milliseconds: number): number;
    remove(): void;
    protected _clearCanvas(): void;
    protected _drawCurrent(): void;
    draw(): void;
}
export { TimelineView };
