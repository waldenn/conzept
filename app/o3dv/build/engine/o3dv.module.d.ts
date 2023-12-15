export function AddCoord2D(a: any, b: any): Coord2D;
export function AddCoord3D(a: any, b: any): Coord3D;
export function AddDiv(parentElement: any, className: any, innerHTML: any): any;
export function AddDomElement(parentElement: any, elementType: any, className: any, innerHTML: any): any;
export function ArrayBufferToAsciiString(buffer: any): string;
export function ArrayBufferToUtf8String(buffer: any): string;
export function ArrayToCoord3D(arr: any): Coord3D;
export function ArrayToQuaternion(arr: any): Quaternion;
export function ArrayToRGBColor(arr: any): RGBColor;
export function AsciiStringToArrayBuffer(str: any): ArrayBuffer;
export function Base64DataURIToArrayBuffer(uri: any): {
    mimeType: any;
    buffer: ArrayBuffer;
};
export function BezierTweenFunction(distance: any, index: any, count: any): number;
export const BigEps: 0.0001;
export class BinaryReader {
    constructor(arrayBuffer: any, isLittleEndian: any);
    arrayBuffer: any;
    dataView: DataView;
    isLittleEndian: any;
    position: number;
    GetPosition(): number;
    SetPosition(position: any): void;
    GetByteLength(): any;
    Skip(bytes: any): void;
    End(): boolean;
    ReadArrayBuffer(byteLength: any): ArrayBuffer;
    ReadBoolean8(): boolean;
    ReadCharacter8(): number;
    ReadUnsignedCharacter8(): number;
    ReadInteger16(): number;
    ReadUnsignedInteger16(): number;
    ReadInteger32(): number;
    ReadUnsignedInteger32(): number;
    ReadFloat32(): number;
    ReadDouble64(): number;
}
export class BinaryWriter {
    constructor(byteLength: any, isLittleEndian: any);
    arrayBuffer: ArrayBuffer;
    dataView: DataView;
    isLittleEndian: any;
    position: number;
    GetPosition(): number;
    SetPosition(position: any): void;
    End(): boolean;
    GetBuffer(): ArrayBuffer;
    WriteArrayBuffer(arrayBuffer: any): void;
    WriteBoolean8(val: any): void;
    WriteCharacter8(val: any): void;
    WriteUnsignedCharacter8(val: any): void;
    WriteInteger16(val: any): void;
    WriteUnsignedInteger16(val: any): void;
    WriteInteger32(val: any): void;
    WriteUnsignedInteger32(val: any): void;
    WriteFloat32(val: any): void;
    WriteDouble64(val: any): void;
}
export class BoundingBoxCalculator3D {
    box: Box3D;
    isValid: boolean;
    GetBox(): Box3D;
    AddPoint(point: any): void;
}
export class Box3D {
    constructor(min: any, max: any);
    min: any;
    max: any;
    GetMin(): any;
    GetMax(): any;
    GetCenter(): Coord3D;
}
export function CalculateSurfaceArea(object3D: any): number;
export function CalculateTriangleNormal(v0: any, v1: any, v2: any): Coord3D;
export function CalculateVolume(object3D: any): number;
/**
 * Camera object.
 */
export class Camera {
    /**
     * @param {Coord3D} eye Eye position.
     * @param {Coord3D} center Center position. Sometimes it's called target or look at position.
     * @param {Coord3D} up Up vector.
     * @param {number} fov Field of view in degrees.
     */
    constructor(eye: Coord3D, center: Coord3D, up: Coord3D, fov: number);
    eye: Coord3D;
    center: Coord3D;
    up: Coord3D;
    fov: number;
    /**
     * Creates a clone of the object.
     * @returns {Camera}
     */
    Clone(): Camera;
}
export function CameraIsEqual3D(a: any, b: any): boolean;
export class CameraValidator {
    eyeCenterDistance: number;
    forceUpdate: boolean;
    ForceUpdate(): void;
    ValidatePerspective(): boolean;
    ValidateOrthographic(eyeCenterDistance: any): boolean;
}
export function CheckModel(model: any): boolean;
export function ClearDomElement(element: any): void;
export class ClickDetector {
    isClick: boolean;
    startPosition: any;
    Start(startPosition: any): void;
    Move(currentPosition: any): void;
    End(): void;
    Cancel(): void;
    IsClick(): boolean;
}
export function ColorComponentFromFloat(component: any): number;
export function ColorComponentToFloat(component: any): number;
export class ColorToMaterialConverter {
    constructor(model: any);
    model: any;
    colorToMaterialIndex: Map<any, any>;
    GetMaterialIndex(r: any, g: any, b: any, a: any): any;
}
export function ConvertColorToThreeColor(color: any): any;
export function ConvertMeshToMeshBuffer(mesh: any): MeshBuffer;
export function ConvertModelToThreeObject(model: any, params: any, output: any, callbacks: any): void;
export function ConvertThreeColorToColor(threeColor: any): RGBColor;
export function ConvertThreeGeometryToMesh(threeGeometry: any, materialIndex: any, colorConverter: any): Mesh;
export class Coord2D {
    constructor(x: any, y: any);
    x: any;
    y: any;
    Clone(): Coord2D;
}
export class Coord3D {
    constructor(x: any, y: any, z: any);
    x: any;
    y: any;
    z: any;
    Length(): number;
    MultiplyScalar(scalar: any): this;
    Normalize(): this;
    Offset(direction: any, distance: any): this;
    Rotate(axis: any, angle: any, origo: any): this;
    Clone(): Coord3D;
}
export class Coord4D {
    constructor(x: any, y: any, z: any, w: any);
    x: any;
    y: any;
    z: any;
    w: any;
    Clone(): Coord4D;
}
export function CoordDistance2D(a: any, b: any): number;
export function CoordDistance3D(a: any, b: any): number;
export function CoordIsEqual2D(a: any, b: any): boolean;
export function CoordIsEqual3D(a: any, b: any): boolean;
export function CopyObjectAttributes(src: any, dest: any): void;
export function CreateDiv(className: any, innerHTML: any): any;
export function CreateDomElement(elementType: any, className: any, innerHTML: any): any;
export function CreateModelUrlParameters(urls: any): string;
export function CreateObjectUrl(content: any): string;
export function CreateObjectUrlWithMimeType(content: any, mimeType: any): string;
export function CreateUrlBuilder(): ParameterListBuilder;
export function CreateUrlParser(urlParams: any): ParameterListParser;
export function CrossVector3D(a: any, b: any): Coord3D;
export const DegRad: 0.017453292519943;
export namespace Direction {
    let X: number;
    let Y: number;
    let Z: number;
}
export function DisposeThreeObjects(mainObject: any): void;
export function DotVector3D(a: any, b: any): number;
/**
 * Edge settings object.
 */
export class EdgeSettings {
    /**
     * @param {boolean} showEdges Show edges.
     * @param {RGBColor} edgeColor Color of the edges.
     * @param {number} edgeThreshold Minimum angle between faces to show edges between them in.
     * The value must be in degrees.
     */
    constructor(showEdges: boolean, edgeColor: RGBColor, edgeThreshold: number);
    showEdges: boolean;
    edgeColor: RGBColor;
    edgeThreshold: number;
    /**
     * Creates a clone of the object.
     * @returns {EdgeSettings}
     */
    Clone(): EdgeSettings;
}
/**
 * This is the main object for embedding the viewer on a website.
 */
