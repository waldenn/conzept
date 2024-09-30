import { EarthQuadTreeStrategy } from "./EarthQuadTreeStrategy";
import { MarsQuadTreeStrategy } from "./MarsQuadTreeStrategy";
import { EPSG4326QuadTreeStrategy } from "./EPSG4326QuadTreeStrategy";
import { QuadTreeStrategy } from "./QuadTreeStrategy";
import { Wgs84QuadTreeStrategy } from "./Wgs84QuadTreeStrategy";
declare const quadTreeStrategyType: {
    epsg4326: typeof EPSG4326QuadTreeStrategy;
    earth: typeof EarthQuadTreeStrategy;
    mars: typeof MarsQuadTreeStrategy;
    wgs84: typeof Wgs84QuadTreeStrategy;
};
export { quadTreeStrategyType, QuadTreeStrategy, Wgs84QuadTreeStrategy, MarsQuadTreeStrategy, EarthQuadTreeStrategy };
