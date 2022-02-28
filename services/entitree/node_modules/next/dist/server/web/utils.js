"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.streamToIterator = streamToIterator;
exports.notImplemented = notImplemented;
exports.fromNodeHeaders = fromNodeHeaders;
exports.toNodeHeaders = toNodeHeaders;
async function* streamToIterator(readable) {
    const reader = readable.getReader();
    while(true){
        const { value , done  } = await reader.read();
        if (done) break;
        if (value) {
            yield value;
        }
    }
    reader.releaseLock();
}
function notImplemented(name, method) {
    throw new Error(`Failed to get the '${method}' property on '${name}': the property is not implemented`);
}
function fromNodeHeaders(object) {
    const headers = new Headers();
    for (let [key, value] of Object.entries(object)){
        const values = Array.isArray(value) ? value : [
            value
        ];
        for (let v of values){
            if (v !== undefined) {
                headers.append(key, v);
            }
        }
    }
    return headers;
}
function toNodeHeaders(headers) {
    const result = {
    };
    if (headers) {
        for (const [key, value] of headers.entries()){
            result[key] = value;
            if (key.toLowerCase() === 'set-cookie') {
                result[key] = value.split(', ');
            }
        }
    }
    return result;
}

//# sourceMappingURL=utils.js.map