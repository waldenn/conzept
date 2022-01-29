import { BufferAttribute, InterleavedBufferAttribute, Object3D, Vector3 } from 'three';
/**
 * Gets a scale value to perform inverse quantization of a vertex value
 * Reference:
 * https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization#encoding-quantized-data
 * @param buffer A gltf vertex buffer
 * @returns A scale value based on KHR_mesh_quantization or 1 if the buffer is
 *     not quantized.
 */
export declare const getNormalizedComponentScale: (buffer: BufferAttribute | InterleavedBufferAttribute) => number;
/**
 * Moves Three.js objects from one parent to another
 */
export declare const moveChildren: (from: Object3D, to: Object3D) => void;
/**
 * Performs a reduction across all the vertices of the input model and all its
 * children. The supplied function takes the reduced value and a vertex and
 * returns the newly reduced value. The value is initialized as zero.
 *
 * Adapted from Three.js, @see https://github.com/mrdoob/three.js/blob/7e0a78beb9317e580d7fa4da9b5b12be051c6feb/src/math/Box3.js#L241
 */
export declare const reduceVertices: <T>(model: Object3D, func: (value: T, vertex: Vector3) => T, initialValue: T) => T;
