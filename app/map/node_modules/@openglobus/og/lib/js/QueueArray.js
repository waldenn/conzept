class QueueArray {
    constructor(size = 2048) {
        this._size = size;
        this._array = new Array(this._size);
        this._popIndex = Math.floor(this._size * 0.5);
        this._shiftIndex = this._popIndex;
        this.length = 0;
    }
    reset() {
        this._popIndex = Math.floor(this._size * 0.5);
        this._shiftIndex = this._popIndex;
        this.length = 0;
    }
    clear() {
        this._array.length = 0;
        this._array = new Array(this._size);
        this._popIndex = Math.floor(this._size * 0.5);
        this._shiftIndex = this._popIndex;
        this.length = 0;
    }
    push(data) {
        this.length++;
        this._array[this._popIndex++] = data;
    }
    pop() {
        if (this.length) {
            this.length--;
            let res = this._array[--this._popIndex];
            // @ts-ignore
            this._array[this._popIndex] = null;
            if (!this._array[this._popIndex - 1]) {
                this._popIndex = Math.floor(this._size * 0.5);
                this._shiftIndex = this._popIndex;
            }
            return res;
        }
        return undefined;
    }
    unshift(data) {
        this.length++;
        this._array[--this._shiftIndex] = data;
    }
    shift() {
        if (this.length) {
            this.length--;
            let res = this._array[this._shiftIndex];
            // @ts-ignore
            this._array[this._shiftIndex++] = null;
            if (!this._array[this._shiftIndex]) {
                this._popIndex = Math.floor(this._size * 0.5);
                this._shiftIndex = this._popIndex;
            }
            return res;
        }
        return undefined;
    }
    forEach(callback) {
        for (let i = this._shiftIndex; i < this._popIndex; i++) {
            callback(this._array[i]);
        }
    }
}
export { QueueArray };
