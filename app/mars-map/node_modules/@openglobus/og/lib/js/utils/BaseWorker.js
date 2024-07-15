export class BaseWorker {
    constructor(numWorkers = 2, program) {
        this._sourceId = 0;
        this._source = new Map();
        this._pendingQueue = [];
        this._numWorkers = numWorkers;
        this._workerQueue = [];
        if (program) {
            this.setProgram(program);
        }
    }
    check() {
        if (this._pendingQueue.length) {
            this.make(this._pendingQueue.pop());
        }
    }
    setProgram(program) {
        let p = new Blob([program], { type: "application/javascript" });
        for (let i = 0; i < this._numWorkers; i++) {
            let w = new Worker(URL.createObjectURL(p));
            w.onmessage = (e) => {
                this._onMessage(e);
                this._workerQueue && this._workerQueue.unshift(e.target);
                this.check();
            };
            this._workerQueue.push(w);
        }
    }
    make(data) {
    }
    _onMessage(e) {
    }
    destroy() {
        for (let i = 0; i < this._workerQueue.length; i++) {
            const w = this._workerQueue[i];
            w.onmessage = null;
            w.terminate();
        }
        //@ts-ignore
        this._pendingQueue = null;
        //@ts-ignore
        this._workerQueue = null;
    }
    get pendingQueue() {
        return this._pendingQueue;
    }
}
