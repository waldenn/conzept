"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = start;
var _http = _interopRequireDefault(require("http"));
var _next = _interopRequireDefault(require("../next"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function start(serverOptions, port, hostname) {
    let requestHandler;
    const srv = _http.default.createServer((req, res)=>{
        return requestHandler(req, res);
    });
    const app = (0, _next).default({
        ...serverOptions,
        customServer: false,
        httpServer: srv
    });
    requestHandler = app.getRequestHandler();
    await new Promise((resolve, reject)=>{
        // This code catches EADDRINUSE error if the port is already in use
        srv.on('error', reject);
        srv.on('listening', ()=>resolve()
        );
        srv.listen(port, hostname);
    });
    // It's up to caller to run `app.prepare()`, so it can notify that the server
    // is listening before starting any intensive operations.
    const addr = srv.address();
    return {
        app,
        actualPort: addr && typeof addr === 'object' ? addr.port : port
    };
}

//# sourceMappingURL=start-server.js.map