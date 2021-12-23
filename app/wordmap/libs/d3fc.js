(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-scale'), require('d3-time'), require('d3-random'), require('d3-fetch'), require('d3-path'), require('d3-selection'), require('d3-shape'), require('d3-dispatch'), require('d3-brush')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-scale', 'd3-time', 'd3-random', 'd3-fetch', 'd3-path', 'd3-selection', 'd3-shape', 'd3-dispatch', 'd3-brush'], factory) :
  (factory((global.fc = global.fc || {}),global.d3,global.d3,global.d3,global.d3,global.d3,global.d3,global.d3,global.d3,global.d3,global.d3));
}(this, (function (exports,d3Array,d3Scale,d3Time,d3Random,d3Fetch,d3Path,d3Selection,d3Shape,d3Dispatch,d3Brush) { 'use strict';

var createReboundMethod = (function (target, source, name) {
    var method = source[name];
    if (typeof method !== 'function') {
        throw new Error('Attempt to rebind ' + name + ' which isn\'t a function on the source object');
    }
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var value = method.apply(source, args);
        return value === source ? target : value;
    };
});

var rebind = (function (target, source) {
    for (var _len = arguments.length, names = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        names[_key - 2] = arguments[_key];
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var name = _step.value;

            target[name] = createReboundMethod(target, source, name);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return target;
});

var createTransform = function createTransform(transforms) {
    return function (name) {
        return transforms.reduce(function (name, fn) {
            return name && fn(name);
        }, name);
    };
};

var rebindAll = (function (target, source) {
    for (var _len = arguments.length, transforms = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        transforms[_key - 2] = arguments[_key];
    }

    var transform = createTransform(transforms);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys(source)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var name = _step.value;

            var result = transform(name);
            if (result) {
                target[result] = createReboundMethod(target, source, name);
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return target;
});

var regexify = (function (strsOrRegexes) {
    return strsOrRegexes.map(function (strOrRegex) {
        return typeof strOrRegex === 'string' ? new RegExp('^' + strOrRegex + '$') : strOrRegex;
    });
});

var exclude = (function () {
    for (var _len = arguments.length, exclusions = Array(_len), _key = 0; _key < _len; _key++) {
        exclusions[_key] = arguments[_key];
    }

    exclusions = regexify(exclusions);
    return function (name) {
        return exclusions.every(function (exclusion) {
            return !exclusion.test(name);
        }) && name;
    };
});

var include = (function () {
    for (var _len = arguments.length, inclusions = Array(_len), _key = 0; _key < _len; _key++) {
        inclusions[_key] = arguments[_key];
    }

    inclusions = regexify(inclusions);
    return function (name) {
        return inclusions.some(function (inclusion) {
            return inclusion.test(name);
        }) && name;
    };
});

var includeMap = (function (mappings) {
  return function (name) {
    return mappings[name];
  };
});

var capitalizeFirstLetter = function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
};

var prefix = (function (prefix) {
  return function (name) {
    return prefix + capitalizeFirstLetter(name);
  };
});

function identity(d) {
    return d;
}
function noop(d) {}

function functor(v) {
    return typeof v === 'function' ? v : function () {
        return v;
    };
}
function convertNaN(value) {
    return typeof value === 'number' && isNaN(value) ? undefined : value;
}

var _slidingWindow = function () {

    var period = function period() {
        return 10;
    };
    var accumulator = noop;
    var value = identity;
    var defined = function defined(d) {
        return d != null;
    };

    var slidingWindow = function slidingWindow(data) {
        var size = period.apply(this, arguments);
        var windowData = data.slice(0, size).map(value);
        return data.map(function (d, i) {
            if (i >= size) {
                // Treat windowData as FIFO rolling buffer
                windowData.shift();
                windowData.push(value(d, i));
            }
            if (i < size - 1 || windowData.some(function (d) {
                return !defined(d);
            })) {
                return accumulator(undefined, i);
            }
            return accumulator(windowData, i);
        });
    };

    slidingWindow.period = function () {
        if (!arguments.length) {
            return period;
        }
        period = functor(arguments.length <= 0 ? undefined : arguments[0]);
        return slidingWindow;
    };
    slidingWindow.accumulator = function () {
        if (!arguments.length) {
            return accumulator;
        }
        accumulator = arguments.length <= 0 ? undefined : arguments[0];
        return slidingWindow;
    };
    slidingWindow.defined = function () {
        if (!arguments.length) {
            return defined;
        }
        defined = arguments.length <= 0 ? undefined : arguments[0];
        return slidingWindow;
    };
    slidingWindow.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = arguments.length <= 0 ? undefined : arguments[0];
        return slidingWindow;
    };

    return slidingWindow;
};

var bollingerBands = function () {

    var multiplier = 2;

    var slidingWindow = _slidingWindow().accumulator(function (values) {
        var stdDev = values && d3Array.deviation(values);
        var average = values && d3Array.mean(values);
        return {
            average: average,
            upper: convertNaN(average + multiplier * stdDev),
            lower: convertNaN(average - multiplier * stdDev)
        };
    });

    var bollingerBands = function bollingerBands(data) {
        return slidingWindow(data);
    };

    bollingerBands.multiplier = function () {
        if (!arguments.length) {
            return multiplier;
        }
        multiplier = arguments.length <= 0 ? undefined : arguments[0];
        return bollingerBands;
    };

    rebind(bollingerBands, slidingWindow, 'period', 'value');

    return bollingerBands;
};

var exponentialMovingAverage = function () {

    var value = identity;
    var period = function period() {
        return 9;
    };

    var initialMovingAverageAccumulator = function initialMovingAverageAccumulator(period) {
        var values = [];
        return function (value) {
            var movingAverage = void 0;
            if (values.length < period) {
                if (value != null) {
                    values.push(value);
                } else {
                    values = [];
                }
            }
            if (values.length >= period) {
                movingAverage = d3Array.mean(values);
            }
            return movingAverage;
        };
    };
    var exponentialMovingAverage = function exponentialMovingAverage(data) {
        var size = period.apply(this, arguments);
        var alpha = 2 / (size + 1);
        var initialAccumulator = initialMovingAverageAccumulator(size);
        var ema = void 0;
        return data.map(function (d, i) {
            var v = value(d, i);
            if (ema === undefined) {
                ema = initialAccumulator(v);
            } else {
                ema = v * alpha + (1 - alpha) * ema;
            }
            return convertNaN(ema);
        });
    };

    exponentialMovingAverage.period = function () {
        if (!arguments.length) {
            return period;
        }
        period = functor(arguments.length <= 0 ? undefined : arguments[0]);
        return exponentialMovingAverage;
    };

    exponentialMovingAverage.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = arguments.length <= 0 ? undefined : arguments[0];
        return exponentialMovingAverage;
    };

    return exponentialMovingAverage;
};

var macd = function () {

    var value = identity;

    var fastEMA = exponentialMovingAverage().period(12);
    var slowEMA = exponentialMovingAverage().period(26);
    var signalEMA = exponentialMovingAverage().period(9);

    var macd = function macd(data) {

        fastEMA.value(value);
        slowEMA.value(value);

        var diff = d3Array.zip(fastEMA(data), slowEMA(data)).map(function (d) {
            return d[0] !== undefined && d[1] !== undefined ? d[0] - d[1] : undefined;
        });

        var averageDiff = signalEMA(diff);

        return d3Array.zip(diff, averageDiff).map(function (d) {
            return {
                macd: d[0],
                signal: d[1],
                divergence: d[0] !== undefined && d[1] !== undefined ? d[0] - d[1] : undefined
            };
        });
    };

    macd.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = arguments.length <= 0 ? undefined : arguments[0];
        return macd;
    };

    rebindAll(macd, fastEMA, includeMap({ 'period': 'fastPeriod' }));
    rebindAll(macd, slowEMA, includeMap({ 'period': 'slowPeriod' }));
    rebindAll(macd, signalEMA, includeMap({ 'period': 'signalPeriod' }));

    return macd;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var relativeStrengthIndex = function () {

    var slidingWindow = _slidingWindow().period(14);
    var wildersSmoothing = function wildersSmoothing(values, prevAvg) {
        return prevAvg + (values[values.length - 1] - prevAvg) / values.length;
    };
    var downChange = function downChange(_ref) {
        var _ref2 = slicedToArray(_ref, 2),
            prevClose = _ref2[0],
            close = _ref2[1];

        return prevClose < close ? 0 : prevClose - close;
    };
    var upChange = function upChange(_ref3) {
        var _ref4 = slicedToArray(_ref3, 2),
            prevClose = _ref4[0],
            close = _ref4[1];

        return prevClose > close ? 0 : close - prevClose;
    };

    var updateAverage = function updateAverage(changes, prevAverage) {
        return prevAverage !== undefined ? wildersSmoothing(changes, prevAverage) : d3Array.mean(changes);
    };

    var makeAccumulator = function makeAccumulator() {
        var prevClose = void 0;
        var downChangesAvg = void 0;
        var upChangesAvg = void 0;
        return function (closes) {
            if (!closes) {
                if (prevClose !== undefined) {
                    prevClose = NaN;
                }
                return undefined;
            }
            if (prevClose === undefined) {
                prevClose = closes[0];
                return undefined;
            }

            var closePairs = d3Array.pairs([prevClose].concat(toConsumableArray(closes)));
            downChangesAvg = updateAverage(closePairs.map(downChange), downChangesAvg);
            upChangesAvg = updateAverage(closePairs.map(upChange), upChangesAvg);
            var rs = !isNaN(prevClose) ? upChangesAvg / downChangesAvg : NaN;
            return convertNaN(100 - 100 / (1 + rs));
        };
    };

    var rsi = function rsi(data) {
        var rsiAccumulator = makeAccumulator();
        slidingWindow.accumulator(rsiAccumulator);
        return slidingWindow(data);
    };

    rebind(rsi, slidingWindow, 'period', 'value');
    return rsi;
};

var movingAverage = function () {

    var slidingWindow = _slidingWindow().accumulator(function (values) {
        return values && d3Array.mean(values);
    });

    var movingAverage = function movingAverage(data) {
        return slidingWindow(data);
    };

    rebind(movingAverage, slidingWindow, 'period', 'value');

    return movingAverage;
};

var stochasticOscillator = function () {

    var closeValue = function closeValue(d, i) {
        return d.close;
    };
    var highValue = function highValue(d, i) {
        return d.high;
    };
    var lowValue = function lowValue(d, i) {
        return d.low;
    };

    var kWindow = _slidingWindow().period(5).defined(function (d) {
        return closeValue(d) != null && highValue(d) != null && lowValue(d) != null;
    }).accumulator(function (values) {
        var maxHigh = values && d3Array.max(values, highValue);
        var minLow = values && d3Array.min(values, lowValue);
        var kValue = values && 100 * (closeValue(values[values.length - 1]) - minLow) / (maxHigh - minLow);
        return convertNaN(kValue);
    });

    var dWindow = movingAverage().period(3);

    var stochastic = function stochastic(data) {
        var kValues = kWindow(data);
        var dValues = dWindow(kValues);
        return kValues.map(function (k, i) {
            return { k: k, d: dValues[i] };
        });
    };

    stochastic.closeValue = function () {
        if (!arguments.length) {
            return closeValue;
        }
        closeValue = arguments.length <= 0 ? undefined : arguments[0];
        return stochastic;
    };
    stochastic.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = arguments.length <= 0 ? undefined : arguments[0];
        return stochastic;
    };
    stochastic.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = arguments.length <= 0 ? undefined : arguments[0];
        return stochastic;
    };

    rebindAll(stochastic, kWindow, includeMap({ 'period': 'kPeriod' }));
    rebindAll(stochastic, dWindow, includeMap({ 'period': 'dPeriod' }));

    return stochastic;
};

var forceIndex = function () {

    var volumeValue = function volumeValue(d, i) {
        return d.volume;
    };
    var closeValue = function closeValue(d, i) {
        return d.close;
    };

    var emaComputer = exponentialMovingAverage().period(13);

    var slidingWindow = _slidingWindow().period(2).defined(function (d) {
        return closeValue(d) != null && volumeValue(d) != null;
    }).accumulator(function (values) {
        return values && convertNaN((closeValue(values[1]) - closeValue(values[0])) * volumeValue(values[1]));
    });

    var force = function force(data) {
        var forceIndex = slidingWindow(data);
        return emaComputer(forceIndex);
    };

    force.volumeValue = function () {
        if (!arguments.length) {
            return volumeValue;
        }
        volumeValue = arguments.length <= 0 ? undefined : arguments[0];
        return force;
    };
    force.closeValue = function () {
        if (!arguments.length) {
            return closeValue;
        }
        closeValue = arguments.length <= 0 ? undefined : arguments[0];
        return force;
    };

    rebind(force, emaComputer, 'period');

    return force;
};

var envelope = function () {

    var factor = 0.1;
    var value = identity;

    var envelope = function envelope(data) {
        return data.map(function (d) {
            var lower = convertNaN(value(d) * (1.0 - factor));
            var upper = convertNaN(value(d) * (1.0 + factor));
            return { lower: lower, upper: upper };
        });
    };

    envelope.factor = function () {
        if (!arguments.length) {
            return factor;
        }
        factor = arguments.length <= 0 ? undefined : arguments[0];
        return envelope;
    };

    envelope.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = arguments.length <= 0 ? undefined : arguments[0];
        return envelope;
    };

    return envelope;
};

var elderRay = function () {

    var closeValue = function closeValue(d, i) {
        return d.close;
    };
    var highValue = function highValue(d, i) {
        return d.high;
    };
    var lowValue = function lowValue(d, i) {
        return d.low;
    };

    var emaComputer = exponentialMovingAverage().period(13);

    var elderRay = function elderRay(data) {
        emaComputer.value(closeValue);
        return d3Array.zip(data, emaComputer(data)).map(function (d) {
            var bullPower = convertNaN(highValue(d[0]) - d[1]);
            var bearPower = convertNaN(lowValue(d[0]) - d[1]);
            return { bullPower: bullPower, bearPower: bearPower };
        });
    };

    elderRay.closeValue = function () {
        if (!arguments.length) {
            return closeValue;
        }
        closeValue = arguments.length <= 0 ? undefined : arguments[0];
        return elderRay;
    };

    elderRay.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = arguments.length <= 0 ? undefined : arguments[0];
        return elderRay;
    };
    elderRay.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = arguments.length <= 0 ? undefined : arguments[0];
        return elderRay;
    };

    rebind(elderRay, emaComputer, 'period');

    return elderRay;
};

var identity$1 = function () {

    var identity = {};

    identity.distance = function (start, end) {
        return end - start;
    };

    identity.offset = function (start, offset) {
        return start instanceof Date ? new Date(start.getTime() + offset) : start + offset;
    };

    identity.clampUp = function (d) {
        return d;
    };

    identity.clampDown = function (d) {
        return d;
    };

    identity.copy = function () {
        return identity;
    };

    return identity;
};

function tickFilter(ticks, discontinuityProvider) {
    var discontinuousTicks = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = ticks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var tick = _step.value;

            var up = discontinuityProvider.clampUp(tick);
            var down = discontinuityProvider.clampDown(tick);
            if (up === down) {
                discontinuousTicks.push(up);
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return discontinuousTicks;
}

function discontinuous(adaptedScale) {
    var _this = this;

    if (!arguments.length) {
        adaptedScale = d3Scale.scaleIdentity();
    }

    var discontinuityProvider = identity$1();

    var scale = function scale(value) {
        var domain = adaptedScale.domain();
        var range$$1 = adaptedScale.range();

        // The discontinuityProvider is responsible for determine the distance between two points
        // along a scale that has discontinuities (i.e. sections that have been removed).
        // the scale for the given point 'x' is calculated as the ratio of the discontinuous distance
        // over the domain of this axis, versus the discontinuous distance to 'x'
        var totalDomainDistance = discontinuityProvider.distance(domain[0], domain[1]);
        var distanceToX = discontinuityProvider.distance(domain[0], value);
        var ratioToX = distanceToX / totalDomainDistance;
        var scaledByRange = ratioToX * (range$$1[1] - range$$1[0]) + range$$1[0];
        return scaledByRange;
    };

    scale.invert = function (x) {
        var domain = adaptedScale.domain();
        var range$$1 = adaptedScale.range();

        var ratioToX = (x - range$$1[0]) / (range$$1[1] - range$$1[0]);
        var totalDomainDistance = discontinuityProvider.distance(domain[0], domain[1]);
        var distanceToX = ratioToX * totalDomainDistance;
        return discontinuityProvider.offset(domain[0], distanceToX);
    };

    scale.domain = function () {
        if (!arguments.length) {
            return adaptedScale.domain();
        }
        var newDomain = arguments.length <= 0 ? undefined : arguments[0];

        // clamp the upper and lower domain values to ensure they
        // do not fall within a discontinuity
        var domainLower = discontinuityProvider.clampUp(newDomain[0]);
        var domainUpper = discontinuityProvider.clampDown(newDomain[1]);
        adaptedScale.domain([domainLower, domainUpper]);
        return scale;
    };

    scale.nice = function () {
        adaptedScale.nice();
        var domain = adaptedScale.domain();
        var domainLower = discontinuityProvider.clampUp(domain[0]);
        var domainUpper = discontinuityProvider.clampDown(domain[1]);
        adaptedScale.domain([domainLower, domainUpper]);
        return scale;
    };

    scale.ticks = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var ticks = adaptedScale.ticks.apply(_this, args);
        return tickFilter(ticks, discontinuityProvider);
    };

    scale.copy = function () {
        return discontinuous(adaptedScale.copy()).discontinuityProvider(discontinuityProvider.copy());
    };

    scale.discontinuityProvider = function () {
        if (!arguments.length) {
            return discontinuityProvider;
        }
        discontinuityProvider = arguments.length <= 0 ? undefined : arguments[0];
        return scale;
    };

    rebindAll(scale, adaptedScale, include('range', 'rangeRound', 'interpolate', 'clamp', 'tickFormat'));

    return scale;
}

var skipWeekends = function () {

    // the indices returned by date.getDay()
    var day = {
        sunday: 0,
        monday: 1,
        saturday: 6
    };

    var millisPerDay = 24 * 3600 * 1000;
    var millisPerWorkWeek = millisPerDay * 5;
    var millisPerWeek = millisPerDay * 7;

    var skipWeekends = {};

    var isWeekend = function isWeekend(date) {
        return date.getDay() === 0 || date.getDay() === 6;
    };

    skipWeekends.clampDown = function (date) {
        if (date && isWeekend(date)) {
            // round the date up to midnight
            var newDate = d3Time.timeDay.ceil(date);
            // then subtract the required number of days
            if (newDate.getDay() === day.sunday) {
                return d3Time.timeDay.offset(newDate, -1);
            } else if (newDate.getDay() === day.monday) {
                return d3Time.timeDay.offset(newDate, -2);
            } else {
                return newDate;
            }
        } else {
            return date;
        }
    };

    skipWeekends.clampUp = function (date) {
        if (date && isWeekend(date)) {
            // round the date down to midnight
            var newDate = d3Time.timeDay.floor(date);
            // then add the required number of days
            if (newDate.getDay() === day.saturday) {
                return d3Time.timeDay.offset(newDate, 2);
            } else if (newDate.getDay() === day.sunday) {
                return d3Time.timeDay.offset(newDate, 1);
            } else {
                return newDate;
            }
        } else {
            return date;
        }
    };

    // returns the number of included milliseconds (i.e. those which do not fall)
    // within discontinuities, along this scale
    skipWeekends.distance = function (startDate, endDate) {
        startDate = skipWeekends.clampUp(startDate);
        endDate = skipWeekends.clampDown(endDate);

        // move the start date to the end of week boundary
        var offsetStart = d3Time.timeSaturday.ceil(startDate);
        if (endDate < offsetStart) {
            return endDate.getTime() - startDate.getTime();
        }

        var msAdded = offsetStart.getTime() - startDate.getTime();

        // move the end date to the end of week boundary
        var offsetEnd = d3Time.timeSaturday.ceil(endDate);
        var msRemoved = offsetEnd.getTime() - endDate.getTime();

        // determine how many weeks there are between these two dates
        // round to account for DST transitions
        var weeks = Math.round((offsetEnd.getTime() - offsetStart.getTime()) / millisPerWeek);

        return weeks * millisPerWorkWeek + msAdded - msRemoved;
    };

    skipWeekends.offset = function (startDate, ms) {
        var date = isWeekend(startDate) ? skipWeekends.clampUp(startDate) : startDate;

        if (ms === 0) {
            return date;
        }

        var isNegativeOffset = ms < 0;
        var isPositiveOffset = ms > 0;
        var remainingms = ms;

        // move to the end of week boundary for a postive offset or to the start of a week for a negative offset
        var weekBoundary = isNegativeOffset ? d3Time.timeMonday.floor(date) : d3Time.timeSaturday.ceil(date);
        remainingms -= weekBoundary.getTime() - date.getTime();

        // if the distance to the boundary is greater than the number of ms
        // simply add the ms to the current date
        if (isNegativeOffset && remainingms > 0 || isPositiveOffset && remainingms < 0) {
            return new Date(date.getTime() + ms);
        }

        // skip the weekend for a positive offset
        date = isNegativeOffset ? weekBoundary : d3Time.timeDay.offset(weekBoundary, 2);

        // add all of the complete weeks to the date
        var completeWeeks = Math.floor(remainingms / millisPerWorkWeek);
        date = d3Time.timeDay.offset(date, completeWeeks * 7);
        remainingms -= completeWeeks * millisPerWorkWeek;

        // add the remaining time
        date = new Date(date.getTime() + remainingms);
        return date;
    };

    skipWeekends.copy = function () {
        return skipWeekends;
    };

    return skipWeekends;
};

