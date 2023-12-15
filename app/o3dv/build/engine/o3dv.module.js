import * as THREE from 'three';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { AMFLoader } from 'three/examples/jsm/loaders/AMFLoader.js';
import * as fflate from 'fflate';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

function IsDefined (val)
{
    return val !== undefined && val !== null;
}

function ValueOrDefault (val, def)
{
    if (val === undefined || val === null) {
        return def;
    }
    return val;
}

function CopyObjectAttributes (src, dest)
{
    if (!IsDefined (src)) {
        return;
    }
    for (let attribute of Object.keys (src)) {
        if (IsDefined (src[attribute])) {
            dest[attribute] = src[attribute];
        }
    }
}

function IsObjectEmpty (obj)
{
    return Object.keys (obj).length === 0;
}

function EscapeHtmlChars (str)
{
    return str.replace (/</g, '&lt;').replace (/>/g, '&gt;');
}

class EventNotifier
{
    constructor ()
    {
        this.eventListeners = new Map ();
    }

    AddEventListener (eventId, listener)
    {
        if (!this.eventListeners.has (eventId)) {
            this.eventListeners.set (eventId, []);
        }
        let listeners = this.eventListeners.get (eventId);
        listeners.push (listener);
    }

    HasEventListener (eventId)
    {
        return this.eventListeners.has (eventId);
    }

    GetEventNotifier (eventId)
    {
        return () => {
            this.NotifyEventListeners (eventId);
        };
    }

    NotifyEventListeners (eventId, ...args)
    {
        if (!this.eventListeners.has (eventId)) {
            return;
        }
        let listeners = this.eventListeners.get (eventId);
        for (let listener of listeners) {
            listener (...args);
        }
    }
}

class TaskRunner
{
    constructor ()
    {
        this.count = null;
        this.current = null;
        this.callbacks = null;
    }

    Run (count, callbacks)
    {
        this.count = count;
        this.current = 0;
        this.callbacks = callbacks;
        if (count === 0) {
            this.TaskReady ();
        } else {
            this.RunOnce ();
        }
    }

    RunBatch (count, batchCount, callbacks)
    {
        let stepCount = 0;
        if (count > 0) {
            stepCount = parseInt ((count - 1) / batchCount, 10) + 1;
        }
        this.Run (stepCount, {
            runTask : (index, ready) => {
                const firstIndex = index * batchCount;
                const lastIndex = Math.min ((index + 1) * batchCount, count) - 1;
                callbacks.runTask (firstIndex, lastIndex, ready);
            },
            onReady : callbacks.onReady
        });
    }

    RunOnce ()
    {
        setTimeout (() => {
            this.callbacks.runTask (this.current, this.TaskReady.bind (this));
        }, 0);
    }

    TaskReady ()
    {
        this.current += 1;
        if (this.current < this.count) {
            this.RunOnce ();
        } else {
            if (this.callbacks.onReady) {
                this.callbacks.onReady ();
            }
        }
    }
}

function RunTaskAsync (task)
{
    setTimeout (() => {
        task ();
    }, 10);
}

function RunTasks (count, callbacks)
{
    let taskRunner = new TaskRunner ();
    taskRunner.Run (count, callbacks);
}

function RunTasksBatch (count, batchCount, callbacks)
{
    let taskRunner = new TaskRunner ();
    taskRunner.RunBatch (count, batchCount, callbacks);
}

function WaitWhile (expression)
{
    function Waiter (expression)
    {
        if (expression ()) {
            setTimeout (() => {
                Waiter (expression);
            }, 10);
        }
    }
    Waiter (expression);
}

let externalLibLocation = null;
let loadedExternalLibs = new Set ();

/**
 * Sets the location of the external libraries used by the engine. This is the content of the libs
 * folder in the package. The location must be relative to the main file.
 * @param {string} newExternalLibLocation Relative path to the libs folder.
 */
function SetExternalLibLocation (newExternalLibLocation)
{
    externalLibLocation = newExternalLibLocation;
}

function GetExternalLibPath (libName)
{
    if (externalLibLocation === null) {
        return null;
    }
    return externalLibLocation + '/' + libName;
}

function LoadExternalLibrary (libName)
{
    return new Promise ((resolve, reject) => {
        if (externalLibLocation === null) {
            reject ();
            return;
        }

        if (loadedExternalLibs.has (libName)) {
            resolve ();
            return;
        }

        let scriptElement = document.createElement ('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = GetExternalLibPath (libName);
        scriptElement.onload = () => {
            loadedExternalLibs.add (libName);
            resolve ();
        };
        scriptElement.onerror = () => {
            reject ();
        };
        document.head.appendChild (scriptElement);
    });
}

/**
 * File source identifier for import.
 * @enum
 */
const FileSource =
{
	/** The file is provided by a URL. */
    Url : 1,
	/** The file is provided by a {@link File} object. */
    File : 2,
	/** Used internally if a file is originated by a compressed archive. */
	Decompressed : 3
};

const FileFormat =
{
    Text : 1,
    Binary : 2
};

function GetFileName (filePath)
{
	let fileName = filePath;

	let firstParamIndex = fileName.indexOf ('?');
	if (firstParamIndex !== -1) {
		fileName = fileName.substring (0, firstParamIndex);
	}

	let firstSeparator = fileName.lastIndexOf ('/');
	if (firstSeparator === -1) {
		firstSeparator = fileName.lastIndexOf ('\\');
	}
	if (firstSeparator !== -1) {
		fileName = fileName.substring (firstSeparator + 1);
	}

	return decodeURI (fileName);
}

function GetFileExtension (filePath)
{
	let fileName = GetFileName (filePath);
	let firstPoint = fileName.lastIndexOf ('.');
	if (firstPoint === -1) {
		return '';
	}
	let extension = fileName.substring (firstPoint + 1);
	return extension.toLowerCase ();
}

function RequestUrl (url, onProgress)
{
	return new Promise ((resolve, reject) => {
		let request = new XMLHttpRequest ();
		request.open ('GET', url, true);

		request.onprogress = (event) => {
			onProgress (event.loaded, event.total);
		};

		request.onload = () => {
			if (request.status === 200) {
				resolve (request.response);
			} else {
				reject ();
			}
		};

		request.onerror = () => {
			reject ();
		};

		request.responseType = 'arraybuffer';
		request.send (null);
	});
}

function ReadFile (file, onProgress)
{
	return new Promise ((resolve, reject) => {
		let reader = new FileReader ();

		reader.onprogress = (event) => {
			onProgress (event.loaded, event.total);
		};

		reader.onloadend = (event) => {
			if (event.target.readyState === FileReader.DONE) {
				resolve (event.target.result);
			}
		};

		reader.onerror = () => {
			reject ();
		};

		reader.readAsArrayBuffer (file);
	});
}

function TransformFileHostUrls (urls)
{
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        if (url.indexOf ('www.dropbox.com') !== -1) {
            url = url.replace ('www.dropbox.com', 'dl.dropbox.com');
            urls[i] = url;
        } else if (url.indexOf ('github.com') !== -1) {
            url = url.replace ('github.com', 'raw.githubusercontent.com');
            url = url.replace ('/blob', '');
            urls[i] = url;
        }
    }
}

function IsUrl (str)
{
	const regex = /^https?:\/\/\S+$/g;
	const match = str.match (regex);
	return match !== null;
}

const Eps = 0.00000001;
const BigEps = 0.0001;
const RadDeg = 57.29577951308232;
const DegRad = 0.017453292519943;

function IsZero (a)
{
	return Math.abs (a) < Eps;
}

function IsLower (a, b)
{
	return b - a > Eps;
}

function IsGreater (a, b)
{
	return a - b > Eps;
}

function IsLowerOrEqual (a, b)
{
	return b - a > -Eps;
}

function IsGreaterOrEqual (a, b)
{
	return a - b > -Eps;
}

function IsEqual (a, b)
{
	return Math.abs (b - a) < Eps;
}

function IsEqualEps (a, b, eps)
{
	return Math.abs (b - a) < eps;
}

function IsPositive (a)
{
	return a > Eps;
}

function IsNegative (a)
{
	return a < -Eps;
}

const Direction =
{
	X : 1,
	Y : 2,
	Z : 3
};

class Coord2D
{
	constructor (x, y)
	{
		this.x = x;
		this.y = y;
	}

	Clone ()
	{
		return new Coord2D (this.x, this.y);
	}
}

function CoordIsEqual2D (a, b)
{
	return IsEqual (a.x, b.x) && IsEqual (a.y, b.y);
}

function AddCoord2D (a, b)
{
	return new Coord2D (a.x + b.x, a.y + b.y);
}

function SubCoord2D (a, b)
{
	return new Coord2D (a.x - b.x, a.y - b.y);
}

function CoordDistance2D (a, b)
{
	return Math.sqrt ((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

/**
 * RGB color object. Components are integers in the range of 0..255.
 */
class RGBColor
{
    /**
     * @param {integer} r Red component.
     * @param {integer} g Green component.
     * @param {integer} b Blue component.
     */
    constructor (r, g, b)
    {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    /**
     * Sets the value of all components.
     * @param {integer} r Red component.
     * @param {integer} g Green component.
     * @param {integer} b Blue component.
     */
    Set (r, g, b)
    {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    /**
     * Creates a clone of the object.
     * @returns {RGBColor}
     */
    Clone ()
    {
        return new RGBColor (this.r, this.g, this.b);
    }
}

/**
 * RGBA color object. Components are integers in the range of 0..255.
 */
class RGBAColor
{
    /**
     * @param {integer} r Red component.
     * @param {integer} g Green component.
     * @param {integer} b Blue component.
     * @param {integer} a Alpha component.
     */
    constructor (r, g, b, a)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * Sets the value of all components.
     * @param {integer} r Red component.
     * @param {integer} g Green component.
     * @param {integer} b Blue component.
     * @param {integer} a Alpha component.
     */
    Set (r, g, b, a)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * Creates a clone of the object.
     * @returns {RGBAColor}
     */
    Clone ()
    {
        return new RGBAColor (this.r, this.g, this.b, this.a);
    }
}

function ColorComponentFromFloat (component)
{
    return parseInt (Math.round (component * 255.0), 10);
}

function ColorComponentToFloat (component)
{
    return component / 255.0;
}

function RGBColorFromFloatComponents (r, g, b)
{
    return new RGBColor (
        ColorComponentFromFloat (r),
        ColorComponentFromFloat (g),
        ColorComponentFromFloat (b)
    );
}

function SRGBToLinear (component)
{
    if (component < 0.04045) {
        return component * 0.0773993808;
    } else {
        return Math.pow (component * 0.9478672986 + 0.0521327014, 2.4);
    }
}

function LinearToSRGB (component)
{
    if (component < 0.0031308) {
        return component * 12.92;
    } else {
        return 1.055 * (Math.pow (component, 0.41666)) - 0.055;
    }
}

function IntegerToHexString (intVal)
{
    let result = parseInt (intVal, 10).toString (16);
    while (result.length < 2) {
        result = '0' + result;
    }
    return result;
}

function RGBColorToHexString (color)
{
    let r = IntegerToHexString (color.r);
    let g = IntegerToHexString (color.g);
    let b = IntegerToHexString (color.b);
    return r + g + b;
}

function RGBAColorToHexString (color)
{
    let r = IntegerToHexString (color.r);
    let g = IntegerToHexString (color.g);
    let b = IntegerToHexString (color.b);
    let a = IntegerToHexString (color.a);
    return r + g + b + a;
}

function HexStringToRGBColor (hexString)
{
    if (hexString.length !== 6) {
        return null;
    }

    let r = parseInt (hexString.substring (0, 2), 16);
    let g = parseInt (hexString.substring (2, 4), 16);
    let b = parseInt (hexString.substring (4, 6), 16);
    return new RGBColor (r, g, b);
}

function HexStringToRGBAColor (hexString)
{
    if (hexString.length !== 6 && hexString.length !== 8) {
        return null;
    }

    let r = parseInt (hexString.substring (0, 2), 16);
    let g = parseInt (hexString.substring (2, 4), 16);
    let b = parseInt (hexString.substring (4, 6), 16);
    let a = 255;
    if (hexString.length === 8) {
        a = parseInt (hexString.substring (6, 8), 16);
    }
    return new RGBAColor (r, g, b, a);
}

function ArrayToRGBColor (arr)
{
	return new RGBColor (arr[0], arr[1], arr[2]);
}

function RGBColorIsEqual (a, b)
{
	return a.r === b.r && a.g === b.g && a.b === b.b;
}

class TextureMap
{
    constructor ()
    {
        this.name = null;
        this.mimeType = null;
        this.buffer = null;
        this.offset = new Coord2D (0.0, 0.0);
        this.scale = new Coord2D (1.0, 1.0);
        this.rotation = 0.0; // radians
    }

    IsValid ()
    {
        return this.name !== null && this.buffer !== null;
    }

    HasTransformation ()
    {
        if (!CoordIsEqual2D (this.offset, new Coord2D (0.0, 0.0))) {
            return true;
        }
        if (!CoordIsEqual2D (this.scale, new Coord2D (1.0, 1.0))) {
            return true;
        }
        if (!IsEqual (this.rotation, 0.0)) {
            return true;
        }
        return false;
    }

    IsEqual (rhs)
    {
        if (this.name !== rhs.name) {
            return false;
        }
        if (this.mimeType !== rhs.mimeType) {
            return false;
        }
        if (!CoordIsEqual2D (this.offset, rhs.offset)) {
            return false;
        }
        if (!CoordIsEqual2D (this.scale, rhs.scale)) {
            return false;
        }
        if (!IsEqual (this.rotation, rhs.rotation)) {
            return false;
        }
        return true;
    }
}

function TextureMapIsEqual (aTex, bTex)
{
    if (aTex === null && bTex === null) {
        return true;
    } else if (aTex === null || bTex === null) {
        return false;
    }
    return aTex.IsEqual (bTex);
}

const MaterialType =
{
    Phong : 1,
    Physical : 2
};

class MaterialBase
{
    constructor (type)
    {
        this.type = type;
        this.isDefault = false;

        this.name = '';
        this.color = new RGBColor (0, 0, 0);

        this.vertexColors = false;
    }

    IsEqual (rhs)
    {
        if (this.type !== rhs.type) {
            return false;
        }
        if (this.isDefault !== rhs.isDefault) {
            return false;
        }
        if (this.name !== rhs.name) {
            return false;
        }
        if (!RGBColorIsEqual (this.color, rhs.color)) {
            return false;
        }
        if (this.vertexColors !== rhs.vertexColors) {
            return false;
        }
        return true;
    }
}

class FaceMaterial extends MaterialBase
{
    constructor (type)
    {
        super (type);

        this.emissive = new RGBColor (0, 0, 0);

        this.opacity = 1.0; // 0.0 .. 1.0
        this.transparent = false;

        this.diffuseMap = null;
        this.bumpMap = null;
        this.normalMap = null;
        this.emissiveMap = null;

        this.alphaTest = 0.0; // 0.0 .. 1.0
        this.multiplyDiffuseMap = false;
    }

    IsEqual (rhs)
    {
        if (!super.IsEqual (rhs)) {
            return false;
        }
        if (!RGBColorIsEqual (this.emissive, rhs.emissive)) {
            return false;
        }
        if (!IsEqual (this.opacity, rhs.opacity)) {
            return false;
        }
        if (this.transparent !== rhs.transparent) {
            return false;
        }
        if (!TextureMapIsEqual (this.diffuseMap, rhs.diffuseMap)) {
            return false;
        }
        if (!TextureMapIsEqual (this.bumpMap, rhs.bumpMap)) {
            return false;
        }
        if (!TextureMapIsEqual (this.normalMap, rhs.normalMap)) {
            return false;
        }
        if (!TextureMapIsEqual (this.emissiveMap, rhs.emissiveMap)) {
            return false;
        }
        if (!IsEqual (this.alphaTest, rhs.alphaTest)) {
            return false;
        }
        if (this.multiplyDiffuseMap !== rhs.multiplyDiffuseMap) {
            return false;
        }
        return true;
    }
}

class PhongMaterial extends FaceMaterial
{
    constructor ()
    {
        super (MaterialType.Phong);

        this.ambient = new RGBColor (0, 0, 0);
        this.specular = new RGBColor (0, 0, 0);
        this.shininess = 0.0; // 0.0 .. 1.0
        this.specularMap = null;
    }

    IsEqual (rhs)
    {
        if (!super.IsEqual (rhs)) {
            return false;
        }
        if (!RGBColorIsEqual (this.ambient, rhs.ambient)) {
            return false;
        }
        if (!RGBColorIsEqual (this.specular, rhs.specular)) {
            return false;
        }
        if (!IsEqual (this.shininess, rhs.shininess)) {
            return false;
        }
        if (!TextureMapIsEqual (this.specularMap, rhs.specularMap)) {
            return false;
        }
        return true;
    }
}

class PhysicalMaterial extends FaceMaterial
{
    constructor ()
    {
        super (MaterialType.Physical);

        this.metalness = 0.0; // 0.0 .. 1.0
        this.roughness = 1.0; // 0.0 .. 1.0
        this.metalnessMap = null;
    }

    IsEqual (rhs)
    {
        if (!super.IsEqual (rhs)) {
            return false;
        }
        if (!IsEqual (this.metalness, rhs.metalness)) {
            return false;
        }
        if (!IsEqual (this.roughness, rhs.roughness)) {
            return false;
        }
        if (!TextureMapIsEqual (this.metalnessMap, rhs.metalnessMap)) {
            return false;
        }
        return true;
    }
}

function TextureIsEqual (a, b)
{
    if (a.name !== b.name) {
        return false;
    }
    if (a.mimeType !== b.mimeType) {
        return false;
    }
    if (!CoordIsEqual2D (a.offset, b.offset)) {
        return false;
    }
    if (!CoordIsEqual2D (a.scale, b.scale)) {
        return false;
    }
    if (!IsEqual (a.rotation, b.rotation)) {
        return false;
    }
    return true;
}

class Coord3D
{
	constructor (x, y, z)
	{
		this.x = x;
		this.y = y;
		this.z = z;
	}

	Length ()
	{
		return Math.sqrt (this.x * this.x + this.y * this.y + this.z * this.z);
	}

	MultiplyScalar (scalar)
	{
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}

	Normalize ()
	{
		let length = this.Length ();
		if (length > 0.0) {
			this.MultiplyScalar (1.0 / length);
		}
		return this;
	}

	Offset (direction, distance)
	{
		let normal = direction.Clone ().Normalize ();
		this.x += normal.x * distance;
		this.y += normal.y * distance;
		this.z += normal.z * distance;
		return this;
	}

	Rotate (axis, angle, origo)
	{
		let normal = axis.Clone ().Normalize ();

		let u = normal.x;
		let v = normal.y;
		let w = normal.z;

		let x = this.x - origo.x;
		let y = this.y - origo.y;
		let z = this.z - origo.z;

		let si = Math.sin (angle);
		let co = Math.cos (angle);
		this.x = - u * (- u * x - v * y - w * z) * (1.0 - co) + x * co + (- w * y + v * z) * si;
		this.y = - v * (- u * x - v * y - w * z) * (1.0 - co) + y * co + (w * x - u * z) * si;
		this.z = - w * (- u * x - v * y - w * z) * (1.0 - co) + z * co + (- v * x + u * y) * si;

		this.x += origo.x;
		this.y += origo.y;
		this.z += origo.z;
		return this;
	}

	Clone ()
	{
		return new Coord3D (this.x, this.y, this.z);
	}
}

function CoordIsEqual3D (a, b)
{
	return IsEqual (a.x, b.x) && IsEqual (a.y, b.y) && IsEqual (a.z, b.z);
}

function AddCoord3D (a, b)
{
	return new Coord3D (a.x + b.x, a.y + b.y, a.z + b.z);
}

function SubCoord3D (a, b)
{
	return new Coord3D (a.x - b.x, a.y - b.y, a.z - b.z);
}

function CoordDistance3D (a, b)
{
	return Math.sqrt ((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) + (a.z - b.z) * (a.z - b.z));
}

function DotVector3D (a, b)
{
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

function VectorAngle3D (a, b)
{
	let aDirection = a.Clone ().Normalize ();
	let bDirection = b.Clone ().Normalize ();
	if (CoordIsEqual3D (aDirection, bDirection)) {
		return 0.0;
	}
	let product = DotVector3D (aDirection, bDirection);
	return Math.acos (product);
}

function CrossVector3D (a, b)
{
	let result = new Coord3D (0.0, 0.0, 0.0);
	result.x = a.y * b.z - a.z * b.y;
	result.y = a.z * b.x - a.x * b.z;
	result.z = a.x * b.y - a.y * b.x;
	return result;
}

function VectorLength3D (x, y, z)
{
	return Math.sqrt (x * x + y * y + z * z);
}

function ArrayToCoord3D (arr)
{
	return new Coord3D (arr[0], arr[1], arr[2]);
}

class MeshPrimitiveBuffer
{
    constructor ()
    {
        this.indices = [];
        this.vertices = [];
        this.colors = [];
        this.normals = [];
        this.uvs = [];
        this.material = null;
    }

    GetBounds ()
    {
        let min = [Infinity, Infinity, Infinity];
        let max = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < this.vertices.length / 3; i++) {
            for (let j = 0; j < 3; j++) {
                min[j] = Math.min (min[j], this.vertices[i * 3 + j]);
                max[j] = Math.max (max[j], this.vertices[i * 3 + j]);
            }
        }
        return {
            min : min,
            max : max
        };
    }

    GetByteLength (indexTypeSize, numberTypeSize)
    {
        let indexCount = this.indices.length;
        let numberCount = this.vertices.length + this.colors.length + this.normals.length + this.uvs.length;
        return indexCount * indexTypeSize + numberCount * numberTypeSize;
    }
}

class MeshBuffer
{
    constructor ()
    {
        this.primitives = [];
    }

    PrimitiveCount ()
    {
        return this.primitives.length;
    }

    GetPrimitive (index)
    {
        return this.primitives[index];
    }

    GetByteLength (indexTypeSize, numberTypeSize)
    {
        let byteLength = 0;
        for (let i = 0; i < this.primitives.length; i++) {
            let primitive = this.primitives[i];
            byteLength += primitive.GetByteLength (indexTypeSize, numberTypeSize);
        }
        return byteLength;
    }
}

function ConvertMeshToMeshBuffer (mesh)
{
    function AddVertexToPrimitiveBuffer (mesh, indices, primitiveBuffer, meshVertexToPrimitiveVertices)
    {
        function GetColorOrDefault (mesh, colorIndex, forceColors)
        {
            if (colorIndex !== null) {
                return mesh.GetVertexColor (colorIndex);
            } else if (forceColors) {
                return new RGBColor (0, 0, 0);
            } else {
                return null;
            }
        }

        function GetUVOrDefault (mesh, uvIndex, forceUVs)
        {
            if (uvIndex !== null) {
                return mesh.GetTextureUV (uvIndex);
            } else if (forceUVs) {
                return new Coord2D (0.0, 0.0);
            } else {
                return null;
            }
        }

        function AddVertex (mesh, indices, primitiveBuffer)
        {
            let forceColors = mesh.VertexColorCount () > 0;
            let forceUVs = mesh.TextureUVCount () > 0;

            let vertex = mesh.GetVertex (indices.vertex);
            let normal = mesh.GetNormal (indices.normal);

            let primitiveVertexIndex = primitiveBuffer.vertices.length / 3;
            primitiveBuffer.indices.push (primitiveVertexIndex);
            primitiveBuffer.vertices.push (vertex.x, vertex.y, vertex.z);

            let color = GetColorOrDefault (mesh, indices.color, forceColors);
            if (color !== null) {
                primitiveBuffer.colors.push (color.r / 255.0, color.g / 255.0, color.b / 255.0);
            }

            primitiveBuffer.normals.push (normal.x, normal.y, normal.z);

            let uv = GetUVOrDefault (mesh, indices.uv, forceUVs);
            if (uv !== null) {
                primitiveBuffer.uvs.push (uv.x, uv.y);
            }

            return {
                index : primitiveVertexIndex,
                color : color,
                normal : normal,
                uv : uv
            };
        }

        function FindMatchingPrimitiveVertex (mesh, primitiveVertices, indices)
        {
            function IsEqualColor (mesh, colorIndex, existingColor)
            {
                if (existingColor === null && colorIndex === null) {
                    return true;
                }
                let color = GetColorOrDefault (mesh, colorIndex, true);
                return RGBColorIsEqual (existingColor, color);
            }

            function IsEqualNormal (mesh, normalIndex, existingNormal)
            {
                let normal = mesh.GetNormal (normalIndex);
                return CoordIsEqual3D (existingNormal, normal);
            }

            function IsEqualUV (mesh, uvIndex, existingUv)
            {
                if (existingUv === null && uvIndex === null) {
                    return true;
                }
                let uv = GetUVOrDefault (mesh, uvIndex, true);
                return CoordIsEqual2D (existingUv, uv);
            }

            for (let i = 0; i < primitiveVertices.length; i++) {
                let primitiveVertex = primitiveVertices[i];
                let equalColor = IsEqualColor (mesh, indices.color, primitiveVertex.color);
                let equalNormal = IsEqualNormal (mesh, indices.normal, primitiveVertex.normal);
                let equalUv = IsEqualUV (mesh, indices.uv, primitiveVertex.uv);
                if (equalColor && equalNormal && equalUv) {
                    return primitiveVertex;
                }
            }
            return null;
        }

        if (meshVertexToPrimitiveVertices.has (indices.vertex)) {
            let primitiveVertices = meshVertexToPrimitiveVertices.get (indices.vertex);
            let existingPrimitiveVertex = FindMatchingPrimitiveVertex (mesh, primitiveVertices, indices);
            if (existingPrimitiveVertex !== null) {
                primitiveBuffer.indices.push (existingPrimitiveVertex.index);
            } else {
                let primitiveVertex = AddVertex (mesh, indices, primitiveBuffer);
                primitiveVertices.push (primitiveVertex);
            }
        } else {
            let primitiveVertex = AddVertex (mesh, indices, primitiveBuffer);
            meshVertexToPrimitiveVertices.set (indices.vertex, [primitiveVertex]);
        }
    }

    let meshBuffer = new MeshBuffer ();

    let triangleCount = mesh.TriangleCount ();
    if (triangleCount === 0) {
        return null;
    }

    let triangleIndices = [];
    for (let i = 0; i < triangleCount; i++) {
        triangleIndices.push (i);
    }
    triangleIndices.sort ((a, b) => {
        let aTriangle = mesh.GetTriangle (a);
        let bTriangle = mesh.GetTriangle (b);
        return aTriangle.mat - bTriangle.mat;
    });

    let primitiveBuffer = null;
    let meshVertexToPrimitiveVertices = null;
    for (let i = 0; i < triangleIndices.length; i++) {
        let triangleIndex = triangleIndices[i];
        let triangle = mesh.GetTriangle (triangleIndex);
        if (primitiveBuffer === null || primitiveBuffer.material !== triangle.mat) {
            primitiveBuffer = new MeshPrimitiveBuffer ();
            primitiveBuffer.material = triangle.mat;
            meshVertexToPrimitiveVertices = new Map ();
            meshBuffer.primitives.push (primitiveBuffer);
        }
        let v0Indices = {
            vertex : triangle.v0,
            color : triangle.c0,
            normal : triangle.n0,
            uv : triangle.u0
        };
        let v1Indices = {
            vertex : triangle.v1,
            color : triangle.c1,
            normal : triangle.n1,
            uv : triangle.u1
        };
        let v2Indices = {
            vertex : triangle.v2,
            color : triangle.c2,
            normal : triangle.n2,
            uv : triangle.u2
        };

        AddVertexToPrimitiveBuffer (mesh, v0Indices, primitiveBuffer, meshVertexToPrimitiveVertices);
        AddVertexToPrimitiveBuffer (mesh, v1Indices, primitiveBuffer, meshVertexToPrimitiveVertices);
        AddVertexToPrimitiveBuffer (mesh, v2Indices, primitiveBuffer, meshVertexToPrimitiveVertices);
    }

    return meshBuffer;
}

function ArrayBufferToUtf8String (buffer)
{
	let decoder = new TextDecoder ('utf-8');
	return decoder.decode (buffer);
}

function ArrayBufferToAsciiString (buffer)
{
	let text = '';
	let bufferView = new Uint8Array (buffer);
	for (let i = 0; i < bufferView.byteLength; i++) {
		text += String.fromCharCode (bufferView[i]);
	}
	return text;
}

function AsciiStringToArrayBuffer (str)
{
	let buffer = new ArrayBuffer (str.length);
	let bufferView = new Uint8Array (buffer);
	for (let i = 0; i < str.length; i++) {
		bufferView[i] = str.charCodeAt (i);
	}
	return buffer;
}

function Utf8StringToArrayBuffer (str)
{
	let encoder = new TextEncoder ();
	let uint8Array = encoder.encode (str);
	return uint8Array.buffer;
}

function Base64DataURIToArrayBuffer (uri)
{
	let dataPrefix = 'data:';
	if (!uri.startsWith (dataPrefix)) {
		return null;
	}

	let mimeSeparator = uri.indexOf (';');
	if (mimeSeparator === -1) {
		return null;
	}

	let bufferSeparator = uri.indexOf (',');
	if (bufferSeparator === -1) {
		return null;
	}

	let mimeType = uri.substring (dataPrefix.length, dataPrefix.length + mimeSeparator - 5);
	let base64String = atob (uri.substring (bufferSeparator + 1));
	let buffer = new ArrayBuffer (base64String.length);
	let bufferView = new Uint8Array (buffer);
	for (let i = 0; i < base64String.length; i++) {
		bufferView[i] = base64String.charCodeAt (i);
	}

	return {
		mimeType : mimeType,
		buffer : buffer
	};
}

function GetFileExtensionFromMimeType (mimeType)
{
	if (mimeType === undefined || mimeType === null) {
		return '';
	}
	let mimeParts = mimeType.split ('/');
	if (mimeParts.length === 0) {
		return '';
	}
	return mimeParts[mimeParts.length - 1];
}

function CreateObjectUrl (content)
{
	let blob = new Blob ([content]);
	let url = URL.createObjectURL (blob);
	return url;
}

function CreateObjectUrlWithMimeType (content, mimeType)
{
	let blob = new Blob ([content], { type : mimeType });
	let url = URL.createObjectURL (blob);
	return url;
}

function RevokeObjectUrl (url)
{
	URL.revokeObjectURL (url);
}

class ExportedFile
{
	constructor (name)
	{
		this.name = name;
		this.content = null;
	}

	GetName ()
	{
		return this.name;
	}

	SetName (name)
	{
		this.name = name;
	}

	GetTextContent ()
	{
		let text = ArrayBufferToUtf8String (this.content);
		return text;
	}

	GetBufferContent ()
	{
		return this.content;
	}

	SetTextContent (content)
	{
		let buffer = Utf8StringToArrayBuffer (content);
		this.content = buffer;
	}

	SetBufferContent (content)
	{
		this.content = content;
	}
}

class ExporterBase
{
    constructor ()
    {

    }

    CanExport (format, extension)
    {
        return false;
    }

	Export (exporterModel, format, onFinish)
	{
		let files = [];
		this.ExportContent (exporterModel, format, files, () => {
			onFinish (files);
		});
	}

	ExportContent (exporterModel, format, files, onFinish)
	{

	}

	GetExportedMaterialName (originalName)
	{
		return this.GetExportedName (originalName, 'Material');
	}

	GetExportedMeshName (originalName)
	{
		return this.GetExportedName (originalName, 'Mesh');
	}

	GetExportedName (originalName, defaultName)
	{
		if (originalName.length === 0) {
			return defaultName;
		}
		return originalName;
	}
}

class Exporter3dm extends ExporterBase
{
	constructor ()
	{
		super ();
        this.rhino = null;
	}

    CanExport (format, extension)
    {
        return format === FileFormat.Binary && extension === '3dm';
    }

	ExportContent (exporterModel, format, files, onFinish)
	{
		if (this.rhino === null) {
			LoadExternalLibrary ('loaders/rhino3dm.min.js').then (() => {
                rhino3dm ().then ((rhino) => {
                    this.rhino = rhino;
                    this.ExportRhinoContent (exporterModel, files, onFinish);
                });
            }).catch (() => {
                onFinish ();
            });
		} else {
			this.ExportRhinoContent (exporterModel, files, onFinish);
		}
	}

    ExportRhinoContent (exporterModel, files, onFinish)
    {
        function ColorToRhinoColor (color)
        {
            return {
                r : color.r,
                g : color.g,
                b : color.b,
                a : 255
            };
        }

		let rhinoFile = new ExportedFile ('model.3dm');
		files.push (rhinoFile);

        let rhinoDoc = new this.rhino.File3dm ();
        exporterModel.EnumerateTransformedMeshInstances ((mesh) => {
            let meshBuffer = ConvertMeshToMeshBuffer (mesh);
            for (let primitiveIndex = 0; primitiveIndex < meshBuffer.PrimitiveCount (); primitiveIndex++) {
                let primitive = meshBuffer.GetPrimitive (primitiveIndex);
                let threeJson = {
                    data : {
                        attributes : {
                            position : {
                                itemSize : 3,
                                type : 'Float32Array',
                                array : primitive.vertices
                            },
                            normal : {
                                itemSize : 3,
                                type : 'Float32Array',
                                array : primitive.normals
                            }
                        },
                        index : {
                            type : 'Uint16Array',
                            array : primitive.indices
                        }
                    }
                };

                let material = exporterModel.GetMaterial (primitive.material);
                let rhinoMaterial = new this.rhino.Material ();
                rhinoMaterial.name = this.GetExportedMaterialName (material.name);
                if (material.type === MaterialType.Phong) {
                    rhinoMaterial.ambientColor = ColorToRhinoColor (material.ambient);
                    rhinoMaterial.specularColor = ColorToRhinoColor (material.specular);
                }
                rhinoMaterial.diffuseColor = ColorToRhinoColor (material.color);
                rhinoMaterial.transparency = 1.0 - material.opacity;

                let rhinoMaterialIndex = rhinoDoc.materials ().count ();
                rhinoDoc.materials ().add (rhinoMaterial);

                let rhinoMesh = new this.rhino.Mesh.createFromThreejsJSON (threeJson);
                let rhinoAttributes = new this.rhino.ObjectAttributes ();
                rhinoAttributes.name = this.GetExportedMeshName (mesh.GetName ());
                rhinoAttributes.materialSource = this.rhino.ObjectMaterialSource.MaterialFromObject;
                rhinoAttributes.materialIndex = rhinoMaterialIndex;
                rhinoDoc.objects ().add (rhinoMesh, rhinoAttributes);
            }
        });

        let writeOptions = new this.rhino.File3dmWriteOptions ();
        writeOptions.version = 6;
        let rhinoDocBuffer = rhinoDoc.toByteArray (writeOptions);

        rhinoFile.SetBufferContent (rhinoDocBuffer);
		onFinish ();
    }
}

const PropertyType =
{
    Text : 1,
    Integer : 2,
    Number : 3,
    Boolean : 4,
    Percent : 5,
    Color : 6
};

class Property
{
    constructor (type, name, value)
    {
        this.type = type;
        this.name = name;
        this.value = value;
    }

    Clone ()
    {
        const clonable = (this.type === PropertyType.Color);
        if (clonable) {
            return new Property (this.type, this.name, this.value.Clone ());
        } else {
            return new Property (this.type, this.name, this.value);
        }
    }
}

class PropertyGroup
{
    constructor (name)
    {
        this.name = name;
        this.properties = [];
    }

    PropertyCount ()
    {
        return this.properties.length;
    }

    AddProperty (property)
    {
        this.properties.push (property);
    }

    GetProperty (index)
    {
        return this.properties[index];
    }

    Clone ()
    {
        let cloned = new PropertyGroup (this.name);
        for (let property of this.properties) {
            cloned.AddProperty (property.Clone ());
        }
        return cloned;
    }
}

function PropertyToString (property)
{
    if (property.type === PropertyType.Text) {
        return EscapeHtmlChars (property.value);
    } else if (property.type === PropertyType.Integer) {
        return property.value.toLocaleString ();
    } else if (property.type === PropertyType.Number) {
        return property.value.toLocaleString (undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else if (property.type === PropertyType.Boolean) {
        return property.value ? 'True' : 'False';
    } else if (property.type === PropertyType.Percent) {
        return parseInt (property.value * 100, 10).toString () + '%';
    } else if (property.type === PropertyType.Color) {
        return '#' + RGBColorToHexString (property.value);
    }
    return null;
}

function GenerateGuid ()
{
    // https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
    let template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return template.replace (/[xy]/g, (c) => {
        let r = Math.random () * 16 | 0;
        let v = (c === 'x') ? r : (r & 0x3 | 0x8);
        return v.toString (16);
    });
}

class ExporterBim extends ExporterBase
{
    constructor ()
    {
        super ();
    }

    CanExport (format, extension)
    {
        return format === FileFormat.Text && extension === 'bim';
    }

    ExportContent (exporterModel, format, files, onFinish)
    {
        let bimContent = {
            schema_version : '1.1.0',
            meshes : [],
            elements : [],
            info : {}
        };

        this.ExportProperties (exporterModel.GetModel (), bimContent.info);

        let meshId = 0;
        exporterModel.EnumerateTransformedMeshInstances ((mesh) => {
            let bimMesh = {
                mesh_id : meshId,
                coordinates : [],
                indices : []
            };

            mesh.EnumerateVertices ((vertex) => {
                bimMesh.coordinates.push (vertex.x, vertex.y, vertex.z);
            });
            mesh.EnumerateTriangleVertexIndices ((v0, v1, v2) => {
                bimMesh.indices.push (v0, v1, v2);
            });

            let bimElement = {
                mesh_id : meshId,
                type : 'Other',
                color : {
                    r : 200,
                    g : 200,
                    b : 200,
                    a : 255
                },
                vector : {
                    x : 0.0,
                    y : 0.0,
                    z : 0.0
                },
                rotation : {
                    qx: 0.0,
                    qy: 0.0,
                    qz: 0.0,
                    qw: 1.0
                },
                guid : GenerateGuid (),
                info : {}
            };

            let defaultColor = null;
            let hasOnlyOneColor = true;
            let faceColors = [];
            for (let i = 0; i < mesh.TriangleCount (); i++) {
                let triangle = mesh.GetTriangle (i);
                let material = exporterModel.GetMaterial (triangle.mat);
                let faceColor = {
                    r : material.color.r,
                    g : material.color.g,
                    b : material.color.b,
                    a : ColorComponentFromFloat (material.opacity),
                };
                faceColors.push (faceColor.r, faceColor.g, faceColor.b, faceColor.a);
                if (hasOnlyOneColor) {
                    if (defaultColor === null) {
                        defaultColor = faceColor;
                    } else {
                        if (defaultColor.r !== faceColor.r || defaultColor.g !== faceColor.g || defaultColor.b !== faceColor.b || defaultColor.a !== faceColor.a) {
                            hasOnlyOneColor = false;
                            defaultColor = null;
                        }
                    }
                }
            }

            if (hasOnlyOneColor) {
                bimElement.color = defaultColor;
            } else {
                bimElement.face_colors = faceColors;
            }

            bimElement.info['Name'] = mesh.GetName ();
            this.ExportProperties (mesh, bimElement.info);

            bimContent.meshes.push (bimMesh);
            bimContent.elements.push (bimElement);
            meshId += 1;
        });

        let bimFile = new ExportedFile ('model.bim');
        bimFile.SetTextContent (JSON.stringify (bimContent, null, 4));
        files.push (bimFile);
        onFinish ();
    }

    ExportProperties (element, targetObject)
    {
        for (let groupIndex = 0; groupIndex < element.PropertyGroupCount (); groupIndex++) {
            let group = element.GetPropertyGroup (groupIndex);
            for (let propertyIndex = 0; propertyIndex < group.PropertyCount (); propertyIndex++) {
                let property = group.GetProperty (propertyIndex);
                targetObject[property.name] = PropertyToString (property);
            }
        }
    }
}

class BinaryWriter
{
    constructor (byteLength, isLittleEndian)
    {
        this.arrayBuffer = new ArrayBuffer (byteLength);
        this.dataView = new DataView (this.arrayBuffer);
        this.isLittleEndian = isLittleEndian;
        this.position = 0;
    }

    GetPosition ()
    {
        return this.position;
    }

    SetPosition (position)
    {
        this.position = position;
    }

    End ()
    {
        return this.position >= this.arrayBuffer.byteLength;
    }

    GetBuffer ()
    {
        return this.arrayBuffer;
    }

    WriteArrayBuffer (arrayBuffer)
    {
        let bufferView = new Uint8Array (arrayBuffer);
        let thisBufferView = new Uint8Array (this.arrayBuffer);
        thisBufferView.set (bufferView, this.position);
        this.position += arrayBuffer.byteLength;
    }

    WriteBoolean8 (val)
    {
        this.dataView.setInt8 (this.position, val ? 1 : 0);
        this.position = this.position + 1;
    }

    WriteCharacter8 (val)
    {
        this.dataView.setInt8 (this.position, val);
        this.position = this.position + 1;
    }

    WriteUnsignedCharacter8 (val)
    {
        this.dataView.setUint8 (this.position, val);
        this.position = this.position + 1;
    }

    WriteInteger16 (val)
    {
        this.dataView.setInt16 (this.position, val, this.isLittleEndian);
        this.position = this.position + 2;
    }

    WriteUnsignedInteger16 (val)
    {
        this.dataView.setUint16 (this.position, val, this.isLittleEndian);
        this.position = this.position + 2;
    }

    WriteInteger32 (val)
    {
        this.dataView.setInt32 (this.position, val, this.isLittleEndian);
        this.position = this.position + 4;
    }

    WriteUnsignedInteger32 (val)
    {
        this.dataView.setUint32 (this.position, val, this.isLittleEndian);
        this.position = this.position + 4;
    }

    WriteFloat32 (val)
    {
        this.dataView.setFloat32 (this.position, val, this.isLittleEndian);
        this.position = this.position + 4;
    }

    WriteDouble64 (val)
    {
        this.dataView.setFloat64 (this.position, val, this.isLittleEndian);
        this.position = this.position + 8;
    }
}

class Coord4D
{
	constructor (x, y, z, w)
	{
		this.x = x;
		this.y = y;
		this.z = z;
        this.w = w;
	}

	Clone ()
	{
		return new Coord4D (this.x, this.y, this.z, this.w);
	}
}

class Quaternion
{
	constructor (x, y, z, w)
	{
		this.x = x;
		this.y = y;
		this.z = z;
        this.w = w;
	}
}

function QuaternionIsEqual (a, b)
{
	return IsEqual (a.x, b.x) && IsEqual (a.y, b.y) && IsEqual (a.z, b.z) && IsEqual (a.w, b.w);
}

function ArrayToQuaternion (arr)
{
	return new Quaternion (arr[0], arr[1], arr[2], arr[3]);
}

function QuaternionFromAxisAngle (axis, angle)
{
	const a = angle / 2.0;
	const s = Math.sin (a);

	return new Quaternion (
		axis.x * s,
		axis.y * s,
		axis.z * s,
		Math.cos (a)
	);
}

function QuaternionFromXYZ (x, y, z, mode) {

	const c1 = Math.cos (x / 2.0);
	const c2 = Math.cos (y / 2.0);
	const c3 = Math.cos (z / 2.0);

	const s1 = Math.sin (x / 2.0);
	const s2 = Math.sin (y / 2.0);
	const s3 = Math.sin (z / 2.0);

	let quaternion = new Quaternion (0.0, 0.0, 0.0, 1.0);
	if (mode === 'XYZ') {
		quaternion.x = s1 * c2 * c3 + c1 * s2 * s3;
		quaternion.y = c1 * s2 * c3 - s1 * c2 * s3;
		quaternion.z = c1 * c2 * s3 + s1 * s2 * c3;
		quaternion.w = c1 * c2 * c3 - s1 * s2 * s3;
	} else if (mode === 'YXZ') {
		quaternion.x = s1 * c2 * c3 + c1 * s2 * s3;
		quaternion.y = c1 * s2 * c3 - s1 * c2 * s3;
		quaternion.z = c1 * c2 * s3 - s1 * s2 * c3;
		quaternion.w = c1 * c2 * c3 + s1 * s2 * s3;
	} else if (mode === 'ZXY') {
		quaternion.x = s1 * c2 * c3 - c1 * s2 * s3;
		quaternion.y = c1 * s2 * c3 + s1 * c2 * s3;
		quaternion.z = c1 * c2 * s3 + s1 * s2 * c3;
		quaternion.w = c1 * c2 * c3 - s1 * s2 * s3;
	} else if (mode === 'ZYX') {
		quaternion.x = s1 * c2 * c3 - c1 * s2 * s3;
		quaternion.y = c1 * s2 * c3 + s1 * c2 * s3;
		quaternion.z = c1 * c2 * s3 - s1 * s2 * c3;
		quaternion.w = c1 * c2 * c3 + s1 * s2 * s3;
	} else if (mode === 'YZX') {
		quaternion.x = s1 * c2 * c3 + c1 * s2 * s3;
		quaternion.y = c1 * s2 * c3 + s1 * c2 * s3;
		quaternion.z = c1 * c2 * s3 - s1 * s2 * c3;
		quaternion.w = c1 * c2 * c3 - s1 * s2 * s3;
	} else if (mode === 'XZY') {
		quaternion.x = s1 * c2 * c3 - c1 * s2 * s3;
		quaternion.y = c1 * s2 * c3 - s1 * c2 * s3;
		quaternion.z = c1 * c2 * s3 + s1 * s2 * c3;
		quaternion.w = c1 * c2 * c3 + s1 * s2 * s3;
	} else {
		return null;
	}

	return quaternion;
}

class Matrix
{
    constructor (matrix)
    {
        this.matrix = null;
        if (matrix !== undefined && matrix !== null) {
            this.matrix = matrix;
        }
    }

    IsValid ()
    {
        return this.matrix !== null;
    }

    Set (matrix)
    {
        this.matrix = matrix;
        return this;
    }

    Get ()
    {
        return this.matrix;
    }

    Clone ()
    {
        let result = [
            this.matrix[0], this.matrix[1], this.matrix[2], this.matrix[3],
            this.matrix[4], this.matrix[5], this.matrix[6], this.matrix[7],
            this.matrix[8], this.matrix[9], this.matrix[10], this.matrix[11],
            this.matrix[12], this.matrix[13], this.matrix[14], this.matrix[15]
        ];
        return new Matrix (result);
    }

    CreateIdentity ()
    {
        this.matrix = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
        return this;
    }

    IsIdentity ()
    {
        let identity = new Matrix ().CreateIdentity ().Get ();
        for (let i = 0; i < 16; i++) {
            if (!IsEqual (this.matrix[i], identity[i])) {
                return false;
            }
        }
        return true;
    }

    CreateTranslation (x, y, z)
    {
        this.matrix = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            x, y, z, 1.0
        ];
        return this;
    }

    CreateRotation (x, y, z, w)
    {
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;
        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;
        this.matrix = [
            1.0 - (yy + zz), xy + wz, xz - wy, 0.0,
            xy - wz, 1.0 - (xx + zz), yz + wx, 0.0,
            xz + wy, yz - wx, 1.0 - (xx + yy), 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
        return this;
    }

    CreateRotationAxisAngle (axis, angle)
    {
        let quaternion = QuaternionFromAxisAngle (axis, angle);
        return this.CreateRotation (quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    }

    CreateScale (x, y, z)
    {
        this.matrix = [
            x, 0.0, 0.0, 0.0,
            0.0, y, 0.0, 0.0,
            0.0, 0.0, z, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
        return this;
    }

    ComposeTRS (translation, rotation, scale)
    {
        let tx = translation.x;
        let ty = translation.y;
        let tz = translation.z;
        let qx = rotation.x;
        let qy = rotation.y;
        let qz = rotation.z;
        let qw = rotation.w;
        let sx = scale.x;
        let sy = scale.y;
        let sz = scale.z;

        let x2 = qx + qx;
        let y2 = qy + qy;
        let z2 = qz + qz;
        let xx = qx * x2;
        let xy = qx * y2;
        let xz = qx * z2;
        let yy = qy * y2;
        let yz = qy * z2;
        let zz = qz * z2;
        let wx = qw * x2;
        let wy = qw * y2;
        let wz = qw * z2;

        this.matrix = [
            (1.0 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0.0,
            (xy - wz) * sy, (1.0 - (xx + zz)) * sy, (yz + wx) * sy, 0.0,
            (xz + wy) * sz, (yz - wx) * sz, (1.0 - (xx + yy)) * sz, 0.0,
            tx, ty, tz, 1.0
        ];
        return this;
    }

    DecomposeTRS ()
    {
        let translation = new Coord3D (
            this.matrix[12],
            this.matrix[13],
            this.matrix[14]
        );

        let sx = VectorLength3D (this.matrix[0], this.matrix[1], this.matrix[2]);
        let sy = VectorLength3D (this.matrix[4], this.matrix[5], this.matrix[6]);
        let sz = VectorLength3D (this.matrix[8], this.matrix[9], this.matrix[10]);
        let determinant = this.Determinant ();
        if (IsNegative (determinant)) {
            sx *= -1.0;
        }
        let scale = new Coord3D (sx, sy, sz);

        let m00 = this.matrix[0] / sx;
        let m01 = this.matrix[4] / sy;
        let m02 = this.matrix[8] / sz;
        let m10 = this.matrix[1] / sx;
        let m11 = this.matrix[5] / sy;
        let m12 = this.matrix[9] / sz;
        let m20 = this.matrix[2] / sx;
        let m21 = this.matrix[6] / sy;
        let m22 = this.matrix[10] / sz;

        // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
        let rotation = null;
        let tr = m00 + m11 + m22;
        if (tr > 0.0) {
            let s = Math.sqrt (tr + 1.0) * 2.0;
            rotation = new Quaternion (
                (m21 - m12) / s,
                (m02 - m20) / s,
                (m10 - m01) / s,
                0.25 * s
            );
        } else if ((m00 > m11) && (m00 > m22)) {
            let s = Math.sqrt (1.0 + m00 - m11 - m22) * 2.0;
            rotation = new Quaternion (
                0.25 * s,
                (m01 + m10) / s,
                (m02 + m20) / s,
                (m21 - m12) / s
            );
        } else if (m11 > m22) {
            let s = Math.sqrt (1.0 + m11 - m00 - m22) * 2.0;
            rotation = new Quaternion (
                (m01 + m10) / s,
                0.25 * s,
                (m12 + m21) / s,
                (m02 - m20) / s
            );
        } else {
            let s = Math.sqrt (1.0 + m22 - m00 - m11) * 2.0;
            rotation = new Quaternion (
                (m02 + m20) / s,
                (m12 + m21) / s,
                0.25 * s,
                (m10 - m01) / s
            );
        }

        return {
            translation : translation,
            rotation : rotation,
            scale : scale
        };
    }

    Determinant ()
    {
        let a00 = this.matrix[0];
        let a01 = this.matrix[1];
        let a02 = this.matrix[2];
        let a03 = this.matrix[3];
        let a10 = this.matrix[4];
        let a11 = this.matrix[5];
        let a12 = this.matrix[6];
        let a13 = this.matrix[7];
        let a20 = this.matrix[8];
        let a21 = this.matrix[9];
        let a22 = this.matrix[10];
        let a23 = this.matrix[11];
        let a30 = this.matrix[12];
        let a31 = this.matrix[13];
        let a32 = this.matrix[14];
        let a33 = this.matrix[15];

        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;

        let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        return determinant;
    }

    Invert ()
    {
        let a00 = this.matrix[0];
        let a01 = this.matrix[1];
        let a02 = this.matrix[2];
        let a03 = this.matrix[3];
        let a10 = this.matrix[4];
        let a11 = this.matrix[5];
        let a12 = this.matrix[6];
        let a13 = this.matrix[7];
        let a20 = this.matrix[8];
        let a21 = this.matrix[9];
        let a22 = this.matrix[10];
        let a23 = this.matrix[11];
        let a30 = this.matrix[12];
        let a31 = this.matrix[13];
        let a32 = this.matrix[14];
        let a33 = this.matrix[15];

        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;

        let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (IsEqual (determinant, 0.0)) {
            return null;
        }

        let result = [
            (a11 * b11 - a12 * b10 + a13 * b09) / determinant,
            (a02 * b10 - a01 * b11 - a03 * b09) / determinant,
            (a31 * b05 - a32 * b04 + a33 * b03) / determinant,
            (a22 * b04 - a21 * b05 - a23 * b03) / determinant,
            (a12 * b08 - a10 * b11 - a13 * b07) / determinant,
            (a00 * b11 - a02 * b08 + a03 * b07) / determinant,
            (a32 * b02 - a30 * b05 - a33 * b01) / determinant,
            (a20 * b05 - a22 * b02 + a23 * b01) / determinant,
            (a10 * b10 - a11 * b08 + a13 * b06) / determinant,
            (a01 * b08 - a00 * b10 - a03 * b06) / determinant,
            (a30 * b04 - a31 * b02 + a33 * b00) / determinant,
            (a21 * b02 - a20 * b04 - a23 * b00) / determinant,
            (a11 * b07 - a10 * b09 - a12 * b06) / determinant,
            (a00 * b09 - a01 * b07 + a02 * b06) / determinant,
            (a31 * b01 - a30 * b03 - a32 * b00) / determinant,
            (a20 * b03 - a21 * b01 + a22 * b00) / determinant
        ];

        return new Matrix (result);
    }

    Transpose ()
    {
        let result = [
            this.matrix[0], this.matrix[4], this.matrix[8], this.matrix[12],
            this.matrix[1], this.matrix[5], this.matrix[9], this.matrix[13],
            this.matrix[2], this.matrix[6], this.matrix[10], this.matrix[14],
            this.matrix[3], this.matrix[7], this.matrix[11], this.matrix[15]
        ];
        return new Matrix (result);
    }

    InvertTranspose ()
    {
        let result = this.Invert ();
        if (result === null) {
            return null;
        }
        return result.Transpose ();
    }

    MultiplyVector (vector)
    {
        let a00 = vector.x;
        let a01 = vector.y;
        let a02 = vector.z;
        let a03 = vector.w;

        let b00 = this.matrix[0];
        let b01 = this.matrix[1];
        let b02 = this.matrix[2];
        let b03 = this.matrix[3];
        let b10 = this.matrix[4];
        let b11 = this.matrix[5];
        let b12 = this.matrix[6];
        let b13 = this.matrix[7];
        let b20 = this.matrix[8];
        let b21 = this.matrix[9];
        let b22 = this.matrix[10];
        let b23 = this.matrix[11];
        let b30 = this.matrix[12];
        let b31 = this.matrix[13];
        let b32 = this.matrix[14];
        let b33 = this.matrix[15];

        let result = new Coord4D (
            a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
            a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
            a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
            a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33
        );
        return result;
    }

    MultiplyMatrix (matrix)
    {
        let a00 = this.matrix[0];
        let a01 = this.matrix[1];
        let a02 = this.matrix[2];
        let a03 = this.matrix[3];
        let a10 = this.matrix[4];
        let a11 = this.matrix[5];
        let a12 = this.matrix[6];
        let a13 = this.matrix[7];
        let a20 = this.matrix[8];
        let a21 = this.matrix[9];
        let a22 = this.matrix[10];
        let a23 = this.matrix[11];
        let a30 = this.matrix[12];
        let a31 = this.matrix[13];
        let a32 = this.matrix[14];
        let a33 = this.matrix[15];

        let b00 = matrix.matrix[0];
        let b01 = matrix.matrix[1];
        let b02 = matrix.matrix[2];
        let b03 = matrix.matrix[3];
        let b10 = matrix.matrix[4];
        let b11 = matrix.matrix[5];
        let b12 = matrix.matrix[6];
        let b13 = matrix.matrix[7];
        let b20 = matrix.matrix[8];
        let b21 = matrix.matrix[9];
        let b22 = matrix.matrix[10];
        let b23 = matrix.matrix[11];
        let b30 = matrix.matrix[12];
        let b31 = matrix.matrix[13];
        let b32 = matrix.matrix[14];
        let b33 = matrix.matrix[15];

        let result = [
            a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
            a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
            a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
            a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
            a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
            a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
            a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
            a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
            a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
            a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
            a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
            a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
            a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
            a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
            a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
            a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33
        ];

        return new Matrix (result);
    }
}

function MatrixIsEqual (a, b)
{
    const aMatrix = a.Get ();
    const bMatrix = b.Get ();
	for (let i = 0; i < 16; i++) {
        if (!IsEqual (aMatrix[i], bMatrix[i])) {
            return false;
        }
    }
    return true;
}

class Transformation
{
    constructor (matrix)
    {
        if (matrix !== undefined && matrix !== null) {
            this.matrix = matrix;
        } else {
            this.matrix = new Matrix ();
            this.matrix.CreateIdentity ();
        }
    }

    SetMatrix (matrix)
    {
        this.matrix = matrix;
        return this;
    }

    GetMatrix ()
    {
        return this.matrix;
    }

    IsIdentity ()
    {
        return this.matrix.IsIdentity ();
    }

    AppendMatrix (matrix)
    {
        this.matrix = this.matrix.MultiplyMatrix (matrix);
        return this;
    }

    Append (transformation)
    {
        this.AppendMatrix (transformation.GetMatrix ());
        return this;
    }

    TransformCoord3D (coord)
    {
        let coord4D = new Coord4D (coord.x, coord.y, coord.z, 1.0);
        let resultCoord4D = this.matrix.MultiplyVector (coord4D);
        let result = new Coord3D (resultCoord4D.x, resultCoord4D.y, resultCoord4D.z);
        return result;
    }

    Clone ()
    {
        const clonedMatrix = this.matrix.Clone ();
        return new Transformation (clonedMatrix);
    }
}

function TransformationIsEqual (a, b)
{
    return MatrixIsEqual (a.GetMatrix (), b.GetMatrix ());
}

const MeshType =
{
    Empty : 0,
    TriangleMesh : 1
};

function GetMeshType (mesh)
{
    if (mesh.TriangleCount () > 0) {
        return MeshType.TriangleMesh;
    }
    return MeshType.Empty;
}

function CalculateTriangleNormal (v0, v1, v2)
{
    let v = SubCoord3D (v1, v0);
    let w = SubCoord3D (v2, v0);
    let normal = CrossVector3D (v, w);
    normal.Normalize ();
    return normal;
}

function TransformMesh (mesh, transformation)
{
    if (transformation.IsIdentity ()) {
        return;
    }

    for (let i = 0; i < mesh.VertexCount (); i++) {
        let vertex = mesh.GetVertex (i);
        let transformed = transformation.TransformCoord3D (vertex);
        vertex.x = transformed.x;
        vertex.y = transformed.y;
        vertex.z = transformed.z;
    }

    if (mesh.NormalCount () > 0) {
        let normalMatrix = transformation.GetMatrix ().InvertTranspose ();
        if (normalMatrix !== null) {
            let normalTransformation = new Transformation (normalMatrix);
            for (let i = 0; i < mesh.NormalCount (); i++) {
                let normal = mesh.GetNormal (i);
                let transformed = normalTransformation.TransformCoord3D (normal);
                normal.x = transformed.x;
                normal.y = transformed.y;
                normal.z = transformed.z;
            }
        }
    }
}

function FlipMeshTrianglesOrientation (mesh)
{
    for (let i = 0; i < mesh.TriangleCount (); i++) {
        let triangle = mesh.GetTriangle (i);
        let tmp = triangle.v1;
        triangle.v1 = triangle.v2;
        triangle.v2 = tmp;
    }
}

class Object3D
{
    constructor ()
    {

    }

    VertexCount ()
    {
        return 0;
    }

    VertexColorCount ()
    {
        return 0;
    }

    NormalCount ()
    {
        return 0;
    }

    TextureUVCount ()
    {
        return 0;
    }

    TriangleCount ()
    {
        return 0;
    }

    EnumerateVertices (onVertex)
    {

    }

    EnumerateTriangleVertexIndices (onTriangleVertexIndices)
    {

    }

    EnumerateTriangleVertices (onTriangleVertices)
    {

    }
}

class ModelObject3D extends Object3D
{
    constructor ()
    {
        super ();
        this.name = '';
        this.propertyGroups = [];
    }

    GetName ()
    {
        return this.name;
    }

    SetName (name)
    {
        this.name = name;
    }

    PropertyGroupCount ()
    {
        return this.propertyGroups.length;
    }

    AddPropertyGroup (propertyGroup)
    {
        this.propertyGroups.push (propertyGroup);
        return this.propertyGroups.length - 1;
    }

    GetPropertyGroup (index)
    {
        return this.propertyGroups[index];
    }

    CloneProperties (target)
    {
        for (let propertyGroup of this.propertyGroups) {
            target.AddPropertyGroup (propertyGroup.Clone ());
        }
    }
}

class MeshInstanceId
{
    constructor (nodeId, meshIndex)
    {
        this.nodeId = nodeId;
        this.meshIndex = meshIndex;
    }

    IsEqual (rhs)
    {
        return this.nodeId === rhs.nodeId && this.meshIndex === rhs.meshIndex;
    }

    GetKey ()
    {
        return this.nodeId.toString () + ':' + this.meshIndex.toString ();
    }
}

class MeshInstance extends ModelObject3D
{
    constructor (id, node, mesh)
    {
        super ();
        this.id = id;
        this.node = node;
        this.mesh = mesh;
    }

    GetId ()
    {
        return this.id;
    }

    GetTransformation ()
    {
        return this.node.GetWorldTransformation ();
    }

    GetMesh ()
    {
        return this.mesh;
    }

    VertexCount ()
    {
        return this.mesh.VertexCount ();
    }

    VertexColorCount ()
    {
        return this.mesh.VertexColorCount ();
    }

    NormalCount ()
    {
        return this.mesh.NormalCount ();
    }

    TextureUVCount ()
    {
        return this.mesh.TextureUVCount ();
    }

    TriangleCount ()
    {
        return this.mesh.TriangleCount ();
    }

    EnumerateVertices (onVertex)
    {
        let transformation = this.node.GetWorldTransformation ();
        if (transformation.IsIdentity ()) {
            this.mesh.EnumerateVertices (onVertex);
        } else {
            this.mesh.EnumerateVertices ((vertex) => {
                const transformed = transformation.TransformCoord3D (vertex);
                onVertex (transformed);
            });
        }
    }

    EnumerateTriangleVertexIndices (onTriangleVertexIndices)
    {
        this.mesh.EnumerateTriangleVertexIndices (onTriangleVertexIndices);
    }

    EnumerateTriangleVertices (onTriangleVertices)
    {
        let transformation = this.node.GetWorldTransformation ();
        if (transformation.IsIdentity ()) {
            this.mesh.EnumerateTriangleVertices (onTriangleVertices);
        } else {
            this.mesh.EnumerateTriangleVertices ((v0, v1, v2) => {
                const v0Transformed = transformation.TransformCoord3D (v0);
                const v1Transformed = transformation.TransformCoord3D (v1);
                const v2Transformed = transformation.TransformCoord3D (v2);
                onTriangleVertices (v0Transformed, v1Transformed, v2Transformed);
            });
        }
    }

    PropertyGroupCount ()
    {
        return this.mesh.PropertyGroupCount ();
    }

    AddPropertyGroup (propertyGroup)
    {
        return this.mesh.AddPropertyGroup (propertyGroup);
    }

    GetPropertyGroup (index)
    {
        return this.mesh.GetPropertyGroup (index);
    }

    GetTransformedMesh ()
    {
        let transformation = this.node.GetWorldTransformation ();
        let transformed = this.mesh.Clone ();
        TransformMesh (transformed, transformation);
        return transformed;
    }
}

const GltfComponentType$1 =
{
    UNSIGNED_INT : 5125,
    FLOAT : 5126
};

const GltfBufferType =
{
    ARRAY_BUFFER : 34962,
    ELEMENT_ARRAY_BUFFER : 34963
};

class ExporterGltf extends ExporterBase
{
	constructor ()
	{
		super ();
        this.components = {
            index : {
                type : GltfComponentType$1.UNSIGNED_INT,
                size : 4
            },
            number : {
                type : GltfComponentType$1.FLOAT,
                size : 4
            }
        };
	}

    CanExport (format, extension)
    {
        return (format === FileFormat.Text && extension === 'gltf') || (format === FileFormat.Binary && extension === 'glb');
    }

	ExportContent (exporterModel, format, files, onFinish)
	{
        if (format === FileFormat.Text) {
            this.ExportAsciiContent (exporterModel, files);
        } else if (format === FileFormat.Binary) {
            this.ExportBinaryContent (exporterModel, files);
        }
        onFinish ();
	}

	ExportAsciiContent (exporterModel, files)
	{
        let gltfFile = new ExportedFile ('model.gltf');
        let binFile = new ExportedFile ('model.bin');
        files.push (gltfFile);
        files.push (binFile);

        let meshDataArr = this.GetMeshData (exporterModel);
        let mainBuffer = this.GetMainBuffer (meshDataArr);
        let mainJson = this.GetMainJson (exporterModel, meshDataArr);
        mainJson.buffers.push ({
            uri : binFile.GetName (),
            byteLength : mainBuffer.byteLength
        });

        let fileNameToIndex = new Map ();
        this.ExportMaterials (exporterModel, mainJson, (texture) => {
            let fileName = GetFileName (texture.name);
            if (fileNameToIndex.has (fileName)) {
                return fileNameToIndex.get (fileName);
            } else {
                let textureFile = new ExportedFile (fileName);
                textureFile.SetBufferContent (texture.buffer);
                files.push (textureFile);

                let textureIndex = mainJson.textures.length;
                fileNameToIndex.set (fileName, textureIndex);

                mainJson.images.push ({
                    uri : fileName
                });

                mainJson.textures.push ({
                    source : textureIndex
                });

                return textureIndex;
            }
        });

        gltfFile.SetTextContent (JSON.stringify (mainJson, null, 4));
        binFile.SetBufferContent (mainBuffer);
    }

    ExportBinaryContent (exporterModel, files)
    {
        function AlignToBoundary (size)
        {
            let remainder = size % 4;
            if (remainder === 0) {
                return size;
            }
            return size + (4 - remainder);
        }

        function WriteCharacters (writer, char, count)
        {
            for (let i = 0; i < count; i++) {
                writer.WriteUnsignedCharacter8 (char);
            }
        }

        let glbFile = new ExportedFile ('model.glb');
        files.push (glbFile);

        let meshDataArr = this.GetMeshData (exporterModel);
        let mainBuffer = this.GetMainBuffer (meshDataArr);
        let mainJson = this.GetMainJson (exporterModel, meshDataArr);

        let textureBuffers = [];
        let textureOffset = mainBuffer.byteLength;

        let fileNameToIndex = new Map ();
        this.ExportMaterials (exporterModel, mainJson, (texture) => {
            let fileName = GetFileName (texture.name);
            let extension = GetFileExtension (texture.name);
            if (fileNameToIndex.has (fileName)) {
                return fileNameToIndex.get (fileName);
            } else {
                let bufferViewIndex = mainJson.bufferViews.length;
                let textureIndex = mainJson.textures.length;
                fileNameToIndex.set (fileName, textureIndex);
                let textureBuffer = texture.buffer;
                textureBuffers.push (textureBuffer);
                mainJson.bufferViews.push ({
                    buffer : 0,
                    byteOffset : textureOffset,
                    byteLength : textureBuffer.byteLength
                });
                textureOffset += textureBuffer.byteLength;
                mainJson.images.push ({
                    bufferView : bufferViewIndex,
                    mimeType : 'image/' + extension
                });
                mainJson.textures.push ({
                    source : textureIndex
                });

                return textureIndex;
            }
        });

        let mainBinaryBufferLength = mainBuffer.byteLength;
        for (let i = 0; i < textureBuffers.length; i++) {
            let textureBuffer = textureBuffers[i];
            mainBinaryBufferLength += textureBuffer.byteLength;
        }
        let mainBinaryBufferAlignedLength = AlignToBoundary (mainBinaryBufferLength);
        mainJson.buffers.push ({
            byteLength : mainBinaryBufferAlignedLength
        });

        let mainJsonString = JSON.stringify (mainJson);
        let mainJsonBuffer = Utf8StringToArrayBuffer (mainJsonString);
        let mainJsonBufferLength = mainJsonBuffer.byteLength;
        let mainJsonBufferAlignedLength = AlignToBoundary (mainJsonBufferLength);

        let glbSize = 12 + 8 + mainJsonBufferAlignedLength + 8 + mainBinaryBufferAlignedLength;
        let glbWriter = new BinaryWriter (glbSize, true);

        glbWriter.WriteUnsignedInteger32 (0x46546C67);
        glbWriter.WriteUnsignedInteger32 (2);
        glbWriter.WriteUnsignedInteger32 (glbSize);

        glbWriter.WriteUnsignedInteger32 (mainJsonBufferAlignedLength);
        glbWriter.WriteUnsignedInteger32 (0x4E4F534A);
        glbWriter.WriteArrayBuffer (mainJsonBuffer);
        WriteCharacters (glbWriter, 32, mainJsonBufferAlignedLength - mainJsonBufferLength);

        glbWriter.WriteUnsignedInteger32 (mainBinaryBufferAlignedLength);
        glbWriter.WriteUnsignedInteger32 (0x004E4942);
        glbWriter.WriteArrayBuffer (mainBuffer);

        for (let i = 0; i < textureBuffers.length; i++) {
            let textureBuffer = textureBuffers[i];
            glbWriter.WriteArrayBuffer (textureBuffer);
        }
        WriteCharacters (glbWriter, 0, mainBinaryBufferAlignedLength - mainBinaryBufferLength);

        glbFile.SetBufferContent (glbWriter.GetBuffer ());
    }

    GetMeshData (exporterModel)
    {
        let meshDataArr = [];

        exporterModel.EnumerateMeshes ((mesh) => {
            let buffer = ConvertMeshToMeshBuffer (mesh);
            meshDataArr.push ({
                name : mesh.GetName (),
                buffer : buffer,
                offsets : [],
                sizes : []
            });
        });

        return meshDataArr;
    }

    GetMainBuffer (meshDataArr)
    {
        let mainBufferSize = 0;
        for (let meshData of meshDataArr) {
            mainBufferSize += meshData.buffer.GetByteLength (this.components.index.size, this.components.number.size);
        }

        let writer = new BinaryWriter (mainBufferSize, true);
        for (let meshData of meshDataArr) {
            for (let primitiveIndex = 0; primitiveIndex < meshData.buffer.PrimitiveCount (); primitiveIndex++) {
                let primitive = meshData.buffer.GetPrimitive (primitiveIndex);
                let offset = writer.GetPosition ();
                for (let i = 0; i < primitive.indices.length; i++) {
                    writer.WriteUnsignedInteger32 (primitive.indices[i]);
                }
                for (let i = 0; i < primitive.vertices.length; i++) {
                    writer.WriteFloat32 (primitive.vertices[i]);
                }
                for (let i = 0; i < primitive.colors.length; i++) {
                    writer.WriteFloat32 (SRGBToLinear (primitive.colors[i]));
                }
                for (let i = 0; i < primitive.normals.length; i++) {
                    writer.WriteFloat32 (primitive.normals[i]);
                }
                for (let i = 0; i < primitive.uvs.length; i++) {
                    let texCoord = primitive.uvs[i];
                    if (i % 2 === 1) {
                        texCoord *= -1.0;
                    }
                    writer.WriteFloat32 (texCoord);
                }
                meshData.offsets.push (offset);
                meshData.sizes.push (writer.GetPosition () - offset);
            }
        }

        return writer.GetBuffer ();
    }

    GetMainJson (exporterModel, meshDataArr)
    {
        class BufferViewCreator
        {
            constructor (mainJson, byteOffset)
            {
                this.mainJson = mainJson;
                this.byteOffset = byteOffset;
            }

            AddBufferView (byteLength, target)
            {
                let bufferView = {
                    buffer : 0,
                    byteOffset : this.byteOffset,
                    byteLength : byteLength,
                    target : target
                };
                this.mainJson.bufferViews.push (bufferView);
                this.byteOffset += byteLength;
                return this.mainJson.bufferViews.length - 1;
            }
        }

        function NodeHasVisibleChildren (model, node)
        {
            for (let meshIndex of node.GetMeshIndices ()) {
                let meshInstanceId = new MeshInstanceId (node.GetId (), meshIndex);
                if (model.IsMeshInstanceVisible (meshInstanceId)) {
                    return true;
                }
            }
            for (let childNode of node.GetChildNodes ()) {
                if (NodeHasVisibleChildren (model, childNode)) {
                    return true;
                }
            }
            return false;
        }

        function AddNode (model, jsonParent, jsonNodes, node)
        {
            if (node.IsMeshNode ()) {
                for (let meshIndex of node.GetMeshIndices ()) {
                    AddMeshNode (model, jsonParent, jsonNodes, node, meshIndex, true);
                }
            } else if (NodeHasVisibleChildren (model, node)) {
                let nodeJson = {};

                let nodeName = node.GetName ();
                if (nodeName.length > 0) {
                    nodeJson.name = nodeName;
                }

                let transformation = node.GetTransformation ();
                if (!transformation.IsIdentity ()) {
                    nodeJson.matrix = node.GetTransformation ().GetMatrix ().Get ();
                }

                jsonNodes.push (nodeJson);
                jsonParent.push (jsonNodes.length - 1);

                nodeJson.children = [];
                AddChildNodes (model, nodeJson.children, jsonNodes, node);
            }
        }

        function AddMeshNode (model, jsonParent, jsonNodes, node, meshIndex, isStandaloneNode)
        {
            let meshInstanceId = new MeshInstanceId (node.GetId (), meshIndex);
            if (!model.IsMeshInstanceVisible (meshInstanceId)) {
                return;
            }

            let nodeJson = {
                mesh : model.MapMeshIndex (meshIndex)
            };
            if (isStandaloneNode) {
                let transformation = node.GetTransformation ();
                if (!transformation.IsIdentity ()) {
                    nodeJson.matrix = node.GetTransformation ().GetMatrix ().Get ();
                }
            }

            jsonNodes.push (nodeJson);
            jsonParent.push (jsonNodes.length - 1);
        }

        function AddChildNodes (model, jsonParent, jsonNodes, node)
        {
            for (let childNode of node.GetChildNodes ()) {
                AddNode (model, jsonParent, jsonNodes, childNode);
            }
            for (let meshIndex of node.GetMeshIndices ()) {
                AddMeshNode (model, jsonParent, jsonNodes, node, meshIndex, false);
            }
        }

        let mainJson = {
            asset : {
                generator : 'https://3dviewer.net',
                version : '2.0'
            },
            scene : 0,
            scenes : [
                {
                    nodes : []
                }
            ],
            nodes : [],
            materials : [],
            meshes : [],
            buffers : [],
            bufferViews : [],
            accessors : []
        };

        let rootNode = exporterModel.GetModel ().GetRootNode ();
        AddChildNodes (exporterModel, mainJson.scenes[0].nodes, mainJson.nodes, rootNode);

        for (let meshData of meshDataArr) {
            let jsonMesh = {
                name : this.GetExportedMeshName (meshData.name),
                primitives : []
            };

            let primitives = meshData.buffer.primitives;
            for (let primitiveIndex = 0; primitiveIndex < primitives.length; primitiveIndex++) {
                let primitive = primitives[primitiveIndex];

                let bufferViewCreator = new BufferViewCreator (mainJson, meshData.offsets[primitiveIndex]);
                let indicesBufferView = bufferViewCreator.AddBufferView (primitive.indices.length * this.components.index.size, GltfBufferType.ELEMENT_ARRAY_BUFFER);
                let verticesBufferView = bufferViewCreator.AddBufferView (primitive.vertices.length * this.components.number.size, GltfBufferType.ARRAY_BUFFER);
                let colorsBufferView = null;
                if (primitive.colors.length > 0) {
                    colorsBufferView = bufferViewCreator.AddBufferView (primitive.colors.length * this.components.number.size, GltfBufferType.ARRAY_BUFFER);
                }
                let normalsBufferView = bufferViewCreator.AddBufferView (primitive.normals.length * this.components.number.size, GltfBufferType.ARRAY_BUFFER);
                let uvsBufferView = null;
                if (primitive.uvs.length > 0) {
                    uvsBufferView = bufferViewCreator.AddBufferView (primitive.uvs.length * this.components.number.size, GltfBufferType.ARRAY_BUFFER);
                }

                let jsonPrimitive = {
                    attributes : {},
                    mode : 4,
                    material : primitive.material
                };

                let bounds = primitive.GetBounds ();

                mainJson.accessors.push ({
                    bufferView : indicesBufferView,
                    byteOffset : 0,
                    componentType : this.components.index.type,
                    count : primitive.indices.length,
                    type : 'SCALAR'
                });
                jsonPrimitive.indices = mainJson.accessors.length - 1;

                mainJson.accessors.push ({
                    bufferView : verticesBufferView,
                    byteOffset : 0,
                    componentType : this.components.number.type,
                    count : primitive.vertices.length / 3,
                    min : bounds.min,
                    max : bounds.max,
                    type : 'VEC3'
                });
                jsonPrimitive.attributes.POSITION = mainJson.accessors.length - 1;

                if (colorsBufferView !== null) {
                    mainJson.accessors.push ({
                        bufferView : colorsBufferView,
                        byteOffset : 0,
                        componentType : this.components.number.type,
                        count : primitive.colors.length / 3,
                        type : 'VEC3'
                    });
                    jsonPrimitive.attributes.COLOR_0 = mainJson.accessors.length - 1;
                }

                mainJson.accessors.push ({
                    bufferView : normalsBufferView,
                    byteOffset : 0,
                    componentType : this.components.number.type,
                    count : primitive.normals.length / 3,
                    type : 'VEC3'
                });
                jsonPrimitive.attributes.NORMAL = mainJson.accessors.length - 1;

                if (uvsBufferView !== null) {
                    mainJson.accessors.push ({
                        bufferView : uvsBufferView,
                        byteOffset : 0,
                        componentType : this.components.number.type,
                        count : primitive.uvs.length / 2,
                        type : 'VEC2'
                    });
                    jsonPrimitive.attributes.TEXCOORD_0 = mainJson.accessors.length - 1;
                }

                jsonMesh.primitives.push (jsonPrimitive);
            }

            mainJson.meshes.push (jsonMesh);
        }

        return mainJson;
    }

    ExportMaterials (exporterModel, mainJson, addTexture)
    {
        function ExportMaterial (obj, mainJson, material, addTexture)
        {
            function ColorToRGBA (color, opacity)
            {
                return [
                    SRGBToLinear (color.r / 255.0),
                    SRGBToLinear (color.g / 255.0),
                    SRGBToLinear (color.b / 255.0),
                    opacity
                ];
            }

            function ColorToRGB (color)
            {
                return [
                    SRGBToLinear (color.r / 255.0),
                    SRGBToLinear (color.g / 255.0),
                    SRGBToLinear (color.b / 255.0)
                ];
            }

            function GetTextureParams (mainJson, texture, addTexture)
            {
                if (texture === null || !texture.IsValid ()) {
                    return null;
                }

                if (mainJson.images === undefined) {
                    mainJson.images = [];
                }
                if (mainJson.textures === undefined) {
                    mainJson.textures = [];
                }

                let textureIndex = addTexture (texture);
                let textureParams = {
                    index : textureIndex
                };

                if (texture.HasTransformation ()) {
                    let extensionName = 'KHR_texture_transform';
                    if (mainJson.extensionsUsed === undefined) {
                        mainJson.extensionsUsed = [];
                    }
                    if (mainJson.extensionsUsed.indexOf (extensionName) === -1) {
                        mainJson.extensionsUsed.push (extensionName);
                    }
                    textureParams.extensions = {
                        KHR_texture_transform : {
                            offset : [texture.offset.x, -texture.offset.y],
                            scale : [texture.scale.x, texture.scale.y],
                            rotation : -texture.rotation
                        }
                    };
                }

                return textureParams;
            }

            let jsonMaterial = {
                name : obj.GetExportedMaterialName (material.name),
                pbrMetallicRoughness : {
                    baseColorFactor : ColorToRGBA (material.color, material.opacity)
                },
                emissiveFactor : ColorToRGB (material.emissive),
                doubleSided : true,
                alphaMode : 'OPAQUE'
            };

            if (material.transparent) {
                // TODO: mask, alphaCutoff?
                jsonMaterial.alphaMode = 'BLEND';
            }

            let baseColorTexture = GetTextureParams (mainJson, material.diffuseMap, addTexture);
            if (baseColorTexture !== null) {
                if (!material.multiplyDiffuseMap) {
                    jsonMaterial.pbrMetallicRoughness.baseColorFactor = ColorToRGBA (new RGBColor (255, 255, 255), material.opacity);
                }
                jsonMaterial.pbrMetallicRoughness.baseColorTexture = baseColorTexture;
            }
            if (material.type === MaterialType.Physical) {
                let metallicTexture = GetTextureParams (mainJson, material.metalnessMap, addTexture);
                if (metallicTexture !== null) {
                    jsonMaterial.pbrMetallicRoughness.metallicRoughnessTexture = metallicTexture;
                } else {
                    jsonMaterial.pbrMetallicRoughness.metallicFactor = material.metalness;
                    jsonMaterial.pbrMetallicRoughness.roughnessFactor = material.roughness;
                }
            }
            let normalTexture = GetTextureParams (mainJson, material.normalMap, addTexture);
            if (normalTexture !== null) {
                jsonMaterial.normalTexture = normalTexture;
            }
            let emissiveTexture = GetTextureParams (mainJson, material.emissiveMap, addTexture);
            if (emissiveTexture !== null) {
                jsonMaterial.emissiveTexture = emissiveTexture;
            }

            mainJson.materials.push (jsonMaterial);
        }

        for (let materialIndex = 0; materialIndex < exporterModel.MaterialCount (); materialIndex++) {
            let material = exporterModel.GetMaterial (materialIndex);
            ExportMaterial (this, mainJson, material, addTexture);
        }
    }
}

class ExporterSettings
{
    constructor (settings)
    {
        this.transformation = new Transformation ();
        this.isMeshVisible = (meshInstanceId) => {
            return true;
        };

        CopyObjectAttributes (settings, this);
    }
}

class ExporterModel
{
    constructor (model, settings)
    {
        this.model = model;
        this.settings = settings || new ExporterSettings ();
        this.visibleMeshes = null;
        this.meshToVisibleMeshIndex = null;
    }

    GetModel ()
    {
        return this.model;
    }

    MaterialCount ()
    {
        return this.model.MaterialCount ();
    }

    GetMaterial (index)
    {
        return this.model.GetMaterial (index);
    }

    VertexCount ()
    {
        let vertexCount = 0;
        this.EnumerateMeshInstances ((meshInstance) => {
            vertexCount += meshInstance.VertexCount ();
        });
        return vertexCount;
    }

    TriangleCount ()
    {
        let triangleCount = 0;
        this.EnumerateMeshInstances ((meshInstance) => {
            triangleCount += meshInstance.TriangleCount ();
        });
        return triangleCount;
    }

    MeshCount ()
    {
        let meshCount = 0;
        this.EnumerateMeshes ((mesh) => {
            meshCount += 1;
        });
        return meshCount;
    }

    EnumerateMeshes (onMesh)
    {
        this.FillVisibleMeshCache ();
        for (let meshIndex = 0; meshIndex < this.model.MeshCount (); meshIndex++) {
            if (this.visibleMeshes.has (meshIndex)) {
                let mesh = this.model.GetMesh (meshIndex);
                onMesh (mesh);
            }
        }
    }

    MapMeshIndex (meshIndex)
    {
        this.FillVisibleMeshCache ();
        return this.meshToVisibleMeshIndex.get (meshIndex);
    }

    IsMeshInstanceVisible (meshInstanceId)
    {
        return this.settings.isMeshVisible (meshInstanceId);
    }

    MeshInstanceCount ()
    {
        let meshInstanceCount = 0;
        this.EnumerateMeshInstances ((meshInstance) => {
            meshInstanceCount += 1;
        });
        return meshInstanceCount;
    }

    EnumerateMeshInstances (onMeshInstance)
    {
        this.model.EnumerateMeshInstances ((meshInstance) => {
            if (this.settings.isMeshVisible (meshInstance.GetId ())) {
                onMeshInstance (meshInstance);
            }
        });
    }

    EnumerateTransformedMeshInstances (onMesh)
    {
        this.EnumerateMeshInstances ((meshInstance) => {
            let transformation = meshInstance.GetTransformation ();
            if (!this.settings.transformation.IsIdentity ()) {
                transformation.Append (this.settings.transformation);
            }

            let mesh = meshInstance.GetMesh ();
            let transformed = mesh.Clone ();
            if (!transformation.IsIdentity ()) {
                TransformMesh (transformed, transformation);
            }

            onMesh (transformed);
        });
    }

    EnumerateVerticesAndTriangles (callbacks)
    {
        let transformedMeshes = [];
        this.EnumerateTransformedMeshInstances ((mesh) => {
            transformedMeshes.push (mesh);
        });

        for (let mesh of transformedMeshes) {
            mesh.EnumerateVertices ((vertex) => {
                callbacks.onVertex (vertex.x, vertex.y, vertex.z);
            });
        }

        let vertexOffset = 0;
        for (let mesh of transformedMeshes) {
            mesh.EnumerateTriangleVertexIndices ((v0, v1, v2) => {
                callbacks.onTriangle (v0 + vertexOffset, v1 + vertexOffset, v2 + vertexOffset);
            });
            vertexOffset += mesh.VertexCount ();
        }
    }

    EnumerateTrianglesWithNormals (onTriangle)
    {
        this.EnumerateTransformedMeshInstances ((mesh) => {
            mesh.EnumerateTriangleVertices ((v0, v1, v2) => {
                let normal = CalculateTriangleNormal (v0, v1, v2);
                onTriangle (v0, v1, v2, normal);
            });
        });
    }

    FillVisibleMeshCache ()
    {
        if (this.visibleMeshes !== null && this.meshToVisibleMeshIndex !== null) {
            return;
        }

        this.visibleMeshes = new Set ();
        this.model.EnumerateMeshInstances ((meshInstance) => {
            let meshInstanceId = meshInstance.GetId ();
            if (this.settings.isMeshVisible (meshInstanceId)) {
                this.visibleMeshes.add (meshInstanceId.meshIndex);
            }
        });

        this.meshToVisibleMeshIndex = new Map ();
        let visibleMeshIndex = 0;
        for (let meshIndex = 0; meshIndex < this.model.MeshCount (); meshIndex++) {
            if (this.visibleMeshes.has (meshIndex)) {
                this.meshToVisibleMeshIndex.set (meshIndex, visibleMeshIndex);
                visibleMeshIndex += 1;
            }
        }
    }
}

class TextWriter
{
	constructor ()
	{
		this.text = '';
		this.indentation = 0;
	}

	GetText ()
	{
		return this.text;
	}

	Indent (diff)
	{
		this.indentation += diff;
	}

	WriteArrayLine (arr)
	{
		this.WriteLine (arr.join (' '));
	}

	WriteLine (str)
	{
		this.WriteIndentation ();
		this.Write (str + '\n');
	}

	WriteIndentation ()
	{
		for (let i = 0; i < this.indentation; i++) {
			this.Write ('  ');
		}
	}

	Write (str)
	{
		this.text += str;
	}
}

class ExporterObj extends ExporterBase
{
    constructor ()
    {
        super ();
    }

    CanExport (format, extension)
    {
        return format === FileFormat.Text && extension === 'obj';
    }

    ExportContent (exporterModel, format, files, onFinish)
    {
        function WriteTexture (mtlWriter, keyword, texture, files)
        {
            if (texture === null || !texture.IsValid ()) {
                return;
            }
            let fileName = GetFileName (texture.name);
            mtlWriter.WriteArrayLine ([keyword, fileName]);

            let fileIndex = files.findIndex ((file) => {
                return file.GetName () === fileName;
            });
            if (fileIndex === -1) {
                let textureFile = new ExportedFile (fileName);
                textureFile.SetBufferContent (texture.buffer);
                files.push (textureFile);
            }
        }

        let mtlFile = new ExportedFile ('model.mtl');
        let objFile = new ExportedFile ('model.obj');

        files.push (mtlFile);
        files.push (objFile);

        let mtlWriter = new TextWriter ();
        mtlWriter.WriteLine (this.GetHeaderText ());
        for (let materialIndex = 0; materialIndex < exporterModel.MaterialCount (); materialIndex++) {
            let material = exporterModel.GetMaterial (materialIndex);
            mtlWriter.WriteArrayLine (['newmtl', this.GetExportedMaterialName (material.name)]);
            mtlWriter.WriteArrayLine (['Kd', material.color.r / 255.0, material.color.g / 255.0, material.color.b / 255.0]);
            mtlWriter.WriteArrayLine (['d', material.opacity]);
            if (material.type === MaterialType.Phong) {
                mtlWriter.WriteArrayLine (['Ka', material.ambient.r / 255.0, material.ambient.g / 255.0, material.ambient.b / 255.0]);
                mtlWriter.WriteArrayLine (['Ks', material.specular.r / 255.0, material.specular.g / 255.0, material.specular.b / 255.0]);
                mtlWriter.WriteArrayLine (['Ns', material.shininess * 1000.0]);
            }
            WriteTexture (mtlWriter, 'map_Kd', material.diffuseMap, files);
            if (material.type === MaterialType.Phong) {
                WriteTexture (mtlWriter, 'map_Ks', material.specularMap, files);
            }
            WriteTexture (mtlWriter, 'bump', material.bumpMap, files);
        }
        mtlFile.SetTextContent (mtlWriter.GetText ());

        let objWriter = new TextWriter ();
        objWriter.WriteLine (this.GetHeaderText ());
        objWriter.WriteArrayLine (['mtllib', mtlFile.GetName ()]);
        let vertexOffset = 0;
        let normalOffset = 0;
        let uvOffset = 0;
        let usedMaterialName = null;
        exporterModel.EnumerateTransformedMeshInstances ((mesh) => {
            objWriter.WriteArrayLine (['g', this.GetExportedMeshName (mesh.GetName ())]);
            for (let vertexIndex = 0; vertexIndex < mesh.VertexCount (); vertexIndex++) {
                let vertex = mesh.GetVertex (vertexIndex);
                objWriter.WriteArrayLine (['v', vertex.x, vertex.y, vertex.z]);
            }
            for (let normalIndex = 0; normalIndex < mesh.NormalCount (); normalIndex++) {
                let normal = mesh.GetNormal (normalIndex);
                objWriter.WriteArrayLine (['vn', normal.x, normal.y, normal.z]);
            }
            for (let textureUVIndex = 0; textureUVIndex < mesh.TextureUVCount (); textureUVIndex++) {
                let uv = mesh.GetTextureUV (textureUVIndex);
                objWriter.WriteArrayLine (['vt', uv.x, uv.y]);
            }
            for (let triangleIndex = 0; triangleIndex < mesh.TriangleCount (); triangleIndex++) {
                let triangle = mesh.GetTriangle (triangleIndex);
                let v0 = triangle.v0 + vertexOffset + 1;
                let v1 = triangle.v1 + vertexOffset + 1;
                let v2 = triangle.v2 + vertexOffset + 1;
                let n0 = triangle.n0 + normalOffset + 1;
                let n1 = triangle.n1 + normalOffset + 1;
                let n2 = triangle.n2 + normalOffset + 1;
                if (triangle.mat !== null) {
                    let material = exporterModel.GetMaterial (triangle.mat);
                    let materialName = this.GetExportedMaterialName (material.name);
                    if (materialName !== usedMaterialName) {
                        objWriter.WriteArrayLine (['usemtl', materialName]);
                        usedMaterialName = materialName;
                    }
                }
                let u0 = '';
                let u1 = '';
                let u2 = '';
                if (triangle.HasTextureUVs ()) {
                    u0 = triangle.u0 + uvOffset + 1;
                    u1 = triangle.u1 + uvOffset + 1;
                    u2 = triangle.u2 + uvOffset + 1;
                }
                objWriter.WriteArrayLine (['f', [v0, u0, n0].join ('/'), [v1, u1, n1].join ('/'), [v2, u2, n2].join ('/')]);
            }
            vertexOffset += mesh.VertexCount ();
            normalOffset += mesh.NormalCount ();
            uvOffset += mesh.TextureUVCount ();
        });

        objFile.SetTextContent (objWriter.GetText ());
        onFinish ();
    }

    GetHeaderText ()
    {
        return '# exported by https://3dviewer.net';
    }
}

class ExporterOff extends ExporterBase
{
	constructor ()
	{
		super ();
	}

    CanExport (format, extension)
    {
        return format === FileFormat.Text && extension === 'off';
    }

	ExportContent (exporterModel, format, files, onFinish)
	{
		let offFile = new ExportedFile ('model.off');
		files.push (offFile);

		let offWriter = new TextWriter ();
		offWriter.WriteLine ('OFF');
		offWriter.WriteArrayLine ([exporterModel.VertexCount (), exporterModel.TriangleCount (), 0]);

		exporterModel.EnumerateVerticesAndTriangles ({
			onVertex : function (x, y, z) {
				offWriter.WriteArrayLine ([x, y, z]);
			},
			onTriangle : function (v0, v1, v2) {
				offWriter.WriteArrayLine ([3, v0, v1, v2]);
			}
		});

		offFile.SetTextContent (offWriter.GetText ());
		onFinish ();
	}
}

class ExporterPly extends ExporterBase
{
	constructor ()
	{
		super ();
	}

    CanExport (format, extension)
    {
        return (format === FileFormat.Text || format === FileFormat.Binary) && extension === 'ply';
    }

	ExportContent (exporterModel, format, files, onFinish)
	{
		if (format === FileFormat.Text) {
			this.ExportText (exporterModel, files);
		} else {
			this.ExportBinary (exporterModel, files);
		}
		onFinish ();
	}

	ExportText (exporterModel, files)
	{
		let plyFile = new ExportedFile ('model.ply');
		files.push (plyFile);

		let plyWriter = new TextWriter ();

		let vertexCount = exporterModel.VertexCount ();
		let triangleCount = exporterModel.TriangleCount ();
		let headerText = this.GetHeaderText ('ascii', vertexCount, triangleCount);
		plyWriter.Write (headerText);

		exporterModel.EnumerateVerticesAndTriangles ({
			onVertex : function (x, y, z) {
				plyWriter.WriteArrayLine ([x, y, z]);
			},
			onTriangle : function (v0, v1, v2) {
				plyWriter.WriteArrayLine ([3, v0, v1, v2]);
			}
		});

		plyFile.SetTextContent (plyWriter.GetText ());
	}

	ExportBinary (exporterModel, files)
	{
		let plyFile = new ExportedFile ('model.ply');
		files.push (plyFile);

		let vertexCount = exporterModel.VertexCount ();
		let triangleCount = exporterModel.TriangleCount ();
		let headerText = this.GetHeaderText ('binary_little_endian', vertexCount, triangleCount);

		let fullByteLength = headerText.length + vertexCount * 3 * 4 + triangleCount * (1 + 3 * 4);
		let plyWriter = new BinaryWriter (fullByteLength, true);

		for (let i = 0; i < headerText.length; i++) {
			plyWriter.WriteUnsignedCharacter8 (headerText.charCodeAt (i));
		}

		exporterModel.EnumerateVerticesAndTriangles ({
			onVertex : function (x, y, z) {
				plyWriter.WriteFloat32 (x);
				plyWriter.WriteFloat32 (y);
				plyWriter.WriteFloat32 (z);
			},
			onTriangle : function (v0, v1, v2) {
				plyWriter.WriteUnsignedCharacter8 (3);
				plyWriter.WriteInteger32 (v0);
				plyWriter.WriteInteger32 (v1);
				plyWriter.WriteInteger32 (v2);
			}
		});

		plyFile.SetBufferContent (plyWriter.GetBuffer ());
	}

	GetHeaderText (format, vertexCount, triangleCount)
	{
		let headerWriter = new TextWriter ();
		headerWriter.WriteLine ('ply');
		headerWriter.WriteLine ('format ' + format + ' 1.0');
		headerWriter.WriteLine ('element vertex ' + vertexCount);
		headerWriter.WriteLine ('property float x');
		headerWriter.WriteLine ('property float y');
		headerWriter.WriteLine ('property float z');
		headerWriter.WriteLine ('element face ' + triangleCount);
		headerWriter.WriteLine ('property list uchar int vertex_index');
		headerWriter.WriteLine ('end_header');
		return headerWriter.GetText ();
	}
}

class ExporterStl extends ExporterBase
{
	constructor ()
	{
		super ();
	}

    CanExport (format, extension)
    {
        return (format === FileFormat.Text || format === FileFormat.Binary) && extension === 'stl';
    }

	ExportContent (exporterModel, format, files, onFinish)
	{
		if (format === FileFormat.Text) {
			this.ExportText (exporterModel, files);
		} else {
			this.ExportBinary (exporterModel, files);
		}
		onFinish ();
	}

	ExportText (exporterModel, files)
	{
		let stlFile = new ExportedFile ('model.stl');
		files.push (stlFile);

		let stlWriter = new TextWriter ();
		stlWriter.WriteLine ('solid Model');
		exporterModel.EnumerateTrianglesWithNormals ((v0, v1, v2, normal) => {
			stlWriter.WriteArrayLine (['facet', 'normal', normal.x, normal.y, normal.z]);
			stlWriter.Indent (1);
			stlWriter.WriteLine ('outer loop');
			stlWriter.Indent (1);
			stlWriter.WriteArrayLine (['vertex', v0.x, v0.y, v0.z]);
			stlWriter.WriteArrayLine (['vertex', v1.x, v1.y, v1.z]);
			stlWriter.WriteArrayLine (['vertex', v2.x, v2.y, v2.z]);
			stlWriter.Indent (-1);
			stlWriter.WriteLine ('endloop');
			stlWriter.Indent (-1);
			stlWriter.WriteLine ('endfacet');
		});
		stlWriter.WriteLine ('endsolid Model');

		stlFile.SetTextContent (stlWriter.GetText ());
	}

	ExportBinary (exporterModel, files)
	{
		let stlFile = new ExportedFile ('model.stl');
		files.push (stlFile);

		let triangleCount = exporterModel.TriangleCount ();
		let headerSize = 80;
		let fullByteLength = headerSize + 4 + triangleCount * 50;
		let stlWriter = new BinaryWriter (fullByteLength, true);

		for (let i = 0; i < headerSize; i++) {
			stlWriter.WriteUnsignedCharacter8 (0);
		}

		stlWriter.WriteUnsignedInteger32 (triangleCount);
		exporterModel.EnumerateTrianglesWithNormals ((v0, v1, v2, normal) => {
			stlWriter.WriteFloat32 (normal.x);
			stlWriter.WriteFloat32 (normal.y);
			stlWriter.WriteFloat32 (normal.z);

			stlWriter.WriteFloat32 (v0.x);
			stlWriter.WriteFloat32 (v0.y);
			stlWriter.WriteFloat32 (v0.z);

			stlWriter.WriteFloat32 (v1.x);
			stlWriter.WriteFloat32 (v1.y);
			stlWriter.WriteFloat32 (v1.z);

			stlWriter.WriteFloat32 (v2.x);
			stlWriter.WriteFloat32 (v2.y);
			stlWriter.WriteFloat32 (v2.z);

			stlWriter.WriteUnsignedInteger16 (0);
		});

		stlFile.SetBufferContent (stlWriter.GetBuffer ());
	}
}

class Exporter
{
    constructor ()
    {
        this.exporters = [
            new ExporterObj (),
            new ExporterStl (),
            new ExporterPly (),
            new ExporterOff (),
            new ExporterGltf (),
            new Exporter3dm (),
            new ExporterBim ()
        ];
    }

    AddExporter (exporter)
    {
        this.exporters.push (exporter);
    }

    Export (model, settings, format, extension, callbacks)
    {
        let exporter = null;
        for (let i = 0; i < this.exporters.length; i++) {
            let currentExporter = this.exporters[i];
            if (currentExporter.CanExport (format, extension)) {
                exporter = currentExporter;
                break;
            }
        }
        if (exporter === null) {
            callbacks.onError ();
            return;
        }

        let exporterModel = new ExporterModel (model, settings);
        exporter.Export (exporterModel, format, (files) => {
            if (files.length === 0) {
                callbacks.onError ();
            } else {
                callbacks.onSuccess (files);
            }
        });
    }
}

class Box3D
{
    constructor (min, max)
    {
        this.min = min;
        this.max = max;
    }

    GetMin ()
    {
        return this.min;
    }

    GetMax ()
    {
        return this.max;
    }

    GetCenter ()
    {
        return new Coord3D (
            (this.min.x + this.max.x) / 2.0,
            (this.min.y + this.max.y) / 2.0,
            (this.min.z + this.max.z) / 2.0
        );
    }
}

class BoundingBoxCalculator3D
{
    constructor ()
    {
        this.box = new Box3D (
            new Coord3D (Infinity, Infinity, Infinity),
            new Coord3D (-Infinity, -Infinity, -Infinity)
        );
        this.isValid = false;
    }

    GetBox ()
    {
        if (!this.isValid) {
            return null;
        }
        return this.box;
    }

    AddPoint (point)
    {
        this.box.min.x = Math.min (this.box.min.x, point.x);
        this.box.min.y = Math.min (this.box.min.y, point.y);
        this.box.min.z = Math.min (this.box.min.z, point.z);
        this.box.max.x = Math.max (this.box.max.x, point.x);
        this.box.max.y = Math.max (this.box.max.y, point.y);
        this.box.max.z = Math.max (this.box.max.z, point.z);
        this.isValid = true;
    }
}

class OctreeNode
{
    constructor (boundingBox, level)
    {
        this.boundingBox = boundingBox;
        this.level = level;
        this.pointItems = [];
        this.childNodes = [];
    }

    AddPoint (point, data, options)
    {
        let node = this.FindNodeForPoint (point);
        if (node === null) {
            return false;
        }

        if (node.FindPointDirectly (point) !== null) {
            return false;
        }

        if (node.pointItems.length < options.maxPointsPerNode || node.level >= options.maxTreeDepth) {
            node.AddPointDirectly (point, data);
            return true;
        } else {
            node.CreateChildNodes ();
            let oldPointItems = node.pointItems;
            node.pointItems = [];
            for (let i = 0; i < oldPointItems.length; i++) {
                let pointItem = oldPointItems[i];
                if (!node.AddPoint (pointItem.point, pointItem.data, options)) {
                    return false;
                }
            }
            return node.AddPoint (point, data, options);
        }
    }

    FindPoint (point)
    {
        let node = this.FindNodeForPoint (point);
        if (node === null) {
            return null;
        }
        return node.FindPointDirectly (point);
    }

    AddPointDirectly (point, data)
    {
        this.pointItems.push ({
            point : point,
            data : data
        });
    }

    FindPointDirectly (point)
    {
        for (let i = 0; i < this.pointItems.length; i++) {
            let pointItem = this.pointItems[i];
            if (CoordIsEqual3D (point, pointItem.point)) {
                return pointItem.data;
            }
        }
        return null;
    }

    FindNodeForPoint (point)
    {
        if (!this.IsPointInBounds (point)) {
            return null;
        }

        if (this.childNodes.length === 0) {
            return this;
        }

        for (let i = 0; i < this.childNodes.length; i++) {
            let childNode = this.childNodes[i];
            let foundNode = childNode.FindNodeForPoint (point);
            if (foundNode !== null) {
                return foundNode;
            }
        }

        return null;
    }

    CreateChildNodes ()
    {
        function AddChildNode (node, minX, minY, minZ, sizeX, sizeY, sizeZ)
        {
            let box = new Box3D (
                new Coord3D (minX, minY, minZ),
                new Coord3D (minX + sizeX, minY + sizeY, minZ + sizeZ)
            );
            node.childNodes.push (new OctreeNode (box, node.level + 1));
        }

        let min = this.boundingBox.min;
        let center = this.boundingBox.GetCenter ();
        let sizeX = (this.boundingBox.max.x - this.boundingBox.min.x) / 2.0;
        let sizeY = (this.boundingBox.max.y - this.boundingBox.min.y) / 2.0;
        let sizeZ = (this.boundingBox.max.z - this.boundingBox.min.z) / 2.0;

        AddChildNode (this, min.x, min.y, min.z, sizeX, sizeY, sizeZ);
        AddChildNode (this, center.x, min.y, min.z, sizeX, sizeY, sizeZ);
        AddChildNode (this, min.x, center.y, min.z, sizeX, sizeY, sizeZ);
        AddChildNode (this, center.x, center.y, min.z, sizeX, sizeY, sizeZ);
        AddChildNode (this, min.x, min.y, center.z, sizeX, sizeY, sizeZ);
        AddChildNode (this, center.x, min.y, center.z, sizeX, sizeY, sizeZ);
        AddChildNode (this, min.x, center.y, center.z, sizeX, sizeY, sizeZ);
        AddChildNode (this, center.x, center.y, center.z, sizeX, sizeY, sizeZ);
    }

    IsPointInBounds (point)
    {
        let isEqual =
            IsGreaterOrEqual (point.x, this.boundingBox.min.x) &&
            IsGreaterOrEqual (point.y, this.boundingBox.min.y) &&
            IsGreaterOrEqual (point.z, this.boundingBox.min.z) &&
            IsLowerOrEqual (point.x, this.boundingBox.max.x) &&
            IsLowerOrEqual (point.y, this.boundingBox.max.y) &&
            IsLowerOrEqual (point.z, this.boundingBox.max.z);
        return isEqual;
    }
}

class Octree
{
    constructor (boundingBox, options)
    {
        this.options = {
            maxPointsPerNode : 10,
            maxTreeDepth : 10
        };
        if (options !== undefined) {
            if (options.maxPointsPerNode !== undefined) {
                this.options.maxPointsPerNode = options.maxPointsPerNode;
            }
            if (options.maxTreeDepth !== undefined) {
                this.options.maxTreeDepth = options.maxTreeDepth;
            }
        }
        this.rootNode = new OctreeNode (boundingBox, 0);
    }

    AddPoint (point, data)
    {
        return this.rootNode.AddPoint (point, data, this.options);
    }

    FindPoint (point)
    {
        return this.rootNode.FindPoint (point);
    }
}

function BezierTweenFunction (distance, index, count)
{
    let t = index / count;
	return distance * (t * t * (3.0 - 2.0 * t));
}

function LinearTweenFunction (distance, index, count)
{
    return index * distance / count;
}

function ParabolicTweenFunction (distance, index, count)
{
    let t = index / count;
    let t2 = t * t;
    return distance * (t2 / (2.0 * (t2 - t) + 1.0));
}

function TweenCoord3D (a, b, count, tweenFunc)
{
	let dir = SubCoord3D (b, a).Normalize ();
	let distance = CoordDistance3D (a, b);
	let result = [];
	for (let i = 0; i < count; i++) {
        let step = tweenFunc (distance, i, count - 1);
		result.push (a.Clone ().Offset (dir, step));
	}
	return result;
}

/**
 * File representation class for importers.
 */
class InputFile
{
    /**
     * @param {string} name Name of the file.
     * @param {FileSource} source Source of the file.
     * @param {string|File} data If the file source is url, this must be the url string. If the file source
     * is file, this must be a {@link File} object.
     */
    constructor (name, source, data)
    {
        this.name = name;
        this.source = source;
        this.data = data;
    }
}

function InputFilesFromUrls (urls)
{
    let inputFiles = [];
    for (let url of urls) {
        let fileName = GetFileName (url);
        inputFiles.push (new InputFile (fileName, FileSource.Url, url));
    }
    return inputFiles;
}

function InputFilesFromFileObjects (fileObjects)
{
    let inputFiles = [];
    for (let fileObject of fileObjects) {
        let fileName = GetFileName (fileObject.name);
        inputFiles.push (new InputFile (fileName, FileSource.File, fileObject));
    }
    return inputFiles;
}

class ImporterFile
{
    constructor (name, source, data)
    {
        this.name = GetFileName (name);
        this.extension = GetFileExtension (name);
        this.source = source;
        this.data = data;
        this.content = null;
    }

    SetContent (content)
    {
        this.content = content;
    }
}

class ImporterFileList
{
    constructor ()
    {
        this.files = [];
    }

    FillFromInputFiles (inputFiles)
    {
        this.files = [];
        for (let inputFile of inputFiles) {
            let file = new ImporterFile (inputFile.name, inputFile.source, inputFile.data);
            this.files.push (file);
        }
    }

    ExtendFromFileList (fileList)
    {
        let files = fileList.GetFiles ();
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (!this.ContainsFileByPath (file.name)) {
                this.files.push (file);
            }
        }
    }

    GetFiles ()
    {
        return this.files;
    }

    GetContent (callbacks)
    {
        RunTasks (this.files.length, {
            runTask : (index, onTaskComplete) => {
                callbacks.onFileListProgress (index, this.files.length);
                this.GetFileContent (this.files[index], {
                    onReady : onTaskComplete,
                    onProgress : callbacks.onFileLoadProgress
                });
            },
            onReady : callbacks.onReady
        });
    }

    ContainsFileByPath (filePath)
    {
        return this.FindFileByPath (filePath) !== null;
    }

    FindFileByPath (filePath)
    {
        let fileName = GetFileName (filePath).toLowerCase ();
        for (let fileIndex = 0; fileIndex < this.files.length; fileIndex++) {
            let file = this.files[fileIndex];
            if (file.name.toLowerCase () === fileName) {
                return file;
            }
        }
        return null;
    }

    IsOnlyUrlSource ()
    {
        if (this.files.length === 0) {
            return false;
        }
        for (let i = 0; i < this.files.length; i++) {
            let file = this.files[i];
            if (file.source !== FileSource.Url && file.source !== FileSource.Decompressed) {
                return false;
            }
        }
        return true;
    }

    AddFile (file)
    {
        this.files.push (file);
    }

    GetFileContent (file, callbacks)
    {
        if (file.content !== null) {
            callbacks.onReady ();
            return;
        }
        let loaderPromise = null;
        if (file.source === FileSource.Url) {
            loaderPromise = RequestUrl (file.data, callbacks.onProgress);
        } else if (file.source === FileSource.File) {
            loaderPromise = ReadFile (file.data, callbacks.onProgress);
        } else {
            callbacks.onReady ();
            return;
        }
        loaderPromise.then ((content) => {
            file.SetContent (content);
        }).catch (() => {
        }).finally (() => {
            callbacks.onReady ();
        });
    }
}

class NodeIdGenerator
{
    constructor ()
    {
        this.nextId = 0;
    }

    GenerateId ()
    {
        const id = this.nextId;
        this.nextId += 1;
        return id;
    }
}

class Node
{
    constructor ()
    {
        this.name = '';
        this.parent = null;
        this.transformation = new Transformation ();

        this.childNodes = [];
        this.meshIndices = [];

        this.idGenerator = new NodeIdGenerator ();
        this.id = this.idGenerator.GenerateId ();
    }

    IsEmpty ()
    {
        return this.childNodes.length === 0 && this.meshIndices.length === 0;
    }

    IsMeshNode ()
    {
        return this.childNodes.length === 0 && this.meshIndices.length === 1;
    }

    GetId ()
    {
        return this.id;
    }

    GetName ()
    {
        return this.name;
    }

    SetName (name)
    {
        this.name = name;
    }

    HasParent ()
    {
        return this.parent !== null;
    }

    GetParent ()
    {
        return this.parent;
    }

    GetTransformation ()
    {
        return this.transformation;
    }

    GetWorldTransformation ()
    {
        let transformation = this.transformation.Clone ();
        let parent = this.parent;
        while (parent !== null) {
            transformation.Append (parent.transformation);
            parent = parent.parent;
        }
        return transformation;
    }

    SetTransformation (transformation)
    {
        this.transformation = transformation;
    }

    AddChildNode (node)
    {
        node.parent = this;
        node.idGenerator = this.idGenerator;
        node.id = node.idGenerator.GenerateId ();
        this.childNodes.push (node);
        return this.childNodes.length - 1;
    }

    RemoveChildNode (node)
    {
        node.parent = null;
        let index = this.childNodes.indexOf (node);
        this.childNodes.splice (index, 1);
    }

    GetChildNodes ()
    {
        return this.childNodes;
    }

    ChildNodeCount ()
    {
        return this.childNodes.length;
    }

    GetChildNode (index)
    {
        return this.childNodes[index];
    }

    AddMeshIndex (index)
    {
        this.meshIndices.push (index);
        return this.meshIndices.length - 1;
    }

    MeshIndexCount ()
    {
        return this.meshIndices.length;
    }

    GetMeshIndex (index)
    {
        return this.meshIndices[index];
    }

    GetMeshIndices ()
    {
        return this.meshIndices;
    }

    Enumerate (processor)
    {
        processor (this);
        for (const childNode of this.childNodes) {
            childNode.Enumerate (processor);
        }
    }

    EnumerateChildren (processor)
    {
        for (const childNode of this.childNodes) {
            processor (childNode);
            childNode.EnumerateChildren (processor);
        }
    }

    EnumerateMeshIndices (processor)
    {
        for (const meshIndex of this.meshIndices) {
            processor (meshIndex);
        }
        for (const childNode of this.childNodes) {
            childNode.EnumerateMeshIndices (processor);
        }
    }
}

const Unit =
{
    Unknown : 0,
    Millimeter : 1,
    Centimeter : 2,
    Meter : 3,
    Inch : 4,
    Foot : 5
};

class Model extends ModelObject3D
{
    constructor ()
    {
        super ();
        this.unit = Unit.Unknown;
        this.root = new Node ();
        this.materials = [];
        this.meshes = [];
    }

    GetUnit ()
    {
        return this.unit;
    }

    SetUnit (unit)
    {
        this.unit = unit;
    }

    GetRootNode ()
    {
        return this.root;
    }

    NodeCount ()
    {
        let count = 0;
        this.root.Enumerate ((node) => {
            count += 1;
        });
        return count - 1;
    }

    MaterialCount ()
    {
        return this.materials.length;
    }

    MeshCount ()
    {
        return this.meshes.length;
    }

    MeshInstanceCount ()
    {
        let count = 0;
        this.root.Enumerate ((node) => {
            count += node.MeshIndexCount ();
        });
        return count;
    }

    VertexCount ()
    {
        let count = 0;
        this.EnumerateMeshInstances ((meshInstance) => {
            count += meshInstance.VertexCount ();
        });
        return count;
    }

    VertexColorCount ()
    {
        let count = 0;
        this.EnumerateMeshInstances ((meshInstance) => {
            count += meshInstance.VertexColorCount ();
        });
        return count;
    }

    NormalCount ()
    {
        let count = 0;
        this.EnumerateMeshInstances ((meshInstance) => {
            count += meshInstance.NormalCount ();
        });
        return count;
    }

    TextureUVCount ()
    {
        let count = 0;
        this.EnumerateMeshInstances ((meshInstance) => {
            count += meshInstance.TextureUVCount ();
        });
        return count;
    }

    TriangleCount ()
    {
        let count = 0;
        this.EnumerateMeshInstances ((meshInstance) => {
            count += meshInstance.TriangleCount ();
        });
        return count;
    }

    AddMaterial (material)
    {
        this.materials.push (material);
        return this.materials.length - 1;
    }

    GetMaterial (index)
    {
        return this.materials[index];
    }

    AddMesh (mesh)
    {
        this.meshes.push (mesh);
        return this.meshes.length - 1;
    }

    AddMeshToRootNode (mesh)
    {
        const meshIndex = this.AddMesh (mesh);
        this.root.AddMeshIndex (meshIndex);
        return meshIndex;
    }

    RemoveMesh (index)
    {
        this.meshes.splice (index, 1);
        this.root.Enumerate ((node) => {
            for (let i = 0; i < node.meshIndices.length; i++) {
                if (node.meshIndices[i] === index) {
                    node.meshIndices.splice (i, 1);
                    i -= 1;
                } else if (node.meshIndices[i] > index) {
                    node.meshIndices[i] -= 1;
                }
            }
        });
    }

    GetMesh (index)
    {
        return this.meshes[index];
    }

    GetMeshInstance (instanceId)
    {
        let foundNode = null;
        this.root.Enumerate ((node) => {
            if (node.GetId () === instanceId.nodeId) {
                foundNode = node;
            }
        });
        if (foundNode === null) {
            return null;
        }
        const nodeMeshIndices = foundNode.GetMeshIndices ();
        if (nodeMeshIndices.indexOf (instanceId.meshIndex) === -1) {
            return null;
        }
        let foundMesh = this.GetMesh (instanceId.meshIndex);
        let id = new MeshInstanceId (foundNode.GetId (), instanceId.meshIndex);
        return new MeshInstance (id, foundNode, foundMesh);
    }

    EnumerateMeshes (onMesh)
    {
        for (const mesh of this.meshes) {
            onMesh (mesh);
        }
    }

    EnumerateMeshInstances (onMeshInstance)
    {
        this.root.Enumerate ((node) => {
            for (let meshIndex of node.GetMeshIndices ()) {
                let id = new MeshInstanceId (node.GetId (), meshIndex);
                let mesh = this.GetMesh (meshIndex);
                let meshInstance = new MeshInstance (id, node, mesh);
                onMeshInstance (meshInstance);
            }
        });
    }

    EnumerateTransformedMeshInstances (onMesh)
    {
        this.EnumerateMeshInstances ((meshInstance) => {
            const transformed = meshInstance.GetTransformedMesh ();
            onMesh (transformed);
        });
    }

    EnumerateVertices (onVertex)
    {
        this.EnumerateMeshInstances ((meshInstance) => {
            meshInstance.EnumerateVertices (onVertex);
        });
    }

    EnumerateTriangleVertexIndices (onTriangleVertexIndices)
    {
        this.EnumerateMeshInstances ((meshInstance) => {
            meshInstance.EnumerateTriangleVertexIndices (onTriangleVertexIndices);
        });
    }

    EnumerateTriangleVertices (onTriangleVertices)
    {
        this.EnumerateMeshInstances ((meshInstance) => {
            meshInstance.EnumerateTriangleVertices (onTriangleVertices);
        });
    }
}

class TopologyVertex
{
    constructor ()
    {
        this.edges = [];
        this.triangles = [];
    }
}

class TopologyEdge
{
    constructor (vertex1, vertex2)
    {
        this.vertex1 = vertex1;
        this.vertex2 = vertex2;
        this.triangles = [];
    }
}

class TopologyTriangleEdge
{
    constructor (edge, reversed)
    {
        this.edge = edge;
        this.reversed = reversed;
    }
}

class TopologyTriangle
{
    constructor ()
    {
        this.triEdge1 = null;
        this.triEdge2 = null;
        this.triEdge3 = null;
    }
}

class Topology
{
    constructor ()
    {
        this.vertices = [];
        this.edges = [];
        this.triangleEdges = [];
        this.triangles = [];
        this.edgeStartToEndVertexMap = new Map ();
    }

    AddVertex ()
    {
        this.vertices.push (new TopologyVertex ());
        return this.vertices.length - 1;
    }

    AddTriangle (vertex1, vertex2, vertex3)
    {
        function AddTriangleToVertex (vertices, vertexIndex, triangleIndex)
        {
            let vertex = vertices[vertexIndex];
            vertex.triangles.push (triangleIndex);
        }

        function AddEdgeToVertex (vertices, triangleEdges, vertexIndex, triangleEdgeIndex)
        {
            let vertex = vertices[vertexIndex];
            let triangleEdge = triangleEdges[triangleEdgeIndex];
            vertex.edges.push (triangleEdge.edge);
        }

        function AddTriangleToEdge (edges, triangleEdges, triangleEdgeIndex, triangleIndex)
        {
            let triangleEdge = triangleEdges[triangleEdgeIndex];
            let edge = edges[triangleEdge.edge];
            edge.triangles.push (triangleIndex);
        }

        let triangleIndex = this.triangles.length;

        let triangle = new TopologyTriangle ();
        triangle.triEdge1 = this.AddTriangleEdge (vertex1, vertex2);
        triangle.triEdge2 = this.AddTriangleEdge (vertex2, vertex3);
        triangle.triEdge3 = this.AddTriangleEdge (vertex3, vertex1);

        AddTriangleToVertex (this.vertices, vertex1, triangleIndex);
        AddTriangleToVertex (this.vertices, vertex2, triangleIndex);
        AddTriangleToVertex (this.vertices, vertex3, triangleIndex);

        AddEdgeToVertex (this.vertices, this.triangleEdges, vertex1, triangle.triEdge1);
        AddEdgeToVertex (this.vertices, this.triangleEdges, vertex2, triangle.triEdge2);
        AddEdgeToVertex (this.vertices, this.triangleEdges, vertex3, triangle.triEdge3);

        AddTriangleToEdge (this.edges, this.triangleEdges, triangle.triEdge1, triangleIndex);
        AddTriangleToEdge (this.edges, this.triangleEdges, triangle.triEdge2, triangleIndex);
        AddTriangleToEdge (this.edges, this.triangleEdges, triangle.triEdge3, triangleIndex);

        this.triangles.push (triangle);
    }

    AddTriangleEdge (vertex1, vertex2)
    {
        let startVertex = vertex1;
        let endVertex = vertex2;
        let reversed = false;
        if (vertex2 < vertex1) {
            startVertex = vertex2;
            endVertex = vertex1;
            reversed = true;
        }

        let edgeIndex = this.AddEdge (startVertex, endVertex);
        this.triangleEdges.push (new TopologyTriangleEdge (edgeIndex, reversed));
        return this.triangleEdges.length - 1;
    }

    AddEdge (startVertex, endVertex)
    {
        if (!this.edgeStartToEndVertexMap.has (startVertex)) {
            this.edgeStartToEndVertexMap.set (startVertex, []);
        }

        let endVertices = this.edgeStartToEndVertexMap.get (startVertex);
        for (let i = 0; i < endVertices.length; i++) {
            let endVertexItem = endVertices[i];
            if (endVertexItem.endVertex === endVertex) {
                return endVertexItem.edgeIndex;
            }
        }

        let edgeIndex = this.edges.length;
        endVertices.push ({
            endVertex : endVertex,
            edgeIndex : edgeIndex
        });

        this.edges.push (new TopologyEdge (startVertex, endVertex));
        return edgeIndex;
    }
}

function IsModelEmpty (model)
{
    let isEmpty = true;
    model.EnumerateMeshInstances ((meshInstance) => {
        if (GetMeshType (meshInstance) !== MeshType.Empty) {
            isEmpty = false;
        }
    });
    return isEmpty;
}

function GetBoundingBox (object3D)
{
    let calculator = new BoundingBoxCalculator3D ();
    object3D.EnumerateVertices ((vertex) => {
        calculator.AddPoint (vertex);
    });
    return calculator.GetBox ();
}

function GetTopology (object3D)
{
    function GetVertexIndex (vertex, octree, topology)
    {
        let index = octree.FindPoint (vertex);
        if (index === null) {
            index = topology.AddVertex ();
            octree.AddPoint (vertex, index);
        }
        return index;
    }

    let boundingBox = GetBoundingBox (object3D);
    let octree = new Octree (boundingBox);
    let topology = new Topology ();

    object3D.EnumerateTriangleVertices ((v0, v1, v2) => {
        let v0Index = GetVertexIndex (v0, octree, topology);
        let v1Index = GetVertexIndex (v1, octree, topology);
        let v2Index = GetVertexIndex (v2, octree, topology);
        topology.AddTriangle (v0Index, v1Index, v2Index);
    });
    return topology;
}

function IsTwoManifold (object3D)
{
    function GetEdgeOrientationInTriangle (topology, triangleIndex, edgeIndex)
    {
        const triangle = topology.triangles[triangleIndex];
        const triEdge1 = topology.triangleEdges[triangle.triEdge1];
        const triEdge2 = topology.triangleEdges[triangle.triEdge2];
        const triEdge3 = topology.triangleEdges[triangle.triEdge3];
        if (triEdge1.edge === edgeIndex) {
            return triEdge1.reversed;
        }
        if (triEdge2.edge === edgeIndex) {
            return triEdge2.reversed;
        }
        if (triEdge3.edge === edgeIndex) {
            return triEdge3.reversed;
        }
        return null;
    }

    if (object3D instanceof Model) {
        let isTwoManifold = true;
        object3D.EnumerateMeshInstances ((meshInstance) => {
            if (isTwoManifold) {
                isTwoManifold = IsTwoManifold (meshInstance);
            }
        });
        return isTwoManifold;
    } else {
        const topology = GetTopology (object3D);
        for (let edgeIndex = 0; edgeIndex < topology.edges.length; edgeIndex++) {
            const edge = topology.edges[edgeIndex];
            if (edge.triangles.length !== 2) {
                return false;
            }

            let edgeOrientation1 = GetEdgeOrientationInTriangle (topology, edge.triangles[0], edgeIndex);
            let edgeOrientation2 = GetEdgeOrientationInTriangle (topology, edge.triangles[1], edgeIndex);
            if (edgeOrientation1 === null || edgeOrientation2 === null || edgeOrientation1 === edgeOrientation2) {
                return false;
            }
        }
        return true;
    }
}

function HasDefaultMaterial (model)
{
    for (let i = 0; i < model.MaterialCount (); i++) {
        let material = model.GetMaterial (i);
        if (material.isDefault && !material.vertexColors) {
            return true;
        }
    }
    return false;
}

function ReplaceDefaultMaterialColor (model, color)
{
    for (let i = 0; i < model.MaterialCount (); i++) {
        let material = model.GetMaterial (i);
        if (material.isDefault) {
            material.color = color;
        }
    }
}

class Mesh extends ModelObject3D
{
    constructor ()
    {
        super ();
        this.vertices = [];
        this.vertexColors = [];
        this.normals = [];
        this.uvs = [];
        this.triangles = [];
    }

    VertexCount ()
    {
        return this.vertices.length;
    }

    VertexColorCount ()
    {
        return this.vertexColors.length;
    }

    NormalCount ()
    {
        return this.normals.length;
    }

    TextureUVCount ()
    {
        return this.uvs.length;
    }

    TriangleCount ()
    {
        return this.triangles.length;
    }

    AddVertex (vertex)
    {
        this.vertices.push (vertex);
        return this.vertices.length - 1;
    }

    SetVertex (index, vertex)
    {
        this.vertices[index] = vertex;
    }

    GetVertex (index)
    {
        return this.vertices[index];
    }

    AddVertexColor (color)
    {
        this.vertexColors.push (color);
        return this.vertexColors.length - 1;
    }

    SetVertexColor (index, color)
    {
        this.vertexColors[index] = color;
    }

    GetVertexColor (index)
    {
        return this.vertexColors[index];
    }

    AddNormal (normal)
    {
        this.normals.push (normal);
        return this.normals.length - 1;
    }

SetNormal (index, normal)
    {
        this.normals[index] = normal;
    }

    GetNormal (index)
    {
        return this.normals[index];
    }

    AddTextureUV (uv)
    {
        this.uvs.push (uv);
        return this.uvs.length - 1;
    }

    SetTextureUV (index, uv)
    {
        this.uvs[index] = uv;
    }

    GetTextureUV (index)
    {
        return this.uvs[index];
    }

    AddTriangle (triangle)
    {
        this.triangles.push (triangle);
        return this.triangles.length - 1;
    }

    GetTriangle (index)
    {
        return this.triangles[index];
    }

    EnumerateVertices (onVertex)
    {
        for (const vertex of this.vertices) {
            onVertex (vertex);
        }
    }

    EnumerateTriangleVertexIndices (onTriangleVertexIndices)
    {
        for (const triangle of this.triangles) {
            onTriangleVertexIndices (triangle.v0, triangle.v1, triangle.v2);
        }
    }

    EnumerateTriangleVertices (onTriangleVertices)
    {
        for (const triangle of this.triangles) {
            let v0 = this.vertices[triangle.v0];
            let v1 = this.vertices[triangle.v1];
            let v2 = this.vertices[triangle.v2];
            onTriangleVertices (v0, v1, v2);
        }
    }

    Clone ()
    {
        let cloned = new Mesh ();

        cloned.SetName (this.GetName ());
        this.CloneProperties (cloned);

        for (let i = 0; i < this.VertexCount (); i++) {
            let vertex = this.GetVertex (i);
            cloned.AddVertex (vertex.Clone ());
        }

        for (let i = 0; i < this.VertexColorCount (); i++) {
            let color = this.GetVertexColor (i);
            cloned.AddVertexColor (color.Clone ());
        }

        for (let i = 0; i < this.NormalCount (); i++) {
            let normal = this.GetNormal (i);
            cloned.AddNormal (normal.Clone ());
        }

        for (let i = 0; i < this.TextureUVCount (); i++) {
            let uv = this.GetTextureUV (i);
            cloned.AddTextureUV (uv.Clone ());
        }

        for (let i = 0; i < this.TriangleCount (); i++) {
            let triangle = this.GetTriangle (i);
            cloned.AddTriangle (triangle.Clone ());
        }

        return cloned;
    }
}

class Triangle
{
    constructor (v0, v1, v2)
    {
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;

        this.c0 = null;
        this.c1 = null;
        this.c2 = null;

        this.n0 = null;
        this.n1 = null;
        this.n2 = null;

        this.u0 = null;
        this.u1 = null;
        this.u2 = null;

        this.mat = null;
        this.curve = null;
    }

    HasVertices ()
    {
        return this.v0 !== null && this.v1 !== null && this.v2 !== null;
    }

    HasVertexColors ()
    {
        return this.c0 !== null && this.c1 !== null && this.c2 !== null;
    }

    HasNormals ()
    {
        return this.n0 !== null && this.n1 !== null && this.n2 !== null;
    }

    HasTextureUVs ()
    {
        return this.u0 !== null && this.u1 !== null && this.u2 !== null;
    }

    SetVertices (v0, v1, v2)
    {
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
        return this;
    }

    SetVertexColors (c0, c1, c2)
    {
        this.c0 = c0;
        this.c1 = c1;
        this.c2 = c2;
        return this;
    }

    SetNormals (n0, n1, n2)
    {
        this.n0 = n0;
        this.n1 = n1;
        this.n2 = n2;
        return this;
    }

    SetTextureUVs (u0, u1, u2)
    {
        this.u0 = u0;
        this.u1 = u1;
        this.u2 = u2;
        return this;
    }

    SetMaterial (mat)
    {
        this.mat = mat;
        return this;
    }

    SetCurve (curve)
    {
        this.curve = curve;
        return this;
    }

    Clone ()
    {
        let cloned = new Triangle (this.v0, this.v1, this.v2);
        cloned.SetVertexColors (this.c0, this.c1, this.c2);
        cloned.SetNormals (this.n0, this.n1, this.n2);
        cloned.SetTextureUVs (this.u0, this.u1, this.u2);
        cloned.SetMaterial (this.mat);
        cloned.SetCurve (this.curve);
        return cloned;
    }
}

// Some mobile devices say that they support mediump, but in reality they don't. At the end
// all materials rendered as black. This hack renders a single plane with red material and
// it checks if it's really red. If it's not, then probably there is a driver issue.
// https://github.com/kovacsv/Online3DViewer/issues/69
function HasHighpDriverIssue ()
{
    let canvas = document.createElement ('canvas');
    document.body.appendChild (canvas);
    let parameters = {
        canvas : canvas,
        antialias : true
    };

    let renderer = new THREE.WebGLRenderer (parameters);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor ('#ffffff', 1);
    renderer.setSize (10, 10);

    let scene = new THREE.Scene ();

    let ambientLight = new THREE.AmbientLight (0x888888);
    scene.add (ambientLight);

    let light = new THREE.DirectionalLight (0x888888);
    light.position.set (0.0, 0.0, 1.0);
    scene.add (light);

    let camera = new THREE.PerspectiveCamera (45.0, 1.0, 0.1, 1000.0);
    camera.position.set (0.0, 0.0, 1.0);
    camera.up.set (0.0, 1.0, 0.0);
    camera.lookAt (new THREE.Vector3 (0.0, 0.0, 0.0));
    scene.add (camera);

    let plane = new THREE.PlaneGeometry (1.0, 1.0);
    let mesh = new THREE.Mesh (plane, new THREE.MeshPhongMaterial ({
        color : 0xcc0000
    }));
    scene.add (mesh);
    renderer.render (scene, camera);

    let context = renderer.getContext ();
    let pixels = new Uint8Array (4);
    context.readPixels(
        5, 5, 1, 1,
        context.RGBA,
        context.UNSIGNED_BYTE,
        pixels
    );

    document.body.removeChild (canvas);

    let blackThreshold = 50;
    if (pixels[0] < blackThreshold && pixels[1] < blackThreshold && pixels[2] < blackThreshold) {
        return true;
    }
    return false;
}

const ShadingType =
{
    Phong : 1,
    Physical : 2
};

function GetShadingType (model)
{
    let phongCount = 0;
    let physicalCount = 0;
    for (let i = 0; i < model.MaterialCount (); i++) {
        let material = model.GetMaterial (i);
        if (material.type === MaterialType.Phong) {
            phongCount += 1;
        } else if (material.type === MaterialType.Physical) {
            physicalCount += 1;
        }
    }
    if (phongCount >= physicalCount) {
        return ShadingType.Phong;
    } else {
        return ShadingType.Physical;
    }
}

class ThreeColorConverter
{
    Convert (color)
    {
        return null;
    }
}

class ThreeLinearToSRGBColorConverter extends ThreeColorConverter
{
    Convert (color)
    {
        return new THREE.Color ().copyLinearToSRGB (color);
    }
}

class ThreeSRGBToLinearColorConverter extends ThreeColorConverter
{
    Convert (color)
    {
        return new THREE.Color ().copySRGBToLinear (color);
    }
}

function ConvertThreeColorToColor (threeColor)
{
    return RGBColorFromFloatComponents (threeColor.r, threeColor.g, threeColor.b);
}

function ConvertColorToThreeColor (color)
{
    return new THREE.Color (
        color.r / 255.0,
        color.g / 255.0,
        color.b / 255.0
    );
}

function ConvertThreeGeometryToMesh (threeGeometry, materialIndex, colorConverter)
{
    let mesh = new Mesh ();

    let vertices = threeGeometry.attributes.position.array;
    let vertexItemSize = threeGeometry.attributes.position.itemSize || 3;
    for (let i = 0; i < vertices.length; i += vertexItemSize) {
        let x = vertices[i];
        let y = vertices[i + 1];
        let z = vertices[i + 2];
        mesh.AddVertex (new Coord3D (x, y, z));
    }

    let hasVertexColors = (threeGeometry.attributes.color !== undefined);
    if (hasVertexColors) {
        let colors = threeGeometry.attributes.color.array;
        let colorItemSize = threeGeometry.attributes.color.itemSize || 3;
        for (let i = 0; i < colors.length; i += colorItemSize) {
            let threeColor = new THREE.Color (colors[i], colors[i + 1], colors[i + 2]);
            if (colorConverter !== null) {
                threeColor = colorConverter.Convert (threeColor);
            }
            mesh.AddVertexColor (ConvertThreeColorToColor (threeColor));
        }
    }

    let hasNormals = (threeGeometry.attributes.normal !== undefined);
    if (hasNormals) {
        let normals = threeGeometry.attributes.normal.array;
        let normalItemSize = threeGeometry.attributes.normal.itemSize || 3;
        for (let i = 0; i < normals.length; i += normalItemSize) {
            let x = normals[i];
            let y = normals[i + 1];
            let z = normals[i + 2];
            mesh.AddNormal (new Coord3D (x, y, z));
        }
    }

    let hasUVs = (threeGeometry.attributes.uv !== undefined);
    if (hasUVs) {
        let uvs = threeGeometry.attributes.uv.array;
        let uvItemSize = threeGeometry.attributes.uv.itemSize || 2;
        for (let i = 0; i < uvs.length; i += uvItemSize) {
            let x = uvs[i];
            let y = uvs[i + 1];
            mesh.AddTextureUV (new Coord2D (x, y));
        }
    }

    let indices = null;
    if (threeGeometry.index !== null) {
        indices = threeGeometry.index.array;
    } else {
        indices = [];
        for (let i = 0; i < vertices.length / 3; i++) {
            indices.push (i);
        }
    }

    for (let i = 0; i < indices.length; i += 3) {
        let v0 = indices[i];
        let v1 = indices[i + 1];
        let v2 = indices[i + 2];
        let triangle = new Triangle (v0, v1, v2);
        if (hasVertexColors) {
            triangle.SetVertexColors (v0, v1, v2);
        }
        if (hasNormals) {
            triangle.SetNormals (v0, v1, v2);
        }
        if (hasUVs) {
            triangle.SetTextureUVs (v0, v1, v2);
        }
        if (materialIndex !== null) {
            triangle.SetMaterial (materialIndex);
        }
        mesh.AddTriangle (triangle);
    }

    return mesh;
}

function DisposeThreeObjects (mainObject)
{
    if (mainObject === null) {
        return;
    }

    mainObject.traverse ((obj) => {
        if (obj.isMesh || obj.isLineSegments) {
            if (Array.isArray (obj.material)) {
                for (let material of obj.material) {
                    material.dispose ();
                }
            } else {
                obj.material.dispose ();
            }
            obj.userData = null;
            obj.geometry.dispose ();
        }
    });
}

class ModelFinalizer
{
    constructor (params)
    {
        this.params = {
            getDefaultMaterialColor : () => {
                return new RGBColor (0, 0, 0);
            }
        };
        CopyObjectAttributes (params, this.params);
        this.defaultMaterialIndex = null;
    }

    Finalize (model)
    {
        this.Reset ();

        this.FinalizeMeshes (model);
        this.FinalizeMaterials (model);
        this.FinalizeNodes (model);
    }

    FinalizeMaterials (model)
    {
        if (model.VertexColorCount () === 0) {
            return;
        }

        let materialHasVertexColors = new Map ();
        for (let meshIndex = 0; meshIndex < model.MeshCount (); meshIndex++) {
            let mesh = model.GetMesh (meshIndex);
            for (let triangleIndex = 0; triangleIndex < mesh.TriangleCount (); triangleIndex++) {
                let triangle = mesh.GetTriangle (triangleIndex);
                let hasVertexColors = triangle.HasVertexColors ();
                if (!materialHasVertexColors.has (triangle.mat)) {
                    materialHasVertexColors.set (triangle.mat, hasVertexColors);
                } else if (!hasVertexColors) {
                    materialHasVertexColors.set (triangle.mat, false);
                }
            }
        }

        for (let [materialIndex, hasVertexColors] of materialHasVertexColors) {
            let material = model.GetMaterial (materialIndex);
            material.vertexColors = hasVertexColors;
        }
    }

    FinalizeMeshes (model)
    {
        for (let meshIndex = 0; meshIndex < model.MeshCount (); meshIndex++) {
            let mesh = model.GetMesh (meshIndex);
            let type = GetMeshType (mesh);
            if (type === MeshType.Empty) {
                model.RemoveMesh (meshIndex);
                meshIndex = meshIndex - 1;
                continue;
            }
            this.FinalizeMesh (model, mesh);
        }
    }

    FinalizeMesh (model, mesh)
    {
        function CalculateCurveNormals (mesh)
        {
            function AddAverageNormal (mesh, triangle, vertexIndex, triangleNormals, vertexToTriangles)
            {
                function IsNormalInArray (array, normal)
                {
                    for (let i = 0; i < array.length; i++) {
                        let current = array[i];
                        if (CoordIsEqual3D (current, normal)) {
                            return true;
                        }
                    }
                    return false;
                }

                let averageNormals = [];
                let neigTriangles = vertexToTriangles.get (vertexIndex);
                for (let i = 0; i < neigTriangles.length; i++) {
                    let neigIndex = neigTriangles[i];
                    let neigTriangle = mesh.GetTriangle (neigIndex);
                    if (triangle.curve === neigTriangle.curve) {
                        let triangleNormal = triangleNormals[neigIndex];
                        if (!IsNormalInArray (averageNormals, triangleNormal)) {
                            averageNormals.push (triangleNormal);
                        }
                    }
                }

                let averageNormal = new Coord3D (0.0, 0.0, 0.0);
                for (let i = 0; i < averageNormals.length; i++) {
                    averageNormal = AddCoord3D (averageNormal, averageNormals[i]);
                }
                averageNormal.MultiplyScalar (1.0 / averageNormals.length);
                averageNormal.Normalize ();
                return mesh.AddNormal (averageNormal);
            }

            let triangleNormals = [];
            let vertexToTriangles = new Map ();

            for (let vertexIndex = 0; vertexIndex < mesh.VertexCount (); vertexIndex++) {
                vertexToTriangles.set (vertexIndex, []);
            }

            for (let triangleIndex = 0; triangleIndex < mesh.TriangleCount (); triangleIndex++) {
                let triangle = mesh.GetTriangle (triangleIndex);
                let v0 = mesh.GetVertex (triangle.v0);
                let v1 = mesh.GetVertex (triangle.v1);
                let v2 = mesh.GetVertex (triangle.v2);
                let normal = CalculateTriangleNormal (v0, v1, v2);
                triangleNormals.push (normal);
                vertexToTriangles.get (triangle.v0).push (triangleIndex);
                vertexToTriangles.get (triangle.v1).push (triangleIndex);
                vertexToTriangles.get (triangle.v2).push (triangleIndex);
            }

            for (let triangleIndex = 0; triangleIndex < mesh.TriangleCount (); triangleIndex++) {
                let triangle = mesh.GetTriangle (triangleIndex);
                if (!triangle.HasNormals ()) {
                    let n0 = AddAverageNormal (mesh, triangle, triangle.v0, triangleNormals, vertexToTriangles);
                    let n1 = AddAverageNormal (mesh, triangle, triangle.v1, triangleNormals, vertexToTriangles);
                    let n2 = AddAverageNormal (mesh, triangle, triangle.v2, triangleNormals, vertexToTriangles);
                    triangle.SetNormals (n0, n1, n2);
                }
            }
        }

        let meshStatus = {
            calculateCurveNormals : false
        };

        for (let i = 0; i < mesh.TriangleCount (); i++) {
            let triangle = mesh.GetTriangle (i);
            this.FinalizeTriangle (mesh, triangle, meshStatus);

            if (triangle.mat === null) {
                triangle.mat = this.GetDefaultMaterialIndex (model);
            }
        }

        if (meshStatus.calculateCurveNormals) {
            CalculateCurveNormals (mesh);
        }
    }

    FinalizeTriangle (mesh, triangle, meshStatus)
    {
        if (!triangle.HasNormals ()) {
            if (triangle.curve === null || triangle.curve === 0) {
                let v0 = mesh.GetVertex (triangle.v0);
                let v1 = mesh.GetVertex (triangle.v1);
                let v2 = mesh.GetVertex (triangle.v2);
                let normal = CalculateTriangleNormal (v0, v1, v2);
                let normalIndex = mesh.AddNormal (normal);
                triangle.SetNormals (normalIndex, normalIndex, normalIndex);
            } else {
                meshStatus.calculateCurveNormals = true;
            }
        }

        if (triangle.curve === null) {
            triangle.curve = 0;
        }
    }

    FinalizeNodes (model)
    {
        let rootNode = model.GetRootNode ();

        let emptyNodes = [];
        rootNode.EnumerateChildren ((node) => {
            if (node.IsEmpty ()) {
                emptyNodes.push (node);
            }
        });

        for (let nodeIndex = 0; nodeIndex < emptyNodes.length; nodeIndex++) {
            let node = emptyNodes[nodeIndex];
            let parentNode = node.GetParent ();
            if (parentNode === null) {
                continue;
            }
            parentNode.RemoveChildNode (node);
            if (parentNode.IsEmpty ()) {
                emptyNodes.push (parentNode);
            }
        }
    }

    GetDefaultMaterialIndex (model)
    {
        if (this.defaultMaterialIndex === null) {
            let defaultMaterialColor = this.params.getDefaultMaterialColor ();
            let defaultMaterial = new PhongMaterial ();
            defaultMaterial.color = defaultMaterialColor;
            defaultMaterial.isDefault = true;
            this.defaultMaterialIndex = model.AddMaterial (defaultMaterial);
        }
        return this.defaultMaterialIndex;
    }

    Reset ()
    {
        this.defaultMaterialIndex = null;
    }
}

function FinalizeModel (model, params)
{
    let finalizer = new ModelFinalizer (params);
    finalizer.Finalize (model);
}

function CheckModel (model)
{
    function IsCorrectValue (val)
    {
        if (val === undefined || val === null) {
            return false;
        }
        return true;
    }

    function IsCorrectNumber (val)
    {
        if (!IsCorrectValue (val)) {
            return false;
        }
        if (isNaN (val)) {
            return false;
        }
        return true;
    }

    function IsCorrectIndex (val, count)
    {
        if (!IsCorrectNumber (val)) {
            return false;
        }
        if (val < 0 || val >= count) {
            return false;
        }
        return true;
    }

    function CheckMesh (model, mesh)
    {
        function CheckTriangle (model, mesh, triangle)
        {
            if (!IsCorrectIndex (triangle.v0, mesh.VertexCount ())) {
                return false;
            }
            if (!IsCorrectIndex (triangle.v1, mesh.VertexCount ())) {
                return false;
            }
            if (!IsCorrectIndex (triangle.v2, mesh.VertexCount ())) {
                return false;
            }
            if (triangle.HasVertexColors ()) {
                if (!IsCorrectIndex (triangle.c0, mesh.VertexColorCount ())) {
                    return false;
                }
                if (!IsCorrectIndex (triangle.c1, mesh.VertexColorCount ())) {
                    return false;
                }
                if (!IsCorrectIndex (triangle.c2, mesh.VertexColorCount ())) {
                    return false;
                }
            }
            if (!IsCorrectIndex (triangle.n0, mesh.NormalCount ())) {
                return false;
            }
            if (!IsCorrectIndex (triangle.n1, mesh.NormalCount ())) {
                return false;
            }
            if (!IsCorrectIndex (triangle.n2, mesh.NormalCount ())) {
                return false;
            }
            if (triangle.HasTextureUVs ()) {
                if (!IsCorrectIndex (triangle.u0, mesh.TextureUVCount ())) {
                    return false;
                }
                    if (!IsCorrectIndex (triangle.u1, mesh.TextureUVCount ())) {
                    return false;
                }
                if (!IsCorrectIndex (triangle.u2, mesh.TextureUVCount ())) {
                    return false;
                }
            }
            if (!IsCorrectIndex (triangle.mat, model.MaterialCount ())) {
                return false;
            }
            if (!IsCorrectNumber (triangle.curve)) {
                return false;
            }

            return true;
        }

        for (let i = 0; i < mesh.VertexCount (); i++) {
            let vertex = mesh.GetVertex (i);
            if (!IsCorrectNumber (vertex.x)) {
                return false;
            }
            if (!IsCorrectNumber (vertex.y)) {
                return false;
            }
            if (!IsCorrectNumber (vertex.z)) {
                return false;
            }
        }

        for (let i = 0; i < mesh.VertexColorCount (); i++) {
            let color = mesh.GetVertexColor (i);
            if (!IsCorrectNumber (color.r)) {
                return false;
            }
            if (!IsCorrectNumber (color.g)) {
                return false;
            }
            if (!IsCorrectNumber (color.b)) {
                return false;
            }
        }

        for (let i = 0; i < mesh.NormalCount (); i++) {
            let normal = mesh.GetNormal (i);
            if (!IsCorrectNumber (normal.x)) {
                return false;
            }
            if (!IsCorrectNumber (normal.y)) {
                return false;
            }
            if (!IsCorrectNumber (normal.z)) {
                return false;
            }
        }

        for (let i = 0; i < mesh.TextureUVCount (); i++) {
            let uv = mesh.GetTextureUV (i);
            if (!IsCorrectNumber (uv.x)) {
                return false;
            }
            if (!IsCorrectNumber (uv.y)) {
                return false;
            }
        }

        for (let i = 0; i < mesh.TriangleCount (); i++) {
            let triangle = mesh.GetTriangle (i);
            if (!CheckTriangle (model, mesh, triangle)) {
                return false;
            }
        }

        return true;
    }

    for (let i = 0; i < model.MeshCount (); i++) {
        let mesh = model.GetMesh (i);
        if (!CheckMesh (model, mesh)) {
            return false;
        }
    }

    return true;
}

class ImporterBase
{
    constructor ()
    {
        this.name = null;
        this.extension = null;
        this.callbacks = null;
        this.model = null;
        this.error = null;
        this.message = null;
    }

    Import (name, extension, content, callbacks)
    {
        this.Clear ();

        this.name = name;
        this.extension = extension;
        this.callbacks = callbacks;
        this.model = new Model ();
        this.error = false;
        this.message = null;
        this.ResetContent ();
        this.ImportContent (content, () => {
            this.CreateResult (callbacks);
        });
    }

    Clear ()
    {
        this.name = null;
        this.extension = null;
        this.callbacks = null;
        this.model = null;
        this.error = null;
        this.message = null;
        this.ClearContent ();
    }

    CreateResult (callbacks)
    {
        if (this.error) {
            callbacks.onError ();
            callbacks.onComplete ();
            return;
        }

        if (IsModelEmpty (this.model)) {
            this.SetError ('The model doesn\'t contain any meshes.');
            callbacks.onError ();
            callbacks.onComplete ();
            return;
        }

        FinalizeModel (this.model, {
            getDefaultMaterialColor : this.callbacks.getDefaultMaterialColor
        });

        callbacks.onSuccess ();
        callbacks.onComplete ();
    }

    CanImportExtension (extension)
    {
        return false;
    }

    GetUpDirection ()
    {
        return Direction.Z;
    }

    ClearContent ()
    {

    }

    ResetContent ()
    {

    }

    ImportContent (fileContent, onFinish)
    {

    }

    GetModel ()
    {
        return this.model;
    }

    SetError (message)
    {
        this.error = true;
        if (message !== undefined && message !== null) {
            this.message = message;
        }
    }

    WasError ()
    {
        return this.error;
    }

    GetErrorMessage ()
    {
        return this.message;
    }
}

function NameFromLine (line, startIndex, commentChar)
{
	let name = line.substring (startIndex);
	let commentStart = name.indexOf (commentChar);
	if (commentStart !== -1) {
		name = name.substring (0, commentStart);
	}
	return name.trim ();
}

function ParametersFromLine (line, commentChar)
{
	if (commentChar !== null) {
		let commentStart = line.indexOf (commentChar);
		if (commentStart !== -1) {
			line = line.substring (0, commentStart).trim ();
		}
	}
	return line.split (/\s+/u);
}

function ReadLines (str, onLine)
{
	function LineFound (line, onLine)
	{
		let trimmed = line.trim ();
		if (trimmed.length > 0) {
			onLine (trimmed);
		}
	}

	let cursor = 0;
	let next = str.indexOf ('\n', cursor);
	while (next !== -1) {
		LineFound (str.substring (cursor, next), onLine);
		cursor = next + 1;
		next = str.indexOf ('\n', cursor);
	}
	LineFound (str.substring (cursor), onLine);
}

function IsPowerOfTwo (x)
{
	return (x & (x - 1)) === 0;
}

function NextPowerOfTwo (x)
{
	if (IsPowerOfTwo (x)) {
		return x;
	}
	let npot = Math.pow (2, Math.ceil (Math.log (x) / Math.log (2)));
	return parseInt (npot, 10);
}

function UpdateMaterialTransparency (material)
{
	material.transparent = false;
	if (IsLower (material.opacity, 1.0)) {
		material.transparent = true;
	}
}

class ColorToMaterialConverter
{
	constructor (model)
	{
		this.model = model;
		this.colorToMaterialIndex = new Map ();
	}

	GetMaterialIndex (r, g, b, a)
	{
		let colorKey =
			IntegerToHexString (r) +
			IntegerToHexString (g) +
			IntegerToHexString (b);
		let hasAlpha = (a !== undefined && a !== null);
		if (hasAlpha) {
			colorKey += IntegerToHexString (a);
		}

		if (this.colorToMaterialIndex.has (colorKey)) {
			return this.colorToMaterialIndex.get (colorKey);
		} else {
            let material = new PhongMaterial ();
            material.name = colorKey.toUpperCase ();
            material.color = new RGBColor (r, g, b);
            if (hasAlpha && a < 255) {
                material.opacity = a / 255.0;
                UpdateMaterialTransparency (material);
            }
            let materialIndex = this.model.AddMaterial (material);
            this.colorToMaterialIndex.set (colorKey, materialIndex);
            return materialIndex;
		}
	}
}

class Importer3dm extends ImporterBase
{
    constructor ()
    {
        super ();
        this.rhino = null;
    }

    CanImportExtension (extension)
    {
        return extension === '3dm';
    }

    GetUpDirection ()
    {
        return Direction.Z;
    }

    ClearContent ()
    {
        this.instanceIdToObject = null;
        this.instanceIdToDefinition = null;
    }

    ResetContent ()
    {
        this.instanceIdToObject = new Map ();
        this.instanceIdToDefinition = new Map ();
    }

    ImportContent (fileContent, onFinish)
    {
        if (this.rhino === null) {
            LoadExternalLibrary ('loaders/rhino3dm.min.js').then (() => {
                rhino3dm ().then ((rhino) => {
                    this.rhino = rhino;
                    this.ImportRhinoContent (fileContent);
                    onFinish ();
                });
            }).catch (() => {
                this.SetError ('Failed to load rhino3dm.');
                onFinish ();
            });
        } else {
            this.ImportRhinoContent (fileContent);
            onFinish ();
        }
    }

    ImportRhinoContent (fileContent)
    {
        let rhinoDoc = this.rhino.File3dm.fromByteArray (fileContent);
        if (rhinoDoc === null) {
            this.SetError ('Failed to read Rhino file.');
            return;
        }
        this.ImportRhinoDocument (rhinoDoc);
        if (IsModelEmpty (this.model)) {
            this.SetError ('The model doesn\'t contain any 3D meshes. Try to save the model while you are in shaded view in Rhino.');
        }
    }

    ImportRhinoDocument (rhinoDoc)
    {
        this.InitRhinoInstances (rhinoDoc);
        this.ImportRhinoUserStrings (rhinoDoc);
        this.ImportRhinoGeometry (rhinoDoc);
    }

    InitRhinoInstances (rhinoDoc)
    {
        let rhinoObjects = rhinoDoc.objects ();
        for (let i = 0; i < rhinoObjects.count; i++) {
            let rhinoObject = rhinoObjects.get (i);
            let rhinoAttributes = rhinoObject.attributes ();
            if (rhinoAttributes.isInstanceDefinitionObject) {
                this.instanceIdToObject.set (rhinoAttributes.id, rhinoObject);
            }
        }
        let rhinoInstanceDefinitions = rhinoDoc.instanceDefinitions ();
        for (let i = 0; i < rhinoInstanceDefinitions.count (); i++) {
            let rhinoInstanceDefinition = rhinoInstanceDefinitions.get (i);
            this.instanceIdToDefinition.set (rhinoInstanceDefinition.id, rhinoInstanceDefinition);
        }
    }

    ImportRhinoUserStrings (rhinoDoc)
    {
        let docStrings = rhinoDoc.strings ();
        if (docStrings.count () > 0) {
            let propertyGroup = new PropertyGroup ('Document user texts');
            for (let i = 0; i < docStrings.count (); i++) {
                let docString = docStrings.get (i);
                propertyGroup.AddProperty (new Property (PropertyType.Text, docString[0], docString[1]));
            }
            this.model.AddPropertyGroup (propertyGroup);
        }
    }

    ImportRhinoGeometry (rhinoDoc)
    {
        let rhinoObjects = rhinoDoc.objects ();
        for (let i = 0; i < rhinoObjects.count; i++) {
            let rhinoObject = rhinoObjects.get (i);
            this.ImportRhinoGeometryObject (rhinoDoc, rhinoObject, []);
        }
    }

    ImportRhinoGeometryObject (rhinoDoc, rhinoObject, rhinoInstanceReferences)
    {
        let rhinoGeometry = rhinoObject.geometry ();
        let rhinoAttributes = rhinoObject.attributes ();

        let objectType = rhinoGeometry.objectType;
        if (rhinoAttributes.isInstanceDefinitionObject && rhinoInstanceReferences.length === 0) {
            return;
        }

        let rhinoMesh = null;
        let deleteMesh = false;

        if (objectType === this.rhino.ObjectType.Mesh) {
            rhinoMesh = rhinoGeometry;
            deleteMesh = false;
        } else if (objectType === this.rhino.ObjectType.Extrusion) {
            rhinoMesh = rhinoGeometry.getMesh (this.rhino.MeshType.Any);
            deleteMesh = true;
        } else if (objectType === this.rhino.ObjectType.Brep) {
            rhinoMesh = new this.rhino.Mesh ();
            let faces = rhinoGeometry.faces ();
            for (let i = 0; i < faces.count; i++) {
                let face = faces.get (i);
                let mesh = face.getMesh (this.rhino.MeshType.Any);
                if (mesh) {
                    rhinoMesh.append (mesh);
                    mesh.delete ();
                }
                face.delete ();
            }
            faces.delete ();
            rhinoMesh.compact ();
            deleteMesh = true;
        } else if (objectType === this.rhino.ObjectType.SubD) {
            rhinoGeometry.subdivide (3);
            rhinoMesh = this.rhino.Mesh.createFromSubDControlNet (rhinoGeometry);
            deleteMesh = true;
        } else if (objectType === this.rhino.ObjectType.InstanceReference) {
            let parentDefinitionId = rhinoGeometry.parentIdefId;
            if (this.instanceIdToDefinition.has (parentDefinitionId)) {
                let instanceDefinition = this.instanceIdToDefinition.get (parentDefinitionId);
                let instanceObjectIds = instanceDefinition.getObjectIds ();
                for (let i = 0; i < instanceObjectIds.length; i++) {
                    let instanceObjectId = instanceObjectIds[i];
                    if (this.instanceIdToObject.has (instanceObjectId)) {
                        let instanceObject = this.instanceIdToObject.get (instanceObjectId);
                        rhinoInstanceReferences.push (rhinoObject);
                        this.ImportRhinoGeometryObject (rhinoDoc, instanceObject, rhinoInstanceReferences);
                        rhinoInstanceReferences.pop ();
                    }
                }
            }
        }

        if (rhinoMesh !== null) {
            this.ImportRhinoMesh (rhinoDoc, rhinoMesh, rhinoObject, rhinoInstanceReferences);
            if (deleteMesh) {
                rhinoMesh.delete ();
            }
        }
    }

    ImportRhinoMesh (rhinoDoc, rhinoMesh, rhinoObject, rhinoInstanceReferences)
    {
        let rhinoAttributes = rhinoObject.attributes ();

        let materialIndex = this.GetMaterialIndex (rhinoDoc, rhinoObject, rhinoInstanceReferences);
        let threeJson = rhinoMesh.toThreejsJSON ();
        let mesh = ConvertThreeGeometryToMesh (threeJson.data, materialIndex, null);
        mesh.SetName (rhinoAttributes.name);

        let userStrings = rhinoAttributes.getUserStrings ();
        if (userStrings.length > 0) {
            let propertyGroup = new PropertyGroup ('User texts');
            for (let i = 0; i < userStrings.length; i++) {
                let userString = userStrings[i];
                propertyGroup.AddProperty (new Property (PropertyType.Text, userString[0], userString[1]));
            }
            mesh.AddPropertyGroup (propertyGroup);
        }

        if (rhinoInstanceReferences.length !== 0) {
            let matrix = new Matrix ().CreateIdentity ();
            for (let i = rhinoInstanceReferences.length - 1; i >= 0; i--) {
                let rhinoInstanceReference = rhinoInstanceReferences[i];
                let rhinoInstanceReferenceGeometry = rhinoInstanceReference.geometry ();
                let rhinoInstanceReferenceMatrix = rhinoInstanceReferenceGeometry.xform.toFloatArray (false);
                let transformationMatrix = new Matrix (rhinoInstanceReferenceMatrix);
                matrix = matrix.MultiplyMatrix (transformationMatrix);
            }
            let transformation = new Transformation (matrix);
            TransformMesh (mesh, transformation);
        }
        this.model.AddMeshToRootNode (mesh);
    }

    GetMaterialIndex (rhinoDoc, rhinoObject, rhinoInstanceReferences)
    {
        function GetRhinoMaterial (rhino, rhinoObject, rhinoInstanceReferences)
        {
            let rhinoAttributes = rhinoObject.attributes ();
            if (rhinoAttributes.materialSource === rhino.ObjectMaterialSource.MaterialFromObject) {
                let materialIndex = rhinoAttributes.materialIndex;
                if (materialIndex > -1) {
                    return rhinoDoc.materials ().get (materialIndex);
                }
            } else if (rhinoAttributes.materialSource === rhino.ObjectMaterialSource.MaterialFromLayer) {
                let layerIndex = rhinoAttributes.layerIndex;
                if (layerIndex > -1) {
                    let layer = rhinoDoc.layers ().get (layerIndex);
                    let layerMaterialIndex = layer.renderMaterialIndex;
                    if (layerMaterialIndex > -1) {
                        return rhinoDoc.materials ().get (layerMaterialIndex);
                    }
                }
            } else if (rhinoAttributes.materialSource === rhino.ObjectMaterialSource.MaterialFromParent) {
                if (rhinoInstanceReferences.length !== 0) {
                    return GetRhinoMaterial (rhino, rhinoInstanceReferences[0], []);
                }
            }
            return null;
        }

        function ConvertRhinoMaterial (rhinoMaterial, callbacks)
        {
            function SetColor (color, rhinoColor)
            {
                color.Set (rhinoColor.r, rhinoColor.g, rhinoColor.b);
            }

            function IsBlack (rhinoColor)
            {
                return rhinoColor.r === 0 && rhinoColor.g === 0 && rhinoColor.b === 0;
            }

            function IsWhite (rhinoColor)
            {
                return rhinoColor.r === 255 && rhinoColor.g === 255 && rhinoColor.b === 255;
            }

            let material = null;
            let physicallyBased = rhinoMaterial.physicallyBased ();
            if (physicallyBased.supported) {
                material = new PhysicalMaterial ();
                material.metalness = physicallyBased.metallic ? 1.0 : 0.0;
                material.roughness = physicallyBased.roughness;
            } else {
                material = new PhongMaterial ();
                SetColor (material.ambient, rhinoMaterial.ambientColor);
                SetColor (material.specular, rhinoMaterial.specularColor);
            }

            material.name = rhinoMaterial.name;

            SetColor (material.color, rhinoMaterial.diffuseColor);
            material.opacity = 1.0 - rhinoMaterial.transparency;
            UpdateMaterialTransparency (material);

            if (IsBlack (material.color) && !IsWhite (rhinoMaterial.reflectionColor)) {
                SetColor (material.color, rhinoMaterial.reflectionColor);
            }
            if (IsBlack (material.color) && !IsWhite (rhinoMaterial.transparentColor)) {
                SetColor (material.color, rhinoMaterial.transparentColor);
            }

            let rhinoTexture = rhinoMaterial.getBitmapTexture ();
            if (rhinoTexture) {
                let texture = new TextureMap ();
                let textureName = GetFileName (rhinoTexture.fileName);
                let textureBuffer = callbacks.getFileBuffer (textureName);
                texture.name = textureName;
                texture.buffer = textureBuffer;
                material.diffuseMap = texture;
            }

            return material;
        }

        function FindMatchingMaterial (model, rhinoMaterial, callbacks)
        {
            let material = ConvertRhinoMaterial (rhinoMaterial, callbacks);
            for (let i = 0; i < model.MaterialCount (); i++) {
                let current = model.GetMaterial (i);
                if (current.IsEqual (material)) {
                    return i;
                }
            }
            return model.AddMaterial (material);
        }

        let rhinoMaterial = GetRhinoMaterial (this.rhino, rhinoObject, rhinoInstanceReferences);
        if (rhinoMaterial === null) {
            return null;
        }
        return FindMatchingMaterial (this.model, rhinoMaterial, this.callbacks);
    }
}

class BinaryReader
{
    constructor (arrayBuffer, isLittleEndian)
    {
        this.arrayBuffer = arrayBuffer;
        this.dataView = new DataView (arrayBuffer);
        this.isLittleEndian = isLittleEndian;
        this.position = 0;
    }

    GetPosition ()
    {
        return this.position;
    }

    SetPosition (position)
    {
        this.position = position;
    }

    GetByteLength ()
    {
        return this.arrayBuffer.byteLength;
    }

    Skip (bytes)
    {
        this.position = this.position + bytes;
    }

    End ()
    {
        return this.position >= this.arrayBuffer.byteLength;
    }

    ReadArrayBuffer (byteLength)
    {
        let originalBufferView = new Uint8Array (this.arrayBuffer);
        let arrayBuffer = new ArrayBuffer (byteLength);
        let bufferView = new Uint8Array (arrayBuffer);
        let subArray = originalBufferView.subarray (this.position, this.position + byteLength);
        bufferView.set (subArray, 0);
        this.position += byteLength;
        return arrayBuffer;
    }

    ReadBoolean8 ()
    {
        let result = this.dataView.getInt8 (this.position);
        this.position = this.position + 1;
        return result ? true : false;
    }

    ReadCharacter8 ()
    {
        let result = this.dataView.getInt8 (this.position);
        this.position = this.position + 1;
        return result;
    }

    ReadUnsignedCharacter8 ()
    {
        let result = this.dataView.getUint8 (this.position);
        this.position = this.position + 1;
        return result;
    }

    ReadInteger16 ()
    {
        let result = this.dataView.getInt16 (this.position, this.isLittleEndian);
        this.position = this.position + 2;
        return result;
    }

    ReadUnsignedInteger16 ()
    {
        let result = this.dataView.getUint16 (this.position, this.isLittleEndian);
        this.position = this.position + 2;
        return result;
    }

    ReadInteger32 ()
    {
        let result = this.dataView.getInt32 (this.position, this.isLittleEndian);
        this.position = this.position + 4;
        return result;
    }

    ReadUnsignedInteger32 ()
    {
        let result = this.dataView.getUint32 (this.position, this.isLittleEndian);
        this.position = this.position + 4;
        return result;
    }

    ReadFloat32 ()
    {
        let result = this.dataView.getFloat32 (this.position, this.isLittleEndian);
        this.position = this.position + 4;
        return result;
    }

    ReadDouble64 ()
    {
        let result = this.dataView.getFloat64 (this.position, this.isLittleEndian);
        this.position = this.position + 8;
        return result;
    }
}

const CHUNK3DS =
{
    MAIN3DS : 0x4D4D,
    EDIT3DS : 0x3D3D,
    EDIT_MATERIAL : 0xAFFF,
    MAT_NAME : 0xA000,
    MAT_AMBIENT : 0xA010,
    MAT_DIFFUSE : 0xA020,
    MAT_SPECULAR : 0xA030,
    MAT_SHININESS : 0xA040,
    MAT_SHININESS_STRENGTH : 0xA041,
    MAT_TRANSPARENCY : 0xA050,
    MAT_COLOR_F : 0x0010,
    MAT_COLOR : 0x0011,
    MAT_LIN_COLOR : 0x0012,
    MAT_LIN_COLOR_F : 0x0013,
    MAT_TEXMAP : 0xA200,
    MAT_TEXMAP_NAME : 0xA300,
    MAT_TEXMAP_UOFFSET : 0xA358,
    MAT_TEXMAP_VOFFSET : 0xA35A,
    MAT_TEXMAP_USCALE : 0xA354,
    MAT_TEXMAP_VSCALE : 0xA356,
    MAT_TEXMAP_ROTATION : 0xA35C,
    PERCENTAGE : 0x0030,
    PERCENTAGE_F : 0x0031,
    EDIT_OBJECT : 0x4000,
    OBJ_TRIMESH : 0x4100,
    OBJ_LIGHT : 0x4600,
    OBJ_CAMERA : 0x4700,
    TRI_VERTEX : 0x4110,
    TRI_TEXVERTEX : 0x4140,
    TRI_FACE : 0x4120,
    TRI_TRANSFORMATION : 0x4160,
    TRI_MATERIAL : 0x4130,
    TRI_SMOOTH : 0x4150,
    KF3DS : 0xB000,
    OBJECT_NODE : 0xB002,
    OBJECT_HIERARCHY : 0xB010,
    OBJECT_INSTANCE_NAME : 0xB011,
    OBJECT_PIVOT : 0xB013,
    OBJECT_POSITION : 0xB020,
    OBJECT_ROTATION : 0xB021,
    OBJECT_SCALE : 0xB022,
    OBJECT_ID : 0xB030
};

class Importer3dsNode
{
    constructor ()
    {
        this.id = -1;
        this.name = '';
        this.flags = -1;
        this.parentId = -1;
        this.instanceName = '';
        this.pivot = [0.0, 0.0, 0.0];
        this.positions = [];
        this.rotations = [];
        this.scales = [];
    }
}

class Importer3dsNodeList
{
    constructor ()
    {
        this.nodes = [];
        this.nodeIdToNode = new Map ();
    }

    IsEmpty ()
    {
        return this.nodes.length === 0;
    }

    AddNode (node)
    {
        this.nodes.push (node);
        this.nodeIdToNode.set (node.nodeId, node);
    }

    GetNodes ()
    {
        return this.nodes;
    }
}

class Importer3ds extends ImporterBase
{
    constructor ()
    {
        super ();
    }

    CanImportExtension (extension)
    {
        return extension === '3ds';
    }

    GetUpDirection ()
    {
        return Direction.Z;
    }

    ClearContent ()
    {
        this.materialNameToIndex = null;
        this.meshNameToIndex = null;
        this.nodeList = null;
    }

    ResetContent ()
    {
        this.materialNameToIndex = new Map ();
        this.meshNameToIndex = new Map ();
        this.nodeList = new Importer3dsNodeList ();
    }

    ImportContent (fileContent, onFinish)
    {
        this.ProcessBinary (fileContent);
        onFinish ();
    }

    ProcessBinary (fileContent)
    {
        let reader = new BinaryReader (fileContent, true);
        let endByte = reader.GetByteLength ();
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.MAIN3DS) {
                this.ReadMainChunk (reader, chunkLength);
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });
    }

    ReadMainChunk (reader, length)
    {
        let endByte = this.GetChunkEnd (reader, length);
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.EDIT3DS) {
                this.ReadEditorChunk (reader, chunkLength);
            } else if (chunkId === CHUNK3DS.KF3DS) {
                this.ReadKeyFrameChunk (reader, chunkLength);
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });
        this.BuildNodeHierarchy ();
    }

    ReadEditorChunk (reader, length)
    {
        let endByte = this.GetChunkEnd (reader, length);
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.EDIT_MATERIAL) {
                this.ReadMaterialChunk (reader, chunkLength);
            } else if (chunkId === CHUNK3DS.EDIT_OBJECT) {
                this.ReadObjectChunk (reader, chunkLength);
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });
    }

    ReadMaterialChunk (reader, length)
    {
        let material = new PhongMaterial ();
        let endByte = this.GetChunkEnd (reader, length);
        let shininess = null;
        let shininessStrength = null;
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.MAT_NAME) {
                material.name = this.ReadName (reader);
            } else if (chunkId === CHUNK3DS.MAT_AMBIENT) {
                material.ambient = this.ReadColorChunk (reader, chunkLength);
            } else if (chunkId === CHUNK3DS.MAT_DIFFUSE) {
                material.color = this.ReadColorChunk (reader, chunkLength);
            } else if (chunkId === CHUNK3DS.MAT_SPECULAR) {
                material.specular = this.ReadColorChunk (reader, chunkLength);
            } else if (chunkId === CHUNK3DS.MAT_SHININESS) {
                shininess = this.ReadPercentageChunk (reader, chunkLength);
            } else if (chunkId === CHUNK3DS.MAT_SHININESS_STRENGTH) {
                shininessStrength = this.ReadPercentageChunk (reader, chunkLength);
            } else if (chunkId === CHUNK3DS.MAT_TRANSPARENCY) {
                material.opacity = 1.0 - this.ReadPercentageChunk (reader, chunkLength);
                UpdateMaterialTransparency (material);
            } else if (chunkId === CHUNK3DS.MAT_TEXMAP) {
                material.diffuseMap = this.ReadTextureMapChunk (reader, chunkLength);
                UpdateMaterialTransparency (material);
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });

        if (shininess !== null && shininessStrength !== null) {
            material.shininess = shininess * shininessStrength / 10.0;
        }
        let materialIndex = this.model.AddMaterial (material);
        this.materialNameToIndex.set (material.name, materialIndex);
    }

    ReadTextureMapChunk (reader, length)
    {
        let texture = new TextureMap ();
        let endByte = this.GetChunkEnd (reader, length);
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.MAT_TEXMAP_NAME) {
                let textureName = this.ReadName (reader);
                let textureBuffer = this.callbacks.getFileBuffer (textureName);
                texture.name = textureName;
                texture.buffer = textureBuffer;
            } else if (chunkId === CHUNK3DS.MAT_TEXMAP_UOFFSET) {
                texture.offset.x = reader.ReadFloat32 ();
            } else if (chunkId === CHUNK3DS.MAT_TEXMAP_VOFFSET) {
                texture.offset.y = reader.ReadFloat32 ();
            } else if (chunkId === CHUNK3DS.MAT_TEXMAP_USCALE) {
                texture.scale.x = reader.ReadFloat32 ();
            } else if (chunkId === CHUNK3DS.MAT_TEXMAP_VSCALE) {
                texture.scale.y = reader.ReadFloat32 ();
            } else if (chunkId === CHUNK3DS.MAT_TEXMAP_ROTATION) {
                texture.rotation = reader.ReadFloat32 () * DegRad;
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });
        return texture;
    }

    ReadColorChunk (reader, length)
    {
        let color = new RGBColor (0, 0, 0);
        let endByte = this.GetChunkEnd (reader, length);
        let hasLinColor = false;
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.MAT_COLOR) {
                if (!hasLinColor) {
                    color.r = reader.ReadUnsignedCharacter8 ();
                    color.g = reader.ReadUnsignedCharacter8 ();
                    color.b = reader.ReadUnsignedCharacter8 ();
                }
            } else if (chunkId === CHUNK3DS.MAT_LIN_COLOR) {
                color.r = reader.ReadUnsignedCharacter8 ();
                color.g = reader.ReadUnsignedCharacter8 ();
                color.b = reader.ReadUnsignedCharacter8 ();
                hasLinColor = true;
            } else if (chunkId === CHUNK3DS.MAT_COLOR_F) {
                if (!hasLinColor) {
                    color.r = ColorComponentFromFloat (reader.ReadFloat32 ());
                    color.g = ColorComponentFromFloat (reader.ReadFloat32 ());
                    color.b = ColorComponentFromFloat (reader.ReadFloat32 ());
                }
            } else if (chunkId === CHUNK3DS.MAT_LIN_COLOR_F) {
                color.r = ColorComponentFromFloat (reader.ReadFloat32 ());
                color.g = ColorComponentFromFloat (reader.ReadFloat32 ());
                color.b = ColorComponentFromFloat (reader.ReadFloat32 ());
                hasLinColor = true;
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });
        return color;
    }

    ReadPercentageChunk (reader, length)
    {
        let percentage = 0.0;
        let endByte = this.GetChunkEnd (reader, length);
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.PERCENTAGE) {
                percentage = reader.ReadUnsignedInteger16 () / 100.0;
            } else if (chunkId === CHUNK3DS.PERCENTAGE_F) {
                percentage = reader.ReadFloat32 ();
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });
        return percentage;
    }

    ReadObjectChunk (reader, length)
    {
        let endByte = this.GetChunkEnd (reader, length);
        let objectName = this.ReadName (reader);
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.OBJ_TRIMESH) {
                this.ReadMeshChunk (reader, chunkLength, objectName);
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });
    }

    ReadMeshChunk (reader, length, objectName)
    {
        function ApplyMeshTransformation (mesh, meshMatrix)
        {
            if (!meshMatrix.IsValid ()) {
                return;
            }

            let determinant = meshMatrix.Determinant ();
            let mirrorByX = IsNegative (determinant);
            if (mirrorByX) {
                let scaleMatrix = new Matrix ().CreateScale (-1.0, 1.0, 1.0);
                meshMatrix = scaleMatrix.MultiplyMatrix (meshMatrix);
            }

            let invMeshMatrix = meshMatrix.Invert ();
            if (invMeshMatrix === null) {
                return;
            }

            let transformation = new Transformation (invMeshMatrix);
            TransformMesh (mesh, transformation);
            if (mirrorByX) {
                FlipMeshTrianglesOrientation (mesh);
            }
        }

        let mesh = new Mesh ();
        mesh.SetName (objectName);

        let endByte = this.GetChunkEnd (reader, length);
        let matrixElements = null;
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.TRI_VERTEX) {
                this.ReadVerticesChunk (mesh, reader);
            } else if (chunkId === CHUNK3DS.TRI_TEXVERTEX) {
                this.ReadTextureVerticesChunk (mesh, reader);
            } else if (chunkId === CHUNK3DS.TRI_FACE) {
                this.ReadFacesChunk (mesh, reader, chunkLength);
            } else if (chunkId === CHUNK3DS.TRI_TRANSFORMATION) {
                matrixElements = this.ReadTransformationChunk (reader);
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });

        if (mesh.VertexCount () === mesh.TextureUVCount ()) {
            for (let i = 0; i < mesh.TriangleCount (); i++) {
                let triangle = mesh.GetTriangle (i);
                triangle.SetTextureUVs (
                    triangle.v0,
                    triangle.v1,
                    triangle.v2
                );
            }
        }

        let meshMatrix = new Matrix (matrixElements);
        ApplyMeshTransformation (mesh, meshMatrix);

        let meshIndex = this.model.AddMesh (mesh);
        this.meshNameToIndex.set (mesh.GetName (), meshIndex);
    }

    ReadVerticesChunk (mesh, reader)
    {
        let vertexCount = reader.ReadUnsignedInteger16 ();
        for (let i = 0; i < vertexCount; i++) {
            let x = reader.ReadFloat32 ();
            let y = reader.ReadFloat32 ();
            let z = reader.ReadFloat32 ();
            mesh.AddVertex (new Coord3D (x, y, z));
        }
    }

    ReadTextureVerticesChunk (mesh, reader)
    {
        let texVertexCount = reader.ReadUnsignedInteger16 ();
        for (let i = 0; i < texVertexCount; i++) {
            let x = reader.ReadFloat32 ();
            let y = reader.ReadFloat32 ();
            mesh.AddTextureUV (new Coord2D (x, y));
        }
    }

    ReadFacesChunk (mesh, reader, length)
    {
        let endByte = this.GetChunkEnd (reader, length);
        let faceCount = reader.ReadUnsignedInteger16 ();
        for (let i = 0; i < faceCount; i++) {
            let v0 = reader.ReadUnsignedInteger16 ();
            let v1 = reader.ReadUnsignedInteger16 ();
            let v2 = reader.ReadUnsignedInteger16 ();
            reader.ReadUnsignedInteger16 (); // flags
            mesh.AddTriangle (new Triangle (v0, v1, v2));
        }

        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.TRI_MATERIAL) {
                this.ReadFaceMaterialsChunk (mesh, reader);
            } else if (chunkId === CHUNK3DS.TRI_SMOOTH) {
                this.ReadFaceSmoothingGroupsChunk (mesh, faceCount, reader);
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });
    }

    ReadFaceMaterialsChunk (mesh, reader)
    {
        let materialName = this.ReadName (reader);
        let materialIndex = this.materialNameToIndex.get (materialName);
        let faceCount = reader.ReadUnsignedInteger16 ();
        for (let i = 0; i < faceCount; i++) {
            let faceIndex = reader.ReadUnsignedInteger16 ();
            let triangle = mesh.GetTriangle (faceIndex);
            if (materialIndex !== undefined) {
                triangle.mat = materialIndex;
            }
        }
    }

    ReadFaceSmoothingGroupsChunk (mesh, faceCount, reader)
    {
        for (let i = 0; i < faceCount; i++) {
            let smoothingGroup = reader.ReadUnsignedInteger32 ();
            let triangle = mesh.GetTriangle (i);
            triangle.curve = smoothingGroup;
        }
    }

    ReadTransformationChunk (reader)
    {
        let matrix = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                matrix.push (reader.ReadFloat32 ());
            }
            if (i < 3) {
                matrix.push (0);
            } else {
                matrix.push (1);
            }
        }
        return matrix;
    }

    ReadKeyFrameChunk (reader, length)
    {
        let endByte = this.GetChunkEnd (reader, length);
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.OBJECT_NODE) {
                this.ReadObjectNodeChunk (reader, chunkLength);
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });
    }

    BuildNodeHierarchy ()
    {
        function GetNodeTransformation (node3ds, isMeshNode)
        {
            function GetNodePosition (node3ds)
            {
                if (node3ds.positions.length === 0) {
                    return [0.0, 0.0, 0.0];
                }
                return node3ds.positions[0];
            }

            function GetNodeRotation (node3ds)
            {
                function GetQuaternionFromAxisAndAngle (axisAngle)
                {
                    let result = [0.0, 0.0, 0.0, 1.0];
                    let length = Math.sqrt (axisAngle[0] * axisAngle[0] + axisAngle[1] * axisAngle[1] + axisAngle[2] * axisAngle[2]);
                    if (length > 0.0) {
                        let omega = axisAngle[3] * -0.5;
                        let si = Math.sin (omega) / length;
                        result = [si * axisAngle[0], si * axisAngle[1], si * axisAngle[2], Math.cos (omega)];
                    }
                    return result;
                }

                if (node3ds.rotations.length === 0) {
                    return [0.0, 0.0, 0.0, 1.0];
                }

                let rotation = node3ds.rotations[0];
                return GetQuaternionFromAxisAndAngle (rotation);
            }

            function GetNodeScale (node3ds)
            {
                if (node3ds.scales.length === 0) {
                    return [1.0, 1.0, 1.0];
                }
                return node3ds.scales[0];
            }

            let matrix = new Matrix ();
            matrix.ComposeTRS (
                ArrayToCoord3D (GetNodePosition (node3ds)),
                ArrayToQuaternion (GetNodeRotation (node3ds)),
                ArrayToCoord3D (GetNodeScale (node3ds))
            );

            if (isMeshNode) {
                let pivotPoint = node3ds.pivot;
                let pivotMatrix = new Matrix ().CreateTranslation (-pivotPoint[0], -pivotPoint[1], -pivotPoint[2]);
                matrix = pivotMatrix.MultiplyMatrix (matrix);
            }

            return new Transformation (matrix);
        }

        let rootNode = this.model.GetRootNode ();
        if (this.nodeList.IsEmpty ()) {
            for (let meshIndex = 0; meshIndex < this.model.MeshCount (); meshIndex++) {
                rootNode.AddMeshIndex (meshIndex);
            }
        } else {
            let nodeIdToModelNode = new Map ();
            for (let node3ds of this.nodeList.GetNodes ()) {
                let node = new Node ();
                if (node3ds.name.length > 0 && node3ds.name !== '$$$DUMMY') {
                    node.SetName (node3ds.name);
                    if (node3ds.instanceName.length > 0) {
                        node.SetName (node.GetName () + ' ' + node3ds.instanceName);
                    }
                }
                if (node3ds.parentId === 65535 || !nodeIdToModelNode.has (node3ds.parentId)) {
                    rootNode.AddChildNode (node);
                } else {
                    let parentNode = nodeIdToModelNode.get (node3ds.parentId);
                    parentNode.AddChildNode (node);
                }
                nodeIdToModelNode.set (node3ds.id, node);
                let isMeshNode = this.meshNameToIndex.has (node3ds.name);
                node.SetTransformation (GetNodeTransformation (node3ds, isMeshNode));
                if (isMeshNode) {
                    node.AddMeshIndex (this.meshNameToIndex.get (node3ds.name));
                }
            }
        }
    }

    ReadObjectNodeChunk (reader, length)
    {
        function ReadTrackVector (obj, reader, type)
        {
            let result = [];
            reader.Skip (10);

            let keyNum = reader.ReadInteger32 ();
            for (let i = 0; i < keyNum; i++) {
                reader.ReadInteger32 ();
                let flags = reader.ReadUnsignedInteger16 ();
                if (flags !== 0) {
                    reader.ReadFloat32 ();
                }

                let current = null;
                if (type === CHUNK3DS.OBJECT_ROTATION) {
                    let tmp = reader.ReadFloat32 ();
                    current = obj.ReadVector (reader);
                    current[3] = tmp;
                } else {
                    current = obj.ReadVector (reader);
                }
                result.push (current);
            }

            return result;
        }

        let node3ds = new Importer3dsNode ();
        let endByte = this.GetChunkEnd (reader, length);
        this.ReadChunks (reader, endByte, (chunkId, chunkLength) => {
            if (chunkId === CHUNK3DS.OBJECT_HIERARCHY) {
                node3ds.name = this.ReadName (reader);
                node3ds.flags = reader.ReadUnsignedInteger32 ();
                node3ds.parentId = reader.ReadUnsignedInteger16 ();
            } else if (chunkId === CHUNK3DS.OBJECT_INSTANCE_NAME) {
                node3ds.instanceName = this.ReadName (reader);
            } else if (chunkId === CHUNK3DS.OBJECT_PIVOT) {
                node3ds.pivot = this.ReadVector (reader);
            } else if (chunkId === CHUNK3DS.OBJECT_POSITION) {
                node3ds.positions = ReadTrackVector (this, reader, CHUNK3DS.OBJECT_POSITION);
            } else if (chunkId === CHUNK3DS.OBJECT_ROTATION) {
                node3ds.rotations = ReadTrackVector (this, reader, CHUNK3DS.OBJECT_ROTATION);
            } else if (chunkId === CHUNK3DS.OBJECT_SCALE) {
                node3ds.scales = ReadTrackVector (this, reader, CHUNK3DS.OBJECT_SCALE);
            } else if (chunkId === CHUNK3DS.OBJECT_ID) {
                node3ds.id = reader.ReadUnsignedInteger16 ();
            } else {
                this.SkipChunk (reader, chunkLength);
            }
        });

        this.nodeList.AddNode (node3ds);
    }

    ReadName (reader)
    {
        let name = '';
        let char = 0;
        let count = 0;
        while (count < 64) {
            char = reader.ReadCharacter8 ();
            if (char === 0) {
                break;
            }
            name = name + String.fromCharCode (char);
            count = count + 1;
        }
        return name;
    }

    ReadVector (reader)
    {
        let result = [
            reader.ReadFloat32 (),
            reader.ReadFloat32 (),
            reader.ReadFloat32 ()
        ];
        return result;
    }

    ReadChunks (reader, endByte, onChunk)
    {
        while (reader.GetPosition () <= endByte - 6) {
        let chunkId = reader.ReadUnsignedInteger16 ();
            let chunkLength = reader.ReadUnsignedInteger32 ();
            onChunk (chunkId, chunkLength);
        }
    }

    GetChunkEnd (reader, length)
    {
        return reader.GetPosition () + length - 6;
    }

    SkipChunk (reader, length)
    {
        reader.Skip (length - 6);
    }
}

const GltfComponentType =
{
    BYTE : 5120,
    UNSIGNED_BYTE : 5121,
    SHORT : 5122,
    UNSIGNED_SHORT : 5123,
    UNSIGNED_INT : 5125,
    FLOAT : 5126
};

const GltfDataType =
{
    SCALAR : 0,
    VEC2 : 1,
    VEC3 : 2,
    VEC4 : 3,
    MAT2 : 4,
    MAT3  : 5,
    MAT4  : 6
};

const GltfRenderMode =
{
    POINTS : 0,
    LINES : 1,
    LINE_LOOP : 2,
    LINE_STRIP : 3,
    TRIANGLES : 4,
    TRIANGLE_STRIP  : 5,
    TRIANGLE_FAN : 6
};

const GltfConstants =
{
    GLTF_STRING : 0x46546C67,
    JSON_CHUNK_TYPE : 0x4E4F534A,
    BINARY_CHUNK_TYPE : 0x004E4942
};

function GetGltfColor (color)
{
    return RGBColorFromFloatComponents (
        LinearToSRGB (color[0]),
        LinearToSRGB (color[1]),
        LinearToSRGB (color[2])
    );
}

function GetGltfVertexColor (color, componentType)
{
    function GetColorComponent (component, componentType)
    {
        let normalized = component;
        if (componentType === GltfComponentType.UNSIGNED_BYTE) {
            normalized /= 255.0;
        } else if (componentType === GltfComponentType.UNSIGNED_SHORT) {
            normalized /= 65535.0;
        }
        return ColorComponentFromFloat (LinearToSRGB (normalized));
    }

    return new RGBColor (
        GetColorComponent (color[0], componentType),
        GetColorComponent (color[1], componentType),
        GetColorComponent (color[2], componentType)
    );
}

class GltfBufferReader
{
    constructor (buffer)
    {
        this.reader = new BinaryReader (buffer, true);
        this.componentType = null;
        this.dataType = null;
        this.byteStride = null;
        this.dataCount = null;
        this.sparseReader = null;
    }

    SetComponentType (componentType)
    {
        this.componentType = componentType;
    }

    SetDataType (dataType)
    {
        if (dataType === 'SCALAR') {
            this.dataType = GltfDataType.SCALAR;
        } else if (dataType === 'VEC2') {
            this.dataType = GltfDataType.VEC2;
        } else if (dataType === 'VEC3') {
            this.dataType = GltfDataType.VEC3;
        } else if (dataType === 'VEC4') {
            this.dataType = GltfDataType.VEC4;
        } else if (dataType === 'MAT2') {
            this.dataType = GltfDataType.MAT2;
        } else if (dataType === 'MAT3') {
            this.dataType = GltfDataType.MAT3;
        } else if (dataType === 'MAT4') {
            this.dataType = GltfDataType.MAT4;
        }
    }

    SetByteStride (byteStride)
    {
        this.byteStride = byteStride;
    }

    SetDataCount (dataCount)
    {
        this.dataCount = dataCount;
    }

    SetSparseReader (indexReader, valueReader)
    {
        this.sparseReader = {
            indexReader : indexReader,
            valueReader : valueReader
        };
    }

    ReadArrayBuffer (byteLength)
    {
        return this.reader.ReadArrayBuffer (byteLength);
    }

    GetDataCount ()
    {
        return this.dataCount;
    }

    ReadData ()
    {
        if (this.dataType === null) {
            return null;
        }
        if (this.dataType === GltfDataType.SCALAR) {
            let data = this.ReadComponent ();
            this.SkipBytesByStride (1);
            return data;
        } else if (this.dataType === GltfDataType.VEC2) {
            let x = this.ReadComponent ();
            let y = this.ReadComponent ();
            this.SkipBytesByStride (2);
            return new Coord2D (x, y);
        } else if (this.dataType === GltfDataType.VEC3) {
            let x = this.ReadComponent ();
            let y = this.ReadComponent ();
            let z = this.ReadComponent ();
            this.SkipBytesByStride (3);
            return new Coord3D (x, y, z);
        } else if (this.dataType === GltfDataType.VEC4) {
            let x = this.ReadComponent ();
            let y = this.ReadComponent ();
            let z = this.ReadComponent ();
            let w = this.ReadComponent ();
            this.SkipBytesByStride (4);
            return new Coord4D (x, y, z, w);
        }
        return null;
    }

    EnumerateData (onData)
    {
        if (this.sparseReader === null) {
            for (let i = 0; i < this.dataCount; i++) {
                onData (this.ReadData ());
            }
        } else {
            let sparseData = [];
            for (let i = 0; i < this.sparseReader.indexReader.GetDataCount (); i++) {
                let index = this.sparseReader.indexReader.ReadData ();
                let value = this.sparseReader.valueReader.ReadData ();
                sparseData.push ({
                    index : index,
                    value : value
                });
            }
            let sparseIndex = 0;
            for (let i = 0; i < this.dataCount; i++) {
                let data = this.ReadData ();
                if (sparseIndex < sparseData.length && sparseData[sparseIndex].index === i) {
                    onData (sparseData[sparseIndex].value);
                    sparseIndex += 1;
                } else {
                    onData (data);
                }
            }
        }
    }

    SkipBytes (bytes)
    {
        this.reader.Skip (bytes);
    }

    ReadComponent ()
    {
        if (this.componentType === null) {
            return null;
        }
        if (this.componentType === GltfComponentType.BYTE) {
            return this.reader.ReadCharacter8 ();
        } else if (this.componentType === GltfComponentType.UNSIGNED_BYTE) {
            return this.reader.ReadUnsignedCharacter8 ();
        } else if (this.componentType === GltfComponentType.SHORT) {
            return this.reader.ReadInteger16 ();
        } else if (this.componentType === GltfComponentType.UNSIGNED_SHORT) {
            return this.reader.ReadUnsignedInteger16 ();
        } else if (this.componentType === GltfComponentType.UNSIGNED_INT) {
            return this.reader.ReadInteger32 ();
        } else if (this.componentType === GltfComponentType.FLOAT) {
            return this.reader.ReadFloat32 ();
        }
        return null;
    }

    SkipBytesByStride (componentCount)
    {
        if (this.byteStride === null) {
            return;
        }
        let readBytes = componentCount * this.GetComponentSize ();
        this.reader.Skip (this.byteStride - readBytes);
    }

    GetComponentSize ()
    {
        if (this.componentType === GltfComponentType.BYTE) {
            return 1;
        } else if (this.componentType === GltfComponentType.UNSIGNED_BYTE) {
            return 1;
        } else if (this.componentType === GltfComponentType.SHORT) {
            return 2;
        } else if (this.componentType === GltfComponentType.UNSIGNED_SHORT) {
            return 2;
        } else if (this.componentType === GltfComponentType.UNSIGNED_INT) {
            return 4;
        } else if (this.componentType === GltfComponentType.FLOAT) {
            return 4;
        }
        return 0;
    }
}

class GltfExtensions
{
    constructor ()
    {
        this.supportedExtensions = [
            'KHR_draco_mesh_compression',
            'KHR_materials_pbrSpecularGlossiness',
            'KHR_texture_transform',
        ];
        this.draco = null;
    }

    LoadLibraries (extensionsRequired, callbacks)
    {
        if (extensionsRequired === undefined) {
            callbacks.onSuccess ();
            return;
        }
        if (this.draco === null && extensionsRequired.indexOf ('KHR_draco_mesh_compression') !== -1) {
			LoadExternalLibrary ('loaders/draco_decoder.js').then (() => {
                DracoDecoderModule ().then ((draco) => {
                    this.draco = draco;
                    callbacks.onSuccess ();
                });
            }).catch (() => {
                callbacks.onError ('Failed to load draco decoder.');
            });
        } else {
            callbacks.onSuccess ();
        }
    }

    GetUnsupportedExtensions (extensionsRequired)
    {
        let unsupportedExtensions = [];
        if (extensionsRequired === undefined) {
            return unsupportedExtensions;
        }
        for (let i = 0; i < extensionsRequired.length; i++) {
            let requiredExtension = extensionsRequired[i];
            if (this.supportedExtensions.indexOf (requiredExtension) === -1) {
                unsupportedExtensions.push (requiredExtension);
            }
        }
        return unsupportedExtensions;
    }

    ProcessMaterial (gltfMaterial, material, imporTextureFn)
    {
        if (gltfMaterial.extensions === undefined) {
            return null;
        }

        let khrSpecularGlossiness = gltfMaterial.extensions.KHR_materials_pbrSpecularGlossiness;
        if (khrSpecularGlossiness === undefined) {
            return null;
        }

        let phongMaterial = new PhongMaterial ();
        let diffuseColor = khrSpecularGlossiness.diffuseFactor;
        if (diffuseColor !== undefined) {
            phongMaterial.color = GetGltfColor (diffuseColor);
            phongMaterial.opacity = diffuseColor[3];
        }
        let diffuseTexture = khrSpecularGlossiness.diffuseTexture;
        if (diffuseTexture !== undefined) {
            phongMaterial.diffuseMap = imporTextureFn (diffuseTexture);
        }
        let specularColor = khrSpecularGlossiness.specularFactor;
        if (specularColor !== undefined) {
            phongMaterial.specular = GetGltfColor (specularColor);
        }
        let specularTexture = khrSpecularGlossiness.specularGlossinessTexture;
        if (specularTexture !== undefined) {
            phongMaterial.specularMap = imporTextureFn (specularTexture);
        }
        let glossiness = khrSpecularGlossiness.glossinessFactor;
        if (glossiness !== undefined) {
            phongMaterial.shininess = glossiness;
        }

        return phongMaterial;
    }

    ProcessTexture (gltfTexture, texture)
    {
        if (gltfTexture.extensions === undefined) {
            return;
        }
        let khrTextureTransform = gltfTexture.extensions.KHR_texture_transform;
        if (khrTextureTransform !== undefined) {
            if (khrTextureTransform.offset !== undefined) {
                texture.offset.x = khrTextureTransform.offset[0];
                texture.offset.y = -khrTextureTransform.offset[1];
            }
            if (khrTextureTransform.scale !== undefined) {
                texture.scale.x = khrTextureTransform.scale[0];
                texture.scale.y = khrTextureTransform.scale[1];
            }
            if (khrTextureTransform.rotation !== undefined) {
                texture.rotation = -khrTextureTransform.rotation;
            }
        }
    }

    ProcessPrimitive (importer, gltf, primitive, mesh)
    {
        function EnumerateComponents (draco, decoder, dracoMesh, attributeId, processor)
        {
            let attribute = decoder.GetAttributeByUniqueId (dracoMesh, attributeId);
            let numComponents = attribute.num_components ();
            let numPoints = dracoMesh.num_points ();
            let numValues = numPoints * numComponents;
            let dataSize = numValues * 4;
            let attributePtr = draco._malloc (dataSize);
            decoder.GetAttributeDataArrayForAllPoints (dracoMesh, attribute, draco.DT_FLOAT32, dataSize, attributePtr);
            let attributeArray = new Float32Array (draco.HEAPF32.buffer, attributePtr, numValues).slice ();
            if (numComponents === 2) {
                for (let i = 0; i < attributeArray.length; i += 2) {
                    processor (new Coord2D (
                        attributeArray[i + 0],
                        attributeArray[i + 1]
                    ));
                }
            } else if (numComponents === 3) {
                for (let i = 0; i < attributeArray.length; i += 3) {
                    processor (new Coord3D (
                        attributeArray[i + 0],
                        attributeArray[i + 1],
                        attributeArray[i + 2]
                    ));
                }
            } else if (numComponents === 4) {
                for (let i = 0; i < attributeArray.length; i += 4) {
                    processor (new Coord4D (
                        attributeArray[i + 0],
                        attributeArray[i + 1],
                        attributeArray[i + 2],
                        attributeArray[i + 3]
                    ));
                }
            }
            draco._free (attributePtr);
        }

        if (this.draco === null) {
            return false;
        }

        if (primitive.extensions === undefined || primitive.extensions.KHR_draco_mesh_compression === undefined) {
            return false;
        }

        let decoder = new this.draco.Decoder ();
        let decoderBuffer = new this.draco.DecoderBuffer ();

        let extensionParams = primitive.extensions.KHR_draco_mesh_compression;
        let compressedBufferView = gltf.bufferViews[extensionParams.bufferView];
        let compressedReader = importer.GetReaderFromBufferView (compressedBufferView);
        let compressedArrayBuffer = compressedReader.ReadArrayBuffer (compressedBufferView.byteLength);
        decoderBuffer.Init (new Int8Array (compressedArrayBuffer), compressedArrayBuffer.byteLength);
        let geometryType = decoder.GetEncodedGeometryType (decoderBuffer);
        if (geometryType !== this.draco.TRIANGULAR_MESH) {
            return true;
        }

        let dracoMesh = new this.draco.Mesh ();
        let decodingStatus = decoder.DecodeBufferToMesh (decoderBuffer, dracoMesh);
        if (!decodingStatus.ok ()) {
            return true;
        }

        let hasVertices = (extensionParams.attributes.POSITION !== undefined);
        let hasVertexColors = false;
        let hasNormals = (extensionParams.attributes.NORMAL !== undefined);
        let hasUVs = (extensionParams.attributes.TEXCOORD_0 !== undefined);

        if (!hasVertices) {
            return true;
        }

        let vertexOffset = mesh.VertexCount ();
        let vertexColorOffset = mesh.VertexColorCount ();
        let normalOffset = mesh.NormalCount ();
        let uvOffset = mesh.TextureUVCount ();

        EnumerateComponents (this.draco, decoder, dracoMesh, extensionParams.attributes.POSITION, (vertex) => {
            mesh.AddVertex (vertex);
        });

        if (hasNormals) {
            EnumerateComponents (this.draco, decoder, dracoMesh, extensionParams.attributes.NORMAL, (normal) => {
                mesh.AddNormal (normal);
            });
        }

        if (hasUVs) {
            EnumerateComponents (this.draco, decoder, dracoMesh, extensionParams.attributes.TEXCOORD_0, (uv) => {
                uv.y = -uv.y;
                mesh.AddTextureUV (uv);
            });
        }

        let faceCount = dracoMesh.num_faces ();
        let indexCount = faceCount * 3;
        let indexDataSize = indexCount * 4;
        let indexDataPtr = this.draco._malloc (indexDataSize);
        decoder.GetTrianglesUInt32Array (dracoMesh, indexDataSize, indexDataPtr);
        let indexArray = new Uint32Array (this.draco.HEAPU32.buffer, indexDataPtr, indexCount).slice ();
        for (let i = 0; i < indexArray.length; i += 3) {
            let v0 = indexArray[i];
            let v1 = indexArray[i + 1];
            let v2 = indexArray[i + 2];
            importer.AddTriangle (primitive, mesh, v0, v1, v2, hasVertexColors, hasNormals, hasUVs, vertexOffset, vertexColorOffset, normalOffset, uvOffset);
        }
        this.draco._free (indexDataPtr);

        return true;
    }
}

class ImporterGltf extends ImporterBase
{
    constructor ()
    {
        super ();
        this.gltfExtensions = new GltfExtensions ();
    }

    CanImportExtension (extension)
    {
        return extension === 'gltf' || extension === 'glb';
    }

    GetUpDirection ()
    {
        return Direction.Y;
    }

    ClearContent ()
    {
        this.bufferContents = null;
        this.imageIndexToTextureParams = null;
    }

    ResetContent ()
    {
        this.bufferContents = [];
        this.imageIndexToTextureParams = new Map ();
    }

    ImportContent (fileContent, onFinish)
    {
        if (this.extension === 'gltf') {
            this.ProcessGltf (fileContent, onFinish);
        } else if (this.extension === 'glb') {
            this.ProcessBinaryGltf (fileContent, onFinish);
        }
    }

    ProcessGltf (fileContent, onFinish)
    {
        let textContent = ArrayBufferToUtf8String (fileContent);
        let gltf = JSON.parse (textContent);
        if (gltf.asset.version !== '2.0') {
            this.SetError ('Invalid glTF version.');
            onFinish ();
            return;
        }

        for (let i = 0; i < gltf.buffers.length; i++) {
            let buffer = null;
            let gltfBuffer = gltf.buffers[i];
            let base64Buffer = Base64DataURIToArrayBuffer (gltfBuffer.uri);
            if (base64Buffer !== null) {
                buffer = base64Buffer.buffer;
            } else {
                let fileBuffer = this.callbacks.getFileBuffer (gltfBuffer.uri);
                if (fileBuffer !== null) {
                    buffer = fileBuffer;
                }
            }
            if (buffer === null) {
                this.SetError ('One of the requested buffers is missing.');
                onFinish ();
                return;
            }
            this.bufferContents.push (buffer);
        }

        this.ProcessMainFile (gltf, onFinish);
    }

    ProcessBinaryGltf (fileContent, onFinish)
    {
        function ReadChunk (reader)
        {
            let length = reader.ReadUnsignedInteger32 ();
            let type = reader.ReadUnsignedInteger32 ();
            let buffer = reader.ReadArrayBuffer (length);
            return {
                type : type,
                buffer : buffer
            };
        }

        let reader = new BinaryReader (fileContent, true);
        let magic = reader.ReadUnsignedInteger32 ();
        if (magic !== GltfConstants.GLTF_STRING) {
            this.SetError ('Invalid glTF file.');
            onFinish ();
            return;
        }
        let version = reader.ReadUnsignedInteger32 ();
        if (version !== 2) {
            this.SetError ('Invalid glTF version.');
            onFinish ();
            return;
        }
        let length = reader.ReadUnsignedInteger32 ();
        if (length !== reader.GetByteLength ()) {
            this.SetError ('Invalid glTF file.');
            onFinish ();
            return;
        }

        let gltfTextContent = null;
        while (!reader.End ()) {
            let chunk = ReadChunk (reader);
            if (chunk.type === GltfConstants.JSON_CHUNK_TYPE) {
                gltfTextContent = ArrayBufferToUtf8String (chunk.buffer);
            } else if (chunk.type === GltfConstants.BINARY_CHUNK_TYPE) {
                this.bufferContents.push (chunk.buffer);
            }
        }

        if (gltfTextContent !== null) {
            let gltf = JSON.parse (gltfTextContent);
            this.ProcessMainFile (gltf, onFinish);
        }
    }

    ProcessMainFile (gltf, onFinish)
    {
        let unsupportedExtensions = this.gltfExtensions.GetUnsupportedExtensions (gltf.extensionsRequired);
        if (unsupportedExtensions.length > 0) {
            this.SetError ('Unsupported extension: ' + unsupportedExtensions.join (', ') + '.');
            onFinish ();
            return;
        }

        this.gltfExtensions.LoadLibraries (gltf.extensionsRequired, {
            onSuccess : () => {
                this.ImportModel (gltf);
                onFinish ();
            },
            onError : (message) => {
                this.SetError (message);
                onFinish ();
            }
        });
    }

    ImportModel (gltf)
    {
        let materials = gltf.materials;
        if (materials !== undefined) {
            for (let material of materials) {
                this.ImportMaterial (gltf, material);
            }
        }

        let meshes = gltf.meshes;
        if (meshes !== undefined) {
            for (let mesh of meshes) {
                this.ImportMesh (gltf, mesh);
            }
        }

        this.ImportProperties (this.model, gltf.asset, 'Asset properties');
        this.ImportScene (gltf);
    }

    ImportProperties (modelObject, gltfObject, propertyGroupName)
    {
        if (gltfObject === undefined || gltfObject === null) {
            return;
        }

        let propertyGroup = new PropertyGroup (propertyGroupName);
        for (let propertyName in gltfObject) {
            if (Object.prototype.hasOwnProperty.call (gltfObject, propertyName)) {
                let property = null;
                let propertyValue = gltfObject[propertyName];
                if (typeof propertyValue === 'string') {
                    property = new Property (PropertyType.Text, propertyName, propertyValue);
                } else if (typeof propertyValue === 'number') {
                    if (Number.isInteger (propertyValue)) {
                        property = new Property (PropertyType.Integer, propertyName, propertyValue);
                    } else {
                        property = new Property (PropertyType.Number, propertyName, propertyValue);
                    }
                }
                if (property !== null) {
                    propertyGroup.AddProperty (property);
                }
            }
        }

        if (propertyGroup.PropertyCount () === 0) {
            return;
        }

        modelObject.AddPropertyGroup (propertyGroup);
    }

    GetDefaultScene (gltf)
    {
        let defaultSceneIndex = gltf.scene || 0;
        if (defaultSceneIndex >= gltf.scenes.length) {
            return null;
        }
        return gltf.scenes[defaultSceneIndex];
    }

    ImportMaterial (gltf, gltfMaterial)
    {
        let material = new PhysicalMaterial ();
        if (gltfMaterial.name !== undefined) {
            material.name = gltfMaterial.name;
        }

        material.color = GetGltfColor ([1.0, 1.0, 1.0]);
        if (gltfMaterial.pbrMetallicRoughness !== undefined) {
            let baseColor = gltfMaterial.pbrMetallicRoughness.baseColorFactor;
            if (baseColor !== undefined) {
                material.color = GetGltfColor (baseColor);
                material.opacity = baseColor[3];
            }
            let metallicFactor = gltfMaterial.pbrMetallicRoughness.metallicFactor;
            if (metallicFactor !== undefined) {
                material.metalness = metallicFactor;
            }
            let roughnessFactor = gltfMaterial.pbrMetallicRoughness.roughnessFactor;
            if (roughnessFactor !== undefined) {
                material.roughness = roughnessFactor;
            }
            let emissiveColor = gltfMaterial.emissiveFactor;
            if (emissiveColor !== undefined) {
                material.emissive = GetGltfColor (emissiveColor);
            }

            material.diffuseMap = this.ImportTexture (gltf, gltfMaterial.pbrMetallicRoughness.baseColorTexture);
            material.metalnessMap = this.ImportTexture (gltf, gltfMaterial.pbrMetallicRoughness.metallicRoughnessTexture);
            material.normalMap = this.ImportTexture (gltf, gltfMaterial.normalTexture);
            material.emissiveMap = this.ImportTexture (gltf, gltfMaterial.emissiveTexture);
            if (material.diffuseMap !== null) {
                material.multiplyDiffuseMap = true;
            }

            let alphaMode = gltfMaterial.alphaMode;
            if (alphaMode !== undefined) {
                if (alphaMode === 'BLEND') {
                    material.transparent = true;
                } else if (alphaMode === 'MASK') {
                    material.transparent = true;
                    material.alphaTest = gltfMaterial.alphaCutoff || 0.5;
                }
            }
        }

        let newMaterial = this.gltfExtensions.ProcessMaterial (gltfMaterial, material, (textureRef) => {
            return this.ImportTexture (gltf, textureRef);
        });
        if (newMaterial !== null) {
            material = newMaterial;
        }
        this.model.AddMaterial (material);
    }

    ImportTexture (gltf, gltfTextureRef)
    {
        if (gltfTextureRef === undefined || gltfTextureRef === null) {
            return null;
        }

        let texture = new TextureMap ();
        let gltfTexture = gltf.textures[gltfTextureRef.index];
        let gltfImageIndex = gltfTexture.source;
        let gltfImage = gltf.images[gltfImageIndex];

        let textureParams = null;
        if (this.imageIndexToTextureParams.has (gltfImageIndex)) {
            textureParams = this.imageIndexToTextureParams.get (gltfImageIndex);
        } else {
            textureParams = {
                name : null,
                mimeType : null,
                buffer : null
            };
            let textureIndexString = gltfImageIndex.toString ();
            if (gltfImage.uri !== undefined) {
                let base64Buffer = Base64DataURIToArrayBuffer (gltfImage.uri);
                if (base64Buffer !== null) {
                    textureParams.name = 'Embedded_' + textureIndexString + '.' + GetFileExtensionFromMimeType (base64Buffer.mimeType);
                    textureParams.mimeType = base64Buffer.mimeType;
                    textureParams.buffer = base64Buffer.buffer;
                } else {
                    let textureBuffer = this.callbacks.getFileBuffer (gltfImage.uri);
                    textureParams.name = gltfImage.uri;
                    textureParams.buffer = textureBuffer;
                }
            } else if (gltfImage.bufferView !== undefined) {
                let bufferView = gltf.bufferViews[gltfImage.bufferView];
                let reader = this.GetReaderFromBufferView (bufferView);
                if (reader !== null) {
                    let buffer = reader.ReadArrayBuffer (bufferView.byteLength);
                    textureParams.name = 'Binary_' + textureIndexString + '.' + GetFileExtensionFromMimeType (gltfImage.mimeType);
                    textureParams.mimeType = gltfImage.mimeType;
                    textureParams.buffer = buffer;
                }
            }
            this.imageIndexToTextureParams.set (gltfImageIndex, textureParams);
        }

        texture.name = textureParams.name;
        texture.mimeType = textureParams.mimeType;
        texture.buffer = textureParams.buffer;

        this.gltfExtensions.ProcessTexture (gltfTextureRef, texture);
        return texture;
    }

    ImportMesh (gltf, gltfMesh)
    {
        let mesh = new Mesh ();

        this.model.AddMesh (mesh);
        if (gltfMesh.name !== undefined) {
            mesh.SetName (gltfMesh.name);
        }

        for (let i = 0; i < gltfMesh.primitives.length; i++) {
            let primitive = gltfMesh.primitives[i];
            this.ImportPrimitive (gltf, primitive, mesh);
        }

        this.ImportProperties (mesh, gltfMesh.extras, 'Mesh properties');
    }

    ImportPrimitive (gltf, primitive, mesh)
    {
        function HasAttribute (gltf, primitive, attributeName)
        {
            let accessorIndex = primitive.attributes[attributeName];
            if (accessorIndex === undefined) {
                return false;
            }
            let accessor = gltf.accessors[accessorIndex];
            if (accessor === undefined || accessor.count === 0) {
                return false;
            }
            return true;
        }

        if (this.gltfExtensions.ProcessPrimitive (this, gltf, primitive, mesh)) {
            return;
        }

        if (primitive.attributes === undefined) {
            return;
        }

        let hasVertices = HasAttribute (gltf, primitive, 'POSITION');
        let hasVertexColors = HasAttribute (gltf, primitive, 'COLOR_0');
        let hasNormals = HasAttribute (gltf, primitive, 'NORMAL');
        let hasUVs = HasAttribute (gltf, primitive, 'TEXCOORD_0');
        let hasIndices = (primitive.indices !== undefined);

        let mode = GltfRenderMode.TRIANGLES;
        if (primitive.mode !== undefined) {
            mode = primitive.mode;
        }
        if (mode !== GltfRenderMode.TRIANGLES && mode !== GltfRenderMode.TRIANGLE_STRIP && mode !== GltfRenderMode.TRIANGLE_FAN) {
            return;
        }

        let vertexOffset = mesh.VertexCount ();
        let vertexColorOffset = mesh.VertexColorCount ();
        let normalOffset = mesh.NormalCount ();
        let uvOffset = mesh.TextureUVCount ();

        if (hasVertices) {
            let accessor = gltf.accessors[primitive.attributes.POSITION];
            let reader = this.GetReaderFromAccessor (gltf, accessor);
            if (reader === null) {
                return;
            }
            reader.EnumerateData ((data) => {
                mesh.AddVertex (data);
            });
        } else {
            return;
        }

        let vertexCount = mesh.VertexCount () - vertexOffset;

        if (hasVertexColors) {
            let accessor = gltf.accessors[primitive.attributes.COLOR_0];
            let reader = this.GetReaderFromAccessor (gltf, accessor);
            if (reader === null) {
                return;
            }
            reader.EnumerateData ((data) => {
                let color = GetGltfVertexColor ([data.x, data.y, data.z], reader.componentType);
                mesh.AddVertexColor (color);
            });
            if (mesh.VertexColorCount () - vertexColorOffset !== vertexCount) {
                hasVertexColors = false;
            }
        }

        if (hasNormals) {
            let accessor = gltf.accessors[primitive.attributes.NORMAL];
            let reader = this.GetReaderFromAccessor (gltf, accessor);
            if (reader === null) {
                return;
            }
            reader.EnumerateData ((data) => {
                mesh.AddNormal (data);
            });
            if (mesh.NormalCount () - normalOffset !== vertexCount) {
                hasNormals = false;
            }
        }

        if (hasUVs) {
            let accessor = gltf.accessors[primitive.attributes.TEXCOORD_0];
            let reader = this.GetReaderFromAccessor (gltf, accessor);
            if (reader === null) {
                return;
            }
            reader.EnumerateData ((data) => {
                data.y = -data.y;
                mesh.AddTextureUV (data);
            });
            if (mesh.TextureUVCount () - uvOffset !== vertexCount) {
                hasUVs = false;
            }
        }

        let vertexIndices = [];
        if (hasIndices) {
            let accessor = gltf.accessors[primitive.indices];
            let reader = this.GetReaderFromAccessor (gltf, accessor);
            if (reader === null) {
                return;
            }
            reader.EnumerateData ((data) => {
                vertexIndices.push (data);
            });
        } else {
            let primitiveVertexCount = mesh.VertexCount () - vertexOffset;
            for (let i = 0; i < primitiveVertexCount; i++) {
                vertexIndices.push (i);
            }
        }

        if (mode === GltfRenderMode.TRIANGLES) {
            for (let i = 0; i < vertexIndices.length; i += 3) {
                let v0 = vertexIndices[i];
                let v1 = vertexIndices[i + 1];
                let v2 = vertexIndices[i + 2];
                this.AddTriangle (primitive, mesh, v0, v1, v2, hasVertexColors, hasNormals, hasUVs, vertexOffset, vertexColorOffset, normalOffset, uvOffset);
            }
        } else if (mode === GltfRenderMode.TRIANGLE_STRIP) {
            for (let i = 0; i < vertexIndices.length - 2; i++) {
                let v0 = vertexIndices[i];
                let v1 = vertexIndices[i + 1];
                let v2 = vertexIndices[i + 2];
                if (i % 2 === 1) {
                    let tmp = v1;
                    v1 = v2;
                    v2 = tmp;
                }
                this.AddTriangle (primitive, mesh, v0, v1, v2, hasVertexColors, hasNormals, hasUVs, vertexOffset, vertexColorOffset, normalOffset, uvOffset);
            }
        } else if (mode === GltfRenderMode.TRIANGLE_FAN) {
            for (let i = 1; i < vertexIndices.length - 1; i++) {
                let v0 = vertexIndices[0];
                let v1 = vertexIndices[i];
                let v2 = vertexIndices[i + 1];
                this.AddTriangle (primitive, mesh, v0, v1, v2, hasVertexColors, hasNormals, hasUVs, vertexOffset, vertexColorOffset, normalOffset, uvOffset);
            }
        }
    }

    AddTriangle (primitive, mesh, v0, v1, v2, hasVertexColors, hasNormals, hasUVs, vertexOffset, vertexColorOffset, normalOffset, uvOffset)
    {
        let triangle = new Triangle (
            vertexOffset + v0,
            vertexOffset + v1,
            vertexOffset + v2
        );
        if (hasVertexColors) {
            triangle.SetVertexColors (
                vertexColorOffset + v0,
                vertexColorOffset + v1,
                vertexColorOffset + v2
            );
        }
        if (hasNormals) {
            triangle.SetNormals (
                normalOffset + v0,
                normalOffset + v1,
                normalOffset + v2
            );
        }
        if (hasUVs) {
            triangle.SetTextureUVs (
                uvOffset + v0,
                uvOffset + v1,
                uvOffset + v2
            );
        }
        if (primitive.material !== undefined) {
            triangle.mat = primitive.material;
        }
        mesh.AddTriangle (triangle);
    }

    ImportScene (gltf)
    {
        let scene = this.GetDefaultScene (gltf);
        if (scene === null) {
            return;
        }

        let rootNode = this.model.GetRootNode ();
        for (let nodeIndex of scene.nodes) {
            let gltfNode = gltf.nodes[nodeIndex];
            this.ImportNode (gltf, gltfNode, rootNode);
        }

        this.ImportProperties (this.model, scene.extras, 'Scene properties');
    }

    ImportNode (gltf, gltfNode, parentNode)
    {
        function GetNodeTransformation (gltfNode)
        {
            let matrix = new Matrix ().CreateIdentity ();
            if (gltfNode.matrix !== undefined) {
                matrix.Set (gltfNode.matrix);
            } else {
                let translation = [0.0, 0.0, 0.0];
                let rotation = [0.0, 0.0, 0.0, 1.0];
                let scale = [1.0, 1.0, 1.0];
                if (gltfNode.translation !== undefined) {
                    translation = gltfNode.translation;
                }
                if (gltfNode.rotation !== undefined) {
                    rotation = gltfNode.rotation;
                }
                if (gltfNode.scale !== undefined) {
                    scale = gltfNode.scale;
                }
                matrix.ComposeTRS (
                    ArrayToCoord3D (translation),
                    ArrayToQuaternion (rotation),
                    ArrayToCoord3D (scale)
                );
            }
            return new Transformation (matrix);
        }

        if (gltfNode.children === undefined && gltfNode.mesh === undefined) {
            return;
        }

        let node = new Node ();
        if (gltfNode.name !== undefined) {
            node.SetName (gltfNode.name);
        }
        node.SetTransformation (GetNodeTransformation (gltfNode));
        parentNode.AddChildNode (node);

        if (gltfNode.children !== undefined) {
            for (let childIndex of gltfNode.children) {
                let childGltfNode = gltf.nodes[childIndex];
                this.ImportNode (gltf, childGltfNode, node);
            }
        }

        if (gltfNode.mesh !== undefined) {
            let mesh = this.model.GetMesh (gltfNode.mesh);
            this.ImportProperties (mesh, gltfNode.extras, 'Node properties');
            node.AddMeshIndex (gltfNode.mesh);
        }
    }

    GetReaderFromBufferView (bufferView)
    {
        let bufferIndex = bufferView.buffer || 0;
        let buffer = this.bufferContents[bufferIndex];
        if (buffer === undefined || buffer === null) {
            return null;
        }

        let reader = new GltfBufferReader (buffer);
        reader.SkipBytes (bufferView.byteOffset || 0);
        let byteStride = bufferView.byteStride;
        if (byteStride !== undefined && byteStride !== 0) {
            reader.SetByteStride (byteStride);
        }

        return reader;
    }

    GetReaderFromAccessor (gltf, accessor)
    {
        let bufferViewIndex = accessor.bufferView || 0;
        let bufferView = gltf.bufferViews[bufferViewIndex];
        let reader = this.GetReaderFromBufferView (bufferView);
        if (reader === null) {
            return null;
        }

        reader.SetComponentType (accessor.componentType);
        reader.SetDataType (accessor.type);
        reader.SetDataCount (accessor.count);
        reader.SkipBytes (accessor.byteOffset || 0);

        if (accessor.sparse !== undefined) {
            let indexReader = this.GetReaderFromSparseAccessor (gltf, accessor.sparse.indices, accessor.sparse.indices.componentType, 'SCALAR', accessor.sparse.count);
            let valueReader = this.GetReaderFromSparseAccessor (gltf, accessor.sparse.values, accessor.componentType, accessor.type, accessor.sparse.count);
            if (indexReader !== null && valueReader !== null) {
                reader.SetSparseReader (indexReader, valueReader);
            }
        }
        return reader;
    }

    GetReaderFromSparseAccessor (gltf, sparseAccessor, componentType, type, count)
    {
        if (sparseAccessor.bufferView === undefined) {
            return null;
        }

        let bufferView = gltf.bufferViews[sparseAccessor.bufferView];
        let reader = this.GetReaderFromBufferView (bufferView);
        if (reader === null) {
            return null;
        }

        reader.SetComponentType (componentType);
        reader.SetDataType (type);
        reader.SetDataCount (count);
        reader.SkipBytes (sparseAccessor.byteOffset || 0);
        return reader;
    }
}

class ImporterIfc extends ImporterBase
{
    constructor ()
    {
        super ();
        this.ifc = null;
    }

    CanImportExtension (extension)
    {
        return extension === 'ifc';
    }

    GetUpDirection ()
    {
        return Direction.Y;
    }

    ClearContent ()
    {
        this.expressIDToMesh = null;
        this.colorToMaterial = null;
    }

    ResetContent ()
    {
        this.expressIDToMesh = new Map ();
        this.colorToMaterial = new ColorToMaterialConverter (this.model);
    }

    ImportContent (fileContent, onFinish)
    {
        if (this.ifc === null) {
            LoadExternalLibrary ('loaders/web-ifc-api-browser.js').then (() => {
                this.ifc = new WebIFC.IfcAPI ();
                this.ifc.Init ().then (() => {
                    this.ImportIfcContent (fileContent);
                    onFinish ();
                });
            }).catch (() => {
                this.SetError ('Failed to load web-ifc.');
                onFinish ();
            });
        } else {
            this.ImportIfcContent (fileContent);
            onFinish ();
        }
    }

    ImportIfcContent (fileContent)
    {
        const fileBuffer = new Uint8Array (fileContent);
        const modelID = this.ifc.OpenModel (fileBuffer, {
            COORDINATE_TO_ORIGIN : true
        });
        const ifcMeshes = this.ifc.LoadAllGeometry (modelID);
        for (let meshIndex = 0; meshIndex < ifcMeshes.size (); meshIndex++) {
            const ifcMesh = ifcMeshes.get (meshIndex);
            if (ifcMesh.geometries.size () > 0) {
                this.ImportIfcMesh (modelID, ifcMesh);
            }
        }
        this.ImportProperties (modelID);
        this.ifc.CloseModel (modelID);
    }

    ImportIfcMesh (modelID, ifcMesh)
    {
        let mesh = new Mesh ();
        mesh.SetName ('Mesh ' + ifcMesh.expressID.toString ());

        let vertexOffset = 0;
        const ifcGeometries = ifcMesh.geometries;
        for (let geometryIndex = 0; geometryIndex < ifcGeometries.size (); geometryIndex++) {
            const ifcGeometry = ifcGeometries.get (geometryIndex);
            const ifcGeometryData = this.ifc.GetGeometry (modelID, ifcGeometry.geometryExpressID);
            const ifcVertices = this.ifc.GetVertexArray (ifcGeometryData.GetVertexData (), ifcGeometryData.GetVertexDataSize ());
            const ifcIndices = this.ifc.GetIndexArray (ifcGeometryData.GetIndexData (), ifcGeometryData.GetIndexDataSize ());
            const materialIndex = this.GetMaterialIndexByColor (ifcGeometry.color);
            const matrix = new Matrix (ifcGeometry.flatTransformation);
            const transformation = new Transformation (matrix);

            for (let i = 0; i < ifcVertices.length; i += 6) {
                const x = ifcVertices[i];
                const y = ifcVertices[i + 1];
                const z = ifcVertices[i + 2];
                const coord = new Coord3D (x, y, z);
                const transformed = transformation.TransformCoord3D (coord);
                mesh.AddVertex (transformed);
            }
            // TODO: normals
            for (let i = 0; i < ifcIndices.length; i += 3) {
                const v0 = ifcIndices[i];
                const v1 = ifcIndices[i + 1];
                const v2 = ifcIndices[i + 2];
                const triangle = new Triangle (
                    vertexOffset + v0,
                    vertexOffset + v1,
                    vertexOffset + v2
                );
                triangle.SetMaterial (materialIndex);
                mesh.AddTriangle (triangle);
            }
            vertexOffset += ifcVertices.length / 6;
        }

        this.expressIDToMesh.set (ifcMesh.expressID, mesh);
        this.model.AddMeshToRootNode (mesh);
    }

    ImportProperties (modelID)
    {
        const lines = this.ifc.GetLineIDsWithType (modelID, WebIFC.IFCRELDEFINESBYPROPERTIES);
        for (let i = 0; i < lines.size (); i++) {
            const relID = lines.get (i);
            const rel = this.ifc.GetLine (modelID, relID);
            if (Array.isArray (rel.RelatingPropertyDefinition)) {
                continue;
            }
            rel.RelatedObjects.forEach ((objectRelID) => {
                let element = null;
                if (this.expressIDToMesh.has (objectRelID.value)) {
                    element = this.expressIDToMesh.get (objectRelID.value);
                } else {
                    let propSetOwner = this.ifc.GetLine (modelID, objectRelID.value, true);
                    if (propSetOwner.type === WebIFC.IFCBUILDING) {
                        element = this.model;
                    }
                }
                if (element === null) {
                    return;
                }
                let propSetDef = rel.RelatingPropertyDefinition;
                let propSet = this.ifc.GetLine (modelID, propSetDef.value, true);
                if (!propSet || !propSet.HasProperties) {
                    return;
                }
                let propertyGroup = new PropertyGroup (propSet.Name.value);
                propSet.HasProperties.forEach ((property) => {
                    if (!property || !property.Name) {
                        return;
                    }
                    if (!property.NominalValue || !property.NominalValue.constructor) {
                        return;
                    }
                    if (property.type !== WebIFC.IFCPROPERTYSINGLEVALUE) {
                        return;
                    }
                    let propertyName = this.GetIFCString (property.Name.value);
                    let elemProperty = null;
                    let strValue = null;
                    switch (property.NominalValue.constructor.name) {
                        case 'IfcText':
                        case 'IfcLabel':
                        case 'IfcIdentifier':
                        case WebIFC.IFCLABEL:
                            elemProperty = new Property (PropertyType.Text, propertyName, this.GetIFCString (property.NominalValue.value));
                            break;
                        case 'IfcBoolean':
                        case 'IfcLogical':
                            strValue = 'Unknown';
                            if (property.NominalValue.value === 'T') {
                                strValue = 'True';
                            } else if (property.NominalValue.value === 'F') {
                                strValue = 'False';
                            }
                            elemProperty = new Property (PropertyType.Text, propertyName, strValue);
                            break;
                        case 'IfcInteger':
                        case 'IfcCountMeasure':
                            elemProperty = new Property (PropertyType.Integer, propertyName, property.NominalValue.value);
                            break;
                        case 'IfcReal':
                        case 'IfcLengthMeasure':
                        case 'IfcPositiveLengthMeasure':
                        case 'IfcAreaMeasure':
                        case 'IfcVolumeMeasure':
                        case 'IfcRatioMeasure':
                        case 'IfcPositiveRatioMeasure':
                        case 'IfcMassMeasure':
                        case 'IfcMassPerLengthMeasure':
                        case 'IfcPlaneAngleMeasure':
                        case 'IfcThermalTransmittanceMeasure':
                            elemProperty = new Property (PropertyType.Number, propertyName, property.NominalValue.value);
                            break;
                        default:
                            // TODO
                            console.log (property);
                            break;
                    }
                    if (elemProperty !== null) {
                        propertyGroup.AddProperty (elemProperty);
                    }
                });
                if (propertyGroup.PropertyCount () > 0) {
                    element.AddPropertyGroup (propertyGroup);
                }
            });
        }
    }

    GetMaterialIndexByColor (ifcColor)
    {
        const color = RGBColorFromFloatComponents (ifcColor.x, ifcColor.y, ifcColor.z);
        const alpha = parseInt (ifcColor.w * 255.0, 10);
        return this.colorToMaterial.GetMaterialIndex (color.r, color.g, color.b, alpha);
    }

    GetIFCString (ifcString)
    {
        let decoded = this.DecodeIFCString (ifcString);
        if (decoded.length === 0) {
            decoded = '-';
        }
        return decoded;
    }

    DecodeIFCString (ifcString)
    {
        // TODO: https://github.com/tomvandig/web-ifc/issues/58
        const ifcUnicodeRegEx = /\\X2\\(.*?)\\X0\\/uig;
        let resultString = ifcString;
        let match = ifcUnicodeRegEx.exec (ifcString);
        while (match) {
            const unicodeChar = String.fromCharCode (parseInt (match[1], 16));
            resultString = resultString.replace (match[0], unicodeChar);
            match = ifcUnicodeRegEx.exec (ifcString);
        }
        return resultString;
    }
}

class ObjMeshConverter
{
    constructor (mesh)
    {
        this.mesh = mesh;
        this.globalToMeshVertices = new Map ();
        this.globalToMeshVertexColors = new Map ();
        this.globalToMeshNormals = new Map ();
        this.globalToMeshUvs = new Map ();
    }

    AddVertex (globalIndex, globalVertices)
    {
        return this.GetLocalIndex (globalIndex, globalVertices, this.globalToMeshVertices, (val) => {
            return this.mesh.AddVertex (new Coord3D (val.x, val.y, val.z));
        });
    }

    AddVertexColor (globalIndex, globalVertexColors)
    {
        return this.GetLocalIndex (globalIndex, globalVertexColors, this.globalToMeshVertexColors, (val) => {
            return this.mesh.AddVertexColor (new RGBColor (val.r, val.g, val.b));
        });
    }

    AddNormal (globalIndex, globalNormals)
    {
        return this.GetLocalIndex (globalIndex, globalNormals, this.globalToMeshNormals, (val) => {
            return this.mesh.AddNormal (new Coord3D (val.x, val.y, val.z));
        });
    }

    AddUV (globalIndex, globalUvs)
    {
        return this.GetLocalIndex (globalIndex, globalUvs, this.globalToMeshUvs, (val) => {
            return this.mesh.AddTextureUV (new Coord2D (val.x, val.y));
        });
    }

    AddTriangle (triangle)
    {
        this.mesh.AddTriangle (triangle);
    }

    GetLocalIndex (globalIndex, globalValueArray, globalToMeshIndices, valueAdderFunc)
    {
        if (isNaN (globalIndex) || globalIndex < 0 || globalIndex >= globalValueArray.length) {
            return null;
        }
        if (globalToMeshIndices.has (globalIndex)) {
            return globalToMeshIndices.get (globalIndex);
        } else {
            let globalValue = globalValueArray[globalIndex];
            let localIndex = valueAdderFunc (globalValue);
            globalToMeshIndices.set (globalIndex, localIndex);
            return localIndex;
        }
    }
}

function CreateColor (r, g, b)
{
    return RGBColorFromFloatComponents (
        parseFloat (r),
        parseFloat (g),
        parseFloat (b)
    );
}

class ImporterObj extends ImporterBase
{
    constructor ()
    {
        super ();
    }

    CanImportExtension (extension)
    {
        return extension === 'obj';
    }

    GetUpDirection ()
    {
        return Direction.Y;
    }

    ClearContent ()
    {
        this.globalVertices = null;
        this.globalVertexColors = null;
        this.globalNormals = null;
        this.globalUvs = null;

        this.currentMeshConverter = null;
        this.currentMaterial = null;
        this.currentMaterialIndex = null;

        this.meshNameToConverter = null;
        this.materialNameToIndex = null;
    }

    ResetContent ()
    {
        this.globalVertices = [];
        this.globalVertexColors = [];
        this.globalNormals = [];
        this.globalUvs = [];

        this.currentMeshConverter = null;
        this.currentMaterial = null;
        this.currentMaterialIndex = null;

        this.meshNameToConverter = new Map ();
        this.materialNameToIndex = new Map ();
    }

    ImportContent (fileContent, onFinish)
    {
        let textContent = ArrayBufferToUtf8String (fileContent);
        ReadLines (textContent, (line) => {
            if (!this.WasError ()) {
                this.ProcessLine (line);
            }
        });
        onFinish ();
    }

    ProcessLine (line)
    {
        if (line[0] === '#') {
            return;
        }

        let parameters = ParametersFromLine (line, '#');
        if (parameters.length === 0) {
            return;
        }

        let keyword = parameters[0].toLowerCase ();
        parameters.shift ();

        if (this.ProcessMeshParameter (keyword, parameters, line)) {
            return;
        }

        if (this.ProcessMaterialParameter (keyword, parameters, line)) {
            return;
        }
    }

    AddNewMesh (name)
    {
        if (this.meshNameToConverter.has (name)) {
            this.currentMeshConverter = this.meshNameToConverter.get (name);
        } else {
            let mesh = new Mesh ();
            mesh.SetName (name);
            this.model.AddMeshToRootNode (mesh);
            this.currentMeshConverter = new ObjMeshConverter (mesh);
            this.meshNameToConverter.set (name, this.currentMeshConverter);
        }
    }

    ProcessMeshParameter (keyword, parameters, line)
    {
        if (keyword === 'g' || keyword === 'o') {
            if (parameters.length === 0) {
                return true;
            }
            let name = NameFromLine (line, keyword.length, '#');
            this.AddNewMesh (name);
            return true;
        } else if (keyword === 'v') {
            if (parameters.length < 3) {
                return true;
            }
            this.globalVertices.push (new Coord3D (
                parseFloat (parameters[0]),
                parseFloat (parameters[1]),
                parseFloat (parameters[2])
            ));
            if (parameters.length >= 6) {
                this.globalVertexColors.push (CreateColor (parameters[3], parameters[4], parameters[5]));
            }
            return true;
        } else if (keyword === 'vn') {
            if (parameters.length < 3) {
                return true;
            }
            this.globalNormals.push (new Coord3D (
                parseFloat (parameters[0]),
                parseFloat (parameters[1]),
                parseFloat (parameters[2])
            ));
            return true;
        } else if (keyword === 'vt') {
            if (parameters.length < 2) {
                return true;
            }
            this.globalUvs.push (new Coord2D (
                parseFloat (parameters[0]),
                parseFloat (parameters[1])
            ));
            return true;
        } else if (keyword === 'f') {
            if (parameters.length < 3) {
                return true;
            }
            this.ProcessFace (parameters);
            return true;
        }

        return false;
    }

    ProcessMaterialParameter (keyword, parameters, line)
    {
        function ExtractTextureParameters (parameters)
        {
            let textureParameters = new Map ();
            let lastParameter = null;
            for (let i = 0; i < parameters.length - 1; i++) {
                let parameter = parameters[i];
                if (parameter.startsWith ('-')) {
                    lastParameter = parameter;
                    textureParameters.set (lastParameter, []);
                    continue;
                }
                if (lastParameter !== null) {
                    textureParameters.get (lastParameter).push (parameter);
                }
            }
            return textureParameters;
        }

        function CreateTexture (parameters, callbacks)
        {
            let texture = new TextureMap ();
            let textureName = parameters[parameters.length - 1];
            let textureBuffer = callbacks.getFileBuffer (textureName);
            texture.name = textureName;
            texture.buffer = textureBuffer;

            let textureParameters = ExtractTextureParameters (parameters);
            if (textureParameters.has ('-o')) {
                let offsetParameters = textureParameters.get ('-o');
                if (offsetParameters.length > 0) {
                    texture.offset.x = parseFloat (offsetParameters[0]);
                }
                if (offsetParameters.length > 1) {
                    texture.offset.y = parseFloat (offsetParameters[1]);
                }
            }

            if (textureParameters.has ('-s')) {
                let scaleParameters = textureParameters.get ('-s');
                if (scaleParameters.length > 0) {
                    texture.scale.x = parseFloat (scaleParameters[0]);
                }
                if (scaleParameters.length > 1) {
                    texture.scale.y = parseFloat (scaleParameters[1]);
                }
            }

            return texture;
        }

        if (keyword === 'newmtl') {
            if (parameters.length === 0) {
                return true;
            }

            let material = new PhongMaterial ();
            let materialName = NameFromLine (line, keyword.length, '#');
            let materialIndex = this.model.AddMaterial (material);
            material.name = materialName;
            this.currentMaterial = material;
            this.materialNameToIndex.set (materialName, materialIndex);
            return true;
        } else if (keyword === 'usemtl') {
            if (parameters.length === 0) {
                return true;
            }

            let materialName = NameFromLine (line, keyword.length, '#');
            if (this.materialNameToIndex.has (materialName)) {
                this.currentMaterialIndex = this.materialNameToIndex.get (materialName);
            }
            return true;
        } else if (keyword === 'mtllib') {
            if (parameters.length === 0) {
                return true;
            }
            let fileName = NameFromLine (line, keyword.length, '#');
            let fileBuffer = this.callbacks.getFileBuffer (fileName);
            if (fileBuffer !== null) {
                let textContent = ArrayBufferToUtf8String (fileBuffer);
                ReadLines (textContent, (line) => {
                    if (!this.WasError ()) {
                        this.ProcessLine (line);
                    }
                });
            }
            return true;
        } else if (keyword === 'map_kd') {
            if (this.currentMaterial === null || parameters.length === 0) {
                return true;
            }
            this.currentMaterial.diffuseMap = CreateTexture (parameters, this.callbacks);
            UpdateMaterialTransparency (this.currentMaterial);
            return true;
        } else if (keyword === 'map_ks') {
            if (this.currentMaterial === null || parameters.length === 0) {
                return true;
            }
            this.currentMaterial.specularMap = CreateTexture (parameters, this.callbacks);
            return true;
        } else if (keyword === 'map_bump' || keyword === 'bump') {
            if (this.currentMaterial === null || parameters.length === 0) {
                return true;
            }
            this.currentMaterial.bumpMap = CreateTexture (parameters, this.callbacks);
            return true;
        } else if (keyword === 'ka') {
            if (this.currentMaterial === null || parameters.length < 3) {
                return true;
            }
            this.currentMaterial.ambient = CreateColor (parameters[0], parameters[1], parameters[2]);
            return true;
        } else if (keyword === 'kd') {
            if (this.currentMaterial === null || parameters.length < 3) {
                return true;
            }
            this.currentMaterial.color = CreateColor (parameters[0], parameters[1], parameters[2]);
            return true;
        } else if (keyword === 'ks') {
            if (this.currentMaterial === null || parameters.length < 3) {
                return true;
            }
            this.currentMaterial.specular = CreateColor (parameters[0], parameters[1], parameters[2]);
            return true;
        } else if (keyword === 'ns') {
            if (this.currentMaterial === null || parameters.length < 1) {
                return true;
            }
            this.currentMaterial.shininess = parseFloat (parameters[0]) / 1000.0;
            return true;
        } else if (keyword === 'tr') {
            if (this.currentMaterial === null || parameters.length < 1) {
                return true;
            }
            this.currentMaterial.opacity = 1.0 - parseFloat (parameters[0]);
            UpdateMaterialTransparency (this.currentMaterial);
            return true;
        } else if (keyword === 'd') {
            if (this.currentMaterial === null || parameters.length < 1) {
                return true;
            }
            this.currentMaterial.opacity = parseFloat (parameters[0]);
            UpdateMaterialTransparency (this.currentMaterial);
            return true;
        }

        return false;
    }

    ProcessFace (parameters)
    {
        function GetRelativeIndex (index, count)
        {
            if (index > 0) {
                return index - 1;
            } else {
                return count + index;
            }
        }

        let vertices = [];
        let colors = [];
        let normals = [];
        let uvs = [];

        for (let i = 0; i < parameters.length; i++) {
            let vertexParams = parameters[i].split ('/');
            vertices.push (GetRelativeIndex (parseInt (vertexParams[0], 10), this.globalVertices.length));
            if (this.globalVertices.length === this.globalVertexColors.length) {
                colors.push (GetRelativeIndex (parseInt (vertexParams[0], 10), this.globalVertices.length));
            }
            if (vertexParams.length > 1 && vertexParams[1].length > 0) {
                uvs.push (GetRelativeIndex (parseInt (vertexParams[1], 10), this.globalUvs.length));
            }
            if (vertexParams.length > 2 && vertexParams[2].length > 0) {
                normals.push (GetRelativeIndex (parseInt (vertexParams[2], 10), this.globalNormals.length));
            }
        }

        if (this.currentMeshConverter === null) {
            this.AddNewMesh ('');
        }

        for (let i = 0; i < vertices.length - 2; i++) {
            let v0 = this.currentMeshConverter.AddVertex (vertices[0], this.globalVertices);
            let v1 = this.currentMeshConverter.AddVertex (vertices[i + 1], this.globalVertices);
            let v2 = this.currentMeshConverter.AddVertex (vertices[i + 2], this.globalVertices);
            if (v0 === null || v1 === null || v2 === null) {
                this.SetError ('Invalid vertex index.');
                break;
            }

            let triangle = new Triangle (v0, v1, v2);

            if (colors.length === vertices.length) {
                let c0 = this.currentMeshConverter.AddVertexColor (colors[0], this.globalVertexColors);
                let c1 = this.currentMeshConverter.AddVertexColor (colors[i + 1], this.globalVertexColors);
                let c2 = this.currentMeshConverter.AddVertexColor (colors[i + 2], this.globalVertexColors);
                if (c0 === null || c1 === null || c2 === null) {
                    this.SetError ('Invalid vertex color index.');
                    break;
                }
                triangle.SetVertexColors (c0, c1, c2);
            }

            if (normals.length === vertices.length) {
                let n0 = this.currentMeshConverter.AddNormal (normals[0], this.globalNormals);
                let n1 = this.currentMeshConverter.AddNormal (normals[i + 1], this.globalNormals);
                let n2 = this.currentMeshConverter.AddNormal (normals[i + 2], this.globalNormals);
                if (n0 === null || n1 === null || n2 === null) {
                    this.SetError ('Invalid normal index.');
                    break;
                }
                triangle.SetNormals (n0, n1, n2);
            }

            if (uvs.length === vertices.length) {
                let u0 = this.currentMeshConverter.AddUV (uvs[0], this.globalUvs);
                let u1 = this.currentMeshConverter.AddUV (uvs[i + 1], this.globalUvs);
                let u2 = this.currentMeshConverter.AddUV (uvs[i + 2], this.globalUvs);
                if (u0 === null || u1 === null || u2 === null) {
                    this.SetError ('Invalid uv index.');
                    break;
                }
                triangle.SetTextureUVs (u0, u1, u2);
            }

            if (this.currentMaterialIndex !== null) {
                triangle.mat = this.currentMaterialIndex;
            }

            this.currentMeshConverter.AddTriangle (triangle);
        }
    }
}

class ImporterOff extends ImporterBase
{
    constructor ()
    {
        super ();
    }

    CanImportExtension (extension)
    {
        return extension === 'off';
    }

    GetUpDirection ()
    {
        return Direction.Y;
    }

    ClearContent ()
    {
        this.mesh = null;
        this.status = null;
        this.colorToMaterial = null;
    }

    ResetContent ()
    {
        this.mesh = new Mesh ();
        this.model.AddMeshToRootNode (this.mesh);
        this.status = {
            vertexCount : 0,
            faceCount : 0,
            foundVertex : 0,
            foundFace : 0
        };
        this.colorToMaterial = new ColorToMaterialConverter (this.model);
    }

    ImportContent (fileContent, onFinish)
    {
        let textContent = ArrayBufferToUtf8String (fileContent);
        ReadLines (textContent, (line) => {
            if (!this.WasError ()) {
                this.ProcessLine (line);
            }
        });
        onFinish ();
    }

    ProcessLine (line)
    {
        function CreateColorComponent (str)
        {
            if (str.indexOf ('.') !== -1) {
                return ColorComponentFromFloat (parseFloat (str));
            } else {
                return parseInt (str, 10);
            }
        }

        if (line[0] === '#') {
            return;
        }

        let parameters = ParametersFromLine (line, '#');
        if (parameters.length === 0) {
            return;
        }

        if (parameters[0] === 'OFF') {
            return;
        }

        if (this.status.vertexCount === 0 && this.status.faceCount === 0) {
            if (parameters.length > 1) {
                this.status.vertexCount = parseInt (parameters[0], 10);
                this.status.faceCount = parseInt (parameters[1], 10);
            }
            return;
        }

        if (this.status.foundVertex < this.status.vertexCount) {
            if (parameters.length >= 3) {
                this.mesh.AddVertex (new Coord3D (
                    parseFloat (parameters[0]),
                    parseFloat (parameters[1]),
                    parseFloat (parameters[2])
                ));
                this.status.foundVertex += 1;
            }
            if (parameters.length >= 6) {
                this.mesh.AddVertexColor (new RGBColor (
                    CreateColorComponent (parameters[3]),
                    CreateColorComponent (parameters[4]),
                    CreateColorComponent (parameters[5])
                ));
            }
            return;
        }

        let hasVertexColors = (this.mesh.VertexCount () ===this.mesh.VertexColorCount ());
        if (this.status.foundFace < this.status.faceCount) {
            if (parameters.length >= 4) {
                let vertexCount = parseInt (parameters[0], 10);
                if (parameters.length < vertexCount + 1) {
                    return;
                }
                let materialIndex = null;
                if (!hasVertexColors && parameters.length >= vertexCount + 4) {
                    let color = new RGBColor (
                        CreateColorComponent (parameters[vertexCount + 1]),
                        CreateColorComponent (parameters[vertexCount + 2]),
                        CreateColorComponent (parameters[vertexCount + 3])
                    );
                    materialIndex = this.colorToMaterial.GetMaterialIndex (color.r, color.g, color.b);
                }
                for (let i = 0; i < vertexCount - 2; i++) {
                    let v0 = parseInt (parameters[1]);
                    let v1 = parseInt (parameters[i + 2]);
                    let v2 = parseInt (parameters[i + 3]);
                    let triangle = new Triangle (v0, v1, v2);
                    if (hasVertexColors) {
                        triangle.SetVertexColors (v0, v1, v2);
                    } else {
                        triangle.SetMaterial (materialIndex);
                    }
                    this.mesh.AddTriangle (triangle);
                }
                this.status.foundFace += 1;
            }
            return;
        }
    }
}

const PlyHeaderCheckResult =
{
    Ok : 1,
    NoVertices : 2,
    NoFaces : 3,
    UnknownError : 4
};

class PlyHeader
{
    constructor ()
    {
        this.format = null;
        this.elements = [];
    }

    SetFormat (format)
    {
        this.format = format;
    }

    AddElement (name, count)
    {
        this.elements.push ({
            name : name,
            count : count,
            format : []
        });
    }

    GetElements ()
    {
        return this.elements;
    }

    AddSingleFormat (elemType, name)
    {
        let lastElement = this.elements[this.elements.length - 1];
        lastElement.format.push ({
            name : name,
            isSingle : true,
            elemType : elemType
        });
    }

    AddListFormat (countType, elemType, name)
    {
        let lastElement = this.elements[this.elements.length - 1];
        lastElement.format.push ({
            name : name,
            isSingle : false,
            countType : countType,
            elemType : elemType
        });
    }

    GetElement (name)
    {
        for (let i = 0; i < this.elements.length; i++) {
            let element = this.elements[i];
            if (element.name === name) {
                return element;
            }
        }
        return null;
    }

    Check ()
    {
        let vertex = this.GetElement ('vertex');
        if (vertex === null || vertex.length === 0 || vertex.format.length < 3) {
            return PlyHeaderCheckResult.NoVertices;
        }

        let face = this.GetElement ('face');
        if (this.format === 'ascii') {
            if (face === null || face.count === 0 || face.format.length < 0) {
                return PlyHeaderCheckResult.NoFaces;
            }
        } else if (this.format === 'binary_little_endian' || this.format === 'binary_big_endian') {
            let triStrips = this.GetElement ('tristrips');
            let hasFaces = (face !== null && face.count > 0 && face.format.length > 0);
            let hasTriStrips = (triStrips !== null && triStrips.count > 0 && triStrips.format.length > 0);
            if (!hasFaces && !hasTriStrips) {
                return PlyHeaderCheckResult.NoFaces;
            }
        } else {
            return PlyHeaderCheckResult.UnknownError;
        }

        return PlyHeaderCheckResult.Ok;
    }
}

class PlyMaterialHandler
{
    constructor (model)
    {
        this.model = model;
        this.colorToMaterial = new Map ();
    }

    GetMaterialIndexByColor (color)
    {
        let materialName = 'Color ' +
            IntegerToHexString (color[0]) +
            IntegerToHexString (color[1]) +
            IntegerToHexString (color[2]) +
            IntegerToHexString (color[3]);

        if (this.colorToMaterial.has (materialName)) {
            return this.colorToMaterial.get (materialName);
        } else {
            let material = new PhongMaterial ();
            material.name = materialName;
            material.color = new RGBColor (color[0], color[1], color[2]);
            material.opacity = color[3] / 255.0;
            UpdateMaterialTransparency (material);
            let materialIndex = this.model.AddMaterial (material);
            this.colorToMaterial.set (materialName, materialIndex);
            return materialIndex;
        }
    }
}

class ImporterPly extends ImporterBase
{
    constructor ()
    {
        super ();
    }

    CanImportExtension (extension)
    {
        return extension === 'ply';
    }

    GetUpDirection ()
    {
        return Direction.Y;
    }

    ClearContent ()
    {
        this.mesh = null;
    }

    ResetContent ()
    {
        this.mesh = new Mesh ();
        this.model.AddMeshToRootNode (this.mesh);
    }

    ImportContent (fileContent, onFinish)
    {
        let headerString = this.GetHeaderContent (fileContent);
        let header = this.ReadHeader (headerString);
        let checkResult = header.Check ();
        if (checkResult === PlyHeaderCheckResult.Ok) {
            if (header.format === 'ascii') {
                let contentString = ArrayBufferToUtf8String (fileContent);
                contentString = contentString.substring (headerString.length);
                this.ReadAsciiContent (header, contentString);
            } else if (header.format === 'binary_little_endian' || header.format === 'binary_big_endian') {
                this.ReadBinaryContent (header, fileContent, headerString.length);
            }
        } else {
            if (checkResult === PlyHeaderCheckResult.NoVertices) {
                this.SetError ('The model contains no vertices.');
            } else if (checkResult === PlyHeaderCheckResult.NoFaces) {
                this.SetError ('The model contains no faces.');
            } else {
                this.SetError ('Invalid header information.');
            }
        }
        onFinish ();
    }

    GetHeaderContent (fileContent)
    {
        let headerContent = '';
        let bufferView = new Uint8Array (fileContent);
        let bufferIndex = 0;
        for (bufferIndex = 0; bufferIndex < fileContent.byteLength; bufferIndex++) {
            headerContent += String.fromCharCode (bufferView[bufferIndex]);
            if (headerContent.endsWith ('end_header')) {
                break;
            }
        }
        bufferIndex += 1;
        while (bufferIndex < fileContent.byteLength) {
            let char = String.fromCharCode (bufferView[bufferIndex]);
            headerContent += char;
            bufferIndex += 1;
            if (char === '\n') {
                break;
            }
        }
        return headerContent;
    }

    ReadHeader (headerContent)
    {
        let header = new PlyHeader ();
        ReadLines (headerContent, (line) => {
            let parameters = ParametersFromLine (line, null);
            if (parameters.length === 0 || parameters[0] === 'comment') {
                return;
            }

            if (parameters[0] === 'ply') {
                return;
            } else if (parameters[0] === 'format' && parameters.length >= 2) {
                header.SetFormat (parameters[1]);
            } else if (parameters[0] === 'element' && parameters.length >= 3) {
                header.AddElement (parameters[1], parseInt (parameters[2], 10));
            } else if (parameters[0] === 'property' && parameters.length >= 3) {
                if (parameters[1] === 'list' && parameters.length >= 5) {
                    header.AddListFormat (parameters[2], parameters[3], parameters[4]);
                } else {
                    header.AddSingleFormat (parameters[1], parameters[2]);
                }
            }
        });

        return header;
    }

    ReadAsciiContent (header, fileContent)
    {
        let vertex = header.GetElement ('vertex');
        let face = header.GetElement ('face');
        let foundVertex = 0;
        let foundFace = 0;
        ReadLines (fileContent, (line) => {
            if (this.WasError ()) {
                return;
            }

            let parameters = ParametersFromLine (line, null);
            if (parameters.length === 0 || parameters[0] === 'comment') {
                return;
            }

            if (foundVertex < vertex.count) {
                if (parameters.length >= 3) {
                    this.mesh.AddVertex (new Coord3D (
                        parseFloat (parameters[0]),
                        parseFloat (parameters[1]),
                        parseFloat (parameters[2])
                    ));
                    foundVertex += 1;
                }
                return;
            }

            if (face !== null && foundFace < face.count) {
                if (parameters.length >= 4) {
                    let vertexCount = parseInt (parameters[0], 10);
                    if (parameters.length < vertexCount + 1) {
                        return;
                    }
                    for (let i = 0; i < vertexCount - 2; i++) {
                        let v0 = parseInt (parameters[1]);
                        let v1 = parseInt (parameters[i + 2]);
                        let v2 = parseInt (parameters[i + 3]);
                        let triangle = new Triangle (v0, v1, v2);
                        this.mesh.AddTriangle (triangle);
                    }
                    foundFace += 1;
                }
                return;
            }
        });
    }

    ReadBinaryContent (header, fileContent, headerLength)
    {
        function ReadByFormat (reader, format)
        {
            function ReadType (reader, type)
            {
                if (type === 'char' || type === 'int8') {
                    return reader.ReadCharacter8 ();
                } else if (type === 'uchar' || type === 'uint8') {
                    return reader.ReadUnsignedCharacter8 ();
                } else if (type === 'short' || type === 'int16') {
                    return reader.ReadInteger16 ();
                } else if (type === 'ushort' || type === 'uint16') {
                    return reader.ReadUnsignedInteger16 ();
                } else if (type === 'int' || type === 'int32') {
                    return reader.ReadInteger32 ();
                } else if (type === 'uint' || type === 'uint32') {
                    return reader.ReadUnsignedInteger32 ();
                } else if (type === 'float' || type === 'float32') {
                    return reader.ReadFloat32 ();
                } else if (type === 'double' || type === 'double64') {
                    return reader.ReadDouble64 ();
                }
                return null;
            }

            if (format.isSingle) {
                return ReadType (reader, format.elemType);
            } else {
                let list = [];
                let count = ReadType (reader, format.countType);
                for (let i = 0; i < count; i++) {
                    list.push (ReadType (reader, format.elemType));
                }
                return list;
            }
        }

        function SkipFormat (reader, format, startIndex)
        {
            for (let i = startIndex; i < format.length; i++) {
                ReadByFormat (reader, format[i]);
            }
        }

        function SkipAndGetColor (reader, format, startIndex)
        {
            let r = null;
            let g = null;
            let b = null;
            let a = 255;

            for (let i = startIndex; i < format.length; i++) {
                let currFormat = format[i];
                let val = ReadByFormat (reader, currFormat);
                if (currFormat.name === 'red') {
                    r = val;
                } else if (currFormat.name === 'green') {
                    g = val;
                } else if (currFormat.name === 'blue') {
                    b = val;
                } else if (currFormat.name === 'alpha') {
                    a = val;
                }
            }

            if (r !== null && g !== null && b !== null) {
                return [r, g, b, a];
            }

            return null;
        }

        let reader = null;
        if (header.format === 'binary_little_endian') {
            reader = new BinaryReader (fileContent, true);
        } else if (header.format === 'binary_big_endian') {
            reader = new BinaryReader (fileContent, false);
        } else {
            return;
        }
        reader.Skip (headerLength);

        let materialHandler = new PlyMaterialHandler (this.model);
        let elements = header.GetElements ();
        for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            let element = elements[elementIndex];
            if (element.name === 'vertex') {
                for (let vertexIndex = 0; vertexIndex < element.count; vertexIndex++) {
                    let x = ReadByFormat (reader, element.format[0]);
                    let y = ReadByFormat (reader, element.format[1]);
                    let z = ReadByFormat (reader, element.format[2]);
                    let color = SkipAndGetColor (reader, element.format, 3);
                    if (color !== null) {
                        this.mesh.AddVertexColor (new RGBColor (color[0], color[1], color[2]));
                    }
                    this.mesh.AddVertex (new Coord3D (x, y, z));
                }
            } else if (element.name === 'face') {
                for (let faceIndex = 0; faceIndex < element.count; faceIndex++) {
                    let vertices = ReadByFormat (reader, element.format[0]);
                    let faceColor = SkipAndGetColor (reader, element.format, 1);
                    for (let i = 0; i < vertices.length - 2; i++) {
                        let v0 = vertices[0];
                        let v1 = vertices[i + 1];
                        let v2 = vertices[i + 2];
                        let triangle = new Triangle (v0, v1, v2);
                        if (faceColor !== null) {
                            triangle.mat = materialHandler.GetMaterialIndexByColor (faceColor);
                        } else if (this.mesh.VertexColorCount () > 0) {
                            triangle.SetVertexColors (v0, v1, v2);
                        }
                        this.mesh.AddTriangle (triangle);
                    }
                }
            } else if (element.name === 'tristrips') {
                for (let triStripIndex = 0; triStripIndex < element.count; triStripIndex++) {
                    let vertices = ReadByFormat (reader, element.format[0]);
                    SkipFormat (reader, element.format, 1);
                    let ccw = true;
                    for (let i = 0; i < vertices.length - 2; i++) {
                        let v0 = vertices[i];
                        let v1 = vertices[i + 1];
                        let v2 = vertices[i + 2];
                        if (v2 === -1) {
                            i += 2;
                            ccw = true;
                            continue;
                        }
                        if (!ccw) {
                            let tmp = v1;
                            v1 = v2;
                            v2 = tmp;
                        }
                        ccw = !ccw;
                        let triangle = new Triangle (v0, v1, v2);
                        this.mesh.AddTriangle (triangle);
                    }
                }
            } else {
                SkipFormat (reader, element.format, 0);
            }
        }
    }
}

class ImporterOcct extends ImporterBase
{
    constructor ()
    {
        super ();
		this.worker = null;
    }

    CanImportExtension (extension)
    {
        return extension === 'stp' || extension === 'step' || extension === 'igs' || extension === 'iges' || extension === 'brp' || extension === 'brep';
    }

    GetUpDirection ()
    {
        return Direction.Y;
    }

	ClearContent ()
	{
        if (this.worker !== null) {
            this.worker.terminate ();
            this.worker = null;
        }
	}

    ResetContent ()
    {
        this.worker = null;
    }

    ImportContent (fileContent, onFinish)
    {
        let workerPath = GetExternalLibPath ('loaders/occt-import-js-worker.js');
        this.worker = new Worker (workerPath);
        this.worker.addEventListener ('message', (ev) => {
            this.ImportResultJson (ev.data, onFinish);
        });
        this.worker.addEventListener ('error', (ev) => {
            this.SetError ('Failed to load occt-import-js.');
            onFinish ();
        });

        let format = null;
        if (this.extension === 'stp' || this.extension === 'step') {
            format = 'step';
        } else if (this.extension === 'igs' || this.extension === 'iges') {
            format = 'iges';
        } else if (this.extension === 'brp' || this.extension === 'brep') {
            format = 'brep';
        } else {
            onFinish ();
            return;
        }

        if (format === 'step' || format === 'iges') {
            this.model.SetUnit (Unit.Millimeter);
        }

        let params = {
            linearUnit: 'millimeter',
            linearDeflectionType: 'bounding_box_ratio',
            linearDeflection: 0.001,
            angularDeflection: 0.5
        };
        let fileBuffer = new Uint8Array (fileContent);
        this.worker.postMessage ({
            format : format,
            buffer : fileBuffer,
            params : params
        });
    }

	ImportResultJson (resultContent, onFinish)
	{
        if (!resultContent.success) {
            onFinish ();
            return;
        }
        let colorToMaterial = new ColorToMaterialConverter (this.model);
        let rootNode = this.model.GetRootNode ();
        this.ImportNode (resultContent, resultContent.root, rootNode, colorToMaterial);
        onFinish ();
	}

    ImportNode (resultContent, occtNode, parentNode, colorToMaterial)
    {
        for (let nodeMeshIndex of occtNode.meshes) {
            let occtMesh = resultContent.meshes[nodeMeshIndex];
            let mesh = this.ImportMesh (occtMesh, colorToMaterial);
            let meshIndex = this.model.AddMesh (mesh);
            parentNode.AddMeshIndex (meshIndex);
        }
        for (let childOcctNode of occtNode.children) {
            let childNode = new Node ();
            childNode.SetName (childOcctNode.name);
            parentNode.AddChildNode (childNode);
            this.ImportNode (resultContent, childOcctNode, childNode, colorToMaterial);
        }
    }

    ImportMesh (occtMesh, colorToMaterial)
    {
        let materialIndex = null;
        if (occtMesh.color) {
            let color = RGBColorFromFloatComponents (occtMesh.color[0], occtMesh.color[1], occtMesh.color[2]);
            materialIndex = colorToMaterial.GetMaterialIndex (color.r, color.g, color.b, null);
        }
        let mesh = ConvertThreeGeometryToMesh (occtMesh, materialIndex, null);
        if (occtMesh.name) {
            mesh.SetName (occtMesh.name);
        }
        for (let brepFace of occtMesh.brep_faces) {
            if (brepFace.color === null) {
                continue;
            }
            let faceColor = RGBColorFromFloatComponents (brepFace.color[0], brepFace.color[1], brepFace.color[2]);
            let faceMaterialIndex = colorToMaterial.GetMaterialIndex (faceColor.r, faceColor.g, faceColor.b, null);
            for (let i = brepFace.first; i <= brepFace.last; i++) {
                let triangle = mesh.GetTriangle (i);
                triangle.SetMaterial (faceMaterialIndex);
            }
        }
        return mesh;
    }
}

class ImporterStl extends ImporterBase
{
    constructor ()
    {
        super ();
    }

    CanImportExtension (extension)
    {
        return extension === 'stl';
    }

    GetUpDirection ()
    {
        return Direction.Z;
    }

    ClearContent ()
    {
        this.mesh = null;
        this.triangle = null;
    }

    ResetContent ()
    {
        this.mesh = new Mesh ();
        this.model.AddMeshToRootNode (this.mesh);
        this.triangle = null;
    }

    ImportContent (fileContent, onFinish)
    {
        if (this.IsBinaryStlFile (fileContent)) {
            this.ProcessBinary (fileContent);
        } else {
            let textContent = ArrayBufferToUtf8String (fileContent);
            ReadLines (textContent, (line) => {
                if (!this.WasError ()) {
                    this.ProcessLine (line);
                }
            });
        }
        onFinish ();
    }

    IsBinaryStlFile (fileContent)
    {
        let byteLength = fileContent.byteLength;
        if (byteLength < 84) {
            return false;
        }

        let reader = new BinaryReader (fileContent, true);
        reader.Skip (80);

        let triangleCount = reader.ReadUnsignedInteger32 ();
        if (byteLength !== triangleCount * 50 + 84) {
            return false;
        }

        return true;
    }

    ProcessLine (line)
    {
        if (line[0] === '#') {
            return;
        }

        let parameters = ParametersFromLine (line, '#');
        if (parameters.length === 0) {
            return;
        }

        let keyword = parameters[0];
        if (keyword === 'solid') {
            if (parameters.length > 1) {
                let name = NameFromLine (line, keyword.length, '#');
                this.mesh.SetName (name);
            }
            return;
        }

        if (keyword === 'facet') {
            this.triangle = new Triangle (-1, -1, -1);
            if (parameters.length >= 5 && parameters[1] === 'normal') {
                let normalVector = new Coord3D (
                    parseFloat (parameters[2]),
                    parseFloat (parameters[3]),
                    parseFloat (parameters[4])
                );
                if (IsPositive (normalVector.Length ())) {
                    let normalIndex = this.mesh.AddNormal (normalVector);
                    this.triangle.SetNormals (
                        normalIndex,
                        normalIndex,
                        normalIndex
                    );
                }
            }
            return;
        }

        if (keyword === 'vertex' && this.triangle !== null) {
            if (parameters.length >= 4) {
                let vertexIndex = this.mesh.AddVertex (new Coord3D (
                    parseFloat (parameters[1]),
                    parseFloat (parameters[2]),
                    parseFloat (parameters[3])
                ));
                if (this.triangle.v0 === -1) {
                    this.triangle.v0 = vertexIndex;
                } else if (this.triangle.v1 === -1) {
                    this.triangle.v1 = vertexIndex;
                } else if (this.triangle.v2 === -1) {
                    this.triangle.v2 = vertexIndex;
                }
            }
            return;
        }

        if (keyword === 'endfacet' && this.triangle !== null) {
            if (this.triangle.v0 !== -1 && this.triangle.v1 !== -1 && this.triangle.v2 !== null) {
                this.mesh.AddTriangle (this.triangle);
            }
            this.triangle = null;
            return;
        }
    }

    ProcessBinary (fileContent)
    {
        function ReadVector (reader)
        {
            let coord = new Coord3D ();
            coord.x = reader.ReadFloat32 ();
            coord.y = reader.ReadFloat32 ();
            coord.z = reader.ReadFloat32 ();
            return coord;
        }

        function AddVertex (mesh, reader)
        {
            let coord = ReadVector (reader);
            return mesh.AddVertex (coord);
        }

        let reader = new BinaryReader (fileContent, true);
        reader.Skip (80);
        let triangleCount = reader.ReadUnsignedInteger32 ();
        for (let i = 0; i < triangleCount; i++) {
            let normalVector = ReadVector (reader);
            let v0 = AddVertex (this.mesh, reader);
            let v1 = AddVertex (this.mesh, reader);
            let v2 = AddVertex (this.mesh, reader);
            reader.Skip (2);
            let triangle = new Triangle (v0, v1, v2);
            if (IsPositive (normalVector.Length ())) {
                let normal = this.mesh.AddNormal (normalVector);
                triangle.SetNormals (normal, normal, normal);
            }
            this.mesh.AddTriangle (triangle);
        }
    }
}

class ImporterBim extends ImporterBase
{
    constructor ()
    {
        super ();
    }

    CanImportExtension (extension)
    {
        return extension === 'bim';
    }

    GetUpDirection ()
    {
        return Direction.Z;
    }

    ClearContent ()
    {
        this.meshIdToMesh = null;
        this.colorToMaterial = null;
    }

    ResetContent ()
    {
        this.meshIdToMesh = new Map ();
        this.colorToMaterial = new ColorToMaterialConverter (this.model);
    }

    ImportContent (fileContent, onFinish)
    {
        this.model.SetUnit (Unit.Meter);

        let textContent = ArrayBufferToUtf8String (fileContent);
        let bimJson = null;
        try {
            bimJson = JSON.parse (textContent);
        } catch (err) {
            this.SetError ('Failed to parse bim file.');
            onFinish ();
            return;
        }

        for (let bimMesh of bimJson.meshes) {
            this.meshIdToMesh.set (bimMesh.mesh_id, bimMesh);
        }

        this.ImportProperties (bimJson, this.model);
        for (let bimElement of bimJson.elements) {
            let mesh = this.ImportElement (bimElement);
            mesh.SetName (bimElement.type);
            this.ImportProperties (bimElement, mesh);
        }

        onFinish ();
    }

    ImportElement (bimElement)
    {
        let defaultMaterialIndex = null;
        if (bimElement.color)
        {
            defaultMaterialIndex = this.colorToMaterial.GetMaterialIndex (
                bimElement.color.r,
                bimElement.color.g,
                bimElement.color.b,
                bimElement.color.a
            );
        }

        let rootNode = this.model.GetRootNode ();

        let bimMesh = this.meshIdToMesh.get (bimElement.mesh_id);
        let mesh = this.ImportMesh (bimMesh, (triangleIndex) => {
            if (bimElement.face_colors) {
                let faceMaterialIndex = this.colorToMaterial.GetMaterialIndex (
                    bimElement.face_colors[triangleIndex * 4 + 0],
                    bimElement.face_colors[triangleIndex * 4 + 1],
                    bimElement.face_colors[triangleIndex * 4 + 2],
                    bimElement.face_colors[triangleIndex * 4 + 3]
                );
                return faceMaterialIndex;
            } else {
                return defaultMaterialIndex;
            }
        });
        let meshIndex = this.model.AddMesh (mesh);

        let elementNode = new Node ();
        elementNode.AddMeshIndex (meshIndex);

        let translation = new Coord3D (0.0, 0.0, 0.0);
        if (bimElement.vector) {
            translation = new Coord3D (
                bimElement.vector.x,
                bimElement.vector.y,
                bimElement.vector.z
            );
        }
        let rotation = new Quaternion (0.0, 0.0, 0.0, 1.0);
        if (bimElement.rotation) {
            rotation = new Quaternion (
                bimElement.rotation.qx,
                bimElement.rotation.qy,
                bimElement.rotation.qz,
                bimElement.rotation.qw
            );
        }
        let scale = new Coord3D (1.0, 1.0, 1.0);
        let matrix = new Matrix ().ComposeTRS (translation, rotation, scale);
        elementNode.SetTransformation (new Transformation (matrix));

        rootNode.AddChildNode (elementNode);
        return mesh;
    }

    ImportMesh (bimMesh, getMaterialIndex)
    {
        let mesh = new Mesh ();

        for (let i = 0; i < bimMesh.coordinates.length; i += 3) {
            mesh.AddVertex (new Coord3D (
                bimMesh.coordinates[i + 0],
                bimMesh.coordinates[i + 1],
                bimMesh.coordinates[i + 2]
            ));
        }

        for (let i = 0; i < bimMesh.indices.length; i += 3) {
            let triangle = new Triangle (
                bimMesh.indices[i + 0],
                bimMesh.indices[i + 1],
                bimMesh.indices[i + 2]
            );
            triangle.SetMaterial (getMaterialIndex (i / 3));
            mesh.AddTriangle (triangle);
        }

        return mesh;
    }

    ImportProperties (source, target)
    {
        function AddProperty (group, name, value)
        {
            if (value === undefined || value === null) {
                return;
            }
            let property = new Property (PropertyType.Text, name, value);
            group.AddProperty (property);
        }

        if (!source.info || IsObjectEmpty (source.info)) {
            return;
        }

        let info = source.info;
        let propertyGroup = new PropertyGroup ('Info');
        AddProperty (propertyGroup, 'Guid', source.guid);
        AddProperty (propertyGroup, 'Type', source.type);
        for (let propertyName in info) {
            if (Object.prototype.hasOwnProperty.call (info, propertyName)) {
                if (typeof info[propertyName] === 'string') {
                    AddProperty (propertyGroup, propertyName, info[propertyName]);
                }
            }
        }
        target.AddPropertyGroup (propertyGroup);
    }
}

class ImporterThreeBase extends ImporterBase
{
    constructor ()
    {
        super ();

        this.colorConverter = null;
    }

    CreateLoader (manager)
    {
        return null;
    }

    GetMainObject (loadedObject)
    {
        return loadedObject;
    }

    IsMeshVisible (mesh)
    {
        return true;
    }

    ClearContent ()
    {
        this.loader = null;
        this.materialIdToIndex = null;
        this.objectUrlToFileName = null;
    }

    ResetContent ()
    {
        this.loader = null;
        this.materialIdToIndex = new Map ();
        this.objectUrlToFileName = new Map ();
    }

    ImportContent (fileContent, onFinish)
    {
        this.LoadModel (fileContent, onFinish);
    }

    LoadModel (fileContent, onFinish)
    {
        let isAllLoadersDone = false;
        let loadingManager = new THREE.LoadingManager (() => {
            isAllLoadersDone = true;
        });

        const mainFileUrl = CreateObjectUrl (fileContent);
        loadingManager.setURLModifier ((url) => {
            if (url === mainFileUrl) {
                return url;
            }
            const name = GetFileName (url);
            const extension = GetFileExtension (url);
            if (extension.length > 0) {
                const buffer = this.callbacks.getFileBuffer (url);
                if (buffer !== null) {
                    let objectUrl = CreateObjectUrl (buffer);
                    this.objectUrlToFileName.set (objectUrl, name);
                    return objectUrl;
                }
            }
            return url;
        });

        const threeLoader = this.CreateLoader (loadingManager);
        if (threeLoader === null) {
            onFinish ();
            return;
        }

        threeLoader.load (mainFileUrl,
            (object) => {
                WaitWhile (() => {
                    if (isAllLoadersDone) {
                        this.OnThreeObjectsLoaded (object, onFinish);
                        return false;
                    }
                    return true;
                });
            },
            () => {
            },
            (err) => {
                this.SetError (err);
                onFinish ();
            }
        );
    }

    OnThreeObjectsLoaded (loadedObject, onFinish)
    {
        function GetObjectTransformation (threeObject)
        {
            let matrix = new Matrix ().CreateIdentity ();
            threeObject.updateMatrix ();
            if (threeObject.matrix !== undefined && threeObject.matrix !== null) {
                matrix.Set (threeObject.matrix.elements);
            }
            return new Transformation (matrix);
        }

        function AddObject (importer, model, threeObject, parentNode)
        {
            let node = new Node ();
            if (threeObject.name !== undefined) {
                node.SetName (threeObject.name);
            }
            node.SetTransformation (GetObjectTransformation (threeObject));
            parentNode.AddChildNode (node);

            for (let childObject of threeObject.children) {
                AddObject (importer, model, childObject, node);
            }
            if (threeObject.isMesh && importer.IsMeshVisible (threeObject)) {
                let mesh = importer.ConvertThreeMesh (threeObject);
                let meshIndex = model.AddMesh (mesh);
                node.AddMeshIndex (meshIndex);
            }
        }

        let mainObject = this.GetMainObject (loadedObject);
        let rootNode = this.model.GetRootNode ();
        rootNode.SetTransformation (GetObjectTransformation (mainObject));
        for (let childObject of mainObject.children) {
            AddObject (this, this.model, childObject, rootNode);
        }

        onFinish ();
    }

    ConvertThreeMesh (threeMesh)
    {
        let mesh = null;
        if (Array.isArray (threeMesh.material)) {
            mesh = ConvertThreeGeometryToMesh (threeMesh.geometry, null, this.colorConverter);
            if (threeMesh.geometry.attributes.color === undefined || threeMesh.geometry.attributes.color === null) {
                let materialIndices = [];
                for (let i = 0; i < threeMesh.material.length; i++) {
                    const material = threeMesh.material[i];
                    const materialIndex = this.FindOrCreateMaterial (material);
                    materialIndices.push (materialIndex);
                }
                for (let i = 0; i < threeMesh.geometry.groups.length; i++) {
                    let group = threeMesh.geometry.groups[i];
                    let groupEnd = null;
                    if (group.count === Infinity) {
                        groupEnd = mesh.TriangleCount ();
                    } else {
                        groupEnd = group.start / 3 + group.count / 3;
                    }
                    for (let j = group.start / 3; j < groupEnd; j++) {
                        let triangle = mesh.GetTriangle (j);
                        triangle.SetMaterial (materialIndices[group.materialIndex]);
                    }
                }
            }
        } else {
            const materialIndex = this.FindOrCreateMaterial (threeMesh.material);
            mesh = ConvertThreeGeometryToMesh (threeMesh.geometry, materialIndex, this.colorConverter);
        }
        if (threeMesh.name !== undefined && threeMesh.name !== null) {
            mesh.SetName (threeMesh.name);
        }
        return mesh;
    }

    FindOrCreateMaterial (threeMaterial)
    {
        if (this.materialIdToIndex.has (threeMaterial.id)) {
            return this.materialIdToIndex.get (threeMaterial.id);
        }
        let material = this.ConvertThreeMaterial (threeMaterial);
        let materialIndex = null;
        if (material !== null) {
            materialIndex = this.model.AddMaterial (material);
        }
        this.materialIdToIndex.set (threeMaterial.id, materialIndex);
        return materialIndex;
    }

    ConvertThreeMaterial (threeMaterial)
    {
        function CreateTexture (threeMap, objectUrlToFileName)
        {
            function GetDataUrl (img)
            {
                if (img.data !== undefined && img.data !== null) {
                    let imageData = new ImageData (img.width, img.height);
                    let imageSize = img.width * img.height * 4;
                    for (let i = 0; i < imageSize; i++) {
                        imageData.data[i] = img.data[i];
                    }
                    return THREE.ImageUtils.getDataURL (imageData);
                } else {
                    return THREE.ImageUtils.getDataURL (img);
                }
            }

            if (threeMap === undefined || threeMap === null) {
                return null;
            }

            if (threeMap.image === undefined || threeMap.image === null) {
                return null;
            }

            try {
                const dataUrl = GetDataUrl (threeMap.image);
                const base64Buffer = Base64DataURIToArrayBuffer (dataUrl);
                let texture = new TextureMap ();
                let textureName = null;
                if (objectUrlToFileName.has (threeMap.image.src)) {
                    textureName = objectUrlToFileName.get (threeMap.image.src);
                } else if (threeMap.name !== undefined && threeMap.name !== null) {
                    textureName = threeMap.name + '.' + GetFileExtensionFromMimeType (base64Buffer.mimeType);
                } else {
                    textureName = 'Embedded_' + threeMap.id.toString () + '.' + GetFileExtensionFromMimeType (base64Buffer.mimeType);
                }
                texture.name = textureName;
                texture.mimeType = base64Buffer.mimeType;
                texture.buffer = base64Buffer.buffer;
                texture.rotation = threeMap.rotation;
                texture.offset.x = threeMap.offset.x;
                texture.offset.y = threeMap.offset.y;
                texture.scale.x = threeMap.repeat.x;
                texture.scale.y = threeMap.repeat.y;
                return texture;
            } catch (err) {
                return null;
            }
        }

        if (threeMaterial.name === THREE.Loader.DEFAULT_MATERIAL_NAME) {
            return null;
        }

        let material = new PhongMaterial ();
        material.name = threeMaterial.name;
        material.color = this.ConvertThreeColor (threeMaterial.color);
        material.opacity = threeMaterial.opacity;
        material.transparent = threeMaterial.transparent;
        material.alphaTest = threeMaterial.alphaTest;
        if (threeMaterial.type === 'MeshPhongMaterial') {
            material.specular = this.ConvertThreeColor (threeMaterial.specular);
            material.shininess = threeMaterial.shininess / 100.0;
        }
        material.diffuseMap = CreateTexture (threeMaterial.map, this.objectUrlToFileName);
        material.normalMap = CreateTexture (threeMaterial.normalMap, this.objectUrlToFileName);
        material.bumpMap = CreateTexture (threeMaterial.bumpMap, this.objectUrlToFileName);

        return material;
    }

    ConvertThreeColor (threeColor)
    {
        if (this.colorConverter !== null) {
            threeColor = this.colorConverter.Convert (threeColor);
        }
        return ConvertThreeColorToColor (threeColor);
    }
}

class ImporterThreeFbx extends ImporterThreeBase
{
    constructor ()
    {
        super ();
        this.colorConverter = new ThreeLinearToSRGBColorConverter ();
    }

    CanImportExtension (extension)
    {
        return extension === 'fbx';
    }

    GetUpDirection ()
    {
        return Direction.Y;
    }

    CreateLoader (manager)
    {
        manager.addHandler (/\.tga$/i, new TGALoader (manager));
        return new FBXLoader (manager);
    }

    GetMainObject (loadedObject)
    {
        return loadedObject;
    }
}

class ImporterThreeDae extends ImporterThreeBase
{
    constructor ()
    {
        super ();
    }

    CanImportExtension (extension)
    {
        return extension === 'dae';
    }

    GetUpDirection ()
    {
        return Direction.Y;
    }

    CreateLoader (manager)
    {
        manager.addHandler (/\.tga$/i, new TGALoader (manager));
        return new ColladaLoader (manager);
    }

    GetMainObject (loadedObject)
    {
        return loadedObject.scene;
    }
}

class ImporterThreeWrl extends ImporterThreeBase
{
    constructor ()
    {
        super ();
        this.colorConverter = new ThreeLinearToSRGBColorConverter ();
    }

    CanImportExtension (extension)
    {
        return extension === 'wrl';
    }

    GetUpDirection ()
    {
        return Direction.Y;
    }

    CreateLoader (manager)
    {
        return new VRMLLoader (manager);
    }

    GetMainObject (loadedObject)
    {
        return loadedObject;
    }

    IsMeshVisible (mesh)
    {
        let isVisible = true;
        if (Array.isArray (mesh.material)) {
            for (let i = 0; i < mesh.material.length; i++) {
                if (mesh.material[i].side === THREE.BackSide) {
                    isVisible = false;
                    break;
                }
            }
        } else {
            isVisible = (mesh.material.side !== THREE.BackSide);
        }
        return isVisible;
    }
}

class ImporterThree3mf extends ImporterThreeBase
{
    constructor ()
    {
        super ();
        this.colorConverter = new ThreeSRGBToLinearColorConverter ();
    }

    CanImportExtension (extension)
    {
        return extension === '3mf';
    }

    GetUpDirection ()
    {
        return Direction.Z;
    }

    CreateLoader (manager)
    {
        return new ThreeMFLoader (manager);
    }

    GetMainObject (loadedObject)
    {
        return loadedObject;
    }
}

class ImporterThreeAmf extends ImporterThreeBase
{
    constructor ()
    {
        super ();
    }

    CanImportExtension (extension)
    {
        return extension === 'amf';
    }

    GetUpDirection ()
    {
        return Direction.Z;
    }

    CreateLoader (manager)
    {
        return new AMFLoader (manager);
    }

    GetMainObject (loadedObject)
    {
        return loadedObject;
    }
}

const DocumentInitResult =
{
    Success : 0,
    NoDocumentXml : 1
};

class FreeCadObject
{
    constructor (name, type)
    {
        this.name = name;
        this.type = type;
        this.shapeName = null;
        this.isVisible = false;
        this.color = null;
        this.fileName = null;
        this.fileContent = null;
        this.inLinkCount = 0;
        this.properties = null;
    }

    IsConvertible ()
    {
        if (this.fileName === null || this.fileContent === null) {
            return false;
        }
        if (!this.isVisible) {
            return false;
        }
        if (this.inLinkCount > 0) {
            return false;
        }
        return true;
    }
}

class FreeCadDocument
{
    constructor ()
    {
        this.files = null;
        this.properties = null;
        this.objectNames = [];
        this.objectData = new Map ();
    }

    Init (fileContent)
    {
        let fileContentBuffer = new Uint8Array (fileContent);
        this.files = fflate.unzipSync (fileContentBuffer);
        if (!this.LoadDocumentXml ()) {
            return DocumentInitResult.NoDocumentXml;
        }

        this.LoadGuiDocumentXml ();
        return DocumentInitResult.Success;
    }

    GetObjectListToConvert ()
    {
        let objectList = [];
        for (let objectName of this.objectNames) {
            let object = this.objectData.get (objectName);
            if (!object.IsConvertible ()) {
                continue;
            }
            objectList.push (object);
        }
        return objectList;
    }

    IsSupportedType (type)
    {
        if (!type.startsWith ('Part::') && !type.startsWith ('PartDesign::')) {
            return false;
        }
        if (type.indexOf ('Part2D') !== -1) {
            return false;
        }
        return true;
    }

    HasFile (fileName)
    {
        return (fileName in this.files);
    }

    LoadDocumentXml ()
    {
        let documentXml = this.GetXMLContent ('Document.xml');
        if (documentXml === null) {
            return false;
        }

        this.properties = new PropertyGroup ('Properties');
        let documentElements = documentXml.getElementsByTagName ('Document');
        for (let documentElement of documentElements) {
            for (let childNode of documentElement.childNodes) {
                if (childNode.tagName === 'Properties') {
                    this.GetPropertiesFromElement (childNode, this.properties);
                }
            }
        }

        let objectsElements = documentXml.getElementsByTagName ('Objects');
        for (let objectsElement of objectsElements) {
            let objectElements = objectsElement.getElementsByTagName ('Object');
            for (let objectElement of objectElements) {
                let name = objectElement.getAttribute ('name');
                let type = objectElement.getAttribute ('type');
                if (!this.IsSupportedType (type)) {
                    continue;
                }
                let object = new FreeCadObject (name, type);
                this.objectNames.push (name);
                this.objectData.set (name, object);
            }
        }

        let objectDataElements = documentXml.getElementsByTagName ('ObjectData');
        for (let objectDataElement of objectDataElements) {
            let objectElements = objectDataElement.getElementsByTagName ('Object');
            for (let objectElement of objectElements) {
                let name = objectElement.getAttribute ('name');
                if (!this.objectData.has (name)) {
                    continue;
                }

                let object = this.objectData.get (name);
                object.properties = new PropertyGroup ('Properties');
                for (let childNode of objectElement.childNodes) {
                    if (childNode.tagName === 'Properties') {
                        this.GetPropertiesFromElement (childNode, object.properties);
                    }
                }

                let propertyElements = objectElement.getElementsByTagName ('Property');
                for (let propertyElement of propertyElements) {
                    let propertyName = propertyElement.getAttribute ('name');
                    if (propertyName === 'Label') {
                        object.shapeName = this.GetFirstChildValue (propertyElement, 'String', 'value');
                    } else if (propertyName === 'Visibility') {
                        let isVisibleString = this.GetFirstChildValue (propertyElement, 'Bool', 'value');
                        object.isVisible = (isVisibleString === 'true');
                    } else if (propertyName === 'Visible') {
                        let isVisibleString = this.GetFirstChildValue (propertyElement, 'Bool', 'value');
                        object.isVisible = (isVisibleString === 'true');
                    } else if (propertyName === 'Shape') {
                        let fileName = this.GetFirstChildValue (propertyElement, 'Part', 'file');
                        if (!this.HasFile (fileName)) {
                            continue;
                        }
                        let extension = GetFileExtension (fileName);
                        if (extension !== 'brp' && extension !== 'brep') {
                            continue;
                        }
                        object.fileName = fileName;
                        object.fileContent = this.files[fileName];
                    }
                }

                let linkElements = objectElement.getElementsByTagName ('Link');
                for (let linkElement of linkElements) {
                    let linkedName = linkElement.getAttribute ('value');
                    if (this.objectData.has (linkedName)) {
                        let linkedObject = this.objectData.get (linkedName);
                        linkedObject.inLinkCount += 1;
                    }
                }
            }
        }

        return true;
    }

    LoadGuiDocumentXml ()
    {
        let documentXml = this.GetXMLContent ('GuiDocument.xml');
        if (documentXml === null) {
            return false;
        }

        let viewProviderElements = documentXml.getElementsByTagName ('ViewProvider');
        for (let viewProviderElement of viewProviderElements) {
            let name = viewProviderElement.getAttribute ('name');
            if (!this.objectData.has (name)) {
                continue;
            }

            let object = this.objectData.get (name);
            let propertyElements = viewProviderElement.getElementsByTagName ('Property');
            for (let propertyElement of propertyElements) {
                let propertyName = propertyElement.getAttribute ('name');
                if (propertyName === 'Visibility') {
                    let isVisibleString = this.GetFirstChildValue (propertyElement, 'Bool', 'value');
                    object.isVisible = (isVisibleString === 'true');
                } else if (propertyName === 'ShapeColor') {
                    let colorString = this.GetFirstChildValue (propertyElement, 'PropertyColor', 'value');
                    let rgba = parseInt (colorString, 10);
                    object.color = new RGBAColor (
                        rgba >> 24 & 0xff,
                        rgba >> 16 & 0xff,
                        rgba >> 8 & 0xff,
                        255
                    );
                }
            }
        }

        return true;
    }

    GetPropertiesFromElement (propertiesElement, propertyGroup)
    {
        let propertyElements = propertiesElement.getElementsByTagName ('Property');
        for (let propertyElement of propertyElements) {
            let propertyName = propertyElement.getAttribute ('name');
            let propertyType = propertyElement.getAttribute ('type');

            let property = null;
            if (propertyType === 'App::PropertyBool') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'String', 'bool');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Boolean, propertyName, propertyValue === 'true');
                }
            } else if (propertyType === 'App::PropertyInteger') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'Integer', 'value');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Integer, propertyName, parseInt (propertyValue));
                }
            } else if (propertyType === 'App::PropertyString') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'String', 'value');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Text, propertyName, propertyValue);
                }
            } else if (propertyType === 'App::PropertyUUID') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'Uuid', 'value');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Text, propertyName, propertyValue);
                }
            } else if (propertyType === 'App::PropertyFloat' || propertyType === 'App::PropertyLength' || propertyType === 'App::PropertyDistance' || propertyType === 'App::PropertyArea' || propertyType === 'App::PropertyVolume') {
                let propertyValue = this.GetFirstChildValue (propertyElement, 'Float', 'value');
                if (propertyValue !== null && propertyValue.length > 0) {
                    property = new Property (PropertyType.Number, propertyName, parseFloat (propertyValue));
                }
            }
            if (property !== null) {
                propertyGroup.AddProperty (property);
            }
        }
    }

    GetXMLContent (xmlFileName)
    {
        if (!this.HasFile (xmlFileName)) {
            return null;
        }

        let xmlParser = new DOMParser ();
        let xmlString = ArrayBufferToUtf8String (this.files[xmlFileName]);
        return xmlParser.parseFromString (xmlString, 'text/xml');
    }

    GetFirstChildValue (element, childTagName, childAttribute)
    {
        let childObjects = element.getElementsByTagName (childTagName);
        if (childObjects.length === 0) {
            return null;
        }
        return childObjects[0].getAttribute (childAttribute);
    }
}

class ImporterFcstd extends ImporterBase
{
    constructor ()
    {
        super ();
        this.worker = null;
        this.document = null;
    }

    CanImportExtension (extension)
    {
        return extension === 'fcstd';
    }

    GetUpDirection ()
    {
        return Direction.Z;
    }

	ClearContent ()
	{
        if (this.worker !== null) {
            this.worker.terminate ();
            this.worker = null;
        }
        this.document = null;
	}

    ResetContent ()
    {
        this.worker = null;
        this.document = new FreeCadDocument ();
    }

    ImportContent (fileContent, onFinish)
    {
        let result = this.document.Init (fileContent);
        if (result === DocumentInitResult.NoDocumentXml) {
            this.SetError ('No Document.xml found.');
            onFinish ();
            return;
        }

        if (this.document.properties !== null && this.document.properties.PropertyCount () > 0) {
            this.model.AddPropertyGroup (this.document.properties);
        }

        let objectsToConvert = this.document.GetObjectListToConvert ();
        if (objectsToConvert.length === 0) {
            this.SetError ('No importable object found.');
            onFinish ();
            return;
        }

        this.ConvertObjects (objectsToConvert, onFinish);
    }

    ConvertObjects (objects, onFinish)
    {
        let workerPath = GetExternalLibPath ('loaders/occt-import-js-worker.js');
        this.worker = new Worker (workerPath);

        let convertedObjectCount = 0;
        let colorToMaterial = new ColorToMaterialConverter (this.model);
        let onFileConverted = (resultContent) => {
            if (resultContent !== null) {
                let currentObject = objects[convertedObjectCount];
                this.OnFileConverted (currentObject, resultContent, colorToMaterial);
            }
            convertedObjectCount += 1;
            if (convertedObjectCount === objects.length) {
                onFinish ();
            } else {
                let currentObject = objects[convertedObjectCount];
                this.worker.postMessage ({
                    format : 'brep',
                    buffer : currentObject.fileContent
                });
            }
        };

        this.worker.addEventListener ('message', (ev) => {
            onFileConverted (ev.data);
        });

        this.worker.addEventListener ('error', (ev) => {
            onFileConverted (null);
        });

        let currentObject = objects[convertedObjectCount];
        this.worker.postMessage ({
            format : 'brep',
            buffer : currentObject.fileContent
        });
    }

    OnFileConverted (object, resultContent, colorToMaterial)
    {
        if (!resultContent.success || resultContent.meshes.length === 0) {
            return;
        }

        let objectNode = new Node ();
        if (object.shapeName !== null) {
            objectNode.SetName (object.shapeName);
        }

        let objectMeshIndex = 1;
        for (let resultMesh of resultContent.meshes) {
            let materialIndex = null;
            if (object.color !== null) {
                materialIndex = colorToMaterial.GetMaterialIndex (
                    object.color.r,
                    object.color.g,
                    object.color.b,
                    object.color.a
                );
            }
            let mesh = ConvertThreeGeometryToMesh (resultMesh, materialIndex, null);
            if (object.shapeName !== null) {
                let indexString = objectMeshIndex.toString ().padStart (3, '0');
                mesh.SetName (object.shapeName + ' ' + indexString);
            }

            if (object.properties !== null && object.properties.PropertyCount () > 0) {
                mesh.AddPropertyGroup (object.properties);
            }

            let meshIndex = this.model.AddMesh (mesh);
            objectNode.AddMeshIndex (meshIndex);
            objectMeshIndex += 1;
        }

        let rootNode = this.model.GetRootNode ();
        rootNode.AddChildNode (objectNode);
    }
}

class ImportSettings
{
    constructor ()
    {
        this.defaultColor = new RGBColor (200, 200, 200);
    }
}

const ImportErrorCode =
{
    NoImportableFile : 1,
    FailedToLoadFile : 2,
    ImportFailed : 3,
    UnknownError : 4
};

class ImportError
{
    constructor (code)
    {
        this.code = code;
        this.mainFile = null;
        this.message = null;
    }
}

class ImportResult
{
    constructor ()
    {
        this.model = null;
        this.mainFile = null;
        this.upVector = null;
        this.usedFiles = null;
        this.missingFiles = null;
    }
}

class ImporterFileAccessor
{
    constructor (getBufferCallback)
    {
        this.getBufferCallback = getBufferCallback;
        this.fileBuffers = new Map ();
    }

    GetFileBuffer (filePath)
    {
        let fileName = GetFileName (filePath);
        if (this.fileBuffers.has (fileName)) {
            return this.fileBuffers.get (fileName);
        }
        let buffer = this.getBufferCallback (fileName);
        this.fileBuffers.set (fileName, buffer);
        return buffer;
    }
}

class Importer
{
    constructor ()
    {
        this.importers = [
            new ImporterObj (),
            new ImporterStl (),
            new ImporterOff (),
            new ImporterPly (),
            new Importer3ds (),
            new ImporterGltf (),
            new ImporterBim (),
            new Importer3dm (),
            new ImporterIfc (),
            new ImporterOcct (),
            new ImporterFcstd (),
            new ImporterThreeFbx (),
            new ImporterThreeDae (),
            new ImporterThreeWrl (),
            new ImporterThree3mf (),
            new ImporterThreeAmf ()
        ];
        this.fileList = new ImporterFileList ();
        this.model = null;
        this.usedFiles = [];
        this.missingFiles = [];
    }

	AddImporter (importer)
	{
		this.importers.push (importer);
	}

    ImportFiles (inputFiles, settings, callbacks)
    {
        callbacks.onLoadStart ();
        this.LoadFiles (inputFiles, {
            onReady : () => {
                callbacks.onImportStart ();
                RunTaskAsync (() => {
                    this.DecompressArchives (this.fileList, () => {
                        this.ImportLoadedFiles (settings, callbacks);
                    });
                });
            },
            onFileListProgress : callbacks.onFileListProgress,
            onFileLoadProgress : callbacks.onFileLoadProgress
        });
    }

    LoadFiles (inputFiles, callbacks)
    {
        let newFileList = new ImporterFileList ();
        newFileList.FillFromInputFiles (inputFiles);

        let reset = false;
        if (this.HasImportableFile (newFileList)) {
            reset = true;
        } else {
            let foundMissingFile = false;
            for (let i = 0; i < this.missingFiles.length; i++) {
                let missingFile = this.missingFiles[i];
                if (newFileList.ContainsFileByPath (missingFile)) {
                    foundMissingFile = true;
                }
            }
            if (!foundMissingFile) {
                reset = true;
            } else {
                this.fileList.ExtendFromFileList (newFileList);
                reset = false;
            }
        }
        if (reset) {
            this.fileList = newFileList;
        }
        this.fileList.GetContent ({
            onReady : callbacks.onReady,
            onFileListProgress : callbacks.onFileListProgress,
            onFileLoadProgress : callbacks.onFileLoadProgress
        });
    }

    ImportLoadedFiles (settings, callbacks)
    {
        let importableFiles = this.GetImportableFiles (this.fileList);
        if (importableFiles.length === 0) {
            callbacks.onImportError (new ImportError (ImportErrorCode.NoImportableFile));
            return;
        }

        if (importableFiles.length === 1 || !callbacks.onSelectMainFile) {
            let mainFile = importableFiles[0];
            this.ImportLoadedMainFile (mainFile, settings, callbacks);
        } else {
            let fileNames = importableFiles.map (importableFile => importableFile.file.name);
            callbacks.onSelectMainFile (fileNames, (mainFileIndex) => {
                if (mainFileIndex === null) {
                    callbacks.onImportError (new ImportError (ImportErrorCode.NoImportableFile));
                    return;
                }
                RunTaskAsync (() => {
                    let mainFile = importableFiles[mainFileIndex];
                    this.ImportLoadedMainFile (mainFile, settings, callbacks);
                });
            });
        }
    }

    ImportLoadedMainFile (mainFile, settings, callbacks)
    {
        if (mainFile === null || mainFile.file === null || mainFile.file.content === null) {
            let error = new ImportError (ImportErrorCode.FailedToLoadFile);
            if (mainFile !== null && mainFile.file !== null) {
                error.mainFile = mainFile.file.name;
            }
            callbacks.onImportError (error);
            return;
        }

        this.model = null;
        this.usedFiles = [];
        this.missingFiles = [];
        this.usedFiles.push (mainFile.file.name);

        let importer = mainFile.importer;
        let fileAccessor = new ImporterFileAccessor ((fileName) => {
            let fileBuffer = null;
            let file = this.fileList.FindFileByPath (fileName);
            if (file === null || file.content === null) {
                this.missingFiles.push (fileName);
                fileBuffer = null;
            } else {
                this.usedFiles.push (fileName);
                fileBuffer = file.content;
            }
            return fileBuffer;
        });

        importer.Import (mainFile.file.name, mainFile.file.extension, mainFile.file.content, {
            getDefaultMaterialColor : () => {
                return settings.defaultColor;
            },
            getFileBuffer : (filePath) => {
                return fileAccessor.GetFileBuffer (filePath);
            },
            onSuccess : () => {
                this.model = importer.GetModel ();
                let result = new ImportResult ();
                result.mainFile = mainFile.file.name;
                result.model = this.model;
                result.usedFiles = this.usedFiles;
                result.missingFiles = this.missingFiles;
                result.upVector = importer.GetUpDirection ();
                callbacks.onImportSuccess (result);
            },
            onError : () => {
                let error = new ImportError (ImportErrorCode.ImportFailed);
                error.mainFile = mainFile.file.name;
                error.message = importer.GetErrorMessage ();
                callbacks.onImportError (error);
            },
            onComplete : () => {
                importer.Clear ();
            }
        });
    }

    DecompressArchives (fileList, onReady)
    {
        let files = fileList.GetFiles ();
        let archives = [];
        for (let file of files) {
            if (file.extension === 'zip') {
                archives.push (file);
            }
        }
        if (archives.length === 0) {
            onReady ();
            return;
        }
        for (let i = 0; i < archives.length; i++) {
            const archiveFile = archives[i];
            const archiveBuffer = new Uint8Array (archiveFile.content);
            const decompressed = fflate.unzipSync (archiveBuffer);
            for (const fileName in decompressed) {
                if (Object.prototype.hasOwnProperty.call (decompressed, fileName)) {
                    let file = new ImporterFile (fileName, FileSource.Decompressed, null);
                    file.SetContent (decompressed[fileName].buffer);
                    fileList.AddFile (file);
                }
            }
        }
        onReady ();
    }

    GetFileList ()
    {
        return this.fileList;
    }

    HasImportableFile (fileList)
    {
        let importableFiles = this.GetImportableFiles (fileList);
        return importableFiles.length > 0;
    }

    GetImportableFiles (fileList)
    {
        function FindImporter (file, importers)
        {
            for (let importerIndex = 0; importerIndex < importers.length; importerIndex++) {
                let importer = importers[importerIndex];
                if (importer.CanImportExtension (file.extension)) {
                    return importer;
                }
            }
            return null;
        }

        let importableFiles = [];
        let files = fileList.GetFiles ();
        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
            let file = files[fileIndex];
            let importer = FindImporter (file, this.importers);
            if (importer !== null) {
                importableFiles.push ({
                    file : file,
                    importer : importer
                });
            }
        }
        return importableFiles;
    }
}

class ImporterThreeSvg extends ImporterThreeBase
{
    constructor ()
    {
        super ();
    }

    CanImportExtension (extension)
    {
        return extension === 'svg';
    }

    GetUpDirection ()
    {
        return Direction.Z;
    }

    CreateLoader (manager)
    {
        return new SVGLoader (manager);
    }

    GetMainObject (loadedObject)
    {
        function ShowFill (path)
        {
            const style = path.userData.style;
            if (style.fill === undefined || style.fill === 'none') {
                return false;
            }
            return true;
        }

        function GetOrCreateMaterial (materials, style, opacity)
        {
            let material = null;
            for (let existingMaterial of materials) {
                if (existingMaterial.style === style && existingMaterial.opacity === opacity) {
                    material = existingMaterial.material;
                    break;
                }
            }
            if (material === null) {
                material = new THREE.MeshPhongMaterial ({
                    color: new THREE.Color ().setStyle (style),
                    opacity: opacity,
                    transparent: opacity < 1.0
                });
                materials.push ({
                    style : style,
                    opacity : opacity,
                    material : material
                });
            }
            return material;
        }

        let materials = [];

        let object = new THREE.Object3D ();
        object.rotation.x = Math.PI;

        for (let path of loadedObject.paths) {
            const shapes = SVGLoader.createShapes (path);
            if (ShowFill (path)) {
                let pathStyle = path.userData.style;
                let pathMaterial = GetOrCreateMaterial (materials, pathStyle.fill, pathStyle.opacity);
                for (const shape of shapes) {
                    const geometry = new THREE.ExtrudeGeometry (shape, {
                        depth: 10,
                        bevelEnabled: false
                    });
                    const mesh = new THREE.Mesh (geometry, pathMaterial);
                    mesh.name = path.userData.node.id;
                    object.add (mesh);
                }
            }
        }
        return object;
    }
}

class GeneratorParams
{
    constructor ()
    {
        this.name = null;
        this.material = null;
    }

    SetName (name)
    {
        this.name = name;
        return this;
    }

    SetMaterial (material)
    {
        this.material = material;
        return this;
    }
}

class Generator
{
    constructor (params)
    {
        this.params = params || new GeneratorParams ();
        this.mesh = new Mesh ();
        if (this.params.name !== null) {
            this.mesh.SetName (this.params.name);
        }
        this.curve = null;
    }

    GetMesh ()
    {
        return this.mesh;
    }

    AddVertex (x, y, z)
    {
        let coord = new Coord3D (x, y, z);
        return this.mesh.AddVertex (coord);
    }

    AddVertices (vertices)
    {
        let indices = [];
        for (let i = 0; i < vertices.length; i++) {
            let vertex = vertices[i];
            indices.push (this.AddVertex (vertex.x, vertex.y, vertex.z));
        }
        return indices;
    }

    SetCurve (curve)
    {
        this.curve = curve;
    }

    ResetCurve ()
    {
        this.curve = null;
    }

    AddTriangle (v0, v1, v2)
    {
        let triangle = new Triangle (v0, v1, v2);
        if (this.params.material !== null) {
            triangle.mat = this.params.material;
        }
        if (this.curve !== null) {
            triangle.SetCurve (this.curve);
        }
        return this.mesh.AddTriangle (triangle);
    }

    AddTriangleInverted (v0, v1, v2)
    {
        this.AddTriangle (v0, v2, v1);
    }

    AddConvexPolygon (vertices)
    {
        for (let vertexIndex = 0; vertexIndex < vertices.length - 2; vertexIndex++) {
            this.AddTriangle (
                vertices[0],
                vertices[vertexIndex + 1],
                vertices[vertexIndex + 2]
            );
        }
    }

    AddConvexPolygonInverted (vertices)
    {
        for (let vertexIndex = 0; vertexIndex < vertices.length - 2; vertexIndex++) {
            this.AddTriangleInverted (
                vertices[0],
                vertices[vertexIndex + 1],
                vertices[vertexIndex + 2]
            );
        }
    }
}

class GeneratorHelper
{
    constructor (generator)
    {
        this.generator = generator;
    }

    GenerateSurfaceBetweenPolygons (startIndices, endIndices)
    {
        if (startIndices.length !== endIndices.length) {
            return;
        }
        const vertexCount = startIndices.length;
        for (let i = 0; i < vertexCount; i++) {
            const index = i;
            const nextIndex = (i < vertexCount - 1) ? index + 1 : 0;
            this.generator.AddConvexPolygon ([
                startIndices[index],
                startIndices[nextIndex],
                endIndices[nextIndex],
                endIndices[index]
            ]);
        }
    }

    GenerateTriangleFan (startIndices, endIndex)
    {
        const vertexCount = startIndices.length;
        for (let i = 0; i < vertexCount; i++) {
            const index = i;
            const nextIndex = (i < vertexCount - 1) ? index + 1 : 0;
            this.generator.AddTriangle (
                endIndex,
                startIndices[index],
                startIndices[nextIndex]
            );
        }
    }
}

function GetCylindricalCoord (radius, angle)
{
    return new Coord2D (
        radius * Math.cos (angle),
        radius * Math.sin (angle)
    );
}

function GenerateCuboid (genParams, xSize, ySize, zSize)
{
    if (!IsPositive (xSize) || !IsPositive (ySize) || !IsPositive (zSize)) {
        return null;
    }

    let generator = new Generator (genParams);

    generator.AddVertex (0.0, 0.0, 0.0);
    generator.AddVertex (xSize, 0.0, 0.0);
    generator.AddVertex (xSize, ySize, 0.0);
    generator.AddVertex (0.0, ySize, 0.0);
    generator.AddVertex (0.0, 0.0, zSize);
    generator.AddVertex (xSize, 0.0, zSize);
    generator.AddVertex (xSize, ySize, zSize);
    generator.AddVertex (0.0, ySize, zSize);

    generator.AddConvexPolygon ([0, 3, 2, 1]);
    generator.AddConvexPolygon ([0, 1, 5, 4]);
    generator.AddConvexPolygon ([1, 2, 6, 5]);
    generator.AddConvexPolygon ([2, 3, 7, 6]);
    generator.AddConvexPolygon ([3, 0, 4, 7]);
    generator.AddConvexPolygon ([4, 5, 6, 7]);

    return generator.GetMesh ();
}

function GenerateCone (genParams, topRadius, bottomRadius, height, segments, smooth)
{
    if (IsNegative (topRadius) || IsNegative (bottomRadius)) {
        return null;
    }

    if (!IsPositive (height) || segments < 3) {
        return null;
    }

    let isZeroTop = IsZero (topRadius);
    let isZeroBottom = IsZero (bottomRadius);
    if (isZeroTop && isZeroBottom) {
        return null;
    }

    let generator = new Generator (genParams);
    let helper = new GeneratorHelper (generator);
    const step = 2.0 * Math.PI / segments;
    const curve = (smooth ? 1 : null);

    let topPolygon = [];
    if (isZeroTop) {
        topPolygon.push (generator.AddVertex (0.0, 0.0, height));
    } else {
        for (let i = 0; i < segments; i++) {
            let topVertex = GetCylindricalCoord (topRadius, i * step);
            topPolygon.push (generator.AddVertex (topVertex.x, topVertex.y, height));
        }
    }

    let bottomPolygon = [];
    if (isZeroBottom) {
        bottomPolygon.push (generator.AddVertex (0.0, 0.0, 0.0));
    } else {
        for (let i = 0; i < segments; i++) {
            let bottomVertex = GetCylindricalCoord (bottomRadius, i * step);
            bottomPolygon.push (generator.AddVertex (bottomVertex.x, bottomVertex.y, 0.0));
        }
    }

    if (isZeroTop) {
        generator.SetCurve (curve);
        helper.GenerateTriangleFan (bottomPolygon, topPolygon[0]);
        generator.ResetCurve ();
        generator.AddConvexPolygonInverted (bottomPolygon);
    } else if (isZeroBottom) {
        generator.SetCurve (curve);
        helper.GenerateTriangleFan (topPolygon.slice ().reverse (), bottomPolygon[0]);
        generator.ResetCurve ();
        generator.AddConvexPolygon (topPolygon);
    } else {
        generator.SetCurve (curve);
        helper.GenerateSurfaceBetweenPolygons (bottomPolygon, topPolygon);
        generator.ResetCurve ();
        generator.AddConvexPolygonInverted (bottomPolygon);
        generator.AddConvexPolygon (topPolygon);
    }

    return generator.GetMesh ();
}

function GenerateCylinder (genParams, radius, height, segments, smooth)
{
    return GenerateCone (genParams, radius, radius, height, segments, smooth);
}

function GenerateSphere (genParams, radius, segments, smooth)
{
    function GetSphericalCoord (radius, theta, phi)
    {
        return new Coord3D (
            radius * Math.sin (theta) * Math.cos (phi),
            radius * Math.sin (theta) * Math.sin (phi),
            radius * Math.cos (theta)
        );
    }

    if (!IsPositive (radius) || segments < 3) {
        return null;
    }

    let generator = new Generator (genParams);
    let helper = new GeneratorHelper (generator);

    generator.SetCurve (smooth ? 1 : null);

    let allLevelVertices = [];
    let levels = segments + 1;
    const levelStep = Math.PI / segments;
	const cylindricalStep = 2.0 * Math.PI / segments;
    for (let levelIndex = 1; levelIndex < levels - 1; levelIndex++) {
        let levelVertices = [];
        let theta = levelIndex * levelStep;
        for (let cylindricalIndex = 0; cylindricalIndex < segments; cylindricalIndex++) {
            let phi = cylindricalIndex * cylindricalStep;
            let vertex = GetSphericalCoord (radius, theta, -phi);
            levelVertices.push (generator.AddVertex (vertex.x, vertex.y, vertex.z));
        }
        if (levelIndex > 1) {
            helper.GenerateSurfaceBetweenPolygons (allLevelVertices[allLevelVertices.length - 1], levelVertices);
        }
        allLevelVertices.push (levelVertices);
    }

    let topVertex = generator.AddVertex (0.0, 0.0, radius);
    let bottomVertex = generator.AddVertex (0.0, 0.0, -radius);
    helper.GenerateTriangleFan (allLevelVertices[0].slice ().reverse (), topVertex);
    helper.GenerateTriangleFan (allLevelVertices[allLevelVertices.length - 1], bottomVertex);

    generator.ResetCurve ();

    return generator.GetMesh ();
}

function GeneratePlatonicSolid (genParams, type, radius)
{
    function AddVertex (generator, radius, x, y, z)
    {
        let vertex = new Coord3D (x, y, z);
        vertex.MultiplyScalar (radius / vertex.Length ());
        generator.AddVertex (vertex.x, vertex.y, vertex.z);
    }

    if (!IsPositive (radius)) {
        return null;
    }

    let generator = new Generator (genParams);
    if (type === 'tetrahedron') {
        let a = 1.0;
        AddVertex (generator, radius, +a, +a, +a);
        AddVertex (generator, radius, -a, -a, +a);
        AddVertex (generator, radius, -a, +a, -a);
        AddVertex (generator, radius, +a, -a, -a);
        generator.AddTriangle (0, 1, 3);
        generator.AddTriangle (0, 2, 1);
        generator.AddTriangle (0, 3, 2);
        generator.AddTriangle (1, 2, 3);
    } else if (type === 'hexahedron') {
        let a = 1.0;
        AddVertex (generator, radius, +a, +a, +a);
        AddVertex (generator, radius, +a, +a, -a);
        AddVertex (generator, radius, +a, -a, +a);
        AddVertex (generator, radius, +a, -a, -a);
        AddVertex (generator, radius, -a, +a, +a);
        AddVertex (generator, radius, -a, +a, -a);
        AddVertex (generator, radius, -a, -a, +a);
        AddVertex (generator, radius, -a, -a, -a);
        generator.AddConvexPolygon ([0, 1, 5, 4]);
        generator.AddConvexPolygon ([0, 2, 3, 1]);
        generator.AddConvexPolygon ([0, 4, 6, 2]);
        generator.AddConvexPolygon ([1, 3, 7, 5]);
        generator.AddConvexPolygon ([2, 6, 7, 3]);
        generator.AddConvexPolygon ([4, 5, 7, 6]);
    } else if (type === 'octahedron') {
        let a = 1.0;
        let b = 0.0;
        AddVertex (generator, radius, +a, +b, +b);
        AddVertex (generator, radius, -a, +b, +b);
        AddVertex (generator, radius, +b, +a, +b);
        AddVertex (generator, radius, +b, -a, +b);
        AddVertex (generator, radius, +b, +b, +a);
        AddVertex (generator, radius, +b, +b, -a);
        generator.AddTriangle (0, 2, 4);
        generator.AddTriangle (0, 3, 5);
        generator.AddTriangle (0, 4, 3);
        generator.AddTriangle (0, 5, 2);
        generator.AddTriangle (1, 2, 5);
        generator.AddTriangle (1, 3, 4);
        generator.AddTriangle (1, 4, 2);
        generator.AddTriangle (1, 5, 3);
    } else if (type === 'dodecahedron') {
        let a = 1.0;
        let b = 0.0;
        let c = (1.0 + Math.sqrt (5.0)) / 2.0;
        let d = 1.0 / c;
        AddVertex (generator, radius, +a, +a, +a);
        AddVertex (generator, radius, +a, +a, -a);
        AddVertex (generator, radius, +a, -a, +a);
        AddVertex (generator, radius, -a, +a, +a);
        AddVertex (generator, radius, +a, -a, -a);
        AddVertex (generator, radius, -a, +a, -a);
        AddVertex (generator, radius, -a, -a, +a);
        AddVertex (generator, radius, -a, -a, -a);
        AddVertex (generator, radius, +b, +d, +c);
        AddVertex (generator, radius, +b, +d, -c);
        AddVertex (generator, radius, +b, -d, +c);
        AddVertex (generator, radius, +b, -d, -c);
        AddVertex (generator, radius, +d, +c, +b);
        AddVertex (generator, radius, +d, -c, +b);
        AddVertex (generator, radius, -d, +c, +b);
        AddVertex (generator, radius, -d, -c, +b);
        AddVertex (generator, radius, +c, +b, +d);
        AddVertex (generator, radius, -c, +b, +d);
        AddVertex (generator, radius, +c, +b, -d);
        AddVertex (generator, radius, -c, +b, -d);
        generator.AddConvexPolygon ([0, 8, 10, 2, 16]);
        generator.AddConvexPolygon ([0, 16, 18, 1, 12]);
        generator.AddConvexPolygon ([0, 12, 14, 3, 8]);
        generator.AddConvexPolygon ([1, 9, 5, 14, 12]);
        generator.AddConvexPolygon ([1, 18, 4, 11, 9]);
        generator.AddConvexPolygon ([2, 10, 6, 15, 13]);
        generator.AddConvexPolygon ([2, 13, 4, 18, 16]);
        generator.AddConvexPolygon ([3, 14, 5, 19, 17]);
        generator.AddConvexPolygon ([3, 17, 6, 10, 8]);
        generator.AddConvexPolygon ([4, 13, 15, 7, 11]);
        generator.AddConvexPolygon ([5, 9, 11, 7, 19]);
        generator.AddConvexPolygon ([6, 17, 19, 7, 15]);
    } else if (type === 'icosahedron') {
        let a = 1.0;
        let b = 0.0;
        let c = (1.0 + Math.sqrt (5.0)) / 2.0;
        AddVertex (generator, radius, +b, +a, +c);
        AddVertex (generator, radius, +b, +a, -c);
        AddVertex (generator, radius, +b, -a, +c);
        AddVertex (generator, radius, +b, -a, -c);
        AddVertex (generator, radius, +a, +c, +b);
        AddVertex (generator, radius, +a, -c, +b);
        AddVertex (generator, radius, -a, +c, +b);
        AddVertex (generator, radius, -a, -c, +b);
        AddVertex (generator, radius, +c, +b, +a);
        AddVertex (generator, radius, +c, +b, -a);
        AddVertex (generator, radius, -c, +b, +a);
        AddVertex (generator, radius, -c, +b, -a);
        generator.AddTriangle (0, 2, 8);
        generator.AddTriangle (0, 4, 6);
        generator.AddTriangle (0, 6, 10);
        generator.AddTriangle (0, 8, 4);
        generator.AddTriangle (0, 10, 2);
        generator.AddTriangle (1, 3, 11);
        generator.AddTriangle (1, 4, 9);
        generator.AddTriangle (1, 6, 4);
        generator.AddTriangle (1, 9, 3);
        generator.AddTriangle (1, 11, 6);
        generator.AddTriangle (2, 5, 8);
        generator.AddTriangle (2, 7, 5);
        generator.AddTriangle (2, 10, 7);
        generator.AddTriangle (3, 5, 7);
        generator.AddTriangle (3, 7, 11);
        generator.AddTriangle (3, 9, 5);
        generator.AddTriangle (4, 8, 9);
        generator.AddTriangle (5, 9, 8);
        generator.AddTriangle (6, 11, 10);
        generator.AddTriangle (7, 10, 11);
    }
    return generator.GetMesh ();
}

function GetTriangleArea (v0, v1, v2)
{
    const a = CoordDistance3D (v0, v1);
    const b = CoordDistance3D (v1, v2);
    const c = CoordDistance3D (v0, v2);
    const s = (a + b + c) / 2.0;
    const areaSquare = s * (s - a) * (s - b) * (s - c);
    if (areaSquare < 0.0) {
        return 0.0;
    }
    return Math.sqrt (areaSquare);
}

function GetTetrahedronSignedVolume (v0, v1, v2)
{
    return DotVector3D (v0, CrossVector3D (v1, v2)) / 6.0;
}

function CalculateVolume (object3D)
{
    if (object3D instanceof Model) {
        let volume = 0.0;
        object3D.EnumerateMeshInstances ((meshInstance) => {
            volume += CalculateVolume (meshInstance);
        });
        return volume;
    } else {
        let volume = 0.0;
        object3D.EnumerateTriangleVertices ((v0, v1, v2) => {
            volume += GetTetrahedronSignedVolume (v0, v1, v2);
        });
        return volume;
    }
}

function CalculateSurfaceArea (object3D)
{
    let surface = 0.0;
    object3D.EnumerateTriangleVertices ((v0, v1, v2) => {
        surface += GetTriangleArea (v0, v1, v2);
    });
    return surface;
}

/**
 * Camera navigation mode.
 * @enum
 */
const NavigationMode =
{
    /** Fixed up vector. */
	FixedUpVector : 1,
    /** Free orbit. */
	FreeOrbit : 2
};

/**
 * Camera projection mode.
 * @enum
 */
const ProjectionMode =
{
    /** Perspective projection. */
	Perspective : 1,
    /** Orthographic projection. */
	Orthographic : 2
};

/**
 * Camera object.
 */
class Camera
{
    /**
     * @param {Coord3D} eye Eye position.
     * @param {Coord3D} center Center position. Sometimes it's called target or look at position.
     * @param {Coord3D} up Up vector.
     * @param {number} fov Field of view in degrees.
     */
    constructor (eye, center, up, fov)
    {
        this.eye = eye;
        this.center = center;
        this.up = up;
        this.fov = fov;
    }

    /**
     * Creates a clone of the object.
     * @returns {Camera}
     */
    Clone ()
    {
        return new Camera (
            this.eye.Clone (),
            this.center.Clone (),
            this.up.Clone (),
            this.fov
        );
    }
}

function CameraIsEqual3D (a, b)
{
	return CoordIsEqual3D (a.eye, b.eye) && CoordIsEqual3D (a.center, b.center) && CoordIsEqual3D (a.up, b.up) && IsEqual (a.fov, b.fov);
}

function SetThreeMeshPolygonOffset (mesh, offset)
{
    function SetMaterialsPolygonOffset (materials, offset)
    {
        for (let material of materials) {
            material.polygonOffset = offset;
            material.polygonOffsetUnit = 1;
            material.polygonOffsetFactor = 1;
        }
    }

    SetMaterialsPolygonOffset (mesh.material, offset);
    if (mesh.userData.threeMaterials) {
        SetMaterialsPolygonOffset (mesh.userData.threeMaterials, offset);
    }
}

class ViewerModel
{
    constructor (scene)
    {
        this.scene = scene;
        this.rootObject = null;
    }

    IsEmpty ()
    {
        return this.rootObject === null;
    }

    SetRootObject (rootObject)
    {
        if (this.rootObject !== null) {
            this.Clear ();
        }
        this.rootObject = rootObject;
        this.scene.add (this.rootObject);
    }

    GetRootObject ()
    {
        return this.rootObject;
    }

    AddObject (object)
    {
        if (this.rootObject === null) {
            let newRootObject = new THREE.Object3D ();
            this.SetRootObject (newRootObject);
        }
        this.rootObject.add (object);
    }

    Traverse (enumerator)
    {
        if (this.rootObject === null) {
            return;
        }
        this.rootObject.traverse ((obj) => {
            enumerator (obj);
        });
    }

    UpdateWorldMatrix ()
    {
        if (this.rootObject !== null) {
            this.rootObject.updateWorldMatrix (true, true);
        }
    }

    Clear ()
    {
        DisposeThreeObjects (this.rootObject);
        this.scene.remove (this.rootObject);
        this.rootObject = null;
    }
}

/**
 * Edge settings object.
 */
class EdgeSettings
{
    /**
     * @param {boolean} showEdges Show edges.
     * @param {RGBColor} edgeColor Color of the edges.
     * @param {number} edgeThreshold Minimum angle between faces to show edges between them in.
     * The value must be in degrees.
     */
    constructor (showEdges, edgeColor, edgeThreshold)
    {
        this.showEdges = showEdges;
        this.edgeColor = edgeColor;
        this.edgeThreshold = edgeThreshold;
    }

    /**
     * Creates a clone of the object.
     * @returns {EdgeSettings}
     */
    Clone ()
    {
        return new EdgeSettings (this.showEdges, this.edgeColor.Clone (), this.edgeThreshold);
    }
}

class ViewerMainModel
{
    constructor (scene)
    {
        this.scene = scene;

        this.mainModel = new ViewerModel (this.scene);
        this.edgeModel = new ViewerModel (this.scene);

        this.edgeSettings = new EdgeSettings (false, new RGBColor (0, 0, 0), 1);
    }

    SetMainObject (mainObject)
    {
        this.mainModel.SetRootObject (mainObject);
        if (this.edgeSettings.showEdges) {
            this.GenerateEdgeModel ();
        }
    }

    UpdateWorldMatrix ()
    {
        this.mainModel.UpdateWorldMatrix ();
        this.edgeModel.UpdateWorldMatrix ();
    }

    SetEdgeSettings (edgeSettings)
    {
        let needToGenerate = false;
        if (edgeSettings.showEdges && (!this.edgeSettings.showEdges || this.edgeSettings.edgeThreshold !== edgeSettings.edgeThreshold)) {
            needToGenerate = true;
        }

        this.edgeSettings = edgeSettings;

        if (this.mainModel.IsEmpty ()) {
            return;
        }

        if (this.edgeSettings.showEdges) {
            if (needToGenerate) {
                this.ClearEdgeModel ();
                this.GenerateEdgeModel ();
            } else {
                let edgeColor = ConvertColorToThreeColor (this.edgeSettings.edgeColor);
                this.EnumerateEdges ((edge) => {
                    edge.material.color = edgeColor;
                });
            }
        } else {
            this.ClearEdgeModel ();
        }
    }

    GenerateEdgeModel ()
    {
        let edgeColor = ConvertColorToThreeColor (this.edgeSettings.edgeColor);

        this.UpdateWorldMatrix ();
        this.EnumerateMeshes ((mesh) => {
            SetThreeMeshPolygonOffset (mesh, true);
            let edges = new THREE.EdgesGeometry (mesh.geometry, this.edgeSettings.edgeThreshold);
            let line = new THREE.LineSegments (edges, new THREE.LineBasicMaterial ({
                color: edgeColor
            }));
            line.applyMatrix4 (mesh.matrixWorld);
            line.userData = mesh.userData;
            line.visible = mesh.visible;
            this.edgeModel.AddObject (line);
        });
    }

    GetBoundingBox (needToProcess)
    {
        let hasMesh = false;
        let boundingBox = new THREE.Box3 ();
        this.EnumerateMeshes ((mesh) => {
            if (needToProcess (mesh.userData)) {
                boundingBox.union (new THREE.Box3 ().setFromObject (mesh));
                hasMesh = true;
            }
        });
        if (!hasMesh) {
            return null;
        }
        return boundingBox;
    }

    GetBoundingSphere (needToProcess)
    {
        let boundingBox = this.GetBoundingBox (needToProcess);
        if (boundingBox === null) {
            return null;
        }

        let boundingSphere = new THREE.Sphere ();
        boundingBox.getBoundingSphere (boundingSphere);
        return boundingSphere;
    }

    Clear ()
    {
        this.mainModel.Clear ();
        this.ClearEdgeModel ();
    }

    ClearEdgeModel ()
    {
        if (this.edgeModel.IsEmpty ()) {
            return;
        }

        this.EnumerateMeshes ((mesh) => {
            SetThreeMeshPolygonOffset (mesh, false);
        });
        this.edgeModel.Clear ();
    }

    EnumerateMeshes (enumerator)
    {
        this.mainModel.Traverse ((obj) => {
            if (obj.isMesh) {
                enumerator (obj);
            }
        });
    }

    EnumerateEdges (enumerator)
    {
        this.edgeModel.Traverse ((obj) => {
            if (obj.isLineSegments) {
                enumerator (obj);
            }
        });
    }

    GetMeshIntersectionUnderMouse (mouseCoords, camera, width, height)
    {
        if (this.mainModel.IsEmpty ()) {
            return null;
        }

        if (mouseCoords.x < 0.0 || mouseCoords.x > width || mouseCoords.y < 0.0 || mouseCoords.y > height) {
            return null;
        }

        let raycaster = new THREE.Raycaster ();
        let mousePos = new THREE.Vector2 ();
        mousePos.x = (mouseCoords.x / width) * 2 - 1;
        mousePos.y = -(mouseCoords.y / height) * 2 + 1;
        raycaster.setFromCamera (mousePos, camera);
        let iSectObjects = raycaster.intersectObject (this.mainModel.GetRootObject (), true);
        for (let i = 0; i < iSectObjects.length; i++) {
            let iSectObject = iSectObjects[i];
            if (iSectObject.object.isMesh && iSectObject.object.visible) {
                return iSectObject;
            }
        }

        return null;
    }
}

let ParameterConverter =
{
    IntegerToString (integer)
    {
        return integer.toString ();
    },

    StringToInteger (str)
    {
        return parseInt (str, 10);
    },

    NumberToString (number)
    {
        let precision = 5;
        return number.toFixed (precision);
    },

    StringToNumber (str)
    {
        return parseFloat (str);
    },

    ModelUrlsToString : function (urls)
    {
        if (urls === null) {
            return null;
        }
        return urls.join (',');
    },

    StringToModelUrls : function (str)
    {
        if (str === null || str.length === 0) {
            return null;
        }
        return str.split (',');
    },

    CameraToString : function (camera)
    {
        if (camera === null) {
            return null;
        }
        let cameraParameters = [
            this.NumberToString (camera.eye.x), this.NumberToString (camera.eye.y), this.NumberToString (camera.eye.z),
            this.NumberToString (camera.center.x), this.NumberToString (camera.center.y), this.NumberToString (camera.center.z),
            this.NumberToString (camera.up.x), this.NumberToString (camera.up.y), this.NumberToString (camera.up.z),
            this.NumberToString (camera.fov)
        ].join (',');
        return cameraParameters;
    },

    ProjectionModeToString : function (projectionMode)
    {
        if (projectionMode === ProjectionMode.Perspective) {
            return 'perspective';
        } else if (projectionMode === ProjectionMode.Orthographic) {
            return 'orthographic';
        }
        return null;
    },

    StringToCamera : function (str)
    {
        if (str === null || str.length === 0) {
            return null;
        }
        let paramParts = str.split (',');
        if (paramParts.length !== 9 && paramParts.length !== 10) {
            return null;
        }

        let fieldOfView = 45.0;
        if (paramParts.length >= 10) {
            fieldOfView = this.StringToNumber (paramParts[9]);
        }

        let camera = new Camera (
            new Coord3D (this.StringToNumber (paramParts[0]), this.StringToNumber (paramParts[1]), this.StringToNumber (paramParts[2])),
            new Coord3D (this.StringToNumber (paramParts[3]), this.StringToNumber (paramParts[4]), this.StringToNumber (paramParts[5])),
            new Coord3D (this.StringToNumber (paramParts[6]), this.StringToNumber (paramParts[7]), this.StringToNumber (paramParts[8])),
            fieldOfView
        );
        return camera;
    },

    StringToProjectionMode : function (str)
    {
        if (str === 'perspective') {
            return ProjectionMode.Perspective;
        } else if (str === 'orthographic') {
            return ProjectionMode.Orthographic;
        }
        return null;
    },

    RGBColorToString : function (color)
    {
        if (color === null) {
            return null;
        }
        return [
            this.IntegerToString (color.r),
            this.IntegerToString (color.g),
            this.IntegerToString (color.b)
        ].join (',');
    },

    RGBAColorToString : function (color)
    {
        if (color === null) {
            return null;
        }
        return [
            this.IntegerToString (color.r),
            this.IntegerToString (color.g),
            this.IntegerToString (color.b),
            this.IntegerToString (color.a)
        ].join (',');
    },

    StringToRGBColor : function (str)
    {
        if (str === null || str.length === 0) {
            return null;
        }
        let paramParts = str.split (',');
        if (paramParts.length !== 3) {
            return null;
        }
        return new RGBColor (
            this.StringToInteger (paramParts[0]),
            this.StringToInteger (paramParts[1]),
            this.StringToInteger (paramParts[2])
        );
    },

    StringToRGBAColor : function (str)
    {
        if (str === null || str.length === 0) {
            return null;
        }
        let paramParts = str.split (',');
        if (paramParts.length !== 3 && paramParts.length !== 4) {
            return null;
        }
        let color = new RGBAColor (
            this.StringToInteger (paramParts[0]),
            this.StringToInteger (paramParts[1]),
            this.StringToInteger (paramParts[2]),
            255
        );
        if (paramParts.length === 4) {
            color.a = this.StringToInteger (paramParts[3]);
        }
        return color;
    },

    EnvironmentSettingsToString (environmentSettings)
    {
        if (environmentSettings === null) {
            return null;
        }
        let environmentSettingsParameters = [
            environmentSettings.environmentMapName,
            environmentSettings.backgroundIsEnvMap ? 'on' : 'off'
        ].join (',');
        return environmentSettingsParameters;
    },

    StringToEnvironmentSettings : function (str)
    {
        if (str === null || str.length === 0) {
            return null;
        }
        let paramParts = str.split (',');
        if (paramParts.length !== 2) {
            return null;
        }
        let environmentSettings = {
            environmentMapName : paramParts[0],
            backgroundIsEnvMap : paramParts[1] === 'on' ? true : false
        };
        return environmentSettings;
    },

    EdgeSettingsToString : function (edgeSettings)
    {
        if (edgeSettings === null) {
            return null;
        }
        let edgeSettingsParameters = [
            edgeSettings.showEdges ? 'on' : 'off',
            this.RGBColorToString (edgeSettings.edgeColor),
            this.IntegerToString (edgeSettings.edgeThreshold),
        ].join (',');
        return edgeSettingsParameters;
    },

    StringToEdgeSettings : function (str)
    {
        if (str === null || str.length === 0) {
            return null;
        }
        let paramParts = str.split (',');
        if (paramParts.length !== 5) {
            return null;
        }
        let edgeSettings = new EdgeSettings (
            paramParts[0] === 'on' ? true : false,
            new RGBColor (
                this.StringToInteger (paramParts[1]),
                this.StringToInteger (paramParts[2]),
                this.StringToInteger (paramParts[3])
            ),
            this.StringToInteger (paramParts[4])
        );
        return edgeSettings;
    }
};

class ParameterListBuilder
{
    constructor (separator)
    {
        this.separator = separator;
        this.paramList = '';
    }

    AddModelUrls (urls)
    {
        this.AddUrlPart ('model', ParameterConverter.ModelUrlsToString (urls));
        return this;
    }

    AddCamera (camera)
    {
        this.AddUrlPart ('camera', ParameterConverter.CameraToString (camera));
        return this;
    }

    AddProjectionMode (projectionMode)
    {
        this.AddUrlPart ('projectionmode', ParameterConverter.ProjectionModeToString (projectionMode));
        return this;
    }

    AddEnvironmentSettings (envSettings)
    {
        this.AddUrlPart ('envsettings', ParameterConverter.EnvironmentSettingsToString (envSettings));
        return this;
    }

    AddBackgroundColor (background)
    {
        this.AddUrlPart ('backgroundcolor', ParameterConverter.RGBAColorToString (background));
        return this;
    }

    AddDefaultColor (color)
    {
        this.AddUrlPart ('defaultcolor', ParameterConverter.RGBColorToString (color));
        return this;
    }

    AddEdgeSettings (edgeSettings)
    {
        this.AddUrlPart ('edgesettings', ParameterConverter.EdgeSettingsToString (edgeSettings));
        return this;
    }

    AddUrlPart (keyword, urlPart)
    {
        if (keyword === null || urlPart === null) {
            return;
        }
        if (this.paramList.length > 0) {
            this.paramList += this.separator;
        }
        this.paramList += keyword + '=' + urlPart;
    }

    GetParameterList ()
    {
        return this.paramList;
    }
}

class ParameterListParser
{
    constructor (paramList, separator)
    {
        this.separator = separator;
        this.paramList = paramList;
    }

    GetModelUrls ()
    {
        // detect legacy links
        if (this.paramList.indexOf ('=') === -1) {
            return this.paramList.split (',');
        }

        let keywordParams = this.GetKeywordParams ('model');
        return ParameterConverter.StringToModelUrls (keywordParams);
    }

    GetCamera ()
    {
        let keywordParams = this.GetKeywordParams ('camera');
        return ParameterConverter.StringToCamera (keywordParams);
    }

    GetProjectionMode ()
    {
        let keywordParams = this.GetKeywordParams ('cameramode'); // for compatibility
        if (keywordParams === null) {
            keywordParams = this.GetKeywordParams ('projectionmode');
        }
        return ParameterConverter.StringToProjectionMode (keywordParams);
    }

    GetEnvironmentSettings ()
    {
        let environmentSettingsParams = this.GetKeywordParams ('envsettings');
        return ParameterConverter.StringToEnvironmentSettings (environmentSettingsParams);
    }

    GetBackgroundColor ()
    {
        let backgroundParams = this.GetKeywordParams ('backgroundcolor');
        return ParameterConverter.StringToRGBAColor (backgroundParams);
    }

    GetDefaultColor ()
    {
        let colorParams = this.GetKeywordParams ('defaultcolor');
        return ParameterConverter.StringToRGBColor (colorParams);
    }

    GetEdgeSettings ()
    {
        let edgeSettingsParams = this.GetKeywordParams ('edgesettings');
        return ParameterConverter.StringToEdgeSettings (edgeSettingsParams);
    }

    GetKeywordParams (keyword)
    {
        if (this.paramList === null || this.paramList.length === 0) {
            return null;
        }
        let keywordToken = keyword + '=';
        let urlParts = this.paramList.split (this.separator);
        for (let i = 0; i < urlParts.length; i++) {
            let urlPart = urlParts[i];
            if (urlPart.startsWith (keywordToken)) {
                return urlPart.substring (keywordToken.length);
            }
        }
        return null;
    }
}

function CreateUrlBuilder ()
{
    return new ParameterListBuilder ('$');
}

function CreateUrlParser (urlParams)
{
    return new ParameterListParser (urlParams, '$');
}

function CreateModelUrlParameters (urls)
{
    let builder = CreateUrlBuilder ();
    builder.AddModelUrls (urls);
    return builder.GetParameterList ();
}

class ModelToThreeConversionParams
{
	constructor ()
	{
		this.forceMediumpForMaterials = false;
	}
}

class ModelToThreeConversionOutput
{
	constructor ()
	{
		this.defaultMaterial = null;
		this.objectUrls = [];
	}
}

class ThreeConversionStateHandler
{
	constructor (callbacks)
	{
		this.callbacks = callbacks;
		this.texturesNeeded = 0;
		this.texturesLoaded = 0;
		this.threeObject = null;
	}

	OnTextureNeeded ()
	{
		this.texturesNeeded += 1;
	}

	OnTextureLoaded ()
	{
		this.texturesLoaded += 1;
		this.callbacks.onTextureLoaded ();
		this.Finish ();
	}

	OnModelLoaded (threeObject)
	{
		this.threeObject = threeObject;
		this.Finish ();
	}

	Finish ()
	{
		if (this.threeObject !== null && this.texturesNeeded === this.texturesLoaded) {
			this.callbacks.onModelLoaded (this.threeObject);
		}
	}
}

class ThreeNodeTree
{
	constructor (model, threeRootNode)
	{
		this.model = model;
		this.threeNodeItems = [];
		this.AddNode (model.GetRootNode (), threeRootNode);
	}

	AddNode (node, threeNode)
	{
		let matrix = node.GetTransformation ().GetMatrix ();
		let threeMatrix = new THREE.Matrix4 ().fromArray (matrix.Get ());
		threeNode.applyMatrix4 (threeMatrix);

		for (let childNode of node.GetChildNodes ()) {
			let threeChildNode = new THREE.Object3D ();
			threeNode.add (threeChildNode);
			this.AddNode (childNode, threeChildNode);
		}
		for (let meshIndex of node.GetMeshIndices ()) {
			let id = new MeshInstanceId (node.GetId (), meshIndex);
			let mesh = this.model.GetMesh (meshIndex);
			this.threeNodeItems.push ({
				meshInstance : new MeshInstance (id, node, mesh),
				threeNode : threeNode
			});
		}
	}

	GetNodeItems ()
	{
		return this.threeNodeItems;
	}
}

function ConvertModelToThreeObject (model, params, output, callbacks)
{
	function CreateThreeMaterial (stateHandler, model, materialIndex, shadingType, params, output)
	{
		function SetTextureParameters (texture, threeTexture)
		{
			threeTexture.wrapS = THREE.RepeatWrapping;
			threeTexture.wrapT = THREE.RepeatWrapping;
			threeTexture.rotation = texture.rotation;
			threeTexture.offset.x = texture.offset.x;
			threeTexture.offset.y = texture.offset.y;
			threeTexture.repeat.x = texture.scale.x;
			threeTexture.repeat.y = texture.scale.y;
		}

		function LoadTexture (stateHandler, threeMaterial, texture, output, onTextureLoaded)
		{
			if (texture === null || !texture.IsValid ()) {
				return;
			}
			let loader = new THREE.TextureLoader ();
			stateHandler.OnTextureNeeded ();
			let textureObjectUrl = null;
			if (texture.mimeType !== null) {
				textureObjectUrl = CreateObjectUrlWithMimeType (texture.buffer, texture.mimeType);
			} else {
				textureObjectUrl = CreateObjectUrl (texture.buffer);
			}
			output.objectUrls.push (textureObjectUrl);
			loader.load (textureObjectUrl,
				(threeTexture) => {
					SetTextureParameters (texture, threeTexture);
					threeMaterial.needsUpdate = true;
					onTextureLoaded (threeTexture);
					stateHandler.OnTextureLoaded ();
				},
				null,
				(err) => {
					stateHandler.OnTextureLoaded ();
				}
			);
		}

		let material = model.GetMaterial (materialIndex);
		let baseColor = ConvertColorToThreeColor (material.color);
		if (material.vertexColors) {
			baseColor.setRGB (1.0, 1.0, 1.0);
		}

		let materialParams = {
			color : baseColor,
			vertexColors : material.vertexColors,
			opacity : material.opacity,
			transparent : material.transparent,
			alphaTest : material.alphaTest,
			side : THREE.DoubleSide
		};

		if (params.forceMediumpForMaterials) {
			materialParams.precision = 'mediump';
		}

		let threeMaterial = null;
		if (shadingType === ShadingType.Phong) {
			threeMaterial = new THREE.MeshPhongMaterial (materialParams);
			if (material.type === MaterialType.Phong) {
				let specularColor = ConvertColorToThreeColor (material.specular);
				if (IsEqual (material.shininess, 0.0)) {
					specularColor.setRGB (0.0, 0.0, 0.0);
				}
				threeMaterial.specular = specularColor;
				threeMaterial.shininess = material.shininess * 100.0;
				LoadTexture (stateHandler, threeMaterial, material.specularMap, output, (threeTexture) => {
					threeMaterial.specularMap = threeTexture;
				});
			}
		} else if (shadingType === ShadingType.Physical) {
			threeMaterial = new THREE.MeshStandardMaterial (materialParams);
			if (material.type === MaterialType.Physical) {
				threeMaterial.metalness = material.metalness;
				threeMaterial.roughness = material.roughness;
				LoadTexture (stateHandler, threeMaterial, material.metalnessMap, output, (threeTexture) => {
					threeMaterial.metalness = 1.0;
					threeMaterial.roughness = 1.0;
					threeMaterial.metalnessMap = threeTexture;
					threeMaterial.roughnessMap = threeTexture;
				});
			}
		}

		let emissiveColor = ConvertColorToThreeColor (material.emissive);
		threeMaterial.emissive = emissiveColor;

		LoadTexture (stateHandler, threeMaterial, material.diffuseMap, output, (threeTexture) => {
			if (!material.multiplyDiffuseMap) {
				threeMaterial.color.setRGB (1.0, 1.0, 1.0);
			}
			threeMaterial.map = threeTexture;
		});
		LoadTexture (stateHandler, threeMaterial, material.bumpMap, output, (threeTexture) => {
			threeMaterial.bumpMap = threeTexture;
		});
		LoadTexture (stateHandler, threeMaterial, material.normalMap, output, (threeTexture) => {
			threeMaterial.normalMap = threeTexture;
		});
		LoadTexture (stateHandler, threeMaterial, material.emissiveMap, output, (threeTexture) => {
			threeMaterial.emissiveMap = threeTexture;
		});

		if (material.isDefault) {
			output.defaultMaterial = threeMaterial;
		}

		return threeMaterial;
	}

	function CreateThreeMesh (meshInstance, modelThreeMaterials)
	{
		let mesh = meshInstance.mesh;
		let triangleCount = mesh.TriangleCount ();

		let triangleIndices = [];
		for (let i = 0; i < triangleCount; i++) {
			triangleIndices.push (i);
		}
		triangleIndices.sort ((a, b) => {
			let aTriangle = mesh.GetTriangle (a);
			let bTriangle = mesh.GetTriangle (b);
			return aTriangle.mat - bTriangle.mat;
		});

		let threeGeometry = new THREE.BufferGeometry ();
		let meshThreeMaterials = [];
		let meshOriginalMaterials = [];
		let modelToThreeMaterials = new Map ();

		let vertices = [];
		let vertexColors = [];
		let normals = [];
		let uvs = [];

		let groups = [];
		groups.push ({
			start : 0,
			end : -1
		});

		let meshHasVertexColors = (mesh.VertexColorCount () > 0);
		let meshHasUVs = (mesh.TextureUVCount () > 0);
		for (let i = 0; i < triangleIndices.length; i++) {
			let triangleIndex = triangleIndices[i];
			let triangle = mesh.GetTriangle (triangleIndex);

			let v0 = mesh.GetVertex (triangle.v0);
			let v1 = mesh.GetVertex (triangle.v1);
			let v2 = mesh.GetVertex (triangle.v2);
			vertices.push (v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);

			if (triangle.HasVertexColors ()) {
				let vc0 = ConvertColorToThreeColor (mesh.GetVertexColor (triangle.c0));
				let vc1 = ConvertColorToThreeColor (mesh.GetVertexColor (triangle.c1));
				let vc2 = ConvertColorToThreeColor (mesh.GetVertexColor (triangle.c2));
				vertexColors.push (
					vc0.r, vc0.g, vc0.b,
					vc1.r, vc1.g, vc1.b,
					vc2.r, vc2.g, vc2.b
				);
			} else if (meshHasVertexColors) {
				vertexColors.push (
					0.0, 0.0, 0.0,
					0.0, 0.0, 0.0,
					0.0, 0.0, 0.0
				);
			}

			let n0 = mesh.GetNormal (triangle.n0);
			let n1 = mesh.GetNormal (triangle.n1);
			let n2 = mesh.GetNormal (triangle.n2);
			normals.push (n0.x, n0.y, n0.z, n1.x, n1.y, n1.z, n2.x, n2.y, n2.z);

			if (triangle.HasTextureUVs ()) {
				let u0 = mesh.GetTextureUV (triangle.u0);
				let u1 = mesh.GetTextureUV (triangle.u1);
				let u2 = mesh.GetTextureUV (triangle.u2);
				uvs.push (u0.x, u0.y, u1.x, u1.y, u2.x, u2.y);
			} else if (meshHasUVs) {
				uvs.push (0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
			}

			let modelMaterialIndex = triangle.mat;
			if (!modelToThreeMaterials.has (modelMaterialIndex)) {
				modelToThreeMaterials.set (modelMaterialIndex, meshThreeMaterials.length);
				meshThreeMaterials.push (modelThreeMaterials[modelMaterialIndex]);
				meshOriginalMaterials.push (modelMaterialIndex);
				if (i > 0) {
					groups[groups.length - 1].end = i - 1;
					groups.push ({
						start : groups[groups.length - 1].end + 1,
						end : -1
					});
				}
			}
		}

		groups[groups.length - 1].end = triangleCount - 1;

		threeGeometry.setAttribute ('position', new THREE.Float32BufferAttribute (vertices, 3));
		if (vertexColors.length !== 0) {
			threeGeometry.setAttribute ('color', new THREE.Float32BufferAttribute (vertexColors, 3));
		}
		threeGeometry.setAttribute ('normal', new THREE.Float32BufferAttribute (normals, 3));
		if (uvs.length !== 0) {
			threeGeometry.setAttribute ('uv', new THREE.Float32BufferAttribute (uvs, 2));
		}
		for (let i = 0; i < groups.length; i++) {
			let group = groups[i];
			threeGeometry.addGroup (group.start * 3, (group.end - group.start + 1) * 3, i);
		}

		let threeMesh = new THREE.Mesh (threeGeometry, meshThreeMaterials);
		threeMesh.name = mesh.GetName ();
		threeMesh.userData = {
			originalMeshInstance : meshInstance,
			originalMaterials : meshOriginalMaterials,
			threeMaterials : null
		};

		return threeMesh;
	}

	function ConvertMesh (threeObject, meshInstance, modelThreeMaterials)
	{
		let type = GetMeshType (meshInstance.mesh);
		if (type === MeshType.TriangleMesh) {
			let threeMesh = CreateThreeMesh (meshInstance, modelThreeMaterials);
			threeObject.add (threeMesh);
		}
	}

	function ConvertNodeHierarchy (threeRootNode, model, modelThreeMaterials, stateHandler)
	{
		let nodeTree = new ThreeNodeTree (model, threeRootNode);
		let threeNodeItems = nodeTree.GetNodeItems ();

		RunTasksBatch (threeNodeItems.length, 100, {
			runTask : (firstMeshInstanceIndex, lastMeshInstanceIndex, onReady) => {
				for (let meshInstanceIndex = firstMeshInstanceIndex; meshInstanceIndex <= lastMeshInstanceIndex; meshInstanceIndex++) {
					let nodeItem = threeNodeItems[meshInstanceIndex];
					ConvertMesh (nodeItem.threeNode, nodeItem.meshInstance, modelThreeMaterials);
				}
				onReady ();
			},
			onReady : () => {
				stateHandler.OnModelLoaded (threeRootNode);
			}
		});
	}

	let stateHandler = new ThreeConversionStateHandler (callbacks);
	let shadingType = GetShadingType (model);

	let modelThreeMaterials = [];
	for (let materialIndex = 0; materialIndex < model.MaterialCount (); materialIndex++) {
		let threeMaterial = CreateThreeMaterial (stateHandler, model, materialIndex, shadingType, params, output);
		modelThreeMaterials.push (threeMaterial);
	}

	let threeObject = new THREE.Object3D ();
	ConvertNodeHierarchy (threeObject, model, modelThreeMaterials, stateHandler);
}

class ThreeModelLoader
{
    constructor ()
    {
        this.importer = new Importer ();
        this.inProgress = false;
        this.defaultMaterial = null;
        this.objectUrls = null;
        this.hasHighpDriverIssue = HasHighpDriverIssue ();
    }

    InProgress ()
    {
        return this.inProgress;
    }

    LoadModel (inputFiles, settings, callbacks)
    {
        if (this.inProgress) {
            return;
        }

        this.inProgress = true;
        this.RevokeObjectUrls ();
        this.importer.ImportFiles (inputFiles, settings, {
            onLoadStart : () => {
                callbacks.onLoadStart ();
            },
            onFileListProgress : (current, total) => {
                callbacks.onFileListProgress (current, total);
            },
            onFileLoadProgress : (current, total) => {
                callbacks.onFileLoadProgress (current, total);
            },
            onImportStart : () => {
                callbacks.onImportStart ();
            },
            onSelectMainFile : (fileNames, selectFile) => {
                if (!callbacks.onSelectMainFile) {
                    selectFile (0);
                } else {
                    callbacks.onSelectMainFile (fileNames, selectFile);
                }
            },
            onImportSuccess : (importResult) => {
                callbacks.onVisualizationStart ();
                let params = new ModelToThreeConversionParams ();
                params.forceMediumpForMaterials = this.hasHighpDriverIssue;
                let output = new ModelToThreeConversionOutput ();
                ConvertModelToThreeObject (importResult.model, params, output, {
                    onTextureLoaded : () => {
                        callbacks.onTextureLoaded ();
                    },
                    onModelLoaded : (threeObject) => {
                        this.defaultMaterial = output.defaultMaterial;
                        this.objectUrls = output.objectUrls;
                        if (importResult.upVector === Direction.X) {
                            let rotation = new THREE.Quaternion ().setFromAxisAngle (new THREE.Vector3 (0.0, 0.0, 1.0), Math.PI / 2.0);
                            threeObject.quaternion.multiply (rotation);
                        } else if (importResult.upVector === Direction.Z) {
                            let rotation = new THREE.Quaternion ().setFromAxisAngle (new THREE.Vector3 (1.0, 0.0, 0.0), -Math.PI / 2.0);
                            threeObject.quaternion.multiply (rotation);
                        }
                        callbacks.onModelFinished (importResult, threeObject);
                        this.inProgress = false;
                    }
                });
            },
            onImportError : (importError) => {
                callbacks.onLoadError (importError);
                this.inProgress = false;
            }
        });
    }

    GetImporter ()
    {
        return this.importer;
    }

    GetDefaultMaterial ()
    {
        return this.defaultMaterial;
    }

    ReplaceDefaultMaterialColor (defaultColor)
    {
        if (this.defaultMaterial !== null && !this.defaultMaterial.vertexColors) {
            this.defaultMaterial.color = ConvertColorToThreeColor (defaultColor);
        }
    }

    RevokeObjectUrls ()
    {
        if (this.objectUrls === null) {
            return;
        }
        for (let objectUrl of this.objectUrls) {
            RevokeObjectUrl (objectUrl);
        }
        this.objectUrls = null;
    }

    Destroy ()
    {
        this.RevokeObjectUrls ();
        this.importer = null;
    }
}

function GetIntegerFromStyle (parameter)
{
    return Math.round (parseFloat (parameter));
}

function GetDomElementExternalWidth (style)
{
    let padding = GetIntegerFromStyle (style.paddingLeft) + GetIntegerFromStyle (style.paddingRight);
    let border = GetIntegerFromStyle (style.borderLeftWidth) + GetIntegerFromStyle (style.borderRightWidth);
    let margin = GetIntegerFromStyle (style.marginLeft) + GetIntegerFromStyle (style.marginRight);
    return padding + border + margin;
}

function GetDomElementExternalHeight (style)
{
    let padding = GetIntegerFromStyle (style.paddingTop) + GetIntegerFromStyle (style.paddingBottom);
    let border = GetIntegerFromStyle (style.borderTopWidth) + GetIntegerFromStyle (style.borderBottomWidth);
    let margin = GetIntegerFromStyle (style.marginTop) + GetIntegerFromStyle (style.marginBottom);
    return padding + border + margin;
}

function GetDomElementInnerDimensions (element, outerWidth, outerHeight)
{
    let style = getComputedStyle (element);
    let width = outerWidth - GetDomElementExternalWidth (style);
    let height = outerHeight - GetDomElementExternalHeight (style);
    return {
        width : width,
        height : height
    };
}

function GetDomElementClientCoordinates (element, clientX, clientY)
{
    if (element.getBoundingClientRect) {
        let clientRect = element.getBoundingClientRect ();
        clientX -= clientRect.left;
        clientY -= clientRect.top;
    }
    if (window.pageXOffset && window.pageYOffset) {
        clientX += window.pageXOffset;
        clientY += window.pageYOffset;
    }
    return (new Coord2D (clientX, clientY));
}

function CreateDomElement (elementType, className, innerHTML)
{
    let element = document.createElement (elementType);
    if (className) {
        element.className = className;
    }
    if (innerHTML) {
        element.innerHTML = innerHTML;
    }
    return element;
}

function AddDomElement (parentElement, elementType, className, innerHTML)
{
    let element = CreateDomElement (elementType, className, innerHTML);
    parentElement.appendChild (element);
    return element;
}

function AddDiv (parentElement, className, innerHTML)
{
    return AddDomElement (parentElement, 'div', className, innerHTML);
}

function ClearDomElement (element)
{
    while (element.firstChild) {
        element.removeChild (element.firstChild);
    }
}

function InsertDomElementBefore (newElement, existingElement)
{
    existingElement.parentNode.insertBefore (newElement, existingElement);
}

function InsertDomElementAfter (newElement, existingElement)
{
    existingElement.parentNode.insertBefore (newElement, existingElement.nextSibling);
}

function ShowDomElement (element, show)
{
    if (show) {
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}

function IsDomElementVisible (element)
{
    return element.offsetParent !== null;
}

function SetDomElementWidth (element, width)
{
    element.style.width = width.toString () + 'px';
}

function SetDomElementHeight (element, height)
{
    element.style.height = height.toString () + 'px';
}

function GetDomElementOuterWidth (element)
{
    let style = getComputedStyle (element);
    return element.offsetWidth + GetIntegerFromStyle (style.marginLeft) + GetIntegerFromStyle (style.marginRight);
}

function GetDomElementOuterHeight (element)
{
    let style = getComputedStyle (element);
    return element.offsetHeight + GetIntegerFromStyle (style.marginTop) + GetIntegerFromStyle (style.marginBottom);
}

function SetDomElementOuterWidth (element, width)
{
    let style = getComputedStyle (element);
    SetDomElementWidth (element, width - GetDomElementExternalWidth (style));
}

function SetDomElementOuterHeight (element, height)
{
    let style = getComputedStyle (element);
    SetDomElementHeight (element, height - GetDomElementExternalHeight (style));
}

function CreateDiv (className, innerHTML)
{
    return CreateDomElement ('div', className, innerHTML);
}

class MouseInteraction
{
    constructor ()
    {
        this.prev = new Coord2D (0.0, 0.0);
        this.curr = new Coord2D (0.0, 0.0);
        this.diff = new Coord2D (0.0, 0.0);
        this.buttons = [];
    }

    Down (canvas, ev)
    {
        this.buttons.push (ev.which);
        this.curr = this.GetPositionFromEvent (canvas, ev);
        this.prev = this.curr.Clone ();
    }

    Move (canvas, ev)
    {
        this.curr = this.GetPositionFromEvent (canvas, ev);
		this.diff = SubCoord2D (this.curr, this.prev);
		this.prev = this.curr.Clone ();
	}

	Up (canvas, ev)
	{
		let buttonIndex = this.buttons.indexOf (ev.which);
		if (buttonIndex !== -1) {
			this.buttons.splice (buttonIndex, 1);
		}
		this.curr = this.GetPositionFromEvent (canvas, ev);
	}

	Leave (canvas, ev)
	{
		this.buttons = [];
		this.curr = this.GetPositionFromEvent (canvas, ev);
	}

	IsButtonDown ()
	{
		return this.buttons.length > 0;
	}

	GetButton ()
	{
		let length = this.buttons.length;
		if (length === 0) {
			return 0;
		}
		return this.buttons[length - 1];
	}

	GetPosition ()
	{
		return this.curr;
	}

	GetMoveDiff ()
	{
		return this.diff;
	}

	GetPositionFromEvent (canvas, ev)
	{
		return GetDomElementClientCoordinates (canvas, ev.clientX, ev.clientY);
	}
}

class TouchInteraction
{
	constructor ()
	{
		this.prevPos = new Coord2D (0.0, 0.0);
		this.currPos = new Coord2D (0.0, 0.0);
		this.diffPos = new Coord2D (0.0, 0.0);
		this.prevDist = 0.0;
		this.currDist = 0.0;
		this.diffDist = 0.0;
		this.fingers = 0;
	}

	Start (canvas, ev)
	{
		if (ev.touches.length === 0) {
			return;
		}

		this.fingers = ev.touches.length;

		this.currPos = this.GetPositionFromEvent (canvas, ev);
		this.prevPos = this.currPos.Clone ();

		this.currDist = this.GetTouchDistanceFromEvent (canvas, ev);
		this.prevDist = this.currDist;
	}

	Move (canvas, ev)
	{
		if (ev.touches.length === 0) {
			return;
		}

		this.currPos = this.GetPositionFromEvent (canvas, ev);
		this.diffPos = SubCoord2D (this.currPos, this.prevPos);
		this.prevPos = this.currPos.Clone ();

		this.currDist = this.GetTouchDistanceFromEvent (canvas, ev);
		this.diffDist = this.currDist - this.prevDist;
		this.prevDist = this.currDist;
	}

	End (canvas, ev)
	{
		if (ev.touches.length === 0) {
			return;
		}

		this.fingers = 0;
		this.currPos = this.GetPositionFromEvent (canvas, ev);
		this.currDist = this.GetTouchDistanceFromEvent (canvas, ev);
	}

	IsFingerDown ()
	{
		return this.fingers !== 0;
	}

	GetFingerCount ()
	{
		return this.fingers;
	}

	GetPosition ()
	{
		return this.currPos;
	}

	GetMoveDiff ()
	{
		return this.diffPos;
	}

	GetDistanceDiff ()
	{
		return this.diffDist;
	}

	GetPositionFromEvent (canvas, ev)
	{
		let coord = null;
		if (ev.touches.length !== 0) {
			let touchEv = ev.touches[0];
			coord = GetDomElementClientCoordinates (canvas, touchEv.pageX, touchEv.pageY);
		}
		return coord;
	}

	GetTouchDistanceFromEvent (canvas, ev)
	{
		if (ev.touches.length !== 2) {
			return 0.0;
		}
		let touchEv1 = ev.touches[0];
		let touchEv2 = ev.touches[1];
		let distance = CoordDistance2D (
			GetDomElementClientCoordinates (canvas, touchEv1.pageX, touchEv1.pageY),
			GetDomElementClientCoordinates (canvas, touchEv2.pageX, touchEv2.pageY)
		);
		return distance;
	}
}

class ClickDetector
{
	constructor ()
	{
		this.isClick = false;
		this.startPosition = null;
	}

	Start (startPosition)
	{
		this.isClick = true;
		this.startPosition = startPosition;
	}

	Move (currentPosition)
	{
		if (!this.isClick) {
			return;
		}

		if (this.startPosition !== null) {
			const maxClickDistance = 3.0;
			const currentDistance = CoordDistance2D (this.startPosition, currentPosition);
			if (currentDistance > maxClickDistance) {
				this.Cancel ();
			}
		} else {
			this.Cancel ();
		}
	}

	End ()
	{
		this.startPosition = null;
	}

	Cancel ()
	{
		this.isClick = false;
		this.startPosition = null;
	}

	IsClick ()
	{
		return this.isClick;
	}
}

const NavigationType =
{
	None : 0,
	Orbit : 1,
	Pan : 2,
	Zoom : 3
};

class Navigation
{
	constructor (canvas, camera, callbacks)
	{
		this.canvas = canvas;
		this.camera = camera;
		this.callbacks = callbacks;
		this.navigationMode = NavigationMode.FixedUpVector;

		this.mouse = new MouseInteraction ();
		this.touch = new TouchInteraction ();
		this.clickDetector = new ClickDetector ();

		this.onMouseClick = null;
		this.onMouseMove = null;
		this.onContext = null;

		if (this.canvas.addEventListener) {
			this.canvas.addEventListener ('mousedown', this.OnMouseDown.bind (this));
			this.canvas.addEventListener ('wheel', this.OnMouseWheel.bind (this));
			this.canvas.addEventListener ('touchstart', this.OnTouchStart.bind (this));
			this.canvas.addEventListener ('touchmove', this.OnTouchMove.bind (this));
			this.canvas.addEventListener ('touchcancel', this.OnTouchEnd.bind (this));
			this.canvas.addEventListener ('touchend', this.OnTouchEnd.bind (this));
			this.canvas.addEventListener ('contextmenu', this.OnContextMenu.bind (this));
		}
		if (document.addEventListener) {
			document.addEventListener ('mousemove', this.OnMouseMove.bind (this));
			document.addEventListener ('mouseup', this.OnMouseUp.bind (this));
			document.addEventListener ('mouseleave', this.OnMouseLeave.bind (this));
		}
	}

	SetMouseClickHandler (onMouseClick)
	{
		this.onMouseClick = onMouseClick;
	}

	SetMouseMoveHandler (onMouseMove)
	{
		this.onMouseMove = onMouseMove;
	}

	SetContextMenuHandler (onContext)
	{
		this.onContext = onContext;
	}

	GetNavigationMode ()
	{
		return this.navigationMode;
	}

	SetNavigationMode (navigationMode)
	{
		this.navigationMode = navigationMode;
	}

	GetCamera ()
	{
		return this.camera;
	}

	SetCamera (camera)
	{
		this.camera = camera;
	}

	MoveCamera (newCamera, stepCount)
	{
		function Step (obj, steps, count, index)
		{
			obj.camera.eye = steps.eye[index];
			obj.camera.center = steps.center[index];
			obj.camera.up = steps.up[index];
			obj.Update ();

			if (index < count - 1) {
				requestAnimationFrame (() => {
					Step (obj, steps, count, index + 1);
				});
			}
		}

		if (newCamera === null) {
			return;
		}

		if (stepCount === 0 || CameraIsEqual3D (this.camera, newCamera)) {
			this.camera = newCamera;
		} else {
			let tweenFunc = ParabolicTweenFunction;
			let steps = {
				eye : TweenCoord3D (this.camera.eye, newCamera.eye, stepCount, tweenFunc),
				center : TweenCoord3D (this.camera.center, newCamera.center, stepCount, tweenFunc),
				up : TweenCoord3D (this.camera.up, newCamera.up, stepCount, tweenFunc)
			};
			requestAnimationFrame (() => {
				Step (this, steps, stepCount, 0);
			});
		}

		this.Update ();
	}

	GetFitToSphereCamera (center, radius)
	{
		if (IsZero (radius)) {
			return null;
		}

		let fitCamera = this.camera.Clone ();

		let offsetToOrigo = SubCoord3D (fitCamera.center, center);
		fitCamera.eye = SubCoord3D (fitCamera.eye, offsetToOrigo);
		fitCamera.center = center.Clone ();

		let centerEyeDirection = SubCoord3D (fitCamera.eye, fitCamera.center).Normalize ();
		let fieldOfView = this.camera.fov / 2.0;
		if (this.canvas.width < this.canvas.height) {
			fieldOfView = fieldOfView * this.canvas.width / this.canvas.height;
		}
		let distance = radius / Math.sin (fieldOfView * DegRad);

		fitCamera.eye = fitCamera.center.Clone ().Offset (centerEyeDirection, distance);

		return fitCamera;
	}

	OnMouseDown (ev)
	{
		ev.preventDefault ();

		this.mouse.Down (this.canvas, ev);
		this.clickDetector.Start (this.mouse.GetPosition ());
	}

	OnMouseMove (ev)
	{
		this.mouse.Move (this.canvas, ev);
		this.clickDetector.Move (this.mouse.GetPosition ());
		if (this.onMouseMove) {
			let mouseCoords = GetDomElementClientCoordinates (this.canvas, ev.clientX, ev.clientY);
			this.onMouseMove (mouseCoords);
		}

		if (!this.mouse.IsButtonDown ()) {
			return;
		}

		let moveDiff = this.mouse.GetMoveDiff ();
		let mouseButton = this.mouse.GetButton ();

		let navigationType = NavigationType.None;
		if (mouseButton === 1) {
			if (ev.ctrlKey) {
				navigationType = NavigationType.Zoom;
			} else if (ev.shiftKey) {
				navigationType = NavigationType.Pan;
			} else {
				navigationType = NavigationType.Orbit;
			}
		} else if (mouseButton === 2 || mouseButton === 3) {
			navigationType = NavigationType.Pan;
		}

		if (navigationType === NavigationType.Orbit) {
			let orbitRatio = 0.5;
			this.Orbit (moveDiff.x * orbitRatio, moveDiff.y * orbitRatio);
		} else if (navigationType === NavigationType.Pan) {
			let eyeCenterDistance = CoordDistance3D (this.camera.eye, this.camera.center);
			let panRatio = 0.001 * eyeCenterDistance;
			this.Pan (moveDiff.x * panRatio, moveDiff.y * panRatio);
		} else if (navigationType === NavigationType.Zoom) {
			let zoomRatio = 0.005;
			this.Zoom (-moveDiff.y * zoomRatio);
		}

		this.Update ();
	}

	OnMouseUp (ev)
	{
		this.mouse.Up (this.canvas, ev);
		this.clickDetector.End ();

		if (this.clickDetector.IsClick ()) {
			let mouseCoords = this.mouse.GetPosition ();
			this.Click (ev.which, mouseCoords);
		}
	}

	OnMouseLeave (ev)
	{
		this.mouse.Leave (this.canvas, ev);
		this.clickDetector.Cancel ();
	}

	OnTouchStart (ev)
	{
		ev.preventDefault ();

		this.touch.Start (this.canvas, ev);
		this.clickDetector.Start (this.touch.GetPosition ());
	}

	OnTouchMove (ev)
	{
		ev.preventDefault ();

		this.touch.Move (this.canvas, ev);
		this.clickDetector.Move (this.touch.GetPosition ());
		if (!this.touch.IsFingerDown ()) {
			return;
		}

		let moveDiff = this.touch.GetMoveDiff ();
		let distanceDiff = this.touch.GetDistanceDiff ();
		let fingerCount = this.touch.GetFingerCount ();

		let navigationType = NavigationType.None;
		if (fingerCount === 1) {
			navigationType = NavigationType.Orbit;
		} else if (fingerCount === 2) {
			navigationType = NavigationType.Pan;
		}

		if (navigationType === NavigationType.Orbit) {
			let orbitRatio = 0.5;
			this.Orbit (moveDiff.x * orbitRatio, moveDiff.y * orbitRatio);
		} else if (navigationType === NavigationType.Pan) {
			let zoomRatio = 0.005;
			this.Zoom (distanceDiff * zoomRatio);
			let panRatio = 0.001 * CoordDistance3D (this.camera.eye, this.camera.center);
			this.Pan (moveDiff.x * panRatio, moveDiff.y * panRatio);
		}

		this.Update ();
	}

	OnTouchEnd (ev)
	{
		ev.preventDefault ();

		this.touch.End (this.canvas, ev);
		this.clickDetector.End ();

		if (this.clickDetector.IsClick ()) {
			let touchCoords = this.touch.GetPosition ();
			if (this.touch.GetFingerCount () === 1) {
				this.Click (1, touchCoords);
			}
		}
	}

	OnMouseWheel (ev)
	{
		let params = ev || window.event;
		params.preventDefault ();

		let delta = -params.deltaY / 40;
		let ratio = 0.1;
		if (delta < 0) {
			ratio = ratio * -1.0;
		}

		this.Zoom (ratio);
		this.Update ();
	}

	OnContextMenu (ev)
	{
		ev.preventDefault ();

		if (this.clickDetector.IsClick ()) {
			this.Context (ev.clientX, ev.clientY);
			this.clickDetector.Cancel ();
		}
	}

	Orbit (angleX, angleY)
	{
		let radAngleX = angleX * DegRad;
		let radAngleY = angleY * DegRad;

		let viewDirection = SubCoord3D (this.camera.center, this.camera.eye).Normalize ();
		let horizontalDirection = CrossVector3D (viewDirection, this.camera.up).Normalize ();

		if (this.navigationMode === NavigationMode.FixedUpVector) {
			let originalAngle = VectorAngle3D (viewDirection, this.camera.up);
			let newAngle = originalAngle + radAngleY;
			if (IsGreater (newAngle, 0.0) && IsLower (newAngle, Math.PI)) {
				this.camera.eye.Rotate (horizontalDirection, -radAngleY, this.camera.center);
			}
			this.camera.eye.Rotate (this.camera.up, -radAngleX, this.camera.center);
		} else if (this.navigationMode === NavigationMode.FreeOrbit) {
			let verticalDirection = CrossVector3D (horizontalDirection, viewDirection).Normalize ();
			this.camera.eye.Rotate (horizontalDirection, -radAngleY, this.camera.center);
			this.camera.eye.Rotate (verticalDirection, -radAngleX, this.camera.center);
			this.camera.up = verticalDirection;
		}
	}

	Pan (moveX, moveY)
	{
		let viewDirection = SubCoord3D (this.camera.center, this.camera.eye).Normalize ();
		let horizontalDirection = CrossVector3D (viewDirection, this.camera.up).Normalize ();
		let verticalDirection = CrossVector3D (horizontalDirection, viewDirection).Normalize ();

		this.camera.eye.Offset (horizontalDirection, -moveX);
		this.camera.center.Offset (horizontalDirection, -moveX);

		this.camera.eye.Offset (verticalDirection, moveY);
		this.camera.center.Offset (verticalDirection, moveY);
	}

	Zoom (ratio)
	{
		let direction = SubCoord3D (this.camera.center, this.camera.eye);
		let distance = direction.Length ();
		let move = distance * ratio;
		this.camera.eye.Offset (direction, move);
	}

	Update ()
	{
		this.callbacks.onUpdate ();
	}

	Click (button, mouseCoords)
	{
		if (this.onMouseClick) {
			this.onMouseClick (button, mouseCoords);
		}
	}

	Context (clientX, clientY)
	{
		if (this.onContext) {
			let globalCoords = {
				x : clientX,
				y : clientY
			};
			let localCoords = GetDomElementClientCoordinates (this.canvas, clientX, clientY);
			this.onContext (globalCoords, localCoords);
		}
	}
}

/**
 * Environment settings object.
 */
class EnvironmentSettings
{
    /**
     * @param {string[]} textureNames Urls of the environment map images in this order:
     * posx, negx, posy, negy, posz, negz.
     * @param {boolean} backgroundIsEnvMap Use the environment map as background.
     */
    constructor (textureNames, backgroundIsEnvMap)
    {
        this.textureNames = textureNames;
        this.backgroundIsEnvMap = backgroundIsEnvMap;
    }

    /**
     * Creates a clone of the object.
     * @returns {EnvironmentSettings}
     */
    Clone ()
    {
        let textureNames = null;
        if (this.textureNames !== null) {
            textureNames = [];
            for (let textureName of this.textureNames) {
                textureNames.push (textureName);
            }
        }
        return new EnvironmentSettings (textureNames, this.backgroundIsEnvMap);
    }
}

class ShadingModel
{
    constructor (scene)
    {
        this.scene = scene;

        this.type = ShadingType.Phong;
        this.projectionMode = ProjectionMode.Perspective;
        this.ambientLight = new THREE.AmbientLight (0x888888, 1.0 * Math.PI);
        this.directionalLight = new THREE.DirectionalLight (0x888888, 1.0 * Math.PI);
        this.environmentSettings = new EnvironmentSettings (null, false);
        this.environment = null;

        this.scene.add (this.ambientLight);
        this.scene.add (this.directionalLight);
    }

    SetShadingType (type)
    {
        this.type = type;
        this.UpdateShading ();
    }

    SetProjectionMode (projectionMode)
    {
        this.projectionMode = projectionMode;
        this.UpdateShading ();
    }

    UpdateShading ()
    {
        if (this.type === ShadingType.Phong) {
            this.ambientLight.color.set (0x888888);
            this.directionalLight.color.set (0x888888);
            this.scene.environment = null;
        } else if (this.type === ShadingType.Physical) {
            this.ambientLight.color.set (0x000000);
            this.directionalLight.color.set (0x555555);
            this.scene.environment = this.environment;
        }
        if (this.environmentSettings.backgroundIsEnvMap && this.projectionMode === ProjectionMode.Perspective) {
            this.scene.background = this.environment;
        } else {
            this.scene.background = null;
        }
    }

    SetEnvironmentMapSettings (environmentSettings, onLoaded)
    {
        let loader = new THREE.CubeTextureLoader ();
        this.environment = loader.load (environmentSettings.textureNames, (texture) => {
            texture.colorSpace = THREE.LinearSRGBColorSpace;
            onLoaded ();
        });
        this.environmentSettings = environmentSettings;
    }

    UpdateByCamera (camera)
    {
        const lightDir = SubCoord3D (camera.eye, camera.center);
        this.directionalLight.position.set (lightDir.x, lightDir.y, lightDir.z);
    }

    CreateHighlightMaterial (highlightColor, withOffset)
    {
        let material = null;
        if (this.type === ShadingType.Phong) {
            material = new THREE.MeshPhongMaterial ({
                color : ConvertColorToThreeColor (highlightColor),
                side : THREE.DoubleSide
            });
        } else if (this.type === ShadingType.Physical) {
            material = new THREE.MeshStandardMaterial ({
                color : ConvertColorToThreeColor (highlightColor),
                side : THREE.DoubleSide
            });
        }
        if (material !== null && withOffset) {
            material.polygonOffset = true;
            material.polygonOffsetUnit = 1;
            material.polygonOffsetFactor = 1;
        }
        return material;
    }
}

function GetDefaultCamera (direction)
{
    let fieldOfView = 45.0;
    if (direction === Direction.X) {
        return new Camera (
            new Coord3D (2.0, -3.0, 1.5),
            new Coord3D (0.0, 0.0, 0.0),
            new Coord3D (1.0, 0.0, 0.0),
            fieldOfView
        );
    } else if (direction === Direction.Y) {
        return new Camera (
            new Coord3D (-1.5, 2.0, 3.0),
            new Coord3D (0.0, 0.0, 0.0),
            new Coord3D (0.0, 1.0, 0.0),
            fieldOfView
        );
    } else if (direction === Direction.Z) {
        return new Camera (
            new Coord3D (-1.5, -3.0, 2.0),
            new Coord3D (0.0, 0.0, 0.0),
            new Coord3D (0.0, 0.0, 1.0),
            fieldOfView
        );
    }
    return null;
}

function TraverseThreeObject (object, processor)
{
    if (!processor (object)) {
        return false;
    }
    for (let child of object.children) {
        if (!TraverseThreeObject (child, processor)) {
            return false;
        }
    }
    return true;
}

function GetShadingTypeOfObject (mainObject)
{
    let shadingType = null;
    TraverseThreeObject (mainObject, (obj) => {
        if (obj.isMesh) {
            for (const material of obj.material) {
                if (material.type === 'MeshPhongMaterial') {
                    shadingType = ShadingType.Phong;
                } else if (material.type === 'MeshStandardMaterial') {
                    shadingType = ShadingType.Physical;
                }
                return false;
            }
        }
        return true;
    });
    return shadingType;
}

class CameraValidator
{
    constructor ()
    {
        this.eyeCenterDistance = 0.0;
        this.forceUpdate = true;
    }

    ForceUpdate ()
    {
        this.forceUpdate = true;
    }

    ValidatePerspective ()
    {
        if (this.forceUpdate) {
            this.forceUpdate = false;
            return false;
        }
        return true;
    }

    ValidateOrthographic (eyeCenterDistance)
    {
        if (this.forceUpdate || !IsEqual (this.eyeCenterDistance, eyeCenterDistance)) {
            this.eyeCenterDistance = eyeCenterDistance;
            this.forceUpdate = false;
            return false;
        }
        return true;
    }
}

class UpVector
{
    constructor ()
    {
        this.direction = Direction.Y;
        this.isFixed = true;
        this.isFlipped = false;
    }

    SetDirection (newDirection, oldCamera)
    {
        this.direction = newDirection;
        this.isFlipped = false;

        let defaultCamera = GetDefaultCamera (this.direction);
        let defaultDir = SubCoord3D (defaultCamera.eye, defaultCamera.center);

        let distance = CoordDistance3D (oldCamera.center, oldCamera.eye);
        let newEye = oldCamera.center.Clone ().Offset (defaultDir, distance);

        let newCamera = oldCamera.Clone ();
        if (this.direction === Direction.X) {
            newCamera.up = new Coord3D (1.0, 0.0, 0.0);
            newCamera.eye = newEye;
        } else if (this.direction === Direction.Y) {
            newCamera.up = new Coord3D (0.0, 1.0, 0.0);
            newCamera.eye = newEye;
        } else if (this.direction === Direction.Z) {
            newCamera.up = new Coord3D (0.0, 0.0, 1.0);
            newCamera.eye = newEye;
        }
        return newCamera;
    }

    SetFixed (isFixed, oldCamera)
    {
        this.isFixed = isFixed;
        if (this.isFixed) {
            return this.SetDirection (this.direction, oldCamera);
        }
        return null;
    }

    Flip (oldCamera)
    {
        this.isFlipped = !this.isFlipped;
        let newCamera = oldCamera.Clone ();
        newCamera.up.MultiplyScalar (-1.0);
        return newCamera;
    }
}

class Viewer
{
    constructor ()
    {
        THREE.ColorManagement.enabled = false;

        this.canvas = null;
        this.renderer = null;
        this.scene = null;
        this.mainModel = null;
        this.extraModel = null;
        this.camera = null;
        this.projectionMode = null;
        this.cameraValidator = null;
        this.shadingModel = null;
        this.navigation = null;
        this.upVector = null;
        this.settings = {
            animationSteps : 40
        };
    }

    Init (canvas)
    {
        this.canvas = canvas;
        this.canvas.id = 'viewer';

        let parameters = {
            canvas : this.canvas,
            antialias : true
        };

        this.renderer = new THREE.WebGLRenderer (parameters);
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

        if (window.devicePixelRatio) {
            this.renderer.setPixelRatio (window.devicePixelRatio);
        }
        this.renderer.setClearColor ('#ffffff', 1.0);
        this.renderer.setSize (this.canvas.width, this.canvas.height);

        this.scene = new THREE.Scene ();
        this.mainModel = new ViewerMainModel (this.scene);
        this.extraModel = new ViewerModel (this.scene);

        this.InitNavigation ();
        this.InitShading ();

        this.Render ();
    }

    SetMouseClickHandler (onMouseClick)
    {
        this.navigation.SetMouseClickHandler (onMouseClick);
    }

    SetMouseMoveHandler (onMouseMove)
    {
        this.navigation.SetMouseMoveHandler (onMouseMove);
    }

    SetContextMenuHandler (onContext)
    {
        this.navigation.SetContextMenuHandler (onContext);
    }

    SetEdgeSettings (edgeSettings)
    {
        let newEdgeSettings = edgeSettings.Clone ();
        this.mainModel.SetEdgeSettings (newEdgeSettings);
        this.Render ();
    }

    SetEnvironmentMapSettings (environmentSettings)
    {
        let newEnvironmentSettings = environmentSettings.Clone ();
        this.shadingModel.SetEnvironmentMapSettings (newEnvironmentSettings, () => {
            this.Render ();
        });
        this.shadingModel.UpdateShading ();
        this.Render ();
    }

    SetBackgroundColor (color)
    {
        let bgColor = new THREE.Color (
            ColorComponentToFloat (color.r),
            ColorComponentToFloat (color.g),
            ColorComponentToFloat (color.b)
        );
        let alpha = ColorComponentToFloat (color.a);
        this.renderer.setClearColor (bgColor, alpha);
        this.Render ();
    }

    GetCanvas ()
    {
        return this.canvas;
    }

    GetCamera ()
    {
        return this.navigation.GetCamera ();
    }

    GetProjectionMode ()
    {
        return this.projectionMode;
    }

    SetCamera (camera)
    {
        this.navigation.SetCamera (camera);
        this.cameraValidator.ForceUpdate ();
        this.Render ();
    }

    SetProjectionMode (projectionMode)
    {
        if (this.projectionMode === projectionMode) {
            return;
        }

        this.scene.remove (this.camera);
        if (projectionMode === ProjectionMode.Perspective) {
            this.camera = new THREE.PerspectiveCamera (45.0, 1.0, 0.1, 1000.0);
        } else if (projectionMode === ProjectionMode.Orthographic) {
			this.camera = new THREE.OrthographicCamera (-1.0, 1.0, 1.0, -1.0, 0.1, 1000.0);
        }
        this.scene.add (this.camera);

        this.projectionMode = projectionMode;
        this.shadingModel.SetProjectionMode (projectionMode);
        this.cameraValidator.ForceUpdate ();

        this.AdjustClippingPlanes ();
        this.Render ();
    }

    Resize (width, height)
    {
        let innerSize = GetDomElementInnerDimensions (this.canvas, width, height);
        this.ResizeRenderer (innerSize.width, innerSize.height);
    }

    ResizeRenderer (width, height)
    {
        if (window.devicePixelRatio) {
            this.renderer.setPixelRatio (window.devicePixelRatio);
        }
        this.renderer.setSize (width, height);
        this.cameraValidator.ForceUpdate ();
        this.Render ();
    }

    FitSphereToWindow (boundingSphere, animation)
    {
        if (boundingSphere === null) {
            return;
        }
        let center = new Coord3D (boundingSphere.center.x, boundingSphere.center.y, boundingSphere.center.z);
        let radius = boundingSphere.radius;

        let newCamera = this.navigation.GetFitToSphereCamera (center, radius);
        this.navigation.MoveCamera (newCamera, animation ? this.settings.animationSteps : 0);
    }

    AdjustClippingPlanes ()
    {
        let boundingSphere = this.GetBoundingSphere ((meshUserData) => {
            return true;
        });
        this.AdjustClippingPlanesToSphere (boundingSphere);
    }

    AdjustClippingPlanesToSphere (boundingSphere)
    {
        if (boundingSphere === null) {
            return;
        }
        if (boundingSphere.radius < 10.0) {
            this.camera.near = 0.01;
            this.camera.far = 100.0;
        } else if (boundingSphere.radius < 100.0) {
            this.camera.near = 0.1;
            this.camera.far = 1000.0;
        } else if (boundingSphere.radius < 1000.0) {
            this.camera.near = 10.0;
            this.camera.far = 10000.0;
        } else {
            this.camera.near = 100.0;
            this.camera.far = 1000000.0;
        }

        this.cameraValidator.ForceUpdate ();
        this.Render ();
    }

    GetNavigationMode ()
    {
        return this.navigation.GetNavigationMode ();
    }

    SetNavigationMode (navigationMode)
    {
        let oldCamera = this.navigation.GetCamera ();
        let newCamera = this.upVector.SetFixed (navigationMode === NavigationMode.FixedUpVector, oldCamera);
        this.navigation.SetNavigationMode (navigationMode);
        if (newCamera !== null) {
            this.navigation.MoveCamera (newCamera, this.settings.animationSteps);
        }
        this.Render ();
    }

    SetUpVector (upDirection, animate)
    {
        let oldCamera = this.navigation.GetCamera ();
        let newCamera = this.upVector.SetDirection (upDirection, oldCamera);
        let animationSteps = animate ? this.settings.animationSteps : 0;
        this.navigation.MoveCamera (newCamera, animationSteps);
        this.Render ();
    }

    FlipUpVector ()
    {
        let oldCamera = this.navigation.GetCamera ();
        let newCamera = this.upVector.Flip (oldCamera);
        this.navigation.MoveCamera (newCamera, 0);
        this.Render ();
    }

    Render ()
    {
        let navigationCamera = this.navigation.GetCamera ();

        this.camera.position.set (navigationCamera.eye.x, navigationCamera.eye.y, navigationCamera.eye.z);
        this.camera.up.set (navigationCamera.up.x, navigationCamera.up.y, navigationCamera.up.z);
        this.camera.lookAt (new THREE.Vector3 (navigationCamera.center.x, navigationCamera.center.y, navigationCamera.center.z));

        if (this.projectionMode === ProjectionMode.Perspective) {
            if (!this.cameraValidator.ValidatePerspective ()) {
                this.camera.aspect = this.canvas.width / this.canvas.height;
                this.camera.fov = navigationCamera.fov;
                this.camera.updateProjectionMatrix ();
            }
        } else if (this.projectionMode === ProjectionMode.Orthographic) {
            let eyeCenterDistance = CoordDistance3D (navigationCamera.eye, navigationCamera.center);
            if (!this.cameraValidator.ValidateOrthographic (eyeCenterDistance)) {
                let aspect = this.canvas.width / this.canvas.height;
                let eyeCenterDistance = CoordDistance3D (navigationCamera.eye, navigationCamera.center);
                let frustumHalfHeight = eyeCenterDistance * Math.tan (0.5 * navigationCamera.fov * DegRad);
                this.camera.left = -frustumHalfHeight * aspect;
                this.camera.right = frustumHalfHeight * aspect;
                this.camera.top = frustumHalfHeight;
                this.camera.bottom = -frustumHalfHeight;
                this.camera.updateProjectionMatrix ();
            }
        }

        this.shadingModel.UpdateByCamera (navigationCamera);
        this.renderer.render (this.scene, this.camera);
    }

    SetMainObject (object)
    {
        const shadingType = GetShadingTypeOfObject (object);
        this.mainModel.SetMainObject (object);
        this.shadingModel.SetShadingType (shadingType);

        this.Render ();
    }

    AddExtraObject (object)
    {
        this.extraModel.AddObject (object);
        this.Render ();
    }

    Clear ()
    {
        this.mainModel.Clear ();
        this.extraModel.Clear ();
        this.Render ();
    }

    ClearExtra ()
    {
        this.extraModel.Clear ();
        this.Render ();
    }

    SetMeshesVisibility (isVisible)
    {
        this.mainModel.EnumerateMeshes ((mesh) => {
            let visible = isVisible (mesh.userData);
            if (mesh.visible !== visible) {
                mesh.visible = visible;
            }
        });
        this.mainModel.EnumerateEdges ((edge) => {
            let visible = isVisible (edge.userData);
            if (edge.visible !== visible) {
                edge.visible = visible;
            }
        });
        this.Render ();
    }

    SetMeshesHighlight (highlightColor, isHighlighted)
    {
        function CreateHighlightMaterials (originalMaterials, highlightMaterial)
        {
            let highlightMaterials = [];
            for (let i = 0; i < originalMaterials.length; i++) {
                highlightMaterials.push (highlightMaterial);
            }
            return highlightMaterials;
        }

        const highlightMaterial = this.CreateHighlightMaterial (highlightColor);
        this.mainModel.EnumerateMeshes ((mesh) => {
            let highlighted = isHighlighted (mesh.userData);
            if (highlighted) {
                if (mesh.userData.threeMaterials === null) {
                    mesh.userData.threeMaterials = mesh.material;
                    mesh.material = CreateHighlightMaterials (mesh.material, highlightMaterial);
                }
            } else {
                if (mesh.userData.threeMaterials !== null) {
                    mesh.material = mesh.userData.threeMaterials;
                    mesh.userData.threeMaterials = null;
                }
            }
        });

        this.Render ();
    }

    CreateHighlightMaterial (highlightColor)
    {
        const showEdges = this.mainModel.edgeSettings.showEdges;
        return this.shadingModel.CreateHighlightMaterial (highlightColor, showEdges);
    }

    GetMeshUserDataUnderMouse (mouseCoords)
    {
        let intersection = this.GetMeshIntersectionUnderMouse (mouseCoords);
        if (intersection === null) {
            return null;
        }
        return intersection.object.userData;
    }

    GetMeshIntersectionUnderMouse (mouseCoords)
    {
        let canvasSize = this.GetCanvasSize ();
        let intersection = this.mainModel.GetMeshIntersectionUnderMouse (mouseCoords, this.camera, canvasSize.width, canvasSize.height);
        if (intersection === null) {
            return null;
        }
        return intersection;
    }

    GetBoundingBox (needToProcess)
    {
        return this.mainModel.GetBoundingBox (needToProcess);
    }

    GetBoundingSphere (needToProcess)
    {
        return this.mainModel.GetBoundingSphere (needToProcess);
    }

    EnumerateMeshesUserData (enumerator)
    {
        this.mainModel.EnumerateMeshes ((mesh) => {
            enumerator (mesh.userData);
        });
    }

    InitNavigation ()
    {
        let camera = GetDefaultCamera (Direction.Y);
        this.camera = new THREE.PerspectiveCamera (45.0, 1.0, 0.1, 1000.0);
        this.projectionMode = ProjectionMode.Perspective;
        this.cameraValidator = new CameraValidator ();
        this.scene.add (this.camera);

        let canvasElem = this.renderer.domElement;
        this.navigation = new Navigation (canvasElem, camera, {
            onUpdate : () => {
                this.Render ();
            }
        });

        this.upVector = new UpVector ();
    }

    InitShading  ()
    {
        this.shadingModel = new ShadingModel (this.scene);
    }

    GetShadingType ()
    {
        return this.shadingModel.type;
    }

    GetImageSize ()
    {
        let originalSize = new THREE.Vector2 ();
        this.renderer.getSize (originalSize);
        return {
            width : parseInt (originalSize.x, 10),
            height : parseInt (originalSize.y, 10)
        };
    }

    GetCanvasSize ()
    {
        let width = this.canvas.width;
        let height = this.canvas.height;
        if (window.devicePixelRatio) {
            width /= window.devicePixelRatio;
            height /= window.devicePixelRatio;
        }
        return {
            width : width,
            height : height
        };
    }

    GetImageAsDataUrl (width, height, isTransparent)
    {
        let originalSize = this.GetImageSize ();
        let renderWidth = width;
        let renderHeight = height;
        if (window.devicePixelRatio) {
            renderWidth /= window.devicePixelRatio;
            renderHeight /= window.devicePixelRatio;
        }
        let clearAlpha = this.renderer.getClearAlpha ();
        if (isTransparent) {
            this.renderer.setClearAlpha (0.0);
        }
        this.ResizeRenderer (renderWidth, renderHeight);
        this.Render ();
        let url = this.renderer.domElement.toDataURL ();
        this.ResizeRenderer (originalSize.width, originalSize.height);
        this.renderer.setClearAlpha (clearAlpha);
        return url;
    }

    Destroy ()
    {
        this.Clear ();
        this.renderer.dispose ();
    }
}

/**
 * This is the main object for embedding the viewer on a website.
 */
class EmbeddedViewer
{
    /**
     * @param {HTMLElement} parentElement The parent element for the viewer canvas. It must be an
     * existing DOM element and it will be the container for the canvas. The size of the viewer will
     * be automatically adjusted to the size of the parent element.
     * @param {object} parameters Parameters for embedding.
     * @param {Camera} [parameters.camera] Camera to use. If not specified, the default camera will
     * be used and the model will be fitted to the window.
     * @param {ProjectionMode} [parameters.projectionMode] Camera projection mode.
     * @param {RGBAColor} [parameters.backgroundColor] Background color of the canvas.
     * @param {RGBColor} [parameters.defaultColor] Default color of the model. It has effect only
     * if the imported model doesn't specify any color.
     * @param {EdgeSettings} [parameters.edgeSettings] Edge settings.
     * @param {EnvironmentSettings} [parameters.environmentSettings] Environment settings.
     * @param {function} [parameters.onModelLoaded] Callback that is called when the model with all
     * of the textures is fully loaded.
    */
    constructor (parentElement, parameters)
    {
        this.parentElement = parentElement;
        this.parameters = {};
        if (IsDefined (parameters)) {
            this.parameters = parameters;
        }

        this.canvas = document.createElement ('canvas');
        this.parentElement.appendChild (this.canvas);

        this.viewer = new Viewer ();
        this.viewer.Init (this.canvas);

        let width = this.parentElement.clientWidth;
        let height = this.parentElement.clientHeight;
        this.viewer.Resize (width, height);

        if (this.parameters.projectionMode) {
            this.viewer.SetProjectionMode (this.parameters.projectionMode);
        }

        if (this.parameters.backgroundColor) {
            this.viewer.SetBackgroundColor (this.parameters.backgroundColor);
        }

        if (this.parameters.edgeSettings) {
            this.viewer.SetEdgeSettings (this.parameters.edgeSettings);
        }

        if (this.parameters.environmentSettings) {
            this.viewer.SetEnvironmentMapSettings (this.parameters.environmentSettings);
        }

        this.model = null;
        this.modelLoader = new ThreeModelLoader ();

        window.addEventListener ('resize', () => {
            this.Resize ();
        });
    }

    /**
     * Loads the model based on a list of urls. The list must contain the main model file and all
     * of the referenced files. For example in case of an obj file the list must contain the
     * corresponding mtl and texture files, too.
     * @param {string[]} modelUrls Url list of model files.
     */
    LoadModelFromUrlList (modelUrls)
    {
        TransformFileHostUrls (modelUrls);
        let inputFiles = InputFilesFromUrls (modelUrls);
        this.LoadModelFromInputFiles (inputFiles);
    }

    /**
     * Loads the model based on a list of {@link File} objects. The list must contain the main model
     * file and all of the referenced files. You must use this method when you are using a file picker
     * or drag and drop to select files from a computer.
     * @param {File[]} fileList File object list of model files.
     */
    LoadModelFromFileList (fileList)
    {
        let inputFiles = InputFilesFromFileObjects (fileList);
        this.LoadModelFromInputFiles (inputFiles);
    }

    /**
     * Loads the model based on a list of {@link InputFile} objects. This method is used
     * internally, you should use LoadModelFromUrlList or LoadModelFromFileList instead.
     * @param {InputFile[]} inputFiles List of model files.
     */
    LoadModelFromInputFiles (inputFiles)
    {
        if (inputFiles === null || inputFiles.length === 0) {
            return;
        }

        this.viewer.Clear ();
        let settings = new ImportSettings ();
        if (this.parameters.defaultColor) {
            settings.defaultColor = this.parameters.defaultColor;
        }

        this.model = null;
        let progressDiv = null;
        this.modelLoader.LoadModel (inputFiles, settings, {
            onLoadStart : () => {
                this.canvas.style.display = 'none';
                progressDiv = document.createElement ('div');
                progressDiv.innerHTML = 'Loading model...';
                this.parentElement.appendChild (progressDiv);
            },
            onFileListProgress : (current, total) => {
            },
            onFileLoadProgress : (current, total) => {
            },
            onImportStart : () => {
                progressDiv.innerHTML = 'Importing model...';
            },
            onVisualizationStart : () => {
                progressDiv.innerHTML = 'Visualizing model...';
            },
            onModelFinished : (importResult, threeObject) => {
                this.parentElement.removeChild (progressDiv);
                this.canvas.style.display = 'inherit';
                this.viewer.SetMainObject (threeObject);
                let boundingSphere = this.viewer.GetBoundingSphere ((meshUserData) => {
                    return true;
                });
                this.viewer.AdjustClippingPlanesToSphere (boundingSphere);
                if (this.parameters.camera) {
                    this.viewer.SetCamera (this.parameters.camera);
                } else {
                    this.viewer.SetUpVector (Direction.Y, false);
                    this.viewer.FitSphereToWindow (boundingSphere, false);
                }

                this.model = importResult.model;
                if (this.parameters.onModelLoaded) {
                    this.parameters.onModelLoaded ();
                }
            },
            onTextureLoaded : () => {
                this.viewer.Render ();
            },
            onLoadError : (importError) => {
                let message = 'Unknown error.';
                if (importError.code === ImportErrorCode.NoImportableFile) {
                    message = 'No importable file found.';
                } else if (importError.code === ImportErrorCode.FailedToLoadFile) {
                    message = 'Failed to load file for import.';
                } else if (importError.code === ImportErrorCode.ImportFailed) {
                    message = 'Failed to import model.';
                }
                if (importError.message !== null) {
                    message += ' (' + importError.message + ')';
                }
                progressDiv.innerHTML = message;
            }
        });
    }

    /**
     * Returns the underlying Viewer object.
     * @returns {Viewer}
     */
    GetViewer ()
    {
        return this.viewer;
    }

    /**
     * Returns the underlying Model object.
     * @returns {Model}
     */
    GetModel ()
    {
        return this.model;
    }

    /**
     * This method must be called when the size of the parent element changes to make sure that the
     * context has the same dimensions as the parent element.
     */
    Resize ()
    {
        let width = this.parentElement.clientWidth;
        let height = this.parentElement.clientHeight;
        this.viewer.Resize (width, height);
    }

    /**
     * Frees up all the memory that is allocated by the viewer. You should call this function if
     * yo don't need the viewer anymore.
     */
    Destroy ()
    {
        this.modelLoader.Destroy ();
        this.viewer.Destroy ();
        this.model = null;
    }
}

/**
 * Loads the model specified by urls.
 * @param {HTMLElement} parentElement The parent element for the viewer canvas.
 * @param {string[]} modelUrls Url list of model files.
 * @param {object} parameters See {@link EmbeddedViewer} constructor for details.
 * @returns {EmbeddedViewer}
 */
function Init3DViewerFromUrlList (parentElement, modelUrls, parameters)
{
    let viewer = new EmbeddedViewer (parentElement, parameters);
    viewer.LoadModelFromUrlList (modelUrls);
    return viewer;
}

/**
 * Loads the model specified by File objects.
 * @param {HTMLElement} parentElement The parent element for the viewer canvas.
 * @param {File[]} models File object list of model files.
 * @param {object} parameters See {@link EmbeddedViewer} constructor for details.
 * @returns {EmbeddedViewer}
 */
function Init3DViewerFromFileList (parentElement, models, parameters)
{
    let viewer = new EmbeddedViewer (parentElement, parameters);
    viewer.LoadModelFromFileList (models);
    return viewer;
}

/**
 * Loads all the models on the page. This function looks for all the elements with online_3d_viewer
 * class name, and loads the model according to the tag's parameters. It must be called after the
 * document is loaded.
 * @returns {EmbeddedViewer[]} Array of the created {@link EmbeddedViewer} objects.
 */
function Init3DViewerElements (onReady)
{
    function LoadElement (element)
    {
        let camera = null;
        let cameraParams = element.getAttribute ('camera');
        if (cameraParams) {
            camera = ParameterConverter.StringToCamera (cameraParams);
        }

        let projectionMode = null;
        let cameraModeParams = element.getAttribute ('projectionmode');
        if (cameraModeParams) {
            projectionMode = ParameterConverter.StringToProjectionMode (cameraModeParams);
        }

        let backgroundColor = null;
        let backgroundColorParams = element.getAttribute ('backgroundcolor');
        if (backgroundColorParams) {
            backgroundColor = ParameterConverter.StringToRGBAColor (backgroundColorParams);
        }

        let defaultColor = null;
        let defaultColorParams = element.getAttribute ('defaultcolor');
        if (defaultColorParams) {
            defaultColor = ParameterConverter.StringToRGBColor (defaultColorParams);
        }

        let edgeSettings = null;
        let edgeSettingsParams = element.getAttribute ('edgesettings');
        if (edgeSettingsParams) {
            edgeSettings = ParameterConverter.StringToEdgeSettings (edgeSettingsParams);
        }

        let environmentSettings = null;
        let environmentMapParams = element.getAttribute ('environmentmap');
        if (environmentMapParams) {
            let environmentMapParts = environmentMapParams.split (',');
            if (environmentMapParts.length === 6) {
                let backgroundIsEnvMap = false;
                let backgroundIsEnvMapParam = element.getAttribute ('environmentmapbg');
                if (backgroundIsEnvMapParam && backgroundIsEnvMapParam === 'true') {
                    backgroundIsEnvMap = true;
                }
                environmentSettings = new EnvironmentSettings (environmentMapParts, backgroundIsEnvMap);
            }
        }

        let modelUrls = null;
        let modelParams = element.getAttribute ('model');
        if (modelParams) {
            modelUrls = ParameterConverter.StringToModelUrls (modelParams);
        }

        return Init3DViewerFromUrlList (element, modelUrls, {
            camera : camera,
            projectionMode : projectionMode,
            backgroundColor : backgroundColor,
            defaultColor : defaultColor,
            edgeSettings : edgeSettings,
            environmentSettings : environmentSettings
        });
    }

    let viewerElements = [];
    let elements = document.getElementsByClassName ('online_3d_viewer');
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let viewerElement = LoadElement (element);
        viewerElements.push (viewerElement);
    }
    return viewerElements;
}

export { AddCoord2D, AddCoord3D, AddDiv, AddDomElement, ArrayBufferToAsciiString, ArrayBufferToUtf8String, ArrayToCoord3D, ArrayToQuaternion, ArrayToRGBColor, AsciiStringToArrayBuffer, Base64DataURIToArrayBuffer, BezierTweenFunction, BigEps, BinaryReader, BinaryWriter, BoundingBoxCalculator3D, Box3D, CalculateSurfaceArea, CalculateTriangleNormal, CalculateVolume, Camera, CameraIsEqual3D, CameraValidator, CheckModel, ClearDomElement, ClickDetector, ColorComponentFromFloat, ColorComponentToFloat, ColorToMaterialConverter, ConvertColorToThreeColor, ConvertMeshToMeshBuffer, ConvertModelToThreeObject, ConvertThreeColorToColor, ConvertThreeGeometryToMesh, Coord2D, Coord3D, Coord4D, CoordDistance2D, CoordDistance3D, CoordIsEqual2D, CoordIsEqual3D, CopyObjectAttributes, CreateDiv, CreateDomElement, CreateModelUrlParameters, CreateObjectUrl, CreateObjectUrlWithMimeType, CreateUrlBuilder, CreateUrlParser, CrossVector3D, DegRad, Direction, DisposeThreeObjects, DotVector3D, EdgeSettings, EmbeddedViewer, EnvironmentSettings, Eps, EscapeHtmlChars, EventNotifier, ExportedFile, Exporter, Exporter3dm, ExporterBase, ExporterBim, ExporterGltf, ExporterModel, ExporterObj, ExporterOff, ExporterPly, ExporterSettings, ExporterStl, FaceMaterial, FileFormat, FileSource, FinalizeModel, FlipMeshTrianglesOrientation, GenerateCone, GenerateCuboid, GenerateCylinder, GeneratePlatonicSolid, GenerateSphere, Generator, GeneratorHelper, GeneratorParams, GetBoundingBox, GetDefaultCamera, GetDomElementClientCoordinates, GetDomElementExternalHeight, GetDomElementExternalWidth, GetDomElementInnerDimensions, GetDomElementOuterHeight, GetDomElementOuterWidth, GetExternalLibPath, GetFileExtension, GetFileExtensionFromMimeType, GetFileName, GetIntegerFromStyle, GetMeshType, GetShadingType, GetShadingTypeOfObject, GetTetrahedronSignedVolume, GetTopology, GetTriangleArea, HasDefaultMaterial, HasHighpDriverIssue, HexStringToRGBAColor, HexStringToRGBColor, ImportError, ImportErrorCode, ImportResult, ImportSettings, Importer, Importer3dm, Importer3ds, ImporterBase, ImporterBim, ImporterFcstd, ImporterFile, ImporterFileAccessor, ImporterFileList, ImporterGltf, ImporterIfc, ImporterObj, ImporterOcct, ImporterOff, ImporterPly, ImporterStl, ImporterThree3mf, ImporterThreeAmf, ImporterThreeBase, ImporterThreeDae, ImporterThreeFbx, ImporterThreeSvg, ImporterThreeWrl, Init3DViewerElements, Init3DViewerFromFileList, Init3DViewerFromUrlList, InputFile, InputFilesFromFileObjects, InputFilesFromUrls, InsertDomElementAfter, InsertDomElementBefore, IntegerToHexString, IsDefined, IsDomElementVisible, IsEqual, IsEqualEps, IsGreater, IsGreaterOrEqual, IsLower, IsLowerOrEqual, IsModelEmpty, IsNegative, IsObjectEmpty, IsPositive, IsPowerOfTwo, IsTwoManifold, IsUrl, IsZero, LinearToSRGB, LinearTweenFunction, LoadExternalLibrary, MaterialBase, MaterialType, Matrix, MatrixIsEqual, Mesh, MeshBuffer, MeshInstance, MeshInstanceId, MeshPrimitiveBuffer, MeshType, Model, ModelObject3D, ModelToThreeConversionOutput, ModelToThreeConversionParams, MouseInteraction, NameFromLine, Navigation, NavigationMode, NavigationType, NextPowerOfTwo, Node, Object3D, Octree, OctreeNode, ParabolicTweenFunction, ParameterConverter, ParameterListBuilder, ParameterListParser, ParametersFromLine, PhongMaterial, PhysicalMaterial, ProjectionMode, Property, PropertyGroup, PropertyToString, PropertyType, Quaternion, QuaternionFromAxisAngle, QuaternionFromXYZ, QuaternionIsEqual, RGBAColor, RGBAColorToHexString, RGBColor, RGBColorFromFloatComponents, RGBColorIsEqual, RGBColorToHexString, RadDeg, ReadFile, ReadLines, ReplaceDefaultMaterialColor, RequestUrl, RevokeObjectUrl, RunTaskAsync, RunTasks, RunTasksBatch, SRGBToLinear, SetDomElementHeight, SetDomElementOuterHeight, SetDomElementOuterWidth, SetDomElementWidth, SetExternalLibLocation, SetThreeMeshPolygonOffset, ShadingModel, ShadingType, ShowDomElement, SubCoord2D, SubCoord3D, TaskRunner, TextWriter, TextureIsEqual, TextureMap, TextureMapIsEqual, ThreeColorConverter, ThreeConversionStateHandler, ThreeLinearToSRGBColorConverter, ThreeModelLoader, ThreeNodeTree, ThreeSRGBToLinearColorConverter, Topology, TopologyEdge, TopologyTriangle, TopologyTriangleEdge, TopologyVertex, TouchInteraction, TransformFileHostUrls, TransformMesh, Transformation, TransformationIsEqual, TraverseThreeObject, Triangle, TweenCoord3D, Unit, UpVector, UpdateMaterialTransparency, Utf8StringToArrayBuffer, ValueOrDefault, VectorAngle3D, VectorLength3D, Viewer, ViewerMainModel, ViewerModel, WaitWhile };
