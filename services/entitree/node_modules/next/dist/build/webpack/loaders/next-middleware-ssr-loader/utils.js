"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getStringifiedAbsolutePath = getStringifiedAbsolutePath;
var _loaderUtils = _interopRequireDefault(require("next/dist/compiled/loader-utils"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function getStringifiedAbsolutePath(target, path) {
    return _loaderUtils.default.stringifyRequest(target, target.utils.absolutify(target.rootContext, path));
}

//# sourceMappingURL=utils.js.map