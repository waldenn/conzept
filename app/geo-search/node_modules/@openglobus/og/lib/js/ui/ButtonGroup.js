import { createEvents } from '../Events';
const BUTTONGROUP_EVENTS = ["change"];
class ButtonGroup {
    constructor(options = {}) {
        this._onChange = (isActive, btn) => {
            if (isActive) {
                btn.preventClick = true;
                for (let i = 0; i < this._buttons.length; i++) {
                    let bi = this._buttons[i];
                    if (!bi.isEqual(btn)) {
                        bi.setActive(false);
                        bi.preventClick = false;
                    }
                }
                this.events.dispatch(this.events.change, btn);
            }
        };
        this.events = createEvents(BUTTONGROUP_EVENTS);
        this._buttons = options.buttons || [];
        for (let i = 0; i < this._buttons.length; i++) {
            this._bindButton(this._buttons[i]);
        }
    }
    _bindButton(button) {
        button.events.on("change", this._onChange);
    }
    add(button) {
        this._buttons.push(button);
        this._bindButton(button);
    }
    remove(button) {
        for (let i = 0; i < this._buttons.length; i++) {
            if (this._buttons[i].isEqual(button)) {
                this._buttons.splice(i);
                button.events.off("change", this._onChange);
                return;
            }
        }
    }
}
export { ButtonGroup };
