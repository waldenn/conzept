import { Vec2 } from './Vec2';
export declare class Line2 {
    a: number;
    b: number;
    c: number;
    constructor(a?: number, b?: number, c?: number);
    static get(p0: Vec2, p1: Vec2): Line2;
    static getParallel(l: Line2, p: Vec2): Line2;
    static getIntersection(L0: Line2, L1: Line2): Vec2;
    intersects(l: Line2): Vec2;
}
