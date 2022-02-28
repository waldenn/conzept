"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = middlewareLoader;
var _loaderUtils = _interopRequireDefault(require("next/dist/compiled/loader-utils"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function middlewareLoader() {
    const { absolutePagePath , page  } = _loaderUtils.default.getOptions(this);
    const stringifiedPagePath = _loaderUtils.default.stringifyRequest(this, absolutePagePath);
    return `
        import { adapter } from 'next/dist/server/web/adapter'

        var mod = require(${stringifiedPagePath})
        var handler = mod.middleware || mod.default;

        if (typeof handler !== 'function') {
          throw new Error('The Middleware "pages${page}" must export a \`middleware\` or a \`default\` function');
        }

        export default function (opts) {
          return adapter({
              ...opts,
              page: ${JSON.stringify(page)},
              handler,
          })
        }
    `;
}

//# sourceMappingURL=next-middleware-loader.js.map