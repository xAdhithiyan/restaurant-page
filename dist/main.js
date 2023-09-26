/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/animateplus/animateplus.js":
/*!*************************************************!*\
  !*** ./node_modules/animateplus/animateplus.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   delay: () => (/* binding */ delay),
/* harmony export */   stop: () => (/* binding */ stop)
/* harmony export */ });
/*
 * Animate Plus v2.1.1
 * Copyright (c) 2017-2018 Benjamin De Cock
 * http://animateplus.com/license
 */


// logic
// =====

const first = ([item]) => item;

const computeValue = (value, index) =>
  typeof value == "function" ? value(index) : value;


// dom
// ===

const getElements = elements => {
  if (Array.isArray(elements))
    return elements;
  if (!elements || elements.nodeType)
    return [elements];
  return Array.from(typeof elements == "string" ? document.querySelectorAll(elements) : elements);
};

const accelerate = ({style}, keyframes) =>
  style.willChange = keyframes
    ? keyframes.map(({property}) => property).join()
    : "auto";

const createSVG = (element, attributes) =>
  Object.entries(attributes).reduce((node, [attribute, value]) => {
    node.setAttribute(attribute, value);
    return node;
  }, document.createElementNS("http://www.w3.org/2000/svg", element));


// motion blur
// ===========

const blurs = {
  axes: ["x", "y"],
  count: 0,
  add({element, blur}) {
    const id = `motion-blur-${this.count++}`;
    const svg = createSVG("svg", {
      style: "position: absolute; width: 0; height: 0"
    });
    const filter = createSVG("filter", this.axes.reduce((attributes, axis) => {
      const offset = blur[axis] * 2;
      attributes[axis] = `-${offset}%`;
      attributes[axis == "x" ? "width" : "height"] = `${100 + offset * 2}%`;
      return attributes;
    },{
      id,
      "color-interpolation-filters": "sRGB"
    }));
    const gaussian = createSVG("feGaussianBlur", {
      in: "SourceGraphic"
    });
    filter.append(gaussian);
    svg.append(filter);
    element.style.filter = `url("#${id}")`;
    document.body.prepend(svg);
    return gaussian;
  }
};

const getDeviation = (blur, {easing}, curve) => {
  const progress = blur * curve;
  const out = blur - progress;
  const deviation = (() => {
    if (easing == "linear")
      return blur;
    if (easing.startsWith("in-out"))
      return (curve < .5 ? progress : out) * 2;
    if (easing.startsWith("in"))
      return progress;
    return out;
  })();
  return Math.max(0, deviation);
};

const setDeviation = ({blur, gaussian, easing}, curve) => {
  const values = blurs.axes.map(axis => getDeviation(blur[axis], easing, curve));
  gaussian.setAttribute("stdDeviation", values.join());
};

const normalizeBlur = blur => {
  const defaults = blurs.axes.reduce((object, axis) => {
    object[axis] = 0;
    return object;
  }, {});
  return Object.assign(defaults, blur);
};

const clearBlur = ({style}, {parentNode: {parentNode: svg}}) => {
  style.filter = "none";
  svg.remove();
};


// color conversion
// ================

const hexPairs = color => {
  const split = color.split("");
  const pairs = color.length < 5
    ? split.map(string => string + string)
    : split.reduce((array, string, index) => {
      if (index % 2)
        array.push(split[index - 1] + string);
      return array;
    }, []);
  if (pairs.length < 4)
    pairs.push("ff");
  return pairs;
};

const convert = color =>
  hexPairs(color).map(string => parseInt(string, 16));

const rgba = hex => {
  const color = hex.slice(1);
  const [r, g, b, a] = convert(color);
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
};


// easing equations
// ================

const pi2 = Math.PI * 2;

const getOffset = (strength, period) =>
  period / pi2 * Math.asin(1 / strength);

const easings = {
  "linear": progress => progress,

  "in-cubic": progress => progress ** 3,
  "in-quartic": progress => progress ** 4,
  "in-quintic": progress => progress ** 5,
  "in-exponential": progress => 1024 ** (progress - 1),
  "in-circular": progress => 1 - Math.sqrt(1 - progress ** 2),
  "in-elastic": (progress, amplitude, period) => {
    const strength = Math.max(amplitude, 1);
    const offset = getOffset(strength, period);
    return -(strength * 2 ** (10 * (progress -= 1)) * Math.sin((progress - offset) * pi2 / period));
  },

  "out-cubic": progress => --progress ** 3 + 1,
  "out-quartic": progress => 1 - --progress ** 4,
  "out-quintic": progress => --progress ** 5 + 1,
  "out-exponential": progress => 1 - 2 ** (-10 * progress),
  "out-circular": progress => Math.sqrt(1 - --progress ** 2),
  "out-elastic": (progress, amplitude, period) => {
    const strength = Math.max(amplitude, 1);
    const offset = getOffset(strength, period);
    return strength * 2 ** (-10 * progress) * Math.sin((progress - offset) * pi2 / period) + 1;
  },

  "in-out-cubic": progress =>
    (progress *= 2) < 1
      ? .5 * progress ** 3
      : .5 * ((progress -= 2) * progress ** 2 + 2),
  "in-out-quartic": progress =>
    (progress *= 2) < 1
      ? .5 * progress ** 4
      : -.5 * ((progress -= 2) * progress ** 3 - 2),
  "in-out-quintic": progress =>
    (progress *= 2) < 1
      ? .5 * progress ** 5
      : .5 * ((progress -= 2) * progress ** 4 + 2),
  "in-out-exponential": progress =>
    (progress *= 2) < 1
      ? .5 * 1024 ** (progress - 1)
      : .5 * (-(2 ** (-10 * (progress - 1))) + 2),
  "in-out-circular": progress =>
    (progress *= 2) < 1
      ? -.5 * (Math.sqrt(1 - progress ** 2) - 1)
      : .5 * (Math.sqrt(1 - (progress -= 2) * progress) + 1),
  "in-out-elastic": (progress, amplitude, period) => {
    const strength = Math.max(amplitude, 1);
    const offset = getOffset(strength, period);
    return (progress *= 2) < 1
      ? -.5 * (strength * 2 ** (10 * (progress -= 1)) * Math.sin((progress - offset) * pi2 / period))
      : strength * 2 ** (-10 * (progress -= 1)) * Math.sin((progress - offset) * pi2 / period) * .5 + 1;
  }
};

const decomposeEasing = string => {
  const [easing, amplitude = 1, period = .4] = string.trim().split(" ");
  return {easing, amplitude, period};
};

const ease = ({easing, amplitude, period}, progress) =>
  easings[easing](progress, amplitude, period);


// keyframes composition
// =====================

const extractRegExp = /-?\d*\.?\d+/g;

const extractStrings = value =>
  value.split(extractRegExp);

const extractNumbers = value =>
  value.match(extractRegExp).map(Number);

const sanitize = values =>
  values.map(value => {
    const string = String(value);
    return string.startsWith("#") ? rgba(string) : string;
  });

const addPropertyKeyframes = (property, values) => {
  const animatable = sanitize(values);
  const strings = extractStrings(first(animatable));
  const numbers = animatable.map(extractNumbers);
  const round = first(strings).startsWith("rgb");
  return {property, strings, numbers, round};
};

const createAnimationKeyframes = (keyframes, index) =>
  Object.entries(keyframes).map(([property, values]) =>
    addPropertyKeyframes(property, computeValue(values, index)));

const getCurrentValue = (from, to, easing) =>
  from + (to - from) * easing;

const recomposeValue = ([from, to], strings, round, easing) =>
  strings.reduce((style, string, index) => {
    const previous = index - 1;
    const value = getCurrentValue(from[previous], to[previous], easing);
    return style + (round && index < 4 ? Math.round(value) : value) + string;
  });

const createStyles = (keyframes, easing) =>
  keyframes.reduce((styles, {property, numbers, strings, round}) => {
    styles[property] = recomposeValue(numbers, strings, round, easing);
    return styles;
  }, {});

const reverseKeyframes = keyframes =>
  keyframes.forEach(({numbers}) => numbers.reverse());


// animation tracking
// ==================

const rAF = {
  all: new Set,
  add(object) {
    if (this.all.add(object).size < 2) requestAnimationFrame(tick);
  }
};

const paused = {};

const trackTime = (timing, now) => {
  if (!timing.startTime) timing.startTime = now;
  timing.elapsed = now - timing.startTime;
};

const resetTime = object =>
  object.startTime = 0;

const getProgress = ({elapsed, duration}) =>
  duration > 0 ? Math.min(elapsed / duration, 1) : 1;

const setSpeed = (speed, value, index) =>
  speed > 0 ? computeValue(value, index) / speed : 0;

const addAnimations = (options, resolve) => {
  const {
    elements = null,
    easing = "out-elastic",
    duration = 1000,
    delay: timeout = 0,
    speed = 1,
    loop = false,
    optimize = false,
    direction = "normal",
    blur = null,
    change = null,
    ...rest
  } = options;

  const last = {
    totalDuration: -1
  };

  getElements(elements).forEach(async (element, index) => {
    const keyframes = createAnimationKeyframes(rest, index);
    const animation = {
      element,
      keyframes,
      loop,
      optimize,
      direction,
      change,
      easing: decomposeEasing(easing),
      duration: setSpeed(speed, duration, index)
    };

    const animationTimeout = setSpeed(speed, timeout, index);
    const totalDuration = animationTimeout + animation.duration;

    if (direction != "normal")
      reverseKeyframes(keyframes);

    if (element) {
      if (optimize)
        accelerate(element, keyframes);

      if (blur) {
        animation.blur = normalizeBlur(computeValue(blur, index));
        animation.gaussian = blurs.add(animation);
      }
    }

    if (totalDuration > last.totalDuration) {
      last.animation = animation;
      last.totalDuration = totalDuration;
    }

    if (animationTimeout) await delay(animationTimeout);
    rAF.add(animation);
  });

  const {animation} = last;
  if (!animation) return;
  animation.end = resolve;
  animation.options = options;
};

const tick = now => {
  const {all} = rAF;
  all.forEach(object => {
    trackTime(object, now);
    const progress = getProgress(object);
    const {
      element,
      keyframes,
      loop,
      optimize,
      direction,
      change,
      easing,
      duration,
      gaussian,
      end,
      options
    } = object;

    // object is an animation
    if (direction) {
      let curve = progress;
      switch (progress) {
        case 0:
          if (direction == "alternate") reverseKeyframes(keyframes);
          break;
        case 1:
          if (loop)
            resetTime(object);
          else {
            all.delete(object);
            if (optimize && element) accelerate(element);
            if (gaussian) clearBlur(element, gaussian);
          }
          if (end) end(options);
          break;
        default:
          curve = ease(easing, progress);
      }
      if (gaussian) setDeviation(object, curve);
      if (change && end) change(curve);
      if (element) Object.assign(element.style, createStyles(keyframes, curve));
      return;
    }

    // object is a delay
    if (progress < 1) return;
    all.delete(object);
    end(duration);
  });

  if (all.size) requestAnimationFrame(tick);
};

document.addEventListener("visibilitychange", () => {
  const now = performance.now();

  if (document.hidden) {
    const {all} = rAF;
    paused.time = now;
    paused.all = new Set(all);
    all.clear();
    return;
  }

  const {all, time} = paused;
  if (!all) return;
  const elapsed = now - time;
  requestAnimationFrame(() =>
    all.forEach(object => {
      object.startTime += elapsed;
      rAF.add(object);
    }));
});


// exports
// =======

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (options =>
  new Promise(resolve => addAnimations(options, resolve)));

const delay = duration =>
  new Promise(resolve => rAF.add({
    duration,
    end: resolve
  }));

const stop = elements => {
  const {all} = rAF;
  const nodes = getElements(elements);
  all.forEach(object => {
    if (nodes.includes(object.element)) all.delete(object);
  });
  return nodes;
};


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/contactpage.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/contactpage.css ***!
  \***********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.contactPage{
    height: 100%;
    display: grid;
    grid-template-rows: 45px auto 1fr auto;
}
.contactPage > div:nth-child(3){
    align-self: center;
    margin-top: 10px;
    margin-bottom: 10px;
}
.contactPage > .navigation > div:nth-child(3){
    border-bottom: 2px solid var(--text-color);
}

