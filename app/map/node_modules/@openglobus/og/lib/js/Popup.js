import { CLOSE_ICON } from './ui/icons';
import { createLonLat, stringTemplate } from "./utils/shared";
import { Vec3 } from "./math/Vec3";
import { View } from './ui/View';
const TEMPLATE = `<div class="og-popup {className}">
      <div class="og-popup-content-wrapper">
        <div class="og-popup-content"></div>
      </div>
      <div class="og-popup-tip-container">
        <div class="og-popup-tip"></div>
      </div>
      <div class="og-popup-toolbar">
        <div class="og-popup-btn og-popup-close">${CLOSE_ICON}</div>
      </div>
      <div class="og-popup-title">{title}</div>
    </div>`;
const POPUP_EVENTS = ["open", "close"];
class Popup extends View {
    constructor(options) {
        super({
            template: stringTemplate(TEMPLATE, {
                title: options.title || ""
            }),
            classList: options.className ? [options.className] : [],
            ...options
        });
        //@ts-ignore
        this.events = this.events.registerNames(POPUP_EVENTS);
        this._content = options.content || "";
        this.$content = null;
        this.$tip = null;
        this.$title = null;
        this._planet = options.planet;
        this._offset = options.offset || [0, 0];
        this._lonLat = createLonLat(options.lonLat);
        this._cartPos = new Vec3();
        this._visibility = options.visibility || false;
        this.render();
    }
    _updatePosition() {
        this.setCartesian3v(this._cartPos);
    }
    setScreen(p) {
        if (this._planet) {
            let r = this._planet.renderer.handler.pixelRatio;
            this.el.style.transform =
                `translate(${p.x / r - this.clientWidth * 0.5}px, ${p.y / r - this._planet.renderer.handler.canvas.clientHeight - this.$tip.clientHeight}px)`;
        }
    }
    get clientWidth() {
        return this.el ? this.el.clientWidth : 0;
    }
    get clientHeight() {
        return this.el ? this.el.clientHeight : 0;
    }
    setOffset(x = 0, y = 0) {
        this._offset[0] = x;
        this._offset[1] = y;
        if (this.el) {
            this.el.style.left = `${x}px`;
            this.el.style.bottom = `${y}px`;
        }
        return this;
    }
    render(params) {
        super.render(params);
        this.$content = this.select(".og-popup-content");
        this.$title = this.select(".og-popup-title");
        this.$tip = this.select(".og-popup-tip-container");
        this.setOffset(this._offset[0], this._offset[1]);
        this.setContent(this._content);
        this.setLonLat(this._lonLat);
        this.setVisibility(this._visibility);
        this.select(".og-popup-close").addEventListener("click", () => {
            this.hide();
        });
        return this;
    }
    setVisibility(visibility) {
        if (visibility) {
            this.show();
        }
        else {
            this.hide();
        }
        return this;
    }
    getContainer() {
        return this.$content;
    }
    getToolbarContainer() {
        return this.select(".og-popup-toolbar");
    }
    show() {
        this._visibility = true;
        if (this._planet) {
            this._planet.events.on("draw", this._updatePosition, this);
            this.appendTo(this._planet.renderer.div);
            this.events.dispatch(this.events.open, this);
        }
        return this;
    }
    hide() {
        this._visibility = false;
        if (this.el && this.el.parentNode) {
            this._planet.events.off("draw", this._updatePosition);
            this.el.parentNode.removeChild(this.el);
            this.events.dispatch(this.events.close, this);
        }
        return this;
    }
    setCartesian3v(cart, height = 0) {
        this._cartPos = cart;
        if (this._planet) {
            let cam = this._planet.camera;
            let f = this._planet.ellipsoid.equatorialSize + height, g = cam._lonLat.height;
            let look = cart.sub(cam.eye), v = Math.sqrt((f + g) * (f + g) - f * f);
            if (v > look.length() && cam.getForward().dot(look.normalize()) > 0.0) {
                this.el.style.display = "block";
                this.setScreen(cam.project(cart));
            }
            else {
                this.el.style.display = "none";
            }
        }
        return this;
    }
    setTitle(html) {
        if (this.$title) {
            this.$title.innerHTML = html;
        }
    }
    setLonLat(lonLat) {
        this._lonLat = lonLat;
        if (this._planet) {
            this.setCartesian3v(this._planet.ellipsoid.lonLatToCartesian(lonLat), lonLat.height);
        }
    }
    setContent(content) {
        if (content) {
            this.clear();
            this._content = content;
            if (this.$content) {
                if (typeof content === "string") {
                    this.$content.innerHTML = content;
                }
                else {
                    this.$content.appendChild(content);
                }
            }
        }
    }
    clear() {
        this._content = null;
        if (this.$content) {
            this.$content.innerHTML = "";
        }
    }
}
export { Popup };
