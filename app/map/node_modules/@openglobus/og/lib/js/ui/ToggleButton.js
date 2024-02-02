import { Button } from './Button';
const TOGGLEBUTTON_EVENTS = ["change"];
class ToggleButton extends Button {
    constructor(options) {
        super({
            ...options
        });
        this._onMouseClick = (e) => {
            if (!this.preventClick) {
                this._mouseClickHandler(e);
                this.setActive(!this.isActive);
            }
        };
        //@ts-ignore
        this.events = this.events.registerNames(TOGGLEBUTTON_EVENTS);
        this._isActive = options.isActive || false;
        this.preventClick = options.preventClick || false;
    }
    setActive(isActive, stopPropagation = false) {
        if (isActive !== this._isActive) {
            this._isActive = isActive;
            this._toggle();
            if (!stopPropagation) {
                this.events.dispatch(this.events.change, isActive, this);
            }
        }
    }
    _toggle() {
        this.el && this.el.classList.toggle("og-button__active");
    }
    get isActive() {
        return this._isActive;
    }
    render(params) {
        super.render(params);
        if (this._isActive) {
            this._toggle();
        }
        return this;
    }
}
export { ToggleButton };
