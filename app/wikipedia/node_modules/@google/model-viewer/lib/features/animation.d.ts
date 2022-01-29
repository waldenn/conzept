import ModelViewerElementBase from '../model-viewer-base.js';
import { Constructor } from '../utilities.js';
export declare interface AnimationInterface {
    autoplay: boolean;
    animationName: string | void;
    animationCrossfadeDuration: number;
    readonly availableAnimations: Array<string>;
    readonly paused: boolean;
    readonly duration: number;
    currentTime: number;
    pause(): void;
    play(): void;
}
export declare const AnimationMixin: <T extends Constructor<ModelViewerElementBase, object>>(ModelViewerElement: T) => {
    new (...args: any[]): AnimationInterface;
    prototype: AnimationInterface;
} & object & T;
