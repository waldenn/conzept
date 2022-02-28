"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.recursiveDelete = recursiveDelete;
var _fs = require("fs");
var _path = require("path");
var _util = require("util");
var _isError = _interopRequireDefault(require("./is-error"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const sleep = (0, _util).promisify(setTimeout);
const unlinkFile = async (p, t = 1)=>{
    try {
        await _fs.promises.unlink(p);
    } catch (e) {
        const code = (0, _isError).default(e) && e.code;
        if ((code === 'EBUSY' || code === 'ENOTEMPTY' || code === 'EPERM' || code === 'EMFILE') && t < 3) {
            await sleep(t * 100);
            return unlinkFile(p, t++);
        }
        if (code === 'ENOENT') {
            return;
        }
        throw e;
    }
};
async function recursiveDelete(dir, exclude, previousPath = '') {
    let result;
    try {
        result = await _fs.promises.readdir(dir, {
            withFileTypes: true
        });
    } catch (e) {
        if ((0, _isError).default(e) && e.code === 'ENOENT') {
            return;
        }
        throw e;
    }
    await Promise.all(result.map(async (part)=>{
        const absolutePath = (0, _path).join(dir, part.name);
        // readdir does not follow symbolic links
        // if part is a symbolic link, follow it using stat
        let isDirectory = part.isDirectory();
        if (part.isSymbolicLink()) {
            const stats = await _fs.promises.stat(absolutePath);
            isDirectory = stats.isDirectory();
        }
        const pp = (0, _path).join(previousPath, part.name);
        if (isDirectory && (!exclude || !exclude.test(pp))) {
            await recursiveDelete(absolutePath, exclude, pp);
            return _fs.promises.rmdir(absolutePath);
        }
        if (!exclude || !exclude.test(pp)) {
            return unlinkFile(absolutePath);
        }
    }));
}

//# sourceMappingURL=recursive-delete.js.map