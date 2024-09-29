export declare class BaseWorker<T> {
    protected _sourceId: number;
    protected _source: Map<number, T>;
    protected _pendingQueue: T[];
    protected _numWorkers: number;
    protected _workerQueue: Worker[];
    constructor(numWorkers?: number, program?: string);
    check(): void;
    setProgram(program: string): void;
    make(data: T): void;
    protected _onMessage(e: MessageEvent): void;
    destroy(): void;
    get pendingQueue(): T[];
}