var provider = function provider() {
    for (var _len = arguments.length, ranges = Array(_len), _key = 0; _key < _len; _key++) {
        ranges[_key] = arguments[_key];
    }

    var inRange = function inRange(number, range$$1) {
        return number > range$$1[0] && number < range$$1[1];
    };

    var surroundsRange = function surroundsRange(inner, outer) {
        return inner[0] >= outer[0] && inner[1] <= outer[1];
    };

    var identity = {};

    identity.distance = function (start, end) {
        start = identity.clampUp(start);
        end = identity.clampDown(end);

        var surroundedRanges = ranges.filter(function (r) {
            return surroundsRange(r, [start, end]);
        });
        var rangeSizes = surroundedRanges.map(function (r) {
            return r[1] - r[0];
        });

        return end - start - rangeSizes.reduce(function (total, current) {
            return total + current;
        }, 0);
    };

    var add = function add(value, offset) {
        return value instanceof Date ? new Date(value.getTime() + offset) : value + offset;
    };

    identity.offset = function (location, offset) {
        if (offset > 0) {
            var _ret = function () {
                var currentLocation = identity.clampUp(location);
                var offsetRemaining = offset;
                while (offsetRemaining > 0) {
                    var futureRanges = ranges.filter(function (r) {
                        return r[0] > currentLocation;
                    }).sort(function (a, b) {
                        return a[0] - b[0];
                    });
                    if (futureRanges.length) {
                        var nextRange = futureRanges[0];
                        var delta = nextRange[0] - currentLocation;
                        if (delta > offsetRemaining) {
                            currentLocation = add(currentLocation, offsetRemaining);
                            offsetRemaining = 0;
                        } else {
                            currentLocation = nextRange[1];
                            offsetRemaining -= delta;
                        }
                    } else {
                        currentLocation = add(currentLocation, offsetRemaining);
                        offsetRemaining = 0;
                    }
                }
                return {
                    v: currentLocation
                };
            }();

            if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
        } else {
            var _ret2 = function () {
                var currentLocation = identity.clampDown(location);
                var offsetRemaining = offset;
                while (offsetRemaining < 0) {
                    var futureRanges = ranges.filter(function (r) {
                        return r[1] < currentLocation;
                    }).sort(function (a, b) {
                        return b[0] - a[0];
                    });
                    if (futureRanges.length) {
                        var nextRange = futureRanges[0];
                        var delta = nextRange[1] - currentLocation;
                        if (delta < offsetRemaining) {
                            currentLocation = add(currentLocation, offsetRemaining);
                            offsetRemaining = 0;
                        } else {
                            currentLocation = nextRange[0];
                            offsetRemaining -= delta;
                        }
                    } else {
                        currentLocation = add(currentLocation, offsetRemaining);
                        offsetRemaining = 0;
                    }
                }
                return {
                    v: currentLocation
                };
            }();

            if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
        }
    };

    identity.clampUp = function (d) {
        return ranges.reduce(function (value, range$$1) {
            return inRange(value, range$$1) ? range$$1[1] : value;
        }, d);
    };

    identity.clampDown = function (d) {
        return ranges.reduce(function (value, range$$1) {
            return inRange(value, range$$1) ? range$$1[0] : value;
        }, d);
    };

    identity.copy = function () {
        return identity;
    };

    return identity;
};

