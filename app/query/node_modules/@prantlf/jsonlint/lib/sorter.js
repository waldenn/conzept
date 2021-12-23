(function (global, factory) {
  // eslint-disable-next-line no-unused-expressions
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports)
  // eslint-disable-next-line no-undef
    : typeof define === 'function' && define.amd ? define('jsonlint-sorter', ['exports'], factory)
    // eslint-disable-next-line no-undef
      : (global = global || self, factory(global.jsonlintSorter = {}))
}(this, function (exports) {
  'use strict'

  // from http://stackoverflow.com/questions/1359761/sorting-a-json-object-in-javascript
  var hasOwnProperty = Object.prototype.hasOwnProperty
  function sortObject (o) {
    if (Array.isArray(o)) {
      return o.map(sortObject)
    } else if (Object.prototype.toString.call(o) !== '[object Object]') {
      return o
    }
    var sorted = {}
    var key
    var a = []
    for (key in o) {
      if (hasOwnProperty.call(o, key)) {
        a.push(key)
      }
    }
    a.sort()
    for (key = 0; key < a.length; key++) {
      sorted[a[key]] = sortObject(o[a[key]])
    }
    return sorted
  }

  exports.sortObject = sortObject

  Object.defineProperty(exports, '__esModule', { value: true })
}))
