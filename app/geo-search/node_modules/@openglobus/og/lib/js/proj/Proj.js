/**
 * Projection units: 'degrees', 'ft', 'm' or 'km'.
 * @enum {string}
 * @api
 */
export const Units = {
    DEGREES: "degrees",
    FEET: "ft",
    METERS: "m",
    KILOMETERS: "km"
};
/**
 * Meters per unit lookup table.
 * @const
 * @type {Record<string, number>}
 */
export const METERS_PER_UNIT = {};
METERS_PER_UNIT[Units.FEET] = 0.3048;
METERS_PER_UNIT[Units.METERS] = 1;
METERS_PER_UNIT[Units.KILOMETERS] = 1000;
let _counter = 0;
class Proj {
    constructor(options) {
        this.id = _counter++;
        this.code = options.code;
        this.units = options.units;
    }
    /**
     * Compare projections.
     * @public
     * @param {Proj} proj - Projection object.
     * @returns {boolean}
     */
    equal(proj) {
        return proj.id === this.id;
    }
}
export { Proj };