.contactPage img{
    height: 50px;
}
.contactPage .menu > div{
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    gap:10px;
}
.contactPage .menu{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.maps{
    margin:20px;
}
.contactPage .menu > div:nth-child(3){
    margin:10px;
}
`, "",{"version":3,"sources":["webpack://./src/css/contactpage.css"],"names":[],"mappings":"AAAA;IACI,YAAY;IACZ,aAAa;IACb,sCAAsC;AAC1C;AACA;IACI,kBAAkB;IAClB,gBAAgB;IAChB,mBAAmB;AACvB;AACA;IACI,0CAA0C;AAC9C;;AAEA;IACI,YAAY;AAChB;AACA;IACI,aAAa;IACb,uBAAuB;IACvB,mBAAmB;IACnB,eAAe;IACf,QAAQ;AACZ;AACA;IACI,aAAa;IACb,sBAAsB;IACtB,uBAAuB;IACvB,mBAAmB;AACvB;AACA;IACI,WAAW;AACf;AACA;IACI,WAAW;AACf","sourcesContent":[".contactPage{\n    height: 100%;\n    display: grid;\n    grid-template-rows: 45px auto 1fr auto;\n}\n.contactPage > div:nth-child(3){\n    align-self: center;\n    margin-top: 10px;\n    margin-bottom: 10px;\n}\n.contactPage > .navigation > div:nth-child(3){\n    border-bottom: 2px solid var(--text-color);\n}\n\n.contactPage img{\n    height: 50px;\n}\n.contactPage .menu > div{\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    font-size: 2rem;\n    gap:10px;\n}\n.contactPage .menu{\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n}\n.maps{\n    margin:20px;\n}\n.contactPage .menu > div:nth-child(3){\n    margin:10px;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/homepage.css":
/*!********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/homepage.css ***!
  \********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.homePage{
    height: 100%;
    display: grid;
    grid-template-rows:45px repeat(2,auto) 1fr auto auto;
}
.navigation{
    display: flex;
    justify-content: center;
    gap:100px;
    margin: 10px;
    color: var(--text-color);
    z-index: 1;

}
hr{
    width: 50%;
    border:1px solid black;
    z-index: 1;
}
.heading{
    display: flex;
    flex-direction: column;
    align-items: center;    
}
.mainCard{
    display: flex;
}
.footer{
    display: flex;
    align-items: center;
    justify-content: center;
    gap:10px;
}
.footer img{
    height: 40px;
}
.footer img:hover{
    transform: rotate(720deg);
    transition: all 1s;
}
.heading > img{
    height: 430px;
}
.heading > div:nth-child(2){
    color: white;
    opacity: 0.7;
    font-size: 1.4rem;
    margin-top:-60px;
    margin-bottom: 50px;
    color: var(--text-color);
}
/* Cards */
.mainCard{
    width: 80%;
    margin:0 auto;
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap:20px;
    align-self: center;
    margin-bottom: 20px;
}
.card{
    box-sizing: border-box;
    height: 300px;
    background-color: white;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap:20px;
    font-size: 1.3rem;
    padding:20px;
    overflow: auto;  
    border: 3px solid black;
    border-radius: 5px;
    background-color: white;
    background-color: rgba(246,175,133,0.7);

}
.mainCard > div:nth-child(2){
    z-index: 1;
}
.card img{
    height: 50px;
}
.card > div:nth-child(2){
    font-size: 1.5rem;
}
.card > div:nth-child(3){
    opacity: 0.6;
    font-style: italic;
}

/* navigation selection bar */
.navigation > div{
    padding-right: 5px;
    padding-left: 5px;
}
.homePage > .navigation > div:nth-child(1){
    border-bottom: 2px solid var(--text-color);
}

`, "",{"version":3,"sources":["webpack://./src/css/homepage.css"],"names":[],"mappings":"AAAA;IACI,YAAY;IACZ,aAAa;IACb,oDAAoD;AACxD;AACA;IACI,aAAa;IACb,uBAAuB;IACvB,SAAS;IACT,YAAY;IACZ,wBAAwB;IACxB,UAAU;;AAEd;AACA;IACI,UAAU;IACV,sBAAsB;IACtB,UAAU;AACd;AACA;IACI,aAAa;IACb,sBAAsB;IACtB,mBAAmB;AACvB;AACA;IACI,aAAa;AACjB;AACA;IACI,aAAa;IACb,mBAAmB;IACnB,uBAAuB;IACvB,QAAQ;AACZ;AACA;IACI,YAAY;AAChB;AACA;IACI,yBAAyB;IACzB,kBAAkB;AACtB;AACA;IACI,aAAa;AACjB;AACA;IACI,YAAY;IACZ,YAAY;IACZ,iBAAiB;IACjB,gBAAgB;IAChB,mBAAmB;IACnB,wBAAwB;AAC5B;AACA,UAAU;AACV;IACI,UAAU;IACV,aAAa;IACb,aAAa;IACb,oCAAoC;IACpC,QAAQ;IACR,kBAAkB;IAClB,mBAAmB;AACvB;AACA;IACI,sBAAsB;IACtB,aAAa;IACb,uBAAuB;IACvB,kBAAkB;IAClB,aAAa;IACb,sBAAsB;IACtB,uBAAuB;IACvB,mBAAmB;IACnB,QAAQ;IACR,iBAAiB;IACjB,YAAY;IACZ,cAAc;IACd,uBAAuB;IACvB,kBAAkB;IAClB,uBAAuB;IACvB,uCAAuC;;AAE3C;AACA;IACI,UAAU;AACd;AACA;IACI,YAAY;AAChB;AACA;IACI,iBAAiB;AACrB;AACA;IACI,YAAY;IACZ,kBAAkB;AACtB;;AAEA,6BAA6B;AAC7B;IACI,kBAAkB;IAClB,iBAAiB;AACrB;AACA;IACI,0CAA0C;AAC9C","sourcesContent":[".homePage{\n    height: 100%;\n    display: grid;\n    grid-template-rows:45px repeat(2,auto) 1fr auto auto;\n}\n.navigation{\n    display: flex;\n    justify-content: center;\n    gap:100px;\n    margin: 10px;\n    color: var(--text-color);\n    z-index: 1;\n\n}\nhr{\n    width: 50%;\n    border:1px solid black;\n    z-index: 1;\n}\n.heading{\n    display: flex;\n    flex-direction: column;\n    align-items: center;    \n}\n.mainCard{\n    display: flex;\n}\n.footer{\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    gap:10px;\n}\n.footer img{\n    height: 40px;\n}\n.footer img:hover{\n    transform: rotate(720deg);\n    transition: all 1s;\n}\n.heading > img{\n    height: 430px;\n}\n.heading > div:nth-child(2){\n    color: white;\n    opacity: 0.7;\n    font-size: 1.4rem;\n    margin-top:-60px;\n    margin-bottom: 50px;\n    color: var(--text-color);\n}\n/* Cards */\n.mainCard{\n    width: 80%;\n    margin:0 auto;\n    display: grid;\n    grid-template-columns: repeat(3,1fr);\n    gap:20px;\n    align-self: center;\n    margin-bottom: 20px;\n}\n.card{\n    box-sizing: border-box;\n    height: 300px;\n    background-color: white;\n    text-align: center;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n    gap:20px;\n    font-size: 1.3rem;\n    padding:20px;\n    overflow: auto;  \n    border: 3px solid black;\n    border-radius: 5px;\n    background-color: white;\n    background-color: rgba(246,175,133,0.7);\n\n}\n.mainCard > div:nth-child(2){\n    z-index: 1;\n}\n.card img{\n    height: 50px;\n}\n.card > div:nth-child(2){\n    font-size: 1.5rem;\n}\n.card > div:nth-child(3){\n    opacity: 0.6;\n    font-style: italic;\n}\n\n/* navigation selection bar */\n.navigation > div{\n    padding-right: 5px;\n    padding-left: 5px;\n}\n.homePage > .navigation > div:nth-child(1){\n    border-bottom: 2px solid var(--text-color);\n}\n\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/index.css":
/*!*****************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/index.css ***!
  \*****************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:root{
    font-family: 'Patrick Hand', cursive;
    --text-color: rgba(246,175,133,255);
    --bg-color:  rgba(73,96,166,255)
}
body{
    background-color: var(--bg-color);
    height: 99vh;
    width: 100vw;
}
.content{
    height: 99vh;
    width: 100vw;
}
button{
    background-color: var(--bg-color);
    border:0px; 
    color:var(--text-color)
}`, "",{"version":3,"sources":["webpack://./src/css/index.css"],"names":[],"mappings":"AACA;IACI,oCAAoC;IACpC,mCAAmC;IACnC;AACJ;AACA;IACI,iCAAiC;IACjC,YAAY;IACZ,YAAY;AAChB;AACA;IACI,YAAY;IACZ,YAAY;AAChB;AACA;IACI,iCAAiC;IACjC,UAAU;IACV;AACJ","sourcesContent":["@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');\n:root{\n    font-family: 'Patrick Hand', cursive;\n    --text-color: rgba(246,175,133,255);\n    --bg-color:  rgba(73,96,166,255)\n}\nbody{\n    background-color: var(--bg-color);\n    height: 99vh;\n    width: 100vw;\n}\n.content{\n    height: 99vh;\n    width: 100vw;\n}\nbutton{\n    background-color: var(--bg-color);\n    border:0px; \n    color:var(--text-color)\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/menupage.css":
/*!********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/menupage.css ***!
  \********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.menuPage{
    height: 99vh;
    display: grid;
    grid-template-rows: 45px auto 1fr auto auto;   
}
.menuPage > div:nth-child(3){
    align-self: center;
}
.outerMenu{
    height: 78vh;
    width: 70vw;
    margin:0 auto;    
    background-color: white;
    border:3px solid black;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--text-color)
}
.menu{
    height: 90%;
    width: 95%;
    border:3px solid black;
    border-radius: 5px;
    background-color: white;
    overflow: auto;
}
.menuPage .menu {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 240px 1fr;
    grid-auto-flow: column;
}
.menuPage .menu hr {
    border: 2px solid black;
    border-top-right-radius: 50%;
    border-bottom-right-radius: 50%;
    width: 80%;
    margin:0px;
}
.title{
    padding:10px;
    font-size: 5rem;
    margin-top:10px;
    padding-top:0px;
    border-right: 2px solid black;
    z-index: 2;
    background-color: white;
}

section img {
    width: 120px;
    height: 82px;
    border-radius: 20%;
    border:2px solid black;
    margin-left: 10px;
}
section > div:nth-child(1){
    font-size: 1.5rem;
    margin: 10px;
    padding-left:10px;
    font-weight: bolder;
    border: 2px solid black;
    width: 88px;
    height: 40px;
    border-radius: 5%;
    border-top-left-radius: 30%;
    border-top-right-radius: 30%;
}
section > div{
    display: grid;
    grid-template-columns: auto 1fr;
    grid-auto-flow: column;
    align-items: center;
    font-size: 1.5rem;
    gap:10px;
    margin-bottom: 5px;
}
section > div > div:nth-child(3){
    margin-right: 15px;
}
.pastry{
    display: grid;
    grid-template-rows: 60px repeat(3,auto);
    margin-bottom: 10px;
    border-right: 2px solid black;
    z-index: 2;
    background-color: white;
}
.desert,
.drink{
    display: grid;
    grid-row: 1 / 3;
    margin-top:10px;
    margin-bottom: 10px;
}
.desert{
    border-right: 2px solid black;
    z-index: 1;
    background-color: white;
}
.desert > div:nth-child(1){
    width: 80px;
    align-self: center;
}
.drink > div:nth-child(1){
    width: 70px;
    align-self: center;
}
.menuPage > .navigation > div:nth-child(2){
    border-bottom: 2px solid var(--text-color);
}
.drink{
    z-index: 0;
}
`, "",{"version":3,"sources":["webpack://./src/css/menupage.css"],"names":[],"mappings":"AAAA;IACI,YAAY;IACZ,aAAa;IACb,2CAA2C;AAC/C;AACA;IACI,kBAAkB;AACtB;AACA;IACI,YAAY;IACZ,WAAW;IACX,aAAa;IACb,uBAAuB;IACvB,sBAAsB;IACtB,kBAAkB;IAClB,aAAa;IACb,uBAAuB;IACvB,mBAAmB;IACnB;AACJ;AACA;IACI,WAAW;IACX,UAAU;IACV,sBAAsB;IACtB,kBAAkB;IAClB,uBAAuB;IACvB,cAAc;AAClB;AACA;IACI,aAAa;IACb,qCAAqC;IACrC,6BAA6B;IAC7B,sBAAsB;AAC1B;AACA;IACI,uBAAuB;IACvB,4BAA4B;IAC5B,+BAA+B;IAC/B,UAAU;IACV,UAAU;AACd;AACA;IACI,YAAY;IACZ,eAAe;IACf,eAAe;IACf,eAAe;IACf,6BAA6B;IAC7B,UAAU;IACV,uBAAuB;AAC3B;;AAEA;IACI,YAAY;IACZ,YAAY;IACZ,kBAAkB;IAClB,sBAAsB;IACtB,iBAAiB;AACrB;AACA;IACI,iBAAiB;IACjB,YAAY;IACZ,iBAAiB;IACjB,mBAAmB;IACnB,uBAAuB;IACvB,WAAW;IACX,YAAY;IACZ,iBAAiB;IACjB,2BAA2B;IAC3B,4BAA4B;AAChC;AACA;IACI,aAAa;IACb,+BAA+B;IAC/B,sBAAsB;IACtB,mBAAmB;IACnB,iBAAiB;IACjB,QAAQ;IACR,kBAAkB;AACtB;AACA;IACI,kBAAkB;AACtB;AACA;IACI,aAAa;IACb,uCAAuC;IACvC,mBAAmB;IACnB,6BAA6B;IAC7B,UAAU;IACV,uBAAuB;AAC3B;AACA;;IAEI,aAAa;IACb,eAAe;IACf,eAAe;IACf,mBAAmB;AACvB;AACA;IACI,6BAA6B;IAC7B,UAAU;IACV,uBAAuB;AAC3B;AACA;IACI,WAAW;IACX,kBAAkB;AACtB;AACA;IACI,WAAW;IACX,kBAAkB;AACtB;AACA;IACI,0CAA0C;AAC9C;AACA;IACI,UAAU;AACd","sourcesContent":[".menuPage{\n    height: 99vh;\n    display: grid;\n    grid-template-rows: 45px auto 1fr auto auto;   \n}\n.menuPage > div:nth-child(3){\n    align-self: center;\n}\n.outerMenu{\n    height: 78vh;\n    width: 70vw;\n    margin:0 auto;    \n    background-color: white;\n    border:3px solid black;\n    border-radius: 5px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    background-color: var(--text-color)\n}\n.menu{\n    height: 90%;\n    width: 95%;\n    border:3px solid black;\n    border-radius: 5px;\n    background-color: white;\n    overflow: auto;\n}\n.menuPage .menu {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    grid-template-rows: 240px 1fr;\n    grid-auto-flow: column;\n}\n.menuPage .menu hr {\n    border: 2px solid black;\n    border-top-right-radius: 50%;\n    border-bottom-right-radius: 50%;\n    width: 80%;\n    margin:0px;\n}\n.title{\n    padding:10px;\n    font-size: 5rem;\n    margin-top:10px;\n    padding-top:0px;\n    border-right: 2px solid black;\n    z-index: 2;\n    background-color: white;\n}\n\nsection img {\n    width: 120px;\n    height: 82px;\n    border-radius: 20%;\n    border:2px solid black;\n    margin-left: 10px;\n}\nsection > div:nth-child(1){\n    font-size: 1.5rem;\n    margin: 10px;\n    padding-left:10px;\n    font-weight: bolder;\n    border: 2px solid black;\n    width: 88px;\n    height: 40px;\n    border-radius: 5%;\n    border-top-left-radius: 30%;\n    border-top-right-radius: 30%;\n}\nsection > div{\n    display: grid;\n    grid-template-columns: auto 1fr;\n    grid-auto-flow: column;\n    align-items: center;\n    font-size: 1.5rem;\n    gap:10px;\n    margin-bottom: 5px;\n}\nsection > div > div:nth-child(3){\n    margin-right: 15px;\n}\n.pastry{\n    display: grid;\n    grid-template-rows: 60px repeat(3,auto);\n    margin-bottom: 10px;\n    border-right: 2px solid black;\n    z-index: 2;\n    background-color: white;\n}\n.desert,\n.drink{\n    display: grid;\n    grid-row: 1 / 3;\n    margin-top:10px;\n    margin-bottom: 10px;\n}\n.desert{\n    border-right: 2px solid black;\n    z-index: 1;\n    background-color: white;\n}\n.desert > div:nth-child(1){\n    width: 80px;\n    align-self: center;\n}\n.drink > div:nth-child(1){\n    width: 70px;\n    align-self: center;\n}\n.menuPage > .navigation > div:nth-child(2){\n    border-bottom: 2px solid var(--text-color);\n}\n.drink{\n    z-index: 0;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/normalize.css":
/*!*********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/normalize.css ***!
  \*********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */

/* Document
   ========================================================================== */

/**
 * 1. Correct the line height in all browsers.
 * 2. Prevent adjustments of font size after orientation changes in iOS.
 */

 html {
    line-height: 1.15; /* 1 */
    -webkit-text-size-adjust: 100%; /* 2 */
  }
  
  /* Sections
     ========================================================================== */
  
  /**
   * Remove the margin in all browsers.
   */
  
  body {
    margin: 0;
  }
  
  /**
   * Render the \`main\` element consistently in IE.
   */
  
  main {
    display: block;
  }
  
  /**
   * Correct the font size and margin on \`h1\` elements within \`section\` and
   * \`article\` contexts in Chrome, Firefox, and Safari.
   */
  
  h1 {
    font-size: 2em;
    margin: 0.67em 0;
  }
  
  /* Grouping content
     ========================================================================== */
  
  /**
   * 1. Add the correct box sizing in Firefox.
   * 2. Show the overflow in Edge and IE.
   */
  
  hr {
    box-sizing: content-box; /* 1 */
    height: 0; /* 1 */
    overflow: visible; /* 2 */
  }
  
  /**
   * 1. Correct the inheritance and scaling of font size in all browsers.
   * 2. Correct the odd \`em\` font sizing in all browsers.
   */
  
  pre {
    font-family: monospace, monospace; /* 1 */
    font-size: 1em; /* 2 */
  }
  
  /* Text-level semantics
     ========================================================================== */
  
  /**
   * Remove the gray background on active links in IE 10.
   */
  
  a {
    background-color: transparent;
  }
  
  /**
   * 1. Remove the bottom border in Chrome 57-
   * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.
   */
  
  abbr[title] {
    border-bottom: none; /* 1 */
    text-decoration: underline; /* 2 */
    text-decoration: underline dotted; /* 2 */
  }
  
  /**
   * Add the correct font weight in Chrome, Edge, and Safari.
   */
  
  b,
  strong {
    font-weight: bolder;
  }
  
  /**
   * 1. Correct the inheritance and scaling of font size in all browsers.
   * 2. Correct the odd \`em\` font sizing in all browsers.
   */
  
  code,
  kbd,
  samp {
    font-family: monospace, monospace; /* 1 */
    font-size: 1em; /* 2 */
  }
  
  /**
   * Add the correct font size in all browsers.
   */
  
  small {
    font-size: 80%;
  }
  
  /**
   * Prevent \`sub\` and \`sup\` elements from affecting the line height in
   * all browsers.
   */
  
  sub,
  sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }
  
  sub {
    bottom: -0.25em;
  }
  
  sup {
    top: -0.5em;
  }
  
  /* Embedded content
     ========================================================================== */
  
  /**
   * Remove the border on images inside links in IE 10.
   */
  
  img {
    border-style: none;
  }
  
  /* Forms
     ========================================================================== */
  
  /**
   * 1. Change the font styles in all browsers.
   * 2. Remove the margin in Firefox and Safari.
   */
  
  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit; /* 1 */
    font-size: 100%; /* 1 */
    line-height: 1.15; /* 1 */
    margin: 0; /* 2 */
  }
  
  /**
   * Show the overflow in IE.
   * 1. Show the overflow in Edge.
   */
  
  button,
  input { /* 1 */
    overflow: visible;
  }
  
  /**
   * Remove the inheritance of text transform in Edge, Firefox, and IE.
   * 1. Remove the inheritance of text transform in Firefox.
   */
  
  button,
  select { /* 1 */
    text-transform: none;
  }
  
  /**
   * Correct the inability to style clickable types in iOS and Safari.
   */
  
  button,
  [type="button"],
  [type="reset"],
  [type="submit"] {
    -webkit-appearance: button;
  }
  
  /**
   * Remove the inner border and padding in Firefox.
   */
  
  button::-moz-focus-inner,
  [type="button"]::-moz-focus-inner,
  [type="reset"]::-moz-focus-inner,
  [type="submit"]::-moz-focus-inner {
    border-style: none;
    padding: 0;
  }
  
  /**
   * Restore the focus styles unset by the previous rule.
   */
  
  button:-moz-focusring,
  [type="button"]:-moz-focusring,
  [type="reset"]:-moz-focusring,
  [type="submit"]:-moz-focusring {
    outline: 1px dotted ButtonText;
  }
  
  /**
   * Correct the padding in Firefox.
   */
  
  fieldset {
    padding: 0.35em 0.75em 0.625em;
  }
  
  /**
   * 1. Correct the text wrapping in Edge and IE.
   * 2. Correct the color inheritance from \`fieldset\` elements in IE.
   * 3. Remove the padding so developers are not caught out when they zero out
   *    \`fieldset\` elements in all browsers.
   */
  
  legend {
    box-sizing: border-box; /* 1 */
    color: inherit; /* 2 */
    display: table; /* 1 */
    max-width: 100%; /* 1 */
    padding: 0; /* 3 */
    white-space: normal; /* 1 */
  }
  
  /**
   * Add the correct vertical alignment in Chrome, Firefox, and Opera.
   */
  
  progress {
    vertical-align: baseline;
  }
  
  /**
   * Remove the default vertical scrollbar in IE 10+.
   */
  
  textarea {
    overflow: auto;
  }
  
  /**
   * 1. Add the correct box sizing in IE 10.
   * 2. Remove the padding in IE 10.
   */
  
  [type="checkbox"],
  [type="radio"] {
    box-sizing: border-box; /* 1 */
    padding: 0; /* 2 */
  }
  
  /**
   * Correct the cursor style of increment and decrement buttons in Chrome.
   */
  
  [type="number"]::-webkit-inner-spin-button,
  [type="number"]::-webkit-outer-spin-button {
    height: auto;
  }
  
  /**
   * 1. Correct the odd appearance in Chrome and Safari.
   * 2. Correct the outline style in Safari.
   */
  
  [type="search"] {
    -webkit-appearance: textfield; /* 1 */
    outline-offset: -2px; /* 2 */
  }
  
  /**
   * Remove the inner padding in Chrome and Safari on macOS.
   */
  
  [type="search"]::-webkit-search-decoration {
    -webkit-appearance: none;
  }
  
  /**
   * 1. Correct the inability to style clickable types in iOS and Safari.
   * 2. Change font properties to \`inherit\` in Safari.
   */
  
  ::-webkit-file-upload-button {
    -webkit-appearance: button; /* 1 */
    font: inherit; /* 2 */
  }
  
  /* Interactive
     ========================================================================== */
  
  /*
   * Add the correct display in Edge, IE 10+, and Firefox.
   */
  
  details {
    display: block;
  }
  
  /*
   * Add the correct display in all browsers.
   */
  
  summary {
    display: list-item;
  }
  
  /* Misc
     ========================================================================== */
  
  /**
   * Add the correct display in IE 10+.
   */
  
  template {
    display: none;
  }
  
  /**
   * Add the correct display in IE 10.
   */
  
  [hidden] {
    display: none;
  }
  `, "",{"version":3,"sources":["webpack://./src/css/normalize.css"],"names":[],"mappings":"AAAA,2EAA2E;;AAE3E;+EAC+E;;AAE/E;;;EAGE;;CAED;IACG,iBAAiB,EAAE,MAAM;IACzB,8BAA8B,EAAE,MAAM;EACxC;;EAEA;iFAC+E;;EAE/E;;IAEE;;EAEF;IACE,SAAS;EACX;;EAEA;;IAEE;;EAEF;IACE,cAAc;EAChB;;EAEA;;;IAGE;;EAEF;IACE,cAAc;IACd,gBAAgB;EAClB;;EAEA;iFAC+E;;EAE/E;;;IAGE;;EAEF;IACE,uBAAuB,EAAE,MAAM;IAC/B,SAAS,EAAE,MAAM;IACjB,iBAAiB,EAAE,MAAM;EAC3B;;EAEA;;;IAGE;;EAEF;IACE,iCAAiC,EAAE,MAAM;IACzC,cAAc,EAAE,MAAM;EACxB;;EAEA;iFAC+E;;EAE/E;;IAEE;;EAEF;IACE,6BAA6B;EAC/B;;EAEA;;;IAGE;;EAEF;IACE,mBAAmB,EAAE,MAAM;IAC3B,0BAA0B,EAAE,MAAM;IAClC,iCAAiC,EAAE,MAAM;EAC3C;;EAEA;;IAEE;;EAEF;;IAEE,mBAAmB;EACrB;;EAEA;;;IAGE;;EAEF;;;IAGE,iCAAiC,EAAE,MAAM;IACzC,cAAc,EAAE,MAAM;EACxB;;EAEA;;IAEE;;EAEF;IACE,cAAc;EAChB;;EAEA;;;IAGE;;EAEF;;IAEE,cAAc;IACd,cAAc;IACd,kBAAkB;IAClB,wBAAwB;EAC1B;;EAEA;IACE,eAAe;EACjB;;EAEA;IACE,WAAW;EACb;;EAEA;iFAC+E;;EAE/E;;IAEE;;EAEF;IACE,kBAAkB;EACpB;;EAEA;iFAC+E;;EAE/E;;;IAGE;;EAEF;;;;;IAKE,oBAAoB,EAAE,MAAM;IAC5B,eAAe,EAAE,MAAM;IACvB,iBAAiB,EAAE,MAAM;IACzB,SAAS,EAAE,MAAM;EACnB;;EAEA;;;IAGE;;EAEF;UACQ,MAAM;IACZ,iBAAiB;EACnB;;EAEA;;;IAGE;;EAEF;WACS,MAAM;IACb,oBAAoB;EACtB;;EAEA;;IAEE;;EAEF;;;;IAIE,0BAA0B;EAC5B;;EAEA;;IAEE;;EAEF;;;;IAIE,kBAAkB;IAClB,UAAU;EACZ;;EAEA;;IAEE;;EAEF;;;;IAIE,8BAA8B;EAChC;;EAEA;;IAEE;;EAEF;IACE,8BAA8B;EAChC;;EAEA;;;;;IAKE;;EAEF;IACE,sBAAsB,EAAE,MAAM;IAC9B,cAAc,EAAE,MAAM;IACtB,cAAc,EAAE,MAAM;IACtB,eAAe,EAAE,MAAM;IACvB,UAAU,EAAE,MAAM;IAClB,mBAAmB,EAAE,MAAM;EAC7B;;EAEA;;IAEE;;EAEF;IACE,wBAAwB;EAC1B;;EAEA;;IAEE;;EAEF;IACE,cAAc;EAChB;;EAEA;;;IAGE;;EAEF;;IAEE,sBAAsB,EAAE,MAAM;IAC9B,UAAU,EAAE,MAAM;EACpB;;EAEA;;IAEE;;EAEF;;IAEE,YAAY;EACd;;EAEA;;;IAGE;;EAEF;IACE,6BAA6B,EAAE,MAAM;IACrC,oBAAoB,EAAE,MAAM;EAC9B;;EAEA;;IAEE;;EAEF;IACE,wBAAwB;EAC1B;;EAEA;;;IAGE;;EAEF;IACE,0BAA0B,EAAE,MAAM;IAClC,aAAa,EAAE,MAAM;EACvB;;EAEA;iFAC+E;;EAE/E;;IAEE;;EAEF;IACE,cAAc;EAChB;;EAEA;;IAEE;;EAEF;IACE,kBAAkB;EACpB;;EAEA;iFAC+E;;EAE/E;;IAEE;;EAEF;IACE,aAAa;EACf;;EAEA;;IAEE;;EAEF;IACE,aAAa;EACf","sourcesContent":["/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */\n\n/* Document\n   ========================================================================== */\n\n/**\n * 1. Correct the line height in all browsers.\n * 2. Prevent adjustments of font size after orientation changes in iOS.\n */\n\n html {\n    line-height: 1.15; /* 1 */\n    -webkit-text-size-adjust: 100%; /* 2 */\n  }\n  \n  /* Sections\n     ========================================================================== */\n  \n  /**\n   * Remove the margin in all browsers.\n   */\n  \n  body {\n    margin: 0;\n  }\n  \n  /**\n   * Render the `main` element consistently in IE.\n   */\n  \n  main {\n    display: block;\n  }\n  \n  /**\n   * Correct the font size and margin on `h1` elements within `section` and\n   * `article` contexts in Chrome, Firefox, and Safari.\n   */\n  \n  h1 {\n    font-size: 2em;\n    margin: 0.67em 0;\n  }\n  \n  /* Grouping content\n     ========================================================================== */\n  \n  /**\n   * 1. Add the correct box sizing in Firefox.\n   * 2. Show the overflow in Edge and IE.\n   */\n  \n  hr {\n    box-sizing: content-box; /* 1 */\n    height: 0; /* 1 */\n    overflow: visible; /* 2 */\n  }\n  \n  /**\n   * 1. Correct the inheritance and scaling of font size in all browsers.\n   * 2. Correct the odd `em` font sizing in all browsers.\n   */\n  \n  pre {\n    font-family: monospace, monospace; /* 1 */\n    font-size: 1em; /* 2 */\n  }\n  \n  /* Text-level semantics\n     ========================================================================== */\n  \n  /**\n   * Remove the gray background on active links in IE 10.\n   */\n  \n  a {\n    background-color: transparent;\n  }\n  \n  /**\n   * 1. Remove the bottom border in Chrome 57-\n   * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.\n   */\n  \n  abbr[title] {\n    border-bottom: none; /* 1 */\n    text-decoration: underline; /* 2 */\n    text-decoration: underline dotted; /* 2 */\n  }\n  \n  /**\n   * Add the correct font weight in Chrome, Edge, and Safari.\n   */\n  \n  b,\n  strong {\n    font-weight: bolder;\n  }\n  \n  /**\n   * 1. Correct the inheritance and scaling of font size in all browsers.\n   * 2. Correct the odd `em` font sizing in all browsers.\n   */\n  \n  code,\n  kbd,\n  samp {\n    font-family: monospace, monospace; /* 1 */\n    font-size: 1em; /* 2 */\n  }\n  \n  /**\n   * Add the correct font size in all browsers.\n   */\n  \n  small {\n    font-size: 80%;\n  }\n  \n  /**\n   * Prevent `sub` and `sup` elements from affecting the line height in\n   * all browsers.\n   */\n  \n  sub,\n  sup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n  }\n  \n  sub {\n    bottom: -0.25em;\n  }\n  \n  sup {\n    top: -0.5em;\n  }\n  \n  /* Embedded content\n     ========================================================================== */\n  \n  /**\n   * Remove the border on images inside links in IE 10.\n   */\n  \n  img {\n    border-style: none;\n  }\n  \n  /* Forms\n     ========================================================================== */\n  \n  /**\n   * 1. Change the font styles in all browsers.\n   * 2. Remove the margin in Firefox and Safari.\n   */\n  \n  button,\n  input,\n  optgroup,\n  select,\n  textarea {\n    font-family: inherit; /* 1 */\n    font-size: 100%; /* 1 */\n    line-height: 1.15; /* 1 */\n    margin: 0; /* 2 */\n  }\n  \n  /**\n   * Show the overflow in IE.\n   * 1. Show the overflow in Edge.\n   */\n  \n  button,\n  input { /* 1 */\n    overflow: visible;\n  }\n  \n  /**\n   * Remove the inheritance of text transform in Edge, Firefox, and IE.\n   * 1. Remove the inheritance of text transform in Firefox.\n   */\n  \n  button,\n  select { /* 1 */\n    text-transform: none;\n  }\n  \n  /**\n   * Correct the inability to style clickable types in iOS and Safari.\n   */\n  \n  button,\n  [type=\"button\"],\n  [type=\"reset\"],\n  [type=\"submit\"] {\n    -webkit-appearance: button;\n  }\n  \n  /**\n   * Remove the inner border and padding in Firefox.\n   */\n  \n  button::-moz-focus-inner,\n  [type=\"button\"]::-moz-focus-inner,\n  [type=\"reset\"]::-moz-focus-inner,\n  [type=\"submit\"]::-moz-focus-inner {\n    border-style: none;\n    padding: 0;\n  }\n  \n  /**\n   * Restore the focus styles unset by the previous rule.\n   */\n  \n  button:-moz-focusring,\n  [type=\"button\"]:-moz-focusring,\n  [type=\"reset\"]:-moz-focusring,\n  [type=\"submit\"]:-moz-focusring {\n    outline: 1px dotted ButtonText;\n  }\n  \n  /**\n   * Correct the padding in Firefox.\n   */\n  \n  fieldset {\n    padding: 0.35em 0.75em 0.625em;\n  }\n  \n  /**\n   * 1. Correct the text wrapping in Edge and IE.\n   * 2. Correct the color inheritance from `fieldset` elements in IE.\n   * 3. Remove the padding so developers are not caught out when they zero out\n   *    `fieldset` elements in all browsers.\n   */\n  \n  legend {\n    box-sizing: border-box; /* 1 */\n    color: inherit; /* 2 */\n    display: table; /* 1 */\n    max-width: 100%; /* 1 */\n    padding: 0; /* 3 */\n    white-space: normal; /* 1 */\n  }\n  \n  /**\n   * Add the correct vertical alignment in Chrome, Firefox, and Opera.\n   */\n  \n  progress {\n    vertical-align: baseline;\n  }\n  \n  /**\n   * Remove the default vertical scrollbar in IE 10+.\n   */\n  \n  textarea {\n    overflow: auto;\n  }\n  \n  /**\n   * 1. Add the correct box sizing in IE 10.\n   * 2. Remove the padding in IE 10.\n   */\n  \n  [type=\"checkbox\"],\n  [type=\"radio\"] {\n    box-sizing: border-box; /* 1 */\n    padding: 0; /* 2 */\n  }\n  \n  /**\n   * Correct the cursor style of increment and decrement buttons in Chrome.\n   */\n  \n  [type=\"number\"]::-webkit-inner-spin-button,\n  [type=\"number\"]::-webkit-outer-spin-button {\n    height: auto;\n  }\n  \n  /**\n   * 1. Correct the odd appearance in Chrome and Safari.\n   * 2. Correct the outline style in Safari.\n   */\n  \n  [type=\"search\"] {\n    -webkit-appearance: textfield; /* 1 */\n    outline-offset: -2px; /* 2 */\n  }\n  \n  /**\n   * Remove the inner padding in Chrome and Safari on macOS.\n   */\n  \n  [type=\"search\"]::-webkit-search-decoration {\n    -webkit-appearance: none;\n  }\n  \n  /**\n   * 1. Correct the inability to style clickable types in iOS and Safari.\n   * 2. Change font properties to `inherit` in Safari.\n   */\n  \n  ::-webkit-file-upload-button {\n    -webkit-appearance: button; /* 1 */\n    font: inherit; /* 2 */\n  }\n  \n  /* Interactive\n     ========================================================================== */\n  \n  /*\n   * Add the correct display in Edge, IE 10+, and Firefox.\n   */\n  \n  details {\n    display: block;\n  }\n  \n  /*\n   * Add the correct display in all browsers.\n   */\n  \n  summary {\n    display: list-item;\n  }\n  \n  /* Misc\n     ========================================================================== */\n  \n  /**\n   * Add the correct display in IE 10+.\n   */\n  \n  template {\n    display: none;\n  }\n  \n  /**\n   * Add the correct display in IE 10.\n   */\n  \n  [hidden] {\n    display: none;\n  }\n  "],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./src/css/contactpage.css":
/*!*********************************!*\
  !*** ./src/css/contactpage.css ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_contactpage_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./contactpage.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/contactpage.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_contactpage_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_contactpage_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_contactpage_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_contactpage_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/css/homepage.css":
/*!******************************!*\
  !*** ./src/css/homepage.css ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_homepage_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./homepage.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/homepage.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_homepage_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_homepage_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_homepage_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_homepage_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/css/index.css":
/*!***************************!*\
  !*** ./src/css/index.css ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./index.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/index.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/css/menupage.css":
/*!******************************!*\
  !*** ./src/css/menupage.css ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_menupage_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./menupage.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/menupage.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_menupage_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_menupage_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_menupage_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_menupage_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/css/normalize.css":
/*!*******************************!*\
  !*** ./src/css/normalize.css ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_normalize_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./normalize.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/normalize.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_normalize_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_normalize_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_normalize_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_normalize_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "./src/animation/animateContactPage.js":
/*!*********************************************!*\
  !*** ./src/animation/animateContactPage.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/animateplus/animateplus.js */ "./node_modules/animateplus/animateplus.js");


function contactAnimation(){
    let allDiv = document.querySelector(".contactPage").childNodes;
    allDiv = Array.from(allDiv);
    allDiv.splice(1,1);
    allDiv.splice(2,1);

    let contacts = document.querySelector(".menu").childNodes;
    contacts = Array.from(contacts);

    (0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: allDiv[0],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translateY(-200%)", "translateY(0%)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: contacts[0],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["skewX(180deg)", "skewX(0deg)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: contacts[2],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["skewX(180deg)", "skewX(0deg)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: contacts[3],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["skewX(180deg)", "skewX(0deg)"]
    })

    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: allDiv[2],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translateY(150%)", "translate(0%)"]
    })
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (contactAnimation);

/***/ }),

/***/ "./src/animation/animateHomePage.js":
/*!******************************************!*\
  !*** ./src/animation/animateHomePage.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/animateplus/animateplus.js */ "./node_modules/animateplus/animateplus.js");


function animation(){
    let allDiv = document.querySelector(".homePage").childNodes
    allDiv = Array.from(allDiv)
    allDiv.splice(1,1)
    allDiv.splice(3,1)
    
    let cards = allDiv[2].childNodes
    cards = Array.from(cards)

    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: allDiv[0],
        duration: 3000,
        delay: index => {index * 100}, 
        transform: ["translateY(-200%)", "translateY(0%)"]
    })
        
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: allDiv[1],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["scale(0)", "scale(1)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: cards[1],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["scale(0)", "scale(1)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: cards[0],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translate(-100%)", "translate(0%)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: cards[2],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translate(100%)", "translate(0%)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: allDiv[3],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translateY(150%)", "translate(0%)"]
    })
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (animation);


/***/ }),

/***/ "./src/animation/animationMenuPage.js":
/*!********************************************!*\
  !*** ./src/animation/animationMenuPage.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/animateplus/animateplus.js */ "./node_modules/animateplus/animateplus.js");


function menuAnimation(){
    let allDiv = document.querySelector(".menuPage").childNodes;
    allDiv = Array.from(allDiv);
    allDiv.splice(1,1)
    allDiv.splice(2,1)
    
    let pastry = document.querySelector(".pastry").childNodes;
    pastry = Array.from(pastry);
    let desert = document.querySelector(".desert").childNodes;
    desert = Array.from(desert);
    let drink = document.querySelector(".drink").childNodes;
    drink = Array.from(drink);

    (0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: allDiv[0],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translateY(-200%)", "translateY(0%)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: allDiv[2],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translateY(150%)", "translate(0%)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: pastry,
        duration: 3000,
        delay: index => index * 100,
        transform: ["translate(-100%)", "translate(0%)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: desert,
        duration: 3000,
        delay: index => index * 100,
        transform: ["translate(-100%)", "translate(0%)"]
    })
    ;(0,_node_modules_animateplus_animateplus_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
        elements: drink,
        duration: 3000,
        delay: index => index * 100,
        transform: ["translate(-100%)", "translate(0%)"]
    })
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (menuAnimation);

/***/ }),

/***/ "./src/componenets/contactpage.js":
/*!****************************************!*\
  !*** ./src/componenets/contactpage.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _homepage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./homepage */ "./src/componenets/homepage.js");
/* harmony import */ var _css_contactpage_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../css/contactpage.css */ "./src/css/contactpage.css");
/* harmony import */ var _images_phone_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../images/phone.svg */ "./images/phone.svg");
/* harmony import */ var _images_store_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../images/store.svg */ "./images/store.svg");
/* harmony import */ var _footer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./footer */ "./src/componenets/footer.js");
/* harmony import */ var _animation_animateContactPage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../animation/animateContactPage */ "./src/animation/animateContactPage.js");








function contactpage(){
    const content = document.querySelector(".content");

    const contactPageConent = document.createElement("div");
    contactPageConent.classList.add("contactPage");
    
    /* navigation */
    const navigation = document.createElement("div");
    navigation.classList.add("navigation");
    
    (0,_homepage__WEBPACK_IMPORTED_MODULE_0__.navigationName)("Home", navigation);
    (0,_homepage__WEBPACK_IMPORTED_MODULE_0__.navigationName)("Menu", navigation);
    (0,_homepage__WEBPACK_IMPORTED_MODULE_0__.navigationName)("Contact", navigation);

    contactPageConent.appendChild(navigation);
    contactPageConent.appendChild(document.createElement("hr"));
    
    /* outer loayout */
    let outerMenu = document.createElement("div");
    outerMenu.classList.add("outerMenu");
    let menu = document.createElement("div");
    menu.classList.add("menu");

    /* contacts */
    menu.appendChild(contacts("66666 99999 / 99999 66666", _images_phone_svg__WEBPACK_IMPORTED_MODULE_2__));
    menu.appendChild(document.createElement("hr"))
    menu.appendChild(contacts("Les Halles Castellanes, Rue de l'Herberie, 34000 Montpellier, France", _images_store_svg__WEBPACK_IMPORTED_MODULE_3__))
    
    /* maps */
    let maps = document.createElement("iframe");
    maps.classList.add("maps")
    maps.setAttribute("src", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.8261255859447!2d3.871937893016181!3d43.610161780715536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12b6afee8b023451%3A0x34940ef9425f292!2zQ3LDqG1lIGRlIGxhIENyw6htZQ!5e0!3m2!1sen!2sin!4v1695662811672!5m2!1sen!2sin")
    maps.setAttribute("width", "600");
    maps.setAttribute("height", "400");
    maps.setAttribute("loading", "lazy");
    maps.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    maps.setAttribute("style", "border:2px solid black;border-radius:5px")
    menu.appendChild(maps);


    outerMenu.appendChild(menu);
    contactPageConent.appendChild(outerMenu);
    contactPageConent.appendChild(document.createElement("hr"))
    contactPageConent.appendChild((0,_footer__WEBPACK_IMPORTED_MODULE_4__["default"])());
    content.appendChild(contactPageConent);

    (0,_animation_animateContactPage__WEBPACK_IMPORTED_MODULE_5__["default"])();
}


function contacts(number, img){
    let contact = document.createElement("div");
    let contactImg = document.createElement("img");
    contactImg.setAttribute("src", img);
    let contactNumber = document.createElement("div");
    contactNumber.textContent = number;

    contact.appendChild(contactImg);
    contact.appendChild(contactNumber);
    return contact
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (contactpage);

/***/ }),

/***/ "./src/componenets/footer.js":
/*!***********************************!*\
  !*** ./src/componenets/footer.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _images_github_svg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../images/github.svg */ "./images/github.svg");


function footer() {
    let mainFooter = document.createElement("div");
    mainFooter.classList.add("footer");

    let div = document.createElement("div");
    div.textContent = "Made by Adhithiyan";
    mainFooter.appendChild(div);

    let anchor = document.createElement("a");
    anchor.setAttribute("href", "https://github.com/xAdhithiyan");
    anchor.setAttribute("target", "_blank");
    let img = document.createElement("img");
    img.setAttribute("src", _images_github_svg__WEBPACK_IMPORTED_MODULE_0__)

    anchor.appendChild(img)
    mainFooter.appendChild(anchor);
    return mainFooter;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (footer);

/***/ }),

/***/ "./src/componenets/homepage.js":
/*!*************************************!*\
  !*** ./src/componenets/homepage.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   navigationName: () => (/* binding */ navigationName)
/* harmony export */ });
/* harmony import */ var _homepageCards__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./homepageCards */ "./src/componenets/homepageCards.js");
/* harmony import */ var _footer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./footer */ "./src/componenets/footer.js");
/* harmony import */ var _css_homepage_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../css/homepage.css */ "./src/css/homepage.css");
/* harmony import */ var _images_logo_jpeg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../images/logo.jpeg */ "./images/logo.jpeg");
/* harmony import */ var _animation_animateHomePage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../animation/animateHomePage */ "./src/animation/animateHomePage.js");






function homepage(){
    const content = document.querySelector(".content");
    const homePageContent = document.createElement("div");
    homePageContent.classList.add("homePage");


    /* navigation */
    const navigation = document.createElement("div");
    navigation.classList.add("navigation");
    
    navigationName("Home", navigation);
    navigationName("Menu", navigation);
    navigationName("Contact", navigation);

    homePageContent.appendChild(navigation);
    homePageContent.appendChild(document.createElement("hr"));


    /* heading */
    let heading = document.createElement("div");
    heading.classList.add("heading");

    let headingName = document.createElement("img");
    headingName.setAttribute("src", _images_logo_jpeg__WEBPACK_IMPORTED_MODULE_3__)
    let subHeadingName = document.createElement("div")
    subHeadingName.textContent = "Since 1927"
    
    heading.appendChild(headingName);
    heading.appendChild(subHeadingName)
    homePageContent.appendChild(heading);

    /* cards */
    let mainCard = document.createElement("div");
    mainCard.classList.add("mainCard");
    (0,_homepageCards__WEBPACK_IMPORTED_MODULE_0__["default"])(mainCard, "The New York Times" ,5 , "\"In the heart of the city that never sleeps, this pastry restaurant is a beacon of sweetness. Its elegant pastries and cakes are a true culinary masterpiece, elevating dessert to an art form.\"");
    (0,_homepageCards__WEBPACK_IMPORTED_MODULE_0__["default"])(mainCard, "Food & Wine Magazine" ,5 ,  "\"This pastry haven is a must-visit for anyone seeking an unforgettable dessert experience. Each bite is a symphony of flavors and textures, setting a new standard for pastry excellence.\"");
    (0,_homepageCards__WEBPACK_IMPORTED_MODULE_0__["default"])(mainCard, "The Michelin Guide",4 ,  "\"Earning our coveted star, this pastry restaurant is a destination for those seeking refined, exquisite desserts. With impeccable craftsmanship and a dedication to quality, it's a sweet revelation for discerning palates.\"");
    homePageContent.appendChild(mainCard);

    homePageContent.appendChild(document.createElement("hr"));
    /* footer */
    homePageContent.appendChild((0,_footer__WEBPACK_IMPORTED_MODULE_1__["default"])())
    
    content.appendChild(homePageContent)
    ;(0,_animation_animateHomePage__WEBPACK_IMPORTED_MODULE_4__["default"])();
}

function navigationName(str , navigation){
    let div = document.createElement("div");
    let btn = document.createElement("button");
    btn.textContent = str;
    div.appendChild(btn)
    navigation.appendChild(div);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (homepage);



/***/ }),

/***/ "./src/componenets/homepageCards.js":
/*!******************************************!*\
  !*** ./src/componenets/homepageCards.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _images_star_svg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../images/star.svg */ "./images/star.svg");


function homepageCards(mainCard, title, n, text){
    let card = document.createElement("div");
    card.classList.add("card");

    let imgDiv = document.createElement("div")
    for(let i = 0; i < n; i++){
        let img = document.createElement("img");
        img.setAttribute("src", _images_star_svg__WEBPACK_IMPORTED_MODULE_0__);
        imgDiv.appendChild(img);
    }
    card.appendChild(imgDiv)

    let heading = document.createElement("div");
    heading.textContent = title;
    card.appendChild(heading);

    let review = document.createElement("div");
    review.textContent = text;
    card.appendChild(review);

    mainCard.appendChild(card)

    
    
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (homepageCards);

/***/ }),

/***/ "./src/componenets/menupage.js":
/*!*************************************!*\
  !*** ./src/componenets/menupage.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _homepage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./homepage */ "./src/componenets/homepage.js");
/* harmony import */ var _css_menupage_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../css/menupage.css */ "./src/css/menupage.css");
/* harmony import */ var _footer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./footer */ "./src/componenets/footer.js");
/* harmony import */ var _animation_animationMenuPage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../animation/animationMenuPage */ "./src/animation/animationMenuPage.js");
/* harmony import */ var _images_pastry_1_jpg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../images/pastry-1.jpg */ "./images/pastry-1.jpg");
/* harmony import */ var _images_pastry_2_jpg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../images/pastry-2.jpg */ "./images/pastry-2.jpg");
/* harmony import */ var _images_pastry_3_jpg__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../images/pastry-3.jpg */ "./images/pastry-3.jpg");
/* harmony import */ var _images_desert_1_jpg__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../images/desert-1.jpg */ "./images/desert-1.jpg");
/* harmony import */ var _images_desert_2_jpg__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../images/desert-2.jpg */ "./images/desert-2.jpg");
/* harmony import */ var _images_desert_3_jpg__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../images/desert-3.jpg */ "./images/desert-3.jpg");
/* harmony import */ var _images_desert_4_jpg__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../images/desert-4.jpg */ "./images/desert-4.jpg");
/* harmony import */ var _images_desert_5_jpg__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../images/desert-5.jpg */ "./images/desert-5.jpg");
/* harmony import */ var _images_drink_1_jpg__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../images/drink-1.jpg */ "./images/drink-1.jpg");
/* harmony import */ var _images_drink_2_jpg__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../../images/drink-2.jpg */ "./images/drink-2.jpg");
/* harmony import */ var _images_drink_3_jpg__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../../images/drink-3.jpg */ "./images/drink-3.jpg");
/* harmony import */ var _images_drink_4_jpg__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../../images/drink-4.jpg */ "./images/drink-4.jpg");
/* harmony import */ var _images_drink_5_jpg__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../../images/drink-5.jpg */ "./images/drink-5.jpg");


















function menupage(){
    const content = document.querySelector(".content");

    const menuPageConent = document.createElement("div");
    menuPageConent.classList.add("menuPage");
    
    /* navigation */
    const navigation = document.createElement("div");
    navigation.classList.add("navigation");
    
    (0,_homepage__WEBPACK_IMPORTED_MODULE_0__.navigationName)("Home", navigation);
    (0,_homepage__WEBPACK_IMPORTED_MODULE_0__.navigationName)("Menu", navigation);
    (0,_homepage__WEBPACK_IMPORTED_MODULE_0__.navigationName)("Contact", navigation);

    menuPageConent.appendChild(navigation);
    menuPageConent.appendChild(document.createElement("hr"));

    let outerMenu = document.createElement("div");
    outerMenu.classList.add("outerMenu");
    let menu = document.createElement("div");
    menu.classList.add("menu");

    /* title */
    let title = document.createElement("div");
    title.classList.add("title");
    let div1 = document.createElement("div");
    div1.textContent = "THE";
    let div2 = document.createElement("div");
    div2.textContent = "MENU";
    title.appendChild(div1);
    title.appendChild(div2);
    title.appendChild(document.createElement("hr"));

    /* section-1 */
    let pastry = document.createElement("section");
    pastry.classList.add("pastry");
    let pastryTitle = document.createElement("div");
    pastryTitle.textContent = "Pastries";
    pastry.appendChild(pastryTitle);
    pastry.appendChild(food(_images_pastry_1_jpg__WEBPACK_IMPORTED_MODULE_4__, "Pain au Chocolat", "$15"));
    pastry.appendChild(food(_images_pastry_2_jpg__WEBPACK_IMPORTED_MODULE_5__, "Chausson aux Pommes", "$15"));
    pastry.appendChild(food(_images_pastry_3_jpg__WEBPACK_IMPORTED_MODULE_6__, "Pain aux Raisins", "$10"));

    /* section 2 */
    let desert = document.createElement("section");
    desert.classList.add("desert");
    let deserTitle = document.createElement("div");
    deserTitle.textContent = "Deserts";
    desert.appendChild(deserTitle);
    desert.appendChild(food(_images_desert_1_jpg__WEBPACK_IMPORTED_MODULE_7__, "Crème Brûlée", "$12"));
    desert.appendChild(food(_images_desert_2_jpg__WEBPACK_IMPORTED_MODULE_8__, "Tarte Tatin", "$12"));
    desert.appendChild(food(_images_desert_3_jpg__WEBPACK_IMPORTED_MODULE_9__, "Mousse au Chocolat", "$20"));
    desert.appendChild(food(_images_desert_4_jpg__WEBPACK_IMPORTED_MODULE_10__, "Tarte aux Fraises", "$15"));
    desert.appendChild(food(_images_desert_5_jpg__WEBPACK_IMPORTED_MODULE_11__, "Madeleines", "$8"));

    /* section 3 */
    let drink = document.createElement("section");
    drink.classList.add("drink");
    let drinkTitle = document.createElement("div");
    drinkTitle.textContent = "Drinks";
    drink.appendChild(drinkTitle);
    drink.appendChild(food(_images_drink_1_jpg__WEBPACK_IMPORTED_MODULE_12__, "Café Crème", "$8"));
    drink.appendChild(food(_images_drink_2_jpg__WEBPACK_IMPORTED_MODULE_13__, "Café Noir", "$8"));
    drink.appendChild(food(_images_drink_3_jpg__WEBPACK_IMPORTED_MODULE_14__, "Chocolat Chaud", "$12"));
    drink.appendChild(food(_images_drink_4_jpg__WEBPACK_IMPORTED_MODULE_15__, "Thé", "$10"));
    drink.appendChild(food(_images_drink_5_jpg__WEBPACK_IMPORTED_MODULE_16__, "Eau Gazeuse", "$12"));


    menu.appendChild(title);
    menu.appendChild(pastry);
    menu.appendChild(desert);
    menu.appendChild(drink);
    outerMenu.appendChild(menu);
    menuPageConent.appendChild(outerMenu);
    menuPageConent.appendChild(document.createElement("hr"));
    /* footer */
    menuPageConent.appendChild((0,_footer__WEBPACK_IMPORTED_MODULE_2__["default"])())

    content.appendChild(menuPageConent);

    (0,_animation_animationMenuPage__WEBPACK_IMPORTED_MODULE_3__["default"])()
    
}
function food(image, heading, amount){
    let parent = document.createElement("div");
    let img = document.createElement("img");
    img.setAttribute("src", image);
    let div = document.createElement("div");
    div.textContent = heading;
    let price = document.createElement("div");
    price.textContent = amount;
    
    parent.appendChild(img);
    parent.appendChild(div);
    parent.appendChild(price);
    return parent;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (menupage);

/***/ }),

/***/ "./images/desert-1.jpg":
/*!*****************************!*\
  !*** ./images/desert-1.jpg ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "86ddd645f4fb5cab8b85.jpg";

/***/ }),

/***/ "./images/desert-2.jpg":
/*!*****************************!*\
  !*** ./images/desert-2.jpg ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "090cb02ee3ffa3ef83e3.jpg";

/***/ }),

/***/ "./images/desert-3.jpg":
/*!*****************************!*\
  !*** ./images/desert-3.jpg ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "ef6ecad5bbd451d3cffe.jpg";

/***/ }),

/***/ "./images/desert-4.jpg":
/*!*****************************!*\
  !*** ./images/desert-4.jpg ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "66ef65192a1e2c5b54dc.jpg";

/***/ }),

/***/ "./images/desert-5.jpg":
/*!*****************************!*\
  !*** ./images/desert-5.jpg ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "f5c24cb61790db96f5c1.jpg";

/***/ }),

/***/ "./images/drink-1.jpg":
/*!****************************!*\
  !*** ./images/drink-1.jpg ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "1988004edbc64fd377ee.jpg";

/***/ }),

/***/ "./images/drink-2.jpg":
/*!****************************!*\
  !*** ./images/drink-2.jpg ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "ce97f9fe29688085fd55.jpg";

/***/ }),

/***/ "./images/drink-3.jpg":
/*!****************************!*\
  !*** ./images/drink-3.jpg ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "9ca7b6e519883629fc63.jpg";

/***/ }),

/***/ "./images/drink-4.jpg":
/*!****************************!*\
  !*** ./images/drink-4.jpg ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "fbc92ba612b8816a08f0.jpg";

/***/ }),

/***/ "./images/drink-5.jpg":
/*!****************************!*\
  !*** ./images/drink-5.jpg ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "49f4fa44a144408aa814.jpg";

/***/ }),

/***/ "./images/github.svg":
/*!***************************!*\
  !*** ./images/github.svg ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "550985caaa8859d4b95f.svg";

/***/ }),

/***/ "./images/logo.jpeg":
/*!**************************!*\
  !*** ./images/logo.jpeg ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "fe15c8fc16c3b62eae4b.jpeg";

/***/ }),

/***/ "./images/pastry-1.jpg":
/*!*****************************!*\
  !*** ./images/pastry-1.jpg ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "c0dd978526cd6ef37d46.jpg";

/***/ }),

/***/ "./images/pastry-2.jpg":
/*!*****************************!*\
  !*** ./images/pastry-2.jpg ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "5f1fed0ead30998b5fcb.jpg";

/***/ }),

/***/ "./images/pastry-3.jpg":
/*!*****************************!*\
  !*** ./images/pastry-3.jpg ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "34ce2a31998d1c406850.jpg";

/***/ }),

/***/ "./images/phone.svg":
/*!**************************!*\
  !*** ./images/phone.svg ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "0b454d6aeda1578fa2ba.svg";

/***/ }),

/***/ "./images/star.svg":
/*!*************************!*\
  !*** ./images/star.svg ***!
  \*************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "de7ced177d66bb006694.svg";

/***/ }),

/***/ "./images/store.svg":
/*!**************************!*\
  !*** ./images/store.svg ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "761200686114dda81516.svg";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_index_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./css/index.css */ "./src/css/index.css");
/* harmony import */ var _css_normalize_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./css/normalize.css */ "./src/css/normalize.css");
/* harmony import */ var _componenets_homepage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./componenets/homepage */ "./src/componenets/homepage.js");
/* harmony import */ var _componenets_menupage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./componenets/menupage */ "./src/componenets/menupage.js");
/* harmony import */ var _componenets_contactpage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./componenets/contactpage */ "./src/componenets/contactpage.js");






function main(){
    let navigation = document.querySelector(".navigation").childNodes;
    navigation = Array.from(navigation);    
    navigation.forEach(e => e.addEventListener("click", (event) => {
        if(event.target.textContent == "Home"){
            clear();
            (0,_componenets_homepage__WEBPACK_IMPORTED_MODULE_2__["default"])();
            main();
        }else if(event.target.textContent == "Menu"){
            clear();
            (0,_componenets_menupage__WEBPACK_IMPORTED_MODULE_3__["default"])();
            main();
        }else{
            clear();
            (0,_componenets_contactpage__WEBPACK_IMPORTED_MODULE_4__["default"])();
            main();
        }
    }))
}   
function clear(){
    document.querySelector(".content").innerHTML = "";
}

(0,_componenets_homepage__WEBPACK_IMPORTED_MODULE_2__["default"])();
main();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLHVGQUF1RixVQUFVLFVBQVUsWUFBWSxNQUFNLEtBQUssWUFBWSxNQUFNLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsTUFBTSxLQUFLLEtBQUssVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLFdBQVcsTUFBTSxLQUFLLFVBQVUsWUFBWSxhQUFhLGFBQWEsTUFBTSxLQUFLLFlBQVksYUFBYSxhQUFhLFdBQVcsVUFBVSxLQUFLLEtBQUssVUFBVSxVQUFVLFVBQVUsVUFBVSxZQUFZLFdBQVcsWUFBWSxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLE1BQU0sS0FBSyxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLE1BQU0sS0FBSyxVQUFVLFlBQVksYUFBYSxhQUFh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QTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDbEJBOzs7Ozs7Ozs7Ozs7Ozs7O0FDQXlCO0FBQ0k7QUFDcUM7QUFDcEI7QUFDTTs7QUFFcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxpRUFBUTtBQUNwQjtBQUNBLFNBQVM7QUFDVDtBQUNBLFlBQVksaUVBQVE7QUFDcEI7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxZQUFZLG9FQUFXO0FBQ3ZCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUVBQVE7QUFDUixPIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vbm9kZV9tb2R1bGVzL2FuaW1hdGVwbHVzL2FuaW1hdGVwbHVzLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jc3MvY29udGFjdHBhZ2UuY3NzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jc3MvaG9tZXBhZ2UuY3NzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jc3MvaW5kZXguY3NzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jc3MvbWVudXBhZ2UuY3NzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jc3Mvbm9ybWFsaXplLmNzcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jc3MvY29udGFjdHBhZ2UuY3NzPzgzNGYiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2Nzcy9ob21lcGFnZS5jc3M/YTI3NyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY3NzL2luZGV4LmNzcz9mN2VhIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jc3MvbWVudXBhZ2UuY3NzPzlkMzAiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2Nzcy9ub3JtYWxpemUuY3NzPzZkNTQiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvYW5pbWF0aW9uL2FuaW1hdGVDb250YWN0UGFnZS5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvYW5pbWF0aW9uL2FuaW1hdGVIb21lUGFnZS5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvYW5pbWF0aW9uL2FuaW1hdGlvbk1lbnVQYWdlLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jb21wb25lbmV0cy9jb250YWN0cGFnZS5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY29tcG9uZW5ldHMvZm9vdGVyLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jb21wb25lbmV0cy9ob21lcGFnZS5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY29tcG9uZW5ldHMvaG9tZXBhZ2VDYXJkcy5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY29tcG9uZW5ldHMvbWVudXBhZ2UuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2Uvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2Uvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQW5pbWF0ZSBQbHVzIHYyLjEuMVxuICogQ29weXJpZ2h0IChjKSAyMDE3LTIwMTggQmVuamFtaW4gRGUgQ29ja1xuICogaHR0cDovL2FuaW1hdGVwbHVzLmNvbS9saWNlbnNlXG4gKi9cblxuXG4vLyBsb2dpY1xuLy8gPT09PT1cblxuY29uc3QgZmlyc3QgPSAoW2l0ZW1dKSA9PiBpdGVtO1xuXG5jb25zdCBjb21wdXRlVmFsdWUgPSAodmFsdWUsIGluZGV4KSA9PlxuICB0eXBlb2YgdmFsdWUgPT0gXCJmdW5jdGlvblwiID8gdmFsdWUoaW5kZXgpIDogdmFsdWU7XG5cblxuLy8gZG9tXG4vLyA9PT1cblxuY29uc3QgZ2V0RWxlbWVudHMgPSBlbGVtZW50cyA9PiB7XG4gIGlmIChBcnJheS5pc0FycmF5KGVsZW1lbnRzKSlcbiAgICByZXR1cm4gZWxlbWVudHM7XG4gIGlmICghZWxlbWVudHMgfHwgZWxlbWVudHMubm9kZVR5cGUpXG4gICAgcmV0dXJuIFtlbGVtZW50c107XG4gIHJldHVybiBBcnJheS5mcm9tKHR5cGVvZiBlbGVtZW50cyA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChlbGVtZW50cykgOiBlbGVtZW50cyk7XG59O1xuXG5jb25zdCBhY2NlbGVyYXRlID0gKHtzdHlsZX0sIGtleWZyYW1lcykgPT5cbiAgc3R5bGUud2lsbENoYW5nZSA9IGtleWZyYW1lc1xuICAgID8ga2V5ZnJhbWVzLm1hcCgoe3Byb3BlcnR5fSkgPT4gcHJvcGVydHkpLmpvaW4oKVxuICAgIDogXCJhdXRvXCI7XG5cbmNvbnN0IGNyZWF0ZVNWRyA9IChlbGVtZW50LCBhdHRyaWJ1dGVzKSA9PlxuICBPYmplY3QuZW50cmllcyhhdHRyaWJ1dGVzKS5yZWR1Y2UoKG5vZGUsIFthdHRyaWJ1dGUsIHZhbHVlXSkgPT4ge1xuICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgIHJldHVybiBub2RlO1xuICB9LCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBlbGVtZW50KSk7XG5cblxuLy8gbW90aW9uIGJsdXJcbi8vID09PT09PT09PT09XG5cbmNvbnN0IGJsdXJzID0ge1xuICBheGVzOiBbXCJ4XCIsIFwieVwiXSxcbiAgY291bnQ6IDAsXG4gIGFkZCh7ZWxlbWVudCwgYmx1cn0pIHtcbiAgICBjb25zdCBpZCA9IGBtb3Rpb24tYmx1ci0ke3RoaXMuY291bnQrK31gO1xuICAgIGNvbnN0IHN2ZyA9IGNyZWF0ZVNWRyhcInN2Z1wiLCB7XG4gICAgICBzdHlsZTogXCJwb3NpdGlvbjogYWJzb2x1dGU7IHdpZHRoOiAwOyBoZWlnaHQ6IDBcIlxuICAgIH0pO1xuICAgIGNvbnN0IGZpbHRlciA9IGNyZWF0ZVNWRyhcImZpbHRlclwiLCB0aGlzLmF4ZXMucmVkdWNlKChhdHRyaWJ1dGVzLCBheGlzKSA9PiB7XG4gICAgICBjb25zdCBvZmZzZXQgPSBibHVyW2F4aXNdICogMjtcbiAgICAgIGF0dHJpYnV0ZXNbYXhpc10gPSBgLSR7b2Zmc2V0fSVgO1xuICAgICAgYXR0cmlidXRlc1theGlzID09IFwieFwiID8gXCJ3aWR0aFwiIDogXCJoZWlnaHRcIl0gPSBgJHsxMDAgKyBvZmZzZXQgKiAyfSVgO1xuICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG4gICAgfSx7XG4gICAgICBpZCxcbiAgICAgIFwiY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzXCI6IFwic1JHQlwiXG4gICAgfSkpO1xuICAgIGNvbnN0IGdhdXNzaWFuID0gY3JlYXRlU1ZHKFwiZmVHYXVzc2lhbkJsdXJcIiwge1xuICAgICAgaW46IFwiU291cmNlR3JhcGhpY1wiXG4gICAgfSk7XG4gICAgZmlsdGVyLmFwcGVuZChnYXVzc2lhbik7XG4gICAgc3ZnLmFwcGVuZChmaWx0ZXIpO1xuICAgIGVsZW1lbnQuc3R5bGUuZmlsdGVyID0gYHVybChcIiMke2lkfVwiKWA7XG4gICAgZG9jdW1lbnQuYm9keS5wcmVwZW5kKHN2Zyk7XG4gICAgcmV0dXJuIGdhdXNzaWFuO1xuICB9XG59O1xuXG5jb25zdCBnZXREZXZpYXRpb24gPSAoYmx1ciwge2Vhc2luZ30sIGN1cnZlKSA9PiB7XG4gIGNvbnN0IHByb2dyZXNzID0gYmx1ciAqIGN1cnZlO1xuICBjb25zdCBvdXQgPSBibHVyIC0gcHJvZ3Jlc3M7XG4gIGNvbnN0IGRldmlhdGlvbiA9ICgoKSA9PiB7XG4gICAgaWYgKGVhc2luZyA9PSBcImxpbmVhclwiKVxuICAgICAgcmV0dXJuIGJsdXI7XG4gICAgaWYgKGVhc2luZy5zdGFydHNXaXRoKFwiaW4tb3V0XCIpKVxuICAgICAgcmV0dXJuIChjdXJ2ZSA8IC41ID8gcHJvZ3Jlc3MgOiBvdXQpICogMjtcbiAgICBpZiAoZWFzaW5nLnN0YXJ0c1dpdGgoXCJpblwiKSlcbiAgICAgIHJldHVybiBwcm9ncmVzcztcbiAgICByZXR1cm4gb3V0O1xuICB9KSgpO1xuICByZXR1cm4gTWF0aC5tYXgoMCwgZGV2aWF0aW9uKTtcbn07XG5cbmNvbnN0IHNldERldmlhdGlvbiA9ICh7Ymx1ciwgZ2F1c3NpYW4sIGVhc2luZ30sIGN1cnZlKSA9PiB7XG4gIGNvbnN0IHZhbHVlcyA9IGJsdXJzLmF4ZXMubWFwKGF4aXMgPT4gZ2V0RGV2aWF0aW9uKGJsdXJbYXhpc10sIGVhc2luZywgY3VydmUpKTtcbiAgZ2F1c3NpYW4uc2V0QXR0cmlidXRlKFwic3RkRGV2aWF0aW9uXCIsIHZhbHVlcy5qb2luKCkpO1xufTtcblxuY29uc3Qgbm9ybWFsaXplQmx1ciA9IGJsdXIgPT4ge1xuICBjb25zdCBkZWZhdWx0cyA9IGJsdXJzLmF4ZXMucmVkdWNlKChvYmplY3QsIGF4aXMpID0+IHtcbiAgICBvYmplY3RbYXhpc10gPSAwO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH0sIHt9KTtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIGJsdXIpO1xufTtcblxuY29uc3QgY2xlYXJCbHVyID0gKHtzdHlsZX0sIHtwYXJlbnROb2RlOiB7cGFyZW50Tm9kZTogc3ZnfX0pID0+IHtcbiAgc3R5bGUuZmlsdGVyID0gXCJub25lXCI7XG4gIHN2Zy5yZW1vdmUoKTtcbn07XG5cblxuLy8gY29sb3IgY29udmVyc2lvblxuLy8gPT09PT09PT09PT09PT09PVxuXG5jb25zdCBoZXhQYWlycyA9IGNvbG9yID0+IHtcbiAgY29uc3Qgc3BsaXQgPSBjb2xvci5zcGxpdChcIlwiKTtcbiAgY29uc3QgcGFpcnMgPSBjb2xvci5sZW5ndGggPCA1XG4gICAgPyBzcGxpdC5tYXAoc3RyaW5nID0+IHN0cmluZyArIHN0cmluZylcbiAgICA6IHNwbGl0LnJlZHVjZSgoYXJyYXksIHN0cmluZywgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbmRleCAlIDIpXG4gICAgICAgIGFycmF5LnB1c2goc3BsaXRbaW5kZXggLSAxXSArIHN0cmluZyk7XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfSwgW10pO1xuICBpZiAocGFpcnMubGVuZ3RoIDwgNClcbiAgICBwYWlycy5wdXNoKFwiZmZcIik7XG4gIHJldHVybiBwYWlycztcbn07XG5cbmNvbnN0IGNvbnZlcnQgPSBjb2xvciA9PlxuICBoZXhQYWlycyhjb2xvcikubWFwKHN0cmluZyA9PiBwYXJzZUludChzdHJpbmcsIDE2KSk7XG5cbmNvbnN0IHJnYmEgPSBoZXggPT4ge1xuICBjb25zdCBjb2xvciA9IGhleC5zbGljZSgxKTtcbiAgY29uc3QgW3IsIGcsIGIsIGFdID0gY29udmVydChjb2xvcik7XG4gIHJldHVybiBgcmdiYSgke3J9LCAke2d9LCAke2J9LCAke2EgLyAyNTV9KWA7XG59O1xuXG5cbi8vIGVhc2luZyBlcXVhdGlvbnNcbi8vID09PT09PT09PT09PT09PT1cblxuY29uc3QgcGkyID0gTWF0aC5QSSAqIDI7XG5cbmNvbnN0IGdldE9mZnNldCA9IChzdHJlbmd0aCwgcGVyaW9kKSA9PlxuICBwZXJpb2QgLyBwaTIgKiBNYXRoLmFzaW4oMSAvIHN0cmVuZ3RoKTtcblxuY29uc3QgZWFzaW5ncyA9IHtcbiAgXCJsaW5lYXJcIjogcHJvZ3Jlc3MgPT4gcHJvZ3Jlc3MsXG5cbiAgXCJpbi1jdWJpY1wiOiBwcm9ncmVzcyA9PiBwcm9ncmVzcyAqKiAzLFxuICBcImluLXF1YXJ0aWNcIjogcHJvZ3Jlc3MgPT4gcHJvZ3Jlc3MgKiogNCxcbiAgXCJpbi1xdWludGljXCI6IHByb2dyZXNzID0+IHByb2dyZXNzICoqIDUsXG4gIFwiaW4tZXhwb25lbnRpYWxcIjogcHJvZ3Jlc3MgPT4gMTAyNCAqKiAocHJvZ3Jlc3MgLSAxKSxcbiAgXCJpbi1jaXJjdWxhclwiOiBwcm9ncmVzcyA9PiAxIC0gTWF0aC5zcXJ0KDEgLSBwcm9ncmVzcyAqKiAyKSxcbiAgXCJpbi1lbGFzdGljXCI6IChwcm9ncmVzcywgYW1wbGl0dWRlLCBwZXJpb2QpID0+IHtcbiAgICBjb25zdCBzdHJlbmd0aCA9IE1hdGgubWF4KGFtcGxpdHVkZSwgMSk7XG4gICAgY29uc3Qgb2Zmc2V0ID0gZ2V0T2Zmc2V0KHN0cmVuZ3RoLCBwZXJpb2QpO1xuICAgIHJldHVybiAtKHN0cmVuZ3RoICogMiAqKiAoMTAgKiAocHJvZ3Jlc3MgLT0gMSkpICogTWF0aC5zaW4oKHByb2dyZXNzIC0gb2Zmc2V0KSAqIHBpMiAvIHBlcmlvZCkpO1xuICB9LFxuXG4gIFwib3V0LWN1YmljXCI6IHByb2dyZXNzID0+IC0tcHJvZ3Jlc3MgKiogMyArIDEsXG4gIFwib3V0LXF1YXJ0aWNcIjogcHJvZ3Jlc3MgPT4gMSAtIC0tcHJvZ3Jlc3MgKiogNCxcbiAgXCJvdXQtcXVpbnRpY1wiOiBwcm9ncmVzcyA9PiAtLXByb2dyZXNzICoqIDUgKyAxLFxuICBcIm91dC1leHBvbmVudGlhbFwiOiBwcm9ncmVzcyA9PiAxIC0gMiAqKiAoLTEwICogcHJvZ3Jlc3MpLFxuICBcIm91dC1jaXJjdWxhclwiOiBwcm9ncmVzcyA9PiBNYXRoLnNxcnQoMSAtIC0tcHJvZ3Jlc3MgKiogMiksXG4gIFwib3V0LWVsYXN0aWNcIjogKHByb2dyZXNzLCBhbXBsaXR1ZGUsIHBlcmlvZCkgPT4ge1xuICAgIGNvbnN0IHN0cmVuZ3RoID0gTWF0aC5tYXgoYW1wbGl0dWRlLCAxKTtcbiAgICBjb25zdCBvZmZzZXQgPSBnZXRPZmZzZXQoc3RyZW5ndGgsIHBlcmlvZCk7XG4gICAgcmV0dXJuIHN0cmVuZ3RoICogMiAqKiAoLTEwICogcHJvZ3Jlc3MpICogTWF0aC5zaW4oKHByb2dyZXNzIC0gb2Zmc2V0KSAqIHBpMiAvIHBlcmlvZCkgKyAxO1xuICB9LFxuXG4gIFwiaW4tb3V0LWN1YmljXCI6IHByb2dyZXNzID0+XG4gICAgKHByb2dyZXNzICo9IDIpIDwgMVxuICAgICAgPyAuNSAqIHByb2dyZXNzICoqIDNcbiAgICAgIDogLjUgKiAoKHByb2dyZXNzIC09IDIpICogcHJvZ3Jlc3MgKiogMiArIDIpLFxuICBcImluLW91dC1xdWFydGljXCI6IHByb2dyZXNzID0+XG4gICAgKHByb2dyZXNzICo9IDIpIDwgMVxuICAgICAgPyAuNSAqIHByb2dyZXNzICoqIDRcbiAgICAgIDogLS41ICogKChwcm9ncmVzcyAtPSAyKSAqIHByb2dyZXNzICoqIDMgLSAyKSxcbiAgXCJpbi1vdXQtcXVpbnRpY1wiOiBwcm9ncmVzcyA9PlxuICAgIChwcm9ncmVzcyAqPSAyKSA8IDFcbiAgICAgID8gLjUgKiBwcm9ncmVzcyAqKiA1XG4gICAgICA6IC41ICogKChwcm9ncmVzcyAtPSAyKSAqIHByb2dyZXNzICoqIDQgKyAyKSxcbiAgXCJpbi1vdXQtZXhwb25lbnRpYWxcIjogcHJvZ3Jlc3MgPT5cbiAgICAocHJvZ3Jlc3MgKj0gMikgPCAxXG4gICAgICA/IC41ICogMTAyNCAqKiAocHJvZ3Jlc3MgLSAxKVxuICAgICAgOiAuNSAqICgtKDIgKiogKC0xMCAqIChwcm9ncmVzcyAtIDEpKSkgKyAyKSxcbiAgXCJpbi1vdXQtY2lyY3VsYXJcIjogcHJvZ3Jlc3MgPT5cbiAgICAocHJvZ3Jlc3MgKj0gMikgPCAxXG4gICAgICA/IC0uNSAqIChNYXRoLnNxcnQoMSAtIHByb2dyZXNzICoqIDIpIC0gMSlcbiAgICAgIDogLjUgKiAoTWF0aC5zcXJ0KDEgLSAocHJvZ3Jlc3MgLT0gMikgKiBwcm9ncmVzcykgKyAxKSxcbiAgXCJpbi1vdXQtZWxhc3RpY1wiOiAocHJvZ3Jlc3MsIGFtcGxpdHVkZSwgcGVyaW9kKSA9PiB7XG4gICAgY29uc3Qgc3RyZW5ndGggPSBNYXRoLm1heChhbXBsaXR1ZGUsIDEpO1xuICAgIGNvbnN0IG9mZnNldCA9IGdldE9mZnNldChzdHJlbmd0aCwgcGVyaW9kKTtcbiAgICByZXR1cm4gKHByb2dyZXNzICo9IDIpIDwgMVxuICAgICAgPyAtLjUgKiAoc3RyZW5ndGggKiAyICoqICgxMCAqIChwcm9ncmVzcyAtPSAxKSkgKiBNYXRoLnNpbigocHJvZ3Jlc3MgLSBvZmZzZXQpICogcGkyIC8gcGVyaW9kKSlcbiAgICAgIDogc3RyZW5ndGggKiAyICoqICgtMTAgKiAocHJvZ3Jlc3MgLT0gMSkpICogTWF0aC5zaW4oKHByb2dyZXNzIC0gb2Zmc2V0KSAqIHBpMiAvIHBlcmlvZCkgKiAuNSArIDE7XG4gIH1cbn07XG5cbmNvbnN0IGRlY29tcG9zZUVhc2luZyA9IHN0cmluZyA9PiB7XG4gIGNvbnN0IFtlYXNpbmcsIGFtcGxpdHVkZSA9IDEsIHBlcmlvZCA9IC40XSA9IHN0cmluZy50cmltKCkuc3BsaXQoXCIgXCIpO1xuICByZXR1cm4ge2Vhc2luZywgYW1wbGl0dWRlLCBwZXJpb2R9O1xufTtcblxuY29uc3QgZWFzZSA9ICh7ZWFzaW5nLCBhbXBsaXR1ZGUsIHBlcmlvZH0sIHByb2dyZXNzKSA9PlxuICBlYXNpbmdzW2Vhc2luZ10ocHJvZ3Jlc3MsIGFtcGxpdHVkZSwgcGVyaW9kKTtcblxuXG4vLyBrZXlmcmFtZXMgY29tcG9zaXRpb25cbi8vID09PT09PT09PT09PT09PT09PT09PVxuXG5jb25zdCBleHRyYWN0UmVnRXhwID0gLy0/XFxkKlxcLj9cXGQrL2c7XG5cbmNvbnN0IGV4dHJhY3RTdHJpbmdzID0gdmFsdWUgPT5cbiAgdmFsdWUuc3BsaXQoZXh0cmFjdFJlZ0V4cCk7XG5cbmNvbnN0IGV4dHJhY3ROdW1iZXJzID0gdmFsdWUgPT5cbiAgdmFsdWUubWF0Y2goZXh0cmFjdFJlZ0V4cCkubWFwKE51bWJlcik7XG5cbmNvbnN0IHNhbml0aXplID0gdmFsdWVzID0+XG4gIHZhbHVlcy5tYXAodmFsdWUgPT4ge1xuICAgIGNvbnN0IHN0cmluZyA9IFN0cmluZyh2YWx1ZSk7XG4gICAgcmV0dXJuIHN0cmluZy5zdGFydHNXaXRoKFwiI1wiKSA/IHJnYmEoc3RyaW5nKSA6IHN0cmluZztcbiAgfSk7XG5cbmNvbnN0IGFkZFByb3BlcnR5S2V5ZnJhbWVzID0gKHByb3BlcnR5LCB2YWx1ZXMpID0+IHtcbiAgY29uc3QgYW5pbWF0YWJsZSA9IHNhbml0aXplKHZhbHVlcyk7XG4gIGNvbnN0IHN0cmluZ3MgPSBleHRyYWN0U3RyaW5ncyhmaXJzdChhbmltYXRhYmxlKSk7XG4gIGNvbnN0IG51bWJlcnMgPSBhbmltYXRhYmxlLm1hcChleHRyYWN0TnVtYmVycyk7XG4gIGNvbnN0IHJvdW5kID0gZmlyc3Qoc3RyaW5ncykuc3RhcnRzV2l0aChcInJnYlwiKTtcbiAgcmV0dXJuIHtwcm9wZXJ0eSwgc3RyaW5ncywgbnVtYmVycywgcm91bmR9O1xufTtcblxuY29uc3QgY3JlYXRlQW5pbWF0aW9uS2V5ZnJhbWVzID0gKGtleWZyYW1lcywgaW5kZXgpID0+XG4gIE9iamVjdC5lbnRyaWVzKGtleWZyYW1lcykubWFwKChbcHJvcGVydHksIHZhbHVlc10pID0+XG4gICAgYWRkUHJvcGVydHlLZXlmcmFtZXMocHJvcGVydHksIGNvbXB1dGVWYWx1ZSh2YWx1ZXMsIGluZGV4KSkpO1xuXG5jb25zdCBnZXRDdXJyZW50VmFsdWUgPSAoZnJvbSwgdG8sIGVhc2luZykgPT5cbiAgZnJvbSArICh0byAtIGZyb20pICogZWFzaW5nO1xuXG5jb25zdCByZWNvbXBvc2VWYWx1ZSA9IChbZnJvbSwgdG9dLCBzdHJpbmdzLCByb3VuZCwgZWFzaW5nKSA9PlxuICBzdHJpbmdzLnJlZHVjZSgoc3R5bGUsIHN0cmluZywgaW5kZXgpID0+IHtcbiAgICBjb25zdCBwcmV2aW91cyA9IGluZGV4IC0gMTtcbiAgICBjb25zdCB2YWx1ZSA9IGdldEN1cnJlbnRWYWx1ZShmcm9tW3ByZXZpb3VzXSwgdG9bcHJldmlvdXNdLCBlYXNpbmcpO1xuICAgIHJldHVybiBzdHlsZSArIChyb3VuZCAmJiBpbmRleCA8IDQgPyBNYXRoLnJvdW5kKHZhbHVlKSA6IHZhbHVlKSArIHN0cmluZztcbiAgfSk7XG5cbmNvbnN0IGNyZWF0ZVN0eWxlcyA9IChrZXlmcmFtZXMsIGVhc2luZykgPT5cbiAga2V5ZnJhbWVzLnJlZHVjZSgoc3R5bGVzLCB7cHJvcGVydHksIG51bWJlcnMsIHN0cmluZ3MsIHJvdW5kfSkgPT4ge1xuICAgIHN0eWxlc1twcm9wZXJ0eV0gPSByZWNvbXBvc2VWYWx1ZShudW1iZXJzLCBzdHJpbmdzLCByb3VuZCwgZWFzaW5nKTtcbiAgICByZXR1cm4gc3R5bGVzO1xuICB9LCB7fSk7XG5cbmNvbnN0IHJldmVyc2VLZXlmcmFtZXMgPSBrZXlmcmFtZXMgPT5cbiAga2V5ZnJhbWVzLmZvckVhY2goKHtudW1iZXJzfSkgPT4gbnVtYmVycy5yZXZlcnNlKCkpO1xuXG5cbi8vIGFuaW1hdGlvbiB0cmFja2luZ1xuLy8gPT09PT09PT09PT09PT09PT09XG5cbmNvbnN0IHJBRiA9IHtcbiAgYWxsOiBuZXcgU2V0LFxuICBhZGQob2JqZWN0KSB7XG4gICAgaWYgKHRoaXMuYWxsLmFkZChvYmplY3QpLnNpemUgPCAyKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XG4gIH1cbn07XG5cbmNvbnN0IHBhdXNlZCA9IHt9O1xuXG5jb25zdCB0cmFja1RpbWUgPSAodGltaW5nLCBub3cpID0+IHtcbiAgaWYgKCF0aW1pbmcuc3RhcnRUaW1lKSB0aW1pbmcuc3RhcnRUaW1lID0gbm93O1xuICB0aW1pbmcuZWxhcHNlZCA9IG5vdyAtIHRpbWluZy5zdGFydFRpbWU7XG59O1xuXG5jb25zdCByZXNldFRpbWUgPSBvYmplY3QgPT5cbiAgb2JqZWN0LnN0YXJ0VGltZSA9IDA7XG5cbmNvbnN0IGdldFByb2dyZXNzID0gKHtlbGFwc2VkLCBkdXJhdGlvbn0pID0+XG4gIGR1cmF0aW9uID4gMCA/IE1hdGgubWluKGVsYXBzZWQgLyBkdXJhdGlvbiwgMSkgOiAxO1xuXG5jb25zdCBzZXRTcGVlZCA9IChzcGVlZCwgdmFsdWUsIGluZGV4KSA9PlxuICBzcGVlZCA+IDAgPyBjb21wdXRlVmFsdWUodmFsdWUsIGluZGV4KSAvIHNwZWVkIDogMDtcblxuY29uc3QgYWRkQW5pbWF0aW9ucyA9IChvcHRpb25zLCByZXNvbHZlKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBlbGVtZW50cyA9IG51bGwsXG4gICAgZWFzaW5nID0gXCJvdXQtZWxhc3RpY1wiLFxuICAgIGR1cmF0aW9uID0gMTAwMCxcbiAgICBkZWxheTogdGltZW91dCA9IDAsXG4gICAgc3BlZWQgPSAxLFxuICAgIGxvb3AgPSBmYWxzZSxcbiAgICBvcHRpbWl6ZSA9IGZhbHNlLFxuICAgIGRpcmVjdGlvbiA9IFwibm9ybWFsXCIsXG4gICAgYmx1ciA9IG51bGwsXG4gICAgY2hhbmdlID0gbnVsbCxcbiAgICAuLi5yZXN0XG4gIH0gPSBvcHRpb25zO1xuXG4gIGNvbnN0IGxhc3QgPSB7XG4gICAgdG90YWxEdXJhdGlvbjogLTFcbiAgfTtcblxuICBnZXRFbGVtZW50cyhlbGVtZW50cykuZm9yRWFjaChhc3luYyAoZWxlbWVudCwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBrZXlmcmFtZXMgPSBjcmVhdGVBbmltYXRpb25LZXlmcmFtZXMocmVzdCwgaW5kZXgpO1xuICAgIGNvbnN0IGFuaW1hdGlvbiA9IHtcbiAgICAgIGVsZW1lbnQsXG4gICAgICBrZXlmcmFtZXMsXG4gICAgICBsb29wLFxuICAgICAgb3B0aW1pemUsXG4gICAgICBkaXJlY3Rpb24sXG4gICAgICBjaGFuZ2UsXG4gICAgICBlYXNpbmc6IGRlY29tcG9zZUVhc2luZyhlYXNpbmcpLFxuICAgICAgZHVyYXRpb246IHNldFNwZWVkKHNwZWVkLCBkdXJhdGlvbiwgaW5kZXgpXG4gICAgfTtcblxuICAgIGNvbnN0IGFuaW1hdGlvblRpbWVvdXQgPSBzZXRTcGVlZChzcGVlZCwgdGltZW91dCwgaW5kZXgpO1xuICAgIGNvbnN0IHRvdGFsRHVyYXRpb24gPSBhbmltYXRpb25UaW1lb3V0ICsgYW5pbWF0aW9uLmR1cmF0aW9uO1xuXG4gICAgaWYgKGRpcmVjdGlvbiAhPSBcIm5vcm1hbFwiKVxuICAgICAgcmV2ZXJzZUtleWZyYW1lcyhrZXlmcmFtZXMpO1xuXG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgIGlmIChvcHRpbWl6ZSlcbiAgICAgICAgYWNjZWxlcmF0ZShlbGVtZW50LCBrZXlmcmFtZXMpO1xuXG4gICAgICBpZiAoYmx1cikge1xuICAgICAgICBhbmltYXRpb24uYmx1ciA9IG5vcm1hbGl6ZUJsdXIoY29tcHV0ZVZhbHVlKGJsdXIsIGluZGV4KSk7XG4gICAgICAgIGFuaW1hdGlvbi5nYXVzc2lhbiA9IGJsdXJzLmFkZChhbmltYXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0b3RhbER1cmF0aW9uID4gbGFzdC50b3RhbER1cmF0aW9uKSB7XG4gICAgICBsYXN0LmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcbiAgICAgIGxhc3QudG90YWxEdXJhdGlvbiA9IHRvdGFsRHVyYXRpb247XG4gICAgfVxuXG4gICAgaWYgKGFuaW1hdGlvblRpbWVvdXQpIGF3YWl0IGRlbGF5KGFuaW1hdGlvblRpbWVvdXQpO1xuICAgIHJBRi5hZGQoYW5pbWF0aW9uKTtcbiAgfSk7XG5cbiAgY29uc3Qge2FuaW1hdGlvbn0gPSBsYXN0O1xuICBpZiAoIWFuaW1hdGlvbikgcmV0dXJuO1xuICBhbmltYXRpb24uZW5kID0gcmVzb2x2ZTtcbiAgYW5pbWF0aW9uLm9wdGlvbnMgPSBvcHRpb25zO1xufTtcblxuY29uc3QgdGljayA9IG5vdyA9PiB7XG4gIGNvbnN0IHthbGx9ID0gckFGO1xuICBhbGwuZm9yRWFjaChvYmplY3QgPT4ge1xuICAgIHRyYWNrVGltZShvYmplY3QsIG5vdyk7XG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBnZXRQcm9ncmVzcyhvYmplY3QpO1xuICAgIGNvbnN0IHtcbiAgICAgIGVsZW1lbnQsXG4gICAgICBrZXlmcmFtZXMsXG4gICAgICBsb29wLFxuICAgICAgb3B0aW1pemUsXG4gICAgICBkaXJlY3Rpb24sXG4gICAgICBjaGFuZ2UsXG4gICAgICBlYXNpbmcsXG4gICAgICBkdXJhdGlvbixcbiAgICAgIGdhdXNzaWFuLFxuICAgICAgZW5kLFxuICAgICAgb3B0aW9uc1xuICAgIH0gPSBvYmplY3Q7XG5cbiAgICAvLyBvYmplY3QgaXMgYW4gYW5pbWF0aW9uXG4gICAgaWYgKGRpcmVjdGlvbikge1xuICAgICAgbGV0IGN1cnZlID0gcHJvZ3Jlc3M7XG4gICAgICBzd2l0Y2ggKHByb2dyZXNzKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBpZiAoZGlyZWN0aW9uID09IFwiYWx0ZXJuYXRlXCIpIHJldmVyc2VLZXlmcmFtZXMoa2V5ZnJhbWVzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChsb29wKVxuICAgICAgICAgICAgcmVzZXRUaW1lKG9iamVjdCk7XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhbGwuZGVsZXRlKG9iamVjdCk7XG4gICAgICAgICAgICBpZiAob3B0aW1pemUgJiYgZWxlbWVudCkgYWNjZWxlcmF0ZShlbGVtZW50KTtcbiAgICAgICAgICAgIGlmIChnYXVzc2lhbikgY2xlYXJCbHVyKGVsZW1lbnQsIGdhdXNzaWFuKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVuZCkgZW5kKG9wdGlvbnMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGN1cnZlID0gZWFzZShlYXNpbmcsIHByb2dyZXNzKTtcbiAgICAgIH1cbiAgICAgIGlmIChnYXVzc2lhbikgc2V0RGV2aWF0aW9uKG9iamVjdCwgY3VydmUpO1xuICAgICAgaWYgKGNoYW5nZSAmJiBlbmQpIGNoYW5nZShjdXJ2ZSk7XG4gICAgICBpZiAoZWxlbWVudCkgT2JqZWN0LmFzc2lnbihlbGVtZW50LnN0eWxlLCBjcmVhdGVTdHlsZXMoa2V5ZnJhbWVzLCBjdXJ2ZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIG9iamVjdCBpcyBhIGRlbGF5XG4gICAgaWYgKHByb2dyZXNzIDwgMSkgcmV0dXJuO1xuICAgIGFsbC5kZWxldGUob2JqZWN0KTtcbiAgICBlbmQoZHVyYXRpb24pO1xuICB9KTtcblxuICBpZiAoYWxsLnNpemUpIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbn07XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ2aXNpYmlsaXR5Y2hhbmdlXCIsICgpID0+IHtcbiAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgaWYgKGRvY3VtZW50LmhpZGRlbikge1xuICAgIGNvbnN0IHthbGx9ID0gckFGO1xuICAgIHBhdXNlZC50aW1lID0gbm93O1xuICAgIHBhdXNlZC5hbGwgPSBuZXcgU2V0KGFsbCk7XG4gICAgYWxsLmNsZWFyKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qge2FsbCwgdGltZX0gPSBwYXVzZWQ7XG4gIGlmICghYWxsKSByZXR1cm47XG4gIGNvbnN0IGVsYXBzZWQgPSBub3cgLSB0aW1lO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT5cbiAgICBhbGwuZm9yRWFjaChvYmplY3QgPT4ge1xuICAgICAgb2JqZWN0LnN0YXJ0VGltZSArPSBlbGFwc2VkO1xuICAgICAgckFGLmFkZChvYmplY3QpO1xuICAgIH0pKTtcbn0pO1xuXG5cbi8vIGV4cG9ydHNcbi8vID09PT09PT1cblxuZXhwb3J0IGRlZmF1bHQgb3B0aW9ucyA9PlxuICBuZXcgUHJvbWlzZShyZXNvbHZlID0+IGFkZEFuaW1hdGlvbnMob3B0aW9ucywgcmVzb2x2ZSkpO1xuXG5leHBvcnQgY29uc3QgZGVsYXkgPSBkdXJhdGlvbiA9PlxuICBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJBRi5hZGQoe1xuICAgIGR1cmF0aW9uLFxuICAgIGVuZDogcmVzb2x2ZVxuICB9KSk7XG5cbmV4cG9ydCBjb25zdCBzdG9wID0gZWxlbWVudHMgPT4ge1xuICBjb25zdCB7YWxsfSA9IHJBRjtcbiAgY29uc3Qgbm9kZXMgPSBnZXRFbGVtZW50cyhlbGVtZW50cyk7XG4gIGFsbC5mb3JFYWNoKG9iamVjdCA9PiB7XG4gICAgaWYgKG5vZGVzLmluY2x1ZGVzKG9iamVjdC5lbGVtZW50KSkgYWxsLmRlbGV0ZShvYmplY3QpO1xuICB9KTtcbiAgcmV0dXJuIG5vZGVzO1xufTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAuY29udGFjdFBhZ2V7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiA0NXB4IGF1dG8gMWZyIGF1dG87XG59XG4uY29udGFjdFBhZ2UgPiBkaXY6bnRoLWNoaWxkKDMpe1xuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcbiAgICBtYXJnaW4tdG9wOiAxMHB4O1xuICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XG59XG4uY29udGFjdFBhZ2UgPiAubmF2aWdhdGlvbiA+IGRpdjpudGgtY2hpbGQoMyl7XG4gICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLXRleHQtY29sb3IpO1xufVxuXG4uY29udGFjdFBhZ2UgaW1ne1xuICAgIGhlaWdodDogNTBweDtcbn1cbi5jb250YWN0UGFnZSAubWVudSA+IGRpdntcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZm9udC1zaXplOiAycmVtO1xuICAgIGdhcDoxMHB4O1xufVxuLmNvbnRhY3RQYWdlIC5tZW51e1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuLm1hcHN7XG4gICAgbWFyZ2luOjIwcHg7XG59XG4uY29udGFjdFBhZ2UgLm1lbnUgPiBkaXY6bnRoLWNoaWxkKDMpe1xuICAgIG1hcmdpbjoxMHB4O1xufVxuYCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvY3NzL2NvbnRhY3RwYWdlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTtJQUNJLFlBQVk7SUFDWixhQUFhO0lBQ2Isc0NBQXNDO0FBQzFDO0FBQ0E7SUFDSSxrQkFBa0I7SUFDbEIsZ0JBQWdCO0lBQ2hCLG1CQUFtQjtBQUN2QjtBQUNBO0lBQ0ksMENBQTBDO0FBQzlDOztBQUVBO0lBQ0ksWUFBWTtBQUNoQjtBQUNBO0lBQ0ksYUFBYTtJQUNiLHVCQUF1QjtJQUN2QixtQkFBbUI7SUFDbkIsZUFBZTtJQUNmLFFBQVE7QUFDWjtBQUNBO0lBQ0ksYUFBYTtJQUNiLHNCQUFzQjtJQUN0Qix1QkFBdUI7SUFDdkIsbUJBQW1CO0FBQ3ZCO0FBQ0E7SUFDSSxXQUFXO0FBQ2Y7QUFDQTtJQUNJLFdBQVc7QUFDZlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIuY29udGFjdFBhZ2V7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiA0NXB4IGF1dG8gMWZyIGF1dG87XFxufVxcbi5jb250YWN0UGFnZSA+IGRpdjpudGgtY2hpbGQoMyl7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gICAgbWFyZ2luLXRvcDogMTBweDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcXG59XFxuLmNvbnRhY3RQYWdlID4gLm5hdmlnYXRpb24gPiBkaXY6bnRoLWNoaWxkKDMpe1xcbiAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgdmFyKC0tdGV4dC1jb2xvcik7XFxufVxcblxcbi5jb250YWN0UGFnZSBpbWd7XFxuICAgIGhlaWdodDogNTBweDtcXG59XFxuLmNvbnRhY3RQYWdlIC5tZW51ID4gZGl2e1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgZm9udC1zaXplOiAycmVtO1xcbiAgICBnYXA6MTBweDtcXG59XFxuLmNvbnRhY3RQYWdlIC5tZW51e1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuLm1hcHN7XFxuICAgIG1hcmdpbjoyMHB4O1xcbn1cXG4uY29udGFjdFBhZ2UgLm1lbnUgPiBkaXY6bnRoLWNoaWxkKDMpe1xcbiAgICBtYXJnaW46MTBweDtcXG59XFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAuaG9tZVBhZ2V7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOjQ1cHggcmVwZWF0KDIsYXV0bykgMWZyIGF1dG8gYXV0bztcbn1cbi5uYXZpZ2F0aW9ue1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgZ2FwOjEwMHB4O1xuICAgIG1hcmdpbjogMTBweDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XG4gICAgei1pbmRleDogMTtcblxufVxuaHJ7XG4gICAgd2lkdGg6IDUwJTtcbiAgICBib3JkZXI6MXB4IHNvbGlkIGJsYWNrO1xuICAgIHotaW5kZXg6IDE7XG59XG4uaGVhZGluZ3tcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgICAgXG59XG4ubWFpbkNhcmR7XG4gICAgZGlzcGxheTogZmxleDtcbn1cbi5mb290ZXJ7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGdhcDoxMHB4O1xufVxuLmZvb3RlciBpbWd7XG4gICAgaGVpZ2h0OiA0MHB4O1xufVxuLmZvb3RlciBpbWc6aG92ZXJ7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoNzIwZGVnKTtcbiAgICB0cmFuc2l0aW9uOiBhbGwgMXM7XG59XG4uaGVhZGluZyA+IGltZ3tcbiAgICBoZWlnaHQ6IDQzMHB4O1xufVxuLmhlYWRpbmcgPiBkaXY6bnRoLWNoaWxkKDIpe1xuICAgIGNvbG9yOiB3aGl0ZTtcbiAgICBvcGFjaXR5OiAwLjc7XG4gICAgZm9udC1zaXplOiAxLjRyZW07XG4gICAgbWFyZ2luLXRvcDotNjBweDtcbiAgICBtYXJnaW4tYm90dG9tOiA1MHB4O1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcbn1cbi8qIENhcmRzICovXG4ubWFpbkNhcmR7XG4gICAgd2lkdGg6IDgwJTtcbiAgICBtYXJnaW46MCBhdXRvO1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywxZnIpO1xuICAgIGdhcDoyMHB4O1xuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcbiAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xufVxuLmNhcmR7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBoZWlnaHQ6IDMwMHB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6MjBweDtcbiAgICBmb250LXNpemU6IDEuM3JlbTtcbiAgICBwYWRkaW5nOjIwcHg7XG4gICAgb3ZlcmZsb3c6IGF1dG87ICBcbiAgICBib3JkZXI6IDNweCBzb2xpZCBibGFjaztcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNDYsMTc1LDEzMywwLjcpO1xuXG59XG4ubWFpbkNhcmQgPiBkaXY6bnRoLWNoaWxkKDIpe1xuICAgIHotaW5kZXg6IDE7XG59XG4uY2FyZCBpbWd7XG4gICAgaGVpZ2h0OiA1MHB4O1xufVxuLmNhcmQgPiBkaXY6bnRoLWNoaWxkKDIpe1xuICAgIGZvbnQtc2l6ZTogMS41cmVtO1xufVxuLmNhcmQgPiBkaXY6bnRoLWNoaWxkKDMpe1xuICAgIG9wYWNpdHk6IDAuNjtcbiAgICBmb250LXN0eWxlOiBpdGFsaWM7XG59XG5cbi8qIG5hdmlnYXRpb24gc2VsZWN0aW9uIGJhciAqL1xuLm5hdmlnYXRpb24gPiBkaXZ7XG4gICAgcGFkZGluZy1yaWdodDogNXB4O1xuICAgIHBhZGRpbmctbGVmdDogNXB4O1xufVxuLmhvbWVQYWdlID4gLm5hdmlnYXRpb24gPiBkaXY6bnRoLWNoaWxkKDEpe1xuICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS10ZXh0LWNvbG9yKTtcbn1cblxuYCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvY3NzL2hvbWVwYWdlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTtJQUNJLFlBQVk7SUFDWixhQUFhO0lBQ2Isb0RBQW9EO0FBQ3hEO0FBQ0E7SUFDSSxhQUFhO0lBQ2IsdUJBQXVCO0lBQ3ZCLFNBQVM7SUFDVCxZQUFZO0lBQ1osd0JBQXdCO0lBQ3hCLFVBQVU7O0FBRWQ7QUFDQTtJQUNJLFVBQVU7SUFDVixzQkFBc0I7SUFDdEIsVUFBVTtBQUNkO0FBQ0E7SUFDSSxhQUFhO0lBQ2Isc0JBQXNCO0lBQ3RCLG1CQUFtQjtBQUN2QjtBQUNBO0lBQ0ksYUFBYTtBQUNqQjtBQUNBO0lBQ0ksYUFBYTtJQUNiLG1CQUFtQjtJQUNuQix1QkFBdUI7SUFDdkIsUUFBUTtBQUNaO0FBQ0E7SUFDSSxZQUFZO0FBQ2hCO0FBQ0E7SUFDSSx5QkFBeUI7SUFDekIsa0JBQWtCO0FBQ3RCO0FBQ0E7SUFDSSxhQUFhO0FBQ2pCO0FBQ0E7SUFDSSxZQUFZO0lBQ1osWUFBWTtJQUNaLGlCQUFpQjtJQUNqQixnQkFBZ0I7SUFDaEIsbUJBQW1CO0lBQ25CLHdCQUF3QjtBQUM1QjtBQUNBLFVBQVU7QUFDVjtJQUNJLFVBQVU7SUFDVixhQUFhO0lBQ2IsYUFBYTtJQUNiLG9DQUFvQztJQUNwQyxRQUFRO0lBQ1Isa0JBQWtCO0lBQ2xCLG1CQUFtQjtBQUN2QjtBQUNBO0lBQ0ksc0JBQXNCO0lBQ3RCLGFBQWE7SUFDYix1QkFBdUI7SUFDdkIsa0JBQWtCO0lBQ2xCLGFBQWE7SUFDYixzQkFBc0I7SUFDdEIsdUJBQXVCO0lBQ3ZCLG1CQUFtQjtJQUNuQixRQUFRO0lBQ1IsaUJBQWlCO0lBQ2pCLFlBQVk7SUFDWixjQUFjO0lBQ2QsdUJBQXVCO0lBQ3ZCLGtCQUFrQjtJQUNsQix1QkFBdUI7SUFDdkIsdUNBQXVDOztBQUUzQztBQUNBO0lBQ0ksVUFBVTtBQUNkO0FBQ0E7SUFDSSxZQUFZO0FBQ2hCO0FBQ0E7SUFDSSxpQkFBaUI7QUFDckI7QUFDQTtJQUNJLFlBQVk7SUFDWixrQkFBa0I7QUFDdEI7O0FBRUEsNkJBQTZCO0FBQzdCO0lBQ0ksa0JBQWtCO0lBQ2xCLGlCQUFpQjtBQUNyQjtBQUNBO0lBQ0ksMENBQTBDO0FBQzlDXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIi5ob21lUGFnZXtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6NDVweCByZXBlYXQoMixhdXRvKSAxZnIgYXV0byBhdXRvO1xcbn1cXG4ubmF2aWdhdGlvbntcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGdhcDoxMDBweDtcXG4gICAgbWFyZ2luOiAxMHB4O1xcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XFxuICAgIHotaW5kZXg6IDE7XFxuXFxufVxcbmhye1xcbiAgICB3aWR0aDogNTAlO1xcbiAgICBib3JkZXI6MXB4IHNvbGlkIGJsYWNrO1xcbiAgICB6LWluZGV4OiAxO1xcbn1cXG4uaGVhZGluZ3tcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgICAgXFxufVxcbi5tYWluQ2FyZHtcXG4gICAgZGlzcGxheTogZmxleDtcXG59XFxuLmZvb3RlcntcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGdhcDoxMHB4O1xcbn1cXG4uZm9vdGVyIGltZ3tcXG4gICAgaGVpZ2h0OiA0MHB4O1xcbn1cXG4uZm9vdGVyIGltZzpob3ZlcntcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoNzIwZGVnKTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDFzO1xcbn1cXG4uaGVhZGluZyA+IGltZ3tcXG4gICAgaGVpZ2h0OiA0MzBweDtcXG59XFxuLmhlYWRpbmcgPiBkaXY6bnRoLWNoaWxkKDIpe1xcbiAgICBjb2xvcjogd2hpdGU7XFxuICAgIG9wYWNpdHk6IDAuNztcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIG1hcmdpbi10b3A6LTYwcHg7XFxuICAgIG1hcmdpbi1ib3R0b206IDUwcHg7XFxuICAgIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcXG59XFxuLyogQ2FyZHMgKi9cXG4ubWFpbkNhcmR7XFxuICAgIHdpZHRoOiA4MCU7XFxuICAgIG1hcmdpbjowIGF1dG87XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDMsMWZyKTtcXG4gICAgZ2FwOjIwcHg7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gICAgbWFyZ2luLWJvdHRvbTogMjBweDtcXG59XFxuLmNhcmR7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIGhlaWdodDogMzAwcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBnYXA6MjBweDtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIHBhZGRpbmc6MjBweDtcXG4gICAgb3ZlcmZsb3c6IGF1dG87ICBcXG4gICAgYm9yZGVyOiAzcHggc29saWQgYmxhY2s7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjQ2LDE3NSwxMzMsMC43KTtcXG5cXG59XFxuLm1haW5DYXJkID4gZGl2Om50aC1jaGlsZCgyKXtcXG4gICAgei1pbmRleDogMTtcXG59XFxuLmNhcmQgaW1ne1xcbiAgICBoZWlnaHQ6IDUwcHg7XFxufVxcbi5jYXJkID4gZGl2Om50aC1jaGlsZCgyKXtcXG4gICAgZm9udC1zaXplOiAxLjVyZW07XFxufVxcbi5jYXJkID4gZGl2Om50aC1jaGlsZCgzKXtcXG4gICAgb3BhY2l0eTogMC42O1xcbiAgICBmb250LXN0eWxlOiBpdGFsaWM7XFxufVxcblxcbi8qIG5hdmlnYXRpb24gc2VsZWN0aW9uIGJhciAqL1xcbi5uYXZpZ2F0aW9uID4gZGl2e1xcbiAgICBwYWRkaW5nLXJpZ2h0OiA1cHg7XFxuICAgIHBhZGRpbmctbGVmdDogNXB4O1xcbn1cXG4uaG9tZVBhZ2UgPiAubmF2aWdhdGlvbiA+IGRpdjpudGgtY2hpbGQoMSl7XFxuICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS10ZXh0LWNvbG9yKTtcXG59XFxuXFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIkBpbXBvcnQgdXJsKGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9UGF0cmljaytIYW5kJmRpc3BsYXk9c3dhcCk7XCJdKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgOnJvb3R7XG4gICAgZm9udC1mYW1pbHk6ICdQYXRyaWNrIEhhbmQnLCBjdXJzaXZlO1xuICAgIC0tdGV4dC1jb2xvcjogcmdiYSgyNDYsMTc1LDEzMywyNTUpO1xuICAgIC0tYmctY29sb3I6ICByZ2JhKDczLDk2LDE2NiwyNTUpXG59XG5ib2R5e1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJnLWNvbG9yKTtcbiAgICBoZWlnaHQ6IDk5dmg7XG4gICAgd2lkdGg6IDEwMHZ3O1xufVxuLmNvbnRlbnR7XG4gICAgaGVpZ2h0OiA5OXZoO1xuICAgIHdpZHRoOiAxMDB2dztcbn1cbmJ1dHRvbntcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iZy1jb2xvcik7XG4gICAgYm9yZGVyOjBweDsgXG4gICAgY29sb3I6dmFyKC0tdGV4dC1jb2xvcilcbn1gLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9jc3MvaW5kZXguY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUNBO0lBQ0ksb0NBQW9DO0lBQ3BDLG1DQUFtQztJQUNuQztBQUNKO0FBQ0E7SUFDSSxpQ0FBaUM7SUFDakMsWUFBWTtJQUNaLFlBQVk7QUFDaEI7QUFDQTtJQUNJLFlBQVk7SUFDWixZQUFZO0FBQ2hCO0FBQ0E7SUFDSSxpQ0FBaUM7SUFDakMsVUFBVTtJQUNWO0FBQ0pcIixcInNvdXJjZXNDb250ZW50XCI6W1wiQGltcG9ydCB1cmwoJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9UGF0cmljaytIYW5kJmRpc3BsYXk9c3dhcCcpO1xcbjpyb290e1xcbiAgICBmb250LWZhbWlseTogJ1BhdHJpY2sgSGFuZCcsIGN1cnNpdmU7XFxuICAgIC0tdGV4dC1jb2xvcjogcmdiYSgyNDYsMTc1LDEzMywyNTUpO1xcbiAgICAtLWJnLWNvbG9yOiAgcmdiYSg3Myw5NiwxNjYsMjU1KVxcbn1cXG5ib2R5e1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iZy1jb2xvcik7XFxuICAgIGhlaWdodDogOTl2aDtcXG4gICAgd2lkdGg6IDEwMHZ3O1xcbn1cXG4uY29udGVudHtcXG4gICAgaGVpZ2h0OiA5OXZoO1xcbiAgICB3aWR0aDogMTAwdnc7XFxufVxcbmJ1dHRvbntcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmctY29sb3IpO1xcbiAgICBib3JkZXI6MHB4OyBcXG4gICAgY29sb3I6dmFyKC0tdGV4dC1jb2xvcilcXG59XCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAubWVudVBhZ2V7XG4gICAgaGVpZ2h0OiA5OXZoO1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiA0NXB4IGF1dG8gMWZyIGF1dG8gYXV0bzsgICBcbn1cbi5tZW51UGFnZSA+IGRpdjpudGgtY2hpbGQoMyl7XG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xufVxuLm91dGVyTWVudXtcbiAgICBoZWlnaHQ6IDc4dmg7XG4gICAgd2lkdGg6IDcwdnc7XG4gICAgbWFyZ2luOjAgYXV0bzsgICAgXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgYm9yZGVyOjNweCBzb2xpZCBibGFjaztcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXRleHQtY29sb3IpXG59XG4ubWVudXtcbiAgICBoZWlnaHQ6IDkwJTtcbiAgICB3aWR0aDogOTUlO1xuICAgIGJvcmRlcjozcHggc29saWQgYmxhY2s7XG4gICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgIG92ZXJmbG93OiBhdXRvO1xufVxuLm1lbnVQYWdlIC5tZW51IHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDMsIDFmcik7XG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiAyNDBweCAxZnI7XG4gICAgZ3JpZC1hdXRvLWZsb3c6IGNvbHVtbjtcbn1cbi5tZW51UGFnZSAubWVudSBociB7XG4gICAgYm9yZGVyOiAycHggc29saWQgYmxhY2s7XG4gICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDUwJTtcbiAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogNTAlO1xuICAgIHdpZHRoOiA4MCU7XG4gICAgbWFyZ2luOjBweDtcbn1cbi50aXRsZXtcbiAgICBwYWRkaW5nOjEwcHg7XG4gICAgZm9udC1zaXplOiA1cmVtO1xuICAgIG1hcmdpbi10b3A6MTBweDtcbiAgICBwYWRkaW5nLXRvcDowcHg7XG4gICAgYm9yZGVyLXJpZ2h0OiAycHggc29saWQgYmxhY2s7XG4gICAgei1pbmRleDogMjtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbn1cblxuc2VjdGlvbiBpbWcge1xuICAgIHdpZHRoOiAxMjBweDtcbiAgICBoZWlnaHQ6IDgycHg7XG4gICAgYm9yZGVyLXJhZGl1czogMjAlO1xuICAgIGJvcmRlcjoycHggc29saWQgYmxhY2s7XG4gICAgbWFyZ2luLWxlZnQ6IDEwcHg7XG59XG5zZWN0aW9uID4gZGl2Om50aC1jaGlsZCgxKXtcbiAgICBmb250LXNpemU6IDEuNXJlbTtcbiAgICBtYXJnaW46IDEwcHg7XG4gICAgcGFkZGluZy1sZWZ0OjEwcHg7XG4gICAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbiAgICBib3JkZXI6IDJweCBzb2xpZCBibGFjaztcbiAgICB3aWR0aDogODhweDtcbiAgICBoZWlnaHQ6IDQwcHg7XG4gICAgYm9yZGVyLXJhZGl1czogNSU7XG4gICAgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogMzAlO1xuICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiAzMCU7XG59XG5zZWN0aW9uID4gZGl2e1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBhdXRvIDFmcjtcbiAgICBncmlkLWF1dG8tZmxvdzogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZm9udC1zaXplOiAxLjVyZW07XG4gICAgZ2FwOjEwcHg7XG4gICAgbWFyZ2luLWJvdHRvbTogNXB4O1xufVxuc2VjdGlvbiA+IGRpdiA+IGRpdjpudGgtY2hpbGQoMyl7XG4gICAgbWFyZ2luLXJpZ2h0OiAxNXB4O1xufVxuLnBhc3RyeXtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtcm93czogNjBweCByZXBlYXQoMyxhdXRvKTtcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xuICAgIGJvcmRlci1yaWdodDogMnB4IHNvbGlkIGJsYWNrO1xuICAgIHotaW5kZXg6IDI7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG59XG4uZGVzZXJ0LFxuLmRyaW5re1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC1yb3c6IDEgLyAzO1xuICAgIG1hcmdpbi10b3A6MTBweDtcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xufVxuLmRlc2VydHtcbiAgICBib3JkZXItcmlnaHQ6IDJweCBzb2xpZCBibGFjaztcbiAgICB6LWluZGV4OiAxO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xufVxuLmRlc2VydCA+IGRpdjpudGgtY2hpbGQoMSl7XG4gICAgd2lkdGg6IDgwcHg7XG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xufVxuLmRyaW5rID4gZGl2Om50aC1jaGlsZCgxKXtcbiAgICB3aWR0aDogNzBweDtcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XG59XG4ubWVudVBhZ2UgPiAubmF2aWdhdGlvbiA+IGRpdjpudGgtY2hpbGQoMil7XG4gICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLXRleHQtY29sb3IpO1xufVxuLmRyaW5re1xuICAgIHotaW5kZXg6IDA7XG59XG5gLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9jc3MvbWVudXBhZ2UuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBO0lBQ0ksWUFBWTtJQUNaLGFBQWE7SUFDYiwyQ0FBMkM7QUFDL0M7QUFDQTtJQUNJLGtCQUFrQjtBQUN0QjtBQUNBO0lBQ0ksWUFBWTtJQUNaLFdBQVc7SUFDWCxhQUFhO0lBQ2IsdUJBQXVCO0lBQ3ZCLHNCQUFzQjtJQUN0QixrQkFBa0I7SUFDbEIsYUFBYTtJQUNiLHVCQUF1QjtJQUN2QixtQkFBbUI7SUFDbkI7QUFDSjtBQUNBO0lBQ0ksV0FBVztJQUNYLFVBQVU7SUFDVixzQkFBc0I7SUFDdEIsa0JBQWtCO0lBQ2xCLHVCQUF1QjtJQUN2QixjQUFjO0FBQ2xCO0FBQ0E7SUFDSSxhQUFhO0lBQ2IscUNBQXFDO0lBQ3JDLDZCQUE2QjtJQUM3QixzQkFBc0I7QUFDMUI7QUFDQTtJQUNJLHVCQUF1QjtJQUN2Qiw0QkFBNEI7SUFDNUIsK0JBQStCO0lBQy9CLFVBQVU7SUFDVixVQUFVO0FBQ2Q7QUFDQTtJQUNJLFlBQVk7SUFDWixlQUFlO0lBQ2YsZUFBZTtJQUNmLGVBQWU7SUFDZiw2QkFBNkI7SUFDN0IsVUFBVTtJQUNWLHVCQUF1QjtBQUMzQjs7QUFFQTtJQUNJLFlBQVk7SUFDWixZQUFZO0lBQ1osa0JBQWtCO0lBQ2xCLHNCQUFzQjtJQUN0QixpQkFBaUI7QUFDckI7QUFDQTtJQUNJLGlCQUFpQjtJQUNqQixZQUFZO0lBQ1osaUJBQWlCO0lBQ2pCLG1CQUFtQjtJQUNuQix1QkFBdUI7SUFDdkIsV0FBVztJQUNYLFlBQVk7SUFDWixpQkFBaUI7SUFDakIsMkJBQTJCO0lBQzNCLDRCQUE0QjtBQUNoQztBQUNBO0lBQ0ksYUFBYTtJQUNiLCtCQUErQjtJQUMvQixzQkFBc0I7SUFDdEIsbUJBQW1CO0lBQ25CLGlCQUFpQjtJQUNqQixRQUFRO0lBQ1Isa0JBQWtCO0FBQ3RCO0FBQ0E7SUFDSSxrQkFBa0I7QUFDdEI7QUFDQTtJQUNJLGFBQWE7SUFDYix1Q0FBdUM7SUFDdkMsbUJBQW1CO0lBQ25CLDZCQUE2QjtJQUM3QixVQUFVO0lBQ1YsdUJBQXVCO0FBQzNCO0FBQ0E7O0lBRUksYUFBYTtJQUNiLGVBQWU7SUFDZixlQUFlO0lBQ2YsbUJBQW1CO0FBQ3ZCO0FBQ0E7SUFDSSw2QkFBNkI7SUFDN0IsVUFBVTtJQUNWLHVCQUF1QjtBQUMzQjtBQUNBO0lBQ0ksV0FBVztJQUNYLGtCQUFrQjtBQUN0QjtBQUNBO0lBQ0ksV0FBVztJQUNYLGtCQUFrQjtBQUN0QjtBQUNBO0lBQ0ksMENBQTBDO0FBQzlDO0FBQ0E7SUFDSSxVQUFVO0FBQ2RcIixcInNvdXJjZXNDb250ZW50XCI6W1wiLm1lbnVQYWdle1xcbiAgICBoZWlnaHQ6IDk5dmg7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtcm93czogNDVweCBhdXRvIDFmciBhdXRvIGF1dG87ICAgXFxufVxcbi5tZW51UGFnZSA+IGRpdjpudGgtY2hpbGQoMyl7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG59XFxuLm91dGVyTWVudXtcXG4gICAgaGVpZ2h0OiA3OHZoO1xcbiAgICB3aWR0aDogNzB2dztcXG4gICAgbWFyZ2luOjAgYXV0bzsgICAgXFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgICBib3JkZXI6M3B4IHNvbGlkIGJsYWNrO1xcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKVxcbn1cXG4ubWVudXtcXG4gICAgaGVpZ2h0OiA5MCU7XFxuICAgIHdpZHRoOiA5NSU7XFxuICAgIGJvcmRlcjozcHggc29saWQgYmxhY2s7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxuICAgIG92ZXJmbG93OiBhdXRvO1xcbn1cXG4ubWVudVBhZ2UgLm1lbnUge1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAxZnIpO1xcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDI0MHB4IDFmcjtcXG4gICAgZ3JpZC1hdXRvLWZsb3c6IGNvbHVtbjtcXG59XFxuLm1lbnVQYWdlIC5tZW51IGhyIHtcXG4gICAgYm9yZGVyOiAycHggc29saWQgYmxhY2s7XFxuICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiA1MCU7XFxuICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiA1MCU7XFxuICAgIHdpZHRoOiA4MCU7XFxuICAgIG1hcmdpbjowcHg7XFxufVxcbi50aXRsZXtcXG4gICAgcGFkZGluZzoxMHB4O1xcbiAgICBmb250LXNpemU6IDVyZW07XFxuICAgIG1hcmdpbi10b3A6MTBweDtcXG4gICAgcGFkZGluZy10b3A6MHB4O1xcbiAgICBib3JkZXItcmlnaHQ6IDJweCBzb2xpZCBibGFjaztcXG4gICAgei1pbmRleDogMjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxufVxcblxcbnNlY3Rpb24gaW1nIHtcXG4gICAgd2lkdGg6IDEyMHB4O1xcbiAgICBoZWlnaHQ6IDgycHg7XFxuICAgIGJvcmRlci1yYWRpdXM6IDIwJTtcXG4gICAgYm9yZGVyOjJweCBzb2xpZCBibGFjaztcXG4gICAgbWFyZ2luLWxlZnQ6IDEwcHg7XFxufVxcbnNlY3Rpb24gPiBkaXY6bnRoLWNoaWxkKDEpe1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gICAgbWFyZ2luOiAxMHB4O1xcbiAgICBwYWRkaW5nLWxlZnQ6MTBweDtcXG4gICAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcXG4gICAgYm9yZGVyOiAycHggc29saWQgYmxhY2s7XFxuICAgIHdpZHRoOiA4OHB4O1xcbiAgICBoZWlnaHQ6IDQwcHg7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUlO1xcbiAgICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAzMCU7XFxuICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiAzMCU7XFxufVxcbnNlY3Rpb24gPiBkaXZ7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byAxZnI7XFxuICAgIGdyaWQtYXV0by1mbG93OiBjb2x1bW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgICBnYXA6MTBweDtcXG4gICAgbWFyZ2luLWJvdHRvbTogNXB4O1xcbn1cXG5zZWN0aW9uID4gZGl2ID4gZGl2Om50aC1jaGlsZCgzKXtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxNXB4O1xcbn1cXG4ucGFzdHJ5e1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDYwcHggcmVwZWF0KDMsYXV0byk7XFxuICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XFxuICAgIGJvcmRlci1yaWdodDogMnB4IHNvbGlkIGJsYWNrO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcXG59XFxuLmRlc2VydCxcXG4uZHJpbmt7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtcm93OiAxIC8gMztcXG4gICAgbWFyZ2luLXRvcDoxMHB4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xcbn1cXG4uZGVzZXJ0e1xcbiAgICBib3JkZXItcmlnaHQ6IDJweCBzb2xpZCBibGFjaztcXG4gICAgei1pbmRleDogMTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxufVxcbi5kZXNlcnQgPiBkaXY6bnRoLWNoaWxkKDEpe1xcbiAgICB3aWR0aDogODBweDtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbn1cXG4uZHJpbmsgPiBkaXY6bnRoLWNoaWxkKDEpe1xcbiAgICB3aWR0aDogNzBweDtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbn1cXG4ubWVudVBhZ2UgPiAubmF2aWdhdGlvbiA+IGRpdjpudGgtY2hpbGQoMil7XFxuICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS10ZXh0LWNvbG9yKTtcXG59XFxuLmRyaW5re1xcbiAgICB6LWluZGV4OiAwO1xcbn1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYC8qISBub3JtYWxpemUuY3NzIHY4LjAuMSB8IE1JVCBMaWNlbnNlIHwgZ2l0aHViLmNvbS9uZWNvbGFzL25vcm1hbGl6ZS5jc3MgKi9cblxuLyogRG9jdW1lbnRcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi8qKlxuICogMS4gQ29ycmVjdCB0aGUgbGluZSBoZWlnaHQgaW4gYWxsIGJyb3dzZXJzLlxuICogMi4gUHJldmVudCBhZGp1c3RtZW50cyBvZiBmb250IHNpemUgYWZ0ZXIgb3JpZW50YXRpb24gY2hhbmdlcyBpbiBpT1MuXG4gKi9cblxuIGh0bWwge1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1OyAvKiAxICovXG4gICAgLXdlYmtpdC10ZXh0LXNpemUtYWRqdXN0OiAxMDAlOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qIFNlY3Rpb25zXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4gIFxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBtYXJnaW4gaW4gYWxsIGJyb3dzZXJzLlxuICAgKi9cbiAgXG4gIGJvZHkge1xuICAgIG1hcmdpbjogMDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgXFxgbWFpblxcYCBlbGVtZW50IGNvbnNpc3RlbnRseSBpbiBJRS5cbiAgICovXG4gIFxuICBtYWluIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgfVxuICBcbiAgLyoqXG4gICAqIENvcnJlY3QgdGhlIGZvbnQgc2l6ZSBhbmQgbWFyZ2luIG9uIFxcYGgxXFxgIGVsZW1lbnRzIHdpdGhpbiBcXGBzZWN0aW9uXFxgIGFuZFxuICAgKiBcXGBhcnRpY2xlXFxgIGNvbnRleHRzIGluIENocm9tZSwgRmlyZWZveCwgYW5kIFNhZmFyaS5cbiAgICovXG4gIFxuICBoMSB7XG4gICAgZm9udC1zaXplOiAyZW07XG4gICAgbWFyZ2luOiAwLjY3ZW0gMDtcbiAgfVxuICBcbiAgLyogR3JvdXBpbmcgY29udGVudFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuICBcbiAgLyoqXG4gICAqIDEuIEFkZCB0aGUgY29ycmVjdCBib3ggc2l6aW5nIGluIEZpcmVmb3guXG4gICAqIDIuIFNob3cgdGhlIG92ZXJmbG93IGluIEVkZ2UgYW5kIElFLlxuICAgKi9cbiAgXG4gIGhyIHtcbiAgICBib3gtc2l6aW5nOiBjb250ZW50LWJveDsgLyogMSAqL1xuICAgIGhlaWdodDogMDsgLyogMSAqL1xuICAgIG92ZXJmbG93OiB2aXNpYmxlOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiAxLiBDb3JyZWN0IHRoZSBpbmhlcml0YW5jZSBhbmQgc2NhbGluZyBvZiBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxuICAgKiAyLiBDb3JyZWN0IHRoZSBvZGQgXFxgZW1cXGAgZm9udCBzaXppbmcgaW4gYWxsIGJyb3dzZXJzLlxuICAgKi9cbiAgXG4gIHByZSB7XG4gICAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZSwgbW9ub3NwYWNlOyAvKiAxICovXG4gICAgZm9udC1zaXplOiAxZW07IC8qIDIgKi9cbiAgfVxuICBcbiAgLyogVGV4dC1sZXZlbCBzZW1hbnRpY3NcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbiAgXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGdyYXkgYmFja2dyb3VuZCBvbiBhY3RpdmUgbGlua3MgaW4gSUUgMTAuXG4gICAqL1xuICBcbiAgYSB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiAxLiBSZW1vdmUgdGhlIGJvdHRvbSBib3JkZXIgaW4gQ2hyb21lIDU3LVxuICAgKiAyLiBBZGQgdGhlIGNvcnJlY3QgdGV4dCBkZWNvcmF0aW9uIGluIENocm9tZSwgRWRnZSwgSUUsIE9wZXJhLCBhbmQgU2FmYXJpLlxuICAgKi9cbiAgXG4gIGFiYnJbdGl0bGVdIHtcbiAgICBib3JkZXItYm90dG9tOiBub25lOyAvKiAxICovXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IC8qIDIgKi9cbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7IC8qIDIgKi9cbiAgfVxuICBcbiAgLyoqXG4gICAqIEFkZCB0aGUgY29ycmVjdCBmb250IHdlaWdodCBpbiBDaHJvbWUsIEVkZ2UsIGFuZCBTYWZhcmkuXG4gICAqL1xuICBcbiAgYixcbiAgc3Ryb25nIHtcbiAgICBmb250LXdlaWdodDogYm9sZGVyO1xuICB9XG4gIFxuICAvKipcbiAgICogMS4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2UgYW5kIHNjYWxpbmcgb2YgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiAgICogMi4gQ29ycmVjdCB0aGUgb2RkIFxcYGVtXFxgIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cbiAgICovXG4gIFxuICBjb2RlLFxuICBrYmQsXG4gIHNhbXAge1xuICAgIGZvbnQtZmFtaWx5OiBtb25vc3BhY2UsIG1vbm9zcGFjZTsgLyogMSAqL1xuICAgIGZvbnQtc2l6ZTogMWVtOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiAgICovXG4gIFxuICBzbWFsbCB7XG4gICAgZm9udC1zaXplOiA4MCU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBQcmV2ZW50IFxcYHN1YlxcYCBhbmQgXFxgc3VwXFxgIGVsZW1lbnRzIGZyb20gYWZmZWN0aW5nIHRoZSBsaW5lIGhlaWdodCBpblxuICAgKiBhbGwgYnJvd3NlcnMuXG4gICAqL1xuICBcbiAgc3ViLFxuICBzdXAge1xuICAgIGZvbnQtc2l6ZTogNzUlO1xuICAgIGxpbmUtaGVpZ2h0OiAwO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG4gIH1cbiAgXG4gIHN1YiB7XG4gICAgYm90dG9tOiAtMC4yNWVtO1xuICB9XG4gIFxuICBzdXAge1xuICAgIHRvcDogLTAuNWVtO1xuICB9XG4gIFxuICAvKiBFbWJlZGRlZCBjb250ZW50XG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4gIFxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBib3JkZXIgb24gaW1hZ2VzIGluc2lkZSBsaW5rcyBpbiBJRSAxMC5cbiAgICovXG4gIFxuICBpbWcge1xuICAgIGJvcmRlci1zdHlsZTogbm9uZTtcbiAgfVxuICBcbiAgLyogRm9ybXNcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbiAgXG4gIC8qKlxuICAgKiAxLiBDaGFuZ2UgdGhlIGZvbnQgc3R5bGVzIGluIGFsbCBicm93c2Vycy5cbiAgICogMi4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gRmlyZWZveCBhbmQgU2FmYXJpLlxuICAgKi9cbiAgXG4gIGJ1dHRvbixcbiAgaW5wdXQsXG4gIG9wdGdyb3VwLFxuICBzZWxlY3QsXG4gIHRleHRhcmVhIHtcbiAgICBmb250LWZhbWlseTogaW5oZXJpdDsgLyogMSAqL1xuICAgIGZvbnQtc2l6ZTogMTAwJTsgLyogMSAqL1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1OyAvKiAxICovXG4gICAgbWFyZ2luOiAwOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBTaG93IHRoZSBvdmVyZmxvdyBpbiBJRS5cbiAgICogMS4gU2hvdyB0aGUgb3ZlcmZsb3cgaW4gRWRnZS5cbiAgICovXG4gIFxuICBidXR0b24sXG4gIGlucHV0IHsgLyogMSAqL1xuICAgIG92ZXJmbG93OiB2aXNpYmxlO1xuICB9XG4gIFxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBpbmhlcml0YW5jZSBvZiB0ZXh0IHRyYW5zZm9ybSBpbiBFZGdlLCBGaXJlZm94LCBhbmQgSUUuXG4gICAqIDEuIFJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRmlyZWZveC5cbiAgICovXG4gIFxuICBidXR0b24sXG4gIHNlbGVjdCB7IC8qIDEgKi9cbiAgICB0ZXh0LXRyYW5zZm9ybTogbm9uZTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4gICAqL1xuICBcbiAgYnV0dG9uLFxuICBbdHlwZT1cImJ1dHRvblwiXSxcbiAgW3R5cGU9XCJyZXNldFwiXSxcbiAgW3R5cGU9XCJzdWJtaXRcIl0ge1xuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uO1xuICB9XG4gIFxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBpbm5lciBib3JkZXIgYW5kIHBhZGRpbmcgaW4gRmlyZWZveC5cbiAgICovXG4gIFxuICBidXR0b246Oi1tb3otZm9jdXMtaW5uZXIsXG4gIFt0eXBlPVwiYnV0dG9uXCJdOjotbW96LWZvY3VzLWlubmVyLFxuICBbdHlwZT1cInJlc2V0XCJdOjotbW96LWZvY3VzLWlubmVyLFxuICBbdHlwZT1cInN1Ym1pdFwiXTo6LW1vei1mb2N1cy1pbm5lciB7XG4gICAgYm9yZGVyLXN0eWxlOiBub25lO1xuICAgIHBhZGRpbmc6IDA7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBSZXN0b3JlIHRoZSBmb2N1cyBzdHlsZXMgdW5zZXQgYnkgdGhlIHByZXZpb3VzIHJ1bGUuXG4gICAqL1xuICBcbiAgYnV0dG9uOi1tb3otZm9jdXNyaW5nLFxuICBbdHlwZT1cImJ1dHRvblwiXTotbW96LWZvY3VzcmluZyxcbiAgW3R5cGU9XCJyZXNldFwiXTotbW96LWZvY3VzcmluZyxcbiAgW3R5cGU9XCJzdWJtaXRcIl06LW1vei1mb2N1c3Jpbmcge1xuICAgIG91dGxpbmU6IDFweCBkb3R0ZWQgQnV0dG9uVGV4dDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIENvcnJlY3QgdGhlIHBhZGRpbmcgaW4gRmlyZWZveC5cbiAgICovXG4gIFxuICBmaWVsZHNldCB7XG4gICAgcGFkZGluZzogMC4zNWVtIDAuNzVlbSAwLjYyNWVtO1xuICB9XG4gIFxuICAvKipcbiAgICogMS4gQ29ycmVjdCB0aGUgdGV4dCB3cmFwcGluZyBpbiBFZGdlIGFuZCBJRS5cbiAgICogMi4gQ29ycmVjdCB0aGUgY29sb3IgaW5oZXJpdGFuY2UgZnJvbSBcXGBmaWVsZHNldFxcYCBlbGVtZW50cyBpbiBJRS5cbiAgICogMy4gUmVtb3ZlIHRoZSBwYWRkaW5nIHNvIGRldmVsb3BlcnMgYXJlIG5vdCBjYXVnaHQgb3V0IHdoZW4gdGhleSB6ZXJvIG91dFxuICAgKiAgICBcXGBmaWVsZHNldFxcYCBlbGVtZW50cyBpbiBhbGwgYnJvd3NlcnMuXG4gICAqL1xuICBcbiAgbGVnZW5kIHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94OyAvKiAxICovXG4gICAgY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgICBkaXNwbGF5OiB0YWJsZTsgLyogMSAqL1xuICAgIG1heC13aWR0aDogMTAwJTsgLyogMSAqL1xuICAgIHBhZGRpbmc6IDA7IC8qIDMgKi9cbiAgICB3aGl0ZS1zcGFjZTogbm9ybWFsOyAvKiAxICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgdmVydGljYWwgYWxpZ25tZW50IGluIENocm9tZSwgRmlyZWZveCwgYW5kIE9wZXJhLlxuICAgKi9cbiAgXG4gIHByb2dyZXNzIHtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGRlZmF1bHQgdmVydGljYWwgc2Nyb2xsYmFyIGluIElFIDEwKy5cbiAgICovXG4gIFxuICB0ZXh0YXJlYSB7XG4gICAgb3ZlcmZsb3c6IGF1dG87XG4gIH1cbiAgXG4gIC8qKlxuICAgKiAxLiBBZGQgdGhlIGNvcnJlY3QgYm94IHNpemluZyBpbiBJRSAxMC5cbiAgICogMi4gUmVtb3ZlIHRoZSBwYWRkaW5nIGluIElFIDEwLlxuICAgKi9cbiAgXG4gIFt0eXBlPVwiY2hlY2tib3hcIl0sXG4gIFt0eXBlPVwicmFkaW9cIl0ge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cbiAgICBwYWRkaW5nOiAwOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBDb3JyZWN0IHRoZSBjdXJzb3Igc3R5bGUgb2YgaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYnV0dG9ucyBpbiBDaHJvbWUuXG4gICAqL1xuICBcbiAgW3R5cGU9XCJudW1iZXJcIl06Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24sXG4gIFt0eXBlPVwibnVtYmVyXCJdOjotd2Via2l0LW91dGVyLXNwaW4tYnV0dG9uIHtcbiAgICBoZWlnaHQ6IGF1dG87XG4gIH1cbiAgXG4gIC8qKlxuICAgKiAxLiBDb3JyZWN0IHRoZSBvZGQgYXBwZWFyYW5jZSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cbiAgICogMi4gQ29ycmVjdCB0aGUgb3V0bGluZSBzdHlsZSBpbiBTYWZhcmkuXG4gICAqL1xuICBcbiAgW3R5cGU9XCJzZWFyY2hcIl0ge1xuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogdGV4dGZpZWxkOyAvKiAxICovXG4gICAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7IC8qIDIgKi9cbiAgfVxuICBcbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgaW5uZXIgcGFkZGluZyBpbiBDaHJvbWUgYW5kIFNhZmFyaSBvbiBtYWNPUy5cbiAgICovXG4gIFxuICBbdHlwZT1cInNlYXJjaFwiXTo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xuICB9XG4gIFxuICAvKipcbiAgICogMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbiAgICogMi4gQ2hhbmdlIGZvbnQgcHJvcGVydGllcyB0byBcXGBpbmhlcml0XFxgIGluIFNhZmFyaS5cbiAgICovXG4gIFxuICA6Oi13ZWJraXQtZmlsZS11cGxvYWQtYnV0dG9uIHtcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjsgLyogMSAqL1xuICAgIGZvbnQ6IGluaGVyaXQ7IC8qIDIgKi9cbiAgfVxuICBcbiAgLyogSW50ZXJhY3RpdmVcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbiAgXG4gIC8qXG4gICAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIEVkZ2UsIElFIDEwKywgYW5kIEZpcmVmb3guXG4gICAqL1xuICBcbiAgZGV0YWlscyB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gIH1cbiAgXG4gIC8qXG4gICAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIGFsbCBicm93c2Vycy5cbiAgICovXG4gIFxuICBzdW1tYXJ5IHtcbiAgICBkaXNwbGF5OiBsaXN0LWl0ZW07XG4gIH1cbiAgXG4gIC8qIE1pc2NcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbiAgXG4gIC8qKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBJRSAxMCsuXG4gICAqL1xuICBcbiAgdGVtcGxhdGUge1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBJRSAxMC5cbiAgICovXG4gIFxuICBbaGlkZGVuXSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuICBgLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9jc3Mvbm9ybWFsaXplLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQSwyRUFBMkU7O0FBRTNFOytFQUMrRTs7QUFFL0U7OztFQUdFOztDQUVEO0lBQ0csaUJBQWlCLEVBQUUsTUFBTTtJQUN6Qiw4QkFBOEIsRUFBRSxNQUFNO0VBQ3hDOztFQUVBO2lGQUMrRTs7RUFFL0U7O0lBRUU7O0VBRUY7SUFDRSxTQUFTO0VBQ1g7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSxjQUFjO0VBQ2hCOztFQUVBOzs7SUFHRTs7RUFFRjtJQUNFLGNBQWM7SUFDZCxnQkFBZ0I7RUFDbEI7O0VBRUE7aUZBQytFOztFQUUvRTs7O0lBR0U7O0VBRUY7SUFDRSx1QkFBdUIsRUFBRSxNQUFNO0lBQy9CLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLGlCQUFpQixFQUFFLE1BQU07RUFDM0I7O0VBRUE7OztJQUdFOztFQUVGO0lBQ0UsaUNBQWlDLEVBQUUsTUFBTTtJQUN6QyxjQUFjLEVBQUUsTUFBTTtFQUN4Qjs7RUFFQTtpRkFDK0U7O0VBRS9FOztJQUVFOztFQUVGO0lBQ0UsNkJBQTZCO0VBQy9COztFQUVBOzs7SUFHRTs7RUFFRjtJQUNFLG1CQUFtQixFQUFFLE1BQU07SUFDM0IsMEJBQTBCLEVBQUUsTUFBTTtJQUNsQyxpQ0FBaUMsRUFBRSxNQUFNO0VBQzNDOztFQUVBOztJQUVFOztFQUVGOztJQUVFLG1CQUFtQjtFQUNyQjs7RUFFQTs7O0lBR0U7O0VBRUY7OztJQUdFLGlDQUFpQyxFQUFFLE1BQU07SUFDekMsY0FBYyxFQUFFLE1BQU07RUFDeEI7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSxjQUFjO0VBQ2hCOztFQUVBOzs7SUFHRTs7RUFFRjs7SUFFRSxjQUFjO0lBQ2QsY0FBYztJQUNkLGtCQUFrQjtJQUNsQix3QkFBd0I7RUFDMUI7O0VBRUE7SUFDRSxlQUFlO0VBQ2pCOztFQUVBO0lBQ0UsV0FBVztFQUNiOztFQUVBO2lGQUMrRTs7RUFFL0U7O0lBRUU7O0VBRUY7SUFDRSxrQkFBa0I7RUFDcEI7O0VBRUE7aUZBQytFOztFQUUvRTs7O0lBR0U7O0VBRUY7Ozs7O0lBS0Usb0JBQW9CLEVBQUUsTUFBTTtJQUM1QixlQUFlLEVBQUUsTUFBTTtJQUN2QixpQkFBaUIsRUFBRSxNQUFNO0lBQ3pCLFNBQVMsRUFBRSxNQUFNO0VBQ25COztFQUVBOzs7SUFHRTs7RUFFRjtVQUNRLE1BQU07SUFDWixpQkFBaUI7RUFDbkI7O0VBRUE7OztJQUdFOztFQUVGO1dBQ1MsTUFBTTtJQUNiLG9CQUFvQjtFQUN0Qjs7RUFFQTs7SUFFRTs7RUFFRjs7OztJQUlFLDBCQUEwQjtFQUM1Qjs7RUFFQTs7SUFFRTs7RUFFRjs7OztJQUlFLGtCQUFrQjtJQUNsQixVQUFVO0VBQ1o7O0VBRUE7O0lBRUU7O0VBRUY7Ozs7SUFJRSw4QkFBOEI7RUFDaEM7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSw4QkFBOEI7RUFDaEM7O0VBRUE7Ozs7O0lBS0U7O0VBRUY7SUFDRSxzQkFBc0IsRUFBRSxNQUFNO0lBQzlCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLGVBQWUsRUFBRSxNQUFNO0lBQ3ZCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLG1CQUFtQixFQUFFLE1BQU07RUFDN0I7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSx3QkFBd0I7RUFDMUI7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSxjQUFjO0VBQ2hCOztFQUVBOzs7SUFHRTs7RUFFRjs7SUFFRSxzQkFBc0IsRUFBRSxNQUFNO0lBQzlCLFVBQVUsRUFBRSxNQUFNO0VBQ3BCOztFQUVBOztJQUVFOztFQUVGOztJQUVFLFlBQVk7RUFDZDs7RUFFQTs7O0lBR0U7O0VBRUY7SUFDRSw2QkFBNkIsRUFBRSxNQUFNO0lBQ3JDLG9CQUFvQixFQUFFLE1BQU07RUFDOUI7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSx3QkFBd0I7RUFDMUI7O0VBRUE7OztJQUdFOztFQUVGO0lBQ0UsMEJBQTBCLEVBQUUsTUFBTTtJQUNsQyxhQUFhLEVBQUUsTUFBTTtFQUN2Qjs7RUFFQTtpRkFDK0U7O0VBRS9FOztJQUVFOztFQUVGO0lBQ0UsY0FBYztFQUNoQjs7RUFFQTs7SUFFRTs7RUFFRjtJQUNFLGtCQUFrQjtFQUNwQjs7RUFFQTtpRkFDK0U7O0VBRS9FOztJQUVFOztFQUVGO0lBQ0UsYUFBYTtFQUNmOztFQUVBOztJQUVFOztFQUVGO0lBQ0UsYUFBYTtFQUNmXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIi8qISBub3JtYWxpemUuY3NzIHY4LjAuMSB8IE1JVCBMaWNlbnNlIHwgZ2l0aHViLmNvbS9uZWNvbGFzL25vcm1hbGl6ZS5jc3MgKi9cXG5cXG4vKiBEb2N1bWVudFxcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuXFxuLyoqXFxuICogMS4gQ29ycmVjdCB0aGUgbGluZSBoZWlnaHQgaW4gYWxsIGJyb3dzZXJzLlxcbiAqIDIuIFByZXZlbnQgYWRqdXN0bWVudHMgb2YgZm9udCBzaXplIGFmdGVyIG9yaWVudGF0aW9uIGNoYW5nZXMgaW4gaU9TLlxcbiAqL1xcblxcbiBodG1sIHtcXG4gICAgbGluZS1oZWlnaHQ6IDEuMTU7IC8qIDEgKi9cXG4gICAgLXdlYmtpdC10ZXh0LXNpemUtYWRqdXN0OiAxMDAlOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qIFNlY3Rpb25zXFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcbiAgXFxuICAvKipcXG4gICAqIFJlbW92ZSB0aGUgbWFyZ2luIGluIGFsbCBicm93c2Vycy5cXG4gICAqL1xcbiAgXFxuICBib2R5IHtcXG4gICAgbWFyZ2luOiAwO1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIFJlbmRlciB0aGUgYG1haW5gIGVsZW1lbnQgY29uc2lzdGVudGx5IGluIElFLlxcbiAgICovXFxuICBcXG4gIG1haW4ge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBDb3JyZWN0IHRoZSBmb250IHNpemUgYW5kIG1hcmdpbiBvbiBgaDFgIGVsZW1lbnRzIHdpdGhpbiBgc2VjdGlvbmAgYW5kXFxuICAgKiBgYXJ0aWNsZWAgY29udGV4dHMgaW4gQ2hyb21lLCBGaXJlZm94LCBhbmQgU2FmYXJpLlxcbiAgICovXFxuICBcXG4gIGgxIHtcXG4gICAgZm9udC1zaXplOiAyZW07XFxuICAgIG1hcmdpbjogMC42N2VtIDA7XFxuICB9XFxuICBcXG4gIC8qIEdyb3VwaW5nIGNvbnRlbnRcXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuICBcXG4gIC8qKlxcbiAgICogMS4gQWRkIHRoZSBjb3JyZWN0IGJveCBzaXppbmcgaW4gRmlyZWZveC5cXG4gICAqIDIuIFNob3cgdGhlIG92ZXJmbG93IGluIEVkZ2UgYW5kIElFLlxcbiAgICovXFxuICBcXG4gIGhyIHtcXG4gICAgYm94LXNpemluZzogY29udGVudC1ib3g7IC8qIDEgKi9cXG4gICAgaGVpZ2h0OiAwOyAvKiAxICovXFxuICAgIG92ZXJmbG93OiB2aXNpYmxlOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogMS4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2UgYW5kIHNjYWxpbmcgb2YgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cXG4gICAqIDIuIENvcnJlY3QgdGhlIG9kZCBgZW1gIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cXG4gICAqL1xcbiAgXFxuICBwcmUge1xcbiAgICBmb250LWZhbWlseTogbW9ub3NwYWNlLCBtb25vc3BhY2U7IC8qIDEgKi9cXG4gICAgZm9udC1zaXplOiAxZW07IC8qIDIgKi9cXG4gIH1cXG4gIFxcbiAgLyogVGV4dC1sZXZlbCBzZW1hbnRpY3NcXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuICBcXG4gIC8qKlxcbiAgICogUmVtb3ZlIHRoZSBncmF5IGJhY2tncm91bmQgb24gYWN0aXZlIGxpbmtzIGluIElFIDEwLlxcbiAgICovXFxuICBcXG4gIGEge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBSZW1vdmUgdGhlIGJvdHRvbSBib3JkZXIgaW4gQ2hyb21lIDU3LVxcbiAgICogMi4gQWRkIHRoZSBjb3JyZWN0IHRleHQgZGVjb3JhdGlvbiBpbiBDaHJvbWUsIEVkZ2UsIElFLCBPcGVyYSwgYW5kIFNhZmFyaS5cXG4gICAqL1xcbiAgXFxuICBhYmJyW3RpdGxlXSB7XFxuICAgIGJvcmRlci1ib3R0b206IG5vbmU7IC8qIDEgKi9cXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IC8qIDIgKi9cXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogQWRkIHRoZSBjb3JyZWN0IGZvbnQgd2VpZ2h0IGluIENocm9tZSwgRWRnZSwgYW5kIFNhZmFyaS5cXG4gICAqL1xcbiAgXFxuICBiLFxcbiAgc3Ryb25nIHtcXG4gICAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBDb3JyZWN0IHRoZSBpbmhlcml0YW5jZSBhbmQgc2NhbGluZyBvZiBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxcbiAgICogMi4gQ29ycmVjdCB0aGUgb2RkIGBlbWAgZm9udCBzaXppbmcgaW4gYWxsIGJyb3dzZXJzLlxcbiAgICovXFxuICBcXG4gIGNvZGUsXFxuICBrYmQsXFxuICBzYW1wIHtcXG4gICAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZSwgbW9ub3NwYWNlOyAvKiAxICovXFxuICAgIGZvbnQtc2l6ZTogMWVtOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogQWRkIHRoZSBjb3JyZWN0IGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXFxuICAgKi9cXG4gIFxcbiAgc21hbGwge1xcbiAgICBmb250LXNpemU6IDgwJTtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBQcmV2ZW50IGBzdWJgIGFuZCBgc3VwYCBlbGVtZW50cyBmcm9tIGFmZmVjdGluZyB0aGUgbGluZSBoZWlnaHQgaW5cXG4gICAqIGFsbCBicm93c2Vycy5cXG4gICAqL1xcbiAgXFxuICBzdWIsXFxuICBzdXAge1xcbiAgICBmb250LXNpemU6IDc1JTtcXG4gICAgbGluZS1oZWlnaHQ6IDA7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbiAgfVxcbiAgXFxuICBzdWIge1xcbiAgICBib3R0b206IC0wLjI1ZW07XFxuICB9XFxuICBcXG4gIHN1cCB7XFxuICAgIHRvcDogLTAuNWVtO1xcbiAgfVxcbiAgXFxuICAvKiBFbWJlZGRlZCBjb250ZW50XFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcbiAgXFxuICAvKipcXG4gICAqIFJlbW92ZSB0aGUgYm9yZGVyIG9uIGltYWdlcyBpbnNpZGUgbGlua3MgaW4gSUUgMTAuXFxuICAgKi9cXG4gIFxcbiAgaW1nIHtcXG4gICAgYm9yZGVyLXN0eWxlOiBub25lO1xcbiAgfVxcbiAgXFxuICAvKiBGb3Jtc1xcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBDaGFuZ2UgdGhlIGZvbnQgc3R5bGVzIGluIGFsbCBicm93c2Vycy5cXG4gICAqIDIuIFJlbW92ZSB0aGUgbWFyZ2luIGluIEZpcmVmb3ggYW5kIFNhZmFyaS5cXG4gICAqL1xcbiAgXFxuICBidXR0b24sXFxuICBpbnB1dCxcXG4gIG9wdGdyb3VwLFxcbiAgc2VsZWN0LFxcbiAgdGV4dGFyZWEge1xcbiAgICBmb250LWZhbWlseTogaW5oZXJpdDsgLyogMSAqL1xcbiAgICBmb250LXNpemU6IDEwMCU7IC8qIDEgKi9cXG4gICAgbGluZS1oZWlnaHQ6IDEuMTU7IC8qIDEgKi9cXG4gICAgbWFyZ2luOiAwOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogU2hvdyB0aGUgb3ZlcmZsb3cgaW4gSUUuXFxuICAgKiAxLiBTaG93IHRoZSBvdmVyZmxvdyBpbiBFZGdlLlxcbiAgICovXFxuICBcXG4gIGJ1dHRvbixcXG4gIGlucHV0IHsgLyogMSAqL1xcbiAgICBvdmVyZmxvdzogdmlzaWJsZTtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBSZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEVkZ2UsIEZpcmVmb3gsIGFuZCBJRS5cXG4gICAqIDEuIFJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRmlyZWZveC5cXG4gICAqL1xcbiAgXFxuICBidXR0b24sXFxuICBzZWxlY3QgeyAvKiAxICovXFxuICAgIHRleHQtdHJhbnNmb3JtOiBub25lO1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXFxuICAgKi9cXG4gIFxcbiAgYnV0dG9uLFxcbiAgW3R5cGU9XFxcImJ1dHRvblxcXCJdLFxcbiAgW3R5cGU9XFxcInJlc2V0XFxcIl0sXFxuICBbdHlwZT1cXFwic3VibWl0XFxcIl0ge1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBSZW1vdmUgdGhlIGlubmVyIGJvcmRlciBhbmQgcGFkZGluZyBpbiBGaXJlZm94LlxcbiAgICovXFxuICBcXG4gIGJ1dHRvbjo6LW1vei1mb2N1cy1pbm5lcixcXG4gIFt0eXBlPVxcXCJidXR0b25cXFwiXTo6LW1vei1mb2N1cy1pbm5lcixcXG4gIFt0eXBlPVxcXCJyZXNldFxcXCJdOjotbW96LWZvY3VzLWlubmVyLFxcbiAgW3R5cGU9XFxcInN1Ym1pdFxcXCJdOjotbW96LWZvY3VzLWlubmVyIHtcXG4gICAgYm9yZGVyLXN0eWxlOiBub25lO1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIFJlc3RvcmUgdGhlIGZvY3VzIHN0eWxlcyB1bnNldCBieSB0aGUgcHJldmlvdXMgcnVsZS5cXG4gICAqL1xcbiAgXFxuICBidXR0b246LW1vei1mb2N1c3JpbmcsXFxuICBbdHlwZT1cXFwiYnV0dG9uXFxcIl06LW1vei1mb2N1c3JpbmcsXFxuICBbdHlwZT1cXFwicmVzZXRcXFwiXTotbW96LWZvY3VzcmluZyxcXG4gIFt0eXBlPVxcXCJzdWJtaXRcXFwiXTotbW96LWZvY3VzcmluZyB7XFxuICAgIG91dGxpbmU6IDFweCBkb3R0ZWQgQnV0dG9uVGV4dDtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBDb3JyZWN0IHRoZSBwYWRkaW5nIGluIEZpcmVmb3guXFxuICAgKi9cXG4gIFxcbiAgZmllbGRzZXQge1xcbiAgICBwYWRkaW5nOiAwLjM1ZW0gMC43NWVtIDAuNjI1ZW07XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogMS4gQ29ycmVjdCB0aGUgdGV4dCB3cmFwcGluZyBpbiBFZGdlIGFuZCBJRS5cXG4gICAqIDIuIENvcnJlY3QgdGhlIGNvbG9yIGluaGVyaXRhbmNlIGZyb20gYGZpZWxkc2V0YCBlbGVtZW50cyBpbiBJRS5cXG4gICAqIDMuIFJlbW92ZSB0aGUgcGFkZGluZyBzbyBkZXZlbG9wZXJzIGFyZSBub3QgY2F1Z2h0IG91dCB3aGVuIHRoZXkgemVybyBvdXRcXG4gICAqICAgIGBmaWVsZHNldGAgZWxlbWVudHMgaW4gYWxsIGJyb3dzZXJzLlxcbiAgICovXFxuICBcXG4gIGxlZ2VuZCB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cXG4gICAgY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cXG4gICAgZGlzcGxheTogdGFibGU7IC8qIDEgKi9cXG4gICAgbWF4LXdpZHRoOiAxMDAlOyAvKiAxICovXFxuICAgIHBhZGRpbmc6IDA7IC8qIDMgKi9cXG4gICAgd2hpdGUtc3BhY2U6IG5vcm1hbDsgLyogMSAqL1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIEFkZCB0aGUgY29ycmVjdCB2ZXJ0aWNhbCBhbGlnbm1lbnQgaW4gQ2hyb21lLCBGaXJlZm94LCBhbmQgT3BlcmEuXFxuICAgKi9cXG4gIFxcbiAgcHJvZ3Jlc3Mge1xcbiAgICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogUmVtb3ZlIHRoZSBkZWZhdWx0IHZlcnRpY2FsIHNjcm9sbGJhciBpbiBJRSAxMCsuXFxuICAgKi9cXG4gIFxcbiAgdGV4dGFyZWEge1xcbiAgICBvdmVyZmxvdzogYXV0bztcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBBZGQgdGhlIGNvcnJlY3QgYm94IHNpemluZyBpbiBJRSAxMC5cXG4gICAqIDIuIFJlbW92ZSB0aGUgcGFkZGluZyBpbiBJRSAxMC5cXG4gICAqL1xcbiAgXFxuICBbdHlwZT1cXFwiY2hlY2tib3hcXFwiXSxcXG4gIFt0eXBlPVxcXCJyYWRpb1xcXCJdIHtcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xcbiAgICBwYWRkaW5nOiAwOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogQ29ycmVjdCB0aGUgY3Vyc29yIHN0eWxlIG9mIGluY3JlbWVudCBhbmQgZGVjcmVtZW50IGJ1dHRvbnMgaW4gQ2hyb21lLlxcbiAgICovXFxuICBcXG4gIFt0eXBlPVxcXCJudW1iZXJcXFwiXTo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbixcXG4gIFt0eXBlPVxcXCJudW1iZXJcXFwiXTo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiB7XFxuICAgIGhlaWdodDogYXV0bztcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBDb3JyZWN0IHRoZSBvZGQgYXBwZWFyYW5jZSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cXG4gICAqIDIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxcbiAgICovXFxuICBcXG4gIFt0eXBlPVxcXCJzZWFyY2hcXFwiXSB7XFxuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogdGV4dGZpZWxkOyAvKiAxICovXFxuICAgIG91dGxpbmUtb2Zmc2V0OiAtMnB4OyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogUmVtb3ZlIHRoZSBpbm5lciBwYWRkaW5nIGluIENocm9tZSBhbmQgU2FmYXJpIG9uIG1hY09TLlxcbiAgICovXFxuICBcXG4gIFt0eXBlPVxcXCJzZWFyY2hcXFwiXTo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XFxuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxcbiAgICogMi4gQ2hhbmdlIGZvbnQgcHJvcGVydGllcyB0byBgaW5oZXJpdGAgaW4gU2FmYXJpLlxcbiAgICovXFxuICBcXG4gIDo6LXdlYmtpdC1maWxlLXVwbG9hZC1idXR0b24ge1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjsgLyogMSAqL1xcbiAgICBmb250OiBpbmhlcml0OyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qIEludGVyYWN0aXZlXFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcbiAgXFxuICAvKlxcbiAgICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gRWRnZSwgSUUgMTArLCBhbmQgRmlyZWZveC5cXG4gICAqL1xcbiAgXFxuICBkZXRhaWxzIHtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICB9XFxuICBcXG4gIC8qXFxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBhbGwgYnJvd3NlcnMuXFxuICAgKi9cXG4gIFxcbiAgc3VtbWFyeSB7XFxuICAgIGRpc3BsYXk6IGxpc3QtaXRlbTtcXG4gIH1cXG4gIFxcbiAgLyogTWlzY1xcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4gIFxcbiAgLyoqXFxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBJRSAxMCsuXFxuICAgKi9cXG4gIFxcbiAgdGVtcGxhdGUge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIElFIDEwLlxcbiAgICovXFxuICBcXG4gIFtoaWRkZW5dIHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG4gIFwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2NvbnRhY3RwYWdlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vY29udGFjdHBhZ2UuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2hvbWVwYWdlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vaG9tZXBhZ2UuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2luZGV4LmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vaW5kZXguY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL21lbnVwYWdlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vbWVudXBhZ2UuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL25vcm1hbGl6ZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL25vcm1hbGl6ZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdXBkYXRlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuICBjc3MgKz0gb2JqLmNzcztcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfVxuXG4gIC8vIEZvciBvbGQgSUVcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiB7XG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHt9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH1cbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsImltcG9ydCBhbmltYXRlIGZyb20gXCIvbm9kZV9tb2R1bGVzL2FuaW1hdGVwbHVzL2FuaW1hdGVwbHVzLmpzXCI7XG5cbmZ1bmN0aW9uIGNvbnRhY3RBbmltYXRpb24oKXtcbiAgICBsZXQgYWxsRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250YWN0UGFnZVwiKS5jaGlsZE5vZGVzO1xuICAgIGFsbERpdiA9IEFycmF5LmZyb20oYWxsRGl2KTtcbiAgICBhbGxEaXYuc3BsaWNlKDEsMSk7XG4gICAgYWxsRGl2LnNwbGljZSgyLDEpO1xuXG4gICAgbGV0IGNvbnRhY3RzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51XCIpLmNoaWxkTm9kZXM7XG4gICAgY29udGFjdHMgPSBBcnJheS5mcm9tKGNvbnRhY3RzKTtcblxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogYWxsRGl2WzBdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGVZKC0yMDAlKVwiLCBcInRyYW5zbGF0ZVkoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGNvbnRhY3RzWzBdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJza2V3WCgxODBkZWcpXCIsIFwic2tld1goMGRlZylcIl1cbiAgICB9KVxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogY29udGFjdHNbMl0sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInNrZXdYKDE4MGRlZylcIiwgXCJza2V3WCgwZGVnKVwiXVxuICAgIH0pXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBjb250YWN0c1szXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1wic2tld1goMTgwZGVnKVwiLCBcInNrZXdYKDBkZWcpXCJdXG4gICAgfSlcblxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogYWxsRGl2WzJdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGVZKDE1MCUpXCIsIFwidHJhbnNsYXRlKDAlKVwiXVxuICAgIH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbnRhY3RBbmltYXRpb24iLCJpbXBvcnQgYW5pbWF0ZSBmcm9tIFwiL25vZGVfbW9kdWxlcy9hbmltYXRlcGx1cy9hbmltYXRlcGx1cy5qc1wiO1xuXG5mdW5jdGlvbiBhbmltYXRpb24oKXtcbiAgICBsZXQgYWxsRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ob21lUGFnZVwiKS5jaGlsZE5vZGVzXG4gICAgYWxsRGl2ID0gQXJyYXkuZnJvbShhbGxEaXYpXG4gICAgYWxsRGl2LnNwbGljZSgxLDEpXG4gICAgYWxsRGl2LnNwbGljZSgzLDEpXG4gICAgXG4gICAgbGV0IGNhcmRzID0gYWxsRGl2WzJdLmNoaWxkTm9kZXNcbiAgICBjYXJkcyA9IEFycmF5LmZyb20oY2FyZHMpXG5cbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGFsbERpdlswXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiB7aW5kZXggKiAxMDB9LCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGVZKC0yMDAlKVwiLCBcInRyYW5zbGF0ZVkoMCUpXCJdXG4gICAgfSlcbiAgICAgICAgXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBhbGxEaXZbMV0sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInNjYWxlKDApXCIsIFwic2NhbGUoMSlcIl1cbiAgICB9KVxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogY2FyZHNbMV0sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInNjYWxlKDApXCIsIFwic2NhbGUoMSlcIl1cbiAgICB9KVxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogY2FyZHNbMF0sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInRyYW5zbGF0ZSgtMTAwJSlcIiwgXCJ0cmFuc2xhdGUoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGNhcmRzWzJdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGUoMTAwJSlcIiwgXCJ0cmFuc2xhdGUoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGFsbERpdlszXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlWSgxNTAlKVwiLCBcInRyYW5zbGF0ZSgwJSlcIl1cbiAgICB9KVxufVxuXG5leHBvcnQgZGVmYXVsdCBhbmltYXRpb247XG4iLCJpbXBvcnQgYW5pbWF0ZSBmcm9tIFwiL25vZGVfbW9kdWxlcy9hbmltYXRlcGx1cy9hbmltYXRlcGx1cy5qc1wiO1xuXG5mdW5jdGlvbiBtZW51QW5pbWF0aW9uKCl7XG4gICAgbGV0IGFsbERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVudVBhZ2VcIikuY2hpbGROb2RlcztcbiAgICBhbGxEaXYgPSBBcnJheS5mcm9tKGFsbERpdik7XG4gICAgYWxsRGl2LnNwbGljZSgxLDEpXG4gICAgYWxsRGl2LnNwbGljZSgyLDEpXG4gICAgXG4gICAgbGV0IHBhc3RyeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGFzdHJ5XCIpLmNoaWxkTm9kZXM7XG4gICAgcGFzdHJ5ID0gQXJyYXkuZnJvbShwYXN0cnkpO1xuICAgIGxldCBkZXNlcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRlc2VydFwiKS5jaGlsZE5vZGVzO1xuICAgIGRlc2VydCA9IEFycmF5LmZyb20oZGVzZXJ0KTtcbiAgICBsZXQgZHJpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRyaW5rXCIpLmNoaWxkTm9kZXM7XG4gICAgZHJpbmsgPSBBcnJheS5mcm9tKGRyaW5rKTtcblxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogYWxsRGl2WzBdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGVZKC0yMDAlKVwiLCBcInRyYW5zbGF0ZVkoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGFsbERpdlsyXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlWSgxNTAlKVwiLCBcInRyYW5zbGF0ZSgwJSlcIl1cbiAgICB9KVxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogcGFzdHJ5LFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLFxuICAgICAgICB0cmFuc2Zvcm06IFtcInRyYW5zbGF0ZSgtMTAwJSlcIiwgXCJ0cmFuc2xhdGUoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGRlc2VydCxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCxcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGUoLTEwMCUpXCIsIFwidHJhbnNsYXRlKDAlKVwiXVxuICAgIH0pXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBkcmluayxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCxcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGUoLTEwMCUpXCIsIFwidHJhbnNsYXRlKDAlKVwiXVxuICAgIH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IG1lbnVBbmltYXRpb247IiwiaW1wb3J0IHsgbmF2aWdhdGlvbk5hbWUgfSBmcm9tIFwiLi9ob21lcGFnZVwiO1xuaW1wb3J0IFwiLi4vY3NzL2NvbnRhY3RwYWdlLmNzc1wiXG5pbXBvcnQgcGhvbmUgZnJvbSBcIi9pbWFnZXMvcGhvbmUuc3ZnXCJcbmltcG9ydCBzdG9yZSBmcm9tIFwiL2ltYWdlcy9zdG9yZS5zdmdcIlxuaW1wb3J0IGZvb3RlciBmcm9tIFwiLi9mb290ZXJcIjtcbmltcG9ydCBjb250YWN0QW5pbWF0aW9uIGZyb20gXCIuLi9hbmltYXRpb24vYW5pbWF0ZUNvbnRhY3RQYWdlXCI7XG5cblxuZnVuY3Rpb24gY29udGFjdHBhZ2UoKXtcbiAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuXG4gICAgY29uc3QgY29udGFjdFBhZ2VDb25lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhY3RQYWdlQ29uZW50LmNsYXNzTGlzdC5hZGQoXCJjb250YWN0UGFnZVwiKTtcbiAgICBcbiAgICAvKiBuYXZpZ2F0aW9uICovXG4gICAgY29uc3QgbmF2aWdhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmF2aWdhdGlvbi5jbGFzc0xpc3QuYWRkKFwibmF2aWdhdGlvblwiKTtcbiAgICBcbiAgICBuYXZpZ2F0aW9uTmFtZShcIkhvbWVcIiwgbmF2aWdhdGlvbik7XG4gICAgbmF2aWdhdGlvbk5hbWUoXCJNZW51XCIsIG5hdmlnYXRpb24pO1xuICAgIG5hdmlnYXRpb25OYW1lKFwiQ29udGFjdFwiLCBuYXZpZ2F0aW9uKTtcblxuICAgIGNvbnRhY3RQYWdlQ29uZW50LmFwcGVuZENoaWxkKG5hdmlnYXRpb24pO1xuICAgIGNvbnRhY3RQYWdlQ29uZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoclwiKSk7XG4gICAgXG4gICAgLyogb3V0ZXIgbG9heW91dCAqL1xuICAgIGxldCBvdXRlck1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG91dGVyTWVudS5jbGFzc0xpc3QuYWRkKFwib3V0ZXJNZW51XCIpO1xuICAgIGxldCBtZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtZW51LmNsYXNzTGlzdC5hZGQoXCJtZW51XCIpO1xuXG4gICAgLyogY29udGFjdHMgKi9cbiAgICBtZW51LmFwcGVuZENoaWxkKGNvbnRhY3RzKFwiNjY2NjYgOTk5OTkgLyA5OTk5OSA2NjY2NlwiLCBwaG9uZSkpO1xuICAgIG1lbnUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpKVxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoY29udGFjdHMoXCJMZXMgSGFsbGVzIENhc3RlbGxhbmVzLCBSdWUgZGUgbCdIZXJiZXJpZSwgMzQwMDAgTW9udHBlbGxpZXIsIEZyYW5jZVwiLCBzdG9yZSkpXG4gICAgXG4gICAgLyogbWFwcyAqL1xuICAgIGxldCBtYXBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKTtcbiAgICBtYXBzLmNsYXNzTGlzdC5hZGQoXCJtYXBzXCIpXG4gICAgbWFwcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgXCJodHRwczovL3d3dy5nb29nbGUuY29tL21hcHMvZW1iZWQ/cGI9ITFtMTghMW0xMiExbTMhMWQyODg4LjgyNjEyNTU4NTk0NDchMmQzLjg3MTkzNzg5MzAxNjE4MSEzZDQzLjYxMDE2MTc4MDcxNTUzNiEybTMhMWYwITJmMCEzZjAhM20yITFpMTAyNCEyaTc2OCE0ZjEzLjEhM20zITFtMiExczB4MTJiNmFmZWU4YjAyMzQ1MSUzQTB4MzQ5NDBlZjk0MjVmMjkyITJ6UTNMRHFHMWxJR1JsSUd4aElFTnl3Nmh0WlEhNWUwITNtMiExc2VuITJzaW4hNHYxNjk1NjYyODExNjcyITVtMiExc2VuITJzaW5cIilcbiAgICBtYXBzLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFwiNjAwXCIpO1xuICAgIG1hcHMuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiNDAwXCIpO1xuICAgIG1hcHMuc2V0QXR0cmlidXRlKFwibG9hZGluZ1wiLCBcImxhenlcIik7XG4gICAgbWFwcy5zZXRBdHRyaWJ1dGUoXCJyZWZlcnJlcnBvbGljeVwiLCBcIm5vLXJlZmVycmVyLXdoZW4tZG93bmdyYWRlXCIpO1xuICAgIG1hcHMuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgXCJib3JkZXI6MnB4IHNvbGlkIGJsYWNrO2JvcmRlci1yYWRpdXM6NXB4XCIpXG4gICAgbWVudS5hcHBlbmRDaGlsZChtYXBzKTtcblxuXG4gICAgb3V0ZXJNZW51LmFwcGVuZENoaWxkKG1lbnUpO1xuICAgIGNvbnRhY3RQYWdlQ29uZW50LmFwcGVuZENoaWxkKG91dGVyTWVudSk7XG4gICAgY29udGFjdFBhZ2VDb25lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpKVxuICAgIGNvbnRhY3RQYWdlQ29uZW50LmFwcGVuZENoaWxkKGZvb3RlcigpKTtcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKGNvbnRhY3RQYWdlQ29uZW50KTtcblxuICAgIGNvbnRhY3RBbmltYXRpb24oKTtcbn1cblxuXG5mdW5jdGlvbiBjb250YWN0cyhudW1iZXIsIGltZyl7XG4gICAgbGV0IGNvbnRhY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGxldCBjb250YWN0SW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICBjb250YWN0SW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCBpbWcpO1xuICAgIGxldCBjb250YWN0TnVtYmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb250YWN0TnVtYmVyLnRleHRDb250ZW50ID0gbnVtYmVyO1xuXG4gICAgY29udGFjdC5hcHBlbmRDaGlsZChjb250YWN0SW1nKTtcbiAgICBjb250YWN0LmFwcGVuZENoaWxkKGNvbnRhY3ROdW1iZXIpO1xuICAgIHJldHVybiBjb250YWN0XG59XG5leHBvcnQgZGVmYXVsdCBjb250YWN0cGFnZTsiLCJpbXBvcnQgZ2l0aHViIGZyb20gIFwiL2ltYWdlcy9naXRodWIuc3ZnXCJcblxuZnVuY3Rpb24gZm9vdGVyKCkge1xuICAgIGxldCBtYWluRm9vdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtYWluRm9vdGVyLmNsYXNzTGlzdC5hZGQoXCJmb290ZXJcIik7XG5cbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYudGV4dENvbnRlbnQgPSBcIk1hZGUgYnkgQWRoaXRoaXlhblwiO1xuICAgIG1haW5Gb290ZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgIGxldCBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcImh0dHBzOi8vZ2l0aHViLmNvbS94QWRoaXRoaXlhblwiKTtcbiAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwidGFyZ2V0XCIsIFwiX2JsYW5rXCIpO1xuICAgIGxldCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgZ2l0aHViKVxuXG4gICAgYW5jaG9yLmFwcGVuZENoaWxkKGltZylcbiAgICBtYWluRm9vdGVyLmFwcGVuZENoaWxkKGFuY2hvcik7XG4gICAgcmV0dXJuIG1haW5Gb290ZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZvb3RlcjsiLCJpbXBvcnQgaG9tZXBhZ2VDYXJkcyBmcm9tIFwiLi9ob21lcGFnZUNhcmRzXCI7XG5pbXBvcnQgZm9vdGVyIGZyb20gXCIuL2Zvb3RlclwiO1xuaW1wb3J0IFwiLi4vY3NzL2hvbWVwYWdlLmNzc1wiXG5pbXBvcnQgbG9nbyBmcm9tIFwiL2ltYWdlcy9sb2dvLmpwZWdcIlxuaW1wb3J0IGFuaW1hdGlvbiBmcm9tIFwiLi4vYW5pbWF0aW9uL2FuaW1hdGVIb21lUGFnZVwiO1xuXG5mdW5jdGlvbiBob21lcGFnZSgpe1xuICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgY29uc3QgaG9tZVBhZ2VDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBob21lUGFnZUNvbnRlbnQuY2xhc3NMaXN0LmFkZChcImhvbWVQYWdlXCIpO1xuXG5cbiAgICAvKiBuYXZpZ2F0aW9uICovXG4gICAgY29uc3QgbmF2aWdhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmF2aWdhdGlvbi5jbGFzc0xpc3QuYWRkKFwibmF2aWdhdGlvblwiKTtcbiAgICBcbiAgICBuYXZpZ2F0aW9uTmFtZShcIkhvbWVcIiwgbmF2aWdhdGlvbik7XG4gICAgbmF2aWdhdGlvbk5hbWUoXCJNZW51XCIsIG5hdmlnYXRpb24pO1xuICAgIG5hdmlnYXRpb25OYW1lKFwiQ29udGFjdFwiLCBuYXZpZ2F0aW9uKTtcblxuICAgIGhvbWVQYWdlQ29udGVudC5hcHBlbmRDaGlsZChuYXZpZ2F0aW9uKTtcbiAgICBob21lUGFnZUNvbnRlbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpKTtcblxuXG4gICAgLyogaGVhZGluZyAqL1xuICAgIGxldCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBoZWFkaW5nLmNsYXNzTGlzdC5hZGQoXCJoZWFkaW5nXCIpO1xuXG4gICAgbGV0IGhlYWRpbmdOYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICBoZWFkaW5nTmFtZS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgbG9nbylcbiAgICBsZXQgc3ViSGVhZGluZ05hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgc3ViSGVhZGluZ05hbWUudGV4dENvbnRlbnQgPSBcIlNpbmNlIDE5MjdcIlxuICAgIFxuICAgIGhlYWRpbmcuYXBwZW5kQ2hpbGQoaGVhZGluZ05hbWUpO1xuICAgIGhlYWRpbmcuYXBwZW5kQ2hpbGQoc3ViSGVhZGluZ05hbWUpXG4gICAgaG9tZVBhZ2VDb250ZW50LmFwcGVuZENoaWxkKGhlYWRpbmcpO1xuXG4gICAgLyogY2FyZHMgKi9cbiAgICBsZXQgbWFpbkNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG1haW5DYXJkLmNsYXNzTGlzdC5hZGQoXCJtYWluQ2FyZFwiKTtcbiAgICBob21lcGFnZUNhcmRzKG1haW5DYXJkLCBcIlRoZSBOZXcgWW9yayBUaW1lc1wiICw1ICwgXCJcXFwiSW4gdGhlIGhlYXJ0IG9mIHRoZSBjaXR5IHRoYXQgbmV2ZXIgc2xlZXBzLCB0aGlzIHBhc3RyeSByZXN0YXVyYW50IGlzIGEgYmVhY29uIG9mIHN3ZWV0bmVzcy4gSXRzIGVsZWdhbnQgcGFzdHJpZXMgYW5kIGNha2VzIGFyZSBhIHRydWUgY3VsaW5hcnkgbWFzdGVycGllY2UsIGVsZXZhdGluZyBkZXNzZXJ0IHRvIGFuIGFydCBmb3JtLlxcXCJcIik7XG4gICAgaG9tZXBhZ2VDYXJkcyhtYWluQ2FyZCwgXCJGb29kICYgV2luZSBNYWdhemluZVwiICw1ICwgIFwiXFxcIlRoaXMgcGFzdHJ5IGhhdmVuIGlzIGEgbXVzdC12aXNpdCBmb3IgYW55b25lIHNlZWtpbmcgYW4gdW5mb3JnZXR0YWJsZSBkZXNzZXJ0IGV4cGVyaWVuY2UuIEVhY2ggYml0ZSBpcyBhIHN5bXBob255IG9mIGZsYXZvcnMgYW5kIHRleHR1cmVzLCBzZXR0aW5nIGEgbmV3IHN0YW5kYXJkIGZvciBwYXN0cnkgZXhjZWxsZW5jZS5cXFwiXCIpO1xuICAgIGhvbWVwYWdlQ2FyZHMobWFpbkNhcmQsIFwiVGhlIE1pY2hlbGluIEd1aWRlXCIsNCAsICBcIlxcXCJFYXJuaW5nIG91ciBjb3ZldGVkIHN0YXIsIHRoaXMgcGFzdHJ5IHJlc3RhdXJhbnQgaXMgYSBkZXN0aW5hdGlvbiBmb3IgdGhvc2Ugc2Vla2luZyByZWZpbmVkLCBleHF1aXNpdGUgZGVzc2VydHMuIFdpdGggaW1wZWNjYWJsZSBjcmFmdHNtYW5zaGlwIGFuZCBhIGRlZGljYXRpb24gdG8gcXVhbGl0eSwgaXQncyBhIHN3ZWV0IHJldmVsYXRpb24gZm9yIGRpc2Nlcm5pbmcgcGFsYXRlcy5cXFwiXCIpO1xuICAgIGhvbWVQYWdlQ29udGVudC5hcHBlbmRDaGlsZChtYWluQ2FyZCk7XG5cbiAgICBob21lUGFnZUNvbnRlbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpKTtcbiAgICAvKiBmb290ZXIgKi9cbiAgICBob21lUGFnZUNvbnRlbnQuYXBwZW5kQ2hpbGQoZm9vdGVyKCkpXG4gICAgXG4gICAgY29udGVudC5hcHBlbmRDaGlsZChob21lUGFnZUNvbnRlbnQpXG4gICAgYW5pbWF0aW9uKCk7XG59XG5cbmZ1bmN0aW9uIG5hdmlnYXRpb25OYW1lKHN0ciAsIG5hdmlnYXRpb24pe1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGxldCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGJ0bi50ZXh0Q29udGVudCA9IHN0cjtcbiAgICBkaXYuYXBwZW5kQ2hpbGQoYnRuKVxuICAgIG5hdmlnYXRpb24uYXBwZW5kQ2hpbGQoZGl2KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG9tZXBhZ2U7XG5leHBvcnQge25hdmlnYXRpb25OYW1lfTtcbiIsImltcG9ydCBzdGFyIGZyb20gXCIvaW1hZ2VzL3N0YXIuc3ZnXCJcblxuZnVuY3Rpb24gaG9tZXBhZ2VDYXJkcyhtYWluQ2FyZCwgdGl0bGUsIG4sIHRleHQpe1xuICAgIGxldCBjYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjYXJkLmNsYXNzTGlzdC5hZGQoXCJjYXJkXCIpO1xuXG4gICAgbGV0IGltZ0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgbjsgaSsrKXtcbiAgICAgICAgbGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgc3Rhcik7XG4gICAgICAgIGltZ0Rpdi5hcHBlbmRDaGlsZChpbWcpO1xuICAgIH1cbiAgICBjYXJkLmFwcGVuZENoaWxkKGltZ0RpdilcblxuICAgIGxldCBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBoZWFkaW5nLnRleHRDb250ZW50ID0gdGl0bGU7XG4gICAgY2FyZC5hcHBlbmRDaGlsZChoZWFkaW5nKTtcblxuICAgIGxldCByZXZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHJldmlldy50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgY2FyZC5hcHBlbmRDaGlsZChyZXZpZXcpO1xuXG4gICAgbWFpbkNhcmQuYXBwZW5kQ2hpbGQoY2FyZClcblxuICAgIFxuICAgIFxufVxuXG5leHBvcnQgZGVmYXVsdCBob21lcGFnZUNhcmRzOyIsImltcG9ydCB7IG5hdmlnYXRpb25OYW1lIH0gZnJvbSBcIi4vaG9tZXBhZ2VcIjtcbmltcG9ydCBcIi4uL2Nzcy9tZW51cGFnZS5jc3NcIlxuaW1wb3J0IGZvb3RlciBmcm9tIFwiLi9mb290ZXJcIjtcbmltcG9ydCBtZW51QW5pbWF0aW9uIGZyb20gXCIuLi9hbmltYXRpb24vYW5pbWF0aW9uTWVudVBhZ2VcIjtcbmltcG9ydCBwYXN0cnkxIGZyb20gXCIvaW1hZ2VzL3Bhc3RyeS0xLmpwZ1wiXG5pbXBvcnQgcGFzdHJ5MiBmcm9tIFwiL2ltYWdlcy9wYXN0cnktMi5qcGdcIlxuaW1wb3J0IHBhc3RyeTMgZnJvbSBcIi9pbWFnZXMvcGFzdHJ5LTMuanBnXCJcbmltcG9ydCBkZXNlcnQxIGZyb20gXCIvaW1hZ2VzL2Rlc2VydC0xLmpwZ1wiXG5pbXBvcnQgZGVzZXJ0MiBmcm9tIFwiL2ltYWdlcy9kZXNlcnQtMi5qcGdcIlxuaW1wb3J0IGRlc2VydDMgZnJvbSBcIi9pbWFnZXMvZGVzZXJ0LTMuanBnXCJcbmltcG9ydCBkZXNlcnQ0IGZyb20gXCIvaW1hZ2VzL2Rlc2VydC00LmpwZ1wiXG5pbXBvcnQgZGVzZXJ0NSBmcm9tIFwiL2ltYWdlcy9kZXNlcnQtNS5qcGdcIlxuaW1wb3J0IGRyaW5rMSBmcm9tIFwiL2ltYWdlcy9kcmluay0xLmpwZ1wiXG5pbXBvcnQgZHJpbmsyIGZyb20gXCIvaW1hZ2VzL2RyaW5rLTIuanBnXCJcbmltcG9ydCBkcmluazMgZnJvbSBcIi9pbWFnZXMvZHJpbmstMy5qcGdcIlxuaW1wb3J0IGRyaW5rNCBmcm9tIFwiL2ltYWdlcy9kcmluay00LmpwZ1wiXG5pbXBvcnQgZHJpbms1IGZyb20gXCIvaW1hZ2VzL2RyaW5rLTUuanBnXCJcblxuZnVuY3Rpb24gbWVudXBhZ2UoKXtcbiAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuXG4gICAgY29uc3QgbWVudVBhZ2VDb25lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG1lbnVQYWdlQ29uZW50LmNsYXNzTGlzdC5hZGQoXCJtZW51UGFnZVwiKTtcbiAgICBcbiAgICAvKiBuYXZpZ2F0aW9uICovXG4gICAgY29uc3QgbmF2aWdhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmF2aWdhdGlvbi5jbGFzc0xpc3QuYWRkKFwibmF2aWdhdGlvblwiKTtcbiAgICBcbiAgICBuYXZpZ2F0aW9uTmFtZShcIkhvbWVcIiwgbmF2aWdhdGlvbik7XG4gICAgbmF2aWdhdGlvbk5hbWUoXCJNZW51XCIsIG5hdmlnYXRpb24pO1xuICAgIG5hdmlnYXRpb25OYW1lKFwiQ29udGFjdFwiLCBuYXZpZ2F0aW9uKTtcblxuICAgIG1lbnVQYWdlQ29uZW50LmFwcGVuZENoaWxkKG5hdmlnYXRpb24pO1xuICAgIG1lbnVQYWdlQ29uZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoclwiKSk7XG5cbiAgICBsZXQgb3V0ZXJNZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBvdXRlck1lbnUuY2xhc3NMaXN0LmFkZChcIm91dGVyTWVudVwiKTtcbiAgICBsZXQgbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbWVudS5jbGFzc0xpc3QuYWRkKFwibWVudVwiKTtcblxuICAgIC8qIHRpdGxlICovXG4gICAgbGV0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB0aXRsZS5jbGFzc0xpc3QuYWRkKFwidGl0bGVcIik7XG4gICAgbGV0IGRpdjEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRpdjEudGV4dENvbnRlbnQgPSBcIlRIRVwiO1xuICAgIGxldCBkaXYyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYyLnRleHRDb250ZW50ID0gXCJNRU5VXCI7XG4gICAgdGl0bGUuYXBwZW5kQ2hpbGQoZGl2MSk7XG4gICAgdGl0bGUuYXBwZW5kQ2hpbGQoZGl2Mik7XG4gICAgdGl0bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpKTtcblxuICAgIC8qIHNlY3Rpb24tMSAqL1xuICAgIGxldCBwYXN0cnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2VjdGlvblwiKTtcbiAgICBwYXN0cnkuY2xhc3NMaXN0LmFkZChcInBhc3RyeVwiKTtcbiAgICBsZXQgcGFzdHJ5VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHBhc3RyeVRpdGxlLnRleHRDb250ZW50ID0gXCJQYXN0cmllc1wiO1xuICAgIHBhc3RyeS5hcHBlbmRDaGlsZChwYXN0cnlUaXRsZSk7XG4gICAgcGFzdHJ5LmFwcGVuZENoaWxkKGZvb2QocGFzdHJ5MSwgXCJQYWluIGF1IENob2NvbGF0XCIsIFwiJDE1XCIpKTtcbiAgICBwYXN0cnkuYXBwZW5kQ2hpbGQoZm9vZChwYXN0cnkyLCBcIkNoYXVzc29uIGF1eCBQb21tZXNcIiwgXCIkMTVcIikpO1xuICAgIHBhc3RyeS5hcHBlbmRDaGlsZChmb29kKHBhc3RyeTMsIFwiUGFpbiBhdXggUmFpc2luc1wiLCBcIiQxMFwiKSk7XG5cbiAgICAvKiBzZWN0aW9uIDIgKi9cbiAgICBsZXQgZGVzZXJ0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlY3Rpb25cIik7XG4gICAgZGVzZXJ0LmNsYXNzTGlzdC5hZGQoXCJkZXNlcnRcIik7XG4gICAgbGV0IGRlc2VyVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRlc2VyVGl0bGUudGV4dENvbnRlbnQgPSBcIkRlc2VydHNcIjtcbiAgICBkZXNlcnQuYXBwZW5kQ2hpbGQoZGVzZXJUaXRsZSk7XG4gICAgZGVzZXJ0LmFwcGVuZENoaWxkKGZvb2QoZGVzZXJ0MSwgXCJDcsOobWUgQnLDu2zDqWVcIiwgXCIkMTJcIikpO1xuICAgIGRlc2VydC5hcHBlbmRDaGlsZChmb29kKGRlc2VydDIsIFwiVGFydGUgVGF0aW5cIiwgXCIkMTJcIikpO1xuICAgIGRlc2VydC5hcHBlbmRDaGlsZChmb29kKGRlc2VydDMsIFwiTW91c3NlIGF1IENob2NvbGF0XCIsIFwiJDIwXCIpKTtcbiAgICBkZXNlcnQuYXBwZW5kQ2hpbGQoZm9vZChkZXNlcnQ0LCBcIlRhcnRlIGF1eCBGcmFpc2VzXCIsIFwiJDE1XCIpKTtcbiAgICBkZXNlcnQuYXBwZW5kQ2hpbGQoZm9vZChkZXNlcnQ1LCBcIk1hZGVsZWluZXNcIiwgXCIkOFwiKSk7XG5cbiAgICAvKiBzZWN0aW9uIDMgKi9cbiAgICBsZXQgZHJpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2VjdGlvblwiKTtcbiAgICBkcmluay5jbGFzc0xpc3QuYWRkKFwiZHJpbmtcIik7XG4gICAgbGV0IGRyaW5rVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRyaW5rVGl0bGUudGV4dENvbnRlbnQgPSBcIkRyaW5rc1wiO1xuICAgIGRyaW5rLmFwcGVuZENoaWxkKGRyaW5rVGl0bGUpO1xuICAgIGRyaW5rLmFwcGVuZENoaWxkKGZvb2QoZHJpbmsxLCBcIkNhZsOpIENyw6htZVwiLCBcIiQ4XCIpKTtcbiAgICBkcmluay5hcHBlbmRDaGlsZChmb29kKGRyaW5rMiwgXCJDYWbDqSBOb2lyXCIsIFwiJDhcIikpO1xuICAgIGRyaW5rLmFwcGVuZENoaWxkKGZvb2QoZHJpbmszLCBcIkNob2NvbGF0IENoYXVkXCIsIFwiJDEyXCIpKTtcbiAgICBkcmluay5hcHBlbmRDaGlsZChmb29kKGRyaW5rNCwgXCJUaMOpXCIsIFwiJDEwXCIpKTtcbiAgICBkcmluay5hcHBlbmRDaGlsZChmb29kKGRyaW5rNSwgXCJFYXUgR2F6ZXVzZVwiLCBcIiQxMlwiKSk7XG5cblxuICAgIG1lbnUuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgIG1lbnUuYXBwZW5kQ2hpbGQocGFzdHJ5KTtcbiAgICBtZW51LmFwcGVuZENoaWxkKGRlc2VydCk7XG4gICAgbWVudS5hcHBlbmRDaGlsZChkcmluayk7XG4gICAgb3V0ZXJNZW51LmFwcGVuZENoaWxkKG1lbnUpO1xuICAgIG1lbnVQYWdlQ29uZW50LmFwcGVuZENoaWxkKG91dGVyTWVudSk7XG4gICAgbWVudVBhZ2VDb25lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpKTtcbiAgICAvKiBmb290ZXIgKi9cbiAgICBtZW51UGFnZUNvbmVudC5hcHBlbmRDaGlsZChmb290ZXIoKSlcblxuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQobWVudVBhZ2VDb25lbnQpO1xuXG4gICAgbWVudUFuaW1hdGlvbigpXG4gICAgXG59XG5mdW5jdGlvbiBmb29kKGltYWdlLCBoZWFkaW5nLCBhbW91bnQpe1xuICAgIGxldCBwYXJlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGxldCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgaW1hZ2UpO1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRpdi50ZXh0Q29udGVudCA9IGhlYWRpbmc7XG4gICAgbGV0IHByaWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBwcmljZS50ZXh0Q29udGVudCA9IGFtb3VudDtcbiAgICBcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQocHJpY2UpO1xuICAgIHJldHVybiBwYXJlbnQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1lbnVwYWdlOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYztcblx0aWYgKCFzY3JpcHRVcmwpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGlmKHNjcmlwdHMubGVuZ3RoKSB7XG5cdFx0XHR2YXIgaSA9IHNjcmlwdHMubGVuZ3RoIC0gMTtcblx0XHRcdHdoaWxlIChpID4gLTEgJiYgIXNjcmlwdFVybCkgc2NyaXB0VXJsID0gc2NyaXB0c1tpLS1dLnNyYztcblx0XHR9XG5cdH1cbn1cbi8vIFdoZW4gc3VwcG9ydGluZyBicm93c2VycyB3aGVyZSBhbiBhdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIHlvdSBtdXN0IHNwZWNpZnkgYW4gb3V0cHV0LnB1YmxpY1BhdGggbWFudWFsbHkgdmlhIGNvbmZpZ3VyYXRpb25cbi8vIG9yIHBhc3MgYW4gZW1wdHkgc3RyaW5nIChcIlwiKSBhbmQgc2V0IHRoZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB2YXJpYWJsZSBmcm9tIHlvdXIgY29kZSB0byB1c2UgeW91ciBvd24gbG9naWMuXG5pZiAoIXNjcmlwdFVybCkgdGhyb3cgbmV3IEVycm9yKFwiQXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXJcIik7XG5zY3JpcHRVcmwgPSBzY3JpcHRVcmwucmVwbGFjZSgvIy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcPy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcL1teXFwvXSskLywgXCIvXCIpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gc2NyaXB0VXJsOyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiaW1wb3J0IFwiLi9jc3MvaW5kZXguY3NzXCI7XG5pbXBvcnQgXCIuL2Nzcy9ub3JtYWxpemUuY3NzXCI7XG5pbXBvcnQgaG9tZXBhZ2UsIHsgbmF2aWdhdGlvbk5hbWUgfSBmcm9tIFwiLi9jb21wb25lbmV0cy9ob21lcGFnZVwiO1xuaW1wb3J0IG1lbnVwYWdlIGZyb20gXCIuL2NvbXBvbmVuZXRzL21lbnVwYWdlXCI7XG5pbXBvcnQgY29udGFjdHBhZ2UgZnJvbSBcIi4vY29tcG9uZW5ldHMvY29udGFjdHBhZ2VcIjtcblxuZnVuY3Rpb24gbWFpbigpe1xuICAgIGxldCBuYXZpZ2F0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5uYXZpZ2F0aW9uXCIpLmNoaWxkTm9kZXM7XG4gICAgbmF2aWdhdGlvbiA9IEFycmF5LmZyb20obmF2aWdhdGlvbik7ICAgIFxuICAgIG5hdmlnYXRpb24uZm9yRWFjaChlID0+IGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBpZihldmVudC50YXJnZXQudGV4dENvbnRlbnQgPT0gXCJIb21lXCIpe1xuICAgICAgICAgICAgY2xlYXIoKTtcbiAgICAgICAgICAgIGhvbWVwYWdlKCk7XG4gICAgICAgICAgICBtYWluKCk7XG4gICAgICAgIH1lbHNlIGlmKGV2ZW50LnRhcmdldC50ZXh0Q29udGVudCA9PSBcIk1lbnVcIil7XG4gICAgICAgICAgICBjbGVhcigpO1xuICAgICAgICAgICAgbWVudXBhZ2UoKTtcbiAgICAgICAgICAgIG1haW4oKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjbGVhcigpO1xuICAgICAgICAgICAgY29udGFjdHBhZ2UoKTtcbiAgICAgICAgICAgIG1haW4oKTtcbiAgICAgICAgfVxuICAgIH0pKVxufSAgIFxuZnVuY3Rpb24gY2xlYXIoKXtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuaW5uZXJIVE1MID0gXCJcIjtcbn1cblxuaG9tZXBhZ2UoKTtcbm1haW4oKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=