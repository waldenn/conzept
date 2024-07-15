import { clamp } from '../math';
import { View } from './View';
import { stringTemplate } from '../utils/shared';
const SLIDER_EVENTS = ["change"];
const TEMPLATE = `<div class="og-slider">
      <div class="og-slider-label">{label}</div>
      <div class="og-slider-panel">
        <div class="og-slider-progress"></div>      
        <div class="og-slider-pointer"></div>
      </div>
      <input type="number"/>
    </div>`;
class Slider extends View {
    constructor(options = {}) {
        super({
            template: stringTemplate(TEMPLATE, {
                label: options.label || ""
            })
        });
        this._onResize = () => {
            this._setOffset(this._value * this.$panel.clientWidth / (this._max - this._min));
        };
        this._onMouseWheel = (e) => {
            //@ts-ignore
            e = e || window.event;
            e.preventDefault();
            e.stopPropagation();
            //@ts-ignore
            this.value = this._value + Math.sign(e.wheelDelta) * (this._max - this._min) / 100.0;
        };
        this._onMouseWheelFF = (e) => {
            this._onMouseWheel(e);
        };
        this._onInput = (e) => {
            //@ts-ignore
            e = e || window.event;
            e.preventDefault();
            e.stopPropagation();
            //@ts-ignore
            this.value = parseFloat(e.target.value);
        };
        this._onMouseDown = (e) => {
            //@ts-ignore
            e = e || window.event;
            e.preventDefault();
            this._startPosX = e.clientX;
            this.value = this._min + (this._max - this._min) * (e.offsetX / this.$panel.clientWidth);
            document.addEventListener("mousemove", this._onMouseMove);
            document.addEventListener("mouseup", this._onMouseUp);
        };
        this._onMouseMove = (e) => {
            //@ts-ignore
            e = e || window.event;
            e.preventDefault();
            e.stopPropagation();
            let rect = this.$panel.getBoundingClientRect();
            let clientX = clamp(e.clientX, rect.left, rect.right);
            let dx = this._startPosX - clientX;
            this._startPosX = clientX;
            this.value = (this.$pointer.offsetLeft - dx) * (this._max - this._min) / this.$panel.clientWidth;
        };
        this._onMouseUp = () => {
            document.removeEventListener("mouseup", this._onMouseUp);
            document.removeEventListener("mousemove", this._onMouseMove);
        };
        //@ts-ignore
        this.events = this.events.registerNames(SLIDER_EVENTS);
        this._value = options.value || 0.0;
        this._min = options.min || 0.0;
        this._max = options.max || 1.0;
        //this._step = options.step || ((this._max - this._min) / 10.0);
        this._resizeObserver = new ResizeObserver(this._onResize);
        this._startPosX = 0;
        this.$label = null;
        this.$pointer = null;
        this.$progress = null;
        this.$input = null;
        this.$panel = null;
    }
    render(params) {
        super.render(params);
        this.$label = this.select(".og-slider-label");
        if (this.$label.innerHTML === "") {
            this.$label.style.display = "none";
        }
        this.$pointer = this.select(".og-slider-pointer");
        this.$progress = this.select(".og-slider-progress");
        this.$panel = this.select(".og-slider-panel");
        this.$input = this.select("input");
        this._resizeObserver.observe(this.el);
        this._initEvents();
        return this;
    }
    set value(val) {
        if (val !== this._value) {
            this._value = clamp(val, this._min, this._max);
            this.$input.value = this._value.toString();
            this._setOffset(this._value * this.$panel.clientWidth / (this._max - this._min));
            this.events.dispatch(this.events.change, this._value, this);
        }
    }
    get value() {
        return this._value;
    }
    _initEvents() {
        this.$panel.addEventListener("mousedown", this._onMouseDown);
        //@ts-ignore
        this.$panel.addEventListener("mousewheel", this._onMouseWheel);
        this.$panel.addEventListener("wheel", this._onMouseWheelFF);
        this.$input.addEventListener("input", this._onInput);
    }
    _clearEvents() {
        this.$panel.removeEventListener("mousedown", this._onMouseDown);
        //@ts-ignore
        this.$panel.removeEventListener("mousewheel", this._onMouseWheel);
        this.$panel.removeEventListener("wheel", this._onMouseWheelFF);
        this.$input.removeEventListener("input", this._onInput);
    }
    _setOffset(x) {
        if (x >= 0 && x <= this.$panel.clientWidth) {
            this.$pointer.style.left = this.$progress.style.width = `${x * 100 / this.$panel.clientWidth}%`;
        }
    }
    remove() {
        this._clearEvents();
        super.remove();
    }
}
export { Slider };