export class EmbeddedViewer {
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
    constructor(parentElement: HTMLElement, parameters: {
        camera?: Camera;
        projectionMode?: ProjectionMode;
        backgroundColor?: RGBAColor;
        defaultColor?: RGBColor;
        edgeSettings?: EdgeSettings;
        environmentSettings?: EnvironmentSettings;
        onModelLoaded?: Function;
    });
    parentElement: HTMLElement;
    parameters: {
        camera?: Camera;
        projectionMode?: any;
        backgroundColor?: RGBAColor;
        defaultColor?: RGBColor;
        edgeSettings?: EdgeSettings;
        environmentSettings?: EnvironmentSettings;
        onModelLoaded?: Function;
    };
    canvas: HTMLCanvasElement;
    viewer: Viewer;
    model: any;
    modelLoader: ThreeModelLoader;
    /**
     * Loads the model based on a list of urls. The list must contain the main model file and all
     * of the referenced files. For example in case of an obj file the list must contain the
     * corresponding mtl and texture files, too.
     * @param {string[]} modelUrls Url list of model files.
     */
    LoadModelFromUrlList(modelUrls: string[]): void;
    /**
     * Loads the model based on a list of {@link File} objects. The list must contain the main model
     * file and all of the referenced files. You must use this method when you are using a file picker
     * or drag and drop to select files from a computer.
     * @param {File[]} fileList File object list of model files.
     */
    LoadModelFromFileList(fileList: File[]): void;
    /**
     * Loads the model based on a list of {@link InputFile} objects. This method is used
     * internally, you should use LoadModelFromUrlList or LoadModelFromFileList instead.
     * @param {InputFile[]} inputFiles List of model files.
     */
    LoadModelFromInputFiles(inputFiles: InputFile[]): void;
    /**
     * Returns the underlying Viewer object.
     * @returns {Viewer}
     */
    GetViewer(): Viewer;
    /**
     * Returns the underlying Model object.
     * @returns {Model}
     */
    GetModel(): Model;
    /**
     * This method must be called when the size of the parent element changes to make sure that the
     * context has the same dimensions as the parent element.
     */
    Resize(): void;
    /**
     * Frees up all the memory that is allocated by the viewer. You should call this function if
     * yo don't need the viewer anymore.
     */
    Destroy(): void;
}
/**
 * Environment settings object.
 */
export class EnvironmentSettings {
    /**
     * @param {string[]} textureNames Urls of the environment map images in this order:
     * posx, negx, posy, negy, posz, negz.
     * @param {boolean} backgroundIsEnvMap Use the environment map as background.
     */
    constructor(textureNames: string[], backgroundIsEnvMap: boolean);
    textureNames: string[];
    backgroundIsEnvMap: boolean;
    /**
     * Creates a clone of the object.
     * @returns {EnvironmentSettings}
     */
    Clone(): EnvironmentSettings;
}
export const Eps: 1e-8;
export function EscapeHtmlChars(str: any): any;
export class EventNotifier {
    eventListeners: Map<any, any>;
    AddEventListener(eventId: any, listener: any): void;
    HasEventListener(eventId: any): boolean;
    GetEventNotifier(eventId: any): () => void;
    NotifyEventListeners(eventId: any, ...args: any[]): void;
}
export class ExportedFile {
    constructor(name: any);
    name: any;
    content: any;
    GetName(): any;
    SetName(name: any): void;
    GetTextContent(): string;
    GetBufferContent(): any;
    SetTextContent(content: any): void;
    SetBufferContent(content: any): void;
}
export class Exporter {
    exporters: (Exporter3dm | ExporterBim | ExporterGltf | ExporterObj | ExporterOff | ExporterPly | ExporterStl)[];
    AddExporter(exporter: any): void;
    Export(model: any, settings: any, format: any, extension: any, callbacks: any): void;
}
export class Exporter3dm extends ExporterBase {
    rhino: any;
    ExportRhinoContent(exporterModel: any, files: any, onFinish: any): void;
}
export class ExporterBase {
    CanExport(format: any, extension: any): boolean;
    Export(exporterModel: any, format: any, onFinish: any): void;
    ExportContent(exporterModel: any, format: any, files: any, onFinish: any): void;
    GetExportedMaterialName(originalName: any): any;
    GetExportedMeshName(originalName: any): any;
    GetExportedName(originalName: any, defaultName: any): any;
}
export class ExporterBim extends ExporterBase {
    ExportProperties(element: any, targetObject: any): void;
}
export class ExporterGltf extends ExporterBase {
    components: {
        index: {
            type: number;
            size: number;
        };
        number: {
            type: number;
            size: number;
        };
    };
    ExportAsciiContent(exporterModel: any, files: any): void;
    ExportBinaryContent(exporterModel: any, files: any): void;
    GetMeshData(exporterModel: any): any[];
    GetMainBuffer(meshDataArr: any): ArrayBuffer;
    GetMainJson(exporterModel: any, meshDataArr: any): {
        asset: {
            generator: string;
            version: string;
        };
        scene: number;
        scenes: {
            nodes: any[];
        }[];
        nodes: any[];
        materials: any[];
        meshes: any[];
        buffers: any[];
        bufferViews: any[];
        accessors: any[];
    };
    ExportMaterials(exporterModel: any, mainJson: any, addTexture: any): void;
}
export class ExporterModel {
    constructor(model: any, settings: any);
    model: any;
    settings: any;
    visibleMeshes: Set<any>;
    meshToVisibleMeshIndex: Map<any, any>;
    GetModel(): any;
    MaterialCount(): any;
    GetMaterial(index: any): any;
    VertexCount(): number;
    TriangleCount(): number;
    MeshCount(): number;
    EnumerateMeshes(onMesh: any): void;
    MapMeshIndex(meshIndex: any): any;
    IsMeshInstanceVisible(meshInstanceId: any): any;
    MeshInstanceCount(): number;
    EnumerateMeshInstances(onMeshInstance: any): void;
    EnumerateTransformedMeshInstances(onMesh: any): void;
    EnumerateVerticesAndTriangles(callbacks: any): void;
    EnumerateTrianglesWithNormals(onTriangle: any): void;
    FillVisibleMeshCache(): void;
}
export class ExporterObj extends ExporterBase {
    GetHeaderText(): string;
}
export class ExporterOff extends ExporterBase {
}
export class ExporterPly extends ExporterBase {
    ExportText(exporterModel: any, files: any): void;
    ExportBinary(exporterModel: any, files: any): void;
    GetHeaderText(format: any, vertexCount: any, triangleCount: any): string;
}
export class ExporterSettings {
    constructor(settings: any);
    transformation: Transformation;
    isMeshVisible: (meshInstanceId: any) => boolean;
}
export class ExporterStl extends ExporterBase {
    ExportText(exporterModel: any, files: any): void;
    ExportBinary(exporterModel: any, files: any): void;
}
export class FaceMaterial extends MaterialBase {
    emissive: RGBColor;
    opacity: number;
    transparent: boolean;
    diffuseMap: any;
    bumpMap: any;
    normalMap: any;
    emissiveMap: any;
    alphaTest: number;
    multiplyDiffuseMap: boolean;
}
export namespace FileFormat {
    let Text: number;
    let Binary: number;
}
/**
 * File source identifier for import.
 */
