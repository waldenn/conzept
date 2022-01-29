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
import { $needsRender, $onModelLoad, $progressTracker, $renderer, $scene, $shouldAttemptPreload } from '../model-viewer-base.js';
import { deserializeUrl } from '../utilities.js';
export const BASE_OPACITY = 0.1;
const DEFAULT_SHADOW_INTENSITY = 0.0;
const DEFAULT_SHADOW_SOFTNESS = 1.0;
const DEFAULT_EXPOSURE = 1.0;
const $currentEnvironmentMap = Symbol('currentEnvironmentMap');
const $applyEnvironmentMap = Symbol('applyEnvironmentMap');
export const $updateEnvironment = Symbol('updateEnvironment');
const $cancelEnvironmentUpdate = Symbol('cancelEnvironmentUpdate');
const $onPreload = Symbol('onPreload');
export const EnvironmentMixin = (ModelViewerElement) => {
    var _a, _b, _c;
    class EnvironmentModelViewerElement extends ModelViewerElement {
        constructor() {
            super(...arguments);
            this.environmentImage = null;
            this.skyboxImage = null;
            this.shadowIntensity = DEFAULT_SHADOW_INTENSITY;
            this.shadowSoftness = DEFAULT_SHADOW_SOFTNESS;
            this.exposure = DEFAULT_EXPOSURE;
            this[_a] = null;
            this[_b] = null;
            this[_c] = (event) => {
                if (event.element === this) {
                    this[$updateEnvironment]();
                }
            };
        }
        connectedCallback() {
            super.connectedCallback();
            this[$renderer].loader.addEventListener('preload', this[$onPreload]);
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this[$renderer].loader.removeEventListener('preload', this[$onPreload]);
        }
        updated(changedProperties) {
            super.updated(changedProperties);
            if (changedProperties.has('shadowIntensity')) {
                this[$scene].setShadowIntensity(this.shadowIntensity * BASE_OPACITY);
                this[$needsRender]();
            }
            if (changedProperties.has('shadowSoftness')) {
                this[$scene].setShadowSoftness(this.shadowSoftness);
                this[$needsRender]();
            }
            if (changedProperties.has('exposure')) {
                this[$scene].exposure = this.exposure;
                this[$needsRender]();
            }
            if ((changedProperties.has('environmentImage') ||
                changedProperties.has('skyboxImage')) &&
                this[$shouldAttemptPreload]()) {
                this[$updateEnvironment]();
            }
        }
        [(_a = $currentEnvironmentMap, _b = $cancelEnvironmentUpdate, _c = $onPreload, $onModelLoad)]() {
            super[$onModelLoad]();
            if (this[$currentEnvironmentMap] != null) {
                this[$applyEnvironmentMap](this[$currentEnvironmentMap]);
            }
        }
        async [$updateEnvironment]() {
            const { skyboxImage, environmentImage } = this;
            if (this[$cancelEnvironmentUpdate] != null) {
                this[$cancelEnvironmentUpdate]();
                this[$cancelEnvironmentUpdate] = null;
            }
            const { textureUtils } = this[$renderer];
            if (textureUtils == null) {
                return;
            }
            try {
                const { environmentMap, skybox } = await new Promise(async (resolve, reject) => {
                    const texturesLoad = textureUtils.generateEnvironmentMapAndSkybox(deserializeUrl(skyboxImage), environmentImage, { progressTracker: this[$progressTracker] });
                    this[$cancelEnvironmentUpdate] = () => reject(texturesLoad);
                    resolve(await texturesLoad);
                });
                if (skybox != null) {
                    // When using the same environment and skybox, use the environment as
                    // it gives HDR filtering.
                    this[$scene].background =
                        skybox.name === environmentMap.name ? environmentMap : skybox;
                }
                else {
                    this[$scene].background = null;
                }
                this[$applyEnvironmentMap](environmentMap);
                this[$scene].dispatchEvent({ type: 'envmap-update' });
            }
            catch (errorOrPromise) {
                if (errorOrPromise instanceof Error) {
                    this[$applyEnvironmentMap](null);
                    throw errorOrPromise;
                }
            }
        }
        /**
         * Sets the Model to use the provided environment map,
         * or `null` if the Model should remove its' environment map.
         */
        [$applyEnvironmentMap](environmentMap) {
            if (this[$scene].environment === environmentMap) {
                return;
            }
            this[$currentEnvironmentMap] = environmentMap;
            this[$scene].environment = this[$currentEnvironmentMap];
            this.dispatchEvent(new CustomEvent('environment-change'));
            this[$needsRender]();
        }
    }
    __decorate([
        property({ type: String, attribute: 'environment-image' })
    ], EnvironmentModelViewerElement.prototype, "environmentImage", void 0);
    __decorate([
        property({ type: String, attribute: 'skybox-image' })
    ], EnvironmentModelViewerElement.prototype, "skyboxImage", void 0);
    __decorate([
        property({ type: Number, attribute: 'shadow-intensity' })
    ], EnvironmentModelViewerElement.prototype, "shadowIntensity", void 0);
    __decorate([
        property({ type: Number, attribute: 'shadow-softness' })
    ], EnvironmentModelViewerElement.prototype, "shadowSoftness", void 0);
    __decorate([
        property({
            type: Number,
        })
    ], EnvironmentModelViewerElement.prototype, "exposure", void 0);
    return EnvironmentModelViewerElement;
};
//# sourceMappingURL=environment.js.map