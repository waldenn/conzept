import { Extent } from "../Extent";
import { Planet } from "../scene/Planet";
import { Segment } from "../segment/Segment";
import { PlanetCamera } from "../camera/PlanetCamera";
/**
 * Quad tree planet segment node.
 * @constructor
 * @param {Segment} segmentPrototype - Planet segment node constructor.
 * @param {Planet} planet - Planet scene instance.
 * @param {number} partId - NorthEast, SouthWest etc.
 * @param {Node} parent - Parent of this node.
 * @param {number} id - Tree node identifier (id * 4 + 1);
 * @param {number} tileZoom - Deep index of the quad tree.
 * @param {Extent} extent - Planet segment extent.
 */
declare class Node {
    __id: number;
    SegmentPrototype: typeof Segment;
    planet: Planet;
    parentNode: Node | null;
    partId: number;
    nodeId: number;
    state: number | null;
    prevState: number | null;
    appliedTerrainNodeId: number;
    sideSizeLog2: [number, number, number, number];
    ready: boolean;
    neighbors: [Node[], Node[], Node[], Node[]];
    equalizedSideWithNodeId: number[];
    nodes: [Node, Node, Node, Node] | [];
    segment: Segment;
    _cameraInside: boolean;
    inFrustum: number;
    _fadingNodes: Node[];
    constructor(SegmentPrototype: typeof Segment, planet: Planet, partId: number, parent: Node | null, tileZoom: number, extent: Extent);
    createChildrenNodes(): void;
    createBounds(): void;
    getState(): number | null;
    /**
     * Returns the same deep existent neighbour node.
     * @public
     * @param {number} side - Neighbour side index e.g. og.quadTree.N, og.quadTree.W etc.
     * @returns {Node} -
     */
    getEqualNeighbor(side: number): Node | undefined;
    traverseNodes(cam: PlanetCamera, maxZoom?: number | null, terrainReadySegment?: Segment | null, stopLoading?: boolean, zoomPassNode?: Node): void;
    renderTree(cam: PlanetCamera, maxZoom?: number | null, terrainReadySegment?: Segment | null, stopLoading?: boolean, zoomPassNode?: Node): void;
    renderNode(inFrustum: number, onlyTerrain?: boolean, terrainReadySegment?: Segment | null, stopLoading?: boolean): void;
    childrenPrevStateEquals(state: number): boolean;
    isFading(): boolean;
    _collectFadingNodes(): void;
    clearNeighbors(): void;
    _refreshTransitionOpacity(): void;
    /**
     * Picking up current node to render processing.
     * @public
     */
    addToRender(inFrustum: number): void;
    applyNeighbor(node: Node, side: number): void;
    /**
     * Searching current node for its neighbours.
     * @public
     */
    getRenderedNodesNeighbors(nodes: Node[]): void;
    /**
     * Checking if current node has a common side with input node and return side index N, E, S or W. Otherwise returns -1.
     * @param {Node} node - Input node
     * @returns {number} - Node side index
     */
    getCommonSide(node: Node): number;
    whileNormalMapCreating(): void;
    whileTerrainLoading(terrainReadySegment?: Segment | null): void;
    destroy(): void;
    clearTree(): void;
    clearBranches(): void;
    destroyBranches(): void;
    traverseTree(callback: Function): void;
    getOffsetOppositeNeighbourSide(neighbourNode: Node, side: number): number;
}
export { Node };