export type FileSource = any;
export namespace FileSource {
    let Url: number;
    let File: number;
    let Decompressed: number;
}
export function FinalizeModel(model: any, params: any): void;
export function FlipMeshTrianglesOrientation(mesh: any): void;
export function GenerateCone(genParams: any, topRadius: any, bottomRadius: any, height: any, segments: any, smooth: any): Mesh;
export function GenerateCuboid(genParams: any, xSize: any, ySize: any, zSize: any): Mesh;
export function GenerateCylinder(genParams: any, radius: any, height: any, segments: any, smooth: any): Mesh;
export function GeneratePlatonicSolid(genParams: any, type: any, radius: any): Mesh;
export function GenerateSphere(genParams: any, radius: any, segments: any, smooth: any): Mesh;
export class Generator {
    constructor(params: any);
    params: any;
    mesh: Mesh;
    curve: any;
    GetMesh(): Mesh;
    AddVertex(x: any, y: any, z: any): number;
    AddVertices(vertices: any): number[];
    SetCurve(curve: any): void;
    ResetCurve(): void;
    AddTriangle(v0: any, v1: any, v2: any): number;
    AddTriangleInverted(v0: any, v1: any, v2: any): void;
    AddConvexPolygon(vertices: any): void;
    AddConvexPolygonInverted(vertices: any): void;
}
export class GeneratorHelper {
    constructor(generator: any);
    generator: any;
    GenerateSurfaceBetweenPolygons(startIndices: any, endIndices: any): void;
    GenerateTriangleFan(startIndices: any, endIndex: any): void;
}
export class GeneratorParams {
    name: any;
    material: any;
    SetName(name: any): this;
    SetMaterial(material: any): this;
}
export function GetBoundingBox(object3D: any): Box3D;
export function GetDefaultCamera(direction: any): Camera;
export function GetDomElementClientCoordinates(element: any, clientX: any, clientY: any): Coord2D;
export function GetDomElementExternalHeight(style: any): number;
export function GetDomElementExternalWidth(style: any): number;
export function GetDomElementInnerDimensions(element: any, outerWidth: any, outerHeight: any): {
    width: number;
    height: number;
};
export function GetDomElementOuterHeight(element: any): any;
export function GetDomElementOuterWidth(element: any): any;
export function GetExternalLibPath(libName: any): string;
export function GetFileExtension(filePath: any): string;
export function GetFileExtensionFromMimeType(mimeType: any): any;
export function GetFileName(filePath: any): string;
export function GetIntegerFromStyle(parameter: any): number;
export function GetMeshType(mesh: any): number;
export function GetShadingType(model: any): number;
export function GetShadingTypeOfObject(mainObject: any): any;
export function GetTetrahedronSignedVolume(v0: any, v1: any, v2: any): number;
export function GetTopology(object3D: any): Topology;
export function GetTriangleArea(v0: any, v1: any, v2: any): number;
export function HasDefaultMaterial(model: any): boolean;
export function HasHighpDriverIssue(): boolean;
export function HexStringToRGBAColor(hexString: any): RGBAColor;
export function HexStringToRGBColor(hexString: any): RGBColor;
export class ImportError {
    constructor(code: any);
    code: any;
    mainFile: any;
    message: any;
}
export namespace ImportErrorCode {
    let NoImportableFile: number;
    let FailedToLoadFile: number;
    let ImportFailed: number;
    let UnknownError: number;
}
export class ImportResult {
    model: any;
    mainFile: any;
    upVector: any;
    usedFiles: any;
    missingFiles: any;
}
export class ImportSettings {
    defaultColor: RGBColor;
}
export class Importer {
    importers: (Importer3dm | Importer3ds | ImporterGltf | ImporterIfc | ImporterObj | ImporterOff | ImporterPly | ImporterOcct | ImporterStl | ImporterBim | ImporterThreeFbx | ImporterThreeDae | ImporterThreeWrl | ImporterThree3mf | ImporterThreeAmf | ImporterFcstd)[];
    fileList: ImporterFileList;
    model: any;
    usedFiles: any[];
    missingFiles: any[];
    AddImporter(importer: any): void;
    ImportFiles(inputFiles: any, settings: any, callbacks: any): void;
    LoadFiles(inputFiles: any, callbacks: any): void;
    ImportLoadedFiles(settings: any, callbacks: any): void;
    ImportLoadedMainFile(mainFile: any, settings: any, callbacks: any): void;
    DecompressArchives(fileList: any, onReady: any): void;
    GetFileList(): ImporterFileList;
    HasImportableFile(fileList: any): boolean;
    GetImportableFiles(fileList: any): {
        file: any;
        importer: any;
    }[];
}
export class Importer3dm extends ImporterBase {
    rhino: any;
    instanceIdToObject: Map<any, any>;
    instanceIdToDefinition: Map<any, any>;
    ImportRhinoContent(fileContent: any): void;
    ImportRhinoDocument(rhinoDoc: any): void;
    InitRhinoInstances(rhinoDoc: any): void;
    ImportRhinoUserStrings(rhinoDoc: any): void;
    ImportRhinoGeometry(rhinoDoc: any): void;
    ImportRhinoGeometryObject(rhinoDoc: any, rhinoObject: any, rhinoInstanceReferences: any): void;
    ImportRhinoMesh(rhinoDoc: any, rhinoMesh: any, rhinoObject: any, rhinoInstanceReferences: any): void;
    GetMaterialIndex(rhinoDoc: any, rhinoObject: any, rhinoInstanceReferences: any): any;
}
export class Importer3ds extends ImporterBase {
    materialNameToIndex: Map<any, any>;
    meshNameToIndex: Map<any, any>;
    nodeList: Importer3dsNodeList;
    ProcessBinary(fileContent: any): void;
    ReadMainChunk(reader: any, length: any): void;
    ReadEditorChunk(reader: any, length: any): void;
    ReadMaterialChunk(reader: any, length: any): void;
    ReadTextureMapChunk(reader: any, length: any): TextureMap;
    ReadColorChunk(reader: any, length: any): RGBColor;
    ReadPercentageChunk(reader: any, length: any): number;
    ReadObjectChunk(reader: any, length: any): void;
    ReadMeshChunk(reader: any, length: any, objectName: any): void;
    ReadVerticesChunk(mesh: any, reader: any): void;
    ReadTextureVerticesChunk(mesh: any, reader: any): void;
    ReadFacesChunk(mesh: any, reader: any, length: any): void;
    ReadFaceMaterialsChunk(mesh: any, reader: any): void;
    ReadFaceSmoothingGroupsChunk(mesh: any, faceCount: any, reader: any): void;
    ReadTransformationChunk(reader: any): any[];
    ReadKeyFrameChunk(reader: any, length: any): void;
    BuildNodeHierarchy(): void;
    ReadObjectNodeChunk(reader: any, length: any): void;
    ReadName(reader: any): string;
    ReadVector(reader: any): any[];
    ReadChunks(reader: any, endByte: any, onChunk: any): void;
    GetChunkEnd(reader: any, length: any): number;
    SkipChunk(reader: any, length: any): void;
}
export class ImporterBase {
    name: any;
    extension: any;
    callbacks: any;
    model: Model;
    error: boolean;
    message: any;
    Import(name: any, extension: any, content: any, callbacks: any): void;
    Clear(): void;
    CreateResult(callbacks: any): void;
    CanImportExtension(extension: any): boolean;
    GetUpDirection(): number;
    ClearContent(): void;
    ResetContent(): void;
    ImportContent(fileContent: any, onFinish: any): void;
    GetModel(): Model;
    SetError(message: any): void;
    WasError(): boolean;
    GetErrorMessage(): any;
}
export class ImporterBim extends ImporterBase {
    meshIdToMesh: Map<any, any>;
    colorToMaterial: ColorToMaterialConverter;
    ImportElement(bimElement: any): Mesh;
    ImportMesh(bimMesh: any, getMaterialIndex: any): Mesh;
    ImportProperties(source: any, target: any): void;
}
export class ImporterFcstd extends ImporterBase {
    worker: Worker;
    document: FreeCadDocument;
    ConvertObjects(objects: any, onFinish: any): void;
    OnFileConverted(object: any, resultContent: any, colorToMaterial: any): void;
}
export class ImporterFile {
    constructor(name: any, source: any, data: any);
    name: string;
    extension: string;
    source: any;
    data: any;
    content: any;
    SetContent(content: any): void;
}
export class ImporterFileAccessor {
    constructor(getBufferCallback: any);
    getBufferCallback: any;
    fileBuffers: Map<any, any>;
    GetFileBuffer(filePath: any): any;
}
export class ImporterFileList {
    files: any[];
    FillFromInputFiles(inputFiles: any): void;
    ExtendFromFileList(fileList: any): void;
    GetFiles(): any[];
    GetContent(callbacks: any): void;
    ContainsFileByPath(filePath: any): boolean;
    FindFileByPath(filePath: any): any;
    IsOnlyUrlSource(): boolean;
    AddFile(file: any): void;
    GetFileContent(file: any, callbacks: any): void;
}
export class ImporterGltf extends ImporterBase {
    gltfExtensions: GltfExtensions;
    bufferContents: any[];
    imageIndexToTextureParams: Map<any, any>;
    ProcessGltf(fileContent: any, onFinish: any): void;
    ProcessBinaryGltf(fileContent: any, onFinish: any): void;
    ProcessMainFile(gltf: any, onFinish: any): void;
    ImportModel(gltf: any): void;
    ImportProperties(modelObject: any, gltfObject: any, propertyGroupName: any): void;
    GetDefaultScene(gltf: any): any;
    ImportMaterial(gltf: any, gltfMaterial: any): void;
    ImportTexture(gltf: any, gltfTextureRef: any): TextureMap;
    ImportMesh(gltf: any, gltfMesh: any): void;
    ImportPrimitive(gltf: any, primitive: any, mesh: any): void;
    AddTriangle(primitive: any, mesh: any, v0: any, v1: any, v2: any, hasVertexColors: any, hasNormals: any, hasUVs: any, vertexOffset: any, vertexColorOffset: any, normalOffset: any, uvOffset: any): void;
    ImportScene(gltf: any): void;
    ImportNode(gltf: any, gltfNode: any, parentNode: any): void;
    GetReaderFromBufferView(bufferView: any): GltfBufferReader;
    GetReaderFromAccessor(gltf: any, accessor: any): GltfBufferReader;
    GetReaderFromSparseAccessor(gltf: any, sparseAccessor: any, componentType: any, type: any, count: any): GltfBufferReader;
}
export class ImporterIfc extends ImporterBase {
    ifc: any;
    expressIDToMesh: Map<any, any>;
    colorToMaterial: ColorToMaterialConverter;
    ImportIfcContent(fileContent: any): void;
    ImportIfcMesh(modelID: any, ifcMesh: any): void;
    ImportProperties(modelID: any): void;
    GetMaterialIndexByColor(ifcColor: any): any;
    GetIFCString(ifcString: any): any;
    DecodeIFCString(ifcString: any): any;
}
export class ImporterObj extends ImporterBase {
    globalVertices: any[];
    globalVertexColors: any[];
    globalNormals: any[];
    globalUvs: any[];
    currentMeshConverter: any;
    currentMaterial: PhongMaterial;
    currentMaterialIndex: any;
    meshNameToConverter: Map<any, any>;
    materialNameToIndex: Map<any, any>;
    ProcessLine(line: any): void;
    AddNewMesh(name: any): void;
    ProcessMeshParameter(keyword: any, parameters: any, line: any): boolean;
    ProcessMaterialParameter(keyword: any, parameters: any, line: any): boolean;
    ProcessFace(parameters: any): void;
}
export class ImporterOcct extends ImporterBase {
    worker: Worker;
    ImportResultJson(resultContent: any, onFinish: any): void;
    ImportNode(resultContent: any, occtNode: any, parentNode: any, colorToMaterial: any): void;
    ImportMesh(occtMesh: any, colorToMaterial: any): Mesh;
}
export class ImporterOff extends ImporterBase {
    mesh: Mesh;
    status: {
        vertexCount: number;
        faceCount: number;
        foundVertex: number;
        foundFace: number;
    };
    colorToMaterial: ColorToMaterialConverter;
    ProcessLine(line: any): void;
}
export class ImporterPly extends ImporterBase {
    mesh: Mesh;
    GetHeaderContent(fileContent: any): string;
    ReadHeader(headerContent: any): PlyHeader;
    ReadAsciiContent(header: any, fileContent: any): void;
    ReadBinaryContent(header: any, fileContent: any, headerLength: any): void;
}
export class ImporterStl extends ImporterBase {
    mesh: Mesh;
    triangle: Triangle;
    IsBinaryStlFile(fileContent: any): boolean;
    ProcessLine(line: any): void;
    ProcessBinary(fileContent: any): void;
}
export class ImporterThree3mf extends ImporterThreeBase {
    colorConverter: ThreeSRGBToLinearColorConverter;
}
export class ImporterThreeAmf extends ImporterThreeBase {
}
export class ImporterThreeBase extends ImporterBase {
    colorConverter: any;
    CreateLoader(manager: any): any;
    GetMainObject(loadedObject: any): any;
    IsMeshVisible(mesh: any): boolean;
    loader: any;
    materialIdToIndex: Map<any, any>;
    objectUrlToFileName: Map<any, any>;
    LoadModel(fileContent: any, onFinish: any): void;
    OnThreeObjectsLoaded(loadedObject: any, onFinish: any): void;
    ConvertThreeMesh(threeMesh: any): Mesh;
    FindOrCreateMaterial(threeMaterial: any): any;
    ConvertThreeMaterial(threeMaterial: any): PhongMaterial;
    ConvertThreeColor(threeColor: any): RGBColor;
}
export class ImporterThreeDae extends ImporterThreeBase {
}
export class ImporterThreeFbx extends ImporterThreeBase {
    colorConverter: ThreeLinearToSRGBColorConverter;
}
export class ImporterThreeSvg extends ImporterThreeBase {
}
export class ImporterThreeWrl extends ImporterThreeBase {
    colorConverter: ThreeLinearToSRGBColorConverter;
}
/**
 * Loads all the models on the page. This function looks for all the elements with online_3d_viewer
 * class name, and loads the model according to the tag's parameters. It must be called after the
 * document is loaded.
 * @returns {EmbeddedViewer[]} Array of the created {@link EmbeddedViewer} objects.
 */
