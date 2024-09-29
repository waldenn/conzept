import { TypedArray } from './utils/shared';
import { NumberArray3, Vec3 } from './math/Vec3';
import { Mat4 } from "./math/Mat4";
interface IObject3dParams {
    name?: string;
    vertices?: number[];
    texCoords?: number[];
    indices?: number[];
    normals?: number[];
    center?: boolean;
    src?: string;
    color?: number[] | TypedArray | string;
    scale?: number | Vec3;
}
declare class Object3d {
    protected _name: string;
    protected _vertices: number[];
    protected _numVertices: number;
    protected _texCoords: number[];
    /**
     * Image src.
     * @protected
     * @type {string}
     */
    protected _src: string | null;
    protected color: Float32Array;
    protected _indices: number[];
    protected _normals: number[];
    constructor(data?: IObject3dParams);
    static centering(verts: number[]): void;
    centering(): this;
    applyMat4(m: Mat4): this;
    scale(s: Vec3): this;
    translate(v: Vec3): this;
    get src(): string | null;
    set src(src: string | null);
    get name(): string;
    get vertices(): number[];
    get normals(): number[];
    get indices(): number[];
    get texCoords(): number[];
    get numVertices(): number;
    static scale(vertices: number[], s: Vec3): void;
    static centroid(vertices: number[]): number[];
    static translate(vertices: number[], v: NumberArray3): void;
    static getNormals(vertices: number[]): number[];
    static createSphere(lonBands?: number, latBands?: number, radius?: number, offsetX?: number, offsetY?: number, offsetZ?: number): Object3d;
    static createDisc(radius?: number, height?: number, radialSegments?: number, isTop?: boolean, startIndex?: number, offsetX?: number, offsetY?: number, offsetZ?: number): Object3d;
    /**
     * Returns scale parameters for a frustum geoObject created with only Object3d.createFrustum();
     * @param length
     * @param horizontalAngle
     * @param verticalAngle
     */
    static getFrustumScaleByCameraAngles(length: number, horizontalAngle: number, verticalAngle: number): Vec3;
    /**
     * Returns scale parameters for a frustum geoObject created with only Object3d.createFrustum();
     * @param length
     * @param horizontalAngle
     * @param aspectRatio
     */
    static getFrustumScaleByCameraAspectRatio(length: number, horizontalAngle: number, aspectRatio: number): Vec3;
    static createFrustum(length?: number, width?: number, height?: number, xOffset?: number, yOffset?: number, zOffset?: number): Object3d;
    static createCylinder(radiusTop?: number, radiusBottom?: number, height?: number, radialSegments?: number, heightSegments?: number, isTop?: boolean, isBottom?: boolean, offsetX?: number, offsetY?: number, offsetZ?: number): Object3d;
    static createCube(length?: number, height?: number, depth?: number, xOffset?: number, yOffset?: number, zOffset?: number): Object3d;
    static createArrow(back?: number, height?: number, front?: number): Object3d;
    static loadObj(src: string): Promise<Object3d[]>;
    merge(other: Object3d): Object3d;
}
export { Object3d };
