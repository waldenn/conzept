class Lock {
    constructor() {
        this._lock = 0;
    }
    lock(key) {
        this._lock |= (1 << key.id);
    }
    free(key) {
        this._lock &= ~(1 << key.id);
    }
    isFree() {
        return this._lock === 0;
    }
    isLocked() {
        return this._lock !== 0;
    }
}
class Key {
    constructor() {
        this.__id = Key.__counter__++;
    }
    get id() {
        return this.__id;
    }
}
Key.__counter__ = 0;
export { Lock, Key };