export function Init3DViewerElements(onReady: any): EmbeddedViewer[];
/**
 * Loads the model specified by File objects.
 * @param {HTMLElement} parentElement The parent element for the viewer canvas.
 * @param {File[]} models File object list of model files.
 * @param {object} parameters See {@link EmbeddedViewer} constructor for details.
 * @returns {EmbeddedViewer}
 */
export function Init3DViewerFromFileList(parentElement: HTMLElement, models: File[], parameters: object): EmbeddedViewer;
/**
 * Loads the model specified by urls.
 * @param {HTMLElement} parentElement The parent element for the viewer canvas.
 * @param {string[]} modelUrls Url list of model files.
 * @param {object} parameters See {@link EmbeddedViewer} constructor for details.
 * @returns {EmbeddedViewer}
 */
export function Init3DViewerFromUrlList(parentElement: HTMLElement, modelUrls: string[], parameters: object): EmbeddedViewer;
/**
 * File representation class for importers.
 */
export class InputFile {
    /**
     * @param {string} name Name of the file.
     * @param {FileSource} source Source of the file.
     * @param {string|File} data If the file source is url, this must be the url string. If the file source
     * is file, this must be a {@link File} object.
     */
    constructor(name: string, source: any, data: string | File);
    name: string;
    source: any;
    data: string | File;
}
export function InputFilesFromFileObjects(fileObjects: any): InputFile[];
export function InputFilesFromUrls(urls: any): InputFile[];
export function InsertDomElementAfter(newElement: any, existingElement: any): void;
export function InsertDomElementBefore(newElement: any, existingElement: any): void;
export function IntegerToHexString(intVal: any): string;
export function IsDefined(val: any): boolean;
export function IsDomElementVisible(element: any): boolean;
export function IsEqual(a: any, b: any): boolean;
export function IsEqualEps(a: any, b: any, eps: any): boolean;
export function IsGreater(a: any, b: any): boolean;
export function IsGreaterOrEqual(a: any, b: any): boolean;
export function IsLower(a: any, b: any): boolean;
export function IsLowerOrEqual(a: any, b: any): boolean;
export function IsModelEmpty(model: any): boolean;
export function IsNegative(a: any): boolean;
export function IsObjectEmpty(obj: any): boolean;
export function IsPositive(a: any): boolean;
export function IsPowerOfTwo(x: any): boolean;
export function IsTwoManifold(object3D: any): boolean;
export function IsUrl(str: any): boolean;
export function IsZero(a: any): boolean;
export function LinearToSRGB(component: any): number;
export function LinearTweenFunction(distance: any, index: any, count: any): number;
export function LoadExternalLibrary(libName: any): Promise<any>;
export class MaterialBase {
    constructor(type: any);
    type: any;
    isDefault: boolean;
    name: string;
    color: RGBColor;
    vertexColors: boolean;
    IsEqual(rhs: any): boolean;
}
export namespace MaterialType {
    let Phong: number;
    let Physical: number;
}
export class Matrix {
    constructor(matrix: any);
    matrix: any;
    IsValid(): boolean;
    Set(matrix: any): this;
    Get(): any;
    Clone(): Matrix;
    CreateIdentity(): this;
    IsIdentity(): boolean;
    CreateTranslation(x: any, y: any, z: any): this;
    CreateRotation(x: any, y: any, z: any, w: any): this;
    CreateRotationAxisAngle(axis: any, angle: any): this;
    CreateScale(x: any, y: any, z: any): this;
    ComposeTRS(translation: any, rotation: any, scale: any): this;
    DecomposeTRS(): {
        translation: Coord3D;
        rotation: Quaternion;
        scale: Coord3D;
    };
    Determinant(): number;
    Invert(): Matrix;
    Transpose(): Matrix;
    InvertTranspose(): Matrix;
    MultiplyVector(vector: any): Coord4D;
    MultiplyMatrix(matrix: any): Matrix;
}
export function MatrixIsEqual(a: any, b: any): boolean;
export class Mesh extends ModelObject3D {
    vertices: any[];
    vertexColors: any[];
    normals: any[];
    uvs: any[];
    triangles: any[];
    AddVertex(vertex: any): number;
    SetVertex(index: any, vertex: any): void;
    GetVertex(index: any): any;
    AddVertexColor(color: any): number;
    SetVertexColor(index: any, color: any): void;
    GetVertexColor(index: any): any;
    AddNormal(normal: any): number;
    SetNormal(index: any, normal: any): void;
    GetNormal(index: any): any;
    AddTextureUV(uv: any): number;
    SetTextureUV(index: any, uv: any): void;
    GetTextureUV(index: any): any;
    AddTriangle(triangle: any): number;
    GetTriangle(index: any): any;
    Clone(): Mesh;
}
export class MeshBuffer {
    primitives: any[];
    PrimitiveCount(): number;
    GetPrimitive(index: any): any;
    GetByteLength(indexTypeSize: any, numberTypeSize: any): number;
}
export class MeshInstance extends ModelObject3D {
    constructor(id: any, node: any, mesh: any);
    id: any;
    node: any;
    mesh: any;
    GetId(): any;
    GetTransformation(): any;
    GetMesh(): any;
    VertexCount(): any;
    VertexColorCount(): any;
    NormalCount(): any;
    TextureUVCount(): any;
    TriangleCount(): any;
    PropertyGroupCount(): any;
    AddPropertyGroup(propertyGroup: any): any;
    GetTransformedMesh(): any;
}
export class MeshInstanceId {
    constructor(nodeId: any, meshIndex: any);
    nodeId: any;
    meshIndex: any;
    IsEqual(rhs: any): boolean;
    GetKey(): string;
}
export class MeshPrimitiveBuffer {
    indices: any[];
    vertices: any[];
    colors: any[];
    normals: any[];
    uvs: any[];
    material: any;
    GetBounds(): {
        min: number[];
        max: number[];
    };
    GetByteLength(indexTypeSize: any, numberTypeSize: any): number;
}
export namespace MeshType {
    let Empty: number;
    let TriangleMesh: number;
}
export class Model extends ModelObject3D {
    unit: number;
    root: Node;
    materials: any[];
    meshes: any[];
    GetUnit(): number;
    SetUnit(unit: any): void;
    GetRootNode(): Node;
    NodeCount(): number;
    MaterialCount(): number;
    MeshCount(): number;
    MeshInstanceCount(): number;
    AddMaterial(material: any): number;
    GetMaterial(index: any): any;
    AddMesh(mesh: any): number;
    AddMeshToRootNode(mesh: any): number;
    RemoveMesh(index: any): void;
    GetMesh(index: any): any;
    GetMeshInstance(instanceId: any): MeshInstance;
    EnumerateMeshes(onMesh: any): void;
    EnumerateMeshInstances(onMeshInstance: any): void;
    EnumerateTransformedMeshInstances(onMesh: any): void;
}
export class ModelObject3D extends Object3D {
    name: string;
    propertyGroups: any[];
    GetName(): string;
    SetName(name: any): void;
    PropertyGroupCount(): number;
    AddPropertyGroup(propertyGroup: any): number;
    GetPropertyGroup(index: any): any;
    CloneProperties(target: any): void;
}
export class ModelToThreeConversionOutput {
    defaultMaterial: any;
    objectUrls: any[];
}
export class ModelToThreeConversionParams {
    forceMediumpForMaterials: boolean;
}
export class MouseInteraction {
    prev: Coord2D;
    curr: Coord2D;
    diff: Coord2D;
    buttons: any[];
    Down(canvas: any, ev: any): void;
    Move(canvas: any, ev: any): void;
    Up(canvas: any, ev: any): void;
    Leave(canvas: any, ev: any): void;
    IsButtonDown(): boolean;
    GetButton(): any;
    GetPosition(): Coord2D;
    GetMoveDiff(): Coord2D;
    GetPositionFromEvent(canvas: any, ev: any): Coord2D;
}
export function NameFromLine(line: any, startIndex: any, commentChar: any): any;
export class Navigation {
    constructor(canvas: any, camera: any, callbacks: any);
    canvas: any;
    camera: any;
    callbacks: any;
    navigationMode: number;
    mouse: MouseInteraction;
    touch: TouchInteraction;
    clickDetector: ClickDetector;
    onMouseClick: any;
    onMouseMove: any;
    onContext: any;
    SetMouseClickHandler(onMouseClick: any): void;
    SetMouseMoveHandler(onMouseMove: any): void;
    SetContextMenuHandler(onContext: any): void;
    GetNavigationMode(): number;
    SetNavigationMode(navigationMode: any): void;
    GetCamera(): any;
    SetCamera(camera: any): void;
    MoveCamera(newCamera: any, stepCount: any): void;
    GetFitToSphereCamera(center: any, radius: any): any;
    OnMouseDown(ev: any): void;
    OnMouseMove(ev: any): void;
    OnMouseUp(ev: any): void;
    OnMouseLeave(ev: any): void;
    OnTouchStart(ev: any): void;
    OnTouchMove(ev: any): void;
    OnTouchEnd(ev: any): void;
    OnMouseWheel(ev: any): void;
    OnContextMenu(ev: any): void;
    Orbit(angleX: any, angleY: any): void;
    Pan(moveX: any, moveY: any): void;
    Zoom(ratio: any): void;
    Update(): void;
    Click(button: any, mouseCoords: any): void;
    Context(clientX: any, clientY: any): void;
}
/**
 * Camera navigation mode.
 */
