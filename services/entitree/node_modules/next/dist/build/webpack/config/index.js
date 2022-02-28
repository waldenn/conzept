"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.build = build;
var _base = require("./blocks/base");
var _css = require("./blocks/css");
var _images = require("./blocks/images");
var _utils = require("./utils");
async function build(config, { rootDirectory , customAppFile , isDevelopment , isServer , webServerRuntime , targetWeb , assetPrefix , sassOptions , productionBrowserSourceMaps , future , experimental  }) {
    const ctx = {
        rootDirectory,
        customAppFile,
        isDevelopment,
        isProduction: !isDevelopment,
        isServer,
        webServerRuntime,
        isClient: !isServer,
        targetWeb,
        assetPrefix: assetPrefix ? assetPrefix.endsWith('/') ? assetPrefix.slice(0, -1) : assetPrefix : '',
        sassOptions,
        productionBrowserSourceMaps,
        future,
        experimental
    };
    const fn = (0, _utils).pipe((0, _base).base(ctx), (0, _css).css(ctx), (0, _images).images(ctx));
    return fn(config);
}

//# sourceMappingURL=index.js.map