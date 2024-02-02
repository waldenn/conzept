import { stringTemplate } from '../utils/shared';
import { View } from './View';
const TEMPLATE = `<div class="og-button" title="{title}">
       <div class="og-button-icon">{icon}</div>
       <div class="og-button-text">{text}</div>
    </div>`;
const BUTTON_EVENTS = ["click", "mousedown", "mouseup", "touchstart", "touchend", "touchcancel"];
class Button extends View {
    constructor(options = {}) {
        super({
            template: stringTemplate(TEMPLATE, {
                icon: options.icon || "",
                text: options.text || "",
                title: options.title || ""
            }),
            ...options
        });
        this._onMouseDown = (e) => {
            e.preventDefault();
            this.events.dispatch(this.events.mousedown, this, e);
        };
        this._onMouseUp = (e) => {
            e.preventDefault();
            this.events.dispatch(this.events.mouseup, this, e);
        };
        this._onTouchStart = (e) => {
            e.preventDefault();
            this.events.dispatch(this.events.touchstart, this, e);
        };
        this._onTouchEnd = (e) => {
            e.preventDefault();
            this.events.dispatch(this.events.touchend, this, e);
        };
        this._onTouchCancel = (e) => {
            e.preventDefault();
            this.events.dispatch(this.events.touchcancel, this, e);
        };
        this._onMouseClick = (e) => {
            this._mouseClickHandler(e);
        };
        //@ts-ignore
        this.events = this.events.registerNames(BUTTON_EVENTS);
        this.el = null;
        this.name = options.name || "";
        this.$icon = null;
        this.$text = null;
    }
    render(params) {
        super.render(params);
        this.$icon = this.select(".og-button-icon");
        this.$text = this.select(".og-button-text");
        this.el.__og_button__ = this;
        this._initEvents();
        return this;
    }
    _initEvents() {
        if (this.el) {
            this.el.addEventListener("click", this._onMouseClick);
            this.el.addEventListener("mousedown", this._onMouseDown);
            this.el.addEventListener("mouseup", this._onMouseUp);
            this.el.addEventListener("touchstart", this._onTouchStart);
            this.el.addEventListener("touchend", this._onTouchEnd);
            this.el.addEventListener("touchcancel", this._onTouchCancel);
        }
    }
    _mouseClickHandler(e) {
        e.preventDefault();
        this.events.dispatch(this.events.click, this, e);
    }
    remove() {
        this._clearEvents();
        super.remove();
    }
    _clearEvents() {
        this.el && this.el.removeEventListener("click", this._onMouseClick);
    }
}
export { Button };
