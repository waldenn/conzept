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
// Adapted from https://gist.github.com/gre/1650294
export const easeInOutQuad = (t) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
/**
 * Creates a TimingFunction that uses a given ease to interpolate between
 * two configured number values.
 */
export const interpolate = (start, end, ease = easeInOutQuad) => (time) => start + (end - start) * ease(time);
/**
 * Creates a TimingFunction that interpolates through a weighted list
 * of other TimingFunctions ("tracks"). Tracks are interpolated in order, and
 * allocated a percentage of the total time based on their relative weight.
 */
export const sequence = (tracks, weights) => {
    const totalWeight = weights.reduce((total, weight) => total + weight, 0);
    const ratios = weights.map(weight => weight / totalWeight);
    return (time) => {
        let start = 0;
        let ratio = Infinity;
        let track = () => 0;
        for (let i = 0; i < ratios.length; ++i) {
            ratio = ratios[i];
            track = tracks[i];
            if (time <= (start + ratio)) {
                break;
            }
            start += ratio;
        }
        return track((time - start) / ratio);
    };
};
/**
 * Creates a "timeline" TimingFunction out of an initial value and a series of
 * Keyframes. The timeline function accepts value from 0-1 and returns the
 * current value based on keyframe interpolation across the total number of
 * frames. Frames are only used to indicate the relative length of each keyframe
 * transition, so interpolated values will be computed for fractional frames.
 */
export const timeline = (initialValue, keyframes) => {
    const tracks = [];
    const weights = [];
    let lastValue = initialValue;
    for (let i = 0; i < keyframes.length; ++i) {
        const keyframe = keyframes[i];
        const { value, frames } = keyframe;
        const ease = keyframe.ease || easeInOutQuad;
        const track = interpolate(lastValue, value, ease);
        tracks.push(track);
        weights.push(frames);
        lastValue = value;
    }
    return sequence(tracks, weights);
};
//# sourceMappingURL=animation.js.map