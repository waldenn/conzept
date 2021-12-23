"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasFn = exports.compareNumbers = exports.waitUntil = exports.executeCommandBe = exports.executeCommand = exports.numberError = exports.enhanceError = exports.wrapExpectedWithArray = exports.updateElementsArray = exports.compareStyle = exports.compareTextWithArray = exports.compareText = void 0;
const options_1 = require("./options");
const executeCommand_1 = require("./util/executeCommand");
Object.defineProperty(exports, "executeCommand", { enumerable: true, get: function () { return executeCommand_1.executeCommand; } });
const elementsUtil_1 = require("./util/elementsUtil");
Object.defineProperty(exports, "wrapExpectedWithArray", { enumerable: true, get: function () { return elementsUtil_1.wrapExpectedWithArray; } });
Object.defineProperty(exports, "updateElementsArray", { enumerable: true, get: function () { return elementsUtil_1.updateElementsArray; } });
const formatMessage_1 = require("./util/formatMessage");
Object.defineProperty(exports, "enhanceError", { enumerable: true, get: function () { return formatMessage_1.enhanceError; } });
Object.defineProperty(exports, "numberError", { enumerable: true, get: function () { return formatMessage_1.numberError; } });
const expectAdapter_1 = require("./util/expectAdapter");
const config = options_1.getConfig();
const { options: DEFAULT_OPTIONS } = config;
const waitUntil = async (condition, isNot = false, { wait = DEFAULT_OPTIONS.wait, interval = DEFAULT_OPTIONS.interval } = {}) => {
    if (wait === 0) {
        return await condition();
    }
    try {
        let error;
        await browser.waitUntil(async () => {
            error = undefined;
            try {
                return isNot !== await condition();
            }
            catch (err) {
                error = err;
                return false;
            }
        }, {
            timeout: wait,
            interval
        });
        if (error) {
            throw error;
        }
        return !isNot;
    }
    catch (err) {
        return isNot;
    }
};
exports.waitUntil = waitUntil;
async function executeCommandBe(received, command, options) {
    const { isNot, expectation, verb = 'be' } = this;
    received = await received;
    let el = received;
    const pass = await waitUntil(async () => {
        const result = await executeCommand_1.executeCommand.call(this, el, async (element) => ({ result: await command(element) }), options);
        el = result.el;
        return result.success;
    }, isNot, options);
    elementsUtil_1.updateElementsArray(pass, received, el);
    const message = formatMessage_1.enhanceErrorBe(el, pass, this, verb, expectation, options);
    return {
        pass,
        message: () => message
    };
}
exports.executeCommandBe = executeCommandBe;
const compareNumbers = (actual, options = {}) => {
    if (typeof options.eq === 'number') {
        return actual === options.eq;
    }
    if (typeof options.gte === 'number' && typeof options.lte === 'number') {
        return actual >= options.gte && actual <= options.lte;
    }
    if (typeof options.gte === 'number') {
        return actual >= options.gte;
    }
    if (typeof options.lte === 'number') {
        return actual <= options.lte;
    }
    return false;
};
exports.compareNumbers = compareNumbers;
const compareText = (actual, expected, { ignoreCase = false, trim = true, containing = false }) => {
    if (typeof actual !== 'string') {
        return {
            value: actual,
            result: false
        };
    }
    if (trim) {
        actual = actual.trim();
    }
    if (ignoreCase) {
        actual = actual.toLowerCase();
        expected = expected.toLowerCase();
    }
    if (containing) {
        return {
            value: actual,
            result: actual.includes(expected)
        };
    }
    return {
        value: actual,
        result: actual === expected
    };
};
exports.compareText = compareText;
const compareTextWithArray = (actual, expectedArray, { ignoreCase = false, trim = false, containing = false }) => {
    if (typeof actual !== 'string') {
        return {
            value: actual,
            result: false
        };
    }
    if (trim) {
        actual = actual.trim();
    }
    if (ignoreCase) {
        actual = actual.toLowerCase();
        expectedArray = expectedArray.map(item => item.toLowerCase());
    }
    if (containing) {
        const textInArray = expectedArray.some((t) => actual.includes(t));
        return {
            value: actual,
            result: textInArray
        };
    }
    return {
        value: actual,
        result: expectedArray.includes(actual)
    };
};
exports.compareTextWithArray = compareTextWithArray;
const compareStyle = async (actualEl, style, { ignoreCase = true, trim = false }) => {
    let result = true;
    const actual = {};
    for (const key in style) {
        const css = await actualEl.getCSSProperty(key);
        let actualVal = css.value;
        let expectedVal = style[key];
        if (trim) {
            actualVal = actualVal.trim();
            expectedVal = expectedVal.trim();
        }
        if (ignoreCase) {
            actualVal = actualVal.toLowerCase();
            expectedVal = expectedVal.toLowerCase();
        }
        result = result && actualVal === expectedVal;
        actual[key] = css.value;
    }
    return {
        value: actual,
        result
    };
};
exports.compareStyle = compareStyle;
function aliasFn(fn, { verb, expectation } = {}, ...args) {
    const context = expectAdapter_1.getContext(this);
    context.verb = verb;
    context.expectation = expectation;
    return fn.apply(context, args);
}
exports.aliasFn = aliasFn;
