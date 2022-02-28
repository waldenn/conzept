"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.minify = minify;
exports.minifySync = minifySync;
const { loadBinding  } = require('@node-rs/helper');
const path = require('path');
const Log = require('../output/log');
/**
 * __dirname means load native addon from current dir
 * 'next-swc' is the name of native addon
 * the second arguments was decided by `napi.name` field in `package.json`
 * the third arguments was decided by `name` field in `package.json`
 * `loadBinding` helper will load `next-swc.[PLATFORM].node` from `__dirname` first
 * If failed to load addon, it will fallback to load from `next-swc-[PLATFORM]`
 */ let bindings;
try {
    bindings = loadBinding(path.join(__dirname, '../../../native'), 'next-swc', '@next/swc');
} catch (err) {
    // only log the original error message as the stack is not
    // helpful to the user
    console.error(err.message);
    Log.error(`failed to load SWC binary, see more info here: https://nextjs.org/docs/messages/failed-loading-swc`);
    process.exit(1);
}
async function transform(src, options) {
    var ref;
    const isModule = typeof src !== 'string';
    options = options || {
    };
    if (options === null || options === void 0 ? void 0 : (ref = options.jsc) === null || ref === void 0 ? void 0 : ref.parser) {
        var _syntax;
        options.jsc.parser.syntax = (_syntax = options.jsc.parser.syntax) !== null && _syntax !== void 0 ? _syntax : 'ecmascript';
    }
    return bindings.transform(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
}
function transformSync(src, options) {
    var ref;
    const isModule = typeof src !== 'string';
    options = options || {
    };
    if (options === null || options === void 0 ? void 0 : (ref = options.jsc) === null || ref === void 0 ? void 0 : ref.parser) {
        var _syntax;
        options.jsc.parser.syntax = (_syntax = options.jsc.parser.syntax) !== null && _syntax !== void 0 ? _syntax : 'ecmascript';
    }
    return bindings.transformSync(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
}
function toBuffer(t) {
    return Buffer.from(JSON.stringify(t));
}
async function minify(src, opts) {
    return bindings.minify(toBuffer(src), toBuffer(opts !== null && opts !== void 0 ? opts : {
    }));
}
function minifySync(src, opts) {
    return bindings.minifySync(toBuffer(src), toBuffer(opts !== null && opts !== void 0 ? opts : {
    }));
}
module.exports.transform = transform;
module.exports.transformSync = transformSync;
module.exports.minify = minify;
module.exports.minifySync = minifySync;

//# sourceMappingURL=index.js.map