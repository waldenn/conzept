/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from 'lit-element';
import { $hasTransitioned, $needsRender, $onModelLoad, $renderer, $scene, $tick, $updateSource } from '../model-viewer-base.js';
const MILLISECONDS_PER_SECOND = 1000.0;
const $changeAnimation = Symbol('changeAnimation');
const $paused = Symbol('paused');
export const AnimationMixin = (ModelViewerElement) => {
    var _a;
    class AnimationModelViewerElement extends ModelViewerElement {
        constructor() {
            super(...arguments);
            this.autoplay = false;
            this.animationName = undefined;
            this.animationCrossfadeDuration = 300;
            this[_a] = true;
        }
        /**
         * Returns an array
         */
        get availableAnimations() {
            if (this.loaded) {
                return this[$scene].animationNames;
            }
            return [];
        }
        get duration() {
            return this[$scene].duration;
        }
        get paused() {
            return this[$paused];
        }
        get currentTime() {
            return this[$scene].animationTime;
        }
        set currentTime(value) {
            this[$scene].animationTime = value;
            this[$renderer].threeRenderer.shadowMap.needsUpdate = true;
            this[$needsRender]();
        }
        pause() {
            if (this[$paused]) {
                return;
            }
            this[$paused] = true;
            this[$renderer].threeRenderer.shadowMap.autoUpdate = false;
            this.dispatchEvent(new CustomEvent('pause'));
        }
        play() {
            if (this[$paused] && this.availableAnimations.length > 0) {
                this[$paused] = false;
                this[$renderer].threeRenderer.shadowMap.autoUpdate = true;
                if (!this[$scene].hasActiveAnimation) {
                    this[$changeAnimation]();
                }
                this.dispatchEvent(new CustomEvent('play'));
            }
        }
        [(_a = $paused, $onModelLoad)]() {
            super[$onModelLoad]();
            this[$paused] = true;
            if (this.autoplay) {
                this[$changeAnimation]();
                this.play();
            }
        }
        [$tick](_time, delta) {
            super[$tick](_time, delta);
            if (this[$paused] ||
                (!this[$hasTransitioned]() && !this[$renderer].isPresenting)) {
                return;
            }
            this[$scene].updateAnimation(delta / MILLISECONDS_PER_SECOND);
            this[$needsRender]();
        }
        updated(changedProperties) {
            super.updated(changedProperties);
            if (changedProperties.has('autoplay') && this.autoplay) {
                this.play();
            }
            if (changedProperties.has('animationName')) {
                this[$changeAnimation]();
            }
        }
        async [$updateSource]() {
            // If we are loading a new model, we need to stop the animation of
            // the current one (if any is playing). Otherwise, we might lose
            // the reference to the scene root and running actions start to
            // throw exceptions and/or behave in unexpected ways:
            this[$scene].stopAnimation();
            return super[$updateSource]();
        }
        [$changeAnimation]() {
            this[$scene].playAnimation(this.animationName, this.animationCrossfadeDuration / MILLISECONDS_PER_SECOND);
            // If we are currently paused, we need to force a render so that
            // the scene updates to the first frame of the new animation
            if (this[$paused]) {
                this[$scene].updateAnimation(0);
                this[$needsRender]();
            }
        }
    }
    __decorate([
        property({ type: Boolean })
    ], AnimationModelViewerElement.prototype, "autoplay", void 0);
    __decorate([
        property({ type: String, attribute: 'animation-name' })
    ], AnimationModelViewerElement.prototype, "animationName", void 0);
    __decorate([
        property({ type: Number, attribute: 'animation-crossfade-duration' })
    ], AnimationModelViewerElement.prototype, "animationCrossfadeDuration", void 0);
    return AnimationModelViewerElement;
};
//# sourceMappingURL=animation.js.map