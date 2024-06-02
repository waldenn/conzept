import { Dialog } from "../../ui/Dialog";
import { ToggleButton } from "../../ui/ToggleButton";
import { Control, IControlParams } from '../Control';
import { TimelineView } from './TimelineView';
interface ITimelineControlParams extends IControlParams {
    name?: string;
    current?: Date;
    rangeStart?: Date;
    rangeEnd?: Date;
}
declare class TimelineControl extends Control {
    protected _timelineView: TimelineView;
    protected _toggleBtn: ToggleButton;
    protected _dialog: Dialog<null>;
    constructor(options?: ITimelineControlParams);
    oninit(): void;
}
export { TimelineControl };
