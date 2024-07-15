import { Control } from "./Control";
import { input } from "../input/input";
/**
 * Simple keyboard camera navigation with W,S,A,D and shift keys to fly around the scene.
 */
export class SimpleNavigation extends Control {
    constructor(options = {}) {
        super({
            name: "SimpleNavigation",
            autoActivate: true, ...options
        });
        this.speed = options.speed || 1.0;
    }
    oninit() {
    }
    onactivate() {
        super.onactivate();
        let r = this.renderer;
        r.events.on("keypress", input.KEY_W, this.onCameraMoveForward, this);
        r.events.on("keypress", input.KEY_S, this.onCameraMoveBackward, this);
        r.events.on("keypress", input.KEY_A, this.onCameraStrifeLeft, this);
        r.events.on("keypress", input.KEY_D, this.onCameraStrifeRight, this);
        r.events.on("keypress", input.KEY_UP, this.onCameraLookUp, this);
        r.events.on("keypress", input.KEY_DOWN, this.onCameraLookDown, this);
        r.events.on("keypress", input.KEY_LEFT, this.onCameraTurnLeft, this);
        r.events.on("keypress", input.KEY_RIGHT, this.onCameraTurnRight, this);
        r.events.on("keypress", input.KEY_Q, this.onCameraRollLeft, this);
        r.events.on("keypress", input.KEY_E, this.onCameraRollRight, this);
    }
    ondeactivate() {
        super.ondeactivate();
        let r = this.renderer;
        r.events.off("keypress", input.KEY_W, this.onCameraMoveForward);
        r.events.off("keypress", input.KEY_S, this.onCameraMoveBackward);
        r.events.off("keypress", input.KEY_A, this.onCameraStrifeLeft);
        r.events.off("keypress", input.KEY_D, this.onCameraStrifeRight);
        r.events.off("keypress", input.KEY_UP, this.onCameraLookUp);
        r.events.off("keypress", input.KEY_DOWN, this.onCameraLookDown);
        r.events.off("keypress", input.KEY_LEFT, this.onCameraTurnLeft);
        r.events.off("keypress", input.KEY_RIGHT, this.onCameraTurnRight);
        r.events.off("keypress", input.KEY_Q, this.onCameraRollLeft);
        r.events.off("keypress", input.KEY_E, this.onCameraRollRight);
    }
    onCameraMoveForward() {
        if (this._active) {
            let cam = this.renderer.activeCamera;
            cam.slide(0, 0, -this.speed);
            cam.update();
        }
    }
    onCameraMoveBackward() {
        let cam = this.renderer.activeCamera;
        cam.slide(0, 0, this.speed);
        cam.update();
    }
    onCameraStrifeLeft() {
        let cam = this.renderer.activeCamera;
        cam.slide(-this.speed, 0, 0);
        cam.update();
    }
    onCameraStrifeRight() {
        let cam = this.renderer.activeCamera;
        cam.slide(this.speed, 0, 0);
        cam.update();
    }
    onCameraLookUp() {
        let cam = this.renderer.activeCamera;
        cam.pitch(0.5);
        cam.update();
    }
    onCameraLookDown() {
        let cam = this.renderer.activeCamera;
        cam.pitch(-0.5);
        cam.update();
    }
    onCameraTurnLeft() {
        let cam = this.renderer.activeCamera;
        cam.yaw(0.5);
        cam.update();
    }
    onCameraTurnRight() {
        let cam = this.renderer.activeCamera;
        cam.yaw(-0.5);
        cam.update();
    }
    onCameraRollLeft() {
        let cam = this.renderer.activeCamera;
        cam.roll(-0.5);
        cam.update();
    }
    onCameraRollRight() {
        let cam = this.renderer.activeCamera;
        cam.roll(0.5);
        cam.update();
    }
}
