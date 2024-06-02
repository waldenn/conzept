import { EventsHandler } from '../../Events';
type TimelineEventsList = ["change", "current"];
interface ITimelineParams {
    current?: Date;
    rangeStart?: Date;
    rangeEnd?: Date;
    minDate?: Date | null;
    maxDate?: Date | null;
    multiplier?: number;
}
declare class TimelineModel {
    events: EventsHandler<TimelineEventsList>;
    protected _current: Date;
    protected _rangeStart: Date;
    protected _rangeEnd: Date;
    protected _range: number;
    protected _minDate: Date | null;
    protected _maxDate: Date | null;
    protected _requestAnimationFrameId: number;
    protected _prevNow: number;
    multiplier: number;
    dt: number;
    constructor(options?: ITimelineParams);
    play(): void;
    stop(): void;
    stopped(): boolean;
    protected _animationFrameCallback(): void;
    protected _frame(): void;
    get range(): number;
    set(rangeStart: Date, rangeEnd: Date): void;
    get current(): Date;
    get rangeStart(): Date;
    get rangeEnd(): Date;
    get rangeStartTime(): number;
    get rangeEndTime(): number;
    get currentTime(): number;
    set current(current: Date);
    set rangeStart(date: Date);
    set rangeEnd(date: Date);
}
export { TimelineModel };
