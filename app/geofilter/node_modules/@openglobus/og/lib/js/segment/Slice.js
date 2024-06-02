class Slice {
    constructor(segment) {
        this.segment = segment;
        this.layers = [];
        this.tileOffsetArr = new Float32Array(segment.planet.SLICE_SIZE_4);
        this.layerOpacityArr = new Float32Array(segment.planet.SLICE_SIZE);
    }
    clear() {
        // @ts-ignore
        this.layers = null;
        // @ts-ignore
        this.tileOffsetArr = null;
        // @ts-ignore
        this.layerOpacityArr = null;
    }
    append(layer, material) {
        let n = this.layers.length;
        this.layers.push(layer);
        this.layerOpacityArr[n] = layer.screenOpacity;
        let n4 = n * 4;
        let arr = layer.applyMaterial(material);
        this.tileOffsetArr[n4] = arr[0];
        this.tileOffsetArr[n4 + 1] = arr[1];
        this.tileOffsetArr[n4 + 2] = arr[2];
        this.tileOffsetArr[n4 + 3] = arr[3];
        //arr = this.segment._getLayerExtentOffset(layer);
        //slice.visibleExtentOffsetArr[n4] = arr[0];
        //slice.visibleExtentOffsetArr[n4 + 1] = arr[1];
        //slice.visibleExtentOffsetArr[n4 + 2] = arr[2];
        //slice.visibleExtentOffsetArr[n4 + 3] = arr[3];
    }
}
export { Slice };
