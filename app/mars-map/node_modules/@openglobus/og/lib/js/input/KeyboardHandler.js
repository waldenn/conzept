import { input } from './input';
import { stamp } from "../utils/shared";
const STAMP_SPACER = "_";
const _sortByPriority = function (a, b) {
    return Number(a.priority < b.priority);
};
class KeyboardHandler {
    constructor() {
        this._currentlyPressedKeys = {};
        this._pressedKeysCallbacks = {};
        this._unpressedKeysCallbacks = {};
        this._charkeysCallbacks = {};
        this._anykeyCallback = null;
        this._event = null;
        this._active = true;
        this._stampCache = {};
        document.onkeydown = (event) => {
            this._event = event;
            this._active && this.handleKeyDown();
        };
        document.onkeyup = (event) => {
            this._event = event;
            this._active && this.handleKeyUp();
        };
    }
    getcurrentlyPressedKeys() {
        return this._currentlyPressedKeys;
    }
    getPressedKeysCallbacks() {
        return this._pressedKeysCallbacks;
    }
    getUnpressedKeysCallbacks() {
        return this._unpressedKeysCallbacks;
    }
    getCharkeysCallbacks() {
        return this._charkeysCallbacks;
    }
    removeEvent(event, keyCode, callback) {
        let st = this._getStamp(event, keyCode, callback._openglobus_id);
        if (callback._openglobus_id && this._stampCache[st]) {
            //this._stampCache[st] = null;
            delete this._stampCache[st];
            if (event === "keypress") {
                this._removeCallback(this._pressedKeysCallbacks[keyCode], callback);
            }
            else if (event === "keyfree") {
                this._removeCallback(this._unpressedKeysCallbacks[keyCode], callback);
            }
            else if (event === "charkeypress") {
                this._removeCallback(this._charkeysCallbacks[keyCode], callback);
            }
        }
    }
    _removeCallback(handlers, callback) {
        for (let i = 0; i < handlers.length; i++) {
            if (handlers[i].callback._openglobus_id === callback._openglobus_id) {
                handlers.splice(i, 1);
            }
        }
    }
    _getStamp(name, keyCode, ogid) {
        return `${name}${STAMP_SPACER}${keyCode}${STAMP_SPACER}${ogid}`;
    }
    _stamp(name, keyCode, obj) {
        const ogid = stamp(obj);
        const st = this._getStamp(name, keyCode, ogid);
        if (!this._stampCache[st]) {
            this._stampCache[st] = ogid;
            return true;
        }
        return false;
    }
    setActivity(activity) {
        this._active = activity;
    }
    releaseKeys() {
        this._currentlyPressedKeys = {};
    }
    addEvent(event, keyCode, callback, sender, priority) {
        // Event is already bound with the callback
        if (!this._stamp(event, keyCode, callback))
            return;
        if (priority === undefined) {
            priority = 1600;
        }
        switch (event) {
            case "keyfree":
                if (!this._unpressedKeysCallbacks[keyCode]) {
                    this._unpressedKeysCallbacks[keyCode] = [];
                }
                this._unpressedKeysCallbacks[keyCode].push({ callback: callback, sender: sender, priority: priority });
                this._unpressedKeysCallbacks[keyCode].sort(_sortByPriority);
                break;
            case "keypress":
                if (keyCode == null) {
                    this._anykeyCallback = { callback: callback, sender: sender || this };
                }
                else {
                    if (!this._pressedKeysCallbacks[keyCode]) {
                        this._pressedKeysCallbacks[keyCode] = [];
                    }
                    this._pressedKeysCallbacks[keyCode].push({ callback: callback, sender: sender, priority: priority });
                    this._pressedKeysCallbacks[keyCode].sort(_sortByPriority);
                }
                break;
            case "charkeypress":
                if (!this._charkeysCallbacks[keyCode]) {
                    this._charkeysCallbacks[keyCode] = [];
                }
                this._charkeysCallbacks[keyCode].push({ callback: callback, sender: sender, priority: priority });
                this._charkeysCallbacks[keyCode].sort(_sortByPriority);
                break;
        }
    }
    isKeyPressed(keyCode) {
        return this._currentlyPressedKeys[keyCode];
    }
    handleKeyDown() {
        // If you want to get a key code just uncomment and check console
        //console.log(this._event!.keyCode);
        this._anykeyCallback && this._anykeyCallback.callback.call(this._anykeyCallback.sender, this._event);
        this._currentlyPressedKeys[this._event.keyCode] = true;
        for (let ch in this._charkeysCallbacks) {
            if (String.fromCharCode(this._event.keyCode) === String.fromCharCode(Number(ch))) {
                let ccl = this._charkeysCallbacks[ch];
                for (let i = 0; i < ccl.length; i++) {
                    ccl[i].callback.call(ccl[i].sender, this._event);
                }
            }
        }
        if (this._event.keyCode == input.KEY_ALT || this._event.keyCode == input.KEY_SHIFT) {
            this._event.preventDefault();
        }
    }
    handleKeyUp() {
        if (this._currentlyPressedKeys[this._event.keyCode] || this._event.keyCode === input.KEY_PRINTSCREEN) {
            for (let pk in this._unpressedKeysCallbacks) {
                if (this._currentlyPressedKeys[pk] || this._event.keyCode === input.KEY_PRINTSCREEN && Number(pk) === input.KEY_PRINTSCREEN) {
                    let cpk = this._unpressedKeysCallbacks[pk];
                    for (let i = 0; i < cpk.length; i++) {
                        cpk[i].callback.call(cpk[i].sender, this._event);
                    }
                }
            }
        }
        this._currentlyPressedKeys[this._event.keyCode] = false;
    }
    handleEvents() {
        for (let pk in this._pressedKeysCallbacks) {
            if (this._currentlyPressedKeys[pk]) {
                let cpk = this._pressedKeysCallbacks[pk];
                for (let i = 0; i < cpk.length; i++) {
                    cpk[i].callback.call(cpk[i].sender, this._event);
                }
            }
        }
    }
}
export { KeyboardHandler };
