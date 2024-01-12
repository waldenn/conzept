import { Billboard, IBillboardParams } from "../entity/Billboard";
import { Entity } from "../entity/Entity";
import { Extent } from "../Extent";
import { Vector, IVectorParams } from "./Vector";
interface IKMLParams extends IVectorParams {
    color?: string;
    billboard?: IBillboardParams;
}
/**
 * Layer to render KMLs files
 * @class
 * @extends {Vector}
 * @param {string} name
 * @param {*} [options]
 */
export declare class KML extends Vector {
    protected _color: string;
    protected _billboard: IBillboardParams;
    constructor(name: string, options?: IKMLParams);
    get instanceName(): string;
    protected _extractCoordonatesFromKml(xmlDoc: XMLDocument): number[][][];
    protected _AGBRtoRGBA(agbr: string): string | undefined;
    /**
     * @protected
     returns array of longitude, latitude, altitude (altitude optional)
     */
    protected _parseKMLcoordinates(coords: Element): number[][];
    protected _kmlPlacemarkToEntity(placemark: Element | undefined | null, extent: Extent): Entity | undefined;
    protected _extractStyle(placemark: Element): any;
    protected _parseKML(xml: XMLDocument, extent: Extent, entities?: Entity[]): Entity[];
    protected _convertKMLintoEntities(xml: XMLDocument): any;
    /**
     * Creates billboards or polylines from array of lonlat.
     * @protected
     * @param {Array} coordonates
     * @param {string} color
     * @returns {any}
     */
    protected _convertCoordonatesIntoEntities(coordinates: number[][][][], color: string, billboard?: IBillboardParams): any;
    /**
     * @protected
     * @returns {Document}
     */
    protected _getXmlContent(file: Blob): Promise<XMLDocument>;
    protected _expandExtents(extent1: Extent | null | undefined, extent2: Extent): Extent;
    /**
     * @public
     * @param {File[]} kmls
     * @param {string} [color]
     * @param {Billboard} [billboard]
     * @returns {Promise<{entities: Entity[], extent: Extent}>}
     */
    addKmlFromFiles(kmls: Blob[], color?: string, billboard?: IBillboardParams): Promise<{
        entities: any;
        extent: any;
    } | null>;
    /**
     * @param {string} color
     * @public
     */
    setColor(color: string): void;
    protected _getKmlFromUrl(url: string): Promise<Document>;
    /**
     * @public
     * @param {string} url - Url of the KML to display. './myFile.kml' or 'http://mySite/myFile.kml' for example.
     * @param {string} [color]
     * @param {Billboard} [billboard]
     * @returns {Promise<{entities: Entity[], extent: Extent}>}
     */
    addKmlFromUrl(url: string, color?: string, billboard?: Billboard | IBillboardParams): Promise<any>;
}
export {};
