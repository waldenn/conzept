import { createEvents } from '../Events';
const LOADER_EVENTS = ["loadend", "layerloadend"];
export class Loader {
    constructor(maxRequests = 24) {
        this.MAX_REQUESTS = maxRequests;
        this.events = createEvents(LOADER_EVENTS);
        this._loading = 0;
        this._queue = []; //new QueueArray();
        this._senderRequestCounter = [];
        this._promises = {
            'json': r => r.json(),
            'blob': r => r.blob(),
            'arrayBuffer': r => r.arrayBuffer(),
            'imageBitmap': r => r.blob().then((r) => createImageBitmap(r, {
                premultiplyAlpha: "premultiply"
            })),
            'text': r => r.text()
        };
    }
    load(params, callback) {
        if (params.sender) {
            if (!this._senderRequestCounter[params.sender.__id]) {
                this._senderRequestCounter[params.sender.__id] = {
                    sender: params.sender, counter: 0, __requestCounterFrame__: 0
                };
            }
            this._senderRequestCounter[params.sender.__id].counter++;
        }
        this._queue.push({ params, callback });
        this._exec();
    }
    fetch(params) {
        return fetch(params.src, params.options || {})
            .then((response) => {
            if (!response.ok) {
                throw Error(`Unable to load '${params.src}'`);
            }
            return this._promises[params.type || "blob"](response);
        })
            .then((data) => {
            return { status: "ready", data: data };
        })
            .catch((err) => {
            return { status: "error", msg: err.toString() };
        });
    }
    getRequestCounter(sender) {
        if (sender) {
            let r = this._senderRequestCounter[sender.__id];
            if (r) {
                return r.counter;
            }
        }
        return 0;
    }
    isIdle(sender) {
        return sender.isIdle;
    }
    _checkLoadend(request, sender) {
        if (request.counter === 0 && (!sender._planet || sender._planet._terrainCompletedActivated)) {
            sender.events.dispatch(sender.events.loadend, sender);
            this.events.dispatch(this.events.layerloadend, sender);
            request.__requestCounterFrame__ = 0;
        }
        else {
            request.__requestCounterFrame__ = requestAnimationFrame(() => {
                this._checkLoadend(request, sender);
            });
        }
    }
    _handleResponse(q, response) {
        q.callback(response);
        let sender = q.params.sender;
        if (sender && (sender.events.loadend.handlers.length || this.events.layerloadend.handlers.length)) {
            let request = this._senderRequestCounter[sender.__id];
            if (request && request.counter > 0) {
                request.counter--;
                cancelAnimationFrame(request.__requestCounterFrame__);
                request.__requestCounterFrame__ = requestAnimationFrame(() => {
                    this._checkLoadend(request, sender);
                });
            }
        }
        this._exec();
    }
    _exec() {
        if (this._queue.length > 0 && this._loading < this.MAX_REQUESTS) {
            let q = this._queue.pop();
            if (!q)
                return;
            let p = q.params;
            if (!p.filter || p.filter(p)) {
                this._loading++;
                return fetch(p.src, p.options || {})
                    .then((response) => {
                    if (!response.ok) {
                        throw Error(`Unable to load '${p.src}'`);
                    }
                    return this._promises[p.type || "blob"](response);
                })
                    .then((data) => {
                    this._loading--;
                    this._handleResponse(q, { status: "ready", data: data });
                })
                    .catch((err) => {
                    this._loading--;
                    this._handleResponse(q, { status: "error", msg: err.toString() });
                });
            }
            else {
                this._handleResponse(q, { status: "abort" });
            }
        }
        else if (this._loading === 0) {
            this.events.dispatch(this.events.loadend);
        }
    }
    abort(sender) {
        if (this._senderRequestCounter[sender.__id]) {
            this._senderRequestCounter[sender.__id].counter = 0;
            cancelAnimationFrame(this._senderRequestCounter[sender.__id].__requestCounterFrame__);
            this._senderRequestCounter[sender.__id].__requestCounterFrame__ = 0;
        }
        for (let i = 0, len = this._queue.length; i < len; i++) {
            let qi = this._queue[i];
            if (qi && qi.params.sender && sender.isEqual(qi.params.sender)) {
                qi.callback({ 'status': "abort" });
                //@ts-ignore
                this._queue[i] = null;
            }
        }
    }
    abortAll() {
        for (let i = 0, len = this._queue.length; i < len; i++) {
            let qi = this._queue[i];
            if (qi) {
                let sender = qi.params.sender;
                if (sender && this._senderRequestCounter[sender.__id]) {
                    this._senderRequestCounter[sender.__id].counter = 0;
                    cancelAnimationFrame(this._senderRequestCounter[sender.__id].__requestCounterFrame__);
                    this._senderRequestCounter[sender.__id].__requestCounterFrame__ = 0;
                }
                qi.callback({ 'status': "abort" });
                //@ts-ignore
                this._queue[i] = null;
            }
        }
        this._queue = [];
    }
    get loading() {
        return this._loading;
    }
    get queue() {
        return this._queue;
    }
}