export type NavigationMode = any;
export namespace NavigationMode {
    let FixedUpVector: number;
    let FreeOrbit: number;
}
export namespace NavigationType {
    let None: number;
    let Orbit: number;
    let Pan: number;
    let Zoom: number;
}
export function NextPowerOfTwo(x: any): any;
export class Node {
    name: string;
    parent: any;
    transformation: Transformation;
    childNodes: any[];
    meshIndices: any[];
    idGenerator: NodeIdGenerator;
    id: number;
    IsEmpty(): boolean;
    IsMeshNode(): boolean;
    GetId(): number;
    GetName(): string;
    SetName(name: any): void;
    HasParent(): boolean;
    GetParent(): any;
    GetTransformation(): Transformation;
    GetWorldTransformation(): Transformation;
    SetTransformation(transformation: any): void;
    AddChildNode(node: any): number;
    RemoveChildNode(node: any): void;
    GetChildNodes(): any[];
    ChildNodeCount(): number;
    GetChildNode(index: any): any;
    AddMeshIndex(index: any): number;
    MeshIndexCount(): number;
    GetMeshIndex(index: any): any;
    GetMeshIndices(): any[];
    Enumerate(processor: any): void;
    EnumerateChildren(processor: any): void;
    EnumerateMeshIndices(processor: any): void;
}
export class Object3D {
    VertexCount(): number;
    VertexColorCount(): number;
    NormalCount(): number;
    TextureUVCount(): number;
    TriangleCount(): number;
    EnumerateVertices(onVertex: any): void;
    EnumerateTriangleVertexIndices(onTriangleVertexIndices: any): void;
    EnumerateTriangleVertices(onTriangleVertices: any): void;
}
export class Octree {
    constructor(boundingBox: any, options: any);
    options: {
        maxPointsPerNode: number;
        maxTreeDepth: number;
    };
    rootNode: OctreeNode;
    AddPoint(point: any, data: any): any;
    FindPoint(point: any): any;
}
export class OctreeNode {
    constructor(boundingBox: any, level: any);
    boundingBox: any;
    level: any;
    pointItems: any[];
    childNodes: any[];
    AddPoint(point: any, data: any, options: any): any;
    FindPoint(point: any): any;
    AddPointDirectly(point: any, data: any): void;
    FindPointDirectly(point: any): any;
    FindNodeForPoint(point: any): any;
    CreateChildNodes(): void;
    IsPointInBounds(point: any): boolean;
}
export function ParabolicTweenFunction(distance: any, index: any, count: any): number;
export namespace ParameterConverter {
    function IntegerToString(integer: any): any;
    function StringToInteger(str: any): number;
    function NumberToString(number: any): any;
    function StringToNumber(str: any): number;
    function ModelUrlsToString(urls: any): any;
    function StringToModelUrls(str: any): any;
    function CameraToString(camera: any): string;
    function ProjectionModeToString(projectionMode: any): "perspective" | "orthographic";
    function StringToCamera(str: any): Camera;
    function StringToProjectionMode(str: any): number;
    function RGBColorToString(color: any): string;
    function RGBAColorToString(color: any): string;
    function StringToRGBColor(str: any): RGBColor;
    function StringToRGBAColor(str: any): RGBAColor;
    function EnvironmentSettingsToString(environmentSettings: any): string;
    function StringToEnvironmentSettings(str: any): {
        environmentMapName: any;
        backgroundIsEnvMap: boolean;
    };
    function EdgeSettingsToString(edgeSettings: any): string;
    function StringToEdgeSettings(str: any): EdgeSettings;
}
export class ParameterListBuilder {
    constructor(separator: any);
    separator: any;
    paramList: string;
    AddModelUrls(urls: any): this;
    AddCamera(camera: any): this;
    AddProjectionMode(projectionMode: any): this;
    AddEnvironmentSettings(envSettings: any): this;
    AddBackgroundColor(background: any): this;
    AddDefaultColor(color: any): this;
    AddEdgeSettings(edgeSettings: any): this;
    AddUrlPart(keyword: any, urlPart: any): void;
    GetParameterList(): string;
}
export class ParameterListParser {
    constructor(paramList: any, separator: any);
    separator: any;
    paramList: any;
    GetModelUrls(): any;
    GetCamera(): Camera;
    GetProjectionMode(): number;
    GetEnvironmentSettings(): {
        environmentMapName: any;
        backgroundIsEnvMap: boolean;
    };
    GetBackgroundColor(): RGBAColor;
    GetDefaultColor(): RGBColor;
    GetEdgeSettings(): EdgeSettings;
    GetKeywordParams(keyword: any): any;
}
export function ParametersFromLine(line: any, commentChar: any): any;
export class PhongMaterial extends FaceMaterial {
    constructor();
    ambient: RGBColor;
    specular: RGBColor;
    shininess: number;
    specularMap: any;
}
export class PhysicalMaterial extends FaceMaterial {
    constructor();
    metalness: number;
    roughness: number;
    metalnessMap: any;
}
/**
 * Camera projection mode.
 */
