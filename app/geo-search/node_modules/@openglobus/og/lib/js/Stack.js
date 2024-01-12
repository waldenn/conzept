class Node {
    constructor() {
        this.next = null;
        this.prev = null;
        this.data = null;
    }
}
/**
 * @class Stack<T>
 * @param {number} [size=256] - Stack size
 */
class Stack {
    constructor(size = 256) {
        this._current = new Node();
        this._head = this._current;
        for (let i = 0; i < size; i++) {
            let n = new Node();
            n.prev = this._current;
            this._current.next = n;
            this._current = n;
        }
        this._current = this._head;
    }
    current() {
        return this._current;
    }
    push(data) {
        this._current = this._current.next;
        this._current.data = data;
    }
    pop() {
        let res = this._current.data;
        //this._current.data = null;
        this._current = this._current.prev;
        return res;
    }
    popPrev() {
        this._current = this._current.prev;
        return this._current.data;
    }
}
export { Stack };
