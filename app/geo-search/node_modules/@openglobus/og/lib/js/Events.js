import { binaryInsert, stamp } from "./utils/shared";
export function createEvents(methodNames, sender) {
    return new Events(methodNames, sender);
}
/**
 * Base events class to handle custom events.
 * @class
 * @param {Array.<string>} [eventNames] - Event names that could be dispatched.
 * @param {*} [sender]
 */
export class Events {
    constructor(eventNames, sender) {
        this.__id = Events.__counter__++;
        this._eventNames = [];
        eventNames && this.registerNames(eventNames);
        this._sender = sender || this;
        this._stopPropagation = false;
        this._stampCache = {};
    }
    bindSender(sender) {
        this._sender = sender || this;
    }
    /**
     * Function that creates event object properties that would be dispatched.
     * @public
     * @param {Array.<string>} eventNames - Specified event names list.
     */
    registerNames(eventNames) {
        for (let i = 0; i < eventNames.length; i++) {
            this[eventNames[i]] = {
                active: true,
                handlers: []
            };
            this._eventNames.push(eventNames[i]);
        }
        return this;
    }
    _getStamp(name, id, ogid) {
        return `${name}_${id}_${ogid}`;
    }
    /**
     * Returns true if event callback has stamped.
     * @protected
     * @param {Object} name - Event identifier.
     * @param {Object} obj - Event callback.
     * @return {boolean} -
     */
    _stamp(name, obj) {
        let ogid = stamp(obj);
        let st = this._getStamp(name, this.__id, ogid);
        if (!this._stampCache[st]) {
            this._stampCache[st] = ogid;
            return true;
        }
        return false;
    }
    /**
     * Attach listener.
     * @public
     * @param {string} name - Event name to listen.
     * @param {EventCallback} callback - Event callback function.
     * @param {any} [sender] - Event callback function owner.
     * @param {number} [priority] - Priority of event callback.
     */
    on(name, callback, sender, priority = 0) {
        if (this._stamp(name, callback)) {
            if (this[name]) {
                let c = callback.bind(sender || this._sender);
                c._openglobus_id = callback._openglobus_id;
                c._openglobus_priority = priority;
                binaryInsert(this[name].handlers, c, (a, b) => {
                    return (b._openglobus_priority || 0) - (a._openglobus_priority || 0);
                });
            }
        }
    }
    /**
     * Stop listening event name with specified callback function.
     * @public
     * @param {string} name - Event name.
     * @param {EventCallback | null} callback - Attached  event callback.
     */
    off(name, callback) {
        if (callback) {
            let st = this._getStamp(name, this.__id, callback._openglobus_id);
            if (callback._openglobus_id && this._stampCache[st]) {
                let h = this[name].handlers;
                let i = h.length;
                let indexToRemove = -1;
                while (i--) {
                    let hi = h[i];
                    if (hi._openglobus_id === callback._openglobus_id) {
                        indexToRemove = i;
                        break;
                    }
                }
                if (indexToRemove !== -1) {
                    h.splice(indexToRemove, 1);
                    this._stampCache[st] = undefined;
                    delete this._stampCache[st];
                }
            }
        }
    }
    /**
     * Dispatch event.
     * @public
     * @param {EventCallbackHandler} event - Event instance property that created by event name.
     * @param {Object} [args] - Callback parameters.
     */
    dispatch(event, ...args) {
        let result = true;
        if (event && event.active && !this._stopPropagation) {
            let h = event.handlers.slice(0), i = h.length;
            while (i--) {
                if (h[i](...args) === false) {
                    result = false;
                }
            }
        }
        this._stopPropagation = false;
        return result;
    }
    /**
     * Brakes events propagation.
     * @public
     */
    stopPropagation() {
        this._stopPropagation = true;
    }
    /**
     * Removes all events.
     * @public
     */
    clear() {
        for (let i = 0; i < this._eventNames.length; i++) {
            let e = this[this._eventNames[i]];
            e.handlers.length = 0;
            e.handlers = [];
        }
        this._eventNames.length = 0;
        this._eventNames = [];
    }
}
Events.__counter__ = 0;