var linearExtent = function () {

    var accessors = [function (d) {
        return d;
    }];
    var pad = [0, 0];
    var padUnit = 'percent';
    var symmetricalAbout = null;
    var include = [];

    var instance = function instance(data) {
        var values = new Array(data.length);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = accessors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var accessor = _step.value;

                for (var i = 0; i < data.length; i++) {
                    var value = accessor(data[i], i);
                    if (Array.isArray(value)) {
                        values.push.apply(values, toConsumableArray(value));
                    } else {
                        values.push(value);
                    }
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        var extent$$1 = [d3Array.min(values), d3Array.max(values)];

        extent$$1[0] = extent$$1[0] == null ? d3Array.min(include) : d3Array.min([extent$$1[0]].concat(toConsumableArray(include)));
        extent$$1[1] = extent$$1[1] == null ? d3Array.max(include) : d3Array.max([extent$$1[1]].concat(toConsumableArray(include)));

        if (symmetricalAbout != null) {
            var halfRange = Math.max(Math.abs(extent$$1[1] - symmetricalAbout), Math.abs(extent$$1[0] - symmetricalAbout));
            extent$$1[0] = symmetricalAbout - halfRange;
            extent$$1[1] = symmetricalAbout + halfRange;
        }

        switch (padUnit) {
            case 'domain':
                {
                    extent$$1[0] -= pad[0];
                    extent$$1[1] += pad[1];
                    break;
                }
            case 'percent':
                {
                    var delta = extent$$1[1] - extent$$1[0];
                    extent$$1[0] -= pad[0] * delta;
                    extent$$1[1] += pad[1] * delta;
                    break;
                }
            default:
                throw new Error('Unknown padUnit: ' + padUnit);
        }

        return extent$$1;
    };

    instance.accessors = function () {
        if (!arguments.length) {
            return accessors;
        }
        accessors = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.pad = function () {
        if (!arguments.length) {
            return pad;
        }
        pad = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.padUnit = function () {
        if (!arguments.length) {
            return padUnit;
        }
        padUnit = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.include = function () {
        if (!arguments.length) {
            return include;
        }
        include = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.symmetricalAbout = function () {
        if (!arguments.length) {
            return symmetricalAbout;
        }
        symmetricalAbout = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    return instance;
};

var date = function () {

    var accessors = [];
    var pad = [0, 0];
    var padUnit = 'percent';
    var symmetricalAbout = null;
    var include = [];

    var extent$$1 = linearExtent();

    var valueOf = function valueOf(date) {
        return date != null ? date.valueOf() : null;
    };

    var instance = function instance(data) {
        var adaptedAccessors = accessors.map(function (accessor) {
            return function () {
                var value = accessor.apply(undefined, arguments);
                return Array.isArray(value) ? value.map(valueOf) : valueOf(value);
            };
        });

        extent$$1.accessors(adaptedAccessors).pad(pad).padUnit(padUnit).symmetricalAbout(symmetricalAbout != null ? symmetricalAbout.valueOf() : null).include(include.map(function (date) {
            return date.valueOf();
        }));

        return extent$$1(data).map(function (value) {
            return new Date(value);
        });
    };

    instance.accessors = function () {
        if (!arguments.length) {
            return accessors;
        }
        accessors = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.pad = function () {
        if (!arguments.length) {
            return pad;
        }
        pad = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.padUnit = function () {
        if (!arguments.length) {
            return padUnit;
        }
        padUnit = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.include = function () {
        if (!arguments.length) {
            return include;
        }
        include = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.symmetricalAbout = function () {
        if (!arguments.length) {
            return symmetricalAbout;
        }
        symmetricalAbout = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    return instance;
};

var geometricBrownianMotion = function () {
    var period = 1;
    var steps = 20;
    var mu = 0.1;
    var sigma = 0.1;
    var random = d3Random.randomNormal();

    var geometricBrownianMotion = function geometricBrownianMotion() {
        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        var timeStep = period / steps;
        var pathData = [];

        for (var i = 0; i < steps + 1; i++) {
            pathData.push(value);
            var increment = random() * Math.sqrt(timeStep) * sigma + (mu - sigma * sigma / 2) * timeStep;
            value = value * Math.exp(increment);
        }

        return pathData;
    };

    geometricBrownianMotion.period = function () {
        if (!arguments.length) {
            return period;
        }
        period = arguments.length <= 0 ? undefined : arguments[0];
        return geometricBrownianMotion;
    };

    geometricBrownianMotion.steps = function () {
        if (!arguments.length) {
            return steps;
        }
        steps = arguments.length <= 0 ? undefined : arguments[0];
        return geometricBrownianMotion;
    };

    geometricBrownianMotion.mu = function () {
        if (!arguments.length) {
            return mu;
        }
        mu = arguments.length <= 0 ? undefined : arguments[0];
        return geometricBrownianMotion;
    };

    geometricBrownianMotion.sigma = function () {
        if (!arguments.length) {
            return sigma;
        }
        sigma = arguments.length <= 0 ? undefined : arguments[0];
        return geometricBrownianMotion;
    };

    geometricBrownianMotion.random = function () {
        if (!arguments.length) {
            return random;
        }
        random = arguments.length <= 0 ? undefined : arguments[0];
        return geometricBrownianMotion;
    };

    return geometricBrownianMotion;
};

function functor$1(v) {
    return typeof v === 'function' ? v : function () {
        return v;
    };
}

var financial = function () {
    var startDate = new Date();
    var startPrice = 100;
    var interval = d3Time.timeDay;
    var intervalStep = 1;
    var unitInterval = d3Time.timeYear;
    var unitIntervalStep = 1;
    var filter = null;
    var volume = function volume() {
        var normal = d3Random.randomNormal(1, 0.1);
        return Math.ceil(normal() * 1000);
    };
    var gbm = geometricBrownianMotion();

    var getOffsetPeriod = function getOffsetPeriod(date) {
        var unitMilliseconds = unitInterval.offset(date, unitIntervalStep) - date;
        return (interval.offset(date, intervalStep) - date) / unitMilliseconds;
    };

    var calculateOHLC = function calculateOHLC(start, price) {
        var period = getOffsetPeriod(start);
        var prices = gbm.period(period)(price);
        var ohlc = {
            date: start,
            open: prices[0],
            high: Math.max.apply(Math, prices),
            low: Math.min.apply(Math, prices),
            close: prices[gbm.steps()]
        };
        ohlc.volume = volume(ohlc);
        return ohlc;
    };

    var getNextDatum = function getNextDatum(ohlc) {
        var date = void 0,
            price = void 0,
            filtered = void 0;
        do {
            date = ohlc ? interval.offset(ohlc.date, intervalStep) : new Date(startDate.getTime());
            price = ohlc ? ohlc.close : startPrice;
            ohlc = calculateOHLC(date, price);
            filtered = filter && !filter(ohlc);
        } while (filtered);
        return ohlc;
    };

    var makeStream = function makeStream() {
        var latest = void 0;
        var stream = {};
        stream.next = function () {
            var ohlc = getNextDatum(latest);
            latest = ohlc;
            return ohlc;
        };
        stream.take = function (numPoints) {
            return stream.until(function (d, i) {
                return !numPoints || numPoints < 0 || i === numPoints;
            });
        };
        stream.until = function (comparison) {
            var data = [];
            var index = 0;
            var ohlc = getNextDatum(latest);
            var compared = comparison && !comparison(ohlc, index);
            while (compared) {
                data.push(ohlc);
                latest = ohlc;
                ohlc = getNextDatum(latest);
                index += 1;
                compared = comparison && !comparison(ohlc, index);
            }
            return data;
        };
        return stream;
    };

    var financial = function financial(numPoints) {
        return makeStream().take(numPoints);
    };
    financial.stream = makeStream;
    financial[Symbol.iterator] = function () {
        var stream = makeStream();
        return {
            next: function next() {
                return {
                    value: stream.next(),
                    done: false
                };
            }
        };
    };

    financial.startDate = function () {
        if (!arguments.length) {
            return startDate;
        }
        startDate = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.startPrice = function () {
        if (!arguments.length) {
            return startPrice;
        }
        startPrice = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.interval = function () {
        if (!arguments.length) {
            return interval;
        }
        interval = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.intervalStep = function () {
        if (!arguments.length) {
            return intervalStep;
        }
        intervalStep = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.unitInterval = function () {
        if (!arguments.length) {
            return unitInterval;
        }
        unitInterval = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.unitIntervalStep = function () {
        if (!arguments.length) {
            return unitIntervalStep;
        }
        unitIntervalStep = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.filter = function () {
        if (!arguments.length) {
            return filter;
        }
        filter = arguments.length <= 0 ? undefined : arguments[0];
        return financial;
    };
    financial.volume = function () {
        if (!arguments.length) {
            return volume;
        }
        volume = functor$1(arguments.length <= 0 ? undefined : arguments[0]);
        return financial;
    };

    rebindAll(financial, gbm);

    return financial;
};

var skipWeekends$1 = function (datum) {
    var day = datum.date.getDay();
    return !(day === 0 || day === 6);
};

// https://docs.gdax.com/#market-data
var gdax = function () {

    var product = 'BTC-USD';
    var start = null;
    var end = null;
    var granularity = null;

    var gdax = function gdax() {
        var params = [];
        if (start != null) {
            params.push('start=' + start.toISOString());
        }
        if (end != null) {
            params.push('end=' + end.toISOString());
        }
        if (granularity != null) {
            params.push('granularity=' + granularity);
        }
        var url = 'https://api.gdax.com/products/' + product + '/candles?' + params.join('&');
        return d3Fetch.json(url).then(function (data) {
            return data.map(function (d) {
                return {
                    date: new Date(d[0] * 1000),
                    open: d[3],
                    high: d[2],
                    low: d[1],
                    close: d[4],
                    volume: d[5]
                };
            });
        });
    };

    gdax.product = function (x) {
        if (!arguments.length) {
            return product;
        }
        product = x;
        return gdax;
    };
    gdax.start = function (x) {
        if (!arguments.length) {
            return start;
        }
        start = x;
        return gdax;
    };
    gdax.end = function (x) {
        if (!arguments.length) {
            return end;
        }
        end = x;
        return gdax;
    };
    gdax.granularity = function (x) {
        if (!arguments.length) {
            return granularity;
        }
        granularity = x;
        return gdax;
    };

    return gdax;
};

//  https://www.quandl.com/docs/api#datasets
var quandl = function () {

    function defaultColumnNameMap(colName) {
        return colName[0].toLowerCase() + colName.substr(1);
    }

    var database = 'YAHOO';
    var dataset = 'GOOG';
    var apiKey = null;
    var start = null;
    var end = null;
    var rows = null;
    var descending = false;
    var collapse = null;
    var columnNameMap = defaultColumnNameMap;

    var quandl = function quandl() {
        var params = [];
        if (apiKey != null) {
            params.push('api_key=' + apiKey);
        }
        if (start != null) {
            params.push('start_date=' + start.toISOString().substring(0, 10));
        }
        if (end != null) {
            params.push('end_date=' + end.toISOString().substring(0, 10));
        }
        if (rows != null) {
            params.push('rows=' + rows);
        }
        if (!descending) {
            params.push('order=asc');
        }
        if (collapse != null) {
            params.push('collapse=' + collapse);
        }

        var url = 'https://www.quandl.com/api/v3/datasets/' + database + '/' + dataset + '/data.json?' + params.join('&');

        return d3Fetch.json(url).then(function (data) {
            var datasetData = data.dataset_data;

            var nameMapping = columnNameMap || function (n) {
                return n;
            };
            var colNames = datasetData.column_names.map(function (n, i) {
                return [i, nameMapping(n)];
            }).filter(function (v) {
                return v[1];
            });

            return datasetData.data.map(function (d) {
                var output = {};
                colNames.forEach(function (v) {
                    output[v[1]] = v[0] === 0 ? new Date(d[v[0]]) : d[v[0]];
                });
                return output;
            });
        });
    };

    // Unique Database Code (e.g. WIKI)
    quandl.database = function (x) {
        if (!arguments.length) {
            return database;
        }
        database = x;
        return quandl;
    };
    // Unique Dataset Code (e.g. AAPL)
    quandl.dataset = function (x) {
        if (!arguments.length) {
            return dataset;
        }
        dataset = x;
        return quandl;
    };
    // Set To Use API Key In Request (needed for premium set or high frequency requests)
    quandl.apiKey = function (x) {
        if (!arguments.length) {
            return apiKey;
        }
        apiKey = x;
        return quandl;
    };
    // Start Date of Data Series
    quandl.start = function (x) {
        if (!arguments.length) {
            return start;
        }
        start = x;
        return quandl;
    };
    // End Date of Data Series
    quandl.end = function (x) {
        if (!arguments.length) {
            return end;
        }
        end = x;
        return quandl;
    };
    // Limit Number of Rows
    quandl.rows = function (x) {
        if (!arguments.length) {
            return rows;
        }
        rows = x;
        return quandl;
    };
    // Return Results In Descending Order (true) or Ascending (false)
    quandl.descending = function (x) {
        if (!arguments.length) {
            return descending;
        }
        descending = x;
        return quandl;
    };
    // Periodicity of Data (daily | weekly | monthly | quarterly | annual)
    quandl.collapse = function (x) {
        if (!arguments.length) {
            return collapse;
        }
        collapse = x;
        return quandl;
    };
    // Function Used to Normalise the Quandl Column Name To Field Name, Return Null To Skip Field
    quandl.columnNameMap = function (x) {
        if (!arguments.length) {
            return columnNameMap;
        }
        columnNameMap = x;
        return quandl;
    };
    // Expose default column name map
    quandl.defaultColumnNameMap = defaultColumnNameMap;

    return quandl;
};

var bucket = function () {

    var bucketSize = 10;

    var bucket = function bucket(data) {
        return bucketSize <= 1 ? data.map(function (d) {
            return [d];
        }) : d3Array.range(0, Math.ceil(data.length / bucketSize)).map(function (i) {
            return data.slice(i * bucketSize, (i + 1) * bucketSize);
        });
    };

    bucket.bucketSize = function (x) {
        if (!arguments.length) {
            return bucketSize;
        }

        bucketSize = x;
        return bucket;
    };

    return bucket;
};

var largestTriangleOneBucket = function () {

    var dataBucketer = bucket();
    var x = function x(d) {
        return d;
    };
    var y = function y(d) {
        return d;
    };

    var largestTriangleOneBucket = function largestTriangleOneBucket(data) {

        if (dataBucketer.bucketSize() >= data.length) {
            return data;
        }

        var pointAreas = calculateAreaOfPoints(data);
        var pointAreaBuckets = dataBucketer(pointAreas);

        var buckets = dataBucketer(data.slice(1, data.length - 1));

        var subsampledData = buckets.map(function (thisBucket, i) {

            var pointAreaBucket = pointAreaBuckets[i];
            var maxArea = d3Array.max(pointAreaBucket);
            var currentMaxIndex = pointAreaBucket.indexOf(maxArea);

            return thisBucket[currentMaxIndex];
        });

        // First and last data points are their own buckets.
        return [].concat([data[0]], subsampledData, [data[data.length - 1]]);
    };

    function calculateAreaOfPoints(data) {

        var xyData = data.map(function (point) {
            return [x(point), y(point)];
        });

        var pointAreas = d3Array.range(1, xyData.length - 1).map(function (i) {
            var lastPoint = xyData[i - 1];
            var thisPoint = xyData[i];
            var nextPoint = xyData[i + 1];

            return 0.5 * Math.abs((lastPoint[0] - nextPoint[0]) * (thisPoint[1] - lastPoint[1]) - (lastPoint[0] - thisPoint[0]) * (nextPoint[1] - lastPoint[1]));
        });

        return pointAreas;
    }

    rebind(largestTriangleOneBucket, dataBucketer, 'bucketSize');

    largestTriangleOneBucket.x = function (d) {
        if (!arguments.length) {
            return x;
        }

        x = d;

        return largestTriangleOneBucket;
    };

    largestTriangleOneBucket.y = function (d) {
        if (!arguments.length) {
            return y;
        }

        y = d;

        return largestTriangleOneBucket;
    };

    return largestTriangleOneBucket;
};

var largestTriangleThreeBucket = function () {

    var x = function x(d) {
        return d;
    };
    var y = function y(d) {
        return d;
    };
    var dataBucketer = bucket();

    var largestTriangleThreeBucket = function largestTriangleThreeBucket(data) {

        if (dataBucketer.bucketSize() >= data.length) {
            return data;
        }

        var buckets = dataBucketer(data.slice(1, data.length - 1));
        var firstBucket = data[0];
        var lastBucket = data[data.length - 1];

        // Keep track of the last selected bucket info and all buckets
        // (for the next bucket average)
        var allBuckets = [].concat([firstBucket], buckets, [lastBucket]);

        var lastSelectedX = x(firstBucket);
        var lastSelectedY = y(firstBucket);

        var subsampledData = buckets.map(function (thisBucket, i) {

            var nextAvgX = d3Array.mean(allBuckets[i + 1], x);
            var nextAvgY = d3Array.mean(allBuckets[i + 1], y);

            var xyData = thisBucket.map(function (item) {
                return [x(item), y(item)];
            });

            var areas = xyData.map(function (item) {
                return 0.5 * Math.abs((lastSelectedX - nextAvgX) * (item[1] - lastSelectedY) - (lastSelectedX - item[0]) * (nextAvgY - lastSelectedY));
            });

            var highestIndex = areas.indexOf(d3Array.max(areas));
            var highestXY = xyData[highestIndex];

            lastSelectedX = highestXY[0];
            lastSelectedY = highestXY[1];

            return thisBucket[highestIndex];
        });

        // First and last data points are their own buckets.
        return [].concat([data[0]], subsampledData, [data[data.length - 1]]);
    };

    rebind(largestTriangleThreeBucket, dataBucketer, 'bucketSize');

    largestTriangleThreeBucket.x = function (d) {
        if (!arguments.length) {
            return x;
        }

        x = d;

        return largestTriangleThreeBucket;
    };

    largestTriangleThreeBucket.y = function (d) {
        if (!arguments.length) {
            return y;
        }

        y = d;

        return largestTriangleThreeBucket;
    };

    return largestTriangleThreeBucket;
};

var modeMedian = function () {

    var dataBucketer = bucket();
    var value = function value(d) {
        return d;
    };

    var modeMedian = function modeMedian(data) {

        if (dataBucketer.bucketSize() > data.length) {
            return data;
        }

        var minMax = d3Array.extent(data, value);
        var buckets = dataBucketer(data.slice(1, data.length - 1));

        var subsampledData = buckets.map(function (thisBucket, i) {

            var frequencies = {};
            var mostFrequent;
            var mostFrequentIndex;
            var singleMostFrequent = true;

            var values = thisBucket.map(value);

            var globalMinMax = values.filter(function (value) {
                return value === minMax[0] || value === minMax[1];
            }).map(function (value) {
                return values.indexOf(value);
            })[0];

            if (globalMinMax !== undefined) {
                return thisBucket[globalMinMax];
            }

            values.forEach(function (item, i) {
                if (frequencies[item] === undefined) {
                    frequencies[item] = 0;
                }
                frequencies[item]++;

                if (frequencies[item] > frequencies[mostFrequent] || mostFrequent === undefined) {
                    mostFrequent = item;
                    mostFrequentIndex = i;
                    singleMostFrequent = true;
                } else if (frequencies[item] === frequencies[mostFrequent]) {
                    singleMostFrequent = false;
                }
            });

            if (singleMostFrequent) {
                return thisBucket[mostFrequentIndex];
            } else {
                return thisBucket[Math.floor(thisBucket.length / 2)];
            }
        });

        // First and last data points are their own buckets.
        return [].concat([data[0]], subsampledData, [data[data.length - 1]]);
    };

    rebind(modeMedian, dataBucketer, 'bucketSize');

    modeMedian.value = function (x) {
        if (!arguments.length) {
            return value;
        }

        value = x;

        return modeMedian;
    };

    return modeMedian;
};

var functor$2 = (function (v) {
  return typeof v === 'function' ? v : function () {
    return v;
  };
});

// Renders an OHLC as an SVG path based on the given array of datapoints. Each
// OHLC has a fixed width, whilst the x, open, high, low and close positions are
// obtained from each point via the supplied accessor functions.
var shapeOhlc = (function () {

    var context = null;
    var x = function x(d) {
        return d.date;
    };
    var open = function open(d) {
        return d.open;
    };
    var high = function high(d) {
        return d.high;
    };
    var low = function low(d) {
        return d.low;
    };
    var close = function close(d) {
        return d.close;
    };
    var orient = 'vertical';
    var width = functor$2(3);

    var ohlc = function ohlc(data) {

        var drawingContext = context || d3Path.path();

        data.forEach(function (d, i) {
            var xValue = x(d, i);
            var yOpen = open(d, i);
            var yHigh = high(d, i);
            var yLow = low(d, i);
            var yClose = close(d, i);
            var halfWidth = width(d, i) / 2;

            if (orient === 'vertical') {
                drawingContext.moveTo(xValue, yLow);
                drawingContext.lineTo(xValue, yHigh);

                drawingContext.moveTo(xValue, yOpen);
                drawingContext.lineTo(xValue - halfWidth, yOpen);
                drawingContext.moveTo(xValue, yClose);
                drawingContext.lineTo(xValue + halfWidth, yClose);
            } else {
                drawingContext.moveTo(yLow, xValue);
                drawingContext.lineTo(yHigh, xValue);

                drawingContext.moveTo(yOpen, xValue);
                drawingContext.lineTo(yOpen, xValue + halfWidth);
                drawingContext.moveTo(yClose, xValue);
                drawingContext.lineTo(yClose, xValue - halfWidth);
            }
        });

        return context ? null : drawingContext.toString();
    };

    ohlc.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return ohlc;
    };
    ohlc.x = function () {
        if (!arguments.length) {
            return x;
        }
        x = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.open = function () {
        if (!arguments.length) {
            return open;
        }
        open = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.high = function () {
        if (!arguments.length) {
            return high;
        }
        high = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.low = function () {
        if (!arguments.length) {
            return low;
        }
        low = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.close = function () {
        if (!arguments.length) {
            return close;
        }
        close = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.width = function () {
        if (!arguments.length) {
            return width;
        }
        width = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return ohlc;
    };
    ohlc.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return ohlc;
    };

    return ohlc;
});

// Renders a bar series as an SVG path based on the given array of datapoints. Each
// bar has a fixed width, whilst the x, y and height are obtained from each data
// point via the supplied accessor functions.
var shapeBar = (function () {

    var context = null;
    var x = function x(d) {
        return d.x;
    };
    var y = function y(d) {
        return d.y;
    };
    var horizontalAlign = 'center';
    var verticalAlign = 'center';
    var height = function height(d) {
        return d.height;
    };
    var width = functor$2(3);

    var bar = function bar(data, index) {

        var drawingContext = context || d3Path.path();

        data.forEach(function (d, i) {
            var xValue = x.call(this, d, index || i);
            var yValue = y.call(this, d, index || i);
            var barHeight = height.call(this, d, index || i);
            var barWidth = width.call(this, d, index || i);

            var horizontalOffset = void 0;
            switch (horizontalAlign) {
                case 'left':
                    horizontalOffset = barWidth;
                    break;
                case 'right':
                    horizontalOffset = 0;
                    break;
                case 'center':
                    horizontalOffset = barWidth / 2;
                    break;
                default:
                    throw new Error('Invalid horizontal alignment ' + horizontalAlign);
            }

            var verticalOffset = void 0;
            switch (verticalAlign) {
                case 'bottom':
                    verticalOffset = -barHeight;
                    break;
                case 'top':
                    verticalOffset = 0;
                    break;
                case 'center':
                    verticalOffset = barHeight / 2;
                    break;
                default:
                    throw new Error('Invalid vertical alignment ' + verticalAlign);
            }

            drawingContext.rect(xValue - horizontalOffset, yValue - verticalOffset, barWidth, barHeight);
        }, this);

        return context ? null : drawingContext.toString();
    };

    bar.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return bar;
    };
    bar.x = function () {
        if (!arguments.length) {
            return x;
        }
        x = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return bar;
    };
    bar.y = function () {
        if (!arguments.length) {
            return y;
        }
        y = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return bar;
    };
    bar.width = function () {
        if (!arguments.length) {
            return width;
        }
        width = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return bar;
    };
    bar.horizontalAlign = function () {
        if (!arguments.length) {
            return horizontalAlign;
        }
        horizontalAlign = arguments.length <= 0 ? undefined : arguments[0];
        return bar;
    };
    bar.height = function () {
        if (!arguments.length) {
            return height;
        }
        height = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return bar;
    };
    bar.verticalAlign = function () {
        if (!arguments.length) {
            return verticalAlign;
        }
        verticalAlign = arguments.length <= 0 ? undefined : arguments[0];
        return bar;
    };

    return bar;
});

// Renders a candlestick as an SVG path based on the given array of datapoints. Each
// candlestick has a fixed width, whilst the x, open, high, low and close positions are
// obtained from each point via the supplied accessor functions.
var shapeCandlestick = (function () {

    var context = null;
    var x = function x(d) {
        return d.date;
    };
    var open = function open(d) {
        return d.open;
    };
    var high = function high(d) {
        return d.high;
    };
    var low = function low(d) {
        return d.low;
    };
    var close = function close(d) {
        return d.close;
    };
    var width = functor$2(3);

    var candlestick = function candlestick(data) {

        var drawingContext = context || d3Path.path();

        data.forEach(function (d, i) {
            var xValue = x(d, i);
            var yOpen = open(d, i);
            var yHigh = high(d, i);
            var yLow = low(d, i);
            var yClose = close(d, i);
            var barWidth = width(d, i);
            var halfBarWidth = barWidth / 2;

            // Body
            drawingContext.rect(xValue - halfBarWidth, yOpen, barWidth, yClose - yOpen);
            // High wick
            // // Move to the max price of close or open; draw the high wick
            // N.B. Math.min() is used as we're dealing with pixel values,
            // the lower the pixel value, the higher the price!
            drawingContext.moveTo(xValue, Math.min(yClose, yOpen));
            drawingContext.lineTo(xValue, yHigh);
            // Low wick
            // // Move to the min price of close or open; draw the low wick
            // N.B. Math.max() is used as we're dealing with pixel values,
            // the higher the pixel value, the lower the price!
            drawingContext.moveTo(xValue, Math.max(yClose, yOpen));
            drawingContext.lineTo(xValue, yLow);
        });

        return context ? null : drawingContext.toString();
    };

    candlestick.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return candlestick;
    };
    candlestick.x = function () {
        if (!arguments.length) {
            return x;
        }
        x = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };
    candlestick.open = function () {
        if (!arguments.length) {
            return open;
        }
        open = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };
    candlestick.high = function () {
        if (!arguments.length) {
            return high;
        }
        high = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };
    candlestick.low = function () {
        if (!arguments.length) {
            return low;
        }
        low = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };
    candlestick.close = function () {
        if (!arguments.length) {
            return close;
        }
        close = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };
    candlestick.width = function () {
        if (!arguments.length) {
            return width;
        }
        width = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return candlestick;
    };

    return candlestick;
});

// Renders a box plot series as an SVG path based on the given array of datapoints.
var shapeBoxPlot = (function () {

    var context = null;
    var value = function value(d) {
        return d.value;
    };
    var median = function median(d) {
        return d.median;
    };
    var upperQuartile = function upperQuartile(d) {
        return d.upperQuartile;
    };
    var lowerQuartile = function lowerQuartile(d) {
        return d.lowerQuartile;
    };
    var high = function high(d) {
        return d.high;
    };
    var low = function low(d) {
        return d.low;
    };
    var orient = 'vertical';
    var width = functor$2(5);
    var cap = functor$2(0.5);

    var boxPlot = function boxPlot(data) {

        var drawingContext = context || d3Path.path();

        data.forEach(function (d, i) {
            // naming convention is for vertical orientation
            var _value = value(d, i);
            var _width = width(d, i);
            var halfWidth = _width / 2;
            var capWidth = _width * cap(d, i);
            var halfCapWidth = capWidth / 2;
            var _high = high(d, i);
            var _upperQuartile = upperQuartile(d, i);
            var _median = median(d, i);
            var _lowerQuartile = lowerQuartile(d, i);
            var _low = low(d, i);
            var upperQuartileToLowerQuartile = _lowerQuartile - _upperQuartile;

            if (orient === 'vertical') {
                // Upper whisker
                drawingContext.moveTo(_value - halfCapWidth, _high);
                drawingContext.lineTo(_value + halfCapWidth, _high);
                drawingContext.moveTo(_value, _high);
                drawingContext.lineTo(_value, _upperQuartile);

                // Box
                drawingContext.rect(_value - halfWidth, _upperQuartile, _width, upperQuartileToLowerQuartile);
                drawingContext.moveTo(_value - halfWidth, _median);
                // Median line
                drawingContext.lineTo(_value + halfWidth, _median);

                // Lower whisker
                drawingContext.moveTo(_value, _lowerQuartile);
                drawingContext.lineTo(_value, _low);
                drawingContext.moveTo(_value - halfCapWidth, _low);
                drawingContext.lineTo(_value + halfCapWidth, _low);
            } else {
                // Lower whisker
                drawingContext.moveTo(_low, _value - halfCapWidth);
                drawingContext.lineTo(_low, _value + halfCapWidth);
                drawingContext.moveTo(_low, _value);
                drawingContext.lineTo(_lowerQuartile, _value);

                // Box
                drawingContext.rect(_lowerQuartile, _value - halfWidth, -upperQuartileToLowerQuartile, _width);
                drawingContext.moveTo(_median, _value - halfWidth);
                drawingContext.lineTo(_median, _value + halfWidth);

                // Upper whisker
                drawingContext.moveTo(_upperQuartile, _value);
                drawingContext.lineTo(_high, _value);
                drawingContext.moveTo(_high, _value - halfCapWidth);
                drawingContext.lineTo(_high, _value + halfCapWidth);
            }
        });

        return context ? null : drawingContext.toString();
    };

    boxPlot.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return boxPlot;
    };
    boxPlot.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.median = function () {
        if (!arguments.length) {
            return median;
        }
        median = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.upperQuartile = function () {
        if (!arguments.length) {
            return upperQuartile;
        }
        upperQuartile = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.lowerQuartile = function () {
        if (!arguments.length) {
            return lowerQuartile;
        }
        lowerQuartile = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.high = function () {
        if (!arguments.length) {
            return high;
        }
        high = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.low = function () {
        if (!arguments.length) {
            return low;
        }
        low = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.width = function () {
        if (!arguments.length) {
            return width;
        }
        width = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };
    boxPlot.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return boxPlot;
    };
    boxPlot.cap = function () {
        if (!arguments.length) {
            return cap;
        }
        cap = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return boxPlot;
    };

    return boxPlot;
});

// Renders an error bar series as an SVG path based on the given array of datapoints.
var shapeErrorBar = (function () {

    var context = null;
    var value = function value(d) {
        return d.x;
    };
    var high = function high(d) {
        return d.high;
    };
    var low = function low(d) {
        return d.low;
    };
    var orient = 'vertical';
    var width = functor$2(5);

    var errorBar = function errorBar(data) {

        var drawingContext = context || d3Path.path();

        data.forEach(function (d, i) {
            // naming convention is for vertical orientation
            var _value = value(d, i);
            var _width = width(d, i);
            var halfWidth = _width / 2;
            var _high = high(d, i);
            var _low = low(d, i);

            if (orient === 'vertical') {
                drawingContext.moveTo(_value - halfWidth, _high);
                drawingContext.lineTo(_value + halfWidth, _high);
                drawingContext.moveTo(_value, _high);
                drawingContext.lineTo(_value, _low);
                drawingContext.moveTo(_value - halfWidth, _low);
                drawingContext.lineTo(_value + halfWidth, _low);
            } else {
                drawingContext.moveTo(_low, _value - halfWidth);
                drawingContext.lineTo(_low, _value + halfWidth);
                drawingContext.moveTo(_low, _value);
                drawingContext.lineTo(_high, _value);
                drawingContext.moveTo(_high, _value - halfWidth);
                drawingContext.lineTo(_high, _value + halfWidth);
            }
        });

        return context ? null : drawingContext.toString();
    };

    errorBar.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return errorBar;
    };
    errorBar.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return errorBar;
    };
    errorBar.high = function () {
        if (!arguments.length) {
            return high;
        }
        high = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return errorBar;
    };
    errorBar.low = function () {
        if (!arguments.length) {
            return low;
        }
        low = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return errorBar;
    };
    errorBar.width = function () {
        if (!arguments.length) {
            return width;
        }
        width = functor$2(arguments.length <= 0 ? undefined : arguments[0]);
        return errorBar;
    };
    errorBar.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return errorBar;
    };

    return errorBar;
});

var functor$3 = (function (d) {
  return typeof d === 'function' ? d : function () {
    return d;
  };
});

// "Caution: avoid interpolating to or from the number zero when the interpolator is used to generate
// a string (such as with attr).
// Very small values, when stringified, may be converted to scientific notation and
// cause a temporarily invalid attribute or style property value.
// For example, the number 0.0000001 is converted to the string "1e-7".
// This is particularly noticeable when interpolating opacity values.
// To avoid scientific notation, start or end the transition at 1e-6,
// which is the smallest value that is not stringified in exponential notation."
// - https://github.com/mbostock/d3/wiki/Transitions#d3_interpolateNumber
var effectivelyZero = 1e-6;

// Wrapper around d3's selectAll/data data-join, which allows decoration of the result.
// This is achieved by appending the element to the enter selection before exposing it.
// A default transition of fade in/out is also implicitly added but can be modified.
var dataJoin = (function (element, className) {
    element = element || 'g';

    var key = function key(_, i) {
        return i;
    };
    var explicitTransition = null;

    var dataJoin = function dataJoin(container, data) {
        data = data || function (d) {
            return d;
        };

        var implicitTransition = container.selection ? container : null;
        if (implicitTransition) {
            container = container.selection();
        }

        var selected = container.selectAll(function (d, i, nodes) {
            return Array.from(nodes[i].childNodes).filter(function (node) {
                return node.nodeType === 1;
            });
        }).filter(className == null ? element : element + '.' + className);
        var update = selected.data(data, key);

        var enter = update.enter().append(element).attr('class', className);

        var exit = update.exit();

        // automatically merge in the enter selection
        update = update.merge(enter);

        // if transitions are enabled apply a default fade in/out transition
        var transition = implicitTransition || explicitTransition;
        if (transition) {
            update = update.transition(transition);
            enter.style('opacity', effectivelyZero).transition(transition).style('opacity', 1);
            exit = exit.transition(transition).style('opacity', effectivelyZero).remove();
        } else {
            exit.remove();
        }

        update.enter = function () {
            return enter;
        };
        update.exit = function () {
            return exit;
        };

        return update;
    };

    dataJoin.element = function () {
        if (!arguments.length) {
            return element;
        }
        element = arguments.length <= 0 ? undefined : arguments[0];
        return dataJoin;
    };
    dataJoin.className = function () {
        if (!arguments.length) {
            return className;
        }
        className = arguments.length <= 0 ? undefined : arguments[0];
        return dataJoin;
    };
    dataJoin.key = function () {
        if (!arguments.length) {
            return key;
        }
        key = arguments.length <= 0 ? undefined : arguments[0];
        return dataJoin;
    };
    dataJoin.transition = function () {
        if (!arguments.length) {
            return explicitTransition;
        }
        explicitTransition = arguments.length <= 0 ? undefined : arguments[0];
        return dataJoin;
    };

    return dataJoin;
});

var label = (function (layoutStrategy) {

    var decorate = function decorate() {};
    var size = function size() {
        return [0, 0];
    };
    var position = function position(d, i) {
        return [d.x, d.y];
    };
    var strategy = layoutStrategy || function (x) {
        return x;
    };
    var component = function component() {};
    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();

    var dataJoin$$1 = dataJoin('g', 'label');

    var label = function label(selection$$1) {

        selection$$1.each(function (data, index, group) {

            var g = dataJoin$$1(d3Selection.select(group[index]), data).call(component);

            // obtain the rectangular bounding boxes for each child
            var nodes = g.nodes();
            var childRects = nodes.map(function (node, i) {
                var d = d3Selection.select(node).datum();
                var pos = position(d, i, nodes);
                var childPos = [xScale(pos[0]), yScale(pos[1])];
                var childSize = size(d, i, nodes);
                return {
                    hidden: false,
                    x: childPos[0],
                    y: childPos[1],
                    width: childSize[0],
                    height: childSize[1]
                };
            });

            // apply the strategy to derive the layout. The strategy does not change the order
            // or number of label.
            var layout = strategy(childRects);

            g.attr('style', function (_, i) {
                return 'display:' + (layout[i].hidden ? 'none' : 'inherit');
            }).attr('transform', function (_, i) {
                return 'translate(' + layout[i].x + ', ' + layout[i].y + ')';
            })
            // set the layout width / height so that children can use SVG layout if required
            .attr('layout-width', function (_, i) {
                return layout[i].width;
            }).attr('layout-height', function (_, i) {
                return layout[i].height;
            }).attr('anchor-x', function (d, i, g) {
                return childRects[i].x - layout[i].x;
            }).attr('anchor-y', function (d, i, g) {
                return childRects[i].y - layout[i].y;
            });

            g.call(component);

            decorate(g, data, index);
        });
    };

    rebindAll(label, dataJoin$$1, include('key'));
    rebindAll(label, strategy);

    label.size = function () {
        if (!arguments.length) {
            return size;
        }
        size = functor$3(arguments.length <= 0 ? undefined : arguments[0]);
        return label;
    };

    label.position = function () {
        if (!arguments.length) {
            return position;
        }
        position = functor$3(arguments.length <= 0 ? undefined : arguments[0]);
        return label;
    };

    label.component = function () {
        if (!arguments.length) {
            return component;
        }
        component = arguments.length <= 0 ? undefined : arguments[0];
        return label;
    };

    label.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return label;
    };

    label.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return label;
    };

    label.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return label;
    };

    return label;
});

var textLabel = (function (layoutStrategy) {

    var padding = 2;
    var value = function value(x) {
        return x;
    };

    var textJoin = dataJoin('text');
    var rectJoin = dataJoin('rect');
    var pointJoin = dataJoin('circle');

    var textLabel = function textLabel(selection$$1) {
        selection$$1.each(function (data, index, group) {

            var node = group[index];
            var nodeSelection = d3Selection.select(node);

            var width = Number(node.getAttribute('layout-width'));
            var height = Number(node.getAttribute('layout-height'));
            var rect = rectJoin(nodeSelection, [data]);
            rect.attr('width', width).attr('height', height);

            var anchorX = Number(node.getAttribute('anchor-x'));
            var anchorY = Number(node.getAttribute('anchor-y'));
            var circle = pointJoin(nodeSelection, [data]);
            circle.attr('r', 2).attr('cx', anchorX).attr('cy', anchorY);

            var text = textJoin(nodeSelection, [data]);
            text.enter().attr('dy', '0.9em').attr('transform', 'translate(' + padding + ', ' + padding + ')');
            text.text(value);
        });
    };

    textLabel.padding = function () {
        if (!arguments.length) {
            return padding;
        }
        padding = arguments.length <= 0 ? undefined : arguments[0];
        return textLabel;
    };

    textLabel.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = functor$3(arguments.length <= 0 ? undefined : arguments[0]);
        return textLabel;
    };

    return textLabel;
});

var isIntersecting = function isIntersecting(a, b) {
    return !(a.x >= b.x + b.width || a.x + a.width <= b.x || a.y >= b.y + b.height || a.y + a.height <= b.y);
};

var intersect = (function (a, b) {
    if (isIntersecting(a, b)) {
        var left = Math.max(a.x, b.x);
        var right = Math.min(a.x + a.width, b.x + b.width);
        var top = Math.max(a.y, b.y);
        var bottom = Math.min(a.y + a.height, b.y + b.height);
        return (right - left) * (bottom - top);
    } else {
        return 0;
    }
});

// computes the area of overlap between the rectangle with the given index with the
// rectangles in the array
var collisionArea = function collisionArea(rectangles, index) {
    return d3Array.sum(rectangles.map(function (d, i) {
        return index === i ? 0 : intersect(rectangles[index], d);
    }));
};

// computes the total overlapping area of all of the rectangles in the given array

var getPlacement = function getPlacement(x, y, width, height, location) {
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        location: location
    };
};

// returns all the potential placements of the given label
var placements = (function (label) {
    var x = label.x;
    var y = label.y;
    var width = label.width;
    var height = label.height;
    return [getPlacement(x, y, width, height, 'bottom-right'), getPlacement(x - width, y, width, height, 'bottom-left'), getPlacement(x - width, y - height, width, height, 'top-left'), getPlacement(x, y - height, width, height, 'top-right'), getPlacement(x, y - height / 2, width, height, 'middle-right'), getPlacement(x - width / 2, y, width, height, 'bottom-center'), getPlacement(x - width, y - height / 2, width, height, 'middle-left'), getPlacement(x - width / 2, y - height, width, height, 'top-center')];
});

var substitute = function substitute(array, index, substitution) {
    return [].concat(toConsumableArray(array.slice(0, index)), [substitution], toConsumableArray(array.slice(index + 1)));
};

var lessThan = function lessThan(a, b) {
    return a < b;
};

// a layout takes an array of rectangles and allows their locations to be optimised.
// it is constructed using two functions, locationScore, which score the placement of and
// individual rectangle, and winningScore which takes the scores for a rectangle
// at two different locations and assigns a winningScore.
var layoutComponent = function layoutComponent() {
    var score = null;

    var winningScore = lessThan;

    var locationScore = function locationScore() {
        return 0;
    };

    var rectangles = void 0;

    var evaluatePlacement = function evaluatePlacement(placement, index) {
        return score - locationScore(rectangles[index], index, rectangles) + locationScore(placement, index, substitute(rectangles, index, placement));
    };

    var layout = function layout(placement, index) {
        if (!score) {
            score = d3Array.sum(rectangles.map(function (r, i) {
                return locationScore(r, i, rectangles);
            }));
        }

        var newScore = evaluatePlacement(placement, index);

        if (winningScore(newScore, score)) {
            return layoutComponent().locationScore(locationScore).winningScore(winningScore).score(newScore).rectangles(substitute(rectangles, index, placement));
        } else {
            return layout;
        }
    };

    layout.rectangles = function () {
        if (!arguments.length) {
            return rectangles;
        }
        rectangles = arguments.length <= 0 ? undefined : arguments[0];
        return layout;
    };
    layout.score = function () {
        if (!arguments.length) {
            return score;
        }
        score = arguments.length <= 0 ? undefined : arguments[0];
        return layout;
    };
    layout.winningScore = function () {
        if (!arguments.length) {
            return winningScore;
        }
        winningScore = arguments.length <= 0 ? undefined : arguments[0];
        return layout;
    };
    layout.locationScore = function () {
        if (!arguments.length) {
            return locationScore;
        }
        locationScore = arguments.length <= 0 ? undefined : arguments[0];
        return layout;
    };

    return layout;
};

var greedy = (function () {

    var bounds = void 0;

    var containerPenalty = function containerPenalty(rectangle) {
        return bounds ? rectangle.width * rectangle.height - intersect(rectangle, bounds) : 0;
    };

    var penaltyForRectangle = function penaltyForRectangle(rectangle, index, rectangles) {
        return collisionArea(rectangles, index) + containerPenalty(rectangle);
    };

    var strategy = function strategy(data) {
        var rectangles = layoutComponent().locationScore(penaltyForRectangle).rectangles(data);

        data.forEach(function (rectangle, index) {
            placements(rectangle).forEach(function (placement, placementIndex) {
                rectangles = rectangles(placement, index);
            });
        });
        return rectangles.rectangles();
    };

    strategy.bounds = function () {
        if (!arguments.length) {
            return bounds;
        }
        bounds = arguments.length <= 0 ? undefined : arguments[0];
        return strategy;
    };

    return strategy;
});

var randomItem = function randomItem(array) {
    return array[randomIndex(array)];
};

var randomIndex = function randomIndex(array) {
    return Math.floor(Math.random() * array.length);
};

var annealing = (function () {

    var temperature = 1000;
    var cooling = 1;
    var bounds = void 0;

    var orientationPenalty = function orientationPenalty(rectangle) {
        switch (rectangle.location) {
            case 'bottom-right':
                return 0;
            case 'middle-right':
            case 'bottom-center':
                return rectangle.width * rectangle.height / 8;
        }
        return rectangle.width * rectangle.height / 4;
    };

    var containerPenalty = function containerPenalty(rectangle) {
        return bounds ? rectangle.width * rectangle.height - intersect(rectangle, bounds) : 0;
    };

    var penaltyForRectangle = function penaltyForRectangle(rectangle, index, rectangles) {
        return collisionArea(rectangles, index) + containerPenalty(rectangle) + orientationPenalty(rectangle);
    };

    var strategy = function strategy(data) {
        var currentTemperature = temperature;

        // use annealing to allow a new score to be picked even if it is worse than the old
        var winningScore = function winningScore(newScore, oldScore) {
            return Math.exp((oldScore - newScore) / currentTemperature) > Math.random();
        };

        var rectangles = layoutComponent().locationScore(penaltyForRectangle).winningScore(winningScore).rectangles(data);

        while (currentTemperature > 0) {
            var index = randomIndex(data);
            var randomNewPlacement = randomItem(placements(data[index]));
            rectangles = rectangles(randomNewPlacement, index);
            currentTemperature -= cooling;
        }
        return rectangles.rectangles();
    };

    strategy.temperature = function () {
        if (!arguments.length) {
            return temperature;
        }
        temperature = arguments.length <= 0 ? undefined : arguments[0];
        return strategy;
    };

    strategy.cooling = function () {
        if (!arguments.length) {
            return cooling;
        }
        cooling = arguments.length <= 0 ? undefined : arguments[0];
        return strategy;
    };

    strategy.bounds = function () {
        if (!arguments.length) {
            return bounds;
        }
        bounds = arguments.length <= 0 ? undefined : arguments[0];
        return strategy;
    };

    return strategy;
});

var scanForObject = function scanForObject(array, comparator) {
    return array[d3Array.scan(array, comparator)];
};

var removeOverlaps = (function (adaptedStrategy) {

    adaptedStrategy = adaptedStrategy || function (x) {
        return x;
    };

    var removeOverlaps = function removeOverlaps(layout) {
        layout = adaptedStrategy(layout);

        var _loop = function _loop() {
            // find the collision area for all overlapping rectangles, hiding the one
            // with the greatest overlap
            var visible = layout.filter(function (d) {
                return !d.hidden;
            });
            var collisions = visible.map(function (d, i) {
                return [d, collisionArea(visible, i)];
            });
            var maximumCollision = scanForObject(collisions, function (a, b) {
                return b[1] - a[1];
            });
            if (maximumCollision[1] > 0) {
                maximumCollision[0].hidden = true;
            } else {
                return 'break';
            }
        };

        while (true) {
            var _ret = _loop();

            if (_ret === 'break') break;
        }
        return layout;
    };

    rebindAll(removeOverlaps, adaptedStrategy);

    return removeOverlaps;
});

var boundingBox = (function () {

    var bounds = [0, 0];

    var strategy = function strategy(data) {
        return data.map(function (d, i) {
            var tx = d.x;
            var ty = d.y;
            if (tx + d.width > bounds[0]) {
                tx -= d.width;
            }

            if (ty + d.height > bounds[1]) {
                ty -= d.height;
            }
            return { height: d.height, width: d.width, x: tx, y: ty };
        });
    };

    strategy.bounds = function () {
        if (!arguments.length) {
            return bounds;
        }
        bounds = arguments.length <= 0 ? undefined : arguments[0];
        return strategy;
    };

    return strategy;
});

var functor$4 = (function (d) {
  return typeof d === 'function' ? d : function () {
    return d;
  };
});

// Checks that passes properties are 'defined', meaning that calling them with (d, i) returns non null values
function defined$1() {
    var outerArguments = arguments;
    return function (d, i) {
        for (var c = 0, j = outerArguments.length; c < j; c++) {
            if (outerArguments[c](d, i) == null) {
                return false;
            }
        }
        return true;
    };
}

// determines the offset required along the cross scale based
// on the series alignment
var alignOffset = (function (align, width) {
    switch (align) {
        case 'left':
            return width / 2;
        case 'right':
            return -width / 2;
        default:
            return 0;
    }
});

var createBase = (function (initialValues) {

    var env = Object.assign({}, initialValues);
    var base = function base() {};

    Object.keys(env).forEach(function (key) {
        base[key] = function () {
            if (!arguments.length) {
                return env[key];
            }
            env[key] = arguments.length <= 0 ? undefined : arguments[0];
            return base;
        };
    });

    return base;
});

var xyBase = (function () {

    var baseValue = function baseValue() {
        return 0;
    };
    var crossValue = function crossValue(d) {
        return d.x;
    };
    var mainValue = function mainValue(d) {
        return d.y;
    };
    var align = 'center';
    var bandwidth = function bandwidth() {
        return 5;
    };
    var orient = 'vertical';

    var base = createBase({
        decorate: function decorate() {},
        defined: function defined(d, i) {
            return defined$1(baseValue, crossValue, mainValue)(d, i);
        },
        xScale: d3Scale.scaleIdentity(),
        yScale: d3Scale.scaleIdentity()
    });

    base.values = function (d, i) {
        var width = bandwidth(d, i);
        var offset = alignOffset(align, width);
        var xScale = base.xScale();
        var yScale = base.yScale();

        if (orient === 'vertical') {
            var y = yScale(mainValue(d, i), i);
            var y0 = yScale(baseValue(d, i), i);
            var x = xScale(crossValue(d, i), i) + offset;
            return {
                d: d,
                x: x,
                y: y,
                y0: y0,
                width: width,
                height: y - y0,
                origin: [x, y],
                baseOrigin: [x, y0],
                transposedX: x,
                transposedY: y
            };
        } else {
            var _y = xScale(mainValue(d, i), i);
            var _y2 = xScale(baseValue(d, i), i);
            var _x = yScale(crossValue(d, i), i) + offset;
            return {
                d: d,
                x: _x,
                y: _y,
                y0: _y2,
                width: width,
                height: _y - _y2,
                origin: [_y, _x],
                baseOrigin: [_y2, _x],
                transposedX: _y,
                transposedY: _x
            };
        }
    };

    base.baseValue = function () {
        if (!arguments.length) {
            return baseValue;
        }
        baseValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.mainValue = function () {
        if (!arguments.length) {
            return mainValue;
        }
        mainValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.bandwidth = function () {
        if (!arguments.length) {
            return bandwidth;
        }
        bandwidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.align = function () {
        if (!arguments.length) {
            return align;
        }
        align = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    return base;
});

var red = '#c60';
var green = '#6c0';
var black = '#000';
var gray = '#ddd';
var darkGray = '#999';

var colors = {
    red: red,
    green: green,
    black: black,
    gray: gray,
    darkGray: darkGray
};

var seriesSvgLine = (function () {
    var base = xyBase();

    var lineData = d3Shape.line().defined(base.defined).x(function (d, i) {
        return base.values(d, i).transposedX;
    }).y(function (d, i) {
        return base.values(d, i).transposedY;
    });

    var join = dataJoin('path', 'line');

    var line$$1 = function line$$1(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {
            var path$$1 = join(d3Selection.select(group[index]), [data]);

            path$$1.enter().attr('fill', 'none').attr('stroke', colors.black);

            path$$1.attr('d', lineData);

            base.decorate()(path$$1, data, index);
        });
    };

    rebindAll(line$$1, base, exclude('baseValue', 'bandwidth', 'align'));
    rebind(line$$1, join, 'key');
    rebind(line$$1, lineData, 'curve');

    return line$$1;
});

var line$1 = (function () {
    var base = xyBase();

    var lineData = d3Shape.line().defined(base.defined).x(function (d, i) {
        return base.values(d, i).transposedX;
    }).y(function (d, i) {
        return base.values(d, i).transposedY;
    });

    var line$$1 = function line$$1(data) {
        var context = lineData.context();

        context.beginPath();
        lineData(data);
        context.strokeStyle = colors.black;

        base.decorate()(context, data);

        context.stroke();
        context.closePath();
    };

    rebindAll(line$$1, base, exclude('baseValue', 'bandwidth', 'align'));
    rebind(line$$1, lineData, 'curve', 'context');

    return line$$1;
});

var seriesSvgPoint = (function () {
    var symbol$$1 = d3Shape.symbol();

    var base = xyBase();

    var join = dataJoin('g', 'point');

    var containerTransform = function containerTransform(origin) {
        return 'translate(' + origin[0] + ', ' + origin[1] + ')';
    };

    var point = function point(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {

            var filteredData = data.filter(base.defined);

            var g = join(d3Selection.select(group[index]), filteredData);
            g.enter().attr('transform', function (d, i) {
                return containerTransform(base.values(d, i).origin);
            }).attr('fill', colors.gray).attr('stroke', colors.black).append('path');

            g.attr('transform', function (d, i) {
                return containerTransform(base.values(d, i).origin);
            }).select('path').attr('d', symbol$$1);

            base.decorate()(g, data, index);
        });
    };

    rebindAll(point, base, exclude('baseValue', 'bandwidth', 'align'));
    rebind(point, join, 'key');
    rebind(point, symbol$$1, 'type', 'size');

    return point;
});

var point = (function () {

    var symbol$$1 = d3Shape.symbol();

    var base = xyBase();

    var point = function point(data) {
        var filteredData = data.filter(base.defined);
        var context = symbol$$1.context();

        filteredData.forEach(function (d, i) {
            context.save();

            var values = base.values(d, i);
            context.translate(values.origin[0], values.origin[1]);
            context.beginPath();

            symbol$$1(data);

            context.strokeStyle = colors.black;
            context.fillStyle = colors.gray;

            base.decorate()(context, d, i);

            context.stroke();
            context.fill();
            context.closePath();

            context.restore();
        });
    };

    rebindAll(point, base, exclude('baseValue', 'bandwidth', 'align'));
    rebind(point, symbol$$1, 'size', 'type', 'context');

    return point;
});

var bar = (function () {

    var pathGenerator = shapeBar().x(0).y(0);

    var base = xyBase();

    var join = dataJoin('g', 'bar');

    var valueAxisDimension = function valueAxisDimension(generator) {
        return base.orient() === 'vertical' ? generator.height : generator.width;
    };

    var crossAxisDimension = function crossAxisDimension(generator) {
        return base.orient() === 'vertical' ? generator.width : generator.height;
    };

    var translation = function translation(origin) {
        return 'translate(' + origin[0] + ', ' + origin[1] + ')';
    };

    var bar = function bar(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {

            var orient = base.orient();
            if (orient !== 'vertical' && orient !== 'horizontal') {
                throw new Error('The bar series does not support an orientation of ' + orient);
            }

            var filteredData = data.filter(base.defined);
            var projectedData = filteredData.map(base.values);

            pathGenerator.width(0).height(0);

            if (base.orient() === 'vertical') {
                pathGenerator.verticalAlign('top');
                pathGenerator.horizontalAlign('center');
            } else {
                pathGenerator.horizontalAlign('right');
                pathGenerator.verticalAlign('center');
            }

            var g = join(d3Selection.select(group[index]), filteredData);

            // within the enter selection the pathGenerator creates a zero
            // height bar on the baseline. As a result, when used with a transition the bar grows
            // from y0 to y1 (y)
            g.enter().attr('transform', function (_, i) {
                return translation(projectedData[i].baseOrigin);
            }).attr('class', 'bar ' + base.orient()).attr('fill', colors.darkGray).append('path').attr('d', function (d, i) {
                crossAxisDimension(pathGenerator)(projectedData[i].width);
                return pathGenerator([d]);
            });

            // the container translation sets the origin to the 'tip'
            // of each bar as per the decorate pattern
            g.attr('transform', function (_, i) {
                return translation(projectedData[i].origin);
            }).select('path').attr('d', function (d, i) {
                crossAxisDimension(pathGenerator)(projectedData[i].width);
                valueAxisDimension(pathGenerator)(-projectedData[i].height);
                return pathGenerator([d]);
            });

            base.decorate()(g, filteredData, index);
        });
    };

    rebindAll(bar, base);
    rebind(bar, join, 'key');

    return bar;
});

var bar$1 = (function () {
    var base = xyBase();

    var pathGenerator = shapeBar().x(0).y(0);

    var valueAxisDimension = function valueAxisDimension(generator) {
        return base.orient() === 'vertical' ? generator.height : generator.width;
    };

    var crossAxisDimension = function crossAxisDimension(generator) {
        return base.orient() === 'vertical' ? generator.width : generator.height;
    };

    var bar = function bar(data) {
        var context = pathGenerator.context();

        var filteredData = data.filter(base.defined);
        var projectedData = filteredData.map(base.values);

        if (base.orient() === 'vertical') {
            pathGenerator.verticalAlign('top');
            pathGenerator.horizontalAlign('center');
        } else {
            pathGenerator.horizontalAlign('right');
            pathGenerator.verticalAlign('center');
        }

        projectedData.forEach(function (datum, i) {
            context.save();
            context.beginPath();
            context.translate(datum.origin[0], datum.origin[1]);

            valueAxisDimension(pathGenerator)(-datum.height);
            crossAxisDimension(pathGenerator)(datum.width);
            pathGenerator([datum]);

            context.fillStyle = colors.darkGray;
            base.decorate()(context, datum.d, i);
            context.fill();

            context.closePath();
            context.restore();
        });
    };

    rebindAll(bar, base);
    rebind(bar, pathGenerator, 'context');

    return bar;
});

var errorBarBase = (function () {

    var highValue = function highValue(d) {
        return d.high;
    };
    var lowValue = function lowValue(d) {
        return d.low;
    };
    var crossValue = function crossValue(d) {
        return d.cross;
    };
    var orient = 'vertical';
    var align = 'center';
    var bandwidth = function bandwidth() {
        return 5;
    };

    var base = createBase({
        decorate: function decorate() {},
        defined: function defined(d, i) {
            return defined$1(lowValue, highValue, crossValue)(d, i);
        },
        xScale: d3Scale.scaleIdentity(),
        yScale: d3Scale.scaleIdentity()
    });

    base.values = function (d, i) {
        var width = bandwidth(d, i);
        var offset = alignOffset(align, width);
        var xScale = base.xScale();
        var yScale = base.yScale();

        if (orient === 'vertical') {
            var y = yScale(highValue(d, i));
            return {
                origin: [xScale(crossValue(d, i)) + offset, y],
                high: 0,
                low: yScale(lowValue(d, i)) - y,
                width: width
            };
        } else {
            var x = xScale(lowValue(d, i));
            return {
                origin: [x, yScale(crossValue(d, i)) + offset],
                high: xScale(highValue(d, i)) - x,
                low: 0,
                width: width
            };
        }
    };

    base.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.bandwidth = function () {
        if (!arguments.length) {
            return bandwidth;
        }
        bandwidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.align = function () {
        if (!arguments.length) {
            return align;
        }
        align = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    return base;
});

var errorBar = (function () {

    var base = errorBarBase();

    var join = dataJoin('g', 'error-bar');

    var pathGenerator = shapeErrorBar().value(0);

    var propagateTransition = function propagateTransition(maybeTransition) {
        return function (selection$$1) {
            return maybeTransition.selection ? selection$$1.transition(maybeTransition) : selection$$1;
        };
    };

    var containerTranslation = function containerTranslation(values) {
        return 'translate(' + values.origin[0] + ', ' + values.origin[1] + ')';
    };

    var errorBar = function errorBar(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        var transitionPropagator = propagateTransition(selection$$1);

        selection$$1.each(function (data, index, group) {

            var filteredData = data.filter(base.defined);
            var projectedData = filteredData.map(base.values);
            var g = join(d3Selection.select(group[index]), filteredData);

            g.enter().attr('stroke', colors.black).attr('fill', colors.gray).attr('transform', function (d, i) {
                return containerTranslation(base.values(d, i)) + ' scale(1e-6, 1)';
            }).append('path');

            pathGenerator.orient(base.orient());

            g.each(function (d, i, g) {
                var values = projectedData[i];
                pathGenerator.high(values.high).low(values.low).width(values.width);

                transitionPropagator(d3Selection.select(g[i])).attr('transform', containerTranslation(values) + ' scale(1)').select('path').attr('d', pathGenerator([d]));
            });

            base.decorate()(g, data, index);
        });
    };

    rebindAll(errorBar, base);
    rebind(errorBar, join, 'key');

    return errorBar;
});

var errorBar$1 = (function () {

    var base = errorBarBase();

    var pathGenerator = shapeErrorBar().value(0);

    var errorBar = function errorBar(data) {
        var filteredData = data.filter(base.defined);
        var context = pathGenerator.context();

        pathGenerator.orient(base.orient());

        filteredData.forEach(function (d, i) {
            context.save();

            var values = base.values(d, i);
            context.translate(values.origin[0], values.origin[1]);
            context.beginPath();

            pathGenerator.high(values.high).width(values.width).low(values.low)([d]);

            context.strokeStyle = colors.black;
            context.fillStyle = colors.gray;

            base.decorate()(context, d, i);

            context.stroke();
            context.fill();
            context.closePath();

            context.restore();
        });
    };

    rebindAll(errorBar, base);
    rebind(errorBar, pathGenerator, 'context');

    return errorBar;
});

var area$1 = (function () {
    var base = xyBase();

    var areaData = d3Shape.area().defined(base.defined);

    var join = dataJoin('path', 'area');

    var area$$1 = function area$$1(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {

            var projectedData = data.map(base.values);
            areaData.x(function (_, i) {
                return projectedData[i].transposedX;
            }).y(function (_, i) {
                return projectedData[i].transposedY;
            });

            var valueComponent = base.orient() === 'vertical' ? 'y' : 'x';
            areaData[valueComponent + '0'](function (_, i) {
                return projectedData[i].y0;
            });
            areaData[valueComponent + '1'](function (_, i) {
                return projectedData[i].y;
            });

            var path$$1 = join(d3Selection.select(group[index]), [data]);

            path$$1.enter().attr('fill', colors.gray);

            path$$1.attr('d', areaData);

            base.decorate()(path$$1, data, index);
        });
    };

    rebindAll(area$$1, base, exclude('bandwidth', 'align'));
    rebind(area$$1, join, 'key');
    rebind(area$$1, areaData, 'curve');

    return area$$1;
});

var area$2 = (function () {
    var base = xyBase();

    var areaData = d3Shape.area().defined(base.defined);

    var area$$1 = function area$$1(data) {
        var context = areaData.context();

        var projectedData = data.map(base.values);
        areaData.x(function (_, i) {
            return projectedData[i].transposedX;
        }).y(function (_, i) {
            return projectedData[i].transposedY;
        });

        var valueComponent = base.orient() === 'vertical' ? 'y' : 'x';
        areaData[valueComponent + '0'](function (_, i) {
            return projectedData[i].y0;
        });
        areaData[valueComponent + '1'](function (_, i) {
            return projectedData[i].y;
        });

        context.beginPath();
        areaData(data);
        context.fillStyle = colors.gray;

        base.decorate()(context, data);

        context.fill();
        context.closePath();
    };

    rebindAll(area$$1, base, exclude('bandwidth', 'align'));
    rebind(area$$1, areaData, 'curve', 'context');

    return area$$1;
});

var ohlcBase$1 = (function () {

    var base = void 0;
    var crossValue = function crossValue(d) {
        return d.date;
    };
    var openValue = function openValue(d) {
        return d.open;
    };
    var highValue = function highValue(d) {
        return d.high;
    };
    var lowValue = function lowValue(d) {
        return d.low;
    };
    var closeValue = function closeValue(d) {
        return d.close;
    };
    var bandwidth = function bandwidth() {
        return 5;
    };
    var align = 'center';
    var crossValueScaled = function crossValueScaled(d, i) {
        return base.xScale()(crossValue(d, i));
    };

    base = createBase({
        decorate: function decorate() {},
        defined: function defined(d, i) {
            return defined$1(crossValue, openValue, lowValue, highValue, closeValue)(d, i);
        },
        xScale: d3Scale.scaleIdentity(),
        yScale: d3Scale.scaleIdentity()
    });

    base.values = function (d, i) {
        var closeRaw = closeValue(d, i);
        var openRaw = openValue(d, i);
        var width = bandwidth(d, i);
        var offset = alignOffset(align, width);

        var direction = '';
        if (closeRaw > openRaw) {
            direction = 'up';
        } else if (closeRaw < openRaw) {
            direction = 'down';
        }

        return {
            cross: crossValueScaled(d, i) + offset,
            open: base.yScale()(openRaw),
            high: base.yScale()(highValue(d, i)),
            low: base.yScale()(lowValue(d, i)),
            close: base.yScale()(closeRaw),
            width: width,
            direction: direction
        };
    };

    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.openValue = function () {
        if (!arguments.length) {
            return openValue;
        }
        openValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.yValue = base.closeValue = function () {
        if (!arguments.length) {
            return closeValue;
        }
        closeValue = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.bandwidth = function () {
        if (!arguments.length) {
            return bandwidth;
        }
        bandwidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.align = function () {
        if (!arguments.length) {
            return align;
        }
        align = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    return base;
});

var ohlcBase = (function (pathGenerator, seriesName) {
    var base = ohlcBase$1();
    var join = dataJoin('g', seriesName);
    var containerTranslation = function containerTranslation(values) {
        return 'translate(' + values.cross + ', ' + values.high + ')';
    };

    var propagateTransition = function propagateTransition(maybeTransition) {
        return function (selection$$1) {
            return maybeTransition.selection ? selection$$1.transition(maybeTransition) : selection$$1;
        };
    };

    var candlestick = function candlestick(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        var transitionPropagator = propagateTransition(selection$$1);

        selection$$1.each(function (data, index, group) {

            var filteredData = data.filter(base.defined);

            var g = join(d3Selection.select(group[index]), filteredData);

            g.enter().attr('transform', function (d, i) {
                return containerTranslation(base.values(d, i)) + ' scale(1e-6, 1)';
            }).append('path');

            g.each(function (d, i, g) {

                var values = base.values(d, i);
                var color = values.direction === 'up' ? colors.green : colors.red;

                var singleCandlestick = transitionPropagator(d3Selection.select(g[i])).attr('class', seriesName + ' ' + values.direction).attr('stroke', color).attr('fill', color).attr('transform', function () {
                    return containerTranslation(values) + ' scale(1)';
                });

                pathGenerator.x(0).width(values.width).open(function () {
                    return values.open - values.high;
                }).high(0).low(function () {
                    return values.low - values.high;
                }).close(function () {
                    return values.close - values.high;
                });

                singleCandlestick.select('path').attr('d', pathGenerator([d]));
            });

            base.decorate()(g, data, index);
        });
    };

    rebind(candlestick, join, 'key');
    rebindAll(candlestick, base);

    return candlestick;
});

var candlestick = (function () {
  return ohlcBase(shapeCandlestick(), 'candlestick');
});

var ohlcBase$2 = (function (pathGenerator) {

    var base = ohlcBase$1();

    var candlestick = function candlestick(data) {
        var filteredData = data.filter(base.defined);
        var context = pathGenerator.context();

        filteredData.forEach(function (d, i) {
            context.save();

            var values = base.values(d, i);
            context.translate(values.cross, values.high);
            context.beginPath();

            pathGenerator.x(0).open(function () {
                return values.open - values.high;
            }).width(values.width).high(0).low(function () {
                return values.low - values.high;
            }).close(function () {
                return values.close - values.high;
            })([d]);

            var color = values.direction === 'up' ? colors.green : colors.red;
            context.strokeStyle = color;
            context.fillStyle = color;

            base.decorate()(context, d, i);

            context.stroke();
            context.fill();
            context.closePath();

            context.restore();
        });
    };

    rebind(candlestick, pathGenerator, 'context');
    rebindAll(candlestick, base);

    return candlestick;
});

var candlestick$1 = (function () {
  return ohlcBase$2(shapeCandlestick());
});

var boxPlotBase = (function () {

    var upperQuartileValue = function upperQuartileValue(d) {
        return d.upperQuartile;
    };
    var lowerQuartileValue = function lowerQuartileValue(d) {
        return d.lowerQuartile;
    };
    var highValue = function highValue(d) {
        return d.high;
    };
    var lowValue = function lowValue(d) {
        return d.low;
    };
    var crossValue = function crossValue(d) {
        return d.value;
    };
    var medianValue = function medianValue(d) {
        return d.median;
    };
    var orient = 'vertical';
    var align = 'center';
    var bandwidth = function bandwidth() {
        return 5;
    };

    var base = createBase({
        decorate: function decorate() {},
        defined: function defined(d, i) {
            return defined$1(lowValue, highValue, lowerQuartileValue, upperQuartileValue, crossValue, medianValue)(d, i);
        },
        xScale: d3Scale.scaleIdentity(),
        yScale: d3Scale.scaleIdentity()
    });

    base.values = function (d, i) {
        var width = bandwidth(d, i);
        var offset = alignOffset(align, width);
        var xScale = base.xScale();
        var yScale = base.yScale();

        if (orient === 'vertical') {
            var y = yScale(highValue(d, i));
            return {
                origin: [xScale(crossValue(d, i)) + offset, y],
                high: 0,
                upperQuartile: yScale(upperQuartileValue(d, i)) - y,
                median: yScale(medianValue(d, i)) - y,
                lowerQuartile: yScale(lowerQuartileValue(d, i)) - y,
                low: yScale(lowValue(d, i)) - y,
                width: width
            };
        } else {
            var x = xScale(lowValue(d, i));
            return {
                origin: [x, yScale(crossValue(d, i)) + offset],
                high: xScale(highValue(d, i)) - x,
                upperQuartile: xScale(upperQuartileValue(d, i)) - x,
                median: xScale(medianValue(d, i)) - x,
                lowerQuartile: xScale(lowerQuartileValue(d, i)) - x,
                low: 0,
                width: width
            };
        }
    };

    base.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };
    base.lowerQuartileValue = function () {
        if (!arguments.length) {
            return lowerQuartileValue;
        }
        lowerQuartileValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.upperQuartileValue = function () {
        if (!arguments.length) {
            return upperQuartileValue;
        }
        upperQuartileValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.lowValue = function () {
        if (!arguments.length) {
            return lowValue;
        }
        lowValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.highValue = function () {
        if (!arguments.length) {
            return highValue;
        }
        highValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.crossValue = function () {
        if (!arguments.length) {
            return crossValue;
        }
        crossValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.medianValue = function () {
        if (!arguments.length) {
            return medianValue;
        }
        medianValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.bandwidth = function () {
        if (!arguments.length) {
            return bandwidth;
        }
        bandwidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return base;
    };
    base.align = function () {
        if (!arguments.length) {
            return align;
        }
        align = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    return base;
});

var boxPlot = (function () {

    var base = boxPlotBase();

    var join = dataJoin('g', 'box-plot');

    var pathGenerator = shapeBoxPlot().value(0);

    var propagateTransition = function propagateTransition(maybeTransition) {
        return function (selection$$1) {
            return maybeTransition.selection ? selection$$1.transition(maybeTransition) : selection$$1;
        };
    };

    var containerTranslation = function containerTranslation(values) {
        return 'translate(' + values.origin[0] + ', ' + values.origin[1] + ')';
    };

    var boxPlot = function boxPlot(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        var transitionPropagator = propagateTransition(selection$$1);

        selection$$1.each(function (data, index, group) {

            var filteredData = data.filter(base.defined);
            var g = join(d3Selection.select(group[index]), filteredData);

            g.enter().attr('stroke', colors.black).attr('fill', colors.gray).attr('transform', function (d, i) {
                return containerTranslation(base.values(d, i)) + ' scale(1e-6, 1)';
            }).append('path');

            pathGenerator.orient(base.orient());

            g.each(function (d, i, g) {
                var values = base.values(d, i);
                pathGenerator.median(values.median).upperQuartile(values.upperQuartile).lowerQuartile(values.lowerQuartile).width(values.width).high(values.high).low(values.low);

                transitionPropagator(d3Selection.select(g[i])).attr('transform', containerTranslation(values)).select('path').attr('d', pathGenerator([d]));
            });

            base.decorate()(g, data, index);
        });
    };

    rebindAll(boxPlot, base);
    rebind(boxPlot, join, 'key');
    rebind(boxPlot, pathGenerator, 'cap');

    return boxPlot;
});

var boxPlot$1 = (function () {

    var base = boxPlotBase();

    var pathGenerator = shapeBoxPlot().value(0);

    var boxPlot = function boxPlot(data) {
        var filteredData = data.filter(base.defined);
        var context = pathGenerator.context();

        pathGenerator.orient(base.orient());

        filteredData.forEach(function (d, i) {
            context.save();

            var values = base.values(d, i);
            context.translate(values.origin[0], values.origin[1]);
            context.beginPath();

            pathGenerator.median(values.median).upperQuartile(values.upperQuartile).lowerQuartile(values.lowerQuartile).high(values.high).width(values.width).low(values.low)([d]);

            context.strokeStyle = colors.black;
            context.fillStyle = colors.gray;

            base.decorate()(context, d, i);

            context.stroke();
            context.fill();
            context.closePath();

            context.restore();
        });
    };

    rebindAll(boxPlot, base);
    rebind(boxPlot, pathGenerator, 'cap', 'context');

    return boxPlot;
});

var ohlc = (function () {
  return ohlcBase(shapeOhlc(), 'ohlc');
});

var ohlc$1 = (function () {
  return ohlcBase$2(shapeOhlc());
});

var multiBase = (function () {

    var series = [];
    var mapping = function mapping(d) {
        return d;
    };
    var key = function key(_, i) {
        return i;
    };

    var multi = createBase({
        decorate: function decorate() {},
        xScale: d3Scale.scaleIdentity(),
        yScale: d3Scale.scaleIdentity()
    });

    multi.mapping = function () {
        if (!arguments.length) {
            return mapping;
        }
        mapping = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.key = function () {
        if (!arguments.length) {
            return key;
        }
        key = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };
    multi.series = function () {
        if (!arguments.length) {
            return series;
        }
        series = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };

    return multi;
});

var seriesSvgMulti = (function () {

    var base = multiBase();

    var innerJoin = dataJoin('g');

    var join = dataJoin('g', 'multi');

    var multi = function multi(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
            innerJoin.transition(selection$$1);
        }

        var mapping = base.mapping();
        var series = base.series();
        var xScale = base.xScale();
        var yScale = base.yScale();

        selection$$1.each(function (data, index, group) {

            var container = join(d3Selection.select(group[index]), series);

            // iterate over the containers, 'call'-ing the series for each
            container.each(function (dataSeries, seriesIndex, seriesGroup) {
                dataSeries.xScale(xScale).yScale(yScale);

                var seriesData = mapping(data, seriesIndex, series);
                var innerContainer = innerJoin(d3Selection.select(seriesGroup[seriesIndex]), [seriesData]);

                innerContainer.call(dataSeries);
            });

            var unwrappedSelection = container.selection ? container.selection() : container;
            unwrappedSelection.order();

            base.decorate()(container, data, index);
        });
    };

    rebindAll(multi, base);
    rebind(multi, join, 'key');

    return multi;
});

var multiSeries = (function () {

    var context = null;
    var base = multiBase();

    var multi = function multi(data) {
        var mapping = base.mapping();
        var series = base.series();
        var xScale = base.xScale();
        var yScale = base.yScale();

        series.forEach(function (dataSeries, index) {
            var seriesData = mapping(data, index, series);
            dataSeries.context(context).xScale(xScale).yScale(yScale);

            var adaptedDecorate = dataSeries.decorate();
            dataSeries.decorate(function (c, d, i) {
                base.decorate()(c, data, index);
                adaptedDecorate(c, d, i);
            });

            dataSeries(seriesData);

            dataSeries.decorate(adaptedDecorate);
        });
    };

    multi.context = function () {
        if (!arguments.length) {
            return context;
        }
        context = arguments.length <= 0 ? undefined : arguments[0];
        return multi;
    };

    rebindAll(multi, base);

    return multi;
});

var groupedBase = (function (series) {

    var bandwidth = function bandwidth() {
        return 50;
    };
    var align = 'center';

    // the offset scale is used to offset each of the series within a group
    var offsetScale = d3Scale.scaleBand();

    var grouped = createBase({
        decorate: function decorate() {},
        xScale: d3Scale.scaleLinear()
    });

    // the bandwidth for the grouped series can be a function of datum / index. As a result
    // the offset scale required to cluster the 'sub' series is also dependent on datum / index.
    // This function computes the offset scale for a specific datum / index of the grouped series
    grouped.offsetScaleForDatum = function (data, d, i) {
        var width = bandwidth(d, i);
        var offset = alignOffset(align, width);

        var halfWidth = width / 2;
        return offsetScale.domain(d3Array.range(0, data.length)).range([-halfWidth + offset, halfWidth + offset]);
    };

    grouped.bandwidth = function () {
        if (!arguments.length) {
            return bandwidth;
        }
        bandwidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return grouped;
    };
    grouped.align = function () {
        if (!arguments.length) {
            return align;
        }
        align = arguments.length <= 0 ? undefined : arguments[0];
        return grouped;
    };

    rebindAll(grouped, offsetScale, includeMap({ 'paddingInner': 'paddingOuter' }));

    return grouped;
});

var grouped = (function (series) {

    var base = groupedBase(series);

    var join = dataJoin('g', 'grouped');

    var grouped = function grouped(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {

            var g = join(d3Selection.select(group[index]), data);

            g.enter().append('g');

            g.select('g').each(function (_, index, group) {
                var container = d3Selection.select(group[index]);

                // create a composite scale that applies the required offset
                var compositeScale = function compositeScale(d, i) {
                    var offset = base.offsetScaleForDatum(data, d, i);
                    return base.xScale()(d) + offset(index) + offset.bandwidth() / 2;
                };
                series.xScale(compositeScale);

                // if the sub-series has a bandwidth, set this from the offset scale
                if (series.bandwidth) {
                    series.bandwidth(function (d, i) {
                        return base.offsetScaleForDatum(data, d, i).bandwidth();
                    });
                }

                // adapt the decorate function to give each series the correct index
                series.decorate(function (s, d) {
                    return base.decorate()(s, d, index);
                });

                container.call(series);
            });
        });
    };

    rebindAll(grouped, series, exclude('decorate', 'xScale'));
    rebindAll(grouped, base, exclude('offsetScaleForDatum'));

    return grouped;
});

var grouped$1 = function (series) {

    var base = groupedBase(series);

    var grouped = function grouped(data) {
        data.forEach(function (seriesData, index) {

            // create a composite scale that applies the required offset
            var compositeScale = function compositeScale(d, i) {
                var offset = base.offsetScaleForDatum(data, d, i);
                return base.xScale()(d) + offset(index) + offset.bandwidth() / 2;
            };
            series.xScale(compositeScale);

            // if the sub-series has a bandwidth, set this from the offset scale
            if (series.bandwidth) {
                series.bandwidth(function (d, i) {
                    return base.offsetScaleForDatum(data, d, i).bandwidth();
                });
            }

            // adapt the decorate function to give each series the correct index
            series.decorate(function (c, d) {
                return base.decorate()(c, d, index);
            });
            series(seriesData);
        });
    };

    rebindAll(grouped, series, exclude('decorate', 'xScale'));
    rebindAll(grouped, base, exclude('configureOffsetScale', 'configureOffset'));

    return grouped;
};

var repeat = (function () {

    var orient = 'vertical';
    var series = seriesSvgLine();
    var multi = seriesSvgMulti();

    var repeat = function repeat(selection$$1) {
        return selection$$1.each(function (data, index, group) {
            if (orient === 'vertical') {
                multi.series(data[0].map(function (_) {
                    return series;
                })).mapping(function (data, index) {
                    return data.map(function (d) {
                        return d[index];
                    });
                });
            } else {
                multi.series(data.map(function (_) {
                    return series;
                })).mapping(function (data, index) {
                    return data[index];
                });
            }
            d3Selection.select(group[index]).call(multi);
        });
    };

    repeat.series = function () {
        if (!arguments.length) {
            return series;
        }
        series = arguments.length <= 0 ? undefined : arguments[0];
        return repeat;
    };

    repeat.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return repeat;
    };

    rebindAll(repeat, multi, exclude('series', 'mapping'));

    return repeat;
});

var repeat$1 = (function () {

    var orient = 'vertical';
    var series = line$1();
    var multi = multiSeries();

    var repeat = function repeat(data) {
        if (orient === 'vertical') {
            multi.series(data[0].map(function (_) {
                return series;
            })).mapping(function (data, index) {
                return data.map(function (d) {
                    return d[index];
                });
            });
        } else {
            multi.series(data.map(function (_) {
                return series;
            })).mapping(function (data, index) {
                return data[index];
            });
        }
        multi(data);
    };

    repeat.series = function () {
        if (!arguments.length) {
            return series;
        }
        series = arguments.length <= 0 ? undefined : arguments[0];
        return repeat;
    };

    repeat.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return repeat;
    };

    rebindAll(repeat, multi, exclude('series', 'mapping'));

    return repeat;
});

var sortUnique = function sortUnique(arr) {
    return arr.sort(d3Array.ascending).filter(function (value, index, self) {
        return self.indexOf(value, index + 1) === -1;
    });
};

var autoBandwidth = (function (adaptee) {

    var widthFraction = 0.75;

    // computes the bandwidth as a fraction of the smallest distance between the datapoints
    var computeBandwidth = function computeBandwidth(screenValues) {
        // return some default value if there are not enough datapoints to compute the width
        if (screenValues.length <= 1) {
            return 10;
        }

        screenValues = sortUnique(screenValues);

        // compute the distance between neighbouring items
        var neighbourDistances = d3Array.pairs(screenValues).map(function (tuple) {
            return Math.abs(tuple[0] - tuple[1]);
        });

        var minDistance = d3Array.min(neighbourDistances);
        return widthFraction * minDistance;
    };

    var determineBandwith = function determineBandwith(crossScale, data, accessor) {
        // if the cross-scale has a bandwidth function, i.e. it is a scaleBand, use
        // this to determine the width
        if (crossScale.bandwidth) {
            return crossScale.bandwidth();
        } else {
            var _ref;

            // grouped series expect a nested array, which is flattened out
            var flattenedData = Array.isArray(data) ? (_ref = []).concat.apply(_ref, toConsumableArray(data)) : data;

            // obtain an array of points along the crossValue axis, mapped to screen coordinates.
            var crossValuePoints = flattenedData.filter(adaptee.defined).map(accessor()).map(crossScale);

            var width = computeBandwidth(crossValuePoints);

            return width;
        }
    };

    var autoBandwidth = function autoBandwidth(arg) {

        var computeWidth = function computeWidth(data) {

            if (adaptee.xBandwidth && adaptee.yBandwidth) {
                adaptee.xBandwidth(determineBandwith(adaptee.xScale(), data, adaptee.xValue));
                adaptee.yBandwidth(determineBandwith(adaptee.yScale(), data, adaptee.yValue));
            } else {
                // if the series has an orient property, use this to determine the cross-scale, otherwise
                // assume it is the x-scale
                var crossScale = adaptee.orient && adaptee.orient() === 'horizontal' ? adaptee.yScale() : adaptee.xScale();

                adaptee.bandwidth(determineBandwith(crossScale, data, adaptee.crossValue));
            }
        };

        if (arg instanceof d3Selection.selection) {
            arg.each(function (data, index, group) {
                computeWidth(data);
                adaptee(d3Selection.select(group[index]));
            });
        } else {
            computeWidth(arg);
            adaptee(arg);
        }
    };

    rebindAll(autoBandwidth, adaptee);

    autoBandwidth.widthFraction = function () {
        if (!arguments.length) {
            return widthFraction;
        }
        widthFraction = arguments.length <= 0 ? undefined : arguments[0];
        return autoBandwidth;
    };

    return autoBandwidth;
});

var heatmapBase = (function () {

    var xValue = function xValue(d) {
        return d.x;
    };
    var yValue = function yValue(d) {
        return d.y;
    };
    var colorValue = function colorValue(d) {
        return d.color;
    };
    var yBandwidth = function yBandwidth() {
        return 5;
    };
    var xBandwidth = function xBandwidth() {
        return 5;
    };
    var colorInterpolate = d3Scale.interpolateViridis;

    var heatmap = createBase({
        decorate: function decorate() {},
        defined: function defined(d, i) {
            return defined$1(xValue, yValue, colorValue)(d, i);
        },
        xScale: d3Scale.scaleIdentity(),
        yScale: d3Scale.scaleIdentity()
    });

    heatmap.pathGenerator = shapeBar().x(0).y(0);

    heatmap.colorScale = function (data) {
        var colorValues = data.map(colorValue);
        // a scale that maps the color values onto a unit range, [0, 1]
        return d3Scale.scaleLinear().domain([d3Array.min(colorValues), d3Array.max(colorValues)]);
    };

    heatmap.values = function (d, i) {
        return {
            x: heatmap.xScale()(xValue(d, i)),
            y: heatmap.yScale()(yValue(d, i)),
            colorValue: colorValue(d, i),
            width: xBandwidth(d, i),
            height: yBandwidth(d, i)
        };
    };

    heatmap.xValue = function () {
        if (!arguments.length) {
            return xValue;
        }
        xValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return heatmap;
    };
    heatmap.yValue = function () {
        if (!arguments.length) {
            return yValue;
        }
        yValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return heatmap;
    };
    heatmap.colorValue = function () {
        if (!arguments.length) {
            return colorValue;
        }
        colorValue = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return heatmap;
    };
    heatmap.colorInterpolate = function () {
        if (!arguments.length) {
            return colorInterpolate;
        }
        colorInterpolate = arguments.length <= 0 ? undefined : arguments[0];
        return heatmap;
    };
    heatmap.xBandwidth = function () {
        if (!arguments.length) {
            return xBandwidth;
        }
        xBandwidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return heatmap;
    };
    heatmap.yBandwidth = function () {
        if (!arguments.length) {
            return yBandwidth;
        }
        yBandwidth = functor$4(arguments.length <= 0 ? undefined : arguments[0]);
        return heatmap;
    };

    rebindAll(heatmap, heatmap.pathGenerator, includeMap({
        'horizontalAlign': 'xAlign',
        'verticalAlign': 'yAlign'
    }));

    return heatmap;
});

var heatmap = (function () {

    var base = heatmapBase();

    var join = dataJoin('g', 'box');

    var containerTransform = function containerTransform(values) {
        return 'translate(' + values.x + ', ' + values.y + ')';
    };

    var heatmap = function heatmap(selection$$1) {

        selection$$1.each(function (data, index, group) {

            var filteredData = data.filter(base.defined);
            var colorValue = base.colorValue();
            var colorInterpolate = base.colorInterpolate();
            var colorScale = base.colorScale(filteredData);

            var g = join(d3Selection.select(group[index]), filteredData);

            g.enter().append('path').attr('stroke', 'transparent');

            g.attr('transform', function (d, i) {
                return containerTransform(base.values(d, i));
            }).select('path').attr('d', function (d, i) {
                return base.pathGenerator.width(base.values(d, i).width).height(base.values(d, i).height)([d]);
            }).attr('fill', function (d, i) {
                return colorInterpolate(colorScale(colorValue(d, i)));
            });

            base.decorate()(g, data, index);
        });
    };

    rebindAll(heatmap, base);

    return heatmap;
});

var heatmap$1 = (function () {

    var context = null;
    var base = heatmapBase();

    var heatmap = function heatmap(data) {
        var filteredData = data.filter(base.defined);
        var colorValue = base.colorValue();
        var colorInterpolate = base.colorInterpolate();
        var colorScale = base.colorScale(filteredData);
        var context = base.pathGenerator.context();

        filteredData.forEach(function (d, i) {
            context.save();
            context.beginPath();

            var values = base.values(d, i);
            context.translate(values.x, values.y);

            context.fillStyle = colorInterpolate(colorScale(values.colorValue));

            base.pathGenerator.height(values.height).width(values.width)([d]);

            base.decorate()(context, d, i);

            context.fill();
            context.closePath();
            context.restore();
        });
    };

    rebind(heatmap, base.pathGenerator, 'context');
    rebindAll(heatmap, base);

    return heatmap;
});

var constant = (function (value) {
  return typeof value === 'function' ? value : function () {
    return value;
  };
});

var band = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var orient = 'horizontal';
    var fromValue = function fromValue(d) {
        return d.from;
    };
    var toValue = function toValue(d) {
        return d.to;
    };
    var decorate = function decorate() {};

    var join = dataJoin('g', 'annotation-band');

    var pathGenerator = shapeBar().horizontalAlign('center').verticalAlign('center').x(0).y(0);

    var instance = function instance(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        if (orient !== 'horizontal' && orient !== 'vertical') {
            throw new Error('Invalid orientation');
        }

        var horizontal = orient === 'horizontal';
        var translation = horizontal ? function (a, b) {
            return 'translate(' + a + ', ' + b + ')';
        } : function (a, b) {
            return 'translate(' + b + ', ' + a + ')';
        };
        // the value scale which the annotation 'value' relates to, the crossScale
        // is the other. Which is which depends on the orienation!
        var crossScale = horizontal ? xScale : yScale;
        var valueScale = horizontal ? yScale : xScale;
        var crossScaleRange = crossScale.range();
        var crossScaleSize = crossScaleRange[1] - crossScaleRange[0];
        var valueAxisDimension = horizontal ? 'height' : 'width';
        var crossAxisDimension = horizontal ? 'width' : 'height';
        var containerTransform = function containerTransform() {
            return translation((crossScaleRange[1] + crossScaleRange[0]) / 2, (valueScale(toValue.apply(undefined, arguments)) + valueScale(fromValue.apply(undefined, arguments))) / 2);
        };

        pathGenerator[crossAxisDimension](crossScaleSize);
        pathGenerator[valueAxisDimension](function () {
            return valueScale(toValue.apply(undefined, arguments)) - valueScale(fromValue.apply(undefined, arguments));
        });

        selection$$1.each(function (data, index, nodes) {

            var g = join(d3Selection.select(nodes[index]), data);

            g.enter().attr('transform', containerTransform).append('path').classed('band', true);

            g.attr('class', 'annotation-band ' + orient).attr('transform', containerTransform).select('path')
            // the path generator is being used to render a single path, hence
            // an explicit index is provided
            .attr('d', function (d, i) {
                return pathGenerator([d], i);
            });

            decorate(g, data, index);
        });
    };

    instance.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.fromValue = function () {
        if (!arguments.length) {
            return fromValue;
        }
        fromValue = constant(arguments.length <= 0 ? undefined : arguments[0]);
        return instance;
    };
    instance.toValue = function () {
        if (!arguments.length) {
            return toValue;
        }
        toValue = constant(arguments.length <= 0 ? undefined : arguments[0]);
        return instance;
    };

    return instance;
});

var annotationLine = (function () {

    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var value = function value(d) {
        return d;
    };
    var label = value;
    var decorate = function decorate() {};
    var orient = 'horizontal';

    var join = dataJoin('g', 'annotation-line');

    var instance = function instance(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        if (orient !== 'horizontal' && orient !== 'vertical') {
            throw new Error('Invalid orientation');
        }
        var horizontal = orient === 'horizontal';
        var translation = horizontal ? function (a, b) {
            return 'translate(' + a + ', ' + b + ')';
        } : function (a, b) {
            return 'translate(' + b + ', ' + a + ')';
        };
        var lineProperty = horizontal ? 'x2' : 'y2';
        // the value scale which the annotation 'value' relates to, the crossScale
        // is the other. Which is which depends on the orienation!
        var crossScale = horizontal ? xScale : yScale;
        var valueScale = horizontal ? yScale : xScale;
        var handleOne = horizontal ? 'left-handle' : 'bottom-handle';
        var handleTwo = horizontal ? 'right-handle' : 'top-handle';
        var textOffsetX = horizontal ? '9' : '0';
        var textOffsetY = horizontal ? '0' : '9';
        var textOffsetDeltaY = horizontal ? '0.32em' : '0.71em';
        var textAnchor = horizontal ? 'start' : 'middle';

        var scaleRange = crossScale.range();
        // the transform that sets the 'origin' of the annotation
        var containerTransform = function containerTransform() {
            return translation(scaleRange[0], valueScale(value.apply(undefined, arguments)));
        };
        var scaleWidth = scaleRange[1] - scaleRange[0];

        selection$$1.each(function (data, selectionIndex, nodes) {

            var g = join(d3Selection.select(nodes[selectionIndex]), data);

            // create the outer container and line
            var enter = g.enter().attr('transform', containerTransform).style('stroke', '#bbb');
            enter.append('line').attr(lineProperty, scaleWidth);

            // create containers at each end of the annotation
            enter.append('g').classed(handleOne, true).style('stroke', 'none');

            enter.append('g').classed(handleTwo, true).style('stroke', 'none').attr('transform', translation(scaleWidth, 0)).append('text').attr('text-anchor', textAnchor).attr('x', textOffsetX).attr('y', textOffsetY).attr('dy', textOffsetDeltaY);

            // Update
            g.attr('class', 'annotation-line ' + orient);

            // translate the parent container to the left hand edge of the annotation
            g.attr('transform', containerTransform);

            // update the elements that depend on scale width
            g.select('line').attr(lineProperty, scaleWidth);
            g.select('g.' + handleTwo).attr('transform', translation(scaleWidth, 0));

            // Update the text label
            g.select('text').text(label);

            decorate(g, data, selectionIndex);
        });
    };

    instance.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = constant(arguments.length <= 0 ? undefined : arguments[0]);
        return instance;
    };
    instance.label = function () {
        if (!arguments.length) {
            return label;
        }
        label = constant(arguments.length <= 0 ? undefined : arguments[0]);
        return instance;
    };
    instance.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    return instance;
});

var crosshair = function () {

    var x = function x(d) {
        return d.x;
    };
    var y = function y(d) {
        return d.y;
    };
    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();
    var decorate = function decorate() {};

    var join = dataJoin('g', 'annotation-crosshair');

    var point = seriesSvgPoint();

    var horizontalLine = annotationLine();

    var verticalLine = annotationLine().orient('vertical');

    // The line annotations and point series used to render the crosshair are positioned using
    // screen coordinates. This function constructs an identity scale for these components.
    var xIdentity = d3Scale.scaleIdentity();
    var yIdentity = d3Scale.scaleIdentity();

    var multi = seriesSvgMulti().series([horizontalLine, verticalLine, point]).xScale(xIdentity).yScale(yIdentity).mapping(function (data) {
        return [data];
    });

    var instance = function instance(selection$$1) {

        if (selection$$1.selection) {
            join.transition(selection$$1);
        }

        selection$$1.each(function (data, index, nodes) {

            var g = join(d3Selection.select(nodes[index]), data);

            // Prevent the crosshair triggering pointer events on itself
            g.enter().style('pointer-events', 'none');

            // Assign the identity scales an accurate range to allow the line annotations to cover
            // the full width/height of the chart.
            xIdentity.range(xScale.range());
            yIdentity.range(yScale.range());

            point.crossValue(x).mainValue(y);

            horizontalLine.value(y);

            verticalLine.value(x);

            g.call(multi);

            decorate(g, data, index);
        });
    };

    // Don't use the xValue/yValue convention to indicate that these values are in screen
    // not domain co-ordinates and are therefore not scaled.
    instance.x = function () {
        if (!arguments.length) {
            return x;
        }
        x = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.y = function () {
        if (!arguments.length) {
            return y;
        }
        y = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };
    instance.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    var lineIncludes = include('label');
    rebindAll(instance, horizontalLine, lineIncludes, prefix('y'));
    rebindAll(instance, verticalLine, lineIncludes, prefix('x'));

    return instance;
};

var ticks = (function () {

    var scale = d3Scale.scaleIdentity();
    var count = 10;
    var tickValues = null;

    var ticks = function ticks() {
        return tickValues != null ? tickValues : scale.ticks ? scale.ticks(count) : scale.domain();
    };

    ticks.scale = function () {
        if (!arguments.length) {
            return scale;
        }
        scale = arguments.length <= 0 ? undefined : arguments[0];
        return ticks;
    };

    ticks.ticks = function () {
        if (!arguments.length) {
            return count;
        }
        count = arguments.length <= 0 ? undefined : arguments[0];
        return ticks;
    };

    ticks.tickValues = function () {
        if (!arguments.length) {
            return tickValues;
        }
        tickValues = arguments.length <= 0 ? undefined : arguments[0];
        return ticks;
    };

    return ticks;
});

var identity$2 = function identity$2(d) {
    return d;
};

var gridline = (function () {

    var xDecorate = function xDecorate() {};
    var yDecorate = function yDecorate() {};

    var xTicks = ticks();
    var yTicks = ticks();
    var xJoin = dataJoin('line', 'gridline-y').key(identity$2);
    var yJoin = dataJoin('line', 'gridline-x').key(identity$2);

    var instance = function instance(selection$$1) {

        if (selection$$1.selection) {
            xJoin.transition(selection$$1);
            yJoin.transition(selection$$1);
        }

        selection$$1.each(function (data, index, nodes) {

            var element = nodes[index];
            var container = d3Selection.select(nodes[index]);

            var xScale = xTicks.scale();
            var yScale = yTicks.scale();

            // Stash a snapshot of the scale, and retrieve the old snapshot.
            var xScaleOld = element.__x_scale__ || xScale;
            element.__x_scale__ = xScale.copy();

            var xData = xTicks();
            var xLines = xJoin(container, xData);

            xLines.attr('x1', xScale).attr('x2', xScale).attr('y1', yScale.range()[0]).attr('y2', yScale.range()[1]).attr('stroke', '#bbb');

            xLines.enter().attr('x1', xScaleOld).attr('x2', xScaleOld).attr('y1', yScale.range()[0]).attr('y2', yScale.range()[1]);

            xLines.exit().attr('x1', xScale).attr('x2', xScale);

            xDecorate(xLines, xData, index);

            // Stash a snapshot of the scale, and retrieve the old snapshot.
            var yScaleOld = element.__y_scale__ || yScale;
            element.__y_scale__ = yScale.copy();

            var yData = yTicks();
            var yLines = yJoin(container, yData);

            yLines.attr('y1', yScale).attr('y2', yScale).attr('x1', xScale.range()[0]).attr('x2', xScale.range()[1]).attr('stroke', '#bbb');

            yLines.enter().attr('y1', yScaleOld).attr('y2', yScaleOld).attr('x1', xScale.range()[0]).attr('x2', xScale.range()[1]);

            yLines.exit().attr('y1', yScale).attr('y2', yScale);

            yDecorate(yLines, yData, index);
        });
    };

    instance.yDecorate = function () {
        if (!arguments.length) {
            return yDecorate;
        }
        yDecorate = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.xDecorate = function () {
        if (!arguments.length) {
            return xDecorate;
        }
        xDecorate = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    rebindAll(instance, xJoin, includeMap({ 'key': 'xKey' }));
    rebindAll(instance, yJoin, includeMap({ 'key': 'yKey' }));

    rebindAll(instance, xTicks, prefix('x'));
    rebindAll(instance, yTicks, prefix('y'));

    return instance;
});

var identity$3 = function identity$3(d) {
    return d;
};

var axis = function axis(orient, scale) {

    var tickArguments = [10];
    var tickValues = null;
    var decorate = function decorate() {};
    var tickFormat = null;
    var tickSizeOuter = 6;
    var tickSizeInner = 6;
    var tickPadding = 3;

    var svgDomainLine = d3Shape.line();

    var dataJoin$$1 = dataJoin('g', 'tick').key(identity$3);

    var domainPathDataJoin = dataJoin('path', 'domain');

    // returns a function that creates a translation based on
    // the bound data
    var containerTranslate = function containerTranslate(scale, trans) {
        var offset = 0;
        if (scale.bandwidth) {
            offset = scale.bandwidth() / 2;
            if (scale.round()) {
                offset = Math.round(offset);
            }
        }
        return function (d) {
            return trans(scale(d) + offset, 0);
        };
    };

    var translate = function translate(x, y) {
        return isVertical() ? 'translate(' + y + ', ' + x + ')' : 'translate(' + x + ', ' + y + ')';
    };

    var pathTranspose = function pathTranspose(arr) {
        return isVertical() ? arr.map(function (d) {
            return [d[1], d[0]];
        }) : arr;
    };

    var isVertical = function isVertical() {
        return orient === 'left' || orient === 'right';
    };

    var tryApply = function tryApply(fn, args, defaultVal) {
        return scale[fn] ? scale[fn].apply(scale, args) : defaultVal;
    };

    var axis = function axis(selection$$1) {

        if (selection$$1.selection) {
            dataJoin$$1.transition(selection$$1);
            domainPathDataJoin.transition(selection$$1);
        }

        selection$$1.each(function (data, index, group) {

            var element = group[index];

            var container = d3Selection.select(element);
            if (!element.__scale__) {
                container.attr('fill', 'none').attr('font-size', 10).attr('font-family', 'sans-serif').attr('text-anchor', orient === 'right' ? 'start' : orient === 'left' ? 'end' : 'middle');
            }

            // Stash a snapshot of the new scale, and retrieve the old snapshot.
            var scaleOld = element.__scale__ || scale;
            element.__scale__ = scale.copy();

            var ticksArray = tickValues == null ? tryApply('ticks', tickArguments, scale.domain()) : tickValues;
            var tickFormatter = tickFormat == null ? tryApply('tickFormat', tickArguments, identity$3) : tickFormat;
            var sign = orient === 'bottom' || orient === 'right' ? 1 : -1;

            // add the domain line
            var range$$1 = scale.range();
            var domainPathData = pathTranspose([[range$$1[0], sign * tickSizeOuter], [range$$1[0], 0], [range$$1[1], 0], [range$$1[1], sign * tickSizeOuter]]);

            var domainLine = domainPathDataJoin(container, [data]);
            domainLine.attr('d', svgDomainLine(domainPathData)).attr('stroke', '#000');

            var g = dataJoin$$1(container, ticksArray);

            // enter
            g.enter().attr('transform', containerTranslate(scaleOld, translate)).append('path').attr('stroke', '#000');

            var labelOffset = sign * (tickSizeInner + tickPadding);
            g.enter().append('text').attr('transform', translate(0, labelOffset)).attr('fill', '#000');

            // exit
            g.exit().attr('transform', containerTranslate(scale, translate));

            // update
            g.select('path').attr('d', function (d) {
                return svgDomainLine(pathTranspose([[0, 0], [0, sign * tickSizeInner]]));
            });

            g.select('text').attr('transform', translate(0, labelOffset)).attr('dy', function () {
                var offset = '0em';
                if (isVertical()) {
                    offset = '0.32em';
                } else if (orient === 'bottom') {
                    offset = '0.71em';
                }
                return offset;
            }).text(tickFormatter);

            g.attr('transform', containerTranslate(scale, translate));

            decorate(g, data, index);
        });
    };

    axis.tickFormat = function () {
        if (!arguments.length) {
            return tickFormat;
        }
        tickFormat = arguments.length <= 0 ? undefined : arguments[0];
        return axis;
    };

    axis.tickSize = function () {
        if (!arguments.length) {
            return tickSizeInner;
        }
        tickSizeInner = tickSizeOuter = Number(arguments.length <= 0 ? undefined : arguments[0]);
        return axis;
    };

    axis.tickSizeInner = function () {
        if (!arguments.length) {
            return tickSizeInner;
        }
        tickSizeInner = Number(arguments.length <= 0 ? undefined : arguments[0]);
        return axis;
    };

    axis.tickSizeOuter = function () {
        if (!arguments.length) {
            return tickSizeOuter;
        }
        tickSizeOuter = Number(arguments.length <= 0 ? undefined : arguments[0]);
        return axis;
    };

    axis.tickPadding = function () {
        if (!arguments.length) {
            return tickPadding;
        }
        tickPadding = arguments.length <= 0 ? undefined : arguments[0];
        return axis;
    };

    axis.decorate = function () {
        if (!arguments.length) {
            return decorate;
        }
        decorate = arguments.length <= 0 ? undefined : arguments[0];
        return axis;
    };

    axis.scale = function () {
        if (!arguments.length) {
            return scale;
        }
        scale = arguments.length <= 0 ? undefined : arguments[0];
        return axis;
    };

    axis.ticks = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        tickArguments = [].concat(args);
        return axis;
    };

    axis.tickArguments = function () {
        if (!arguments.length) {
            return tickArguments.slice();
        }
        tickArguments = (arguments.length <= 0 ? undefined : arguments[0]) == null ? [] : [].concat(toConsumableArray(arguments.length <= 0 ? undefined : arguments[0]));
        return axis;
    };

    axis.tickValues = function () {
        if (!arguments.length) {
            return tickValues.slice();
        }
        tickValues = (arguments.length <= 0 ? undefined : arguments[0]) == null ? [] : [].concat(toConsumableArray(arguments.length <= 0 ? undefined : arguments[0]));
        return axis;
    };

    return axis;
};

var axisTop = function axisTop(scale) {
    return axis('top', scale);
};

var axisBottom = function axisBottom(scale) {
    return axis('bottom', scale);
};

var axisLeft = function axisLeft(scale) {
    return axis('left', scale);
};

var axisRight = function axisRight(scale) {
    return axis('right', scale);
};

var key = '__d3fc-elements__';

var get$2 = function get$2(element) {
  return element[key] || {};
};

var set$2 = function set$2(element, data) {
  return void (element[key] = data);
};

var clear = function clear(element) {
  return delete element[key];
};

/* eslint-env browser */

var find = function find(element) {
    return element.tagName === 'D3FC-GROUP' ? [element].concat(toConsumableArray(element.querySelectorAll('d3fc-canvas, d3fc-group, d3fc-svg'))) : [element];
};

var measure = function measure(element) {
    if (element.tagName === 'D3FC-GROUP') {
        return;
    }

    var _data$get = get$2(element),
        previousWidth = _data$get.width,
        previousHeight = _data$get.height;

    var width = element.clientWidth;
    var height = element.clientHeight;
    var resized = width !== previousWidth || height !== previousHeight;
    set$2(element, { width: width, height: height, resized: resized });
};

if (typeof CustomEvent !== 'function') {
    throw new Error('d3fc-element depends on CustomEvent. Make sure that you load a polyfill in older browsers. See README.');
}

var resize = function resize(element) {
    if (element.tagName === 'D3FC-GROUP') {
        return;
    }
    var detail = get$2(element);
    var node = element.childNodes[0];
    node.setAttribute('width', detail.width);
    node.setAttribute('height', detail.height);
    var event$$1 = new CustomEvent('measure', { detail: detail });
    element.dispatchEvent(event$$1);
};

var draw = function draw(element) {
    var detail = get$2(element);
    var event$$1 = new CustomEvent('draw', { detail: detail });
    element.dispatchEvent(event$$1);
};

var redraw = (function (elements) {
    var allElements = elements.map(find).reduce(function (a, b) {
        return a.concat(b);
    });
    allElements.forEach(measure);
    allElements.forEach(resize);
    allElements.forEach(draw);
});

/* eslint-env browser */

var getQueue = function getQueue(element) {
    return get$2(element.ownerDocument).queue || [];
};

var setQueue = function setQueue(element, queue) {
    var _data$get = get$2(element.ownerDocument),
        requestId = _data$get.requestId;

    if (requestId == null) {
        requestId = requestAnimationFrame(function () {
            // This seems like a weak way of retrieving the queue
            // but I can't see an edge case at the minute...
            var queue = getQueue(element);
            redraw(queue);
            clearQueue(element);
        });
    }
    set$2(element.ownerDocument, { queue: queue, requestId: requestId });
};

var clearQueue = function clearQueue(element) {
    return clear(element.ownerDocument);
};

var isDescendentOf = function isDescendentOf(element, ancestor) {
    var node = element;
    do {
        if (node.parentNode === ancestor) {
            return true;
        }
        // eslint-disable-next-line no-cond-assign
    } while (node = node.parentNode);
    return false;
};

var _requestRedraw = (function (element) {
    var queue = getQueue(element);
    var queueContainsElement = queue.indexOf(element) > -1;
    if (queueContainsElement) {
        return;
    }
    var queueContainsAncestor = queue.some(function (queuedElement) {
        return isDescendentOf(element, queuedElement);
    });
    if (queueContainsAncestor) {
        return;
    }
    var queueExcludingDescendents = queue.filter(function (queuedElement) {
        return !isDescendentOf(queuedElement, element);
    });
    queueExcludingDescendents.push(element);
    setQueue(element, queueExcludingDescendents);
});

function _CustomElement() {
    return Reflect.construct(HTMLElement, [], this.__proto__.constructor);
}


Object.setPrototypeOf(_CustomElement.prototype, HTMLElement.prototype);
Object.setPrototypeOf(_CustomElement, HTMLElement);
/* eslint-env browser */

if (typeof HTMLElement !== 'function') {
    throw new Error('d3fc-element depends on Custom Elements (v1). Make sure that you load a polyfill in older browsers. See README.');
}

var element = (function (createNode) {
    return function (_CustomElement2) {
        inherits(_class, _CustomElement2);

        function _class() {
            classCallCheck(this, _class);
            return possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        createClass(_class, [{
            key: 'connectedCallback',
            value: function connectedCallback() {
                if (this.childNodes.length === 0) {
                    this.appendChild(createNode());
                }
            }
        }, {
            key: 'requestRedraw',
            value: function requestRedraw() {
                _requestRedraw(this);
            }
        }]);
        return _class;
    }(_CustomElement);
});

var Canvas = element(function () {
  return document.createElement('canvas');
});

function _CustomElement$1() {
    return Reflect.construct(HTMLElement, [], this.__proto__.constructor);
}


Object.setPrototypeOf(_CustomElement$1.prototype, HTMLElement.prototype);
Object.setPrototypeOf(_CustomElement$1, HTMLElement);
/* eslint-env browser */

var _class = function (_CustomElement2) {
    inherits(_class, _CustomElement2);

    function _class() {
        classCallCheck(this, _class);
        return possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    createClass(_class, [{
        key: 'requestRedraw',
        value: function requestRedraw() {
            _requestRedraw(this);
        }
    }, {
        key: 'updateAutoResize',
        value: function updateAutoResize() {
            var _this2 = this;

            if (this.autoResize) {
                if (this.__autoResizeListener__ == null) {
                    this.__autoResizeListener__ = function () {
                        return _requestRedraw(_this2);
                    };
                }
                addEventListener('resize', this.__autoResizeListener__);
            } else {
                removeEventListener('resize', this.__autoResizeListener__);
            }
        }
    }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(name) {
            switch (name) {
                case 'auto-resize':
                    this.updateAutoResize();
                    break;
            }
        }
    }, {
        key: 'autoResize',
        get: function get() {
            return this.hasAttribute('auto-resize') && this.getAttribute('auto-resize') !== 'false';
        },
        set: function set(autoResize) {
            if (autoResize && !this.autoResize) {
                this.setAttribute('auto-resize', '');
            } else if (!autoResize && this.autoResize) {
                this.removeAttribute('auto-resize');
            }
            this.updateAutoResize();
        }
    }], [{
        key: 'observedAttributes',
        get: function get() {
            return ['auto-resize'];
        }
    }]);
    return _class;
}(_CustomElement$1);

var Svg = element(function () {
  return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
});

// Adapted from https://github.com/substack/insert-css
var css = 'd3fc-canvas,d3fc-svg{position:relative;display:block}d3fc-canvas>canvas,d3fc-svg>svg{position:absolute;top:0;right:0;left:0;bottom: 0}d3fc-svg>svg{overflow:visible}';

var styleElement = document.createElement('style');
styleElement.setAttribute('type', 'text/css');

document.querySelector('head').appendChild(styleElement);

if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText += css;
} else {
    styleElement.textContent += css;
}

/* globals customElements */
if ((typeof customElements === 'undefined' ? 'undefined' : _typeof(customElements)) !== 'object' || typeof customElements.define !== 'function') {
    throw new Error('d3fc-element depends on Custom Elements (v1). Make sure that you load a polyfill in older browsers. See README.');
}

customElements.define('d3fc-canvas', Canvas);
customElements.define('d3fc-group', _class);
customElements.define('d3fc-svg', Svg);

var pointer = (function () {
    var event$$1 = d3Dispatch.dispatch('point');

    function mousemove() {
        var point = d3Selection.mouse(this);
        event$$1.call('point', this, [{ x: point[0], y: point[1] }]);
    }

    function mouseleave() {
        void event$$1.call('point', this, []);
    }

    var instance = function instance(selection$$1) {
        selection$$1.on('mouseenter.pointer', mousemove).on('mousemove.pointer', mousemove).on('mouseleave.pointer', mouseleave);
    };

    rebind(instance, event$$1, 'on');

    return instance;
});

var group = (function () {

    var key = '';
    var orient = 'vertical';
    // D3 CSV returns all values as strings, this converts them to numbers
    // by default.
    var value = function value(row, column) {
        return Number(row[column]);
    };

    var verticalgroup = function verticalgroup(data) {
        return Object.keys(data[0]).filter(function (k) {
            return k !== key;
        }).map(function (k) {
            var values = data.filter(function (row) {
                return row[k];
            }).map(function (row) {
                var cell = [row[key], value(row, k)];
                cell.data = row;
                return cell;
            });
            values.key = k;
            return values;
        });
    };

    var horizontalgroup = function horizontalgroup(data) {
        return data.map(function (row) {
            var values = Object.keys(row).filter(function (d) {
                return d !== key;
            }).map(function (k) {
                var cell = [k, value(row, k)];
                cell.data = row;
                return cell;
            });
            values.key = row[key];
            return values;
        });
    };

    var group = function group(data) {
        return orient === 'vertical' ? verticalgroup(data) : horizontalgroup(data);
    };

    group.key = function () {
        if (!arguments.length) {
            return key;
        }
        key = arguments.length <= 0 ? undefined : arguments[0];
        return group;
    };

    group.value = function () {
        if (!arguments.length) {
            return value;
        }
        value = arguments.length <= 0 ? undefined : arguments[0];
        return group;
    };

    group.orient = function () {
        if (!arguments.length) {
            return orient;
        }
        orient = arguments.length <= 0 ? undefined : arguments[0];
        return group;
    };

    return group;
});

var functor$5 = function functor$5(v) {
    return typeof v === 'function' ? v : function () {
        return v;
    };
};

var cartesianBase = (function (d3fcElementType, plotAreaDrawFunction) {
    return function () {
        var xScale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : d3Scale.scaleIdentity();
        var yScale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : d3Scale.scaleIdentity();


        var yLabel = functor$5('');
        var xLabel = functor$5('');
        var yOrient = functor$5('right');
        var xOrient = functor$5('bottom');
        var chartLabel = functor$5('');
        var plotArea = seriesSvgLine();
        var xTickFormat = null;
        var xTicks = void 0;
        var xTickArguments = void 0;
        var xTickSize = void 0;
        var xTickSizeInner = void 0;
        var xTickSizeOuter = void 0;
        var xTickValues = void 0;
        var xTickPadding = void 0;
        var xDecorate = function xDecorate() {};
        var yTickFormat = null;
        var yTicks = void 0;
        var yTickArguments = void 0;
        var yTickSize = void 0;
        var yTickSizeInner = void 0;
        var yTickSizeOuter = void 0;
        var yTickValues = void 0;
        var yTickPadding = void 0;
        var yDecorate = function yDecorate() {};
        var decorate = function decorate() {};

        var axisForOrient = function axisForOrient(orient) {
            switch (orient) {
                case 'bottom':
                    return axisBottom();
                case 'top':
                    return axisTop();
                case 'left':
                    return axisLeft();
                case 'right':
                    return axisRight();
                case 'none':
                    return null;
            }
        };

        var xMargin = function xMargin(yOrient) {
            switch (yOrient) {
                case 'left':
                    return 'margin-left: 4em';
                case 'right':
                    return 'margin-right: 4em';
                default:
                    return '';
            }
        };

        var xPadding = function xPadding(yOrient) {
            switch (yOrient) {
                case 'left':
                    return 'padding-right: 1em';
                case 'right':
                    return 'padding-left: 1em';
                case 'none':
                    return 'padding-left: 1em; padding-right: 1em';
                default:
                    return '';
            }
        };

        var colFlexDirection = function colFlexDirection(xOrient) {
            switch (xOrient) {
                case 'bottom':
                    return 'flex-direction: column';
                default:
                    return 'flex-direction: column-reverse';
            }
        };

        var rowFlexDirection = function rowFlexDirection(yOrient) {
            switch (yOrient) {
                case 'right':
                    return 'flex-direction: row';
                default:
                    return 'flex-direction: row-reverse';
            }
        };

        var containerDataJoin = dataJoin('d3fc-group', 'cartesian-chart');

        var propagateTransition = function propagateTransition(maybeTransition) {
            return function (selection$$1) {
                return maybeTransition.selection ? selection$$1.transition(maybeTransition) : selection$$1;
            };
        };

        var cartesian = function cartesian(selection$$1) {

            var transitionPropagator = propagateTransition(selection$$1);

            selection$$1.each(function (data, index, group) {
                var container = containerDataJoin(d3Selection.select(group[index]), [data]);

                var xOrientValue = xOrient(data);
                var yOrientValue = yOrient(data);
                var xAxis = axisForOrient(xOrientValue);
                var yAxis = axisForOrient(yOrientValue);

                var xAxisMarkup = xAxis ? '<d3fc-svg class=\'x-axis\' style=\'height: 2em; ' + xMargin(yOrientValue) + '\'></d3fc-svg>\n                    <div class=\'x-axis-label\' style=\'height: 1em; line-height: 1em; text-align: center; ' + xMargin(yOrientValue) + '\'></div>' : '';
                var yAxisMarkup = yAxis ? '<d3fc-svg class=\'y-axis\' style=\'width: 3em\'></d3fc-svg>\n                    <div style=\'width: 1em; display: flex; align-items: center; justify-content: center\'>\n                        <div class=\'y-axis-label\' style=\'transform: rotate(-90deg)\'></div>\n                    </div>' : '';

                container.enter().attr('style', 'display: flex; height: 100%; width: 100%; flex-direction: column; overflow: hidden').attr('auto-resize', '').html('<div class=\'chart-label\'\n                                style=\'height: ' + (chartLabel ? 2 : 0) + 'em; line-height: 2em; text-align: center; ' + xMargin(yOrientValue) + '\'>\n                          </div>\n                          <div style=\'flex: 1; display: flex; ' + colFlexDirection(xOrientValue) + '; ' + xPadding(yOrientValue) + '\'>\n                              <div style=\'flex: 1; display: flex; ' + rowFlexDirection(yOrientValue) + '\'>\n                                  <' + d3fcElementType + ' class=\'plot-area\' style=\'flex: 1\'></' + d3fcElementType + '>\n                                  ' + yAxisMarkup + '\n                              </div>\n                              ' + xAxisMarkup + '\n                          </div>');

                container.select('.y-axis-label').text(yLabel(data));

                container.select('.x-axis-label').text(xLabel(data));

                container.select('.chart-label').text(chartLabel(data));

                container.select('.y-axis').on('measure', function (d, i, nodes) {
                    if (yOrientValue === 'left') {
                        var _event$detail = d3Selection.event.detail,
                            width = _event$detail.width,
                            height = _event$detail.height;

                        d3Selection.select(nodes[i]).select('svg').attr('viewBox', -width + ' 0 ' + width + ' ' + height);
                    }
                }).on('draw', function (d, i, nodes) {
                    yAxis.tickFormat(yTickFormat).decorate(yDecorate);
                    if (yTicks) {
                        yAxis.ticks.apply(yAxis, toConsumableArray(yTicks));
                    }
                    if (yTickArguments) {
                        yAxis.tickArguments(yTickArguments);
                    }
                    if (yTickSize) {
                        yAxis.tickSize(yTickSize);
                    }
                    if (yTickSizeInner) {
                        yAxis.tickSizeInner(yTickSizeInner);
                    }
                    if (yTickSizeOuter) {
                        yAxis.tickSizeOuter(yTickSizeOuter);
                    }
                    if (yTickValues) {
                        yAxis.tickValues(yTickValues);
                    }
                    if (yTickPadding) {
                        yAxis.tickPadding(yTickPadding);
                    }
                    transitionPropagator(d3Selection.select(nodes[i])).select('svg').call(yAxis.scale(yScale));
                });

                container.select('.x-axis').on('measure', function (d, i, nodes) {
                    if (xOrientValue === 'top') {
                        var _event$detail2 = d3Selection.event.detail,
                            width = _event$detail2.width,
                            height = _event$detail2.height;

                        d3Selection.select(nodes[i]).select('svg').attr('viewBox', '0 ' + -height + ' ' + width + ' ' + height);
                    }
                }).on('draw', function (d, i, nodes) {
                    xAxis.tickFormat(xTickFormat).decorate(xDecorate);
                    if (xTicks) {
                        xAxis.ticks.apply(xAxis, toConsumableArray(xTicks));
                    }
                    if (xTickArguments) {
                        xAxis.tickArguments(xTickArguments);
                    }
                    if (xTickSize) {
                        xAxis.tickSize(xTickSize);
                    }
                    if (xTickSizeInner) {
                        xAxis.tickSizeInner(xTickSizeInner);
                    }
                    if (xTickSizeOuter) {
                        xAxis.tickSizeOuter(xTickSizeOuter);
                    }
                    if (xTickValues) {
                        xAxis.tickValues(xTickValues);
                    }
                    if (xTickPadding) {
                        xAxis.tickPadding(xTickPadding);
                    }
                    transitionPropagator(d3Selection.select(nodes[i])).select('svg').call(xAxis.scale(xScale));
                });

                container.select('.plot-area').on('measure', function () {
                    var _event$detail3 = d3Selection.event.detail,
                        width = _event$detail3.width,
                        height = _event$detail3.height;

                    xScale.range([0, width]);
                    yScale.range([height, 0]);
                }).on('draw', function (d, i, nodes) {
                    plotArea.xScale(xScale).yScale(yScale);
                    plotAreaDrawFunction(d, nodes[i], plotArea, transitionPropagator);
                });

                container.each(function (_, index, group) {
                    return group[index].requestRedraw();
                });

                decorate(container, data, index);
            });
        };

        var scaleExclusions = exclude(/range\w*/, // the scale range is set via the component layout
        /tickFormat/ // use axis.tickFormat instead (only present on linear scales)
        );
        rebindAll(cartesian, xScale, scaleExclusions, prefix('x'));
        rebindAll(cartesian, yScale, scaleExclusions, prefix('y'));

        cartesian.xTickFormat = function () {
            if (!arguments.length) {
                return xTickFormat;
            }
            xTickFormat = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.xTicks = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            if (!args.length) {
                return xTicks;
            }
            xTicks = args;
            return cartesian;
        };
        cartesian.xTickArguments = function () {
            if (!arguments.length) {
                return xTickArguments;
            }
            xTickArguments = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.xTickSize = function () {
            if (!arguments.length) {
                return xTickSize;
            }
            xTickSize = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.xTickSizeInner = function () {
            if (!arguments.length) {
                return xTickSizeInner;
            }
            xTickSizeInner = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.xTickSizeOuter = function () {
            if (!arguments.length) {
                return xTickSizeOuter;
            }
            xTickSizeOuter = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.xTickValues = function () {
            if (!arguments.length) {
                return xTickValues;
            }
            xTickValues = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.xTickPadding = function () {
            if (!arguments.length) {
                return xTickPadding;
            }
            xTickPadding = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.xDecorate = function () {
            if (!arguments.length) {
                return xDecorate;
            }
            xDecorate = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yTickFormat = function () {
            if (!arguments.length) {
                return yTickFormat;
            }
            yTickFormat = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yTicks = function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            if (!args.length) {
                return yTicks;
            }
            yTicks = args;
            return cartesian;
        };
        cartesian.yTickArguments = function () {
            if (!arguments.length) {
                return yTickArguments;
            }
            yTickArguments = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yTickSize = function () {
            if (!arguments.length) {
                return yTickSize;
            }
            yTickSize = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yTickSizeInner = function () {
            if (!arguments.length) {
                return yTickSizeInner;
            }
            yTickSizeInner = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yTickSizeOuter = function () {
            if (!arguments.length) {
                return yTickSizeOuter;
            }
            yTickSizeOuter = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yTickValues = function () {
            if (!arguments.length) {
                return yTickValues;
            }
            yTickValues = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yTickPadding = function () {
            if (!arguments.length) {
                return yTickPadding;
            }
            yTickPadding = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yDecorate = function () {
            if (!arguments.length) {
                return yDecorate;
            }
            yDecorate = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.yOrient = function () {
            if (!arguments.length) {
                return yOrient;
            }
            yOrient = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
            return cartesian;
        };
        cartesian.xOrient = function () {
            if (!arguments.length) {
                return xOrient;
            }
            xOrient = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
            return cartesian;
        };
        cartesian.chartLabel = function () {
            if (!arguments.length) {
                return chartLabel;
            }
            chartLabel = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
            return cartesian;
        };
        cartesian.plotArea = function () {
            if (!arguments.length) {
                return plotArea;
            }
            plotArea = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };
        cartesian.xLabel = function () {
            if (!arguments.length) {
                return xLabel;
            }
            xLabel = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
            return cartesian;
        };
        cartesian.yLabel = function () {
            if (!arguments.length) {
                return yLabel;
            }
            yLabel = functor$5(arguments.length <= 0 ? undefined : arguments[0]);
            return cartesian;
        };
        cartesian.decorate = function () {
            if (!arguments.length) {
                return decorate;
            }
            decorate = arguments.length <= 0 ? undefined : arguments[0];
            return cartesian;
        };

        return cartesian;
    };
});

var cartesian = cartesianBase('d3fc-svg', function (data, element, plotArea, transitionPropagator) {
    transitionPropagator(d3Selection.select(element)).select('svg').call(plotArea);
});

var cartesian$1 = (function () {
    return cartesian.apply(undefined, arguments);
});

var cartesian$2 = cartesianBase('d3fc-canvas', function (data, element, plotArea) {
    var canvas = element.childNodes[0];
    plotArea.context(canvas.getContext('2d'));
    plotArea(data);
});

var cartesian$3 = (function () {
    return cartesian$2.apply(undefined, arguments);
});

var brushForOrient = function brushForOrient(orient) {
    switch (orient) {
        case 'x':
            return d3Brush.brushX();
        case 'y':
            return d3Brush.brushY();
        case 'xy':
            return d3Brush.brush();
    }
};

var invertRange = function invertRange(range$$1) {
    return [range$$1[1], range$$1[0]];
};

var brushBase = function brushBase(orient) {

    var brush$$1 = brushForOrient(orient);
    var eventDispatch = d3Dispatch.dispatch('brush', 'start', 'end');
    var xScale = d3Scale.scaleIdentity();
    var yScale = d3Scale.scaleIdentity();

    var innerJoin = dataJoin('g', 'brush');

    var mapSelection = function mapSelection(selection$$1, xMapping, yMapping) {
        switch (orient) {
            case 'x':
                return selection$$1.map(xMapping);
            case 'y':
                return selection$$1.map(yMapping);
            case 'xy':
                return [[xMapping(selection$$1[0][0]), yMapping(selection$$1[0][1])], [xMapping(selection$$1[1][0]), yMapping(selection$$1[1][1])]];
        }
    };

    var percentToSelection = function percentToSelection(percent) {
        return mapSelection(percent, d3Scale.scaleLinear().domain(xScale.range()).invert, d3Scale.scaleLinear().domain(invertRange(yScale.range())).invert);
    };

    var selectionToPercent = function selectionToPercent(selection$$1) {
        return mapSelection(selection$$1, d3Scale.scaleLinear().domain(xScale.range()), d3Scale.scaleLinear().domain(invertRange(yScale.range())));
    };

    var updateXDomain = function updateXDomain(selection$$1) {
        var f = d3Scale.scaleLinear().domain(xScale.domain());
        if (orient === 'x') {
            return selection$$1.map(f.invert);
        } else if (orient === 'xy') {
            return [f.invert(selection$$1[0][0]), f.invert(selection$$1[1][0])];
        }
    };

    var updateYDomain = function updateYDomain(selection$$1) {
        var g = d3Scale.scaleLinear().domain(invertRange(yScale.domain()));
        if (orient === 'y') {
            return [selection$$1[1], selection$$1[0]].map(g.invert);
        } else if (orient === 'xy') {
            return [g.invert(selection$$1[1][1]), g.invert(selection$$1[0][1])];
        }
    };

    var transformEvent = function transformEvent(event$$1) {
        // The render function calls brush.move, which triggers, start, brush and end events. We don't
        // really want those events so suppress them.
        if (event$$1.sourceEvent && event$$1.sourceEvent.type === 'draw') return;

        if (event$$1.selection) {
            var mappedSelection = selectionToPercent(event$$1.selection);
            eventDispatch.call(event$$1.type, {}, {
                selection: mappedSelection,
                xDomain: updateXDomain(mappedSelection),
                yDomain: updateYDomain(mappedSelection)
            });
        } else {
            eventDispatch.call(event$$1.type, {}, {});
        }
    };

    var base = function base(selection$$1) {
        selection$$1.each(function (data, index, group) {

            // set the extent
            brush$$1.extent([[xScale.range()[0], yScale.range()[1]], [xScale.range()[1], yScale.range()[0]]]);

            // forwards events
            brush$$1.on('end', function () {
                return transformEvent(d3Selection.event);
            }).on('brush', function () {
                return transformEvent(d3Selection.event);
            }).on('start', function () {
                return transformEvent(d3Selection.event);
            });

            // render
            var container = innerJoin(d3Selection.select(group[index]), [data]);
            container.call(brush$$1).call(brush$$1.move, data ? percentToSelection(data) : null);
        });
    };

    base.xScale = function () {
        if (!arguments.length) {
            return xScale;
        }
        xScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    base.yScale = function () {
        if (!arguments.length) {
            return yScale;
        }
        yScale = arguments.length <= 0 ? undefined : arguments[0];
        return base;
    };

    rebind(base, eventDispatch, 'on');
    rebind(base, brush$$1, 'filter', 'handleSize');

    return base;
};

var brushX$1 = function brushX$1() {
    return brushBase('x');
};

var brushY$1 = function brushY$1() {
    return brushBase('y');
};

var brush$1 = function brush$1() {
    return brushBase('xy');
};

exports.indicatorBollingerBands = bollingerBands;
exports.indicatorExponentialMovingAverage = exponentialMovingAverage;
exports.indicatorMacd = macd;
exports.indicatorRelativeStrengthIndex = relativeStrengthIndex;
exports.indicatorStochasticOscillator = stochasticOscillator;
exports.indicatorForceIndex = forceIndex;
exports.indicatorEnvelope = envelope;
exports.indicatorElderRay = elderRay;
exports.indicatorMovingAverage = movingAverage;
exports.scaleDiscontinuous = discontinuous;
exports.discontinuitySkipWeekends = skipWeekends;
exports.discontinuityIdentity = identity$1;
exports.discontinuityRange = provider;
exports.extentLinear = linearExtent;
exports.extentDate = date;
exports.randomFinancial = financial;
exports.randomGeometricBrownianMotion = geometricBrownianMotion;
exports.randomSkipWeekends = skipWeekends$1;
exports.feedGdax = gdax;
exports.feedQuandl = quandl;
exports.bucket = bucket;
exports.largestTriangleOneBucket = largestTriangleOneBucket;
exports.largestTriangleThreeBucket = largestTriangleThreeBucket;
exports.modeMedian = modeMedian;
exports.rebind = rebind;
exports.rebindAll = rebindAll;
exports.exclude = exclude;
exports.include = include;
exports.includeMap = includeMap;
exports.prefix = prefix;
exports.shapeOhlc = shapeOhlc;
exports.shapeBar = shapeBar;
exports.shapeCandlestick = shapeCandlestick;
exports.shapeBoxPlot = shapeBoxPlot;
exports.shapeErrorBar = shapeErrorBar;
exports.layoutLabel = label;
exports.layoutTextLabel = textLabel;
exports.layoutGreedy = greedy;
exports.layoutAnnealing = annealing;
exports.layoutRemoveOverlaps = removeOverlaps;
exports.layoutBoundingBox = boundingBox;
exports.dataJoin = dataJoin;
exports.effectivelyZero = effectivelyZero;
exports.seriesSvgLine = seriesSvgLine;
exports.seriesCanvasLine = line$1;
exports.seriesSvgPoint = seriesSvgPoint;
exports.seriesCanvasPoint = point;
exports.seriesSvgBar = bar;
exports.seriesCanvasBar = bar$1;
exports.seriesSvgErrorBar = errorBar;
exports.seriesCanvasErrorBar = errorBar$1;
exports.seriesSvgArea = area$1;
exports.seriesCanvasArea = area$2;
exports.seriesSvgCandlestick = candlestick;
exports.seriesCanvasCandlestick = candlestick$1;
exports.seriesSvgBoxPlot = boxPlot;
exports.seriesCanvasBoxPlot = boxPlot$1;
exports.seriesSvgOhlc = ohlc;
exports.seriesCanvasOhlc = ohlc$1;
exports.seriesSvgMulti = seriesSvgMulti;
exports.seriesCanvasMulti = multiSeries;
exports.seriesSvgGrouped = grouped;
exports.seriesCanvasGrouped = grouped$1;
exports.seriesSvgRepeat = repeat;
exports.seriesCanvasRepeat = repeat$1;
exports.autoBandwidth = autoBandwidth;
exports.seriesSvgHeatmap = heatmap;
exports.seriesCanvasHeatmap = heatmap$1;
exports.annotationSvgBand = band;
exports.annotationSvgCrosshair = crosshair;
exports.annotationSvgLine = annotationLine;
exports.annotationSvgGridline = gridline;
exports.axisTop = axisTop;
exports.axisBottom = axisBottom;
exports.axisLeft = axisLeft;
exports.axisRight = axisRight;
exports.pointer = pointer;
exports.group = group;
exports.chartSvgCartesian = cartesian$1;
exports.chartCanvasCartesian = cartesian$3;
exports.brushX = brushX$1;
exports.brushY = brushY$1;
exports.brush = brush$1;

Object.defineProperty(exports, '__esModule', { value: true });

})));