export type ProjectionMode = any;
export namespace ProjectionMode {
    let Perspective: number;
    let Orthographic: number;
}
export class Property {
    constructor(type: any, name: any, value: any);
    type: any;
    name: any;
    value: any;
    Clone(): Property;
}
export class PropertyGroup {
    constructor(name: any);
    name: any;
    properties: any[];
    PropertyCount(): number;
    AddProperty(property: any): void;
    GetProperty(index: any): any;
    Clone(): PropertyGroup;
}
export function PropertyToString(property: any): any;
export namespace PropertyType {
    let Text_1: number;
    export { Text_1 as Text };
    export let Integer: number;
    export let Number: number;
    export let Boolean: number;
    export let Percent: number;
    export let Color: number;
}
export class Quaternion {
    constructor(x: any, y: any, z: any, w: any);
    x: any;
    y: any;
    z: any;
    w: any;
}
export function QuaternionFromAxisAngle(axis: any, angle: any): Quaternion;
export function QuaternionFromXYZ(x: any, y: any, z: any, mode: any): Quaternion;
export function QuaternionIsEqual(a: any, b: any): boolean;
/**
 * RGBA color object. Components are integers in the range of 0..255.
 */
export class RGBAColor {
    /**
     * @param {integer} r Red component.
     * @param {integer} g Green component.
     * @param {integer} b Blue component.
     * @param {integer} a Alpha component.
     */
    constructor(r: integer, g: integer, b: integer, a: integer);
    r: integer;
    g: integer;
    b: integer;
    a: integer;
    /**
     * Sets the value of all components.
     * @param {integer} r Red component.
     * @param {integer} g Green component.
     * @param {integer} b Blue component.
     * @param {integer} a Alpha component.
     */
    Set(r: integer, g: integer, b: integer, a: integer): void;
    /**
     * Creates a clone of the object.
     * @returns {RGBAColor}
     */
    Clone(): RGBAColor;
}
export function RGBAColorToHexString(color: any): string;
/**
 * RGB color object. Components are integers in the range of 0..255.
 */
