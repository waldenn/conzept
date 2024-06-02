interface IObjGeometryData {
    vertices: number[];
    textures: number[];
    normals: number[];
}
interface IObjGeometry {
    object: string;
    groups: string[];
    material: string;
    data: IObjGeometryData;
}
interface IObjData {
    geometries: IObjGeometry[];
    materialLibs: string[];
}
export declare function objParser(text: string): {
    geometries: IObjGeometry[];
    materialLibs: string[];
};
export declare function transformLeftToRightCoordinateSystem(objData: IObjData): {
    geometries: IObjGeometry[];
    materialLibs: string[];
};
export {};
