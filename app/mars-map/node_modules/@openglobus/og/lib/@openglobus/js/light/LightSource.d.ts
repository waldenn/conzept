import { Vec3 } from "../math/Vec3";
import { RenderNode } from "../scene/RenderNode";
export interface ILightSourceParams {
    position?: Vec3;
    directional?: boolean;
    ambient?: Vec3;
    diffuse?: Vec3;
    specular?: Vec3;
    shininess?: number;
}
/**
 * Represents basic light source.
 * @class
 * @param {string} [name] - Light source name.
 * @param {ILightSourceParams} [params] - Light parameters:
 * @param {Vec3} [params.position] - Light source position if it is a point light, otherwise it is a light direction vector.
 * @param {Vec3} [params.ambient]  - Ambient RGB color.
 * @param {Vec3} [params.diffuse]  - Diffuse RGB color.
 * @param {Vec3} [params.specular]  - Specular RGB color.
 * @param {number} [params.shininess]  - Specular shininess.
 */
declare class LightSource {
    static __counter__: number;
    /**
     * Light name.
     * @protected
     * @type {string}
     */
    protected _name: string;
    /**
     * Render node where light is shines.
     * @protected
     * @type {RenderNode}
     */
    protected _renderNode: RenderNode | null;
    /**
     * Light position.
     * @public
     * @type {Vec3}
     */
    _position: Vec3;
    /**
     * True if the light is directional.
     * @public
     * @type {boolean}
     */
    directional: boolean;
    /**
     * Ambient color.
     * @protected
     * @type {Vec3}
     */
    protected _ambient: Vec3;
    /**
     * Diffuse color.
     * @protected
     * @type {Vec3}
     */
    protected _diffuse: Vec3;
    /**
     * Specular color.
     * @protected
     * @type {Vec3}
     */
    protected _specular: Vec3;
    /**
     * Shininess.
     * @protected
     * @type {number}
     */
    protected _shininess: number;
    /**
     * Light activity.
     * @protected
     * @type {boolean}
     */
    protected _active: boolean;
    protected _tempAmbient: Vec3;
    protected _tempDiffuse: Vec3;
    protected _tempSpecular: Vec3;
    protected _tempShininess: number;
    constructor(name: string, params: ILightSourceParams);
    /**
     * Creates clone of the current light object.
     * @todo: TODO
     * @public
     * @returns {LightSource}
     */
    clone(): void;
    /**
     * Set light activity. If activity is false the light doesn't shine.
     * @public
     * @param {boolean} active - Light activity.
     */
    setActive(active: boolean): void;
    /**
     * Gets light activity.
     * @public
     * @returns {boolean}
     */
    isActive(): boolean;
    /**
     * Set light source position, or if it is a directional type sets light direction vector.
     * @public
     * @param {Vec3} position - Light position or direction vector.
     */
    setPosition3v(position: Vec3): void;
    /**
     * Set light source position, or if it is a directional type sets light direction vector.
     * @public
     */
    setPosition(x: number, y: number, z: number): void;
    /**
     * Returns light source position, or if it is a directional type sets light direction vector.
     * @public
     * @returns {Vec3} - Light source position/direction.
     */
    getPosition(): Vec3;
    /**
     * Set ambient color.
     * @public
     * @param {Vec3} rgb - Ambient color.
     */
    setAmbient3v(rgb: Vec3): void;
    /**
     * Set diffuse color.
     * @public
     * @param {Vec3} rgb - Diffuse color.
     */
    setDiffuse3v(rgb: Vec3): void;
    /**
     * Set specular color.
     * @public
     * @param {Vec3} rgb - Specular color.
     */
    setSpecular3v(rgb: Vec3): void;
    /**
     * Set ambient color.
     * @public
     */
    setAmbient(r: number, g: number, b: number): void;
    /**
     * Set diffuse color.
     * @public
     */
    setDiffuse(r: number, g: number, b: number): void;
    /**
     * Set specular color.
     * @public
     */
    setSpecular(r: number, g: number, b: number): void;
    /**
     * Set material shininess.
     * @public
     */
    setShininess(shininess: number): void;
    /**
     * Sets light to black.
     * @public
     */
    setBlack(): void;
    /**
     * Adds current light to the render node scene.
     * @public
     * @param {RenderNode} renderNode - Render node scene.
     */
    addTo(renderNode: RenderNode): void;
    /**
     * Removes from render node scene.
     * @public
     */
    remove(): void;
}
export { LightSource };