export class RGBColor {
    /**
     * @param {integer} r Red component.
     * @param {integer} g Green component.
     * @param {integer} b Blue component.
     */
    constructor(r: integer, g: integer, b: integer);
    r: integer;
    g: integer;
    b: integer;
    /**
     * Sets the value of all components.
     * @param {integer} r Red component.
     * @param {integer} g Green component.
     * @param {integer} b Blue component.
     */
    Set(r: integer, g: integer, b: integer): void;
    /**
     * Creates a clone of the object.
     * @returns {RGBColor}
     */
    Clone(): RGBColor;
}
export function RGBColorFromFloatComponents(r: any, g: any, b: any): RGBColor;
export function RGBColorIsEqual(a: any, b: any): boolean;
export function RGBColorToHexString(color: any): string;
export const RadDeg: 57.29577951308232;
export function ReadFile(file: any, onProgress: any): Promise<any>;
export function ReadLines(str: any, onLine: any): void;
export function ReplaceDefaultMaterialColor(model: any, color: any): void;
export function RequestUrl(url: any, onProgress: any): Promise<any>;
export function RevokeObjectUrl(url: any): void;
export function RunTaskAsync(task: any): void;
export function RunTasks(count: any, callbacks: any): void;
export function RunTasksBatch(count: any, batchCount: any, callbacks: any): void;
export function SRGBToLinear(component: any): number;
export function SetDomElementHeight(element: any, height: any): void;
export function SetDomElementOuterHeight(element: any, height: any): void;
export function SetDomElementOuterWidth(element: any, width: any): void;
export function SetDomElementWidth(element: any, width: any): void;
/**
 * Sets the location of the external libraries used by the engine. This is the content of the libs
 * folder in the package. The location must be relative to the main file.
 * @param {string} newExternalLibLocation Relative path to the libs folder.
 */
