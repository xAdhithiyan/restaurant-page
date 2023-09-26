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

`, "",{"version":3,"sources":["webpack://./src/css/homepage.css"],"names":[],"mappings":"AAAA;IACI,YAAY;IACZ,aAAa;IACb,oDAAoD;AACxD;;AAEA;IACI,aAAa;IACb,uBAAuB;IACvB,SAAS;IACT,YAAY;IACZ,wBAAwB;IACxB,UAAU;;AAEd;AACA;IACI,UAAU;IACV,sBAAsB;IACtB,UAAU;AACd;AACA;IACI,aAAa;IACb,sBAAsB;IACtB,mBAAmB;AACvB;AACA;IACI,aAAa;AACjB;AACA;IACI,aAAa;IACb,mBAAmB;IACnB,uBAAuB;IACvB,QAAQ;AACZ;AACA;IACI,YAAY;AAChB;AACA;IACI,yBAAyB;IACzB,kBAAkB;AACtB;AACA;IACI,aAAa;AACjB;AACA;IACI,YAAY;IACZ,YAAY;IACZ,iBAAiB;IACjB,gBAAgB;IAChB,mBAAmB;IACnB,wBAAwB;AAC5B;;AAEA,UAAU;AACV;IACI,UAAU;IACV,aAAa;IACb,aAAa;IACb,oCAAoC;IACpC,QAAQ;IACR,kBAAkB;IAClB,mBAAmB;AACvB;;AAEA;IACI,sBAAsB;IACtB,aAAa;IACb,uBAAuB;IACvB,kBAAkB;IAClB,aAAa;IACb,sBAAsB;IACtB,uBAAuB;IACvB,mBAAmB;IACnB,QAAQ;IACR,iBAAiB;IACjB,YAAY;IACZ,cAAc;IACd,uBAAuB;IACvB,kBAAkB;IAClB,uBAAuB;IACvB,uCAAuC;;AAE3C;AACA;IACI,UAAU;AACd;AACA;IACI,YAAY;AAChB;AACA;IACI,iBAAiB;AACrB;AACA;IACI,YAAY;IACZ,kBAAkB;AACtB;;AAEA,6BAA6B;AAC7B;IACI,kBAAkB;IAClB,iBAAiB;AACrB;AACA;IACI,0CAA0C;AAC9C","sourcesContent":[".homePage{\n    height: 100%;\n    display: grid;\n    grid-template-rows:45px repeat(2,auto) 1fr auto auto;\n}\n\n.navigation{\n    display: flex;\n    justify-content: center;\n    gap:100px;\n    margin: 10px;\n    color: var(--text-color);\n    z-index: 1;\n\n}\nhr{\n    width: 50%;\n    border:1px solid black;\n    z-index: 1;\n}\n.heading{\n    display: flex;\n    flex-direction: column;\n    align-items: center;    \n}\n.mainCard{\n    display: flex;\n}\n.footer{\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    gap:10px;\n}\n.footer img{\n    height: 40px;\n}\n.footer img:hover{\n    transform: rotate(720deg);\n    transition: all 1s;\n}\n.heading > img{\n    height: 430px;\n}\n.heading > div:nth-child(2){\n    color: white;\n    opacity: 0.7;\n    font-size: 1.4rem;\n    margin-top:-60px;\n    margin-bottom: 50px;\n    color: var(--text-color);\n}\n\n/* Cards */\n.mainCard{\n    width: 80%;\n    margin:0 auto;\n    display: grid;\n    grid-template-columns: repeat(3,1fr);\n    gap:20px;\n    align-self: center;\n    margin-bottom: 20px;\n}\n\n.card{\n    box-sizing: border-box;\n    height: 300px;\n    background-color: white;\n    text-align: center;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n    gap:20px;\n    font-size: 1.3rem;\n    padding:20px;\n    overflow: auto;  \n    border: 3px solid black;\n    border-radius: 5px;\n    background-color: white;\n    background-color: rgba(246,175,133,0.7);\n\n}\n.mainCard > div:nth-child(2){\n    z-index: 1;\n}\n.card img{\n    height: 50px;\n}\n.card > div:nth-child(2){\n    font-size: 1.5rem;\n}\n.card > div:nth-child(3){\n    opacity: 0.6;\n    font-style: italic;\n}\n\n/* navigation selection bar */\n.navigation > div{\n    padding-right: 5px;\n    padding-left: 5px;\n}\n.homePage > .navigation > div:nth-child(1){\n    border-bottom: 2px solid var(--text-color);\n}\n\n"],"sourceRoot":""}]);
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
}`, "",{"version":3,"sources":["webpack://./src/css/index.css"],"names":[],"mappings":"AACA;IACI,oCAAoC;IACpC,mCAAmC;IACnC;AACJ;;AAEA;IACI,iCAAiC;IACjC,YAAY;IACZ,YAAY;AAChB;AACA;IACI,YAAY;IACZ,YAAY;AAChB;AACA;IACI,iCAAiC;IACjC,UAAU;IACV;AACJ","sourcesContent":["@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');\n:root{\n    font-family: 'Patrick Hand', cursive;\n    --text-color: rgba(246,175,133,255);\n    --bg-color:  rgba(73,96,166,255)\n}\n\nbody{\n    background-color: var(--bg-color);\n    height: 99vh;\n    width: 100vw;\n}\n.content{\n    height: 99vh;\n    width: 100vw;\n}\nbutton{\n    background-color: var(--bg-color);\n    border:0px; \n    color:var(--text-color)\n}"],"sourceRoot":""}]);
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
`, "",{"version":3,"sources":["webpack://./src/css/menupage.css"],"names":[],"mappings":"AAAA;IACI,YAAY;IACZ,aAAa;IACb,2CAA2C;AAC/C;AACA;IACI,kBAAkB;AACtB;AACA;IACI,YAAY;IACZ,WAAW;IACX,aAAa;IACb,uBAAuB;IACvB,sBAAsB;IACtB,kBAAkB;IAClB,aAAa;IACb,uBAAuB;IACvB,mBAAmB;IACnB;;AAEJ;AACA;IACI,WAAW;IACX,UAAU;IACV,sBAAsB;IACtB,kBAAkB;IAClB,uBAAuB;IACvB,cAAc;AAClB;AACA;IACI,aAAa;IACb,qCAAqC;IACrC,6BAA6B;IAC7B,sBAAsB;AAC1B;AACA;IACI,uBAAuB;IACvB,4BAA4B;IAC5B,+BAA+B;IAC/B,UAAU;IACV,UAAU;AACd;AACA;IACI,YAAY;IACZ,eAAe;IACf,eAAe;IACf,eAAe;IACf,6BAA6B;IAC7B,UAAU;IACV,uBAAuB;AAC3B;;AAEA;IACI,YAAY;IACZ,YAAY;IACZ,kBAAkB;IAClB,sBAAsB;IACtB,iBAAiB;AACrB;AACA;IACI,iBAAiB;IACjB,YAAY;IACZ,iBAAiB;IACjB,mBAAmB;IACnB,uBAAuB;IACvB,WAAW;IACX,YAAY;IACZ,iBAAiB;IACjB,2BAA2B;IAC3B,4BAA4B;AAChC;AACA;IACI,aAAa;IACb,+BAA+B;IAC/B,sBAAsB;IACtB,mBAAmB;IACnB,iBAAiB;IACjB,QAAQ;IACR,kBAAkB;AACtB;AACA;IACI,kBAAkB;AACtB;AACA;IACI,aAAa;IACb,uCAAuC;IACvC,mBAAmB;IACnB,6BAA6B;IAC7B,UAAU;IACV,uBAAuB;AAC3B;AACA;;IAEI,aAAa;IACb,eAAe;IACf,eAAe;IACf,mBAAmB;AACvB;AACA;IACI,6BAA6B;IAC7B,UAAU;IACV,uBAAuB;AAC3B;AACA;IACI,WAAW;IACX,kBAAkB;AACtB;AACA;IACI,WAAW;IACX,kBAAkB;AACtB;AACA;IACI,0CAA0C;AAC9C;AACA;IACI,UAAU;AACd","sourcesContent":[".menuPage{\n    height: 99vh;\n    display: grid;\n    grid-template-rows: 45px auto 1fr auto auto;   \n}\n.menuPage > div:nth-child(3){\n    align-self: center;\n}\n.outerMenu{\n    height: 78vh;\n    width: 70vw;\n    margin:0 auto;    \n    background-color: white;\n    border:3px solid black;\n    border-radius: 5px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    background-color: var(--text-color)\n    \n}\n.menu{\n    height: 90%;\n    width: 95%;\n    border:3px solid black;\n    border-radius: 5px;\n    background-color: white;\n    overflow: auto;\n}\n.menuPage .menu {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    grid-template-rows: 240px 1fr;\n    grid-auto-flow: column;\n}\n.menuPage .menu hr {\n    border: 2px solid black;\n    border-top-right-radius: 50%;\n    border-bottom-right-radius: 50%;\n    width: 80%;\n    margin:0px;\n}\n.title{\n    padding:10px;\n    font-size: 5rem;\n    margin-top:10px;\n    padding-top:0px;\n    border-right: 2px solid black;\n    z-index: 2;\n    background-color: white;\n}\n\nsection img {\n    width: 120px;\n    height: 82px;\n    border-radius: 20%;\n    border:2px solid black;\n    margin-left: 10px;\n}\nsection > div:nth-child(1){\n    font-size: 1.5rem;\n    margin: 10px;\n    padding-left:10px;\n    font-weight: bolder;\n    border: 2px solid black;\n    width: 88px;\n    height: 40px;\n    border-radius: 5%;\n    border-top-left-radius: 30%;\n    border-top-right-radius: 30%;\n}\nsection > div{\n    display: grid;\n    grid-template-columns: auto 1fr;\n    grid-auto-flow: column;\n    align-items: center;\n    font-size: 1.5rem;\n    gap:10px;\n    margin-bottom: 5px;\n}\nsection > div > div:nth-child(3){\n    margin-right: 15px;\n}\n.pastry{\n    display: grid;\n    grid-template-rows: 60px repeat(3,auto);\n    margin-bottom: 10px;\n    border-right: 2px solid black;\n    z-index: 2;\n    background-color: white;\n}\n.desert,\n.drink{\n    display: grid;\n    grid-row: 1 / 3;\n    margin-top:10px;\n    margin-bottom: 10px;\n}\n.desert{\n    border-right: 2px solid black;\n    z-index: 1;\n    background-color: white;\n}\n.desert > div:nth-child(1){\n    width: 80px;\n    align-self: center;\n}\n.drink > div:nth-child(1){\n    width: 70px;\n    align-self: center;\n}\n.menuPage > .navigation > div:nth-child(2){\n    border-bottom: 2px solid var(--text-color);\n}\n.drink{\n    z-index: 0;\n}\n"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sdUZBQXVGLFVBQVUsVUFBVSxZQUFZLE1BQU0sS0FBSyxZQUFZLE1BQU0sS0FBSyxVQUFVLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxXQUFXLFlBQVksYUFBYSxPQUFPLEtBQUssS0FBSyxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxNQUFNLEtBQUssVUFBVSxZQUFZLGFBQWEsYUFBYSxNQUFNLEtBQUssWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLEtBQUssS0FBSyxVQUFVLFVBQVUsVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLE9BQU8sS0FBSyxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsTUFBTSxLQUFLLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxXQUFXLFVBQVUsWUFBWSxhQUFhLGFBQWEsTUFBTSxLQUFLLFVBQVUsWUFB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SHZCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQ2xCQTs7Ozs7Ozs7Ozs7Ozs7OztBQ0F5QjtBQUNJO0FBQ3FDO0FBQ3BCO0FBQ007O0FBRXBEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksaUVBQVE7QUFDcEI7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxZQUFZLGlFQUFRO0FBQ3BCO0FBQ0EsU0FBUztBQUNUO0FBQ0EsWUFBWSxvRUFBVztBQUN2QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlFQUFRO0FBQ1IsTyIsInNvdXJjZXMiOlsid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL25vZGVfbW9kdWxlcy9hbmltYXRlcGx1cy9hbmltYXRlcGx1cy5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY3NzL2NvbnRhY3RwYWdlLmNzcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY3NzL2hvbWVwYWdlLmNzcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY3NzL2luZGV4LmNzcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY3NzL21lbnVwYWdlLmNzcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY3NzL25vcm1hbGl6ZS5jc3MiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY3NzL2NvbnRhY3RwYWdlLmNzcz84MzRmIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jc3MvaG9tZXBhZ2UuY3NzP2EyNzciLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2Nzcy9pbmRleC5jc3M/ZjdlYSIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY3NzL21lbnVwYWdlLmNzcz85ZDMwIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jc3Mvbm9ybWFsaXplLmNzcz82ZDU0Iiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2FuaW1hdGlvbi9hbmltYXRlQ29udGFjdFBhZ2UuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2FuaW1hdGlvbi9hbmltYXRlSG9tZVBhZ2UuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2FuaW1hdGlvbi9hbmltYXRpb25NZW51UGFnZS5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY29tcG9uZW5ldHMvY29udGFjdHBhZ2UuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2NvbXBvbmVuZXRzL2Zvb3Rlci5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY29tcG9uZW5ldHMvaG9tZXBhZ2UuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2NvbXBvbmVuZXRzL2hvbWVwYWdlQ2FyZHMuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2NvbXBvbmVuZXRzL21lbnVwYWdlLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2Uvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2Uvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2Uvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2Uvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlL3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEFuaW1hdGUgUGx1cyB2Mi4xLjFcbiAqIENvcHlyaWdodCAoYykgMjAxNy0yMDE4IEJlbmphbWluIERlIENvY2tcbiAqIGh0dHA6Ly9hbmltYXRlcGx1cy5jb20vbGljZW5zZVxuICovXG5cblxuLy8gbG9naWNcbi8vID09PT09XG5cbmNvbnN0IGZpcnN0ID0gKFtpdGVtXSkgPT4gaXRlbTtcblxuY29uc3QgY29tcHV0ZVZhbHVlID0gKHZhbHVlLCBpbmRleCkgPT5cbiAgdHlwZW9mIHZhbHVlID09IFwiZnVuY3Rpb25cIiA/IHZhbHVlKGluZGV4KSA6IHZhbHVlO1xuXG5cbi8vIGRvbVxuLy8gPT09XG5cbmNvbnN0IGdldEVsZW1lbnRzID0gZWxlbWVudHMgPT4ge1xuICBpZiAoQXJyYXkuaXNBcnJheShlbGVtZW50cykpXG4gICAgcmV0dXJuIGVsZW1lbnRzO1xuICBpZiAoIWVsZW1lbnRzIHx8IGVsZW1lbnRzLm5vZGVUeXBlKVxuICAgIHJldHVybiBbZWxlbWVudHNdO1xuICByZXR1cm4gQXJyYXkuZnJvbSh0eXBlb2YgZWxlbWVudHMgPT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZWxlbWVudHMpIDogZWxlbWVudHMpO1xufTtcblxuY29uc3QgYWNjZWxlcmF0ZSA9ICh7c3R5bGV9LCBrZXlmcmFtZXMpID0+XG4gIHN0eWxlLndpbGxDaGFuZ2UgPSBrZXlmcmFtZXNcbiAgICA/IGtleWZyYW1lcy5tYXAoKHtwcm9wZXJ0eX0pID0+IHByb3BlcnR5KS5qb2luKClcbiAgICA6IFwiYXV0b1wiO1xuXG5jb25zdCBjcmVhdGVTVkcgPSAoZWxlbWVudCwgYXR0cmlidXRlcykgPT5cbiAgT2JqZWN0LmVudHJpZXMoYXR0cmlidXRlcykucmVkdWNlKChub2RlLCBbYXR0cmlidXRlLCB2YWx1ZV0pID0+IHtcbiAgICBub2RlLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfSwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgZWxlbWVudCkpO1xuXG5cbi8vIG1vdGlvbiBibHVyXG4vLyA9PT09PT09PT09PVxuXG5jb25zdCBibHVycyA9IHtcbiAgYXhlczogW1wieFwiLCBcInlcIl0sXG4gIGNvdW50OiAwLFxuICBhZGQoe2VsZW1lbnQsIGJsdXJ9KSB7XG4gICAgY29uc3QgaWQgPSBgbW90aW9uLWJsdXItJHt0aGlzLmNvdW50Kyt9YDtcbiAgICBjb25zdCBzdmcgPSBjcmVhdGVTVkcoXCJzdmdcIiwge1xuICAgICAgc3R5bGU6IFwicG9zaXRpb246IGFic29sdXRlOyB3aWR0aDogMDsgaGVpZ2h0OiAwXCJcbiAgICB9KTtcbiAgICBjb25zdCBmaWx0ZXIgPSBjcmVhdGVTVkcoXCJmaWx0ZXJcIiwgdGhpcy5heGVzLnJlZHVjZSgoYXR0cmlidXRlcywgYXhpcykgPT4ge1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gYmx1cltheGlzXSAqIDI7XG4gICAgICBhdHRyaWJ1dGVzW2F4aXNdID0gYC0ke29mZnNldH0lYDtcbiAgICAgIGF0dHJpYnV0ZXNbYXhpcyA9PSBcInhcIiA/IFwid2lkdGhcIiA6IFwiaGVpZ2h0XCJdID0gYCR7MTAwICsgb2Zmc2V0ICogMn0lYDtcbiAgICAgIHJldHVybiBhdHRyaWJ1dGVzO1xuICAgIH0se1xuICAgICAgaWQsXG4gICAgICBcImNvbG9yLWludGVycG9sYXRpb24tZmlsdGVyc1wiOiBcInNSR0JcIlxuICAgIH0pKTtcbiAgICBjb25zdCBnYXVzc2lhbiA9IGNyZWF0ZVNWRyhcImZlR2F1c3NpYW5CbHVyXCIsIHtcbiAgICAgIGluOiBcIlNvdXJjZUdyYXBoaWNcIlxuICAgIH0pO1xuICAgIGZpbHRlci5hcHBlbmQoZ2F1c3NpYW4pO1xuICAgIHN2Zy5hcHBlbmQoZmlsdGVyKTtcbiAgICBlbGVtZW50LnN0eWxlLmZpbHRlciA9IGB1cmwoXCIjJHtpZH1cIilgO1xuICAgIGRvY3VtZW50LmJvZHkucHJlcGVuZChzdmcpO1xuICAgIHJldHVybiBnYXVzc2lhbjtcbiAgfVxufTtcblxuY29uc3QgZ2V0RGV2aWF0aW9uID0gKGJsdXIsIHtlYXNpbmd9LCBjdXJ2ZSkgPT4ge1xuICBjb25zdCBwcm9ncmVzcyA9IGJsdXIgKiBjdXJ2ZTtcbiAgY29uc3Qgb3V0ID0gYmx1ciAtIHByb2dyZXNzO1xuICBjb25zdCBkZXZpYXRpb24gPSAoKCkgPT4ge1xuICAgIGlmIChlYXNpbmcgPT0gXCJsaW5lYXJcIilcbiAgICAgIHJldHVybiBibHVyO1xuICAgIGlmIChlYXNpbmcuc3RhcnRzV2l0aChcImluLW91dFwiKSlcbiAgICAgIHJldHVybiAoY3VydmUgPCAuNSA/IHByb2dyZXNzIDogb3V0KSAqIDI7XG4gICAgaWYgKGVhc2luZy5zdGFydHNXaXRoKFwiaW5cIikpXG4gICAgICByZXR1cm4gcHJvZ3Jlc3M7XG4gICAgcmV0dXJuIG91dDtcbiAgfSkoKTtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIGRldmlhdGlvbik7XG59O1xuXG5jb25zdCBzZXREZXZpYXRpb24gPSAoe2JsdXIsIGdhdXNzaWFuLCBlYXNpbmd9LCBjdXJ2ZSkgPT4ge1xuICBjb25zdCB2YWx1ZXMgPSBibHVycy5heGVzLm1hcChheGlzID0+IGdldERldmlhdGlvbihibHVyW2F4aXNdLCBlYXNpbmcsIGN1cnZlKSk7XG4gIGdhdXNzaWFuLnNldEF0dHJpYnV0ZShcInN0ZERldmlhdGlvblwiLCB2YWx1ZXMuam9pbigpKTtcbn07XG5cbmNvbnN0IG5vcm1hbGl6ZUJsdXIgPSBibHVyID0+IHtcbiAgY29uc3QgZGVmYXVsdHMgPSBibHVycy5heGVzLnJlZHVjZSgob2JqZWN0LCBheGlzKSA9PiB7XG4gICAgb2JqZWN0W2F4aXNdID0gMDtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9LCB7fSk7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBibHVyKTtcbn07XG5cbmNvbnN0IGNsZWFyQmx1ciA9ICh7c3R5bGV9LCB7cGFyZW50Tm9kZToge3BhcmVudE5vZGU6IHN2Z319KSA9PiB7XG4gIHN0eWxlLmZpbHRlciA9IFwibm9uZVwiO1xuICBzdmcucmVtb3ZlKCk7XG59O1xuXG5cbi8vIGNvbG9yIGNvbnZlcnNpb25cbi8vID09PT09PT09PT09PT09PT1cblxuY29uc3QgaGV4UGFpcnMgPSBjb2xvciA9PiB7XG4gIGNvbnN0IHNwbGl0ID0gY29sb3Iuc3BsaXQoXCJcIik7XG4gIGNvbnN0IHBhaXJzID0gY29sb3IubGVuZ3RoIDwgNVxuICAgID8gc3BsaXQubWFwKHN0cmluZyA9PiBzdHJpbmcgKyBzdHJpbmcpXG4gICAgOiBzcGxpdC5yZWR1Y2UoKGFycmF5LCBzdHJpbmcsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoaW5kZXggJSAyKVxuICAgICAgICBhcnJheS5wdXNoKHNwbGl0W2luZGV4IC0gMV0gKyBzdHJpbmcpO1xuICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH0sIFtdKTtcbiAgaWYgKHBhaXJzLmxlbmd0aCA8IDQpXG4gICAgcGFpcnMucHVzaChcImZmXCIpO1xuICByZXR1cm4gcGFpcnM7XG59O1xuXG5jb25zdCBjb252ZXJ0ID0gY29sb3IgPT5cbiAgaGV4UGFpcnMoY29sb3IpLm1hcChzdHJpbmcgPT4gcGFyc2VJbnQoc3RyaW5nLCAxNikpO1xuXG5jb25zdCByZ2JhID0gaGV4ID0+IHtcbiAgY29uc3QgY29sb3IgPSBoZXguc2xpY2UoMSk7XG4gIGNvbnN0IFtyLCBnLCBiLCBhXSA9IGNvbnZlcnQoY29sb3IpO1xuICByZXR1cm4gYHJnYmEoJHtyfSwgJHtnfSwgJHtifSwgJHthIC8gMjU1fSlgO1xufTtcblxuXG4vLyBlYXNpbmcgZXF1YXRpb25zXG4vLyA9PT09PT09PT09PT09PT09XG5cbmNvbnN0IHBpMiA9IE1hdGguUEkgKiAyO1xuXG5jb25zdCBnZXRPZmZzZXQgPSAoc3RyZW5ndGgsIHBlcmlvZCkgPT5cbiAgcGVyaW9kIC8gcGkyICogTWF0aC5hc2luKDEgLyBzdHJlbmd0aCk7XG5cbmNvbnN0IGVhc2luZ3MgPSB7XG4gIFwibGluZWFyXCI6IHByb2dyZXNzID0+IHByb2dyZXNzLFxuXG4gIFwiaW4tY3ViaWNcIjogcHJvZ3Jlc3MgPT4gcHJvZ3Jlc3MgKiogMyxcbiAgXCJpbi1xdWFydGljXCI6IHByb2dyZXNzID0+IHByb2dyZXNzICoqIDQsXG4gIFwiaW4tcXVpbnRpY1wiOiBwcm9ncmVzcyA9PiBwcm9ncmVzcyAqKiA1LFxuICBcImluLWV4cG9uZW50aWFsXCI6IHByb2dyZXNzID0+IDEwMjQgKiogKHByb2dyZXNzIC0gMSksXG4gIFwiaW4tY2lyY3VsYXJcIjogcHJvZ3Jlc3MgPT4gMSAtIE1hdGguc3FydCgxIC0gcHJvZ3Jlc3MgKiogMiksXG4gIFwiaW4tZWxhc3RpY1wiOiAocHJvZ3Jlc3MsIGFtcGxpdHVkZSwgcGVyaW9kKSA9PiB7XG4gICAgY29uc3Qgc3RyZW5ndGggPSBNYXRoLm1heChhbXBsaXR1ZGUsIDEpO1xuICAgIGNvbnN0IG9mZnNldCA9IGdldE9mZnNldChzdHJlbmd0aCwgcGVyaW9kKTtcbiAgICByZXR1cm4gLShzdHJlbmd0aCAqIDIgKiogKDEwICogKHByb2dyZXNzIC09IDEpKSAqIE1hdGguc2luKChwcm9ncmVzcyAtIG9mZnNldCkgKiBwaTIgLyBwZXJpb2QpKTtcbiAgfSxcblxuICBcIm91dC1jdWJpY1wiOiBwcm9ncmVzcyA9PiAtLXByb2dyZXNzICoqIDMgKyAxLFxuICBcIm91dC1xdWFydGljXCI6IHByb2dyZXNzID0+IDEgLSAtLXByb2dyZXNzICoqIDQsXG4gIFwib3V0LXF1aW50aWNcIjogcHJvZ3Jlc3MgPT4gLS1wcm9ncmVzcyAqKiA1ICsgMSxcbiAgXCJvdXQtZXhwb25lbnRpYWxcIjogcHJvZ3Jlc3MgPT4gMSAtIDIgKiogKC0xMCAqIHByb2dyZXNzKSxcbiAgXCJvdXQtY2lyY3VsYXJcIjogcHJvZ3Jlc3MgPT4gTWF0aC5zcXJ0KDEgLSAtLXByb2dyZXNzICoqIDIpLFxuICBcIm91dC1lbGFzdGljXCI6IChwcm9ncmVzcywgYW1wbGl0dWRlLCBwZXJpb2QpID0+IHtcbiAgICBjb25zdCBzdHJlbmd0aCA9IE1hdGgubWF4KGFtcGxpdHVkZSwgMSk7XG4gICAgY29uc3Qgb2Zmc2V0ID0gZ2V0T2Zmc2V0KHN0cmVuZ3RoLCBwZXJpb2QpO1xuICAgIHJldHVybiBzdHJlbmd0aCAqIDIgKiogKC0xMCAqIHByb2dyZXNzKSAqIE1hdGguc2luKChwcm9ncmVzcyAtIG9mZnNldCkgKiBwaTIgLyBwZXJpb2QpICsgMTtcbiAgfSxcblxuICBcImluLW91dC1jdWJpY1wiOiBwcm9ncmVzcyA9PlxuICAgIChwcm9ncmVzcyAqPSAyKSA8IDFcbiAgICAgID8gLjUgKiBwcm9ncmVzcyAqKiAzXG4gICAgICA6IC41ICogKChwcm9ncmVzcyAtPSAyKSAqIHByb2dyZXNzICoqIDIgKyAyKSxcbiAgXCJpbi1vdXQtcXVhcnRpY1wiOiBwcm9ncmVzcyA9PlxuICAgIChwcm9ncmVzcyAqPSAyKSA8IDFcbiAgICAgID8gLjUgKiBwcm9ncmVzcyAqKiA0XG4gICAgICA6IC0uNSAqICgocHJvZ3Jlc3MgLT0gMikgKiBwcm9ncmVzcyAqKiAzIC0gMiksXG4gIFwiaW4tb3V0LXF1aW50aWNcIjogcHJvZ3Jlc3MgPT5cbiAgICAocHJvZ3Jlc3MgKj0gMikgPCAxXG4gICAgICA/IC41ICogcHJvZ3Jlc3MgKiogNVxuICAgICAgOiAuNSAqICgocHJvZ3Jlc3MgLT0gMikgKiBwcm9ncmVzcyAqKiA0ICsgMiksXG4gIFwiaW4tb3V0LWV4cG9uZW50aWFsXCI6IHByb2dyZXNzID0+XG4gICAgKHByb2dyZXNzICo9IDIpIDwgMVxuICAgICAgPyAuNSAqIDEwMjQgKiogKHByb2dyZXNzIC0gMSlcbiAgICAgIDogLjUgKiAoLSgyICoqICgtMTAgKiAocHJvZ3Jlc3MgLSAxKSkpICsgMiksXG4gIFwiaW4tb3V0LWNpcmN1bGFyXCI6IHByb2dyZXNzID0+XG4gICAgKHByb2dyZXNzICo9IDIpIDwgMVxuICAgICAgPyAtLjUgKiAoTWF0aC5zcXJ0KDEgLSBwcm9ncmVzcyAqKiAyKSAtIDEpXG4gICAgICA6IC41ICogKE1hdGguc3FydCgxIC0gKHByb2dyZXNzIC09IDIpICogcHJvZ3Jlc3MpICsgMSksXG4gIFwiaW4tb3V0LWVsYXN0aWNcIjogKHByb2dyZXNzLCBhbXBsaXR1ZGUsIHBlcmlvZCkgPT4ge1xuICAgIGNvbnN0IHN0cmVuZ3RoID0gTWF0aC5tYXgoYW1wbGl0dWRlLCAxKTtcbiAgICBjb25zdCBvZmZzZXQgPSBnZXRPZmZzZXQoc3RyZW5ndGgsIHBlcmlvZCk7XG4gICAgcmV0dXJuIChwcm9ncmVzcyAqPSAyKSA8IDFcbiAgICAgID8gLS41ICogKHN0cmVuZ3RoICogMiAqKiAoMTAgKiAocHJvZ3Jlc3MgLT0gMSkpICogTWF0aC5zaW4oKHByb2dyZXNzIC0gb2Zmc2V0KSAqIHBpMiAvIHBlcmlvZCkpXG4gICAgICA6IHN0cmVuZ3RoICogMiAqKiAoLTEwICogKHByb2dyZXNzIC09IDEpKSAqIE1hdGguc2luKChwcm9ncmVzcyAtIG9mZnNldCkgKiBwaTIgLyBwZXJpb2QpICogLjUgKyAxO1xuICB9XG59O1xuXG5jb25zdCBkZWNvbXBvc2VFYXNpbmcgPSBzdHJpbmcgPT4ge1xuICBjb25zdCBbZWFzaW5nLCBhbXBsaXR1ZGUgPSAxLCBwZXJpb2QgPSAuNF0gPSBzdHJpbmcudHJpbSgpLnNwbGl0KFwiIFwiKTtcbiAgcmV0dXJuIHtlYXNpbmcsIGFtcGxpdHVkZSwgcGVyaW9kfTtcbn07XG5cbmNvbnN0IGVhc2UgPSAoe2Vhc2luZywgYW1wbGl0dWRlLCBwZXJpb2R9LCBwcm9ncmVzcykgPT5cbiAgZWFzaW5nc1tlYXNpbmddKHByb2dyZXNzLCBhbXBsaXR1ZGUsIHBlcmlvZCk7XG5cblxuLy8ga2V5ZnJhbWVzIGNvbXBvc2l0aW9uXG4vLyA9PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgZXh0cmFjdFJlZ0V4cCA9IC8tP1xcZCpcXC4/XFxkKy9nO1xuXG5jb25zdCBleHRyYWN0U3RyaW5ncyA9IHZhbHVlID0+XG4gIHZhbHVlLnNwbGl0KGV4dHJhY3RSZWdFeHApO1xuXG5jb25zdCBleHRyYWN0TnVtYmVycyA9IHZhbHVlID0+XG4gIHZhbHVlLm1hdGNoKGV4dHJhY3RSZWdFeHApLm1hcChOdW1iZXIpO1xuXG5jb25zdCBzYW5pdGl6ZSA9IHZhbHVlcyA9PlxuICB2YWx1ZXMubWFwKHZhbHVlID0+IHtcbiAgICBjb25zdCBzdHJpbmcgPSBTdHJpbmcodmFsdWUpO1xuICAgIHJldHVybiBzdHJpbmcuc3RhcnRzV2l0aChcIiNcIikgPyByZ2JhKHN0cmluZykgOiBzdHJpbmc7XG4gIH0pO1xuXG5jb25zdCBhZGRQcm9wZXJ0eUtleWZyYW1lcyA9IChwcm9wZXJ0eSwgdmFsdWVzKSA9PiB7XG4gIGNvbnN0IGFuaW1hdGFibGUgPSBzYW5pdGl6ZSh2YWx1ZXMpO1xuICBjb25zdCBzdHJpbmdzID0gZXh0cmFjdFN0cmluZ3MoZmlyc3QoYW5pbWF0YWJsZSkpO1xuICBjb25zdCBudW1iZXJzID0gYW5pbWF0YWJsZS5tYXAoZXh0cmFjdE51bWJlcnMpO1xuICBjb25zdCByb3VuZCA9IGZpcnN0KHN0cmluZ3MpLnN0YXJ0c1dpdGgoXCJyZ2JcIik7XG4gIHJldHVybiB7cHJvcGVydHksIHN0cmluZ3MsIG51bWJlcnMsIHJvdW5kfTtcbn07XG5cbmNvbnN0IGNyZWF0ZUFuaW1hdGlvbktleWZyYW1lcyA9IChrZXlmcmFtZXMsIGluZGV4KSA9PlxuICBPYmplY3QuZW50cmllcyhrZXlmcmFtZXMpLm1hcCgoW3Byb3BlcnR5LCB2YWx1ZXNdKSA9PlxuICAgIGFkZFByb3BlcnR5S2V5ZnJhbWVzKHByb3BlcnR5LCBjb21wdXRlVmFsdWUodmFsdWVzLCBpbmRleCkpKTtcblxuY29uc3QgZ2V0Q3VycmVudFZhbHVlID0gKGZyb20sIHRvLCBlYXNpbmcpID0+XG4gIGZyb20gKyAodG8gLSBmcm9tKSAqIGVhc2luZztcblxuY29uc3QgcmVjb21wb3NlVmFsdWUgPSAoW2Zyb20sIHRvXSwgc3RyaW5ncywgcm91bmQsIGVhc2luZykgPT5cbiAgc3RyaW5ncy5yZWR1Y2UoKHN0eWxlLCBzdHJpbmcsIGluZGV4KSA9PiB7XG4gICAgY29uc3QgcHJldmlvdXMgPSBpbmRleCAtIDE7XG4gICAgY29uc3QgdmFsdWUgPSBnZXRDdXJyZW50VmFsdWUoZnJvbVtwcmV2aW91c10sIHRvW3ByZXZpb3VzXSwgZWFzaW5nKTtcbiAgICByZXR1cm4gc3R5bGUgKyAocm91bmQgJiYgaW5kZXggPCA0ID8gTWF0aC5yb3VuZCh2YWx1ZSkgOiB2YWx1ZSkgKyBzdHJpbmc7XG4gIH0pO1xuXG5jb25zdCBjcmVhdGVTdHlsZXMgPSAoa2V5ZnJhbWVzLCBlYXNpbmcpID0+XG4gIGtleWZyYW1lcy5yZWR1Y2UoKHN0eWxlcywge3Byb3BlcnR5LCBudW1iZXJzLCBzdHJpbmdzLCByb3VuZH0pID0+IHtcbiAgICBzdHlsZXNbcHJvcGVydHldID0gcmVjb21wb3NlVmFsdWUobnVtYmVycywgc3RyaW5ncywgcm91bmQsIGVhc2luZyk7XG4gICAgcmV0dXJuIHN0eWxlcztcbiAgfSwge30pO1xuXG5jb25zdCByZXZlcnNlS2V5ZnJhbWVzID0ga2V5ZnJhbWVzID0+XG4gIGtleWZyYW1lcy5mb3JFYWNoKCh7bnVtYmVyc30pID0+IG51bWJlcnMucmV2ZXJzZSgpKTtcblxuXG4vLyBhbmltYXRpb24gdHJhY2tpbmdcbi8vID09PT09PT09PT09PT09PT09PVxuXG5jb25zdCByQUYgPSB7XG4gIGFsbDogbmV3IFNldCxcbiAgYWRkKG9iamVjdCkge1xuICAgIGlmICh0aGlzLmFsbC5hZGQob2JqZWN0KS5zaXplIDwgMikgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICB9XG59O1xuXG5jb25zdCBwYXVzZWQgPSB7fTtcblxuY29uc3QgdHJhY2tUaW1lID0gKHRpbWluZywgbm93KSA9PiB7XG4gIGlmICghdGltaW5nLnN0YXJ0VGltZSkgdGltaW5nLnN0YXJ0VGltZSA9IG5vdztcbiAgdGltaW5nLmVsYXBzZWQgPSBub3cgLSB0aW1pbmcuc3RhcnRUaW1lO1xufTtcblxuY29uc3QgcmVzZXRUaW1lID0gb2JqZWN0ID0+XG4gIG9iamVjdC5zdGFydFRpbWUgPSAwO1xuXG5jb25zdCBnZXRQcm9ncmVzcyA9ICh7ZWxhcHNlZCwgZHVyYXRpb259KSA9PlxuICBkdXJhdGlvbiA+IDAgPyBNYXRoLm1pbihlbGFwc2VkIC8gZHVyYXRpb24sIDEpIDogMTtcblxuY29uc3Qgc2V0U3BlZWQgPSAoc3BlZWQsIHZhbHVlLCBpbmRleCkgPT5cbiAgc3BlZWQgPiAwID8gY29tcHV0ZVZhbHVlKHZhbHVlLCBpbmRleCkgLyBzcGVlZCA6IDA7XG5cbmNvbnN0IGFkZEFuaW1hdGlvbnMgPSAob3B0aW9ucywgcmVzb2x2ZSkgPT4ge1xuICBjb25zdCB7XG4gICAgZWxlbWVudHMgPSBudWxsLFxuICAgIGVhc2luZyA9IFwib3V0LWVsYXN0aWNcIixcbiAgICBkdXJhdGlvbiA9IDEwMDAsXG4gICAgZGVsYXk6IHRpbWVvdXQgPSAwLFxuICAgIHNwZWVkID0gMSxcbiAgICBsb29wID0gZmFsc2UsXG4gICAgb3B0aW1pemUgPSBmYWxzZSxcbiAgICBkaXJlY3Rpb24gPSBcIm5vcm1hbFwiLFxuICAgIGJsdXIgPSBudWxsLFxuICAgIGNoYW5nZSA9IG51bGwsXG4gICAgLi4ucmVzdFxuICB9ID0gb3B0aW9ucztcblxuICBjb25zdCBsYXN0ID0ge1xuICAgIHRvdGFsRHVyYXRpb246IC0xXG4gIH07XG5cbiAgZ2V0RWxlbWVudHMoZWxlbWVudHMpLmZvckVhY2goYXN5bmMgKGVsZW1lbnQsIGluZGV4KSA9PiB7XG4gICAgY29uc3Qga2V5ZnJhbWVzID0gY3JlYXRlQW5pbWF0aW9uS2V5ZnJhbWVzKHJlc3QsIGluZGV4KTtcbiAgICBjb25zdCBhbmltYXRpb24gPSB7XG4gICAgICBlbGVtZW50LFxuICAgICAga2V5ZnJhbWVzLFxuICAgICAgbG9vcCxcbiAgICAgIG9wdGltaXplLFxuICAgICAgZGlyZWN0aW9uLFxuICAgICAgY2hhbmdlLFxuICAgICAgZWFzaW5nOiBkZWNvbXBvc2VFYXNpbmcoZWFzaW5nKSxcbiAgICAgIGR1cmF0aW9uOiBzZXRTcGVlZChzcGVlZCwgZHVyYXRpb24sIGluZGV4KVxuICAgIH07XG5cbiAgICBjb25zdCBhbmltYXRpb25UaW1lb3V0ID0gc2V0U3BlZWQoc3BlZWQsIHRpbWVvdXQsIGluZGV4KTtcbiAgICBjb25zdCB0b3RhbER1cmF0aW9uID0gYW5pbWF0aW9uVGltZW91dCArIGFuaW1hdGlvbi5kdXJhdGlvbjtcblxuICAgIGlmIChkaXJlY3Rpb24gIT0gXCJub3JtYWxcIilcbiAgICAgIHJldmVyc2VLZXlmcmFtZXMoa2V5ZnJhbWVzKTtcblxuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICBpZiAob3B0aW1pemUpXG4gICAgICAgIGFjY2VsZXJhdGUoZWxlbWVudCwga2V5ZnJhbWVzKTtcblxuICAgICAgaWYgKGJsdXIpIHtcbiAgICAgICAgYW5pbWF0aW9uLmJsdXIgPSBub3JtYWxpemVCbHVyKGNvbXB1dGVWYWx1ZShibHVyLCBpbmRleCkpO1xuICAgICAgICBhbmltYXRpb24uZ2F1c3NpYW4gPSBibHVycy5hZGQoYW5pbWF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodG90YWxEdXJhdGlvbiA+IGxhc3QudG90YWxEdXJhdGlvbikge1xuICAgICAgbGFzdC5hbmltYXRpb24gPSBhbmltYXRpb247XG4gICAgICBsYXN0LnRvdGFsRHVyYXRpb24gPSB0b3RhbER1cmF0aW9uO1xuICAgIH1cblxuICAgIGlmIChhbmltYXRpb25UaW1lb3V0KSBhd2FpdCBkZWxheShhbmltYXRpb25UaW1lb3V0KTtcbiAgICByQUYuYWRkKGFuaW1hdGlvbik7XG4gIH0pO1xuXG4gIGNvbnN0IHthbmltYXRpb259ID0gbGFzdDtcbiAgaWYgKCFhbmltYXRpb24pIHJldHVybjtcbiAgYW5pbWF0aW9uLmVuZCA9IHJlc29sdmU7XG4gIGFuaW1hdGlvbi5vcHRpb25zID0gb3B0aW9ucztcbn07XG5cbmNvbnN0IHRpY2sgPSBub3cgPT4ge1xuICBjb25zdCB7YWxsfSA9IHJBRjtcbiAgYWxsLmZvckVhY2gob2JqZWN0ID0+IHtcbiAgICB0cmFja1RpbWUob2JqZWN0LCBub3cpO1xuICAgIGNvbnN0IHByb2dyZXNzID0gZ2V0UHJvZ3Jlc3Mob2JqZWN0KTtcbiAgICBjb25zdCB7XG4gICAgICBlbGVtZW50LFxuICAgICAga2V5ZnJhbWVzLFxuICAgICAgbG9vcCxcbiAgICAgIG9wdGltaXplLFxuICAgICAgZGlyZWN0aW9uLFxuICAgICAgY2hhbmdlLFxuICAgICAgZWFzaW5nLFxuICAgICAgZHVyYXRpb24sXG4gICAgICBnYXVzc2lhbixcbiAgICAgIGVuZCxcbiAgICAgIG9wdGlvbnNcbiAgICB9ID0gb2JqZWN0O1xuXG4gICAgLy8gb2JqZWN0IGlzIGFuIGFuaW1hdGlvblxuICAgIGlmIChkaXJlY3Rpb24pIHtcbiAgICAgIGxldCBjdXJ2ZSA9IHByb2dyZXNzO1xuICAgICAgc3dpdGNoIChwcm9ncmVzcykge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBcImFsdGVybmF0ZVwiKSByZXZlcnNlS2V5ZnJhbWVzKGtleWZyYW1lcyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAobG9vcClcbiAgICAgICAgICAgIHJlc2V0VGltZShvYmplY3QpO1xuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWxsLmRlbGV0ZShvYmplY3QpO1xuICAgICAgICAgICAgaWYgKG9wdGltaXplICYmIGVsZW1lbnQpIGFjY2VsZXJhdGUoZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAoZ2F1c3NpYW4pIGNsZWFyQmx1cihlbGVtZW50LCBnYXVzc2lhbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlbmQpIGVuZChvcHRpb25zKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjdXJ2ZSA9IGVhc2UoZWFzaW5nLCBwcm9ncmVzcyk7XG4gICAgICB9XG4gICAgICBpZiAoZ2F1c3NpYW4pIHNldERldmlhdGlvbihvYmplY3QsIGN1cnZlKTtcbiAgICAgIGlmIChjaGFuZ2UgJiYgZW5kKSBjaGFuZ2UoY3VydmUpO1xuICAgICAgaWYgKGVsZW1lbnQpIE9iamVjdC5hc3NpZ24oZWxlbWVudC5zdHlsZSwgY3JlYXRlU3R5bGVzKGtleWZyYW1lcywgY3VydmUpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBvYmplY3QgaXMgYSBkZWxheVxuICAgIGlmIChwcm9ncmVzcyA8IDEpIHJldHVybjtcbiAgICBhbGwuZGVsZXRlKG9iamVjdCk7XG4gICAgZW5kKGR1cmF0aW9uKTtcbiAgfSk7XG5cbiAgaWYgKGFsbC5zaXplKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XG59O1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidmlzaWJpbGl0eWNoYW5nZVwiLCAoKSA9PiB7XG4gIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXG4gIGlmIChkb2N1bWVudC5oaWRkZW4pIHtcbiAgICBjb25zdCB7YWxsfSA9IHJBRjtcbiAgICBwYXVzZWQudGltZSA9IG5vdztcbiAgICBwYXVzZWQuYWxsID0gbmV3IFNldChhbGwpO1xuICAgIGFsbC5jbGVhcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHthbGwsIHRpbWV9ID0gcGF1c2VkO1xuICBpZiAoIWFsbCkgcmV0dXJuO1xuICBjb25zdCBlbGFwc2VkID0gbm93IC0gdGltZTtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+XG4gICAgYWxsLmZvckVhY2gob2JqZWN0ID0+IHtcbiAgICAgIG9iamVjdC5zdGFydFRpbWUgKz0gZWxhcHNlZDtcbiAgICAgIHJBRi5hZGQob2JqZWN0KTtcbiAgICB9KSk7XG59KTtcblxuXG4vLyBleHBvcnRzXG4vLyA9PT09PT09XG5cbmV4cG9ydCBkZWZhdWx0IG9wdGlvbnMgPT5cbiAgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBhZGRBbmltYXRpb25zKG9wdGlvbnMsIHJlc29sdmUpKTtcblxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gZHVyYXRpb24gPT5cbiAgbmV3IFByb21pc2UocmVzb2x2ZSA9PiByQUYuYWRkKHtcbiAgICBkdXJhdGlvbixcbiAgICBlbmQ6IHJlc29sdmVcbiAgfSkpO1xuXG5leHBvcnQgY29uc3Qgc3RvcCA9IGVsZW1lbnRzID0+IHtcbiAgY29uc3Qge2FsbH0gPSByQUY7XG4gIGNvbnN0IG5vZGVzID0gZ2V0RWxlbWVudHMoZWxlbWVudHMpO1xuICBhbGwuZm9yRWFjaChvYmplY3QgPT4ge1xuICAgIGlmIChub2Rlcy5pbmNsdWRlcyhvYmplY3QuZWxlbWVudCkpIGFsbC5kZWxldGUob2JqZWN0KTtcbiAgfSk7XG4gIHJldHVybiBub2Rlcztcbn07XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgLmNvbnRhY3RQYWdle1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtcm93czogNDVweCBhdXRvIDFmciBhdXRvO1xufVxuLmNvbnRhY3RQYWdlID4gZGl2Om50aC1jaGlsZCgzKXtcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XG4gICAgbWFyZ2luLXRvcDogMTBweDtcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xufVxuLmNvbnRhY3RQYWdlID4gLm5hdmlnYXRpb24gPiBkaXY6bnRoLWNoaWxkKDMpe1xuICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS10ZXh0LWNvbG9yKTtcbn1cblxuLmNvbnRhY3RQYWdlIGltZ3tcbiAgICBoZWlnaHQ6IDUwcHg7XG59XG4uY29udGFjdFBhZ2UgLm1lbnUgPiBkaXZ7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGZvbnQtc2l6ZTogMnJlbTtcbiAgICBnYXA6MTBweDtcbn1cbi5jb250YWN0UGFnZSAubWVudXtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cbi5tYXBze1xuICAgIG1hcmdpbjoyMHB4O1xufVxuLmNvbnRhY3RQYWdlIC5tZW51ID4gZGl2Om50aC1jaGlsZCgzKXtcbiAgICBtYXJnaW46MTBweDtcbn1cbmAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL2Nzcy9jb250YWN0cGFnZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7SUFDSSxZQUFZO0lBQ1osYUFBYTtJQUNiLHNDQUFzQztBQUMxQztBQUNBO0lBQ0ksa0JBQWtCO0lBQ2xCLGdCQUFnQjtJQUNoQixtQkFBbUI7QUFDdkI7QUFDQTtJQUNJLDBDQUEwQztBQUM5Qzs7QUFFQTtJQUNJLFlBQVk7QUFDaEI7QUFDQTtJQUNJLGFBQWE7SUFDYix1QkFBdUI7SUFDdkIsbUJBQW1CO0lBQ25CLGVBQWU7SUFDZixRQUFRO0FBQ1o7QUFDQTtJQUNJLGFBQWE7SUFDYixzQkFBc0I7SUFDdEIsdUJBQXVCO0lBQ3ZCLG1CQUFtQjtBQUN2QjtBQUNBO0lBQ0ksV0FBVztBQUNmO0FBQ0E7SUFDSSxXQUFXO0FBQ2ZcIixcInNvdXJjZXNDb250ZW50XCI6W1wiLmNvbnRhY3RQYWdle1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtcm93czogNDVweCBhdXRvIDFmciBhdXRvO1xcbn1cXG4uY29udGFjdFBhZ2UgPiBkaXY6bnRoLWNoaWxkKDMpe1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIG1hcmdpbi10b3A6IDEwcHg7XFxuICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XFxufVxcbi5jb250YWN0UGFnZSA+IC5uYXZpZ2F0aW9uID4gZGl2Om50aC1jaGlsZCgzKXtcXG4gICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLXRleHQtY29sb3IpO1xcbn1cXG5cXG4uY29udGFjdFBhZ2UgaW1ne1xcbiAgICBoZWlnaHQ6IDUwcHg7XFxufVxcbi5jb250YWN0UGFnZSAubWVudSA+IGRpdntcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMnJlbTtcXG4gICAgZ2FwOjEwcHg7XFxufVxcbi5jb250YWN0UGFnZSAubWVudXtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbi5tYXBze1xcbiAgICBtYXJnaW46MjBweDtcXG59XFxuLmNvbnRhY3RQYWdlIC5tZW51ID4gZGl2Om50aC1jaGlsZCgzKXtcXG4gICAgbWFyZ2luOjEwcHg7XFxufVxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgLmhvbWVQYWdle1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtcm93czo0NXB4IHJlcGVhdCgyLGF1dG8pIDFmciBhdXRvIGF1dG87XG59XG5cbi5uYXZpZ2F0aW9ue1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgZ2FwOjEwMHB4O1xuICAgIG1hcmdpbjogMTBweDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XG4gICAgei1pbmRleDogMTtcblxufVxuaHJ7XG4gICAgd2lkdGg6IDUwJTtcbiAgICBib3JkZXI6MXB4IHNvbGlkIGJsYWNrO1xuICAgIHotaW5kZXg6IDE7XG59XG4uaGVhZGluZ3tcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgICAgXG59XG4ubWFpbkNhcmR7XG4gICAgZGlzcGxheTogZmxleDtcbn1cbi5mb290ZXJ7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGdhcDoxMHB4O1xufVxuLmZvb3RlciBpbWd7XG4gICAgaGVpZ2h0OiA0MHB4O1xufVxuLmZvb3RlciBpbWc6aG92ZXJ7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoNzIwZGVnKTtcbiAgICB0cmFuc2l0aW9uOiBhbGwgMXM7XG59XG4uaGVhZGluZyA+IGltZ3tcbiAgICBoZWlnaHQ6IDQzMHB4O1xufVxuLmhlYWRpbmcgPiBkaXY6bnRoLWNoaWxkKDIpe1xuICAgIGNvbG9yOiB3aGl0ZTtcbiAgICBvcGFjaXR5OiAwLjc7XG4gICAgZm9udC1zaXplOiAxLjRyZW07XG4gICAgbWFyZ2luLXRvcDotNjBweDtcbiAgICBtYXJnaW4tYm90dG9tOiA1MHB4O1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcbn1cblxuLyogQ2FyZHMgKi9cbi5tYWluQ2FyZHtcbiAgICB3aWR0aDogODAlO1xuICAgIG1hcmdpbjowIGF1dG87XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLDFmcik7XG4gICAgZ2FwOjIwcHg7XG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xuICAgIG1hcmdpbi1ib3R0b206IDIwcHg7XG59XG5cbi5jYXJke1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgaGVpZ2h0OiAzMDBweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOjIwcHg7XG4gICAgZm9udC1zaXplOiAxLjNyZW07XG4gICAgcGFkZGluZzoyMHB4O1xuICAgIG92ZXJmbG93OiBhdXRvOyAgXG4gICAgYm9yZGVyOiAzcHggc29saWQgYmxhY2s7XG4gICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjQ2LDE3NSwxMzMsMC43KTtcblxufVxuLm1haW5DYXJkID4gZGl2Om50aC1jaGlsZCgyKXtcbiAgICB6LWluZGV4OiAxO1xufVxuLmNhcmQgaW1ne1xuICAgIGhlaWdodDogNTBweDtcbn1cbi5jYXJkID4gZGl2Om50aC1jaGlsZCgyKXtcbiAgICBmb250LXNpemU6IDEuNXJlbTtcbn1cbi5jYXJkID4gZGl2Om50aC1jaGlsZCgzKXtcbiAgICBvcGFjaXR5OiAwLjY7XG4gICAgZm9udC1zdHlsZTogaXRhbGljO1xufVxuXG4vKiBuYXZpZ2F0aW9uIHNlbGVjdGlvbiBiYXIgKi9cbi5uYXZpZ2F0aW9uID4gZGl2e1xuICAgIHBhZGRpbmctcmlnaHQ6IDVweDtcbiAgICBwYWRkaW5nLWxlZnQ6IDVweDtcbn1cbi5ob21lUGFnZSA+IC5uYXZpZ2F0aW9uID4gZGl2Om50aC1jaGlsZCgxKXtcbiAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgdmFyKC0tdGV4dC1jb2xvcik7XG59XG5cbmAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL2Nzcy9ob21lcGFnZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7SUFDSSxZQUFZO0lBQ1osYUFBYTtJQUNiLG9EQUFvRDtBQUN4RDs7QUFFQTtJQUNJLGFBQWE7SUFDYix1QkFBdUI7SUFDdkIsU0FBUztJQUNULFlBQVk7SUFDWix3QkFBd0I7SUFDeEIsVUFBVTs7QUFFZDtBQUNBO0lBQ0ksVUFBVTtJQUNWLHNCQUFzQjtJQUN0QixVQUFVO0FBQ2Q7QUFDQTtJQUNJLGFBQWE7SUFDYixzQkFBc0I7SUFDdEIsbUJBQW1CO0FBQ3ZCO0FBQ0E7SUFDSSxhQUFhO0FBQ2pCO0FBQ0E7SUFDSSxhQUFhO0lBQ2IsbUJBQW1CO0lBQ25CLHVCQUF1QjtJQUN2QixRQUFRO0FBQ1o7QUFDQTtJQUNJLFlBQVk7QUFDaEI7QUFDQTtJQUNJLHlCQUF5QjtJQUN6QixrQkFBa0I7QUFDdEI7QUFDQTtJQUNJLGFBQWE7QUFDakI7QUFDQTtJQUNJLFlBQVk7SUFDWixZQUFZO0lBQ1osaUJBQWlCO0lBQ2pCLGdCQUFnQjtJQUNoQixtQkFBbUI7SUFDbkIsd0JBQXdCO0FBQzVCOztBQUVBLFVBQVU7QUFDVjtJQUNJLFVBQVU7SUFDVixhQUFhO0lBQ2IsYUFBYTtJQUNiLG9DQUFvQztJQUNwQyxRQUFRO0lBQ1Isa0JBQWtCO0lBQ2xCLG1CQUFtQjtBQUN2Qjs7QUFFQTtJQUNJLHNCQUFzQjtJQUN0QixhQUFhO0lBQ2IsdUJBQXVCO0lBQ3ZCLGtCQUFrQjtJQUNsQixhQUFhO0lBQ2Isc0JBQXNCO0lBQ3RCLHVCQUF1QjtJQUN2QixtQkFBbUI7SUFDbkIsUUFBUTtJQUNSLGlCQUFpQjtJQUNqQixZQUFZO0lBQ1osY0FBYztJQUNkLHVCQUF1QjtJQUN2QixrQkFBa0I7SUFDbEIsdUJBQXVCO0lBQ3ZCLHVDQUF1Qzs7QUFFM0M7QUFDQTtJQUNJLFVBQVU7QUFDZDtBQUNBO0lBQ0ksWUFBWTtBQUNoQjtBQUNBO0lBQ0ksaUJBQWlCO0FBQ3JCO0FBQ0E7SUFDSSxZQUFZO0lBQ1osa0JBQWtCO0FBQ3RCOztBQUVBLDZCQUE2QjtBQUM3QjtJQUNJLGtCQUFrQjtJQUNsQixpQkFBaUI7QUFDckI7QUFDQTtJQUNJLDBDQUEwQztBQUM5Q1wiLFwic291cmNlc0NvbnRlbnRcIjpbXCIuaG9tZVBhZ2V7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOjQ1cHggcmVwZWF0KDIsYXV0bykgMWZyIGF1dG8gYXV0bztcXG59XFxuXFxuLm5hdmlnYXRpb257XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBnYXA6MTAwcHg7XFxuICAgIG1hcmdpbjogMTBweDtcXG4gICAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xcbiAgICB6LWluZGV4OiAxO1xcblxcbn1cXG5ocntcXG4gICAgd2lkdGg6IDUwJTtcXG4gICAgYm9yZGVyOjFweCBzb2xpZCBibGFjaztcXG4gICAgei1pbmRleDogMTtcXG59XFxuLmhlYWRpbmd7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7ICAgIFxcbn1cXG4ubWFpbkNhcmR7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxufVxcbi5mb290ZXJ7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBnYXA6MTBweDtcXG59XFxuLmZvb3RlciBpbWd7XFxuICAgIGhlaWdodDogNDBweDtcXG59XFxuLmZvb3RlciBpbWc6aG92ZXJ7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDcyMGRlZyk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAxcztcXG59XFxuLmhlYWRpbmcgPiBpbWd7XFxuICAgIGhlaWdodDogNDMwcHg7XFxufVxcbi5oZWFkaW5nID4gZGl2Om50aC1jaGlsZCgyKXtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBvcGFjaXR5OiAwLjc7XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICBtYXJnaW4tdG9wOi02MHB4O1xcbiAgICBtYXJnaW4tYm90dG9tOiA1MHB4O1xcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XFxufVxcblxcbi8qIENhcmRzICovXFxuLm1haW5DYXJke1xcbiAgICB3aWR0aDogODAlO1xcbiAgICBtYXJnaW46MCBhdXRvO1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLDFmcik7XFxuICAgIGdhcDoyMHB4O1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIG1hcmdpbi1ib3R0b206IDIwcHg7XFxufVxcblxcbi5jYXJke1xcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICBoZWlnaHQ6IDMwMHB4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgZ2FwOjIwcHg7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBwYWRkaW5nOjIwcHg7XFxuICAgIG92ZXJmbG93OiBhdXRvOyAgXFxuICAgIGJvcmRlcjogM3B4IHNvbGlkIGJsYWNrO1xcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI0NiwxNzUsMTMzLDAuNyk7XFxuXFxufVxcbi5tYWluQ2FyZCA+IGRpdjpudGgtY2hpbGQoMil7XFxuICAgIHotaW5kZXg6IDE7XFxufVxcbi5jYXJkIGltZ3tcXG4gICAgaGVpZ2h0OiA1MHB4O1xcbn1cXG4uY2FyZCA+IGRpdjpudGgtY2hpbGQoMil7XFxuICAgIGZvbnQtc2l6ZTogMS41cmVtO1xcbn1cXG4uY2FyZCA+IGRpdjpudGgtY2hpbGQoMyl7XFxuICAgIG9wYWNpdHk6IDAuNjtcXG4gICAgZm9udC1zdHlsZTogaXRhbGljO1xcbn1cXG5cXG4vKiBuYXZpZ2F0aW9uIHNlbGVjdGlvbiBiYXIgKi9cXG4ubmF2aWdhdGlvbiA+IGRpdntcXG4gICAgcGFkZGluZy1yaWdodDogNXB4O1xcbiAgICBwYWRkaW5nLWxlZnQ6IDVweDtcXG59XFxuLmhvbWVQYWdlID4gLm5hdmlnYXRpb24gPiBkaXY6bnRoLWNoaWxkKDEpe1xcbiAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgdmFyKC0tdGV4dC1jb2xvcik7XFxufVxcblxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJAaW1wb3J0IHVybChodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PVBhdHJpY2srSGFuZCZkaXNwbGF5PXN3YXApO1wiXSk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYDpyb290e1xuICAgIGZvbnQtZmFtaWx5OiAnUGF0cmljayBIYW5kJywgY3Vyc2l2ZTtcbiAgICAtLXRleHQtY29sb3I6IHJnYmEoMjQ2LDE3NSwxMzMsMjU1KTtcbiAgICAtLWJnLWNvbG9yOiAgcmdiYSg3Myw5NiwxNjYsMjU1KVxufVxuXG5ib2R5e1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJnLWNvbG9yKTtcbiAgICBoZWlnaHQ6IDk5dmg7XG4gICAgd2lkdGg6IDEwMHZ3O1xufVxuLmNvbnRlbnR7XG4gICAgaGVpZ2h0OiA5OXZoO1xuICAgIHdpZHRoOiAxMDB2dztcbn1cbmJ1dHRvbntcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iZy1jb2xvcik7XG4gICAgYm9yZGVyOjBweDsgXG4gICAgY29sb3I6dmFyKC0tdGV4dC1jb2xvcilcbn1gLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9jc3MvaW5kZXguY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUNBO0lBQ0ksb0NBQW9DO0lBQ3BDLG1DQUFtQztJQUNuQztBQUNKOztBQUVBO0lBQ0ksaUNBQWlDO0lBQ2pDLFlBQVk7SUFDWixZQUFZO0FBQ2hCO0FBQ0E7SUFDSSxZQUFZO0lBQ1osWUFBWTtBQUNoQjtBQUNBO0lBQ0ksaUNBQWlDO0lBQ2pDLFVBQVU7SUFDVjtBQUNKXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIkBpbXBvcnQgdXJsKCdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PVBhdHJpY2srSGFuZCZkaXNwbGF5PXN3YXAnKTtcXG46cm9vdHtcXG4gICAgZm9udC1mYW1pbHk6ICdQYXRyaWNrIEhhbmQnLCBjdXJzaXZlO1xcbiAgICAtLXRleHQtY29sb3I6IHJnYmEoMjQ2LDE3NSwxMzMsMjU1KTtcXG4gICAgLS1iZy1jb2xvcjogIHJnYmEoNzMsOTYsMTY2LDI1NSlcXG59XFxuXFxuYm9keXtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmctY29sb3IpO1xcbiAgICBoZWlnaHQ6IDk5dmg7XFxuICAgIHdpZHRoOiAxMDB2dztcXG59XFxuLmNvbnRlbnR7XFxuICAgIGhlaWdodDogOTl2aDtcXG4gICAgd2lkdGg6IDEwMHZ3O1xcbn1cXG5idXR0b257XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJnLWNvbG9yKTtcXG4gICAgYm9yZGVyOjBweDsgXFxuICAgIGNvbG9yOnZhcigtLXRleHQtY29sb3IpXFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgLm1lbnVQYWdle1xuICAgIGhlaWdodDogOTl2aDtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtcm93czogNDVweCBhdXRvIDFmciBhdXRvIGF1dG87ICAgXG59XG4ubWVudVBhZ2UgPiBkaXY6bnRoLWNoaWxkKDMpe1xuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcbn1cbi5vdXRlck1lbnV7XG4gICAgaGVpZ2h0OiA3OHZoO1xuICAgIHdpZHRoOiA3MHZ3O1xuICAgIG1hcmdpbjowIGF1dG87ICAgIFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgIGJvcmRlcjozcHggc29saWQgYmxhY2s7XG4gICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKVxuICAgIFxufVxuLm1lbnV7XG4gICAgaGVpZ2h0OiA5MCU7XG4gICAgd2lkdGg6IDk1JTtcbiAgICBib3JkZXI6M3B4IHNvbGlkIGJsYWNrO1xuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbiAgICBvdmVyZmxvdzogYXV0bztcbn1cbi5tZW51UGFnZSAubWVudSB7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAxZnIpO1xuICAgIGdyaWQtdGVtcGxhdGUtcm93czogMjQwcHggMWZyO1xuICAgIGdyaWQtYXV0by1mbG93OiBjb2x1bW47XG59XG4ubWVudVBhZ2UgLm1lbnUgaHIge1xuICAgIGJvcmRlcjogMnB4IHNvbGlkIGJsYWNrO1xuICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiA1MCU7XG4gICAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IDUwJTtcbiAgICB3aWR0aDogODAlO1xuICAgIG1hcmdpbjowcHg7XG59XG4udGl0bGV7XG4gICAgcGFkZGluZzoxMHB4O1xuICAgIGZvbnQtc2l6ZTogNXJlbTtcbiAgICBtYXJnaW4tdG9wOjEwcHg7XG4gICAgcGFkZGluZy10b3A6MHB4O1xuICAgIGJvcmRlci1yaWdodDogMnB4IHNvbGlkIGJsYWNrO1xuICAgIHotaW5kZXg6IDI7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG59XG5cbnNlY3Rpb24gaW1nIHtcbiAgICB3aWR0aDogMTIwcHg7XG4gICAgaGVpZ2h0OiA4MnB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDIwJTtcbiAgICBib3JkZXI6MnB4IHNvbGlkIGJsYWNrO1xuICAgIG1hcmdpbi1sZWZ0OiAxMHB4O1xufVxuc2VjdGlvbiA+IGRpdjpudGgtY2hpbGQoMSl7XG4gICAgZm9udC1zaXplOiAxLjVyZW07XG4gICAgbWFyZ2luOiAxMHB4O1xuICAgIHBhZGRpbmctbGVmdDoxMHB4O1xuICAgIGZvbnQtd2VpZ2h0OiBib2xkZXI7XG4gICAgYm9yZGVyOiAycHggc29saWQgYmxhY2s7XG4gICAgd2lkdGg6IDg4cHg7XG4gICAgaGVpZ2h0OiA0MHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDUlO1xuICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDMwJTtcbiAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMzAlO1xufVxuc2VjdGlvbiA+IGRpdntcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byAxZnI7XG4gICAgZ3JpZC1hdXRvLWZsb3c6IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGZvbnQtc2l6ZTogMS41cmVtO1xuICAgIGdhcDoxMHB4O1xuICAgIG1hcmdpbi1ib3R0b206IDVweDtcbn1cbnNlY3Rpb24gPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDMpe1xuICAgIG1hcmdpbi1yaWdodDogMTVweDtcbn1cbi5wYXN0cnl7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDYwcHggcmVwZWF0KDMsYXV0byk7XG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcbiAgICBib3JkZXItcmlnaHQ6IDJweCBzb2xpZCBibGFjaztcbiAgICB6LWluZGV4OiAyO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xufVxuLmRlc2VydCxcbi5kcmlua3tcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtcm93OiAxIC8gMztcbiAgICBtYXJnaW4tdG9wOjEwcHg7XG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcbn1cbi5kZXNlcnR7XG4gICAgYm9yZGVyLXJpZ2h0OiAycHggc29saWQgYmxhY2s7XG4gICAgei1pbmRleDogMTtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbn1cbi5kZXNlcnQgPiBkaXY6bnRoLWNoaWxkKDEpe1xuICAgIHdpZHRoOiA4MHB4O1xuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcbn1cbi5kcmluayA+IGRpdjpudGgtY2hpbGQoMSl7XG4gICAgd2lkdGg6IDcwcHg7XG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xufVxuLm1lbnVQYWdlID4gLm5hdmlnYXRpb24gPiBkaXY6bnRoLWNoaWxkKDIpe1xuICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS10ZXh0LWNvbG9yKTtcbn1cbi5kcmlua3tcbiAgICB6LWluZGV4OiAwO1xufVxuYCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvY3NzL21lbnVwYWdlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTtJQUNJLFlBQVk7SUFDWixhQUFhO0lBQ2IsMkNBQTJDO0FBQy9DO0FBQ0E7SUFDSSxrQkFBa0I7QUFDdEI7QUFDQTtJQUNJLFlBQVk7SUFDWixXQUFXO0lBQ1gsYUFBYTtJQUNiLHVCQUF1QjtJQUN2QixzQkFBc0I7SUFDdEIsa0JBQWtCO0lBQ2xCLGFBQWE7SUFDYix1QkFBdUI7SUFDdkIsbUJBQW1CO0lBQ25COztBQUVKO0FBQ0E7SUFDSSxXQUFXO0lBQ1gsVUFBVTtJQUNWLHNCQUFzQjtJQUN0QixrQkFBa0I7SUFDbEIsdUJBQXVCO0lBQ3ZCLGNBQWM7QUFDbEI7QUFDQTtJQUNJLGFBQWE7SUFDYixxQ0FBcUM7SUFDckMsNkJBQTZCO0lBQzdCLHNCQUFzQjtBQUMxQjtBQUNBO0lBQ0ksdUJBQXVCO0lBQ3ZCLDRCQUE0QjtJQUM1QiwrQkFBK0I7SUFDL0IsVUFBVTtJQUNWLFVBQVU7QUFDZDtBQUNBO0lBQ0ksWUFBWTtJQUNaLGVBQWU7SUFDZixlQUFlO0lBQ2YsZUFBZTtJQUNmLDZCQUE2QjtJQUM3QixVQUFVO0lBQ1YsdUJBQXVCO0FBQzNCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLFlBQVk7SUFDWixrQkFBa0I7SUFDbEIsc0JBQXNCO0lBQ3RCLGlCQUFpQjtBQUNyQjtBQUNBO0lBQ0ksaUJBQWlCO0lBQ2pCLFlBQVk7SUFDWixpQkFBaUI7SUFDakIsbUJBQW1CO0lBQ25CLHVCQUF1QjtJQUN2QixXQUFXO0lBQ1gsWUFBWTtJQUNaLGlCQUFpQjtJQUNqQiwyQkFBMkI7SUFDM0IsNEJBQTRCO0FBQ2hDO0FBQ0E7SUFDSSxhQUFhO0lBQ2IsK0JBQStCO0lBQy9CLHNCQUFzQjtJQUN0QixtQkFBbUI7SUFDbkIsaUJBQWlCO0lBQ2pCLFFBQVE7SUFDUixrQkFBa0I7QUFDdEI7QUFDQTtJQUNJLGtCQUFrQjtBQUN0QjtBQUNBO0lBQ0ksYUFBYTtJQUNiLHVDQUF1QztJQUN2QyxtQkFBbUI7SUFDbkIsNkJBQTZCO0lBQzdCLFVBQVU7SUFDVix1QkFBdUI7QUFDM0I7QUFDQTs7SUFFSSxhQUFhO0lBQ2IsZUFBZTtJQUNmLGVBQWU7SUFDZixtQkFBbUI7QUFDdkI7QUFDQTtJQUNJLDZCQUE2QjtJQUM3QixVQUFVO0lBQ1YsdUJBQXVCO0FBQzNCO0FBQ0E7SUFDSSxXQUFXO0lBQ1gsa0JBQWtCO0FBQ3RCO0FBQ0E7SUFDSSxXQUFXO0lBQ1gsa0JBQWtCO0FBQ3RCO0FBQ0E7SUFDSSwwQ0FBMEM7QUFDOUM7QUFDQTtJQUNJLFVBQVU7QUFDZFwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIubWVudVBhZ2V7XFxuICAgIGhlaWdodDogOTl2aDtcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiA0NXB4IGF1dG8gMWZyIGF1dG8gYXV0bzsgICBcXG59XFxuLm1lbnVQYWdlID4gZGl2Om50aC1jaGlsZCgzKXtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbn1cXG4ub3V0ZXJNZW51e1xcbiAgICBoZWlnaHQ6IDc4dmg7XFxuICAgIHdpZHRoOiA3MHZ3O1xcbiAgICBtYXJnaW46MCBhdXRvOyAgICBcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxuICAgIGJvcmRlcjozcHggc29saWQgYmxhY2s7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXRleHQtY29sb3IpXFxuICAgIFxcbn1cXG4ubWVudXtcXG4gICAgaGVpZ2h0OiA5MCU7XFxuICAgIHdpZHRoOiA5NSU7XFxuICAgIGJvcmRlcjozcHggc29saWQgYmxhY2s7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxuICAgIG92ZXJmbG93OiBhdXRvO1xcbn1cXG4ubWVudVBhZ2UgLm1lbnUge1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAxZnIpO1xcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDI0MHB4IDFmcjtcXG4gICAgZ3JpZC1hdXRvLWZsb3c6IGNvbHVtbjtcXG59XFxuLm1lbnVQYWdlIC5tZW51IGhyIHtcXG4gICAgYm9yZGVyOiAycHggc29saWQgYmxhY2s7XFxuICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiA1MCU7XFxuICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiA1MCU7XFxuICAgIHdpZHRoOiA4MCU7XFxuICAgIG1hcmdpbjowcHg7XFxufVxcbi50aXRsZXtcXG4gICAgcGFkZGluZzoxMHB4O1xcbiAgICBmb250LXNpemU6IDVyZW07XFxuICAgIG1hcmdpbi10b3A6MTBweDtcXG4gICAgcGFkZGluZy10b3A6MHB4O1xcbiAgICBib3JkZXItcmlnaHQ6IDJweCBzb2xpZCBibGFjaztcXG4gICAgei1pbmRleDogMjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxufVxcblxcbnNlY3Rpb24gaW1nIHtcXG4gICAgd2lkdGg6IDEyMHB4O1xcbiAgICBoZWlnaHQ6IDgycHg7XFxuICAgIGJvcmRlci1yYWRpdXM6IDIwJTtcXG4gICAgYm9yZGVyOjJweCBzb2xpZCBibGFjaztcXG4gICAgbWFyZ2luLWxlZnQ6IDEwcHg7XFxufVxcbnNlY3Rpb24gPiBkaXY6bnRoLWNoaWxkKDEpe1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gICAgbWFyZ2luOiAxMHB4O1xcbiAgICBwYWRkaW5nLWxlZnQ6MTBweDtcXG4gICAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcXG4gICAgYm9yZGVyOiAycHggc29saWQgYmxhY2s7XFxuICAgIHdpZHRoOiA4OHB4O1xcbiAgICBoZWlnaHQ6IDQwcHg7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUlO1xcbiAgICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAzMCU7XFxuICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiAzMCU7XFxufVxcbnNlY3Rpb24gPiBkaXZ7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byAxZnI7XFxuICAgIGdyaWQtYXV0by1mbG93OiBjb2x1bW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgICBnYXA6MTBweDtcXG4gICAgbWFyZ2luLWJvdHRvbTogNXB4O1xcbn1cXG5zZWN0aW9uID4gZGl2ID4gZGl2Om50aC1jaGlsZCgzKXtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxNXB4O1xcbn1cXG4ucGFzdHJ5e1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDYwcHggcmVwZWF0KDMsYXV0byk7XFxuICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XFxuICAgIGJvcmRlci1yaWdodDogMnB4IHNvbGlkIGJsYWNrO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcXG59XFxuLmRlc2VydCxcXG4uZHJpbmt7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtcm93OiAxIC8gMztcXG4gICAgbWFyZ2luLXRvcDoxMHB4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xcbn1cXG4uZGVzZXJ0e1xcbiAgICBib3JkZXItcmlnaHQ6IDJweCBzb2xpZCBibGFjaztcXG4gICAgei1pbmRleDogMTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxufVxcbi5kZXNlcnQgPiBkaXY6bnRoLWNoaWxkKDEpe1xcbiAgICB3aWR0aDogODBweDtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbn1cXG4uZHJpbmsgPiBkaXY6bnRoLWNoaWxkKDEpe1xcbiAgICB3aWR0aDogNzBweDtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbn1cXG4ubWVudVBhZ2UgPiAubmF2aWdhdGlvbiA+IGRpdjpudGgtY2hpbGQoMil7XFxuICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS10ZXh0LWNvbG9yKTtcXG59XFxuLmRyaW5re1xcbiAgICB6LWluZGV4OiAwO1xcbn1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYC8qISBub3JtYWxpemUuY3NzIHY4LjAuMSB8IE1JVCBMaWNlbnNlIHwgZ2l0aHViLmNvbS9uZWNvbGFzL25vcm1hbGl6ZS5jc3MgKi9cblxuLyogRG9jdW1lbnRcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi8qKlxuICogMS4gQ29ycmVjdCB0aGUgbGluZSBoZWlnaHQgaW4gYWxsIGJyb3dzZXJzLlxuICogMi4gUHJldmVudCBhZGp1c3RtZW50cyBvZiBmb250IHNpemUgYWZ0ZXIgb3JpZW50YXRpb24gY2hhbmdlcyBpbiBpT1MuXG4gKi9cblxuIGh0bWwge1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1OyAvKiAxICovXG4gICAgLXdlYmtpdC10ZXh0LXNpemUtYWRqdXN0OiAxMDAlOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qIFNlY3Rpb25zXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4gIFxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBtYXJnaW4gaW4gYWxsIGJyb3dzZXJzLlxuICAgKi9cbiAgXG4gIGJvZHkge1xuICAgIG1hcmdpbjogMDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgXFxgbWFpblxcYCBlbGVtZW50IGNvbnNpc3RlbnRseSBpbiBJRS5cbiAgICovXG4gIFxuICBtYWluIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgfVxuICBcbiAgLyoqXG4gICAqIENvcnJlY3QgdGhlIGZvbnQgc2l6ZSBhbmQgbWFyZ2luIG9uIFxcYGgxXFxgIGVsZW1lbnRzIHdpdGhpbiBcXGBzZWN0aW9uXFxgIGFuZFxuICAgKiBcXGBhcnRpY2xlXFxgIGNvbnRleHRzIGluIENocm9tZSwgRmlyZWZveCwgYW5kIFNhZmFyaS5cbiAgICovXG4gIFxuICBoMSB7XG4gICAgZm9udC1zaXplOiAyZW07XG4gICAgbWFyZ2luOiAwLjY3ZW0gMDtcbiAgfVxuICBcbiAgLyogR3JvdXBpbmcgY29udGVudFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuICBcbiAgLyoqXG4gICAqIDEuIEFkZCB0aGUgY29ycmVjdCBib3ggc2l6aW5nIGluIEZpcmVmb3guXG4gICAqIDIuIFNob3cgdGhlIG92ZXJmbG93IGluIEVkZ2UgYW5kIElFLlxuICAgKi9cbiAgXG4gIGhyIHtcbiAgICBib3gtc2l6aW5nOiBjb250ZW50LWJveDsgLyogMSAqL1xuICAgIGhlaWdodDogMDsgLyogMSAqL1xuICAgIG92ZXJmbG93OiB2aXNpYmxlOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiAxLiBDb3JyZWN0IHRoZSBpbmhlcml0YW5jZSBhbmQgc2NhbGluZyBvZiBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxuICAgKiAyLiBDb3JyZWN0IHRoZSBvZGQgXFxgZW1cXGAgZm9udCBzaXppbmcgaW4gYWxsIGJyb3dzZXJzLlxuICAgKi9cbiAgXG4gIHByZSB7XG4gICAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZSwgbW9ub3NwYWNlOyAvKiAxICovXG4gICAgZm9udC1zaXplOiAxZW07IC8qIDIgKi9cbiAgfVxuICBcbiAgLyogVGV4dC1sZXZlbCBzZW1hbnRpY3NcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbiAgXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGdyYXkgYmFja2dyb3VuZCBvbiBhY3RpdmUgbGlua3MgaW4gSUUgMTAuXG4gICAqL1xuICBcbiAgYSB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiAxLiBSZW1vdmUgdGhlIGJvdHRvbSBib3JkZXIgaW4gQ2hyb21lIDU3LVxuICAgKiAyLiBBZGQgdGhlIGNvcnJlY3QgdGV4dCBkZWNvcmF0aW9uIGluIENocm9tZSwgRWRnZSwgSUUsIE9wZXJhLCBhbmQgU2FmYXJpLlxuICAgKi9cbiAgXG4gIGFiYnJbdGl0bGVdIHtcbiAgICBib3JkZXItYm90dG9tOiBub25lOyAvKiAxICovXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IC8qIDIgKi9cbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7IC8qIDIgKi9cbiAgfVxuICBcbiAgLyoqXG4gICAqIEFkZCB0aGUgY29ycmVjdCBmb250IHdlaWdodCBpbiBDaHJvbWUsIEVkZ2UsIGFuZCBTYWZhcmkuXG4gICAqL1xuICBcbiAgYixcbiAgc3Ryb25nIHtcbiAgICBmb250LXdlaWdodDogYm9sZGVyO1xuICB9XG4gIFxuICAvKipcbiAgICogMS4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2UgYW5kIHNjYWxpbmcgb2YgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiAgICogMi4gQ29ycmVjdCB0aGUgb2RkIFxcYGVtXFxgIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cbiAgICovXG4gIFxuICBjb2RlLFxuICBrYmQsXG4gIHNhbXAge1xuICAgIGZvbnQtZmFtaWx5OiBtb25vc3BhY2UsIG1vbm9zcGFjZTsgLyogMSAqL1xuICAgIGZvbnQtc2l6ZTogMWVtOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiAgICovXG4gIFxuICBzbWFsbCB7XG4gICAgZm9udC1zaXplOiA4MCU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBQcmV2ZW50IFxcYHN1YlxcYCBhbmQgXFxgc3VwXFxgIGVsZW1lbnRzIGZyb20gYWZmZWN0aW5nIHRoZSBsaW5lIGhlaWdodCBpblxuICAgKiBhbGwgYnJvd3NlcnMuXG4gICAqL1xuICBcbiAgc3ViLFxuICBzdXAge1xuICAgIGZvbnQtc2l6ZTogNzUlO1xuICAgIGxpbmUtaGVpZ2h0OiAwO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG4gIH1cbiAgXG4gIHN1YiB7XG4gICAgYm90dG9tOiAtMC4yNWVtO1xuICB9XG4gIFxuICBzdXAge1xuICAgIHRvcDogLTAuNWVtO1xuICB9XG4gIFxuICAvKiBFbWJlZGRlZCBjb250ZW50XG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4gIFxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBib3JkZXIgb24gaW1hZ2VzIGluc2lkZSBsaW5rcyBpbiBJRSAxMC5cbiAgICovXG4gIFxuICBpbWcge1xuICAgIGJvcmRlci1zdHlsZTogbm9uZTtcbiAgfVxuICBcbiAgLyogRm9ybXNcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbiAgXG4gIC8qKlxuICAgKiAxLiBDaGFuZ2UgdGhlIGZvbnQgc3R5bGVzIGluIGFsbCBicm93c2Vycy5cbiAgICogMi4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gRmlyZWZveCBhbmQgU2FmYXJpLlxuICAgKi9cbiAgXG4gIGJ1dHRvbixcbiAgaW5wdXQsXG4gIG9wdGdyb3VwLFxuICBzZWxlY3QsXG4gIHRleHRhcmVhIHtcbiAgICBmb250LWZhbWlseTogaW5oZXJpdDsgLyogMSAqL1xuICAgIGZvbnQtc2l6ZTogMTAwJTsgLyogMSAqL1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1OyAvKiAxICovXG4gICAgbWFyZ2luOiAwOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBTaG93IHRoZSBvdmVyZmxvdyBpbiBJRS5cbiAgICogMS4gU2hvdyB0aGUgb3ZlcmZsb3cgaW4gRWRnZS5cbiAgICovXG4gIFxuICBidXR0b24sXG4gIGlucHV0IHsgLyogMSAqL1xuICAgIG92ZXJmbG93OiB2aXNpYmxlO1xuICB9XG4gIFxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBpbmhlcml0YW5jZSBvZiB0ZXh0IHRyYW5zZm9ybSBpbiBFZGdlLCBGaXJlZm94LCBhbmQgSUUuXG4gICAqIDEuIFJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRmlyZWZveC5cbiAgICovXG4gIFxuICBidXR0b24sXG4gIHNlbGVjdCB7IC8qIDEgKi9cbiAgICB0ZXh0LXRyYW5zZm9ybTogbm9uZTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4gICAqL1xuICBcbiAgYnV0dG9uLFxuICBbdHlwZT1cImJ1dHRvblwiXSxcbiAgW3R5cGU9XCJyZXNldFwiXSxcbiAgW3R5cGU9XCJzdWJtaXRcIl0ge1xuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uO1xuICB9XG4gIFxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBpbm5lciBib3JkZXIgYW5kIHBhZGRpbmcgaW4gRmlyZWZveC5cbiAgICovXG4gIFxuICBidXR0b246Oi1tb3otZm9jdXMtaW5uZXIsXG4gIFt0eXBlPVwiYnV0dG9uXCJdOjotbW96LWZvY3VzLWlubmVyLFxuICBbdHlwZT1cInJlc2V0XCJdOjotbW96LWZvY3VzLWlubmVyLFxuICBbdHlwZT1cInN1Ym1pdFwiXTo6LW1vei1mb2N1cy1pbm5lciB7XG4gICAgYm9yZGVyLXN0eWxlOiBub25lO1xuICAgIHBhZGRpbmc6IDA7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBSZXN0b3JlIHRoZSBmb2N1cyBzdHlsZXMgdW5zZXQgYnkgdGhlIHByZXZpb3VzIHJ1bGUuXG4gICAqL1xuICBcbiAgYnV0dG9uOi1tb3otZm9jdXNyaW5nLFxuICBbdHlwZT1cImJ1dHRvblwiXTotbW96LWZvY3VzcmluZyxcbiAgW3R5cGU9XCJyZXNldFwiXTotbW96LWZvY3VzcmluZyxcbiAgW3R5cGU9XCJzdWJtaXRcIl06LW1vei1mb2N1c3Jpbmcge1xuICAgIG91dGxpbmU6IDFweCBkb3R0ZWQgQnV0dG9uVGV4dDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIENvcnJlY3QgdGhlIHBhZGRpbmcgaW4gRmlyZWZveC5cbiAgICovXG4gIFxuICBmaWVsZHNldCB7XG4gICAgcGFkZGluZzogMC4zNWVtIDAuNzVlbSAwLjYyNWVtO1xuICB9XG4gIFxuICAvKipcbiAgICogMS4gQ29ycmVjdCB0aGUgdGV4dCB3cmFwcGluZyBpbiBFZGdlIGFuZCBJRS5cbiAgICogMi4gQ29ycmVjdCB0aGUgY29sb3IgaW5oZXJpdGFuY2UgZnJvbSBcXGBmaWVsZHNldFxcYCBlbGVtZW50cyBpbiBJRS5cbiAgICogMy4gUmVtb3ZlIHRoZSBwYWRkaW5nIHNvIGRldmVsb3BlcnMgYXJlIG5vdCBjYXVnaHQgb3V0IHdoZW4gdGhleSB6ZXJvIG91dFxuICAgKiAgICBcXGBmaWVsZHNldFxcYCBlbGVtZW50cyBpbiBhbGwgYnJvd3NlcnMuXG4gICAqL1xuICBcbiAgbGVnZW5kIHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94OyAvKiAxICovXG4gICAgY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cbiAgICBkaXNwbGF5OiB0YWJsZTsgLyogMSAqL1xuICAgIG1heC13aWR0aDogMTAwJTsgLyogMSAqL1xuICAgIHBhZGRpbmc6IDA7IC8qIDMgKi9cbiAgICB3aGl0ZS1zcGFjZTogbm9ybWFsOyAvKiAxICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgdmVydGljYWwgYWxpZ25tZW50IGluIENocm9tZSwgRmlyZWZveCwgYW5kIE9wZXJhLlxuICAgKi9cbiAgXG4gIHByb2dyZXNzIHtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGRlZmF1bHQgdmVydGljYWwgc2Nyb2xsYmFyIGluIElFIDEwKy5cbiAgICovXG4gIFxuICB0ZXh0YXJlYSB7XG4gICAgb3ZlcmZsb3c6IGF1dG87XG4gIH1cbiAgXG4gIC8qKlxuICAgKiAxLiBBZGQgdGhlIGNvcnJlY3QgYm94IHNpemluZyBpbiBJRSAxMC5cbiAgICogMi4gUmVtb3ZlIHRoZSBwYWRkaW5nIGluIElFIDEwLlxuICAgKi9cbiAgXG4gIFt0eXBlPVwiY2hlY2tib3hcIl0sXG4gIFt0eXBlPVwicmFkaW9cIl0ge1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cbiAgICBwYWRkaW5nOiAwOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBDb3JyZWN0IHRoZSBjdXJzb3Igc3R5bGUgb2YgaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYnV0dG9ucyBpbiBDaHJvbWUuXG4gICAqL1xuICBcbiAgW3R5cGU9XCJudW1iZXJcIl06Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24sXG4gIFt0eXBlPVwibnVtYmVyXCJdOjotd2Via2l0LW91dGVyLXNwaW4tYnV0dG9uIHtcbiAgICBoZWlnaHQ6IGF1dG87XG4gIH1cbiAgXG4gIC8qKlxuICAgKiAxLiBDb3JyZWN0IHRoZSBvZGQgYXBwZWFyYW5jZSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cbiAgICogMi4gQ29ycmVjdCB0aGUgb3V0bGluZSBzdHlsZSBpbiBTYWZhcmkuXG4gICAqL1xuICBcbiAgW3R5cGU9XCJzZWFyY2hcIl0ge1xuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogdGV4dGZpZWxkOyAvKiAxICovXG4gICAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7IC8qIDIgKi9cbiAgfVxuICBcbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgaW5uZXIgcGFkZGluZyBpbiBDaHJvbWUgYW5kIFNhZmFyaSBvbiBtYWNPUy5cbiAgICovXG4gIFxuICBbdHlwZT1cInNlYXJjaFwiXTo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xuICB9XG4gIFxuICAvKipcbiAgICogMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cbiAgICogMi4gQ2hhbmdlIGZvbnQgcHJvcGVydGllcyB0byBcXGBpbmhlcml0XFxgIGluIFNhZmFyaS5cbiAgICovXG4gIFxuICA6Oi13ZWJraXQtZmlsZS11cGxvYWQtYnV0dG9uIHtcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjsgLyogMSAqL1xuICAgIGZvbnQ6IGluaGVyaXQ7IC8qIDIgKi9cbiAgfVxuICBcbiAgLyogSW50ZXJhY3RpdmVcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbiAgXG4gIC8qXG4gICAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIEVkZ2UsIElFIDEwKywgYW5kIEZpcmVmb3guXG4gICAqL1xuICBcbiAgZGV0YWlscyB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gIH1cbiAgXG4gIC8qXG4gICAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIGFsbCBicm93c2Vycy5cbiAgICovXG4gIFxuICBzdW1tYXJ5IHtcbiAgICBkaXNwbGF5OiBsaXN0LWl0ZW07XG4gIH1cbiAgXG4gIC8qIE1pc2NcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbiAgXG4gIC8qKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBJRSAxMCsuXG4gICAqL1xuICBcbiAgdGVtcGxhdGUge1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBJRSAxMC5cbiAgICovXG4gIFxuICBbaGlkZGVuXSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuICBgLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9jc3Mvbm9ybWFsaXplLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQSwyRUFBMkU7O0FBRTNFOytFQUMrRTs7QUFFL0U7OztFQUdFOztDQUVEO0lBQ0csaUJBQWlCLEVBQUUsTUFBTTtJQUN6Qiw4QkFBOEIsRUFBRSxNQUFNO0VBQ3hDOztFQUVBO2lGQUMrRTs7RUFFL0U7O0lBRUU7O0VBRUY7SUFDRSxTQUFTO0VBQ1g7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSxjQUFjO0VBQ2hCOztFQUVBOzs7SUFHRTs7RUFFRjtJQUNFLGNBQWM7SUFDZCxnQkFBZ0I7RUFDbEI7O0VBRUE7aUZBQytFOztFQUUvRTs7O0lBR0U7O0VBRUY7SUFDRSx1QkFBdUIsRUFBRSxNQUFNO0lBQy9CLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLGlCQUFpQixFQUFFLE1BQU07RUFDM0I7O0VBRUE7OztJQUdFOztFQUVGO0lBQ0UsaUNBQWlDLEVBQUUsTUFBTTtJQUN6QyxjQUFjLEVBQUUsTUFBTTtFQUN4Qjs7RUFFQTtpRkFDK0U7O0VBRS9FOztJQUVFOztFQUVGO0lBQ0UsNkJBQTZCO0VBQy9COztFQUVBOzs7SUFHRTs7RUFFRjtJQUNFLG1CQUFtQixFQUFFLE1BQU07SUFDM0IsMEJBQTBCLEVBQUUsTUFBTTtJQUNsQyxpQ0FBaUMsRUFBRSxNQUFNO0VBQzNDOztFQUVBOztJQUVFOztFQUVGOztJQUVFLG1CQUFtQjtFQUNyQjs7RUFFQTs7O0lBR0U7O0VBRUY7OztJQUdFLGlDQUFpQyxFQUFFLE1BQU07SUFDekMsY0FBYyxFQUFFLE1BQU07RUFDeEI7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSxjQUFjO0VBQ2hCOztFQUVBOzs7SUFHRTs7RUFFRjs7SUFFRSxjQUFjO0lBQ2QsY0FBYztJQUNkLGtCQUFrQjtJQUNsQix3QkFBd0I7RUFDMUI7O0VBRUE7SUFDRSxlQUFlO0VBQ2pCOztFQUVBO0lBQ0UsV0FBVztFQUNiOztFQUVBO2lGQUMrRTs7RUFFL0U7O0lBRUU7O0VBRUY7SUFDRSxrQkFBa0I7RUFDcEI7O0VBRUE7aUZBQytFOztFQUUvRTs7O0lBR0U7O0VBRUY7Ozs7O0lBS0Usb0JBQW9CLEVBQUUsTUFBTTtJQUM1QixlQUFlLEVBQUUsTUFBTTtJQUN2QixpQkFBaUIsRUFBRSxNQUFNO0lBQ3pCLFNBQVMsRUFBRSxNQUFNO0VBQ25COztFQUVBOzs7SUFHRTs7RUFFRjtVQUNRLE1BQU07SUFDWixpQkFBaUI7RUFDbkI7O0VBRUE7OztJQUdFOztFQUVGO1dBQ1MsTUFBTTtJQUNiLG9CQUFvQjtFQUN0Qjs7RUFFQTs7SUFFRTs7RUFFRjs7OztJQUlFLDBCQUEwQjtFQUM1Qjs7RUFFQTs7SUFFRTs7RUFFRjs7OztJQUlFLGtCQUFrQjtJQUNsQixVQUFVO0VBQ1o7O0VBRUE7O0lBRUU7O0VBRUY7Ozs7SUFJRSw4QkFBOEI7RUFDaEM7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSw4QkFBOEI7RUFDaEM7O0VBRUE7Ozs7O0lBS0U7O0VBRUY7SUFDRSxzQkFBc0IsRUFBRSxNQUFNO0lBQzlCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLGVBQWUsRUFBRSxNQUFNO0lBQ3ZCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLG1CQUFtQixFQUFFLE1BQU07RUFDN0I7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSx3QkFBd0I7RUFDMUI7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSxjQUFjO0VBQ2hCOztFQUVBOzs7SUFHRTs7RUFFRjs7SUFFRSxzQkFBc0IsRUFBRSxNQUFNO0lBQzlCLFVBQVUsRUFBRSxNQUFNO0VBQ3BCOztFQUVBOztJQUVFOztFQUVGOztJQUVFLFlBQVk7RUFDZDs7RUFFQTs7O0lBR0U7O0VBRUY7SUFDRSw2QkFBNkIsRUFBRSxNQUFNO0lBQ3JDLG9CQUFvQixFQUFFLE1BQU07RUFDOUI7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSx3QkFBd0I7RUFDMUI7O0VBRUE7OztJQUdFOztFQUVGO0lBQ0UsMEJBQTBCLEVBQUUsTUFBTTtJQUNsQyxhQUFhLEVBQUUsTUFBTTtFQUN2Qjs7RUFFQTtpRkFDK0U7O0VBRS9FOztJQUVFOztFQUVGO0lBQ0UsY0FBYztFQUNoQjs7RUFFQTs7SUFFRTs7RUFFRjtJQUNFLGtCQUFrQjtFQUNwQjs7RUFFQTtpRkFDK0U7O0VBRS9FOztJQUVFOztFQUVGO0lBQ0UsYUFBYTtFQUNmOztFQUVBOztJQUVFOztFQUVGO0lBQ0UsYUFBYTtFQUNmXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIi8qISBub3JtYWxpemUuY3NzIHY4LjAuMSB8IE1JVCBMaWNlbnNlIHwgZ2l0aHViLmNvbS9uZWNvbGFzL25vcm1hbGl6ZS5jc3MgKi9cXG5cXG4vKiBEb2N1bWVudFxcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuXFxuLyoqXFxuICogMS4gQ29ycmVjdCB0aGUgbGluZSBoZWlnaHQgaW4gYWxsIGJyb3dzZXJzLlxcbiAqIDIuIFByZXZlbnQgYWRqdXN0bWVudHMgb2YgZm9udCBzaXplIGFmdGVyIG9yaWVudGF0aW9uIGNoYW5nZXMgaW4gaU9TLlxcbiAqL1xcblxcbiBodG1sIHtcXG4gICAgbGluZS1oZWlnaHQ6IDEuMTU7IC8qIDEgKi9cXG4gICAgLXdlYmtpdC10ZXh0LXNpemUtYWRqdXN0OiAxMDAlOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qIFNlY3Rpb25zXFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcbiAgXFxuICAvKipcXG4gICAqIFJlbW92ZSB0aGUgbWFyZ2luIGluIGFsbCBicm93c2Vycy5cXG4gICAqL1xcbiAgXFxuICBib2R5IHtcXG4gICAgbWFyZ2luOiAwO1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIFJlbmRlciB0aGUgYG1haW5gIGVsZW1lbnQgY29uc2lzdGVudGx5IGluIElFLlxcbiAgICovXFxuICBcXG4gIG1haW4ge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBDb3JyZWN0IHRoZSBmb250IHNpemUgYW5kIG1hcmdpbiBvbiBgaDFgIGVsZW1lbnRzIHdpdGhpbiBgc2VjdGlvbmAgYW5kXFxuICAgKiBgYXJ0aWNsZWAgY29udGV4dHMgaW4gQ2hyb21lLCBGaXJlZm94LCBhbmQgU2FmYXJpLlxcbiAgICovXFxuICBcXG4gIGgxIHtcXG4gICAgZm9udC1zaXplOiAyZW07XFxuICAgIG1hcmdpbjogMC42N2VtIDA7XFxuICB9XFxuICBcXG4gIC8qIEdyb3VwaW5nIGNvbnRlbnRcXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuICBcXG4gIC8qKlxcbiAgICogMS4gQWRkIHRoZSBjb3JyZWN0IGJveCBzaXppbmcgaW4gRmlyZWZveC5cXG4gICAqIDIuIFNob3cgdGhlIG92ZXJmbG93IGluIEVkZ2UgYW5kIElFLlxcbiAgICovXFxuICBcXG4gIGhyIHtcXG4gICAgYm94LXNpemluZzogY29udGVudC1ib3g7IC8qIDEgKi9cXG4gICAgaGVpZ2h0OiAwOyAvKiAxICovXFxuICAgIG92ZXJmbG93OiB2aXNpYmxlOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogMS4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2UgYW5kIHNjYWxpbmcgb2YgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cXG4gICAqIDIuIENvcnJlY3QgdGhlIG9kZCBgZW1gIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cXG4gICAqL1xcbiAgXFxuICBwcmUge1xcbiAgICBmb250LWZhbWlseTogbW9ub3NwYWNlLCBtb25vc3BhY2U7IC8qIDEgKi9cXG4gICAgZm9udC1zaXplOiAxZW07IC8qIDIgKi9cXG4gIH1cXG4gIFxcbiAgLyogVGV4dC1sZXZlbCBzZW1hbnRpY3NcXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuICBcXG4gIC8qKlxcbiAgICogUmVtb3ZlIHRoZSBncmF5IGJhY2tncm91bmQgb24gYWN0aXZlIGxpbmtzIGluIElFIDEwLlxcbiAgICovXFxuICBcXG4gIGEge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBSZW1vdmUgdGhlIGJvdHRvbSBib3JkZXIgaW4gQ2hyb21lIDU3LVxcbiAgICogMi4gQWRkIHRoZSBjb3JyZWN0IHRleHQgZGVjb3JhdGlvbiBpbiBDaHJvbWUsIEVkZ2UsIElFLCBPcGVyYSwgYW5kIFNhZmFyaS5cXG4gICAqL1xcbiAgXFxuICBhYmJyW3RpdGxlXSB7XFxuICAgIGJvcmRlci1ib3R0b206IG5vbmU7IC8qIDEgKi9cXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IC8qIDIgKi9cXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogQWRkIHRoZSBjb3JyZWN0IGZvbnQgd2VpZ2h0IGluIENocm9tZSwgRWRnZSwgYW5kIFNhZmFyaS5cXG4gICAqL1xcbiAgXFxuICBiLFxcbiAgc3Ryb25nIHtcXG4gICAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBDb3JyZWN0IHRoZSBpbmhlcml0YW5jZSBhbmQgc2NhbGluZyBvZiBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxcbiAgICogMi4gQ29ycmVjdCB0aGUgb2RkIGBlbWAgZm9udCBzaXppbmcgaW4gYWxsIGJyb3dzZXJzLlxcbiAgICovXFxuICBcXG4gIGNvZGUsXFxuICBrYmQsXFxuICBzYW1wIHtcXG4gICAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZSwgbW9ub3NwYWNlOyAvKiAxICovXFxuICAgIGZvbnQtc2l6ZTogMWVtOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogQWRkIHRoZSBjb3JyZWN0IGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXFxuICAgKi9cXG4gIFxcbiAgc21hbGwge1xcbiAgICBmb250LXNpemU6IDgwJTtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBQcmV2ZW50IGBzdWJgIGFuZCBgc3VwYCBlbGVtZW50cyBmcm9tIGFmZmVjdGluZyB0aGUgbGluZSBoZWlnaHQgaW5cXG4gICAqIGFsbCBicm93c2Vycy5cXG4gICAqL1xcbiAgXFxuICBzdWIsXFxuICBzdXAge1xcbiAgICBmb250LXNpemU6IDc1JTtcXG4gICAgbGluZS1oZWlnaHQ6IDA7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbiAgfVxcbiAgXFxuICBzdWIge1xcbiAgICBib3R0b206IC0wLjI1ZW07XFxuICB9XFxuICBcXG4gIHN1cCB7XFxuICAgIHRvcDogLTAuNWVtO1xcbiAgfVxcbiAgXFxuICAvKiBFbWJlZGRlZCBjb250ZW50XFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcbiAgXFxuICAvKipcXG4gICAqIFJlbW92ZSB0aGUgYm9yZGVyIG9uIGltYWdlcyBpbnNpZGUgbGlua3MgaW4gSUUgMTAuXFxuICAgKi9cXG4gIFxcbiAgaW1nIHtcXG4gICAgYm9yZGVyLXN0eWxlOiBub25lO1xcbiAgfVxcbiAgXFxuICAvKiBGb3Jtc1xcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBDaGFuZ2UgdGhlIGZvbnQgc3R5bGVzIGluIGFsbCBicm93c2Vycy5cXG4gICAqIDIuIFJlbW92ZSB0aGUgbWFyZ2luIGluIEZpcmVmb3ggYW5kIFNhZmFyaS5cXG4gICAqL1xcbiAgXFxuICBidXR0b24sXFxuICBpbnB1dCxcXG4gIG9wdGdyb3VwLFxcbiAgc2VsZWN0LFxcbiAgdGV4dGFyZWEge1xcbiAgICBmb250LWZhbWlseTogaW5oZXJpdDsgLyogMSAqL1xcbiAgICBmb250LXNpemU6IDEwMCU7IC8qIDEgKi9cXG4gICAgbGluZS1oZWlnaHQ6IDEuMTU7IC8qIDEgKi9cXG4gICAgbWFyZ2luOiAwOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogU2hvdyB0aGUgb3ZlcmZsb3cgaW4gSUUuXFxuICAgKiAxLiBTaG93IHRoZSBvdmVyZmxvdyBpbiBFZGdlLlxcbiAgICovXFxuICBcXG4gIGJ1dHRvbixcXG4gIGlucHV0IHsgLyogMSAqL1xcbiAgICBvdmVyZmxvdzogdmlzaWJsZTtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBSZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEVkZ2UsIEZpcmVmb3gsIGFuZCBJRS5cXG4gICAqIDEuIFJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRmlyZWZveC5cXG4gICAqL1xcbiAgXFxuICBidXR0b24sXFxuICBzZWxlY3QgeyAvKiAxICovXFxuICAgIHRleHQtdHJhbnNmb3JtOiBub25lO1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXFxuICAgKi9cXG4gIFxcbiAgYnV0dG9uLFxcbiAgW3R5cGU9XFxcImJ1dHRvblxcXCJdLFxcbiAgW3R5cGU9XFxcInJlc2V0XFxcIl0sXFxuICBbdHlwZT1cXFwic3VibWl0XFxcIl0ge1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBSZW1vdmUgdGhlIGlubmVyIGJvcmRlciBhbmQgcGFkZGluZyBpbiBGaXJlZm94LlxcbiAgICovXFxuICBcXG4gIGJ1dHRvbjo6LW1vei1mb2N1cy1pbm5lcixcXG4gIFt0eXBlPVxcXCJidXR0b25cXFwiXTo6LW1vei1mb2N1cy1pbm5lcixcXG4gIFt0eXBlPVxcXCJyZXNldFxcXCJdOjotbW96LWZvY3VzLWlubmVyLFxcbiAgW3R5cGU9XFxcInN1Ym1pdFxcXCJdOjotbW96LWZvY3VzLWlubmVyIHtcXG4gICAgYm9yZGVyLXN0eWxlOiBub25lO1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIFJlc3RvcmUgdGhlIGZvY3VzIHN0eWxlcyB1bnNldCBieSB0aGUgcHJldmlvdXMgcnVsZS5cXG4gICAqL1xcbiAgXFxuICBidXR0b246LW1vei1mb2N1c3JpbmcsXFxuICBbdHlwZT1cXFwiYnV0dG9uXFxcIl06LW1vei1mb2N1c3JpbmcsXFxuICBbdHlwZT1cXFwicmVzZXRcXFwiXTotbW96LWZvY3VzcmluZyxcXG4gIFt0eXBlPVxcXCJzdWJtaXRcXFwiXTotbW96LWZvY3VzcmluZyB7XFxuICAgIG91dGxpbmU6IDFweCBkb3R0ZWQgQnV0dG9uVGV4dDtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBDb3JyZWN0IHRoZSBwYWRkaW5nIGluIEZpcmVmb3guXFxuICAgKi9cXG4gIFxcbiAgZmllbGRzZXQge1xcbiAgICBwYWRkaW5nOiAwLjM1ZW0gMC43NWVtIDAuNjI1ZW07XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogMS4gQ29ycmVjdCB0aGUgdGV4dCB3cmFwcGluZyBpbiBFZGdlIGFuZCBJRS5cXG4gICAqIDIuIENvcnJlY3QgdGhlIGNvbG9yIGluaGVyaXRhbmNlIGZyb20gYGZpZWxkc2V0YCBlbGVtZW50cyBpbiBJRS5cXG4gICAqIDMuIFJlbW92ZSB0aGUgcGFkZGluZyBzbyBkZXZlbG9wZXJzIGFyZSBub3QgY2F1Z2h0IG91dCB3aGVuIHRoZXkgemVybyBvdXRcXG4gICAqICAgIGBmaWVsZHNldGAgZWxlbWVudHMgaW4gYWxsIGJyb3dzZXJzLlxcbiAgICovXFxuICBcXG4gIGxlZ2VuZCB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cXG4gICAgY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cXG4gICAgZGlzcGxheTogdGFibGU7IC8qIDEgKi9cXG4gICAgbWF4LXdpZHRoOiAxMDAlOyAvKiAxICovXFxuICAgIHBhZGRpbmc6IDA7IC8qIDMgKi9cXG4gICAgd2hpdGUtc3BhY2U6IG5vcm1hbDsgLyogMSAqL1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIEFkZCB0aGUgY29ycmVjdCB2ZXJ0aWNhbCBhbGlnbm1lbnQgaW4gQ2hyb21lLCBGaXJlZm94LCBhbmQgT3BlcmEuXFxuICAgKi9cXG4gIFxcbiAgcHJvZ3Jlc3Mge1xcbiAgICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogUmVtb3ZlIHRoZSBkZWZhdWx0IHZlcnRpY2FsIHNjcm9sbGJhciBpbiBJRSAxMCsuXFxuICAgKi9cXG4gIFxcbiAgdGV4dGFyZWEge1xcbiAgICBvdmVyZmxvdzogYXV0bztcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBBZGQgdGhlIGNvcnJlY3QgYm94IHNpemluZyBpbiBJRSAxMC5cXG4gICAqIDIuIFJlbW92ZSB0aGUgcGFkZGluZyBpbiBJRSAxMC5cXG4gICAqL1xcbiAgXFxuICBbdHlwZT1cXFwiY2hlY2tib3hcXFwiXSxcXG4gIFt0eXBlPVxcXCJyYWRpb1xcXCJdIHtcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xcbiAgICBwYWRkaW5nOiAwOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogQ29ycmVjdCB0aGUgY3Vyc29yIHN0eWxlIG9mIGluY3JlbWVudCBhbmQgZGVjcmVtZW50IGJ1dHRvbnMgaW4gQ2hyb21lLlxcbiAgICovXFxuICBcXG4gIFt0eXBlPVxcXCJudW1iZXJcXFwiXTo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbixcXG4gIFt0eXBlPVxcXCJudW1iZXJcXFwiXTo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiB7XFxuICAgIGhlaWdodDogYXV0bztcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBDb3JyZWN0IHRoZSBvZGQgYXBwZWFyYW5jZSBpbiBDaHJvbWUgYW5kIFNhZmFyaS5cXG4gICAqIDIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxcbiAgICovXFxuICBcXG4gIFt0eXBlPVxcXCJzZWFyY2hcXFwiXSB7XFxuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogdGV4dGZpZWxkOyAvKiAxICovXFxuICAgIG91dGxpbmUtb2Zmc2V0OiAtMnB4OyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogUmVtb3ZlIHRoZSBpbm5lciBwYWRkaW5nIGluIENocm9tZSBhbmQgU2FmYXJpIG9uIG1hY09TLlxcbiAgICovXFxuICBcXG4gIFt0eXBlPVxcXCJzZWFyY2hcXFwiXTo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XFxuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiAxLiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxcbiAgICogMi4gQ2hhbmdlIGZvbnQgcHJvcGVydGllcyB0byBgaW5oZXJpdGAgaW4gU2FmYXJpLlxcbiAgICovXFxuICBcXG4gIDo6LXdlYmtpdC1maWxlLXVwbG9hZC1idXR0b24ge1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjsgLyogMSAqL1xcbiAgICBmb250OiBpbmhlcml0OyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qIEludGVyYWN0aXZlXFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcbiAgXFxuICAvKlxcbiAgICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gRWRnZSwgSUUgMTArLCBhbmQgRmlyZWZveC5cXG4gICAqL1xcbiAgXFxuICBkZXRhaWxzIHtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICB9XFxuICBcXG4gIC8qXFxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBhbGwgYnJvd3NlcnMuXFxuICAgKi9cXG4gIFxcbiAgc3VtbWFyeSB7XFxuICAgIGRpc3BsYXk6IGxpc3QtaXRlbTtcXG4gIH1cXG4gIFxcbiAgLyogTWlzY1xcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4gIFxcbiAgLyoqXFxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBJRSAxMCsuXFxuICAgKi9cXG4gIFxcbiAgdGVtcGxhdGUge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIElFIDEwLlxcbiAgICovXFxuICBcXG4gIFtoaWRkZW5dIHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG4gIFwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2NvbnRhY3RwYWdlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vY29udGFjdHBhZ2UuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2hvbWVwYWdlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vaG9tZXBhZ2UuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2luZGV4LmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vaW5kZXguY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL21lbnVwYWdlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vbWVudXBhZ2UuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL25vcm1hbGl6ZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL25vcm1hbGl6ZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdXBkYXRlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuICBjc3MgKz0gb2JqLmNzcztcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfVxuXG4gIC8vIEZvciBvbGQgSUVcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiB7XG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHt9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH1cbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsImltcG9ydCBhbmltYXRlIGZyb20gXCIvbm9kZV9tb2R1bGVzL2FuaW1hdGVwbHVzL2FuaW1hdGVwbHVzLmpzXCI7XG5cbmZ1bmN0aW9uIGNvbnRhY3RBbmltYXRpb24oKXtcbiAgICBsZXQgYWxsRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250YWN0UGFnZVwiKS5jaGlsZE5vZGVzO1xuICAgIGFsbERpdiA9IEFycmF5LmZyb20oYWxsRGl2KTtcbiAgICBhbGxEaXYuc3BsaWNlKDEsMSk7XG4gICAgYWxsRGl2LnNwbGljZSgyLDEpO1xuXG4gICAgbGV0IGNvbnRhY3RzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51XCIpLmNoaWxkTm9kZXM7XG4gICAgY29udGFjdHMgPSBBcnJheS5mcm9tKGNvbnRhY3RzKTtcblxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogYWxsRGl2WzBdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGVZKC0yMDAlKVwiLCBcInRyYW5zbGF0ZVkoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGNvbnRhY3RzWzBdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJza2V3WCgxODBkZWcpXCIsIFwic2tld1goMGRlZylcIl1cbiAgICB9KVxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogY29udGFjdHNbMl0sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInNrZXdYKDE4MGRlZylcIiwgXCJza2V3WCgwZGVnKVwiXVxuICAgIH0pXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBjb250YWN0c1szXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1wic2tld1goMTgwZGVnKVwiLCBcInNrZXdYKDBkZWcpXCJdXG4gICAgfSlcblxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogYWxsRGl2WzJdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGVZKDE1MCUpXCIsIFwidHJhbnNsYXRlKDAlKVwiXVxuICAgIH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbnRhY3RBbmltYXRpb24iLCJpbXBvcnQgYW5pbWF0ZSBmcm9tIFwiL25vZGVfbW9kdWxlcy9hbmltYXRlcGx1cy9hbmltYXRlcGx1cy5qc1wiO1xuXG5mdW5jdGlvbiBhbmltYXRpb24oKXtcbiAgICBsZXQgYWxsRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ob21lUGFnZVwiKS5jaGlsZE5vZGVzXG4gICAgYWxsRGl2ID0gQXJyYXkuZnJvbShhbGxEaXYpXG4gICAgYWxsRGl2LnNwbGljZSgxLDEpXG4gICAgYWxsRGl2LnNwbGljZSgzLDEpXG4gICAgXG4gICAgbGV0IGNhcmRzID0gYWxsRGl2WzJdLmNoaWxkTm9kZXNcbiAgICBjYXJkcyA9IEFycmF5LmZyb20oY2FyZHMpXG5cbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGFsbERpdlswXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiB7aW5kZXggKiAxMDB9LCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGVZKC0yMDAlKVwiLCBcInRyYW5zbGF0ZVkoMCUpXCJdXG4gICAgfSlcbiAgICAgICAgXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBhbGxEaXZbMV0sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInNjYWxlKDApXCIsIFwic2NhbGUoMSlcIl1cbiAgICB9KVxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogY2FyZHNbMV0sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInNjYWxlKDApXCIsIFwic2NhbGUoMSlcIl1cbiAgICB9KVxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogY2FyZHNbMF0sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInRyYW5zbGF0ZSgtMTAwJSlcIiwgXCJ0cmFuc2xhdGUoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGNhcmRzWzJdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGUoMTAwJSlcIiwgXCJ0cmFuc2xhdGUoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGFsbERpdlszXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlWSgxNTAlKVwiLCBcInRyYW5zbGF0ZSgwJSlcIl1cbiAgICB9KVxufVxuXG5leHBvcnQgZGVmYXVsdCBhbmltYXRpb247XG4iLCJpbXBvcnQgYW5pbWF0ZSBmcm9tIFwiL25vZGVfbW9kdWxlcy9hbmltYXRlcGx1cy9hbmltYXRlcGx1cy5qc1wiO1xuXG5mdW5jdGlvbiBtZW51QW5pbWF0aW9uKCl7XG4gICAgbGV0IGFsbERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVudVBhZ2VcIikuY2hpbGROb2RlcztcbiAgICBhbGxEaXYgPSBBcnJheS5mcm9tKGFsbERpdik7XG4gICAgYWxsRGl2LnNwbGljZSgxLDEpXG4gICAgYWxsRGl2LnNwbGljZSgyLDEpXG4gICAgXG4gICAgbGV0IHBhc3RyeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGFzdHJ5XCIpLmNoaWxkTm9kZXM7XG4gICAgcGFzdHJ5ID0gQXJyYXkuZnJvbShwYXN0cnkpO1xuICAgIGxldCBkZXNlcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRlc2VydFwiKS5jaGlsZE5vZGVzO1xuICAgIGRlc2VydCA9IEFycmF5LmZyb20oZGVzZXJ0KTtcbiAgICBsZXQgZHJpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRyaW5rXCIpLmNoaWxkTm9kZXM7XG4gICAgZHJpbmsgPSBBcnJheS5mcm9tKGRyaW5rKTtcblxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogYWxsRGl2WzBdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGVZKC0yMDAlKVwiLCBcInRyYW5zbGF0ZVkoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGFsbERpdlsyXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlWSgxNTAlKVwiLCBcInRyYW5zbGF0ZSgwJSlcIl1cbiAgICB9KVxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogcGFzdHJ5LFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLFxuICAgICAgICB0cmFuc2Zvcm06IFtcInRyYW5zbGF0ZSgtMTAwJSlcIiwgXCJ0cmFuc2xhdGUoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGRlc2VydCxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCxcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGUoLTEwMCUpXCIsIFwidHJhbnNsYXRlKDAlKVwiXVxuICAgIH0pXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBkcmluayxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCxcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGUoLTEwMCUpXCIsIFwidHJhbnNsYXRlKDAlKVwiXVxuICAgIH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IG1lbnVBbmltYXRpb247IiwiaW1wb3J0IHsgbmF2aWdhdGlvbk5hbWUgfSBmcm9tIFwiLi9ob21lcGFnZVwiO1xuaW1wb3J0IFwiLi4vY3NzL2NvbnRhY3RwYWdlLmNzc1wiXG5pbXBvcnQgcGhvbmUgZnJvbSBcIi9pbWFnZXMvcGhvbmUuc3ZnXCJcbmltcG9ydCBzdG9yZSBmcm9tIFwiL2ltYWdlcy9zdG9yZS5zdmdcIlxuaW1wb3J0IGZvb3RlciBmcm9tIFwiLi9mb290ZXJcIjtcbmltcG9ydCBjb250YWN0QW5pbWF0aW9uIGZyb20gXCIuLi9hbmltYXRpb24vYW5pbWF0ZUNvbnRhY3RQYWdlXCI7XG5cblxuZnVuY3Rpb24gY29udGFjdHBhZ2UoKXtcbiAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuXG4gICAgY29uc3QgY29udGFjdFBhZ2VDb25lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhY3RQYWdlQ29uZW50LmNsYXNzTGlzdC5hZGQoXCJjb250YWN0UGFnZVwiKTtcbiAgICBcbiAgICAvKiBuYXZpZ2F0aW9uICovXG4gICAgY29uc3QgbmF2aWdhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmF2aWdhdGlvbi5jbGFzc0xpc3QuYWRkKFwibmF2aWdhdGlvblwiKTtcbiAgICBcbiAgICBuYXZpZ2F0aW9uTmFtZShcIkhvbWVcIiwgbmF2aWdhdGlvbik7XG4gICAgbmF2aWdhdGlvbk5hbWUoXCJNZW51XCIsIG5hdmlnYXRpb24pO1xuICAgIG5hdmlnYXRpb25OYW1lKFwiQ29udGFjdFwiLCBuYXZpZ2F0aW9uKTtcblxuICAgIGNvbnRhY3RQYWdlQ29uZW50LmFwcGVuZENoaWxkKG5hdmlnYXRpb24pO1xuICAgIGNvbnRhY3RQYWdlQ29uZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoclwiKSk7XG4gICAgXG4gICAgLyogb3V0ZXIgbG9heW91dCAqL1xuICAgIGxldCBvdXRlck1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG91dGVyTWVudS5jbGFzc0xpc3QuYWRkKFwib3V0ZXJNZW51XCIpO1xuICAgIGxldCBtZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtZW51LmNsYXNzTGlzdC5hZGQoXCJtZW51XCIpO1xuXG4gICAgLyogY29udGFjdHMgKi9cbiAgICBtZW51LmFwcGVuZENoaWxkKGNvbnRhY3RzKFwiNjY2NjYgOTk5OTkgLyA5OTk5OSA2NjY2NlwiLCBwaG9uZSkpO1xuICAgIG1lbnUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpKVxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoY29udGFjdHMoXCJMZXMgSGFsbGVzIENhc3RlbGxhbmVzLCBSdWUgZGUgbCdIZXJiZXJpZSwgMzQwMDAgTW9udHBlbGxpZXIsIEZyYW5jZVwiLCBzdG9yZSkpXG4gICAgXG4gICAgLyogbWFwcyAqL1xuICAgIGxldCBtYXBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKTtcbiAgICBtYXBzLmNsYXNzTGlzdC5hZGQoXCJtYXBzXCIpXG4gICAgbWFwcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgXCJodHRwczovL3d3dy5nb29nbGUuY29tL21hcHMvZW1iZWQ/cGI9ITFtMTghMW0xMiExbTMhMWQyODg4LjgyNjEyNTU4NTk0NDchMmQzLjg3MTkzNzg5MzAxNjE4MSEzZDQzLjYxMDE2MTc4MDcxNTUzNiEybTMhMWYwITJmMCEzZjAhM20yITFpMTAyNCEyaTc2OCE0ZjEzLjEhM20zITFtMiExczB4MTJiNmFmZWU4YjAyMzQ1MSUzQTB4MzQ5NDBlZjk0MjVmMjkyITJ6UTNMRHFHMWxJR1JsSUd4aElFTnl3Nmh0WlEhNWUwITNtMiExc2VuITJzaW4hNHYxNjk1NjYyODExNjcyITVtMiExc2VuITJzaW5cIilcbiAgICBtYXBzLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFwiNjAwXCIpO1xuICAgIG1hcHMuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiNDAwXCIpO1xuICAgIG1hcHMuc2V0QXR0cmlidXRlKFwibG9hZGluZ1wiLCBcImxhenlcIik7XG4gICAgbWFwcy5zZXRBdHRyaWJ1dGUoXCJyZWZlcnJlcnBvbGljeVwiLCBcIm5vLXJlZmVycmVyLXdoZW4tZG93bmdyYWRlXCIpO1xuICAgIG1hcHMuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgXCJib3JkZXI6MnB4IHNvbGlkIGJsYWNrO2JvcmRlci1yYWRpdXM6NXB4XCIpXG4gICAgbWVudS5hcHBlbmRDaGlsZChtYXBzKTtcblxuXG4gICAgb3V0ZXJNZW51LmFwcGVuZENoaWxkKG1lbnUpO1xuICAgIGNvbnRhY3RQYWdlQ29uZW50LmFwcGVuZENoaWxkKG91dGVyTWVudSk7XG4gICAgY29udGFjdFBhZ2VDb25lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpKVxuICAgIGNvbnRhY3RQYWdlQ29uZW50LmFwcGVuZENoaWxkKGZvb3RlcigpKTtcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKGNvbnRhY3RQYWdlQ29uZW50KTtcblxuICAgIGNvbnRhY3RBbmltYXRpb24oKTtcbn1cblxuXG5mdW5jdGlvbiBjb250YWN0cyhudW1iZXIsIGltZyl7XG4gICAgbGV0IGNvbnRhY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGxldCBjb250YWN0SW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICBjb250YWN0SW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCBpbWcpO1xuICAgIGxldCBjb250YWN0TnVtYmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb250YWN0TnVtYmVyLnRleHRDb250ZW50ID0gbnVtYmVyO1xuXG4gICAgY29udGFjdC5hcHBlbmRDaGlsZChjb250YWN0SW1nKTtcbiAgICBjb250YWN0LmFwcGVuZENoaWxkKGNvbnRhY3ROdW1iZXIpO1xuICAgIHJldHVybiBjb250YWN0XG59XG5leHBvcnQgZGVmYXVsdCBjb250YWN0cGFnZTsiLCJpbXBvcnQgZ2l0aHViIGZyb20gIFwiL2ltYWdlcy9naXRodWIuc3ZnXCJcblxuZnVuY3Rpb24gZm9vdGVyKCkge1xuICAgIGxldCBtYWluRm9vdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtYWluRm9vdGVyLmNsYXNzTGlzdC5hZGQoXCJmb290ZXJcIik7XG5cbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYudGV4dENvbnRlbnQgPSBcIk1hZGUgYnkgQWRoaXRoaXlhblwiO1xuICAgIG1haW5Gb290ZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgIGxldCBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcImh0dHBzOi8vZ2l0aHViLmNvbS94QWRoaXRoaXlhblwiKTtcbiAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwidGFyZ2V0XCIsIFwiX2JsYW5rXCIpO1xuICAgIGxldCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgZ2l0aHViKVxuXG5cblxuICAgIGFuY2hvci5hcHBlbmRDaGlsZChpbWcpXG4gICAgbWFpbkZvb3Rlci5hcHBlbmRDaGlsZChhbmNob3IpO1xuICAgIHJldHVybiBtYWluRm9vdGVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmb290ZXI7IiwiaW1wb3J0IGhvbWVwYWdlQ2FyZHMgZnJvbSBcIi4vaG9tZXBhZ2VDYXJkc1wiO1xuaW1wb3J0IGZvb3RlciBmcm9tIFwiLi9mb290ZXJcIjtcbmltcG9ydCBcIi4uL2Nzcy9ob21lcGFnZS5jc3NcIlxuaW1wb3J0IGxvZ28gZnJvbSBcIi9pbWFnZXMvbG9nby5qcGVnXCJcbmltcG9ydCBhbmltYXRpb24gZnJvbSBcIi4uL2FuaW1hdGlvbi9hbmltYXRlSG9tZVBhZ2VcIjtcblxuZnVuY3Rpb24gaG9tZXBhZ2UoKXtcbiAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuICAgIGNvbnN0IGhvbWVQYWdlQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaG9tZVBhZ2VDb250ZW50LmNsYXNzTGlzdC5hZGQoXCJob21lUGFnZVwiKTtcblxuXG4gICAgLyogbmF2aWdhdGlvbiAqL1xuICAgIGNvbnN0IG5hdmlnYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG5hdmlnYXRpb24uY2xhc3NMaXN0LmFkZChcIm5hdmlnYXRpb25cIik7XG4gICAgXG4gICAgbmF2aWdhdGlvbk5hbWUoXCJIb21lXCIsIG5hdmlnYXRpb24pO1xuICAgIG5hdmlnYXRpb25OYW1lKFwiTWVudVwiLCBuYXZpZ2F0aW9uKTtcbiAgICBuYXZpZ2F0aW9uTmFtZShcIkNvbnRhY3RcIiwgbmF2aWdhdGlvbik7XG5cbiAgICBob21lUGFnZUNvbnRlbnQuYXBwZW5kQ2hpbGQobmF2aWdhdGlvbik7XG4gICAgaG9tZVBhZ2VDb250ZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoclwiKSk7XG5cblxuICAgIC8qIGhlYWRpbmcgKi9cbiAgICBsZXQgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaGVhZGluZy5jbGFzc0xpc3QuYWRkKFwiaGVhZGluZ1wiKTtcblxuICAgIGxldCBoZWFkaW5nTmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgaGVhZGluZ05hbWUuc2V0QXR0cmlidXRlKFwic3JjXCIsIGxvZ28pXG4gICAgbGV0IHN1YkhlYWRpbmdOYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgIHN1YkhlYWRpbmdOYW1lLnRleHRDb250ZW50ID0gXCJTaW5jZSAxOTI3XCJcbiAgICBcbiAgICBoZWFkaW5nLmFwcGVuZENoaWxkKGhlYWRpbmdOYW1lKTtcbiAgICBoZWFkaW5nLmFwcGVuZENoaWxkKHN1YkhlYWRpbmdOYW1lKVxuICAgIGhvbWVQYWdlQ29udGVudC5hcHBlbmRDaGlsZChoZWFkaW5nKTtcblxuICAgIC8qIGNhcmRzICovXG4gICAgbGV0IG1haW5DYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtYWluQ2FyZC5jbGFzc0xpc3QuYWRkKFwibWFpbkNhcmRcIik7XG4gICAgaG9tZXBhZ2VDYXJkcyhtYWluQ2FyZCwgXCJUaGUgTmV3IFlvcmsgVGltZXNcIiAsNSAsIFwiXFxcIkluIHRoZSBoZWFydCBvZiB0aGUgY2l0eSB0aGF0IG5ldmVyIHNsZWVwcywgdGhpcyBwYXN0cnkgcmVzdGF1cmFudCBpcyBhIGJlYWNvbiBvZiBzd2VldG5lc3MuIEl0cyBlbGVnYW50IHBhc3RyaWVzIGFuZCBjYWtlcyBhcmUgYSB0cnVlIGN1bGluYXJ5IG1hc3RlcnBpZWNlLCBlbGV2YXRpbmcgZGVzc2VydCB0byBhbiBhcnQgZm9ybS5cXFwiXCIpO1xuICAgIGhvbWVwYWdlQ2FyZHMobWFpbkNhcmQsIFwiRm9vZCAmIFdpbmUgTWFnYXppbmVcIiAsNSAsICBcIlxcXCJUaGlzIHBhc3RyeSBoYXZlbiBpcyBhIG11c3QtdmlzaXQgZm9yIGFueW9uZSBzZWVraW5nIGFuIHVuZm9yZ2V0dGFibGUgZGVzc2VydCBleHBlcmllbmNlLiBFYWNoIGJpdGUgaXMgYSBzeW1waG9ueSBvZiBmbGF2b3JzIGFuZCB0ZXh0dXJlcywgc2V0dGluZyBhIG5ldyBzdGFuZGFyZCBmb3IgcGFzdHJ5IGV4Y2VsbGVuY2UuXFxcIlwiKTtcbiAgICBob21lcGFnZUNhcmRzKG1haW5DYXJkLCBcIlRoZSBNaWNoZWxpbiBHdWlkZVwiLDQgLCAgXCJcXFwiRWFybmluZyBvdXIgY292ZXRlZCBzdGFyLCB0aGlzIHBhc3RyeSByZXN0YXVyYW50IGlzIGEgZGVzdGluYXRpb24gZm9yIHRob3NlIHNlZWtpbmcgcmVmaW5lZCwgZXhxdWlzaXRlIGRlc3NlcnRzLiBXaXRoIGltcGVjY2FibGUgY3JhZnRzbWFuc2hpcCBhbmQgYSBkZWRpY2F0aW9uIHRvIHF1YWxpdHksIGl0J3MgYSBzd2VldCByZXZlbGF0aW9uIGZvciBkaXNjZXJuaW5nIHBhbGF0ZXMuXFxcIlwiKTtcbiAgICBob21lUGFnZUNvbnRlbnQuYXBwZW5kQ2hpbGQobWFpbkNhcmQpO1xuXG4gICAgaG9tZVBhZ2VDb250ZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoclwiKSk7XG4gICAgLyogZm9vdGVyICovXG4gICAgaG9tZVBhZ2VDb250ZW50LmFwcGVuZENoaWxkKGZvb3RlcigpKVxuICAgIFxuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoaG9tZVBhZ2VDb250ZW50KVxuICAgIGFuaW1hdGlvbigpO1xufVxuXG5mdW5jdGlvbiBuYXZpZ2F0aW9uTmFtZShzdHIgLCBuYXZpZ2F0aW9uKXtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBsZXQgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBidG4udGV4dENvbnRlbnQgPSBzdHI7XG4gICAgZGl2LmFwcGVuZENoaWxkKGJ0bilcbiAgICBuYXZpZ2F0aW9uLmFwcGVuZENoaWxkKGRpdik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvbWVwYWdlO1xuZXhwb3J0IHtuYXZpZ2F0aW9uTmFtZX07XG4iLCJpbXBvcnQgc3RhciBmcm9tIFwiL2ltYWdlcy9zdGFyLnN2Z1wiXG5cbmZ1bmN0aW9uIGhvbWVwYWdlQ2FyZHMobWFpbkNhcmQsIHRpdGxlLCBuLCB0ZXh0KXtcbiAgICBsZXQgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY2FyZC5jbGFzc0xpc3QuYWRkKFwiY2FyZFwiKTtcblxuICAgIGxldCBpbWdEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IG47IGkrKyl7XG4gICAgICAgIGxldCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICBpbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHN0YXIpO1xuICAgICAgICBpbWdEaXYuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICB9XG4gICAgY2FyZC5hcHBlbmRDaGlsZChpbWdEaXYpXG5cbiAgICBsZXQgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaGVhZGluZy50ZXh0Q29udGVudCA9IHRpdGxlO1xuICAgIGNhcmQuYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG5cbiAgICBsZXQgcmV2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICByZXZpZXcudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgIGNhcmQuYXBwZW5kQ2hpbGQocmV2aWV3KTtcblxuICAgIG1haW5DYXJkLmFwcGVuZENoaWxkKGNhcmQpXG5cbiAgICBcbiAgICBcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG9tZXBhZ2VDYXJkczsiLCJpbXBvcnQgeyBuYXZpZ2F0aW9uTmFtZSB9IGZyb20gXCIuL2hvbWVwYWdlXCI7XG5pbXBvcnQgXCIuLi9jc3MvbWVudXBhZ2UuY3NzXCJcbmltcG9ydCBmb290ZXIgZnJvbSBcIi4vZm9vdGVyXCI7XG5pbXBvcnQgbWVudUFuaW1hdGlvbiBmcm9tIFwiLi4vYW5pbWF0aW9uL2FuaW1hdGlvbk1lbnVQYWdlXCI7XG5pbXBvcnQgcGFzdHJ5MSBmcm9tIFwiL2ltYWdlcy9wYXN0cnktMS5qcGdcIlxuaW1wb3J0IHBhc3RyeTIgZnJvbSBcIi9pbWFnZXMvcGFzdHJ5LTIuanBnXCJcbmltcG9ydCBwYXN0cnkzIGZyb20gXCIvaW1hZ2VzL3Bhc3RyeS0zLmpwZ1wiXG5pbXBvcnQgZGVzZXJ0MSBmcm9tIFwiL2ltYWdlcy9kZXNlcnQtMS5qcGdcIlxuaW1wb3J0IGRlc2VydDIgZnJvbSBcIi9pbWFnZXMvZGVzZXJ0LTIuanBnXCJcbmltcG9ydCBkZXNlcnQzIGZyb20gXCIvaW1hZ2VzL2Rlc2VydC0zLmpwZ1wiXG5pbXBvcnQgZGVzZXJ0NCBmcm9tIFwiL2ltYWdlcy9kZXNlcnQtNC5qcGdcIlxuaW1wb3J0IGRlc2VydDUgZnJvbSBcIi9pbWFnZXMvZGVzZXJ0LTUuanBnXCJcbmltcG9ydCBkcmluazEgZnJvbSBcIi9pbWFnZXMvZHJpbmstMS5qcGdcIlxuaW1wb3J0IGRyaW5rMiBmcm9tIFwiL2ltYWdlcy9kcmluay0yLmpwZ1wiXG5pbXBvcnQgZHJpbmszIGZyb20gXCIvaW1hZ2VzL2RyaW5rLTMuanBnXCJcbmltcG9ydCBkcmluazQgZnJvbSBcIi9pbWFnZXMvZHJpbmstNC5qcGdcIlxuaW1wb3J0IGRyaW5rNSBmcm9tIFwiL2ltYWdlcy9kcmluay01LmpwZ1wiXG5cbmZ1bmN0aW9uIG1lbnVwYWdlKCl7XG4gICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcblxuICAgIGNvbnN0IG1lbnVQYWdlQ29uZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtZW51UGFnZUNvbmVudC5jbGFzc0xpc3QuYWRkKFwibWVudVBhZ2VcIik7XG4gICAgXG4gICAgLyogbmF2aWdhdGlvbiAqL1xuICAgIGNvbnN0IG5hdmlnYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG5hdmlnYXRpb24uY2xhc3NMaXN0LmFkZChcIm5hdmlnYXRpb25cIik7XG4gICAgXG4gICAgbmF2aWdhdGlvbk5hbWUoXCJIb21lXCIsIG5hdmlnYXRpb24pO1xuICAgIG5hdmlnYXRpb25OYW1lKFwiTWVudVwiLCBuYXZpZ2F0aW9uKTtcbiAgICBuYXZpZ2F0aW9uTmFtZShcIkNvbnRhY3RcIiwgbmF2aWdhdGlvbik7XG5cbiAgICBtZW51UGFnZUNvbmVudC5hcHBlbmRDaGlsZChuYXZpZ2F0aW9uKTtcbiAgICBtZW51UGFnZUNvbmVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaHJcIikpO1xuXG4gICAgbGV0IG91dGVyTWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgb3V0ZXJNZW51LmNsYXNzTGlzdC5hZGQoXCJvdXRlck1lbnVcIik7XG4gICAgbGV0IG1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG1lbnUuY2xhc3NMaXN0LmFkZChcIm1lbnVcIik7XG5cbiAgICAvKiB0aXRsZSAqL1xuICAgIGxldCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdGl0bGUuY2xhc3NMaXN0LmFkZChcInRpdGxlXCIpO1xuICAgIGxldCBkaXYxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYxLnRleHRDb250ZW50ID0gXCJUSEVcIjtcbiAgICBsZXQgZGl2MiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2Mi50ZXh0Q29udGVudCA9IFwiTUVOVVwiO1xuICAgIHRpdGxlLmFwcGVuZENoaWxkKGRpdjEpO1xuICAgIHRpdGxlLmFwcGVuZENoaWxkKGRpdjIpO1xuICAgIHRpdGxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoclwiKSk7XG5cbiAgICAvKiBzZWN0aW9uLTEgKi9cbiAgICBsZXQgcGFzdHJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlY3Rpb25cIik7XG4gICAgcGFzdHJ5LmNsYXNzTGlzdC5hZGQoXCJwYXN0cnlcIik7XG4gICAgbGV0IHBhc3RyeVRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBwYXN0cnlUaXRsZS50ZXh0Q29udGVudCA9IFwiUGFzdHJpZXNcIjtcbiAgICBwYXN0cnkuYXBwZW5kQ2hpbGQocGFzdHJ5VGl0bGUpO1xuICAgIHBhc3RyeS5hcHBlbmRDaGlsZChmb29kKHBhc3RyeTEsIFwiUGFpbiBhdSBDaG9jb2xhdFwiLCBcIiQxNVwiKSk7XG4gICAgcGFzdHJ5LmFwcGVuZENoaWxkKGZvb2QocGFzdHJ5MiwgXCJDaGF1c3NvbiBhdXggUG9tbWVzXCIsIFwiJDE1XCIpKTtcbiAgICBwYXN0cnkuYXBwZW5kQ2hpbGQoZm9vZChwYXN0cnkzLCBcIlBhaW4gYXV4IFJhaXNpbnNcIiwgXCIkMTBcIikpO1xuXG4gICAgLyogc2VjdGlvbiAyICovXG4gICAgbGV0IGRlc2VydCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWN0aW9uXCIpO1xuICAgIGRlc2VydC5jbGFzc0xpc3QuYWRkKFwiZGVzZXJ0XCIpO1xuICAgIGxldCBkZXNlclRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkZXNlclRpdGxlLnRleHRDb250ZW50ID0gXCJEZXNlcnRzXCI7XG4gICAgZGVzZXJ0LmFwcGVuZENoaWxkKGRlc2VyVGl0bGUpO1xuICAgIGRlc2VydC5hcHBlbmRDaGlsZChmb29kKGRlc2VydDEsIFwiQ3LDqG1lIEJyw7tsw6llXCIsIFwiJDEyXCIpKTtcbiAgICBkZXNlcnQuYXBwZW5kQ2hpbGQoZm9vZChkZXNlcnQyLCBcIlRhcnRlIFRhdGluXCIsIFwiJDEyXCIpKTtcbiAgICBkZXNlcnQuYXBwZW5kQ2hpbGQoZm9vZChkZXNlcnQzLCBcIk1vdXNzZSBhdSBDaG9jb2xhdFwiLCBcIiQyMFwiKSk7XG4gICAgZGVzZXJ0LmFwcGVuZENoaWxkKGZvb2QoZGVzZXJ0NCwgXCJUYXJ0ZSBhdXggRnJhaXNlc1wiLCBcIiQxNVwiKSk7XG4gICAgZGVzZXJ0LmFwcGVuZENoaWxkKGZvb2QoZGVzZXJ0NSwgXCJNYWRlbGVpbmVzXCIsIFwiJDhcIikpO1xuXG4gICAgLyogc2VjdGlvbiAzICovXG4gICAgbGV0IGRyaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlY3Rpb25cIik7XG4gICAgZHJpbmsuY2xhc3NMaXN0LmFkZChcImRyaW5rXCIpO1xuICAgIGxldCBkcmlua1RpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkcmlua1RpdGxlLnRleHRDb250ZW50ID0gXCJEcmlua3NcIjtcbiAgICBkcmluay5hcHBlbmRDaGlsZChkcmlua1RpdGxlKTtcbiAgICBkcmluay5hcHBlbmRDaGlsZChmb29kKGRyaW5rMSwgXCJDYWbDqSBDcsOobWVcIiwgXCIkOFwiKSk7XG4gICAgZHJpbmsuYXBwZW5kQ2hpbGQoZm9vZChkcmluazIsIFwiQ2Fmw6kgTm9pclwiLCBcIiQ4XCIpKTtcbiAgICBkcmluay5hcHBlbmRDaGlsZChmb29kKGRyaW5rMywgXCJDaG9jb2xhdCBDaGF1ZFwiLCBcIiQxMlwiKSk7XG4gICAgZHJpbmsuYXBwZW5kQ2hpbGQoZm9vZChkcmluazQsIFwiVGjDqVwiLCBcIiQxMFwiKSk7XG4gICAgZHJpbmsuYXBwZW5kQ2hpbGQoZm9vZChkcmluazUsIFwiRWF1IEdhemV1c2VcIiwgXCIkMTJcIikpO1xuXG5cbiAgICBtZW51LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBtZW51LmFwcGVuZENoaWxkKHBhc3RyeSk7XG4gICAgbWVudS5hcHBlbmRDaGlsZChkZXNlcnQpO1xuICAgIG1lbnUuYXBwZW5kQ2hpbGQoZHJpbmspO1xuICAgIG91dGVyTWVudS5hcHBlbmRDaGlsZChtZW51KTtcbiAgICBtZW51UGFnZUNvbmVudC5hcHBlbmRDaGlsZChvdXRlck1lbnUpO1xuICAgIG1lbnVQYWdlQ29uZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoclwiKSk7XG4gICAgLyogZm9vdGVyICovXG4gICAgbWVudVBhZ2VDb25lbnQuYXBwZW5kQ2hpbGQoZm9vdGVyKCkpXG5cbiAgICBjb250ZW50LmFwcGVuZENoaWxkKG1lbnVQYWdlQ29uZW50KTtcblxuICAgIG1lbnVBbmltYXRpb24oKVxuICAgIFxufVxuZnVuY3Rpb24gZm9vZChpbWFnZSwgaGVhZGluZywgYW1vdW50KXtcbiAgICBsZXQgcGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICBpbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIGltYWdlKTtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYudGV4dENvbnRlbnQgPSBoZWFkaW5nO1xuICAgIGxldCBwcmljZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcHJpY2UudGV4dENvbnRlbnQgPSBhbW91bnQ7XG4gICAgXG4gICAgcGFyZW50LmFwcGVuZENoaWxkKGltZyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKGRpdik7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHByaWNlKTtcbiAgICByZXR1cm4gcGFyZW50O1xufVxuXG5leHBvcnQgZGVmYXVsdCBtZW51cGFnZTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJ2YXIgc2NyaXB0VXJsO1xuaWYgKF9fd2VicGFja19yZXF1aXJlX18uZy5pbXBvcnRTY3JpcHRzKSBzY3JpcHRVcmwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcubG9jYXRpb24gKyBcIlwiO1xudmFyIGRvY3VtZW50ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmRvY3VtZW50O1xuaWYgKCFzY3JpcHRVcmwgJiYgZG9jdW1lbnQpIHtcblx0aWYgKGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpXG5cdFx0c2NyaXB0VXJsID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmM7XG5cdGlmICghc2NyaXB0VXJsKSB7XG5cdFx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblx0XHRpZihzY3JpcHRzLmxlbmd0aCkge1xuXHRcdFx0dmFyIGkgPSBzY3JpcHRzLmxlbmd0aCAtIDE7XG5cdFx0XHR3aGlsZSAoaSA+IC0xICYmICFzY3JpcHRVcmwpIHNjcmlwdFVybCA9IHNjcmlwdHNbaS0tXS5zcmM7XG5cdFx0fVxuXHR9XG59XG4vLyBXaGVuIHN1cHBvcnRpbmcgYnJvd3NlcnMgd2hlcmUgYW4gYXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCB5b3UgbXVzdCBzcGVjaWZ5IGFuIG91dHB1dC5wdWJsaWNQYXRoIG1hbnVhbGx5IHZpYSBjb25maWd1cmF0aW9uXG4vLyBvciBwYXNzIGFuIGVtcHR5IHN0cmluZyAoXCJcIikgYW5kIHNldCB0aGUgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gdmFyaWFibGUgZnJvbSB5b3VyIGNvZGUgdG8gdXNlIHlvdXIgb3duIGxvZ2ljLlxuaWYgKCFzY3JpcHRVcmwpIHRocm93IG5ldyBFcnJvcihcIkF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyXCIpO1xuc2NyaXB0VXJsID0gc2NyaXB0VXJsLnJlcGxhY2UoLyMuKiQvLCBcIlwiKS5yZXBsYWNlKC9cXD8uKiQvLCBcIlwiKS5yZXBsYWNlKC9cXC9bXlxcL10rJC8sIFwiL1wiKTtcbl9fd2VicGFja19yZXF1aXJlX18ucCA9IHNjcmlwdFVybDsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsImltcG9ydCBcIi4vY3NzL2luZGV4LmNzc1wiO1xuaW1wb3J0IFwiLi9jc3Mvbm9ybWFsaXplLmNzc1wiO1xuaW1wb3J0IGhvbWVwYWdlLCB7IG5hdmlnYXRpb25OYW1lIH0gZnJvbSBcIi4vY29tcG9uZW5ldHMvaG9tZXBhZ2VcIjtcbmltcG9ydCBtZW51cGFnZSBmcm9tIFwiLi9jb21wb25lbmV0cy9tZW51cGFnZVwiO1xuaW1wb3J0IGNvbnRhY3RwYWdlIGZyb20gXCIuL2NvbXBvbmVuZXRzL2NvbnRhY3RwYWdlXCI7XG5cbmZ1bmN0aW9uIG1haW4oKXtcbiAgICBsZXQgbmF2aWdhdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmF2aWdhdGlvblwiKS5jaGlsZE5vZGVzO1xuICAgIG5hdmlnYXRpb24gPSBBcnJheS5mcm9tKG5hdmlnYXRpb24pOyAgICBcbiAgICBuYXZpZ2F0aW9uLmZvckVhY2goZSA9PiBlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYoZXZlbnQudGFyZ2V0LnRleHRDb250ZW50ID09IFwiSG9tZVwiKXtcbiAgICAgICAgICAgIGNsZWFyKCk7XG4gICAgICAgICAgICBob21lcGFnZSgpO1xuICAgICAgICAgICAgbWFpbigpO1xuICAgICAgICB9ZWxzZSBpZihldmVudC50YXJnZXQudGV4dENvbnRlbnQgPT0gXCJNZW51XCIpe1xuICAgICAgICAgICAgY2xlYXIoKTtcbiAgICAgICAgICAgIG1lbnVwYWdlKCk7XG4gICAgICAgICAgICBtYWluKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgY2xlYXIoKTtcbiAgICAgICAgICAgIGNvbnRhY3RwYWdlKCk7XG4gICAgICAgICAgICBtYWluKCk7XG4gICAgICAgIH1cbiAgICB9KSlcbn0gICBcbmZ1bmN0aW9uIGNsZWFyKCl7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmlubmVySFRNTCA9IFwiXCI7XG59XG5cbmhvbWVwYWdlKCk7XG5tYWluKCk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9