export function SetExternalLibLocation(newExternalLibLocation: string): void;
export function SetThreeMeshPolygonOffset(mesh: any, offset: any): void;
export class ShadingModel {
    constructor(scene: any);
    scene: any;
    type: number;
    projectionMode: number;
    ambientLight: any;
    directionalLight: any;
    environmentSettings: EnvironmentSettings;
    environment: any;
    SetShadingType(type: any): void;
    SetProjectionMode(projectionMode: any): void;
    UpdateShading(): void;
    SetEnvironmentMapSettings(environmentSettings: any, onLoaded: any): void;
    UpdateByCamera(camera: any): void;
    CreateHighlightMaterial(highlightColor: any, withOffset: any): any;
}
export namespace ShadingType {
    let Phong_1: number;
    export { Phong_1 as Phong };
    let Physical_1: number;
    export { Physical_1 as Physical };
}
export function ShowDomElement(element: any, show: any): void;
export function SubCoord2D(a: any, b: any): Coord2D;
export function SubCoord3D(a: any, b: any): Coord3D;
export class TaskRunner {
    count: any;
    current: number;
    callbacks: any;
    Run(count: any, callbacks: any): void;
    RunBatch(count: any, batchCount: any, callbacks: any): void;
    RunOnce(): void;
    TaskReady(): void;
}
export class TextWriter {
    text: string;
    indentation: number;
    GetText(): string;
    Indent(diff: any): void;
    WriteArrayLine(arr: any): void;
    WriteLine(str: any): void;
    WriteIndentation(): void;
    Write(str: any): void;
}
export function TextureIsEqual(a: any, b: any): boolean;
export class TextureMap {
    name: any;
    mimeType: any;
    buffer: any;
    offset: Coord2D;
    scale: Coord2D;
    rotation: number;
    IsValid(): boolean;
    HasTransformation(): boolean;
    IsEqual(rhs: any): boolean;
}
export function TextureMapIsEqual(aTex: any, bTex: any): any;
export class ThreeColorConverter {
    Convert(color: any): any;
}
export class ThreeConversionStateHandler {
    constructor(callbacks: any);
    callbacks: any;
    texturesNeeded: number;
    texturesLoaded: number;
    threeObject: any;
    OnTextureNeeded(): void;
    OnTextureLoaded(): void;
    OnModelLoaded(threeObject: any): void;
    Finish(): void;
}
export class ThreeLinearToSRGBColorConverter extends ThreeColorConverter {
}
export class ThreeModelLoader {
    importer: Importer;
    inProgress: boolean;
    defaultMaterial: any;
    objectUrls: any[];
    hasHighpDriverIssue: boolean;
    InProgress(): boolean;
    LoadModel(inputFiles: any, settings: any, callbacks: any): void;
    GetImporter(): Importer;
    GetDefaultMaterial(): any;
    ReplaceDefaultMaterialColor(defaultColor: any): void;
    RevokeObjectUrls(): void;
    Destroy(): void;
}
export class ThreeNodeTree {
    constructor(model: any, threeRootNode: any);
    model: any;
    threeNodeItems: any[];
    AddNode(node: any, threeNode: any): void;
    GetNodeItems(): any[];
}
export class ThreeSRGBToLinearColorConverter extends ThreeColorConverter {
}
export class Topology {
    vertices: any[];
    edges: any[];
    triangleEdges: any[];
    triangles: any[];
    edgeStartToEndVertexMap: Map<any, any>;
    AddVertex(): number;
    AddTriangle(vertex1: any, vertex2: any, vertex3: any): void;
    AddTriangleEdge(vertex1: any, vertex2: any): number;
    AddEdge(startVertex: any, endVertex: any): any;
}
export class TopologyEdge {
    constructor(vertex1: any, vertex2: any);
    vertex1: any;
    vertex2: any;
    triangles: any[];
}
export class TopologyTriangle {
    triEdge1: any;
    triEdge2: any;
    triEdge3: any;
}
export class TopologyTriangleEdge {
    constructor(edge: any, reversed: any);
    edge: any;
    reversed: any;
}
export class TopologyVertex {
    edges: any[];
    triangles: any[];
}
export class TouchInteraction {
    prevPos: Coord2D;
    currPos: Coord2D;
    diffPos: Coord2D;
    prevDist: number;
    currDist: number;
    diffDist: number;
    fingers: number;
    Start(canvas: any, ev: any): void;
    Move(canvas: any, ev: any): void;
    End(canvas: any, ev: any): void;
    IsFingerDown(): boolean;
    GetFingerCount(): number;
    GetPosition(): Coord2D;
    GetMoveDiff(): Coord2D;
    GetDistanceDiff(): number;
    GetPositionFromEvent(canvas: any, ev: any): Coord2D;
    GetTouchDistanceFromEvent(canvas: any, ev: any): number;
}
export function TransformFileHostUrls(urls: any): void;
export function TransformMesh(mesh: any, transformation: any): void;
export class Transformation {
    constructor(matrix: any);
    matrix: any;
    SetMatrix(matrix: any): this;
    GetMatrix(): any;
    IsIdentity(): any;
    AppendMatrix(matrix: any): this;
    Append(transformation: any): this;
    TransformCoord3D(coord: any): Coord3D;
    Clone(): Transformation;
}
export function TransformationIsEqual(a: any, b: any): boolean;
export function TraverseThreeObject(object: any, processor: any): boolean;
export class Triangle {
    constructor(v0: any, v1: any, v2: any);
    v0: any;
    v1: any;
    v2: any;
    c0: any;
    c1: any;
    c2: any;
    n0: any;
    n1: any;
    n2: any;
    u0: any;
    u1: any;
    u2: any;
    mat: any;
    curve: any;
    HasVertices(): boolean;
    HasVertexColors(): boolean;
    HasNormals(): boolean;
    HasTextureUVs(): boolean;
    SetVertices(v0: any, v1: any, v2: any): this;
    SetVertexColors(c0: any, c1: any, c2: any): this;
    SetNormals(n0: any, n1: any, n2: any): this;
    SetTextureUVs(u0: any, u1: any, u2: any): this;
    SetMaterial(mat: any): this;
    SetCurve(curve: any): this;
    Clone(): Triangle;
}
export function TweenCoord3D(a: any, b: any, count: any, tweenFunc: any): any[];
export namespace Unit {
    let Unknown: number;
    let Millimeter: number;
    let Centimeter: number;
    let Meter: number;
    let Inch: number;
    let Foot: number;
}
export class UpVector {
    direction: number;
    isFixed: boolean;
    isFlipped: boolean;
    SetDirection(newDirection: any, oldCamera: any): any;
    SetFixed(isFixed: any, oldCamera: any): any;
    Flip(oldCamera: any): any;
}
export function UpdateMaterialTransparency(material: any): void;
export function Utf8StringToArrayBuffer(str: any): ArrayBufferLike;
export function ValueOrDefault(val: any, def: any): any;
export function VectorAngle3D(a: any, b: any): number;
export function VectorLength3D(x: any, y: any, z: any): number;
export class Viewer {
    canvas: any;
    renderer: any;
    scene: any;
    mainModel: ViewerMainModel;
    extraModel: ViewerModel;
    camera: any;
    projectionMode: any;
    cameraValidator: CameraValidator;
    shadingModel: ShadingModel;
    navigation: Navigation;
    upVector: UpVector;
    settings: {
        animationSteps: number;
    };
    Init(canvas: any): void;
    SetMouseClickHandler(onMouseClick: any): void;
    SetMouseMoveHandler(onMouseMove: any): void;
    SetContextMenuHandler(onContext: any): void;
    SetEdgeSettings(edgeSettings: any): void;
    SetEnvironmentMapSettings(environmentSettings: any): void;
    SetBackgroundColor(color: any): void;
    GetCanvas(): any;
    GetCamera(): any;
    GetProjectionMode(): any;
    SetCamera(camera: any): void;
    SetProjectionMode(projectionMode: any): void;
    Resize(width: any, height: any): void;
    ResizeRenderer(width: any, height: any): void;
    FitSphereToWindow(boundingSphere: any, animation: any): void;
    AdjustClippingPlanes(): void;
    AdjustClippingPlanesToSphere(boundingSphere: any): void;
    GetNavigationMode(): number;
    SetNavigationMode(navigationMode: any): void;
    SetUpVector(upDirection: any, animate: any): void;
    FlipUpVector(): void;
    Render(): void;
    SetMainObject(object: any): void;
    AddExtraObject(object: any): void;
    Clear(): void;
    ClearExtra(): void;
    SetMeshesVisibility(isVisible: any): void;
    SetMeshesHighlight(highlightColor: any, isHighlighted: any): void;
    CreateHighlightMaterial(highlightColor: any): any;
    GetMeshUserDataUnderMouse(mouseCoords: any): any;
    GetMeshIntersectionUnderMouse(mouseCoords: any): any;
    GetBoundingBox(needToProcess: any): any;
    GetBoundingSphere(needToProcess: any): any;
    EnumerateMeshesUserData(enumerator: any): void;
    InitNavigation(): void;
    InitShading(): void;
    GetShadingType(): number;
    GetImageSize(): {
        width: number;
        height: number;
    };
    GetCanvasSize(): {
        width: any;
        height: any;
    };
    GetImageAsDataUrl(width: any, height: any, isTransparent: any): any;
    Destroy(): void;
}
export class ViewerMainModel {
    constructor(scene: any);
    scene: any;
    mainModel: ViewerModel;
    edgeModel: ViewerModel;
    edgeSettings: EdgeSettings;
    SetMainObject(mainObject: any): void;
    UpdateWorldMatrix(): void;
    SetEdgeSettings(edgeSettings: any): void;
    GenerateEdgeModel(): void;
    GetBoundingBox(needToProcess: any): any;
    GetBoundingSphere(needToProcess: any): any;
    Clear(): void;
    ClearEdgeModel(): void;
    EnumerateMeshes(enumerator: any): void;
    EnumerateEdges(enumerator: any): void;
    GetMeshIntersectionUnderMouse(mouseCoords: any, camera: any, width: any, height: any): any;
}
export class ViewerModel {
    constructor(scene: any);
    scene: any;
    rootObject: any;
    IsEmpty(): boolean;
    SetRootObject(rootObject: any): void;
    GetRootObject(): any;
    AddObject(object: any): void;
    Traverse(enumerator: any): void;
    UpdateWorldMatrix(): void;
    Clear(): void;
}
export function WaitWhile(expression: any): void;
declare class Importer3dsNodeList {
    nodes: any[];
    nodeIdToNode: Map<any, any>;
    IsEmpty(): boolean;
    AddNode(node: any): void;
    GetNodes(): any[];
}
declare class FreeCadDocument {
    files: fflate.Unzipped;
    properties: PropertyGroup;
    objectNames: any[];
    objectData: Map<any, any>;
    Init(fileContent: any): number;
    GetObjectListToConvert(): any[];
    IsSupportedType(type: any): boolean;
    HasFile(fileName: any): boolean;
    LoadDocumentXml(): boolean;
    LoadGuiDocumentXml(): boolean;
    GetPropertiesFromElement(propertiesElement: any, propertyGroup: any): void;
    GetXMLContent(xmlFileName: any): Document;
    GetFirstChildValue(element: any, childTagName: any, childAttribute: any): any;
}
declare class GltfExtensions {
    supportedExtensions: string[];
    draco: any;
    LoadLibraries(extensionsRequired: any, callbacks: any): void;
    GetUnsupportedExtensions(extensionsRequired: any): any[];
    ProcessMaterial(gltfMaterial: any, material: any, imporTextureFn: any): PhongMaterial;
    ProcessTexture(gltfTexture: any, texture: any): void;
    ProcessPrimitive(importer: any, gltf: any, primitive: any, mesh: any): boolean;
}
declare class GltfBufferReader {
    constructor(buffer: any);
    reader: BinaryReader;
    componentType: any;
    dataType: number;
    byteStride: any;
    dataCount: any;
    sparseReader: {
        indexReader: any;
        valueReader: any;
    };
    SetComponentType(componentType: any): void;
    SetDataType(dataType: any): void;
    SetByteStride(byteStride: any): void;
    SetDataCount(dataCount: any): void;
    SetSparseReader(indexReader: any, valueReader: any): void;
    ReadArrayBuffer(byteLength: any): ArrayBuffer;
    GetDataCount(): any;
    ReadData(): number | Coord2D | Coord3D | Coord4D;
    EnumerateData(onData: any): void;
    SkipBytes(bytes: any): void;
    ReadComponent(): number;
    SkipBytesByStride(componentCount: any): void;
    GetComponentSize(): 0 | 1 | 2 | 4;
}
declare class PlyHeader {
    format: any;
    elements: any[];
    SetFormat(format: any): void;
    AddElement(name: any, count: any): void;
    GetElements(): any[];
    AddSingleFormat(elemType: any, name: any): void;
    AddListFormat(countType: any, elemType: any, name: any): void;
    GetElement(name: any): any;
    Check(): number;
}
declare class NodeIdGenerator {
    nextId: number;
    GenerateId(): number;
}
import * as fflate from 'fflate';
export {};
