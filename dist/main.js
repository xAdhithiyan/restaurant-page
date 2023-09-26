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
`, "",{"version":3,"sources":["webpack://./src/css/menupage.css"],"names":[],"mappings":"AAAA;IACI,YAAY;IACZ,aAAa;IACb,2CAA2C;AAC/C;AACA;IACI,kBAAkB;AACtB;AACA;IACI,YAAY;IACZ,WAAW;IACX,aAAa;IACb,uBAAuB;IACvB,sBAAsB;IACtB,kBAAkB;IAClB,aAAa;IACb,uBAAuB;IACvB,mBAAmB;IACnB;;AAEJ;AACA;IACI,WAAW;IACX,UAAU;IACV,sBAAsB;IACtB,kBAAkB;IAClB,uBAAuB;IACvB,cAAc;AAClB;AACA;IACI,aAAa;IACb,qCAAqC;IACrC,6BAA6B;IAC7B,sBAAsB;AAC1B;AACA;IACI,uBAAuB;IACvB,4BAA4B;IAC5B,+BAA+B;IAC/B,UAAU;IACV,UAAU;AACd;AACA;IACI,YAAY;IACZ,eAAe;IACf,eAAe;IACf,eAAe;IACf,6BAA6B;IAC7B,UAAU;IACV,uBAAuB;AAC3B;;AAEA;IACI,YAAY;IACZ,YAAY;IACZ,kBAAkB;IAClB,sBAAsB;IACtB,iBAAiB;AACrB;;AAEA;IACI,iBAAiB;IACjB,YAAY;IACZ,iBAAiB;IACjB,mBAAmB;IACnB,uBAAuB;IACvB,WAAW;IACX,YAAY;IACZ,iBAAiB;IACjB,2BAA2B;IAC3B,4BAA4B;AAChC;AACA;IACI,aAAa;IACb,+BAA+B;IAC/B,sBAAsB;IACtB,mBAAmB;IACnB,iBAAiB;IACjB,QAAQ;IACR,kBAAkB;AACtB;AACA;IACI,kBAAkB;AACtB;AACA;IACI,aAAa;IACb,uCAAuC;IACvC,mBAAmB;IACnB,6BAA6B;IAC7B,UAAU;IACV,uBAAuB;AAC3B;AACA;;IAEI,aAAa;IACb,eAAe;IACf,eAAe;IACf,mBAAmB;AACvB;AACA;IACI,6BAA6B;IAC7B,UAAU;IACV,uBAAuB;AAC3B;AACA;IACI,WAAW;IACX,kBAAkB;AACtB;AACA;IACI,WAAW;IACX,kBAAkB;AACtB;AACA;IACI,0CAA0C;AAC9C;AACA;IACI,UAAU;AACd","sourcesContent":[".menuPage{\n    height: 99vh;\n    display: grid;\n    grid-template-rows: 45px auto 1fr auto auto;   \n}\n.menuPage > div:nth-child(3){\n    align-self: center;\n}\n.outerMenu{\n    height: 78vh;\n    width: 70vw;\n    margin:0 auto;    \n    background-color: white;\n    border:3px solid black;\n    border-radius: 5px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    background-color: var(--text-color)\n    \n}\n.menu{\n    height: 90%;\n    width: 95%;\n    border:3px solid black;\n    border-radius: 5px;\n    background-color: white;\n    overflow: auto;\n}\n.menuPage .menu {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    grid-template-rows: 240px 1fr;\n    grid-auto-flow: column;\n}\n.menuPage .menu hr {\n    border: 2px solid black;\n    border-top-right-radius: 50%;\n    border-bottom-right-radius: 50%;\n    width: 80%;\n    margin:0px;\n}\n.title{\n    padding:10px;\n    font-size: 5rem;\n    margin-top:10px;\n    padding-top:0px;\n    border-right: 2px solid black;\n    z-index: 2;\n    background-color: white;\n}\n\nsection img {\n    width: 120px;\n    height: 82px;\n    border-radius: 20%;\n    border:2px solid black;\n    margin-left: 10px;\n}\n\nsection > div:nth-child(1){\n    font-size: 1.5rem;\n    margin: 10px;\n    padding-left:10px;\n    font-weight: bolder;\n    border: 2px solid black;\n    width: 88px;\n    height: 40px;\n    border-radius: 5%;\n    border-top-left-radius: 30%;\n    border-top-right-radius: 30%;\n}\nsection > div{\n    display: grid;\n    grid-template-columns: auto 1fr;\n    grid-auto-flow: column;\n    align-items: center;\n    font-size: 1.5rem;\n    gap:10px;\n    margin-bottom: 5px;\n}\nsection > div > div:nth-child(3){\n    margin-right: 15px;\n}\n.pastry{\n    display: grid;\n    grid-template-rows: 60px repeat(3,auto);\n    margin-bottom: 10px;\n    border-right: 2px solid black;\n    z-index: 2;\n    background-color: white;\n}\n.desert,\n.drink{\n    display: grid;\n    grid-row: 1 / 3;\n    margin-top:10px;\n    margin-bottom: 10px;\n}\n.desert{\n    border-right: 2px solid black;\n    z-index: 1;\n    background-color: white;\n}\n.desert > div:nth-child(1){\n    width: 80px;\n    align-self: center;\n}\n.drink > div:nth-child(1){\n    width: 70px;\n    align-self: center;\n}\n.menuPage > .navigation > div:nth-child(2){\n    border-bottom: 2px solid var(--text-color);\n}\n.drink{\n    z-index: 0;\n}\n"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLHVGQUF1RixVQUFVLFVBQVUsWUFBWSxNQUFNLEtBQUssWUFBWSxNQUFNLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsT0FBTyxLQUFLLEtBQUssVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLFdBQVcsTUFBTSxLQUFLLFVBQVUsWUFBWSxhQUFhLGFBQWEsTUFBTSxLQUFLLFlBQVksYUFBYSxhQUFhLFdBQVcsVUFBVSxLQUFLLEtBQUssVUFBVSxVQUFVLFVBQVUsVUFBVSxZQUFZLFdBQVcsWUFBWSxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLE1BQU0sS0FBSyxVQUFVLFlB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cEh2QjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0NsQkE7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBeUI7QUFDSTtBQUNxQztBQUNwQjtBQUNNOztBQUVwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLGlFQUFRO0FBQ3BCO0FBQ0EsU0FBUztBQUNUO0FBQ0EsWUFBWSxpRUFBUTtBQUNwQjtBQUNBLFNBQVM7QUFDVDtBQUNBLFlBQVksb0VBQVc7QUFDdkI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpRUFBUTtBQUNSLE8iLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9ub2RlX21vZHVsZXMvYW5pbWF0ZXBsdXMvYW5pbWF0ZXBsdXMuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2Nzcy9jb250YWN0cGFnZS5jc3MiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2Nzcy9ob21lcGFnZS5jc3MiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2Nzcy9pbmRleC5jc3MiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2Nzcy9tZW51cGFnZS5jc3MiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2Nzcy9ub3JtYWxpemUuY3NzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2Nzcy9jb250YWN0cGFnZS5jc3M/ODM0ZiIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY3NzL2hvbWVwYWdlLmNzcz9hMjc3Iiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jc3MvaW5kZXguY3NzP2Y3ZWEiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2Nzcy9tZW51cGFnZS5jc3M/OWQzMCIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9zcmMvY3NzL25vcm1hbGl6ZS5jc3M/NmQ1NCIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2UvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9hbmltYXRpb24vYW5pbWF0ZUNvbnRhY3RQYWdlLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9hbmltYXRpb24vYW5pbWF0ZUhvbWVQYWdlLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9hbmltYXRpb24vYW5pbWF0aW9uTWVudVBhZ2UuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2NvbXBvbmVuZXRzL2NvbnRhY3RwYWdlLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jb21wb25lbmV0cy9mb290ZXIuanMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2NvbXBvbmVuZXRzL2hvbWVwYWdlLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jb21wb25lbmV0cy9ob21lcGFnZUNhcmRzLmpzIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS8uL3NyYy9jb21wb25lbmV0cy9tZW51cGFnZS5qcyIsIndlYnBhY2s6Ly9yZXN0YXVyYW50LXBhZ2Uvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL3Jlc3RhdXJhbnQtcGFnZS93ZWJwYWNrL3J1bnRpbWUvbm9uY2UiLCJ3ZWJwYWNrOi8vcmVzdGF1cmFudC1wYWdlLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBBbmltYXRlIFBsdXMgdjIuMS4xXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTctMjAxOCBCZW5qYW1pbiBEZSBDb2NrXG4gKiBodHRwOi8vYW5pbWF0ZXBsdXMuY29tL2xpY2Vuc2VcbiAqL1xuXG5cbi8vIGxvZ2ljXG4vLyA9PT09PVxuXG5jb25zdCBmaXJzdCA9IChbaXRlbV0pID0+IGl0ZW07XG5cbmNvbnN0IGNvbXB1dGVWYWx1ZSA9ICh2YWx1ZSwgaW5kZXgpID0+XG4gIHR5cGVvZiB2YWx1ZSA9PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZShpbmRleCkgOiB2YWx1ZTtcblxuXG4vLyBkb21cbi8vID09PVxuXG5jb25zdCBnZXRFbGVtZW50cyA9IGVsZW1lbnRzID0+IHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoZWxlbWVudHMpKVxuICAgIHJldHVybiBlbGVtZW50cztcbiAgaWYgKCFlbGVtZW50cyB8fCBlbGVtZW50cy5ub2RlVHlwZSlcbiAgICByZXR1cm4gW2VsZW1lbnRzXTtcbiAgcmV0dXJuIEFycmF5LmZyb20odHlwZW9mIGVsZW1lbnRzID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGVsZW1lbnRzKSA6IGVsZW1lbnRzKTtcbn07XG5cbmNvbnN0IGFjY2VsZXJhdGUgPSAoe3N0eWxlfSwga2V5ZnJhbWVzKSA9PlxuICBzdHlsZS53aWxsQ2hhbmdlID0ga2V5ZnJhbWVzXG4gICAgPyBrZXlmcmFtZXMubWFwKCh7cHJvcGVydHl9KSA9PiBwcm9wZXJ0eSkuam9pbigpXG4gICAgOiBcImF1dG9cIjtcblxuY29uc3QgY3JlYXRlU1ZHID0gKGVsZW1lbnQsIGF0dHJpYnV0ZXMpID0+XG4gIE9iamVjdC5lbnRyaWVzKGF0dHJpYnV0ZXMpLnJlZHVjZSgobm9kZSwgW2F0dHJpYnV0ZSwgdmFsdWVdKSA9PiB7XG4gICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH0sIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIGVsZW1lbnQpKTtcblxuXG4vLyBtb3Rpb24gYmx1clxuLy8gPT09PT09PT09PT1cblxuY29uc3QgYmx1cnMgPSB7XG4gIGF4ZXM6IFtcInhcIiwgXCJ5XCJdLFxuICBjb3VudDogMCxcbiAgYWRkKHtlbGVtZW50LCBibHVyfSkge1xuICAgIGNvbnN0IGlkID0gYG1vdGlvbi1ibHVyLSR7dGhpcy5jb3VudCsrfWA7XG4gICAgY29uc3Qgc3ZnID0gY3JlYXRlU1ZHKFwic3ZnXCIsIHtcbiAgICAgIHN0eWxlOiBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgd2lkdGg6IDA7IGhlaWdodDogMFwiXG4gICAgfSk7XG4gICAgY29uc3QgZmlsdGVyID0gY3JlYXRlU1ZHKFwiZmlsdGVyXCIsIHRoaXMuYXhlcy5yZWR1Y2UoKGF0dHJpYnV0ZXMsIGF4aXMpID0+IHtcbiAgICAgIGNvbnN0IG9mZnNldCA9IGJsdXJbYXhpc10gKiAyO1xuICAgICAgYXR0cmlidXRlc1theGlzXSA9IGAtJHtvZmZzZXR9JWA7XG4gICAgICBhdHRyaWJ1dGVzW2F4aXMgPT0gXCJ4XCIgPyBcIndpZHRoXCIgOiBcImhlaWdodFwiXSA9IGAkezEwMCArIG9mZnNldCAqIDJ9JWA7XG4gICAgICByZXR1cm4gYXR0cmlidXRlcztcbiAgICB9LHtcbiAgICAgIGlkLFxuICAgICAgXCJjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnNcIjogXCJzUkdCXCJcbiAgICB9KSk7XG4gICAgY29uc3QgZ2F1c3NpYW4gPSBjcmVhdGVTVkcoXCJmZUdhdXNzaWFuQmx1clwiLCB7XG4gICAgICBpbjogXCJTb3VyY2VHcmFwaGljXCJcbiAgICB9KTtcbiAgICBmaWx0ZXIuYXBwZW5kKGdhdXNzaWFuKTtcbiAgICBzdmcuYXBwZW5kKGZpbHRlcik7XG4gICAgZWxlbWVudC5zdHlsZS5maWx0ZXIgPSBgdXJsKFwiIyR7aWR9XCIpYDtcbiAgICBkb2N1bWVudC5ib2R5LnByZXBlbmQoc3ZnKTtcbiAgICByZXR1cm4gZ2F1c3NpYW47XG4gIH1cbn07XG5cbmNvbnN0IGdldERldmlhdGlvbiA9IChibHVyLCB7ZWFzaW5nfSwgY3VydmUpID0+IHtcbiAgY29uc3QgcHJvZ3Jlc3MgPSBibHVyICogY3VydmU7XG4gIGNvbnN0IG91dCA9IGJsdXIgLSBwcm9ncmVzcztcbiAgY29uc3QgZGV2aWF0aW9uID0gKCgpID0+IHtcbiAgICBpZiAoZWFzaW5nID09IFwibGluZWFyXCIpXG4gICAgICByZXR1cm4gYmx1cjtcbiAgICBpZiAoZWFzaW5nLnN0YXJ0c1dpdGgoXCJpbi1vdXRcIikpXG4gICAgICByZXR1cm4gKGN1cnZlIDwgLjUgPyBwcm9ncmVzcyA6IG91dCkgKiAyO1xuICAgIGlmIChlYXNpbmcuc3RhcnRzV2l0aChcImluXCIpKVxuICAgICAgcmV0dXJuIHByb2dyZXNzO1xuICAgIHJldHVybiBvdXQ7XG4gIH0pKCk7XG4gIHJldHVybiBNYXRoLm1heCgwLCBkZXZpYXRpb24pO1xufTtcblxuY29uc3Qgc2V0RGV2aWF0aW9uID0gKHtibHVyLCBnYXVzc2lhbiwgZWFzaW5nfSwgY3VydmUpID0+IHtcbiAgY29uc3QgdmFsdWVzID0gYmx1cnMuYXhlcy5tYXAoYXhpcyA9PiBnZXREZXZpYXRpb24oYmx1cltheGlzXSwgZWFzaW5nLCBjdXJ2ZSkpO1xuICBnYXVzc2lhbi5zZXRBdHRyaWJ1dGUoXCJzdGREZXZpYXRpb25cIiwgdmFsdWVzLmpvaW4oKSk7XG59O1xuXG5jb25zdCBub3JtYWxpemVCbHVyID0gYmx1ciA9PiB7XG4gIGNvbnN0IGRlZmF1bHRzID0gYmx1cnMuYXhlcy5yZWR1Y2UoKG9iamVjdCwgYXhpcykgPT4ge1xuICAgIG9iamVjdFtheGlzXSA9IDA7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSwge30pO1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgYmx1cik7XG59O1xuXG5jb25zdCBjbGVhckJsdXIgPSAoe3N0eWxlfSwge3BhcmVudE5vZGU6IHtwYXJlbnROb2RlOiBzdmd9fSkgPT4ge1xuICBzdHlsZS5maWx0ZXIgPSBcIm5vbmVcIjtcbiAgc3ZnLnJlbW92ZSgpO1xufTtcblxuXG4vLyBjb2xvciBjb252ZXJzaW9uXG4vLyA9PT09PT09PT09PT09PT09XG5cbmNvbnN0IGhleFBhaXJzID0gY29sb3IgPT4ge1xuICBjb25zdCBzcGxpdCA9IGNvbG9yLnNwbGl0KFwiXCIpO1xuICBjb25zdCBwYWlycyA9IGNvbG9yLmxlbmd0aCA8IDVcbiAgICA/IHNwbGl0Lm1hcChzdHJpbmcgPT4gc3RyaW5nICsgc3RyaW5nKVxuICAgIDogc3BsaXQucmVkdWNlKChhcnJheSwgc3RyaW5nLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGluZGV4ICUgMilcbiAgICAgICAgYXJyYXkucHVzaChzcGxpdFtpbmRleCAtIDFdICsgc3RyaW5nKTtcbiAgICAgIHJldHVybiBhcnJheTtcbiAgICB9LCBbXSk7XG4gIGlmIChwYWlycy5sZW5ndGggPCA0KVxuICAgIHBhaXJzLnB1c2goXCJmZlwiKTtcbiAgcmV0dXJuIHBhaXJzO1xufTtcblxuY29uc3QgY29udmVydCA9IGNvbG9yID0+XG4gIGhleFBhaXJzKGNvbG9yKS5tYXAoc3RyaW5nID0+IHBhcnNlSW50KHN0cmluZywgMTYpKTtcblxuY29uc3QgcmdiYSA9IGhleCA9PiB7XG4gIGNvbnN0IGNvbG9yID0gaGV4LnNsaWNlKDEpO1xuICBjb25zdCBbciwgZywgYiwgYV0gPSBjb252ZXJ0KGNvbG9yKTtcbiAgcmV0dXJuIGByZ2JhKCR7cn0sICR7Z30sICR7Yn0sICR7YSAvIDI1NX0pYDtcbn07XG5cblxuLy8gZWFzaW5nIGVxdWF0aW9uc1xuLy8gPT09PT09PT09PT09PT09PVxuXG5jb25zdCBwaTIgPSBNYXRoLlBJICogMjtcblxuY29uc3QgZ2V0T2Zmc2V0ID0gKHN0cmVuZ3RoLCBwZXJpb2QpID0+XG4gIHBlcmlvZCAvIHBpMiAqIE1hdGguYXNpbigxIC8gc3RyZW5ndGgpO1xuXG5jb25zdCBlYXNpbmdzID0ge1xuICBcImxpbmVhclwiOiBwcm9ncmVzcyA9PiBwcm9ncmVzcyxcblxuICBcImluLWN1YmljXCI6IHByb2dyZXNzID0+IHByb2dyZXNzICoqIDMsXG4gIFwiaW4tcXVhcnRpY1wiOiBwcm9ncmVzcyA9PiBwcm9ncmVzcyAqKiA0LFxuICBcImluLXF1aW50aWNcIjogcHJvZ3Jlc3MgPT4gcHJvZ3Jlc3MgKiogNSxcbiAgXCJpbi1leHBvbmVudGlhbFwiOiBwcm9ncmVzcyA9PiAxMDI0ICoqIChwcm9ncmVzcyAtIDEpLFxuICBcImluLWNpcmN1bGFyXCI6IHByb2dyZXNzID0+IDEgLSBNYXRoLnNxcnQoMSAtIHByb2dyZXNzICoqIDIpLFxuICBcImluLWVsYXN0aWNcIjogKHByb2dyZXNzLCBhbXBsaXR1ZGUsIHBlcmlvZCkgPT4ge1xuICAgIGNvbnN0IHN0cmVuZ3RoID0gTWF0aC5tYXgoYW1wbGl0dWRlLCAxKTtcbiAgICBjb25zdCBvZmZzZXQgPSBnZXRPZmZzZXQoc3RyZW5ndGgsIHBlcmlvZCk7XG4gICAgcmV0dXJuIC0oc3RyZW5ndGggKiAyICoqICgxMCAqIChwcm9ncmVzcyAtPSAxKSkgKiBNYXRoLnNpbigocHJvZ3Jlc3MgLSBvZmZzZXQpICogcGkyIC8gcGVyaW9kKSk7XG4gIH0sXG5cbiAgXCJvdXQtY3ViaWNcIjogcHJvZ3Jlc3MgPT4gLS1wcm9ncmVzcyAqKiAzICsgMSxcbiAgXCJvdXQtcXVhcnRpY1wiOiBwcm9ncmVzcyA9PiAxIC0gLS1wcm9ncmVzcyAqKiA0LFxuICBcIm91dC1xdWludGljXCI6IHByb2dyZXNzID0+IC0tcHJvZ3Jlc3MgKiogNSArIDEsXG4gIFwib3V0LWV4cG9uZW50aWFsXCI6IHByb2dyZXNzID0+IDEgLSAyICoqICgtMTAgKiBwcm9ncmVzcyksXG4gIFwib3V0LWNpcmN1bGFyXCI6IHByb2dyZXNzID0+IE1hdGguc3FydCgxIC0gLS1wcm9ncmVzcyAqKiAyKSxcbiAgXCJvdXQtZWxhc3RpY1wiOiAocHJvZ3Jlc3MsIGFtcGxpdHVkZSwgcGVyaW9kKSA9PiB7XG4gICAgY29uc3Qgc3RyZW5ndGggPSBNYXRoLm1heChhbXBsaXR1ZGUsIDEpO1xuICAgIGNvbnN0IG9mZnNldCA9IGdldE9mZnNldChzdHJlbmd0aCwgcGVyaW9kKTtcbiAgICByZXR1cm4gc3RyZW5ndGggKiAyICoqICgtMTAgKiBwcm9ncmVzcykgKiBNYXRoLnNpbigocHJvZ3Jlc3MgLSBvZmZzZXQpICogcGkyIC8gcGVyaW9kKSArIDE7XG4gIH0sXG5cbiAgXCJpbi1vdXQtY3ViaWNcIjogcHJvZ3Jlc3MgPT5cbiAgICAocHJvZ3Jlc3MgKj0gMikgPCAxXG4gICAgICA/IC41ICogcHJvZ3Jlc3MgKiogM1xuICAgICAgOiAuNSAqICgocHJvZ3Jlc3MgLT0gMikgKiBwcm9ncmVzcyAqKiAyICsgMiksXG4gIFwiaW4tb3V0LXF1YXJ0aWNcIjogcHJvZ3Jlc3MgPT5cbiAgICAocHJvZ3Jlc3MgKj0gMikgPCAxXG4gICAgICA/IC41ICogcHJvZ3Jlc3MgKiogNFxuICAgICAgOiAtLjUgKiAoKHByb2dyZXNzIC09IDIpICogcHJvZ3Jlc3MgKiogMyAtIDIpLFxuICBcImluLW91dC1xdWludGljXCI6IHByb2dyZXNzID0+XG4gICAgKHByb2dyZXNzICo9IDIpIDwgMVxuICAgICAgPyAuNSAqIHByb2dyZXNzICoqIDVcbiAgICAgIDogLjUgKiAoKHByb2dyZXNzIC09IDIpICogcHJvZ3Jlc3MgKiogNCArIDIpLFxuICBcImluLW91dC1leHBvbmVudGlhbFwiOiBwcm9ncmVzcyA9PlxuICAgIChwcm9ncmVzcyAqPSAyKSA8IDFcbiAgICAgID8gLjUgKiAxMDI0ICoqIChwcm9ncmVzcyAtIDEpXG4gICAgICA6IC41ICogKC0oMiAqKiAoLTEwICogKHByb2dyZXNzIC0gMSkpKSArIDIpLFxuICBcImluLW91dC1jaXJjdWxhclwiOiBwcm9ncmVzcyA9PlxuICAgIChwcm9ncmVzcyAqPSAyKSA8IDFcbiAgICAgID8gLS41ICogKE1hdGguc3FydCgxIC0gcHJvZ3Jlc3MgKiogMikgLSAxKVxuICAgICAgOiAuNSAqIChNYXRoLnNxcnQoMSAtIChwcm9ncmVzcyAtPSAyKSAqIHByb2dyZXNzKSArIDEpLFxuICBcImluLW91dC1lbGFzdGljXCI6IChwcm9ncmVzcywgYW1wbGl0dWRlLCBwZXJpb2QpID0+IHtcbiAgICBjb25zdCBzdHJlbmd0aCA9IE1hdGgubWF4KGFtcGxpdHVkZSwgMSk7XG4gICAgY29uc3Qgb2Zmc2V0ID0gZ2V0T2Zmc2V0KHN0cmVuZ3RoLCBwZXJpb2QpO1xuICAgIHJldHVybiAocHJvZ3Jlc3MgKj0gMikgPCAxXG4gICAgICA/IC0uNSAqIChzdHJlbmd0aCAqIDIgKiogKDEwICogKHByb2dyZXNzIC09IDEpKSAqIE1hdGguc2luKChwcm9ncmVzcyAtIG9mZnNldCkgKiBwaTIgLyBwZXJpb2QpKVxuICAgICAgOiBzdHJlbmd0aCAqIDIgKiogKC0xMCAqIChwcm9ncmVzcyAtPSAxKSkgKiBNYXRoLnNpbigocHJvZ3Jlc3MgLSBvZmZzZXQpICogcGkyIC8gcGVyaW9kKSAqIC41ICsgMTtcbiAgfVxufTtcblxuY29uc3QgZGVjb21wb3NlRWFzaW5nID0gc3RyaW5nID0+IHtcbiAgY29uc3QgW2Vhc2luZywgYW1wbGl0dWRlID0gMSwgcGVyaW9kID0gLjRdID0gc3RyaW5nLnRyaW0oKS5zcGxpdChcIiBcIik7XG4gIHJldHVybiB7ZWFzaW5nLCBhbXBsaXR1ZGUsIHBlcmlvZH07XG59O1xuXG5jb25zdCBlYXNlID0gKHtlYXNpbmcsIGFtcGxpdHVkZSwgcGVyaW9kfSwgcHJvZ3Jlc3MpID0+XG4gIGVhc2luZ3NbZWFzaW5nXShwcm9ncmVzcywgYW1wbGl0dWRlLCBwZXJpb2QpO1xuXG5cbi8vIGtleWZyYW1lcyBjb21wb3NpdGlvblxuLy8gPT09PT09PT09PT09PT09PT09PT09XG5cbmNvbnN0IGV4dHJhY3RSZWdFeHAgPSAvLT9cXGQqXFwuP1xcZCsvZztcblxuY29uc3QgZXh0cmFjdFN0cmluZ3MgPSB2YWx1ZSA9PlxuICB2YWx1ZS5zcGxpdChleHRyYWN0UmVnRXhwKTtcblxuY29uc3QgZXh0cmFjdE51bWJlcnMgPSB2YWx1ZSA9PlxuICB2YWx1ZS5tYXRjaChleHRyYWN0UmVnRXhwKS5tYXAoTnVtYmVyKTtcblxuY29uc3Qgc2FuaXRpemUgPSB2YWx1ZXMgPT5cbiAgdmFsdWVzLm1hcCh2YWx1ZSA9PiB7XG4gICAgY29uc3Qgc3RyaW5nID0gU3RyaW5nKHZhbHVlKTtcbiAgICByZXR1cm4gc3RyaW5nLnN0YXJ0c1dpdGgoXCIjXCIpID8gcmdiYShzdHJpbmcpIDogc3RyaW5nO1xuICB9KTtcblxuY29uc3QgYWRkUHJvcGVydHlLZXlmcmFtZXMgPSAocHJvcGVydHksIHZhbHVlcykgPT4ge1xuICBjb25zdCBhbmltYXRhYmxlID0gc2FuaXRpemUodmFsdWVzKTtcbiAgY29uc3Qgc3RyaW5ncyA9IGV4dHJhY3RTdHJpbmdzKGZpcnN0KGFuaW1hdGFibGUpKTtcbiAgY29uc3QgbnVtYmVycyA9IGFuaW1hdGFibGUubWFwKGV4dHJhY3ROdW1iZXJzKTtcbiAgY29uc3Qgcm91bmQgPSBmaXJzdChzdHJpbmdzKS5zdGFydHNXaXRoKFwicmdiXCIpO1xuICByZXR1cm4ge3Byb3BlcnR5LCBzdHJpbmdzLCBudW1iZXJzLCByb3VuZH07XG59O1xuXG5jb25zdCBjcmVhdGVBbmltYXRpb25LZXlmcmFtZXMgPSAoa2V5ZnJhbWVzLCBpbmRleCkgPT5cbiAgT2JqZWN0LmVudHJpZXMoa2V5ZnJhbWVzKS5tYXAoKFtwcm9wZXJ0eSwgdmFsdWVzXSkgPT5cbiAgICBhZGRQcm9wZXJ0eUtleWZyYW1lcyhwcm9wZXJ0eSwgY29tcHV0ZVZhbHVlKHZhbHVlcywgaW5kZXgpKSk7XG5cbmNvbnN0IGdldEN1cnJlbnRWYWx1ZSA9IChmcm9tLCB0bywgZWFzaW5nKSA9PlxuICBmcm9tICsgKHRvIC0gZnJvbSkgKiBlYXNpbmc7XG5cbmNvbnN0IHJlY29tcG9zZVZhbHVlID0gKFtmcm9tLCB0b10sIHN0cmluZ3MsIHJvdW5kLCBlYXNpbmcpID0+XG4gIHN0cmluZ3MucmVkdWNlKChzdHlsZSwgc3RyaW5nLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IHByZXZpb3VzID0gaW5kZXggLSAxO1xuICAgIGNvbnN0IHZhbHVlID0gZ2V0Q3VycmVudFZhbHVlKGZyb21bcHJldmlvdXNdLCB0b1twcmV2aW91c10sIGVhc2luZyk7XG4gICAgcmV0dXJuIHN0eWxlICsgKHJvdW5kICYmIGluZGV4IDwgNCA/IE1hdGgucm91bmQodmFsdWUpIDogdmFsdWUpICsgc3RyaW5nO1xuICB9KTtcblxuY29uc3QgY3JlYXRlU3R5bGVzID0gKGtleWZyYW1lcywgZWFzaW5nKSA9PlxuICBrZXlmcmFtZXMucmVkdWNlKChzdHlsZXMsIHtwcm9wZXJ0eSwgbnVtYmVycywgc3RyaW5ncywgcm91bmR9KSA9PiB7XG4gICAgc3R5bGVzW3Byb3BlcnR5XSA9IHJlY29tcG9zZVZhbHVlKG51bWJlcnMsIHN0cmluZ3MsIHJvdW5kLCBlYXNpbmcpO1xuICAgIHJldHVybiBzdHlsZXM7XG4gIH0sIHt9KTtcblxuY29uc3QgcmV2ZXJzZUtleWZyYW1lcyA9IGtleWZyYW1lcyA9PlxuICBrZXlmcmFtZXMuZm9yRWFjaCgoe251bWJlcnN9KSA9PiBudW1iZXJzLnJldmVyc2UoKSk7XG5cblxuLy8gYW5pbWF0aW9uIHRyYWNraW5nXG4vLyA9PT09PT09PT09PT09PT09PT1cblxuY29uc3QgckFGID0ge1xuICBhbGw6IG5ldyBTZXQsXG4gIGFkZChvYmplY3QpIHtcbiAgICBpZiAodGhpcy5hbGwuYWRkKG9iamVjdCkuc2l6ZSA8IDIpIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbiAgfVxufTtcblxuY29uc3QgcGF1c2VkID0ge307XG5cbmNvbnN0IHRyYWNrVGltZSA9ICh0aW1pbmcsIG5vdykgPT4ge1xuICBpZiAoIXRpbWluZy5zdGFydFRpbWUpIHRpbWluZy5zdGFydFRpbWUgPSBub3c7XG4gIHRpbWluZy5lbGFwc2VkID0gbm93IC0gdGltaW5nLnN0YXJ0VGltZTtcbn07XG5cbmNvbnN0IHJlc2V0VGltZSA9IG9iamVjdCA9PlxuICBvYmplY3Quc3RhcnRUaW1lID0gMDtcblxuY29uc3QgZ2V0UHJvZ3Jlc3MgPSAoe2VsYXBzZWQsIGR1cmF0aW9ufSkgPT5cbiAgZHVyYXRpb24gPiAwID8gTWF0aC5taW4oZWxhcHNlZCAvIGR1cmF0aW9uLCAxKSA6IDE7XG5cbmNvbnN0IHNldFNwZWVkID0gKHNwZWVkLCB2YWx1ZSwgaW5kZXgpID0+XG4gIHNwZWVkID4gMCA/IGNvbXB1dGVWYWx1ZSh2YWx1ZSwgaW5kZXgpIC8gc3BlZWQgOiAwO1xuXG5jb25zdCBhZGRBbmltYXRpb25zID0gKG9wdGlvbnMsIHJlc29sdmUpID0+IHtcbiAgY29uc3Qge1xuICAgIGVsZW1lbnRzID0gbnVsbCxcbiAgICBlYXNpbmcgPSBcIm91dC1lbGFzdGljXCIsXG4gICAgZHVyYXRpb24gPSAxMDAwLFxuICAgIGRlbGF5OiB0aW1lb3V0ID0gMCxcbiAgICBzcGVlZCA9IDEsXG4gICAgbG9vcCA9IGZhbHNlLFxuICAgIG9wdGltaXplID0gZmFsc2UsXG4gICAgZGlyZWN0aW9uID0gXCJub3JtYWxcIixcbiAgICBibHVyID0gbnVsbCxcbiAgICBjaGFuZ2UgPSBudWxsLFxuICAgIC4uLnJlc3RcbiAgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgbGFzdCA9IHtcbiAgICB0b3RhbER1cmF0aW9uOiAtMVxuICB9O1xuXG4gIGdldEVsZW1lbnRzKGVsZW1lbnRzKS5mb3JFYWNoKGFzeW5jIChlbGVtZW50LCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGtleWZyYW1lcyA9IGNyZWF0ZUFuaW1hdGlvbktleWZyYW1lcyhyZXN0LCBpbmRleCk7XG4gICAgY29uc3QgYW5pbWF0aW9uID0ge1xuICAgICAgZWxlbWVudCxcbiAgICAgIGtleWZyYW1lcyxcbiAgICAgIGxvb3AsXG4gICAgICBvcHRpbWl6ZSxcbiAgICAgIGRpcmVjdGlvbixcbiAgICAgIGNoYW5nZSxcbiAgICAgIGVhc2luZzogZGVjb21wb3NlRWFzaW5nKGVhc2luZyksXG4gICAgICBkdXJhdGlvbjogc2V0U3BlZWQoc3BlZWQsIGR1cmF0aW9uLCBpbmRleClcbiAgICB9O1xuXG4gICAgY29uc3QgYW5pbWF0aW9uVGltZW91dCA9IHNldFNwZWVkKHNwZWVkLCB0aW1lb3V0LCBpbmRleCk7XG4gICAgY29uc3QgdG90YWxEdXJhdGlvbiA9IGFuaW1hdGlvblRpbWVvdXQgKyBhbmltYXRpb24uZHVyYXRpb247XG5cbiAgICBpZiAoZGlyZWN0aW9uICE9IFwibm9ybWFsXCIpXG4gICAgICByZXZlcnNlS2V5ZnJhbWVzKGtleWZyYW1lcyk7XG5cbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgaWYgKG9wdGltaXplKVxuICAgICAgICBhY2NlbGVyYXRlKGVsZW1lbnQsIGtleWZyYW1lcyk7XG5cbiAgICAgIGlmIChibHVyKSB7XG4gICAgICAgIGFuaW1hdGlvbi5ibHVyID0gbm9ybWFsaXplQmx1cihjb21wdXRlVmFsdWUoYmx1ciwgaW5kZXgpKTtcbiAgICAgICAgYW5pbWF0aW9uLmdhdXNzaWFuID0gYmx1cnMuYWRkKGFuaW1hdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRvdGFsRHVyYXRpb24gPiBsYXN0LnRvdGFsRHVyYXRpb24pIHtcbiAgICAgIGxhc3QuYW5pbWF0aW9uID0gYW5pbWF0aW9uO1xuICAgICAgbGFzdC50b3RhbER1cmF0aW9uID0gdG90YWxEdXJhdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoYW5pbWF0aW9uVGltZW91dCkgYXdhaXQgZGVsYXkoYW5pbWF0aW9uVGltZW91dCk7XG4gICAgckFGLmFkZChhbmltYXRpb24pO1xuICB9KTtcblxuICBjb25zdCB7YW5pbWF0aW9ufSA9IGxhc3Q7XG4gIGlmICghYW5pbWF0aW9uKSByZXR1cm47XG4gIGFuaW1hdGlvbi5lbmQgPSByZXNvbHZlO1xuICBhbmltYXRpb24ub3B0aW9ucyA9IG9wdGlvbnM7XG59O1xuXG5jb25zdCB0aWNrID0gbm93ID0+IHtcbiAgY29uc3Qge2FsbH0gPSByQUY7XG4gIGFsbC5mb3JFYWNoKG9iamVjdCA9PiB7XG4gICAgdHJhY2tUaW1lKG9iamVjdCwgbm93KTtcbiAgICBjb25zdCBwcm9ncmVzcyA9IGdldFByb2dyZXNzKG9iamVjdCk7XG4gICAgY29uc3Qge1xuICAgICAgZWxlbWVudCxcbiAgICAgIGtleWZyYW1lcyxcbiAgICAgIGxvb3AsXG4gICAgICBvcHRpbWl6ZSxcbiAgICAgIGRpcmVjdGlvbixcbiAgICAgIGNoYW5nZSxcbiAgICAgIGVhc2luZyxcbiAgICAgIGR1cmF0aW9uLFxuICAgICAgZ2F1c3NpYW4sXG4gICAgICBlbmQsXG4gICAgICBvcHRpb25zXG4gICAgfSA9IG9iamVjdDtcblxuICAgIC8vIG9iamVjdCBpcyBhbiBhbmltYXRpb25cbiAgICBpZiAoZGlyZWN0aW9uKSB7XG4gICAgICBsZXQgY3VydmUgPSBwcm9ncmVzcztcbiAgICAgIHN3aXRjaCAocHJvZ3Jlc3MpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT0gXCJhbHRlcm5hdGVcIikgcmV2ZXJzZUtleWZyYW1lcyhrZXlmcmFtZXMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKGxvb3ApXG4gICAgICAgICAgICByZXNldFRpbWUob2JqZWN0KTtcbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFsbC5kZWxldGUob2JqZWN0KTtcbiAgICAgICAgICAgIGlmIChvcHRpbWl6ZSAmJiBlbGVtZW50KSBhY2NlbGVyYXRlKGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKGdhdXNzaWFuKSBjbGVhckJsdXIoZWxlbWVudCwgZ2F1c3NpYW4pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZW5kKSBlbmQob3B0aW9ucyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY3VydmUgPSBlYXNlKGVhc2luZywgcHJvZ3Jlc3MpO1xuICAgICAgfVxuICAgICAgaWYgKGdhdXNzaWFuKSBzZXREZXZpYXRpb24ob2JqZWN0LCBjdXJ2ZSk7XG4gICAgICBpZiAoY2hhbmdlICYmIGVuZCkgY2hhbmdlKGN1cnZlKTtcbiAgICAgIGlmIChlbGVtZW50KSBPYmplY3QuYXNzaWduKGVsZW1lbnQuc3R5bGUsIGNyZWF0ZVN0eWxlcyhrZXlmcmFtZXMsIGN1cnZlKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gb2JqZWN0IGlzIGEgZGVsYXlcbiAgICBpZiAocHJvZ3Jlc3MgPCAxKSByZXR1cm47XG4gICAgYWxsLmRlbGV0ZShvYmplY3QpO1xuICAgIGVuZChkdXJhdGlvbik7XG4gIH0pO1xuXG4gIGlmIChhbGwuc2l6ZSkgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xufTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInZpc2liaWxpdHljaGFuZ2VcIiwgKCkgPT4ge1xuICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICBpZiAoZG9jdW1lbnQuaGlkZGVuKSB7XG4gICAgY29uc3Qge2FsbH0gPSByQUY7XG4gICAgcGF1c2VkLnRpbWUgPSBub3c7XG4gICAgcGF1c2VkLmFsbCA9IG5ldyBTZXQoYWxsKTtcbiAgICBhbGwuY2xlYXIoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB7YWxsLCB0aW1lfSA9IHBhdXNlZDtcbiAgaWYgKCFhbGwpIHJldHVybjtcbiAgY29uc3QgZWxhcHNlZCA9IG5vdyAtIHRpbWU7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PlxuICAgIGFsbC5mb3JFYWNoKG9iamVjdCA9PiB7XG4gICAgICBvYmplY3Quc3RhcnRUaW1lICs9IGVsYXBzZWQ7XG4gICAgICByQUYuYWRkKG9iamVjdCk7XG4gICAgfSkpO1xufSk7XG5cblxuLy8gZXhwb3J0c1xuLy8gPT09PT09PVxuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25zID0+XG4gIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gYWRkQW5pbWF0aW9ucyhvcHRpb25zLCByZXNvbHZlKSk7XG5cbmV4cG9ydCBjb25zdCBkZWxheSA9IGR1cmF0aW9uID0+XG4gIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gckFGLmFkZCh7XG4gICAgZHVyYXRpb24sXG4gICAgZW5kOiByZXNvbHZlXG4gIH0pKTtcblxuZXhwb3J0IGNvbnN0IHN0b3AgPSBlbGVtZW50cyA9PiB7XG4gIGNvbnN0IHthbGx9ID0gckFGO1xuICBjb25zdCBub2RlcyA9IGdldEVsZW1lbnRzKGVsZW1lbnRzKTtcbiAgYWxsLmZvckVhY2gob2JqZWN0ID0+IHtcbiAgICBpZiAobm9kZXMuaW5jbHVkZXMob2JqZWN0LmVsZW1lbnQpKSBhbGwuZGVsZXRlKG9iamVjdCk7XG4gIH0pO1xuICByZXR1cm4gbm9kZXM7XG59O1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYC5jb250YWN0UGFnZXtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDQ1cHggYXV0byAxZnIgYXV0bztcbn1cbi5jb250YWN0UGFnZSA+IGRpdjpudGgtY2hpbGQoMyl7XG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xuICAgIG1hcmdpbi10b3A6IDEwcHg7XG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcbn1cbi5jb250YWN0UGFnZSA+IC5uYXZpZ2F0aW9uID4gZGl2Om50aC1jaGlsZCgzKXtcbiAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgdmFyKC0tdGV4dC1jb2xvcik7XG59XG5cbi5jb250YWN0UGFnZSBpbWd7XG4gICAgaGVpZ2h0OiA1MHB4O1xufVxuLmNvbnRhY3RQYWdlIC5tZW51ID4gZGl2e1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBmb250LXNpemU6IDJyZW07XG4gICAgZ2FwOjEwcHg7XG59XG4uY29udGFjdFBhZ2UgLm1lbnV7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG4ubWFwc3tcbiAgICBtYXJnaW46MjBweDtcbn1cbi5jb250YWN0UGFnZSAubWVudSA+IGRpdjpudGgtY2hpbGQoMyl7XG4gICAgbWFyZ2luOjEwcHg7XG59XG5gLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9jc3MvY29udGFjdHBhZ2UuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBO0lBQ0ksWUFBWTtJQUNaLGFBQWE7SUFDYixzQ0FBc0M7QUFDMUM7QUFDQTtJQUNJLGtCQUFrQjtJQUNsQixnQkFBZ0I7SUFDaEIsbUJBQW1CO0FBQ3ZCO0FBQ0E7SUFDSSwwQ0FBMEM7QUFDOUM7O0FBRUE7SUFDSSxZQUFZO0FBQ2hCO0FBQ0E7SUFDSSxhQUFhO0lBQ2IsdUJBQXVCO0lBQ3ZCLG1CQUFtQjtJQUNuQixlQUFlO0lBQ2YsUUFBUTtBQUNaO0FBQ0E7SUFDSSxhQUFhO0lBQ2Isc0JBQXNCO0lBQ3RCLHVCQUF1QjtJQUN2QixtQkFBbUI7QUFDdkI7QUFDQTtJQUNJLFdBQVc7QUFDZjtBQUNBO0lBQ0ksV0FBVztBQUNmXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIi5jb250YWN0UGFnZXtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDQ1cHggYXV0byAxZnIgYXV0bztcXG59XFxuLmNvbnRhY3RQYWdlID4gZGl2Om50aC1jaGlsZCgzKXtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBtYXJnaW4tdG9wOiAxMHB4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xcbn1cXG4uY29udGFjdFBhZ2UgPiAubmF2aWdhdGlvbiA+IGRpdjpudGgtY2hpbGQoMyl7XFxuICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS10ZXh0LWNvbG9yKTtcXG59XFxuXFxuLmNvbnRhY3RQYWdlIGltZ3tcXG4gICAgaGVpZ2h0OiA1MHB4O1xcbn1cXG4uY29udGFjdFBhZ2UgLm1lbnUgPiBkaXZ7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBmb250LXNpemU6IDJyZW07XFxuICAgIGdhcDoxMHB4O1xcbn1cXG4uY29udGFjdFBhZ2UgLm1lbnV7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4ubWFwc3tcXG4gICAgbWFyZ2luOjIwcHg7XFxufVxcbi5jb250YWN0UGFnZSAubWVudSA+IGRpdjpudGgtY2hpbGQoMyl7XFxuICAgIG1hcmdpbjoxMHB4O1xcbn1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYC5ob21lUGFnZXtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6NDVweCByZXBlYXQoMixhdXRvKSAxZnIgYXV0byBhdXRvO1xufVxuXG4ubmF2aWdhdGlvbntcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGdhcDoxMDBweDtcbiAgICBtYXJnaW46IDEwcHg7XG4gICAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xuICAgIHotaW5kZXg6IDE7XG5cbn1cbmhye1xuICAgIHdpZHRoOiA1MCU7XG4gICAgYm9yZGVyOjFweCBzb2xpZCBibGFjaztcbiAgICB6LWluZGV4OiAxO1xufVxuLmhlYWRpbmd7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7ICAgIFxufVxuLm1haW5DYXJke1xuICAgIGRpc3BsYXk6IGZsZXg7XG59XG4uZm9vdGVye1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBnYXA6MTBweDtcbn1cbi5mb290ZXIgaW1ne1xuICAgIGhlaWdodDogNDBweDtcbn1cbi5mb290ZXIgaW1nOmhvdmVye1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDcyMGRlZyk7XG4gICAgdHJhbnNpdGlvbjogYWxsIDFzO1xufVxuLmhlYWRpbmcgPiBpbWd7XG4gICAgaGVpZ2h0OiA0MzBweDtcbn1cbi5oZWFkaW5nID4gZGl2Om50aC1jaGlsZCgyKXtcbiAgICBjb2xvcjogd2hpdGU7XG4gICAgb3BhY2l0eTogMC43O1xuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xuICAgIG1hcmdpbi10b3A6LTYwcHg7XG4gICAgbWFyZ2luLWJvdHRvbTogNTBweDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XG59XG5cbi8qIENhcmRzICovXG4ubWFpbkNhcmR7XG4gICAgd2lkdGg6IDgwJTtcbiAgICBtYXJnaW46MCBhdXRvO1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywxZnIpO1xuICAgIGdhcDoyMHB4O1xuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcbiAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xufVxuXG4uY2FyZHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIGhlaWdodDogMzAwcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDoyMHB4O1xuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xuICAgIHBhZGRpbmc6MjBweDtcbiAgICBvdmVyZmxvdzogYXV0bzsgIFxuICAgIGJvcmRlcjogM3B4IHNvbGlkIGJsYWNrO1xuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI0NiwxNzUsMTMzLDAuNyk7XG5cbn1cbi5tYWluQ2FyZCA+IGRpdjpudGgtY2hpbGQoMil7XG4gICAgei1pbmRleDogMTtcbn1cbi5jYXJkIGltZ3tcbiAgICBoZWlnaHQ6IDUwcHg7XG59XG4uY2FyZCA+IGRpdjpudGgtY2hpbGQoMil7XG4gICAgZm9udC1zaXplOiAxLjVyZW07XG59XG4uY2FyZCA+IGRpdjpudGgtY2hpbGQoMyl7XG4gICAgb3BhY2l0eTogMC42O1xuICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbn1cblxuLyogbmF2aWdhdGlvbiBzZWxlY3Rpb24gYmFyICovXG4ubmF2aWdhdGlvbiA+IGRpdntcbiAgICBwYWRkaW5nLXJpZ2h0OiA1cHg7XG4gICAgcGFkZGluZy1sZWZ0OiA1cHg7XG59XG4uaG9tZVBhZ2UgPiAubmF2aWdhdGlvbiA+IGRpdjpudGgtY2hpbGQoMSl7XG4gICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLXRleHQtY29sb3IpO1xufVxuXG5gLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9jc3MvaG9tZXBhZ2UuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBO0lBQ0ksWUFBWTtJQUNaLGFBQWE7SUFDYixvREFBb0Q7QUFDeEQ7O0FBRUE7SUFDSSxhQUFhO0lBQ2IsdUJBQXVCO0lBQ3ZCLFNBQVM7SUFDVCxZQUFZO0lBQ1osd0JBQXdCO0lBQ3hCLFVBQVU7O0FBRWQ7QUFDQTtJQUNJLFVBQVU7SUFDVixzQkFBc0I7SUFDdEIsVUFBVTtBQUNkO0FBQ0E7SUFDSSxhQUFhO0lBQ2Isc0JBQXNCO0lBQ3RCLG1CQUFtQjtBQUN2QjtBQUNBO0lBQ0ksYUFBYTtBQUNqQjtBQUNBO0lBQ0ksYUFBYTtJQUNiLG1CQUFtQjtJQUNuQix1QkFBdUI7SUFDdkIsUUFBUTtBQUNaO0FBQ0E7SUFDSSxZQUFZO0FBQ2hCO0FBQ0E7SUFDSSx5QkFBeUI7SUFDekIsa0JBQWtCO0FBQ3RCO0FBQ0E7SUFDSSxhQUFhO0FBQ2pCO0FBQ0E7SUFDSSxZQUFZO0lBQ1osWUFBWTtJQUNaLGlCQUFpQjtJQUNqQixnQkFBZ0I7SUFDaEIsbUJBQW1CO0lBQ25CLHdCQUF3QjtBQUM1Qjs7QUFFQSxVQUFVO0FBQ1Y7SUFDSSxVQUFVO0lBQ1YsYUFBYTtJQUNiLGFBQWE7SUFDYixvQ0FBb0M7SUFDcEMsUUFBUTtJQUNSLGtCQUFrQjtJQUNsQixtQkFBbUI7QUFDdkI7O0FBRUE7SUFDSSxzQkFBc0I7SUFDdEIsYUFBYTtJQUNiLHVCQUF1QjtJQUN2QixrQkFBa0I7SUFDbEIsYUFBYTtJQUNiLHNCQUFzQjtJQUN0Qix1QkFBdUI7SUFDdkIsbUJBQW1CO0lBQ25CLFFBQVE7SUFDUixpQkFBaUI7SUFDakIsWUFBWTtJQUNaLGNBQWM7SUFDZCx1QkFBdUI7SUFDdkIsa0JBQWtCO0lBQ2xCLHVCQUF1QjtJQUN2Qix1Q0FBdUM7O0FBRTNDO0FBQ0E7SUFDSSxVQUFVO0FBQ2Q7QUFDQTtJQUNJLFlBQVk7QUFDaEI7QUFDQTtJQUNJLGlCQUFpQjtBQUNyQjtBQUNBO0lBQ0ksWUFBWTtJQUNaLGtCQUFrQjtBQUN0Qjs7QUFFQSw2QkFBNkI7QUFDN0I7SUFDSSxrQkFBa0I7SUFDbEIsaUJBQWlCO0FBQ3JCO0FBQ0E7SUFDSSwwQ0FBMEM7QUFDOUNcIixcInNvdXJjZXNDb250ZW50XCI6W1wiLmhvbWVQYWdle1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtcm93czo0NXB4IHJlcGVhdCgyLGF1dG8pIDFmciBhdXRvIGF1dG87XFxufVxcblxcbi5uYXZpZ2F0aW9ue1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgZ2FwOjEwMHB4O1xcbiAgICBtYXJnaW46IDEwcHg7XFxuICAgIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcXG4gICAgei1pbmRleDogMTtcXG5cXG59XFxuaHJ7XFxuICAgIHdpZHRoOiA1MCU7XFxuICAgIGJvcmRlcjoxcHggc29saWQgYmxhY2s7XFxuICAgIHotaW5kZXg6IDE7XFxufVxcbi5oZWFkaW5ne1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyAgICBcXG59XFxuLm1haW5DYXJke1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbn1cXG4uZm9vdGVye1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgZ2FwOjEwcHg7XFxufVxcbi5mb290ZXIgaW1ne1xcbiAgICBoZWlnaHQ6IDQwcHg7XFxufVxcbi5mb290ZXIgaW1nOmhvdmVye1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSg3MjBkZWcpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMXM7XFxufVxcbi5oZWFkaW5nID4gaW1ne1xcbiAgICBoZWlnaHQ6IDQzMHB4O1xcbn1cXG4uaGVhZGluZyA+IGRpdjpudGgtY2hpbGQoMil7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG4gICAgb3BhY2l0eTogMC43O1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgbWFyZ2luLXRvcDotNjBweDtcXG4gICAgbWFyZ2luLWJvdHRvbTogNTBweDtcXG4gICAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xcbn1cXG5cXG4vKiBDYXJkcyAqL1xcbi5tYWluQ2FyZHtcXG4gICAgd2lkdGg6IDgwJTtcXG4gICAgbWFyZ2luOjAgYXV0bztcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywxZnIpO1xcbiAgICBnYXA6MjBweDtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xcbn1cXG5cXG4uY2FyZHtcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gICAgaGVpZ2h0OiAzMDBweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGdhcDoyMHB4O1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgcGFkZGluZzoyMHB4O1xcbiAgICBvdmVyZmxvdzogYXV0bzsgIFxcbiAgICBib3JkZXI6IDNweCBzb2xpZCBibGFjaztcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNDYsMTc1LDEzMywwLjcpO1xcblxcbn1cXG4ubWFpbkNhcmQgPiBkaXY6bnRoLWNoaWxkKDIpe1xcbiAgICB6LWluZGV4OiAxO1xcbn1cXG4uY2FyZCBpbWd7XFxuICAgIGhlaWdodDogNTBweDtcXG59XFxuLmNhcmQgPiBkaXY6bnRoLWNoaWxkKDIpe1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG59XFxuLmNhcmQgPiBkaXY6bnRoLWNoaWxkKDMpe1xcbiAgICBvcGFjaXR5OiAwLjY7XFxuICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcXG59XFxuXFxuLyogbmF2aWdhdGlvbiBzZWxlY3Rpb24gYmFyICovXFxuLm5hdmlnYXRpb24gPiBkaXZ7XFxuICAgIHBhZGRpbmctcmlnaHQ6IDVweDtcXG4gICAgcGFkZGluZy1sZWZ0OiA1cHg7XFxufVxcbi5ob21lUGFnZSA+IC5uYXZpZ2F0aW9uID4gZGl2Om50aC1jaGlsZCgxKXtcXG4gICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLXRleHQtY29sb3IpO1xcbn1cXG5cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiQGltcG9ydCB1cmwoaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1QYXRyaWNrK0hhbmQmZGlzcGxheT1zd2FwKTtcIl0pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGA6cm9vdHtcbiAgICBmb250LWZhbWlseTogJ1BhdHJpY2sgSGFuZCcsIGN1cnNpdmU7XG4gICAgLS10ZXh0LWNvbG9yOiByZ2JhKDI0NiwxNzUsMTMzLDI1NSk7XG4gICAgLS1iZy1jb2xvcjogIHJnYmEoNzMsOTYsMTY2LDI1NSlcbn1cblxuYm9keXtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iZy1jb2xvcik7XG4gICAgaGVpZ2h0OiA5OXZoO1xuICAgIHdpZHRoOiAxMDB2dztcbn1cbi5jb250ZW50e1xuICAgIGhlaWdodDogOTl2aDtcbiAgICB3aWR0aDogMTAwdnc7XG59XG5idXR0b257XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmctY29sb3IpO1xuICAgIGJvcmRlcjowcHg7IFxuICAgIGNvbG9yOnZhcigtLXRleHQtY29sb3IpXG59YCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvY3NzL2luZGV4LmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFDQTtJQUNJLG9DQUFvQztJQUNwQyxtQ0FBbUM7SUFDbkM7QUFDSjs7QUFFQTtJQUNJLGlDQUFpQztJQUNqQyxZQUFZO0lBQ1osWUFBWTtBQUNoQjtBQUNBO0lBQ0ksWUFBWTtJQUNaLFlBQVk7QUFDaEI7QUFDQTtJQUNJLGlDQUFpQztJQUNqQyxVQUFVO0lBQ1Y7QUFDSlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAaW1wb3J0IHVybCgnaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1QYXRyaWNrK0hhbmQmZGlzcGxheT1zd2FwJyk7XFxuOnJvb3R7XFxuICAgIGZvbnQtZmFtaWx5OiAnUGF0cmljayBIYW5kJywgY3Vyc2l2ZTtcXG4gICAgLS10ZXh0LWNvbG9yOiByZ2JhKDI0NiwxNzUsMTMzLDI1NSk7XFxuICAgIC0tYmctY29sb3I6ICByZ2JhKDczLDk2LDE2NiwyNTUpXFxufVxcblxcbmJvZHl7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJnLWNvbG9yKTtcXG4gICAgaGVpZ2h0OiA5OXZoO1xcbiAgICB3aWR0aDogMTAwdnc7XFxufVxcbi5jb250ZW50e1xcbiAgICBoZWlnaHQ6IDk5dmg7XFxuICAgIHdpZHRoOiAxMDB2dztcXG59XFxuYnV0dG9ue1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iZy1jb2xvcik7XFxuICAgIGJvcmRlcjowcHg7IFxcbiAgICBjb2xvcjp2YXIoLS10ZXh0LWNvbG9yKVxcbn1cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYC5tZW51UGFnZXtcbiAgICBoZWlnaHQ6IDk5dmg7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDQ1cHggYXV0byAxZnIgYXV0byBhdXRvOyAgIFxufVxuLm1lbnVQYWdlID4gZGl2Om50aC1jaGlsZCgzKXtcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XG59XG4ub3V0ZXJNZW51e1xuICAgIGhlaWdodDogNzh2aDtcbiAgICB3aWR0aDogNzB2dztcbiAgICBtYXJnaW46MCBhdXRvOyAgICBcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbiAgICBib3JkZXI6M3B4IHNvbGlkIGJsYWNrO1xuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tdGV4dC1jb2xvcilcbiAgICBcbn1cbi5tZW51e1xuICAgIGhlaWdodDogOTAlO1xuICAgIHdpZHRoOiA5NSU7XG4gICAgYm9yZGVyOjNweCBzb2xpZCBibGFjaztcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgb3ZlcmZsb3c6IGF1dG87XG59XG4ubWVudVBhZ2UgLm1lbnUge1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywgMWZyKTtcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDI0MHB4IDFmcjtcbiAgICBncmlkLWF1dG8tZmxvdzogY29sdW1uO1xufVxuLm1lbnVQYWdlIC5tZW51IGhyIHtcbiAgICBib3JkZXI6IDJweCBzb2xpZCBibGFjaztcbiAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogNTAlO1xuICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiA1MCU7XG4gICAgd2lkdGg6IDgwJTtcbiAgICBtYXJnaW46MHB4O1xufVxuLnRpdGxle1xuICAgIHBhZGRpbmc6MTBweDtcbiAgICBmb250LXNpemU6IDVyZW07XG4gICAgbWFyZ2luLXRvcDoxMHB4O1xuICAgIHBhZGRpbmctdG9wOjBweDtcbiAgICBib3JkZXItcmlnaHQ6IDJweCBzb2xpZCBibGFjaztcbiAgICB6LWluZGV4OiAyO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xufVxuXG5zZWN0aW9uIGltZyB7XG4gICAgd2lkdGg6IDEyMHB4O1xuICAgIGhlaWdodDogODJweDtcbiAgICBib3JkZXItcmFkaXVzOiAyMCU7XG4gICAgYm9yZGVyOjJweCBzb2xpZCBibGFjaztcbiAgICBtYXJnaW4tbGVmdDogMTBweDtcbn1cblxuc2VjdGlvbiA+IGRpdjpudGgtY2hpbGQoMSl7XG4gICAgZm9udC1zaXplOiAxLjVyZW07XG4gICAgbWFyZ2luOiAxMHB4O1xuICAgIHBhZGRpbmctbGVmdDoxMHB4O1xuICAgIGZvbnQtd2VpZ2h0OiBib2xkZXI7XG4gICAgYm9yZGVyOiAycHggc29saWQgYmxhY2s7XG4gICAgd2lkdGg6IDg4cHg7XG4gICAgaGVpZ2h0OiA0MHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDUlO1xuICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDMwJTtcbiAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMzAlO1xufVxuc2VjdGlvbiA+IGRpdntcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byAxZnI7XG4gICAgZ3JpZC1hdXRvLWZsb3c6IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGZvbnQtc2l6ZTogMS41cmVtO1xuICAgIGdhcDoxMHB4O1xuICAgIG1hcmdpbi1ib3R0b206IDVweDtcbn1cbnNlY3Rpb24gPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDMpe1xuICAgIG1hcmdpbi1yaWdodDogMTVweDtcbn1cbi5wYXN0cnl7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDYwcHggcmVwZWF0KDMsYXV0byk7XG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcbiAgICBib3JkZXItcmlnaHQ6IDJweCBzb2xpZCBibGFjaztcbiAgICB6LWluZGV4OiAyO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xufVxuLmRlc2VydCxcbi5kcmlua3tcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtcm93OiAxIC8gMztcbiAgICBtYXJnaW4tdG9wOjEwcHg7XG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcbn1cbi5kZXNlcnR7XG4gICAgYm9yZGVyLXJpZ2h0OiAycHggc29saWQgYmxhY2s7XG4gICAgei1pbmRleDogMTtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbn1cbi5kZXNlcnQgPiBkaXY6bnRoLWNoaWxkKDEpe1xuICAgIHdpZHRoOiA4MHB4O1xuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcbn1cbi5kcmluayA+IGRpdjpudGgtY2hpbGQoMSl7XG4gICAgd2lkdGg6IDcwcHg7XG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xufVxuLm1lbnVQYWdlID4gLm5hdmlnYXRpb24gPiBkaXY6bnRoLWNoaWxkKDIpe1xuICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS10ZXh0LWNvbG9yKTtcbn1cbi5kcmlua3tcbiAgICB6LWluZGV4OiAwO1xufVxuYCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvY3NzL21lbnVwYWdlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTtJQUNJLFlBQVk7SUFDWixhQUFhO0lBQ2IsMkNBQTJDO0FBQy9DO0FBQ0E7SUFDSSxrQkFBa0I7QUFDdEI7QUFDQTtJQUNJLFlBQVk7SUFDWixXQUFXO0lBQ1gsYUFBYTtJQUNiLHVCQUF1QjtJQUN2QixzQkFBc0I7SUFDdEIsa0JBQWtCO0lBQ2xCLGFBQWE7SUFDYix1QkFBdUI7SUFDdkIsbUJBQW1CO0lBQ25COztBQUVKO0FBQ0E7SUFDSSxXQUFXO0lBQ1gsVUFBVTtJQUNWLHNCQUFzQjtJQUN0QixrQkFBa0I7SUFDbEIsdUJBQXVCO0lBQ3ZCLGNBQWM7QUFDbEI7QUFDQTtJQUNJLGFBQWE7SUFDYixxQ0FBcUM7SUFDckMsNkJBQTZCO0lBQzdCLHNCQUFzQjtBQUMxQjtBQUNBO0lBQ0ksdUJBQXVCO0lBQ3ZCLDRCQUE0QjtJQUM1QiwrQkFBK0I7SUFDL0IsVUFBVTtJQUNWLFVBQVU7QUFDZDtBQUNBO0lBQ0ksWUFBWTtJQUNaLGVBQWU7SUFDZixlQUFlO0lBQ2YsZUFBZTtJQUNmLDZCQUE2QjtJQUM3QixVQUFVO0lBQ1YsdUJBQXVCO0FBQzNCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLFlBQVk7SUFDWixrQkFBa0I7SUFDbEIsc0JBQXNCO0lBQ3RCLGlCQUFpQjtBQUNyQjs7QUFFQTtJQUNJLGlCQUFpQjtJQUNqQixZQUFZO0lBQ1osaUJBQWlCO0lBQ2pCLG1CQUFtQjtJQUNuQix1QkFBdUI7SUFDdkIsV0FBVztJQUNYLFlBQVk7SUFDWixpQkFBaUI7SUFDakIsMkJBQTJCO0lBQzNCLDRCQUE0QjtBQUNoQztBQUNBO0lBQ0ksYUFBYTtJQUNiLCtCQUErQjtJQUMvQixzQkFBc0I7SUFDdEIsbUJBQW1CO0lBQ25CLGlCQUFpQjtJQUNqQixRQUFRO0lBQ1Isa0JBQWtCO0FBQ3RCO0FBQ0E7SUFDSSxrQkFBa0I7QUFDdEI7QUFDQTtJQUNJLGFBQWE7SUFDYix1Q0FBdUM7SUFDdkMsbUJBQW1CO0lBQ25CLDZCQUE2QjtJQUM3QixVQUFVO0lBQ1YsdUJBQXVCO0FBQzNCO0FBQ0E7O0lBRUksYUFBYTtJQUNiLGVBQWU7SUFDZixlQUFlO0lBQ2YsbUJBQW1CO0FBQ3ZCO0FBQ0E7SUFDSSw2QkFBNkI7SUFDN0IsVUFBVTtJQUNWLHVCQUF1QjtBQUMzQjtBQUNBO0lBQ0ksV0FBVztJQUNYLGtCQUFrQjtBQUN0QjtBQUNBO0lBQ0ksV0FBVztJQUNYLGtCQUFrQjtBQUN0QjtBQUNBO0lBQ0ksMENBQTBDO0FBQzlDO0FBQ0E7SUFDSSxVQUFVO0FBQ2RcIixcInNvdXJjZXNDb250ZW50XCI6W1wiLm1lbnVQYWdle1xcbiAgICBoZWlnaHQ6IDk5dmg7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtcm93czogNDVweCBhdXRvIDFmciBhdXRvIGF1dG87ICAgXFxufVxcbi5tZW51UGFnZSA+IGRpdjpudGgtY2hpbGQoMyl7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG59XFxuLm91dGVyTWVudXtcXG4gICAgaGVpZ2h0OiA3OHZoO1xcbiAgICB3aWR0aDogNzB2dztcXG4gICAgbWFyZ2luOjAgYXV0bzsgICAgXFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgICBib3JkZXI6M3B4IHNvbGlkIGJsYWNrO1xcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKVxcbiAgICBcXG59XFxuLm1lbnV7XFxuICAgIGhlaWdodDogOTAlO1xcbiAgICB3aWR0aDogOTUlO1xcbiAgICBib3JkZXI6M3B4IHNvbGlkIGJsYWNrO1xcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgICBvdmVyZmxvdzogYXV0bztcXG59XFxuLm1lbnVQYWdlIC5tZW51IHtcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywgMWZyKTtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiAyNDBweCAxZnI7XFxuICAgIGdyaWQtYXV0by1mbG93OiBjb2x1bW47XFxufVxcbi5tZW51UGFnZSAubWVudSBociB7XFxuICAgIGJvcmRlcjogMnB4IHNvbGlkIGJsYWNrO1xcbiAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogNTAlO1xcbiAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogNTAlO1xcbiAgICB3aWR0aDogODAlO1xcbiAgICBtYXJnaW46MHB4O1xcbn1cXG4udGl0bGV7XFxuICAgIHBhZGRpbmc6MTBweDtcXG4gICAgZm9udC1zaXplOiA1cmVtO1xcbiAgICBtYXJnaW4tdG9wOjEwcHg7XFxuICAgIHBhZGRpbmctdG9wOjBweDtcXG4gICAgYm9yZGVyLXJpZ2h0OiAycHggc29saWQgYmxhY2s7XFxuICAgIHotaW5kZXg6IDI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbn1cXG5cXG5zZWN0aW9uIGltZyB7XFxuICAgIHdpZHRoOiAxMjBweDtcXG4gICAgaGVpZ2h0OiA4MnB4O1xcbiAgICBib3JkZXItcmFkaXVzOiAyMCU7XFxuICAgIGJvcmRlcjoycHggc29saWQgYmxhY2s7XFxuICAgIG1hcmdpbi1sZWZ0OiAxMHB4O1xcbn1cXG5cXG5zZWN0aW9uID4gZGl2Om50aC1jaGlsZCgxKXtcXG4gICAgZm9udC1zaXplOiAxLjVyZW07XFxuICAgIG1hcmdpbjogMTBweDtcXG4gICAgcGFkZGluZy1sZWZ0OjEwcHg7XFxuICAgIGZvbnQtd2VpZ2h0OiBib2xkZXI7XFxuICAgIGJvcmRlcjogMnB4IHNvbGlkIGJsYWNrO1xcbiAgICB3aWR0aDogODhweDtcXG4gICAgaGVpZ2h0OiA0MHB4O1xcbiAgICBib3JkZXItcmFkaXVzOiA1JTtcXG4gICAgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogMzAlO1xcbiAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMzAlO1xcbn1cXG5zZWN0aW9uID4gZGl2e1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IGF1dG8gMWZyO1xcbiAgICBncmlkLWF1dG8tZmxvdzogY29sdW1uO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gICAgZ2FwOjEwcHg7XFxuICAgIG1hcmdpbi1ib3R0b206IDVweDtcXG59XFxuc2VjdGlvbiA+IGRpdiA+IGRpdjpudGgtY2hpbGQoMyl7XFxuICAgIG1hcmdpbi1yaWdodDogMTVweDtcXG59XFxuLnBhc3RyeXtcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiA2MHB4IHJlcGVhdCgzLGF1dG8pO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xcbiAgICBib3JkZXItcmlnaHQ6IDJweCBzb2xpZCBibGFjaztcXG4gICAgei1pbmRleDogMjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxufVxcbi5kZXNlcnQsXFxuLmRyaW5re1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXJvdzogMSAvIDM7XFxuICAgIG1hcmdpbi10b3A6MTBweDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcXG59XFxuLmRlc2VydHtcXG4gICAgYm9yZGVyLXJpZ2h0OiAycHggc29saWQgYmxhY2s7XFxuICAgIHotaW5kZXg6IDE7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbn1cXG4uZGVzZXJ0ID4gZGl2Om50aC1jaGlsZCgxKXtcXG4gICAgd2lkdGg6IDgwcHg7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG59XFxuLmRyaW5rID4gZGl2Om50aC1jaGlsZCgxKXtcXG4gICAgd2lkdGg6IDcwcHg7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG59XFxuLm1lbnVQYWdlID4gLm5hdmlnYXRpb24gPiBkaXY6bnRoLWNoaWxkKDIpe1xcbiAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgdmFyKC0tdGV4dC1jb2xvcik7XFxufVxcbi5kcmlua3tcXG4gICAgei1pbmRleDogMDtcXG59XFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAvKiEgbm9ybWFsaXplLmNzcyB2OC4wLjEgfCBNSVQgTGljZW5zZSB8IGdpdGh1Yi5jb20vbmVjb2xhcy9ub3JtYWxpemUuY3NzICovXG5cbi8qIERvY3VtZW50XG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4vKipcbiAqIDEuIENvcnJlY3QgdGhlIGxpbmUgaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cbiAqIDIuIFByZXZlbnQgYWRqdXN0bWVudHMgb2YgZm9udCBzaXplIGFmdGVyIG9yaWVudGF0aW9uIGNoYW5nZXMgaW4gaU9TLlxuICovXG5cbiBodG1sIHtcbiAgICBsaW5lLWhlaWdodDogMS4xNTsgLyogMSAqL1xuICAgIC13ZWJraXQtdGV4dC1zaXplLWFkanVzdDogMTAwJTsgLyogMiAqL1xuICB9XG4gIFxuICAvKiBTZWN0aW9uc1xuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuICBcbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgbWFyZ2luIGluIGFsbCBicm93c2Vycy5cbiAgICovXG4gIFxuICBib2R5IHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIFxcYG1haW5cXGAgZWxlbWVudCBjb25zaXN0ZW50bHkgaW4gSUUuXG4gICAqL1xuICBcbiAgbWFpbiB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBDb3JyZWN0IHRoZSBmb250IHNpemUgYW5kIG1hcmdpbiBvbiBcXGBoMVxcYCBlbGVtZW50cyB3aXRoaW4gXFxgc2VjdGlvblxcYCBhbmRcbiAgICogXFxgYXJ0aWNsZVxcYCBjb250ZXh0cyBpbiBDaHJvbWUsIEZpcmVmb3gsIGFuZCBTYWZhcmkuXG4gICAqL1xuICBcbiAgaDEge1xuICAgIGZvbnQtc2l6ZTogMmVtO1xuICAgIG1hcmdpbjogMC42N2VtIDA7XG4gIH1cbiAgXG4gIC8qIEdyb3VwaW5nIGNvbnRlbnRcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbiAgXG4gIC8qKlxuICAgKiAxLiBBZGQgdGhlIGNvcnJlY3QgYm94IHNpemluZyBpbiBGaXJlZm94LlxuICAgKiAyLiBTaG93IHRoZSBvdmVyZmxvdyBpbiBFZGdlIGFuZCBJRS5cbiAgICovXG4gIFxuICBociB7XG4gICAgYm94LXNpemluZzogY29udGVudC1ib3g7IC8qIDEgKi9cbiAgICBoZWlnaHQ6IDA7IC8qIDEgKi9cbiAgICBvdmVyZmxvdzogdmlzaWJsZTsgLyogMiAqL1xuICB9XG4gIFxuICAvKipcbiAgICogMS4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2UgYW5kIHNjYWxpbmcgb2YgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cbiAgICogMi4gQ29ycmVjdCB0aGUgb2RkIFxcYGVtXFxgIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cbiAgICovXG4gIFxuICBwcmUge1xuICAgIGZvbnQtZmFtaWx5OiBtb25vc3BhY2UsIG1vbm9zcGFjZTsgLyogMSAqL1xuICAgIGZvbnQtc2l6ZTogMWVtOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qIFRleHQtbGV2ZWwgc2VtYW50aWNzXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4gIFxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBncmF5IGJhY2tncm91bmQgb24gYWN0aXZlIGxpbmtzIGluIElFIDEwLlxuICAgKi9cbiAgXG4gIGEge1xuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xuICB9XG4gIFxuICAvKipcbiAgICogMS4gUmVtb3ZlIHRoZSBib3R0b20gYm9yZGVyIGluIENocm9tZSA1Ny1cbiAgICogMi4gQWRkIHRoZSBjb3JyZWN0IHRleHQgZGVjb3JhdGlvbiBpbiBDaHJvbWUsIEVkZ2UsIElFLCBPcGVyYSwgYW5kIFNhZmFyaS5cbiAgICovXG4gIFxuICBhYmJyW3RpdGxlXSB7XG4gICAgYm9yZGVyLWJvdHRvbTogbm9uZTsgLyogMSAqL1xuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyAvKiAyICovXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkOyAvKiAyICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZm9udCB3ZWlnaHQgaW4gQ2hyb21lLCBFZGdlLCBhbmQgU2FmYXJpLlxuICAgKi9cbiAgXG4gIGIsXG4gIHN0cm9uZyB7XG4gICAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbiAgfVxuICBcbiAgLyoqXG4gICAqIDEuIENvcnJlY3QgdGhlIGluaGVyaXRhbmNlIGFuZCBzY2FsaW5nIG9mIGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXG4gICAqIDIuIENvcnJlY3QgdGhlIG9kZCBcXGBlbVxcYCBmb250IHNpemluZyBpbiBhbGwgYnJvd3NlcnMuXG4gICAqL1xuICBcbiAgY29kZSxcbiAga2JkLFxuICBzYW1wIHtcbiAgICBmb250LWZhbWlseTogbW9ub3NwYWNlLCBtb25vc3BhY2U7IC8qIDEgKi9cbiAgICBmb250LXNpemU6IDFlbTsgLyogMiAqL1xuICB9XG4gIFxuICAvKipcbiAgICogQWRkIHRoZSBjb3JyZWN0IGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXG4gICAqL1xuICBcbiAgc21hbGwge1xuICAgIGZvbnQtc2l6ZTogODAlO1xuICB9XG4gIFxuICAvKipcbiAgICogUHJldmVudCBcXGBzdWJcXGAgYW5kIFxcYHN1cFxcYCBlbGVtZW50cyBmcm9tIGFmZmVjdGluZyB0aGUgbGluZSBoZWlnaHQgaW5cbiAgICogYWxsIGJyb3dzZXJzLlxuICAgKi9cbiAgXG4gIHN1YixcbiAgc3VwIHtcbiAgICBmb250LXNpemU6IDc1JTtcbiAgICBsaW5lLWhlaWdodDogMDtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xuICB9XG4gIFxuICBzdWIge1xuICAgIGJvdHRvbTogLTAuMjVlbTtcbiAgfVxuICBcbiAgc3VwIHtcbiAgICB0b3A6IC0wLjVlbTtcbiAgfVxuICBcbiAgLyogRW1iZWRkZWQgY29udGVudFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuICBcbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgYm9yZGVyIG9uIGltYWdlcyBpbnNpZGUgbGlua3MgaW4gSUUgMTAuXG4gICAqL1xuICBcbiAgaW1nIHtcbiAgICBib3JkZXItc3R5bGU6IG5vbmU7XG4gIH1cbiAgXG4gIC8qIEZvcm1zXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4gIFxuICAvKipcbiAgICogMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXG4gICAqIDIuIFJlbW92ZSB0aGUgbWFyZ2luIGluIEZpcmVmb3ggYW5kIFNhZmFyaS5cbiAgICovXG4gIFxuICBidXR0b24sXG4gIGlucHV0LFxuICBvcHRncm91cCxcbiAgc2VsZWN0LFxuICB0ZXh0YXJlYSB7XG4gICAgZm9udC1mYW1pbHk6IGluaGVyaXQ7IC8qIDEgKi9cbiAgICBmb250LXNpemU6IDEwMCU7IC8qIDEgKi9cbiAgICBsaW5lLWhlaWdodDogMS4xNTsgLyogMSAqL1xuICAgIG1hcmdpbjogMDsgLyogMiAqL1xuICB9XG4gIFxuICAvKipcbiAgICogU2hvdyB0aGUgb3ZlcmZsb3cgaW4gSUUuXG4gICAqIDEuIFNob3cgdGhlIG92ZXJmbG93IGluIEVkZ2UuXG4gICAqL1xuICBcbiAgYnV0dG9uLFxuICBpbnB1dCB7IC8qIDEgKi9cbiAgICBvdmVyZmxvdzogdmlzaWJsZTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgaW5oZXJpdGFuY2Ugb2YgdGV4dCB0cmFuc2Zvcm0gaW4gRWRnZSwgRmlyZWZveCwgYW5kIElFLlxuICAgKiAxLiBSZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEZpcmVmb3guXG4gICAqL1xuICBcbiAgYnV0dG9uLFxuICBzZWxlY3QgeyAvKiAxICovXG4gICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxuICAgKi9cbiAgXG4gIGJ1dHRvbixcbiAgW3R5cGU9XCJidXR0b25cIl0sXG4gIFt0eXBlPVwicmVzZXRcIl0sXG4gIFt0eXBlPVwic3VibWl0XCJdIHtcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IGJ1dHRvbjtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgaW5uZXIgYm9yZGVyIGFuZCBwYWRkaW5nIGluIEZpcmVmb3guXG4gICAqL1xuICBcbiAgYnV0dG9uOjotbW96LWZvY3VzLWlubmVyLFxuICBbdHlwZT1cImJ1dHRvblwiXTo6LW1vei1mb2N1cy1pbm5lcixcbiAgW3R5cGU9XCJyZXNldFwiXTo6LW1vei1mb2N1cy1pbm5lcixcbiAgW3R5cGU9XCJzdWJtaXRcIl06Oi1tb3otZm9jdXMtaW5uZXIge1xuICAgIGJvcmRlci1zdHlsZTogbm9uZTtcbiAgICBwYWRkaW5nOiAwO1xuICB9XG4gIFxuICAvKipcbiAgICogUmVzdG9yZSB0aGUgZm9jdXMgc3R5bGVzIHVuc2V0IGJ5IHRoZSBwcmV2aW91cyBydWxlLlxuICAgKi9cbiAgXG4gIGJ1dHRvbjotbW96LWZvY3VzcmluZyxcbiAgW3R5cGU9XCJidXR0b25cIl06LW1vei1mb2N1c3JpbmcsXG4gIFt0eXBlPVwicmVzZXRcIl06LW1vei1mb2N1c3JpbmcsXG4gIFt0eXBlPVwic3VibWl0XCJdOi1tb3otZm9jdXNyaW5nIHtcbiAgICBvdXRsaW5lOiAxcHggZG90dGVkIEJ1dHRvblRleHQ7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBDb3JyZWN0IHRoZSBwYWRkaW5nIGluIEZpcmVmb3guXG4gICAqL1xuICBcbiAgZmllbGRzZXQge1xuICAgIHBhZGRpbmc6IDAuMzVlbSAwLjc1ZW0gMC42MjVlbTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIDEuIENvcnJlY3QgdGhlIHRleHQgd3JhcHBpbmcgaW4gRWRnZSBhbmQgSUUuXG4gICAqIDIuIENvcnJlY3QgdGhlIGNvbG9yIGluaGVyaXRhbmNlIGZyb20gXFxgZmllbGRzZXRcXGAgZWxlbWVudHMgaW4gSUUuXG4gICAqIDMuIFJlbW92ZSB0aGUgcGFkZGluZyBzbyBkZXZlbG9wZXJzIGFyZSBub3QgY2F1Z2h0IG91dCB3aGVuIHRoZXkgemVybyBvdXRcbiAgICogICAgXFxgZmllbGRzZXRcXGAgZWxlbWVudHMgaW4gYWxsIGJyb3dzZXJzLlxuICAgKi9cbiAgXG4gIGxlZ2VuZCB7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xuICAgIGNvbG9yOiBpbmhlcml0OyAvKiAyICovXG4gICAgZGlzcGxheTogdGFibGU7IC8qIDEgKi9cbiAgICBtYXgtd2lkdGg6IDEwMCU7IC8qIDEgKi9cbiAgICBwYWRkaW5nOiAwOyAvKiAzICovXG4gICAgd2hpdGUtc3BhY2U6IG5vcm1hbDsgLyogMSAqL1xuICB9XG4gIFxuICAvKipcbiAgICogQWRkIHRoZSBjb3JyZWN0IHZlcnRpY2FsIGFsaWdubWVudCBpbiBDaHJvbWUsIEZpcmVmb3gsIGFuZCBPcGVyYS5cbiAgICovXG4gIFxuICBwcm9ncmVzcyB7XG4gICAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xuICB9XG4gIFxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBkZWZhdWx0IHZlcnRpY2FsIHNjcm9sbGJhciBpbiBJRSAxMCsuXG4gICAqL1xuICBcbiAgdGV4dGFyZWEge1xuICAgIG92ZXJmbG93OiBhdXRvO1xuICB9XG4gIFxuICAvKipcbiAgICogMS4gQWRkIHRoZSBjb3JyZWN0IGJveCBzaXppbmcgaW4gSUUgMTAuXG4gICAqIDIuIFJlbW92ZSB0aGUgcGFkZGluZyBpbiBJRSAxMC5cbiAgICovXG4gIFxuICBbdHlwZT1cImNoZWNrYm94XCJdLFxuICBbdHlwZT1cInJhZGlvXCJdIHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94OyAvKiAxICovXG4gICAgcGFkZGluZzogMDsgLyogMiAqL1xuICB9XG4gIFxuICAvKipcbiAgICogQ29ycmVjdCB0aGUgY3Vyc29yIHN0eWxlIG9mIGluY3JlbWVudCBhbmQgZGVjcmVtZW50IGJ1dHRvbnMgaW4gQ2hyb21lLlxuICAgKi9cbiAgXG4gIFt0eXBlPVwibnVtYmVyXCJdOjotd2Via2l0LWlubmVyLXNwaW4tYnV0dG9uLFxuICBbdHlwZT1cIm51bWJlclwiXTo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiB7XG4gICAgaGVpZ2h0OiBhdXRvO1xuICB9XG4gIFxuICAvKipcbiAgICogMS4gQ29ycmVjdCB0aGUgb2RkIGFwcGVhcmFuY2UgaW4gQ2hyb21lIGFuZCBTYWZhcmkuXG4gICAqIDIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxuICAgKi9cbiAgXG4gIFt0eXBlPVwic2VhcmNoXCJdIHtcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IHRleHRmaWVsZDsgLyogMSAqL1xuICAgIG91dGxpbmUtb2Zmc2V0OiAtMnB4OyAvKiAyICovXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGlubmVyIHBhZGRpbmcgaW4gQ2hyb21lIGFuZCBTYWZhcmkgb24gbWFjT1MuXG4gICAqL1xuICBcbiAgW3R5cGU9XCJzZWFyY2hcIl06Oi13ZWJraXQtc2VhcmNoLWRlY29yYXRpb24ge1xuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIDEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4gICAqIDIuIENoYW5nZSBmb250IHByb3BlcnRpZXMgdG8gXFxgaW5oZXJpdFxcYCBpbiBTYWZhcmkuXG4gICAqL1xuICBcbiAgOjotd2Via2l0LWZpbGUtdXBsb2FkLWJ1dHRvbiB7XG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cbiAgICBmb250OiBpbmhlcml0OyAvKiAyICovXG4gIH1cbiAgXG4gIC8qIEludGVyYWN0aXZlXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4gIFxuICAvKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBFZGdlLCBJRSAxMCssIGFuZCBGaXJlZm94LlxuICAgKi9cbiAgXG4gIGRldGFpbHMge1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICB9XG4gIFxuICAvKlxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBhbGwgYnJvd3NlcnMuXG4gICAqL1xuICBcbiAgc3VtbWFyeSB7XG4gICAgZGlzcGxheTogbGlzdC1pdGVtO1xuICB9XG4gIFxuICAvKiBNaXNjXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4gIFxuICAvKipcbiAgICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gSUUgMTArLlxuICAgKi9cbiAgXG4gIHRlbXBsYXRlIHtcbiAgICBkaXNwbGF5OiBub25lO1xuICB9XG4gIFxuICAvKipcbiAgICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gSUUgMTAuXG4gICAqL1xuICBcbiAgW2hpZGRlbl0ge1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gIH1cbiAgYCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvY3NzL25vcm1hbGl6ZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUEsMkVBQTJFOztBQUUzRTsrRUFDK0U7O0FBRS9FOzs7RUFHRTs7Q0FFRDtJQUNHLGlCQUFpQixFQUFFLE1BQU07SUFDekIsOEJBQThCLEVBQUUsTUFBTTtFQUN4Qzs7RUFFQTtpRkFDK0U7O0VBRS9FOztJQUVFOztFQUVGO0lBQ0UsU0FBUztFQUNYOztFQUVBOztJQUVFOztFQUVGO0lBQ0UsY0FBYztFQUNoQjs7RUFFQTs7O0lBR0U7O0VBRUY7SUFDRSxjQUFjO0lBQ2QsZ0JBQWdCO0VBQ2xCOztFQUVBO2lGQUMrRTs7RUFFL0U7OztJQUdFOztFQUVGO0lBQ0UsdUJBQXVCLEVBQUUsTUFBTTtJQUMvQixTQUFTLEVBQUUsTUFBTTtJQUNqQixpQkFBaUIsRUFBRSxNQUFNO0VBQzNCOztFQUVBOzs7SUFHRTs7RUFFRjtJQUNFLGlDQUFpQyxFQUFFLE1BQU07SUFDekMsY0FBYyxFQUFFLE1BQU07RUFDeEI7O0VBRUE7aUZBQytFOztFQUUvRTs7SUFFRTs7RUFFRjtJQUNFLDZCQUE2QjtFQUMvQjs7RUFFQTs7O0lBR0U7O0VBRUY7SUFDRSxtQkFBbUIsRUFBRSxNQUFNO0lBQzNCLDBCQUEwQixFQUFFLE1BQU07SUFDbEMsaUNBQWlDLEVBQUUsTUFBTTtFQUMzQzs7RUFFQTs7SUFFRTs7RUFFRjs7SUFFRSxtQkFBbUI7RUFDckI7O0VBRUE7OztJQUdFOztFQUVGOzs7SUFHRSxpQ0FBaUMsRUFBRSxNQUFNO0lBQ3pDLGNBQWMsRUFBRSxNQUFNO0VBQ3hCOztFQUVBOztJQUVFOztFQUVGO0lBQ0UsY0FBYztFQUNoQjs7RUFFQTs7O0lBR0U7O0VBRUY7O0lBRUUsY0FBYztJQUNkLGNBQWM7SUFDZCxrQkFBa0I7SUFDbEIsd0JBQXdCO0VBQzFCOztFQUVBO0lBQ0UsZUFBZTtFQUNqQjs7RUFFQTtJQUNFLFdBQVc7RUFDYjs7RUFFQTtpRkFDK0U7O0VBRS9FOztJQUVFOztFQUVGO0lBQ0Usa0JBQWtCO0VBQ3BCOztFQUVBO2lGQUMrRTs7RUFFL0U7OztJQUdFOztFQUVGOzs7OztJQUtFLG9CQUFvQixFQUFFLE1BQU07SUFDNUIsZUFBZSxFQUFFLE1BQU07SUFDdkIsaUJBQWlCLEVBQUUsTUFBTTtJQUN6QixTQUFTLEVBQUUsTUFBTTtFQUNuQjs7RUFFQTs7O0lBR0U7O0VBRUY7VUFDUSxNQUFNO0lBQ1osaUJBQWlCO0VBQ25COztFQUVBOzs7SUFHRTs7RUFFRjtXQUNTLE1BQU07SUFDYixvQkFBb0I7RUFDdEI7O0VBRUE7O0lBRUU7O0VBRUY7Ozs7SUFJRSwwQkFBMEI7RUFDNUI7O0VBRUE7O0lBRUU7O0VBRUY7Ozs7SUFJRSxrQkFBa0I7SUFDbEIsVUFBVTtFQUNaOztFQUVBOztJQUVFOztFQUVGOzs7O0lBSUUsOEJBQThCO0VBQ2hDOztFQUVBOztJQUVFOztFQUVGO0lBQ0UsOEJBQThCO0VBQ2hDOztFQUVBOzs7OztJQUtFOztFQUVGO0lBQ0Usc0JBQXNCLEVBQUUsTUFBTTtJQUM5QixjQUFjLEVBQUUsTUFBTTtJQUN0QixjQUFjLEVBQUUsTUFBTTtJQUN0QixlQUFlLEVBQUUsTUFBTTtJQUN2QixVQUFVLEVBQUUsTUFBTTtJQUNsQixtQkFBbUIsRUFBRSxNQUFNO0VBQzdCOztFQUVBOztJQUVFOztFQUVGO0lBQ0Usd0JBQXdCO0VBQzFCOztFQUVBOztJQUVFOztFQUVGO0lBQ0UsY0FBYztFQUNoQjs7RUFFQTs7O0lBR0U7O0VBRUY7O0lBRUUsc0JBQXNCLEVBQUUsTUFBTTtJQUM5QixVQUFVLEVBQUUsTUFBTTtFQUNwQjs7RUFFQTs7SUFFRTs7RUFFRjs7SUFFRSxZQUFZO0VBQ2Q7O0VBRUE7OztJQUdFOztFQUVGO0lBQ0UsNkJBQTZCLEVBQUUsTUFBTTtJQUNyQyxvQkFBb0IsRUFBRSxNQUFNO0VBQzlCOztFQUVBOztJQUVFOztFQUVGO0lBQ0Usd0JBQXdCO0VBQzFCOztFQUVBOzs7SUFHRTs7RUFFRjtJQUNFLDBCQUEwQixFQUFFLE1BQU07SUFDbEMsYUFBYSxFQUFFLE1BQU07RUFDdkI7O0VBRUE7aUZBQytFOztFQUUvRTs7SUFFRTs7RUFFRjtJQUNFLGNBQWM7RUFDaEI7O0VBRUE7O0lBRUU7O0VBRUY7SUFDRSxrQkFBa0I7RUFDcEI7O0VBRUE7aUZBQytFOztFQUUvRTs7SUFFRTs7RUFFRjtJQUNFLGFBQWE7RUFDZjs7RUFFQTs7SUFFRTs7RUFFRjtJQUNFLGFBQWE7RUFDZlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIvKiEgbm9ybWFsaXplLmNzcyB2OC4wLjEgfCBNSVQgTGljZW5zZSB8IGdpdGh1Yi5jb20vbmVjb2xhcy9ub3JtYWxpemUuY3NzICovXFxuXFxuLyogRG9jdW1lbnRcXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIGxpbmUgaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cXG4gKiAyLiBQcmV2ZW50IGFkanVzdG1lbnRzIG9mIGZvbnQgc2l6ZSBhZnRlciBvcmllbnRhdGlvbiBjaGFuZ2VzIGluIGlPUy5cXG4gKi9cXG5cXG4gaHRtbCB7XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjE1OyAvKiAxICovXFxuICAgIC13ZWJraXQtdGV4dC1zaXplLWFkanVzdDogMTAwJTsgLyogMiAqL1xcbiAgfVxcbiAgXFxuICAvKiBTZWN0aW9uc1xcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4gIFxcbiAgLyoqXFxuICAgKiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBhbGwgYnJvd3NlcnMuXFxuICAgKi9cXG4gIFxcbiAgYm9keSB7XFxuICAgIG1hcmdpbjogMDtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBSZW5kZXIgdGhlIGBtYWluYCBlbGVtZW50IGNvbnNpc3RlbnRseSBpbiBJRS5cXG4gICAqL1xcbiAgXFxuICBtYWluIHtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogQ29ycmVjdCB0aGUgZm9udCBzaXplIGFuZCBtYXJnaW4gb24gYGgxYCBlbGVtZW50cyB3aXRoaW4gYHNlY3Rpb25gIGFuZFxcbiAgICogYGFydGljbGVgIGNvbnRleHRzIGluIENocm9tZSwgRmlyZWZveCwgYW5kIFNhZmFyaS5cXG4gICAqL1xcbiAgXFxuICBoMSB7XFxuICAgIGZvbnQtc2l6ZTogMmVtO1xcbiAgICBtYXJnaW46IDAuNjdlbSAwO1xcbiAgfVxcbiAgXFxuICAvKiBHcm91cGluZyBjb250ZW50XFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcbiAgXFxuICAvKipcXG4gICAqIDEuIEFkZCB0aGUgY29ycmVjdCBib3ggc2l6aW5nIGluIEZpcmVmb3guXFxuICAgKiAyLiBTaG93IHRoZSBvdmVyZmxvdyBpbiBFZGdlIGFuZCBJRS5cXG4gICAqL1xcbiAgXFxuICBociB7XFxuICAgIGJveC1zaXppbmc6IGNvbnRlbnQtYm94OyAvKiAxICovXFxuICAgIGhlaWdodDogMDsgLyogMSAqL1xcbiAgICBvdmVyZmxvdzogdmlzaWJsZTsgLyogMiAqL1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIDEuIENvcnJlY3QgdGhlIGluaGVyaXRhbmNlIGFuZCBzY2FsaW5nIG9mIGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXFxuICAgKiAyLiBDb3JyZWN0IHRoZSBvZGQgYGVtYCBmb250IHNpemluZyBpbiBhbGwgYnJvd3NlcnMuXFxuICAgKi9cXG4gIFxcbiAgcHJlIHtcXG4gICAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZSwgbW9ub3NwYWNlOyAvKiAxICovXFxuICAgIGZvbnQtc2l6ZTogMWVtOyAvKiAyICovXFxuICB9XFxuICBcXG4gIC8qIFRleHQtbGV2ZWwgc2VtYW50aWNzXFxuICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcbiAgXFxuICAvKipcXG4gICAqIFJlbW92ZSB0aGUgZ3JheSBiYWNrZ3JvdW5kIG9uIGFjdGl2ZSBsaW5rcyBpbiBJRSAxMC5cXG4gICAqL1xcbiAgXFxuICBhIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogMS4gUmVtb3ZlIHRoZSBib3R0b20gYm9yZGVyIGluIENocm9tZSA1Ny1cXG4gICAqIDIuIEFkZCB0aGUgY29ycmVjdCB0ZXh0IGRlY29yYXRpb24gaW4gQ2hyb21lLCBFZGdlLCBJRSwgT3BlcmEsIGFuZCBTYWZhcmkuXFxuICAgKi9cXG4gIFxcbiAgYWJiclt0aXRsZV0ge1xcbiAgICBib3JkZXItYm90dG9tOiBub25lOyAvKiAxICovXFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyAvKiAyICovXFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lIGRvdHRlZDsgLyogMiAqL1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIEFkZCB0aGUgY29ycmVjdCBmb250IHdlaWdodCBpbiBDaHJvbWUsIEVkZ2UsIGFuZCBTYWZhcmkuXFxuICAgKi9cXG4gIFxcbiAgYixcXG4gIHN0cm9uZyB7XFxuICAgIGZvbnQtd2VpZ2h0OiBib2xkZXI7XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogMS4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2UgYW5kIHNjYWxpbmcgb2YgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cXG4gICAqIDIuIENvcnJlY3QgdGhlIG9kZCBgZW1gIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cXG4gICAqL1xcbiAgXFxuICBjb2RlLFxcbiAga2JkLFxcbiAgc2FtcCB7XFxuICAgIGZvbnQtZmFtaWx5OiBtb25vc3BhY2UsIG1vbm9zcGFjZTsgLyogMSAqL1xcbiAgICBmb250LXNpemU6IDFlbTsgLyogMiAqL1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIEFkZCB0aGUgY29ycmVjdCBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxcbiAgICovXFxuICBcXG4gIHNtYWxsIHtcXG4gICAgZm9udC1zaXplOiA4MCU7XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogUHJldmVudCBgc3ViYCBhbmQgYHN1cGAgZWxlbWVudHMgZnJvbSBhZmZlY3RpbmcgdGhlIGxpbmUgaGVpZ2h0IGluXFxuICAgKiBhbGwgYnJvd3NlcnMuXFxuICAgKi9cXG4gIFxcbiAgc3ViLFxcbiAgc3VwIHtcXG4gICAgZm9udC1zaXplOiA3NSU7XFxuICAgIGxpbmUtaGVpZ2h0OiAwO1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcXG4gIH1cXG4gIFxcbiAgc3ViIHtcXG4gICAgYm90dG9tOiAtMC4yNWVtO1xcbiAgfVxcbiAgXFxuICBzdXAge1xcbiAgICB0b3A6IC0wLjVlbTtcXG4gIH1cXG4gIFxcbiAgLyogRW1iZWRkZWQgY29udGVudFxcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4gIFxcbiAgLyoqXFxuICAgKiBSZW1vdmUgdGhlIGJvcmRlciBvbiBpbWFnZXMgaW5zaWRlIGxpbmtzIGluIElFIDEwLlxcbiAgICovXFxuICBcXG4gIGltZyB7XFxuICAgIGJvcmRlci1zdHlsZTogbm9uZTtcXG4gIH1cXG4gIFxcbiAgLyogRm9ybXNcXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuICBcXG4gIC8qKlxcbiAgICogMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXFxuICAgKiAyLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBGaXJlZm94IGFuZCBTYWZhcmkuXFxuICAgKi9cXG4gIFxcbiAgYnV0dG9uLFxcbiAgaW5wdXQsXFxuICBvcHRncm91cCxcXG4gIHNlbGVjdCxcXG4gIHRleHRhcmVhIHtcXG4gICAgZm9udC1mYW1pbHk6IGluaGVyaXQ7IC8qIDEgKi9cXG4gICAgZm9udC1zaXplOiAxMDAlOyAvKiAxICovXFxuICAgIGxpbmUtaGVpZ2h0OiAxLjE1OyAvKiAxICovXFxuICAgIG1hcmdpbjogMDsgLyogMiAqL1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIFNob3cgdGhlIG92ZXJmbG93IGluIElFLlxcbiAgICogMS4gU2hvdyB0aGUgb3ZlcmZsb3cgaW4gRWRnZS5cXG4gICAqL1xcbiAgXFxuICBidXR0b24sXFxuICBpbnB1dCB7IC8qIDEgKi9cXG4gICAgb3ZlcmZsb3c6IHZpc2libGU7XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogUmVtb3ZlIHRoZSBpbmhlcml0YW5jZSBvZiB0ZXh0IHRyYW5zZm9ybSBpbiBFZGdlLCBGaXJlZm94LCBhbmQgSUUuXFxuICAgKiAxLiBSZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEZpcmVmb3guXFxuICAgKi9cXG4gIFxcbiAgYnV0dG9uLFxcbiAgc2VsZWN0IHsgLyogMSAqL1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogbm9uZTtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxcbiAgICovXFxuICBcXG4gIGJ1dHRvbixcXG4gIFt0eXBlPVxcXCJidXR0b25cXFwiXSxcXG4gIFt0eXBlPVxcXCJyZXNldFxcXCJdLFxcbiAgW3R5cGU9XFxcInN1Ym1pdFxcXCJdIHtcXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogUmVtb3ZlIHRoZSBpbm5lciBib3JkZXIgYW5kIHBhZGRpbmcgaW4gRmlyZWZveC5cXG4gICAqL1xcbiAgXFxuICBidXR0b246Oi1tb3otZm9jdXMtaW5uZXIsXFxuICBbdHlwZT1cXFwiYnV0dG9uXFxcIl06Oi1tb3otZm9jdXMtaW5uZXIsXFxuICBbdHlwZT1cXFwicmVzZXRcXFwiXTo6LW1vei1mb2N1cy1pbm5lcixcXG4gIFt0eXBlPVxcXCJzdWJtaXRcXFwiXTo6LW1vei1mb2N1cy1pbm5lciB7XFxuICAgIGJvcmRlci1zdHlsZTogbm9uZTtcXG4gICAgcGFkZGluZzogMDtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBSZXN0b3JlIHRoZSBmb2N1cyBzdHlsZXMgdW5zZXQgYnkgdGhlIHByZXZpb3VzIHJ1bGUuXFxuICAgKi9cXG4gIFxcbiAgYnV0dG9uOi1tb3otZm9jdXNyaW5nLFxcbiAgW3R5cGU9XFxcImJ1dHRvblxcXCJdOi1tb3otZm9jdXNyaW5nLFxcbiAgW3R5cGU9XFxcInJlc2V0XFxcIl06LW1vei1mb2N1c3JpbmcsXFxuICBbdHlwZT1cXFwic3VibWl0XFxcIl06LW1vei1mb2N1c3Jpbmcge1xcbiAgICBvdXRsaW5lOiAxcHggZG90dGVkIEJ1dHRvblRleHQ7XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogQ29ycmVjdCB0aGUgcGFkZGluZyBpbiBGaXJlZm94LlxcbiAgICovXFxuICBcXG4gIGZpZWxkc2V0IHtcXG4gICAgcGFkZGluZzogMC4zNWVtIDAuNzVlbSAwLjYyNWVtO1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIDEuIENvcnJlY3QgdGhlIHRleHQgd3JhcHBpbmcgaW4gRWRnZSBhbmQgSUUuXFxuICAgKiAyLiBDb3JyZWN0IHRoZSBjb2xvciBpbmhlcml0YW5jZSBmcm9tIGBmaWVsZHNldGAgZWxlbWVudHMgaW4gSUUuXFxuICAgKiAzLiBSZW1vdmUgdGhlIHBhZGRpbmcgc28gZGV2ZWxvcGVycyBhcmUgbm90IGNhdWdodCBvdXQgd2hlbiB0aGV5IHplcm8gb3V0XFxuICAgKiAgICBgZmllbGRzZXRgIGVsZW1lbnRzIGluIGFsbCBicm93c2Vycy5cXG4gICAqL1xcbiAgXFxuICBsZWdlbmQge1xcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94OyAvKiAxICovXFxuICAgIGNvbG9yOiBpbmhlcml0OyAvKiAyICovXFxuICAgIGRpc3BsYXk6IHRhYmxlOyAvKiAxICovXFxuICAgIG1heC13aWR0aDogMTAwJTsgLyogMSAqL1xcbiAgICBwYWRkaW5nOiAwOyAvKiAzICovXFxuICAgIHdoaXRlLXNwYWNlOiBub3JtYWw7IC8qIDEgKi9cXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBBZGQgdGhlIGNvcnJlY3QgdmVydGljYWwgYWxpZ25tZW50IGluIENocm9tZSwgRmlyZWZveCwgYW5kIE9wZXJhLlxcbiAgICovXFxuICBcXG4gIHByb2dyZXNzIHtcXG4gICAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIFJlbW92ZSB0aGUgZGVmYXVsdCB2ZXJ0aWNhbCBzY3JvbGxiYXIgaW4gSUUgMTArLlxcbiAgICovXFxuICBcXG4gIHRleHRhcmVhIHtcXG4gICAgb3ZlcmZsb3c6IGF1dG87XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogMS4gQWRkIHRoZSBjb3JyZWN0IGJveCBzaXppbmcgaW4gSUUgMTAuXFxuICAgKiAyLiBSZW1vdmUgdGhlIHBhZGRpbmcgaW4gSUUgMTAuXFxuICAgKi9cXG4gIFxcbiAgW3R5cGU9XFxcImNoZWNrYm94XFxcIl0sXFxuICBbdHlwZT1cXFwicmFkaW9cXFwiXSB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC8qIDEgKi9cXG4gICAgcGFkZGluZzogMDsgLyogMiAqL1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIENvcnJlY3QgdGhlIGN1cnNvciBzdHlsZSBvZiBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudCBidXR0b25zIGluIENocm9tZS5cXG4gICAqL1xcbiAgXFxuICBbdHlwZT1cXFwibnVtYmVyXFxcIl06Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24sXFxuICBbdHlwZT1cXFwibnVtYmVyXFxcIl06Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b24ge1xcbiAgICBoZWlnaHQ6IGF1dG87XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogMS4gQ29ycmVjdCB0aGUgb2RkIGFwcGVhcmFuY2UgaW4gQ2hyb21lIGFuZCBTYWZhcmkuXFxuICAgKiAyLiBDb3JyZWN0IHRoZSBvdXRsaW5lIHN0eWxlIGluIFNhZmFyaS5cXG4gICAqL1xcbiAgXFxuICBbdHlwZT1cXFwic2VhcmNoXFxcIl0ge1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IHRleHRmaWVsZDsgLyogMSAqL1xcbiAgICBvdXRsaW5lLW9mZnNldDogLTJweDsgLyogMiAqL1xcbiAgfVxcbiAgXFxuICAvKipcXG4gICAqIFJlbW92ZSB0aGUgaW5uZXIgcGFkZGluZyBpbiBDaHJvbWUgYW5kIFNhZmFyaSBvbiBtYWNPUy5cXG4gICAqL1xcbiAgXFxuICBbdHlwZT1cXFwic2VhcmNoXFxcIl06Oi13ZWJraXQtc2VhcmNoLWRlY29yYXRpb24ge1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XFxuICB9XFxuICBcXG4gIC8qKlxcbiAgICogMS4gQ29ycmVjdCB0aGUgaW5hYmlsaXR5IHRvIHN0eWxlIGNsaWNrYWJsZSB0eXBlcyBpbiBpT1MgYW5kIFNhZmFyaS5cXG4gICAqIDIuIENoYW5nZSBmb250IHByb3BlcnRpZXMgdG8gYGluaGVyaXRgIGluIFNhZmFyaS5cXG4gICAqL1xcbiAgXFxuICA6Oi13ZWJraXQtZmlsZS11cGxvYWQtYnV0dG9uIHtcXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cXG4gICAgZm9udDogaW5oZXJpdDsgLyogMiAqL1xcbiAgfVxcbiAgXFxuICAvKiBJbnRlcmFjdGl2ZVxcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4gIFxcbiAgLypcXG4gICAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIEVkZ2UsIElFIDEwKywgYW5kIEZpcmVmb3guXFxuICAgKi9cXG4gIFxcbiAgZGV0YWlscyB7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgfVxcbiAgXFxuICAvKlxcbiAgICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gYWxsIGJyb3dzZXJzLlxcbiAgICovXFxuICBcXG4gIHN1bW1hcnkge1xcbiAgICBkaXNwbGF5OiBsaXN0LWl0ZW07XFxuICB9XFxuICBcXG4gIC8qIE1pc2NcXG4gICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuICBcXG4gIC8qKlxcbiAgICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gSUUgMTArLlxcbiAgICovXFxuICBcXG4gIHRlbXBsYXRlIHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG4gIFxcbiAgLyoqXFxuICAgKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBJRSAxMC5cXG4gICAqL1xcbiAgXFxuICBbaGlkZGVuXSB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxuICB9XFxuICBcIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107XG5cbiAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07XG5cbiAgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9jb250YWN0cGFnZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2NvbnRhY3RwYWdlLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9ob21lcGFnZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2hvbWVwYWdlLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9pbmRleC5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2luZGV4LmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9tZW51cGFnZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL21lbnVwYWdlLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9ub3JtYWxpemUuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9ub3JtYWxpemUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCJpbXBvcnQgYW5pbWF0ZSBmcm9tIFwiL25vZGVfbW9kdWxlcy9hbmltYXRlcGx1cy9hbmltYXRlcGx1cy5qc1wiO1xuXG5mdW5jdGlvbiBjb250YWN0QW5pbWF0aW9uKCl7XG4gICAgbGV0IGFsbERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGFjdFBhZ2VcIikuY2hpbGROb2RlcztcbiAgICBhbGxEaXYgPSBBcnJheS5mcm9tKGFsbERpdik7XG4gICAgYWxsRGl2LnNwbGljZSgxLDEpO1xuICAgIGFsbERpdi5zcGxpY2UoMiwxKTtcblxuICAgIGxldCBjb250YWN0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVudVwiKS5jaGlsZE5vZGVzO1xuICAgIGNvbnRhY3RzID0gQXJyYXkuZnJvbShjb250YWN0cyk7XG5cbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGFsbERpdlswXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlWSgtMjAwJSlcIiwgXCJ0cmFuc2xhdGVZKDAlKVwiXVxuICAgIH0pXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBjb250YWN0c1swXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1wic2tld1goMTgwZGVnKVwiLCBcInNrZXdYKDBkZWcpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGNvbnRhY3RzWzJdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJza2V3WCgxODBkZWcpXCIsIFwic2tld1goMGRlZylcIl1cbiAgICB9KVxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogY29udGFjdHNbM10sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInNrZXdYKDE4MGRlZylcIiwgXCJza2V3WCgwZGVnKVwiXVxuICAgIH0pXG5cbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGFsbERpdlsyXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlWSgxNTAlKVwiLCBcInRyYW5zbGF0ZSgwJSlcIl1cbiAgICB9KVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb250YWN0QW5pbWF0aW9uIiwiaW1wb3J0IGFuaW1hdGUgZnJvbSBcIi9ub2RlX21vZHVsZXMvYW5pbWF0ZXBsdXMvYW5pbWF0ZXBsdXMuanNcIjtcblxuZnVuY3Rpb24gYW5pbWF0aW9uKCl7XG4gICAgbGV0IGFsbERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaG9tZVBhZ2VcIikuY2hpbGROb2Rlc1xuICAgIGFsbERpdiA9IEFycmF5LmZyb20oYWxsRGl2KVxuICAgIGFsbERpdi5zcGxpY2UoMSwxKVxuICAgIGFsbERpdi5zcGxpY2UoMywxKVxuICAgIFxuICAgIGxldCBjYXJkcyA9IGFsbERpdlsyXS5jaGlsZE5vZGVzXG4gICAgY2FyZHMgPSBBcnJheS5mcm9tKGNhcmRzKVxuXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBhbGxEaXZbMF0sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4ge2luZGV4ICogMTAwfSwgXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlWSgtMjAwJSlcIiwgXCJ0cmFuc2xhdGVZKDAlKVwiXVxuICAgIH0pXG4gICAgICAgIFxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogYWxsRGl2WzFdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJzY2FsZSgwKVwiLCBcInNjYWxlKDEpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGNhcmRzWzFdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJzY2FsZSgwKVwiLCBcInNjYWxlKDEpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGNhcmRzWzBdLFxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgZGVsYXk6IGluZGV4ID0+IGluZGV4ICogMTAwLCBcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGUoLTEwMCUpXCIsIFwidHJhbnNsYXRlKDAlKVwiXVxuICAgIH0pXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBjYXJkc1syXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlKDEwMCUpXCIsIFwidHJhbnNsYXRlKDAlKVwiXVxuICAgIH0pXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBhbGxEaXZbM10sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInRyYW5zbGF0ZVkoMTUwJSlcIiwgXCJ0cmFuc2xhdGUoMCUpXCJdXG4gICAgfSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgYW5pbWF0aW9uO1xuIiwiaW1wb3J0IGFuaW1hdGUgZnJvbSBcIi9ub2RlX21vZHVsZXMvYW5pbWF0ZXBsdXMvYW5pbWF0ZXBsdXMuanNcIjtcblxuZnVuY3Rpb24gbWVudUFuaW1hdGlvbigpe1xuICAgIGxldCBhbGxEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lbnVQYWdlXCIpLmNoaWxkTm9kZXM7XG4gICAgYWxsRGl2ID0gQXJyYXkuZnJvbShhbGxEaXYpO1xuICAgIGFsbERpdi5zcGxpY2UoMSwxKVxuICAgIGFsbERpdi5zcGxpY2UoMiwxKVxuICAgIFxuICAgIGxldCBwYXN0cnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBhc3RyeVwiKS5jaGlsZE5vZGVzO1xuICAgIHBhc3RyeSA9IEFycmF5LmZyb20ocGFzdHJ5KTtcbiAgICBsZXQgZGVzZXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kZXNlcnRcIikuY2hpbGROb2RlcztcbiAgICBkZXNlcnQgPSBBcnJheS5mcm9tKGRlc2VydCk7XG4gICAgbGV0IGRyaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kcmlua1wiKS5jaGlsZE5vZGVzO1xuICAgIGRyaW5rID0gQXJyYXkuZnJvbShkcmluayk7XG5cbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IGFsbERpdlswXSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCwgXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlWSgtMjAwJSlcIiwgXCJ0cmFuc2xhdGVZKDAlKVwiXVxuICAgIH0pXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBhbGxEaXZbMl0sXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsIFxuICAgICAgICB0cmFuc2Zvcm06IFtcInRyYW5zbGF0ZVkoMTUwJSlcIiwgXCJ0cmFuc2xhdGUoMCUpXCJdXG4gICAgfSlcbiAgICBhbmltYXRlKHtcbiAgICAgICAgZWxlbWVudHM6IHBhc3RyeSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgIGRlbGF5OiBpbmRleCA9PiBpbmRleCAqIDEwMCxcbiAgICAgICAgdHJhbnNmb3JtOiBbXCJ0cmFuc2xhdGUoLTEwMCUpXCIsIFwidHJhbnNsYXRlKDAlKVwiXVxuICAgIH0pXG4gICAgYW5pbWF0ZSh7XG4gICAgICAgIGVsZW1lbnRzOiBkZXNlcnQsXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlKC0xMDAlKVwiLCBcInRyYW5zbGF0ZSgwJSlcIl1cbiAgICB9KVxuICAgIGFuaW1hdGUoe1xuICAgICAgICBlbGVtZW50czogZHJpbmssXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICBkZWxheTogaW5kZXggPT4gaW5kZXggKiAxMDAsXG4gICAgICAgIHRyYW5zZm9ybTogW1widHJhbnNsYXRlKC0xMDAlKVwiLCBcInRyYW5zbGF0ZSgwJSlcIl1cbiAgICB9KVxufVxuXG5leHBvcnQgZGVmYXVsdCBtZW51QW5pbWF0aW9uOyIsImltcG9ydCB7IG5hdmlnYXRpb25OYW1lIH0gZnJvbSBcIi4vaG9tZXBhZ2VcIjtcbmltcG9ydCBcIi4uL2Nzcy9jb250YWN0cGFnZS5jc3NcIlxuaW1wb3J0IHBob25lIGZyb20gXCIvaW1hZ2VzL3Bob25lLnN2Z1wiXG5pbXBvcnQgc3RvcmUgZnJvbSBcIi9pbWFnZXMvc3RvcmUuc3ZnXCJcbmltcG9ydCBmb290ZXIgZnJvbSBcIi4vZm9vdGVyXCI7XG5pbXBvcnQgY29udGFjdEFuaW1hdGlvbiBmcm9tIFwiLi4vYW5pbWF0aW9uL2FuaW1hdGVDb250YWN0UGFnZVwiO1xuXG5cbmZ1bmN0aW9uIGNvbnRhY3RwYWdlKCl7XG4gICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcblxuICAgIGNvbnN0IGNvbnRhY3RQYWdlQ29uZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb250YWN0UGFnZUNvbmVudC5jbGFzc0xpc3QuYWRkKFwiY29udGFjdFBhZ2VcIik7XG4gICAgXG4gICAgLyogbmF2aWdhdGlvbiAqL1xuICAgIGNvbnN0IG5hdmlnYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG5hdmlnYXRpb24uY2xhc3NMaXN0LmFkZChcIm5hdmlnYXRpb25cIik7XG4gICAgXG4gICAgbmF2aWdhdGlvbk5hbWUoXCJIb21lXCIsIG5hdmlnYXRpb24pO1xuICAgIG5hdmlnYXRpb25OYW1lKFwiTWVudVwiLCBuYXZpZ2F0aW9uKTtcbiAgICBuYXZpZ2F0aW9uTmFtZShcIkNvbnRhY3RcIiwgbmF2aWdhdGlvbik7XG5cbiAgICBjb250YWN0UGFnZUNvbmVudC5hcHBlbmRDaGlsZChuYXZpZ2F0aW9uKTtcbiAgICBjb250YWN0UGFnZUNvbmVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaHJcIikpO1xuICAgIFxuICAgIC8qIG91dGVyIGxvYXlvdXQgKi9cbiAgICBsZXQgb3V0ZXJNZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBvdXRlck1lbnUuY2xhc3NMaXN0LmFkZChcIm91dGVyTWVudVwiKTtcbiAgICBsZXQgbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbWVudS5jbGFzc0xpc3QuYWRkKFwibWVudVwiKTtcblxuICAgIC8qIGNvbnRhY3RzICovXG4gICAgbWVudS5hcHBlbmRDaGlsZChjb250YWN0cyhcIjY2NjY2IDk5OTk5IC8gOTk5OTkgNjY2NjZcIiwgcGhvbmUpKTtcbiAgICBtZW51LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoclwiKSlcbiAgICBtZW51LmFwcGVuZENoaWxkKGNvbnRhY3RzKFwiTGVzIEhhbGxlcyBDYXN0ZWxsYW5lcywgUnVlIGRlIGwnSGVyYmVyaWUsIDM0MDAwIE1vbnRwZWxsaWVyLCBGcmFuY2VcIiwgc3RvcmUpKVxuICAgIFxuICAgIC8qIG1hcHMgKi9cbiAgICBsZXQgbWFwcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG4gICAgbWFwcy5jbGFzc0xpc3QuYWRkKFwibWFwc1wiKVxuICAgIG1hcHMuc2V0QXR0cmlidXRlKFwic3JjXCIsIFwiaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9tYXBzL2VtYmVkP3BiPSExbTE4ITFtMTIhMW0zITFkMjg4OC44MjYxMjU1ODU5NDQ3ITJkMy44NzE5Mzc4OTMwMTYxODEhM2Q0My42MTAxNjE3ODA3MTU1MzYhMm0zITFmMCEyZjAhM2YwITNtMiExaTEwMjQhMmk3NjghNGYxMy4xITNtMyExbTIhMXMweDEyYjZhZmVlOGIwMjM0NTElM0EweDM0OTQwZWY5NDI1ZjI5MiEyelEzTERxRzFsSUdSbElHeGhJRU55dzZodFpRITVlMCEzbTIhMXNlbiEyc2luITR2MTY5NTY2MjgxMTY3MiE1bTIhMXNlbiEyc2luXCIpXG4gICAgbWFwcy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBcIjYwMFwiKTtcbiAgICBtYXBzLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBcIjQwMFwiKTtcbiAgICBtYXBzLnNldEF0dHJpYnV0ZShcImxvYWRpbmdcIiwgXCJsYXp5XCIpO1xuICAgIG1hcHMuc2V0QXR0cmlidXRlKFwicmVmZXJyZXJwb2xpY3lcIiwgXCJuby1yZWZlcnJlci13aGVuLWRvd25ncmFkZVwiKTtcbiAgICBtYXBzLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiYm9yZGVyOjJweCBzb2xpZCBibGFjaztib3JkZXItcmFkaXVzOjVweFwiKVxuICAgIG1lbnUuYXBwZW5kQ2hpbGQobWFwcyk7XG5cblxuICAgIG91dGVyTWVudS5hcHBlbmRDaGlsZChtZW51KTtcbiAgICBjb250YWN0UGFnZUNvbmVudC5hcHBlbmRDaGlsZChvdXRlck1lbnUpO1xuICAgIGNvbnRhY3RQYWdlQ29uZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoclwiKSlcbiAgICBjb250YWN0UGFnZUNvbmVudC5hcHBlbmRDaGlsZChmb290ZXIoKSk7XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChjb250YWN0UGFnZUNvbmVudCk7XG5cbiAgICBjb250YWN0QW5pbWF0aW9uKCk7XG59XG5cblxuZnVuY3Rpb24gY29udGFjdHMobnVtYmVyLCBpbWcpe1xuICAgIGxldCBjb250YWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBsZXQgY29udGFjdEltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgY29udGFjdEltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgaW1nKTtcbiAgICBsZXQgY29udGFjdE51bWJlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29udGFjdE51bWJlci50ZXh0Q29udGVudCA9IG51bWJlcjtcblxuICAgIGNvbnRhY3QuYXBwZW5kQ2hpbGQoY29udGFjdEltZyk7XG4gICAgY29udGFjdC5hcHBlbmRDaGlsZChjb250YWN0TnVtYmVyKTtcbiAgICByZXR1cm4gY29udGFjdFxufVxuZXhwb3J0IGRlZmF1bHQgY29udGFjdHBhZ2U7IiwiaW1wb3J0IGdpdGh1YiBmcm9tICBcIi9pbWFnZXMvZ2l0aHViLnN2Z1wiXG5cbmZ1bmN0aW9uIGZvb3RlcigpIHtcbiAgICBsZXQgbWFpbkZvb3RlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbWFpbkZvb3Rlci5jbGFzc0xpc3QuYWRkKFwiZm9vdGVyXCIpO1xuXG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LnRleHRDb250ZW50ID0gXCJNYWRlIGJ5IEFkaGl0aGl5YW5cIjtcbiAgICBtYWluRm9vdGVyLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICBsZXQgYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCJodHRwczovL2dpdGh1Yi5jb20veEFkaGl0aGl5YW5cIik7XG4gICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcbiAgICBsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICBpbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIGdpdGh1YilcblxuXG5cbiAgICBhbmNob3IuYXBwZW5kQ2hpbGQoaW1nKVxuICAgIG1haW5Gb290ZXIuYXBwZW5kQ2hpbGQoYW5jaG9yKTtcbiAgICByZXR1cm4gbWFpbkZvb3Rlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZm9vdGVyOyIsImltcG9ydCBob21lcGFnZUNhcmRzIGZyb20gXCIuL2hvbWVwYWdlQ2FyZHNcIjtcbmltcG9ydCBmb290ZXIgZnJvbSBcIi4vZm9vdGVyXCI7XG5pbXBvcnQgXCIuLi9jc3MvaG9tZXBhZ2UuY3NzXCJcbmltcG9ydCBsb2dvIGZyb20gXCIvaW1hZ2VzL2xvZ28uanBlZ1wiXG5pbXBvcnQgYW5pbWF0aW9uIGZyb20gXCIuLi9hbmltYXRpb24vYW5pbWF0ZUhvbWVQYWdlXCI7XG5cbmZ1bmN0aW9uIGhvbWVwYWdlKCl7XG4gICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcbiAgICBjb25zdCBob21lUGFnZUNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGhvbWVQYWdlQ29udGVudC5jbGFzc0xpc3QuYWRkKFwiaG9tZVBhZ2VcIik7XG5cblxuICAgIC8qIG5hdmlnYXRpb24gKi9cbiAgICBjb25zdCBuYXZpZ2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuYXZpZ2F0aW9uLmNsYXNzTGlzdC5hZGQoXCJuYXZpZ2F0aW9uXCIpO1xuICAgIFxuICAgIG5hdmlnYXRpb25OYW1lKFwiSG9tZVwiLCBuYXZpZ2F0aW9uKTtcbiAgICBuYXZpZ2F0aW9uTmFtZShcIk1lbnVcIiwgbmF2aWdhdGlvbik7XG4gICAgbmF2aWdhdGlvbk5hbWUoXCJDb250YWN0XCIsIG5hdmlnYXRpb24pO1xuXG4gICAgaG9tZVBhZ2VDb250ZW50LmFwcGVuZENoaWxkKG5hdmlnYXRpb24pO1xuICAgIGhvbWVQYWdlQ29udGVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaHJcIikpO1xuXG5cbiAgICAvKiBoZWFkaW5nICovXG4gICAgbGV0IGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGhlYWRpbmcuY2xhc3NMaXN0LmFkZChcImhlYWRpbmdcIik7XG5cbiAgICBsZXQgaGVhZGluZ05hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgIGhlYWRpbmdOYW1lLnNldEF0dHJpYnV0ZShcInNyY1wiLCBsb2dvKVxuICAgIGxldCBzdWJIZWFkaW5nTmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICBzdWJIZWFkaW5nTmFtZS50ZXh0Q29udGVudCA9IFwiU2luY2UgMTkyN1wiXG4gICAgXG4gICAgaGVhZGluZy5hcHBlbmRDaGlsZChoZWFkaW5nTmFtZSk7XG4gICAgaGVhZGluZy5hcHBlbmRDaGlsZChzdWJIZWFkaW5nTmFtZSlcbiAgICBob21lUGFnZUNvbnRlbnQuYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG5cbiAgICAvKiBjYXJkcyAqL1xuICAgIGxldCBtYWluQ2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbWFpbkNhcmQuY2xhc3NMaXN0LmFkZChcIm1haW5DYXJkXCIpO1xuICAgIGhvbWVwYWdlQ2FyZHMobWFpbkNhcmQsIFwiVGhlIE5ldyBZb3JrIFRpbWVzXCIgLDUgLCBcIlxcXCJJbiB0aGUgaGVhcnQgb2YgdGhlIGNpdHkgdGhhdCBuZXZlciBzbGVlcHMsIHRoaXMgcGFzdHJ5IHJlc3RhdXJhbnQgaXMgYSBiZWFjb24gb2Ygc3dlZXRuZXNzLiBJdHMgZWxlZ2FudCBwYXN0cmllcyBhbmQgY2FrZXMgYXJlIGEgdHJ1ZSBjdWxpbmFyeSBtYXN0ZXJwaWVjZSwgZWxldmF0aW5nIGRlc3NlcnQgdG8gYW4gYXJ0IGZvcm0uXFxcIlwiKTtcbiAgICBob21lcGFnZUNhcmRzKG1haW5DYXJkLCBcIkZvb2QgJiBXaW5lIE1hZ2F6aW5lXCIgLDUgLCAgXCJcXFwiVGhpcyBwYXN0cnkgaGF2ZW4gaXMgYSBtdXN0LXZpc2l0IGZvciBhbnlvbmUgc2Vla2luZyBhbiB1bmZvcmdldHRhYmxlIGRlc3NlcnQgZXhwZXJpZW5jZS4gRWFjaCBiaXRlIGlzIGEgc3ltcGhvbnkgb2YgZmxhdm9ycyBhbmQgdGV4dHVyZXMsIHNldHRpbmcgYSBuZXcgc3RhbmRhcmQgZm9yIHBhc3RyeSBleGNlbGxlbmNlLlxcXCJcIik7XG4gICAgaG9tZXBhZ2VDYXJkcyhtYWluQ2FyZCwgXCJUaGUgTWljaGVsaW4gR3VpZGVcIiw0ICwgIFwiXFxcIkVhcm5pbmcgb3VyIGNvdmV0ZWQgc3RhciwgdGhpcyBwYXN0cnkgcmVzdGF1cmFudCBpcyBhIGRlc3RpbmF0aW9uIGZvciB0aG9zZSBzZWVraW5nIHJlZmluZWQsIGV4cXVpc2l0ZSBkZXNzZXJ0cy4gV2l0aCBpbXBlY2NhYmxlIGNyYWZ0c21hbnNoaXAgYW5kIGEgZGVkaWNhdGlvbiB0byBxdWFsaXR5LCBpdCdzIGEgc3dlZXQgcmV2ZWxhdGlvbiBmb3IgZGlzY2VybmluZyBwYWxhdGVzLlxcXCJcIik7XG4gICAgaG9tZVBhZ2VDb250ZW50LmFwcGVuZENoaWxkKG1haW5DYXJkKTtcblxuICAgIGhvbWVQYWdlQ29udGVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaHJcIikpO1xuICAgIC8qIGZvb3RlciAqL1xuICAgIGhvbWVQYWdlQ29udGVudC5hcHBlbmRDaGlsZChmb290ZXIoKSlcbiAgICBcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKGhvbWVQYWdlQ29udGVudClcbiAgICBhbmltYXRpb24oKTtcbn1cblxuZnVuY3Rpb24gbmF2aWdhdGlvbk5hbWUoc3RyICwgbmF2aWdhdGlvbil7XG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbGV0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgYnRuLnRleHRDb250ZW50ID0gc3RyO1xuICAgIGRpdi5hcHBlbmRDaGlsZChidG4pXG4gICAgbmF2aWdhdGlvbi5hcHBlbmRDaGlsZChkaXYpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBob21lcGFnZTtcbmV4cG9ydCB7bmF2aWdhdGlvbk5hbWV9O1xuIiwiaW1wb3J0IHN0YXIgZnJvbSBcIi9pbWFnZXMvc3Rhci5zdmdcIlxuXG5mdW5jdGlvbiBob21lcGFnZUNhcmRzKG1haW5DYXJkLCB0aXRsZSwgbiwgdGV4dCl7XG4gICAgbGV0IGNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNhcmQuY2xhc3NMaXN0LmFkZChcImNhcmRcIik7XG5cbiAgICBsZXQgaW1nRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBuOyBpKyspe1xuICAgICAgICBsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCBzdGFyKTtcbiAgICAgICAgaW1nRGl2LmFwcGVuZENoaWxkKGltZyk7XG4gICAgfVxuICAgIGNhcmQuYXBwZW5kQ2hpbGQoaW1nRGl2KVxuXG4gICAgbGV0IGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSB0aXRsZTtcbiAgICBjYXJkLmFwcGVuZENoaWxkKGhlYWRpbmcpO1xuXG4gICAgbGV0IHJldmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcmV2aWV3LnRleHRDb250ZW50ID0gdGV4dDtcbiAgICBjYXJkLmFwcGVuZENoaWxkKHJldmlldyk7XG5cbiAgICBtYWluQ2FyZC5hcHBlbmRDaGlsZChjYXJkKVxuXG4gICAgXG4gICAgXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvbWVwYWdlQ2FyZHM7IiwiaW1wb3J0IHsgbmF2aWdhdGlvbk5hbWUgfSBmcm9tIFwiLi9ob21lcGFnZVwiO1xuaW1wb3J0IFwiLi4vY3NzL21lbnVwYWdlLmNzc1wiXG5pbXBvcnQgZm9vdGVyIGZyb20gXCIuL2Zvb3RlclwiO1xuaW1wb3J0IG1lbnVBbmltYXRpb24gZnJvbSBcIi4uL2FuaW1hdGlvbi9hbmltYXRpb25NZW51UGFnZVwiO1xuaW1wb3J0IHBhc3RyeTEgZnJvbSBcIi9pbWFnZXMvcGFzdHJ5LTEuanBnXCJcbmltcG9ydCBwYXN0cnkyIGZyb20gXCIvaW1hZ2VzL3Bhc3RyeS0yLmpwZ1wiXG5pbXBvcnQgcGFzdHJ5MyBmcm9tIFwiL2ltYWdlcy9wYXN0cnktMy5qcGdcIlxuaW1wb3J0IGRlc2VydDEgZnJvbSBcIi9pbWFnZXMvZGVzZXJ0LTEuanBnXCJcbmltcG9ydCBkZXNlcnQyIGZyb20gXCIvaW1hZ2VzL2Rlc2VydC0yLmpwZ1wiXG5pbXBvcnQgZGVzZXJ0MyBmcm9tIFwiL2ltYWdlcy9kZXNlcnQtMy5qcGdcIlxuaW1wb3J0IGRlc2VydDQgZnJvbSBcIi9pbWFnZXMvZGVzZXJ0LTQuanBnXCJcbmltcG9ydCBkZXNlcnQ1IGZyb20gXCIvaW1hZ2VzL2Rlc2VydC01LmpwZ1wiXG5pbXBvcnQgZHJpbmsxIGZyb20gXCIvaW1hZ2VzL2RyaW5rLTEuanBnXCJcbmltcG9ydCBkcmluazIgZnJvbSBcIi9pbWFnZXMvZHJpbmstMi5qcGdcIlxuaW1wb3J0IGRyaW5rMyBmcm9tIFwiL2ltYWdlcy9kcmluay0zLmpwZ1wiXG5pbXBvcnQgZHJpbms0IGZyb20gXCIvaW1hZ2VzL2RyaW5rLTQuanBnXCJcbmltcG9ydCBkcmluazUgZnJvbSBcIi9pbWFnZXMvZHJpbmstNS5qcGdcIlxuXG5mdW5jdGlvbiBtZW51cGFnZSgpe1xuICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG5cbiAgICBjb25zdCBtZW51UGFnZUNvbmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbWVudVBhZ2VDb25lbnQuY2xhc3NMaXN0LmFkZChcIm1lbnVQYWdlXCIpO1xuICAgIFxuICAgIC8qIG5hdmlnYXRpb24gKi9cbiAgICBjb25zdCBuYXZpZ2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuYXZpZ2F0aW9uLmNsYXNzTGlzdC5hZGQoXCJuYXZpZ2F0aW9uXCIpO1xuICAgIFxuICAgIG5hdmlnYXRpb25OYW1lKFwiSG9tZVwiLCBuYXZpZ2F0aW9uKTtcbiAgICBuYXZpZ2F0aW9uTmFtZShcIk1lbnVcIiwgbmF2aWdhdGlvbik7XG4gICAgbmF2aWdhdGlvbk5hbWUoXCJDb250YWN0XCIsIG5hdmlnYXRpb24pO1xuXG4gICAgbWVudVBhZ2VDb25lbnQuYXBwZW5kQ2hpbGQobmF2aWdhdGlvbik7XG4gICAgbWVudVBhZ2VDb25lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpKTtcblxuICAgIGxldCBvdXRlck1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG91dGVyTWVudS5jbGFzc0xpc3QuYWRkKFwib3V0ZXJNZW51XCIpO1xuICAgIGxldCBtZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtZW51LmNsYXNzTGlzdC5hZGQoXCJtZW51XCIpO1xuXG4gICAgLyogdGl0bGUgKi9cbiAgICBsZXQgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRpdGxlLmNsYXNzTGlzdC5hZGQoXCJ0aXRsZVwiKTtcbiAgICBsZXQgZGl2MSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2MS50ZXh0Q29udGVudCA9IFwiVEhFXCI7XG4gICAgbGV0IGRpdjIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRpdjIudGV4dENvbnRlbnQgPSBcIk1FTlVcIjtcbiAgICB0aXRsZS5hcHBlbmRDaGlsZChkaXYxKTtcbiAgICB0aXRsZS5hcHBlbmRDaGlsZChkaXYyKTtcbiAgICB0aXRsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaHJcIikpO1xuXG4gICAgLyogc2VjdGlvbi0xICovXG4gICAgbGV0IHBhc3RyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWN0aW9uXCIpO1xuICAgIHBhc3RyeS5jbGFzc0xpc3QuYWRkKFwicGFzdHJ5XCIpO1xuICAgIGxldCBwYXN0cnlUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcGFzdHJ5VGl0bGUudGV4dENvbnRlbnQgPSBcIlBhc3RyaWVzXCI7XG4gICAgcGFzdHJ5LmFwcGVuZENoaWxkKHBhc3RyeVRpdGxlKTtcbiAgICBwYXN0cnkuYXBwZW5kQ2hpbGQoZm9vZChwYXN0cnkxLCBcIlBhaW4gYXUgQ2hvY29sYXRcIiwgXCIkMTVcIikpO1xuICAgIHBhc3RyeS5hcHBlbmRDaGlsZChmb29kKHBhc3RyeTIsIFwiQ2hhdXNzb24gYXV4IFBvbW1lc1wiLCBcIiQxNVwiKSk7XG4gICAgcGFzdHJ5LmFwcGVuZENoaWxkKGZvb2QocGFzdHJ5MywgXCJQYWluIGF1eCBSYWlzaW5zXCIsIFwiJDEwXCIpKTtcblxuICAgIC8qIHNlY3Rpb24gMiAqL1xuICAgIGxldCBkZXNlcnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2VjdGlvblwiKTtcbiAgICBkZXNlcnQuY2xhc3NMaXN0LmFkZChcImRlc2VydFwiKTtcbiAgICBsZXQgZGVzZXJUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGVzZXJUaXRsZS50ZXh0Q29udGVudCA9IFwiRGVzZXJ0c1wiO1xuICAgIGRlc2VydC5hcHBlbmRDaGlsZChkZXNlclRpdGxlKTtcbiAgICBkZXNlcnQuYXBwZW5kQ2hpbGQoZm9vZChkZXNlcnQxLCBcIkNyw6htZSBCcsO7bMOpZVwiLCBcIiQxMlwiKSk7XG4gICAgZGVzZXJ0LmFwcGVuZENoaWxkKGZvb2QoZGVzZXJ0MiwgXCJUYXJ0ZSBUYXRpblwiLCBcIiQxMlwiKSk7XG4gICAgZGVzZXJ0LmFwcGVuZENoaWxkKGZvb2QoZGVzZXJ0MywgXCJNb3Vzc2UgYXUgQ2hvY29sYXRcIiwgXCIkMjBcIikpO1xuICAgIGRlc2VydC5hcHBlbmRDaGlsZChmb29kKGRlc2VydDQsIFwiVGFydGUgYXV4IEZyYWlzZXNcIiwgXCIkMTVcIikpO1xuICAgIGRlc2VydC5hcHBlbmRDaGlsZChmb29kKGRlc2VydDUsIFwiTWFkZWxlaW5lc1wiLCBcIiQ4XCIpKTtcblxuICAgIC8qIHNlY3Rpb24gMyAqL1xuICAgIGxldCBkcmluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWN0aW9uXCIpO1xuICAgIGRyaW5rLmNsYXNzTGlzdC5hZGQoXCJkcmlua1wiKTtcbiAgICBsZXQgZHJpbmtUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZHJpbmtUaXRsZS50ZXh0Q29udGVudCA9IFwiRHJpbmtzXCI7XG4gICAgZHJpbmsuYXBwZW5kQ2hpbGQoZHJpbmtUaXRsZSk7XG4gICAgZHJpbmsuYXBwZW5kQ2hpbGQoZm9vZChkcmluazEsIFwiQ2Fmw6kgQ3LDqG1lXCIsIFwiJDhcIikpO1xuICAgIGRyaW5rLmFwcGVuZENoaWxkKGZvb2QoZHJpbmsyLCBcIkNhZsOpIE5vaXJcIiwgXCIkOFwiKSk7XG4gICAgZHJpbmsuYXBwZW5kQ2hpbGQoZm9vZChkcmluazMsIFwiQ2hvY29sYXQgQ2hhdWRcIiwgXCIkMTJcIikpO1xuICAgIGRyaW5rLmFwcGVuZENoaWxkKGZvb2QoZHJpbms0LCBcIlRow6lcIiwgXCIkMTBcIikpO1xuICAgIGRyaW5rLmFwcGVuZENoaWxkKGZvb2QoZHJpbms1LCBcIkVhdSBHYXpldXNlXCIsIFwiJDEyXCIpKTtcblxuXG4gICAgbWVudS5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgbWVudS5hcHBlbmRDaGlsZChwYXN0cnkpO1xuICAgIG1lbnUuYXBwZW5kQ2hpbGQoZGVzZXJ0KTtcbiAgICBtZW51LmFwcGVuZENoaWxkKGRyaW5rKTtcbiAgICBvdXRlck1lbnUuYXBwZW5kQ2hpbGQobWVudSk7XG4gICAgbWVudVBhZ2VDb25lbnQuYXBwZW5kQ2hpbGQob3V0ZXJNZW51KTtcbiAgICBtZW51UGFnZUNvbmVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaHJcIikpO1xuICAgIC8qIGZvb3RlciAqL1xuICAgIG1lbnVQYWdlQ29uZW50LmFwcGVuZENoaWxkKGZvb3RlcigpKVxuXG4gICAgY29udGVudC5hcHBlbmRDaGlsZChtZW51UGFnZUNvbmVudCk7XG5cbiAgICBtZW51QW5pbWF0aW9uKClcbiAgICBcbn1cbmZ1bmN0aW9uIGZvb2QoaW1hZ2UsIGhlYWRpbmcsIGFtb3VudCl7XG4gICAgbGV0IHBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCBpbWFnZSk7XG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LnRleHRDb250ZW50ID0gaGVhZGluZztcbiAgICBsZXQgcHJpY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHByaWNlLnRleHRDb250ZW50ID0gYW1vdW50O1xuICAgIFxuICAgIHBhcmVudC5hcHBlbmRDaGlsZChpbWcpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZChkaXYpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZChwcmljZSk7XG4gICAgcmV0dXJuIHBhcmVudDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWVudXBhZ2U7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIHNjcmlwdFVybDtcbmlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmcuaW1wb3J0U2NyaXB0cykgc2NyaXB0VXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmxvY2F0aW9uICsgXCJcIjtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5kb2N1bWVudDtcbmlmICghc2NyaXB0VXJsICYmIGRvY3VtZW50KSB7XG5cdGlmIChkb2N1bWVudC5jdXJyZW50U2NyaXB0KVxuXHRcdHNjcmlwdFVybCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjO1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHtcblx0XHRcdHZhciBpID0gc2NyaXB0cy5sZW5ndGggLSAxO1xuXHRcdFx0d2hpbGUgKGkgPiAtMSAmJiAhc2NyaXB0VXJsKSBzY3JpcHRVcmwgPSBzY3JpcHRzW2ktLV0uc3JjO1xuXHRcdH1cblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5uYyA9IHVuZGVmaW5lZDsiLCJpbXBvcnQgXCIuL2Nzcy9pbmRleC5jc3NcIjtcbmltcG9ydCBcIi4vY3NzL25vcm1hbGl6ZS5jc3NcIjtcbmltcG9ydCBob21lcGFnZSwgeyBuYXZpZ2F0aW9uTmFtZSB9IGZyb20gXCIuL2NvbXBvbmVuZXRzL2hvbWVwYWdlXCI7XG5pbXBvcnQgbWVudXBhZ2UgZnJvbSBcIi4vY29tcG9uZW5ldHMvbWVudXBhZ2VcIjtcbmltcG9ydCBjb250YWN0cGFnZSBmcm9tIFwiLi9jb21wb25lbmV0cy9jb250YWN0cGFnZVwiO1xuXG5mdW5jdGlvbiBtYWluKCl7XG4gICAgbGV0IG5hdmlnYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm5hdmlnYXRpb25cIikuY2hpbGROb2RlcztcbiAgICBuYXZpZ2F0aW9uID0gQXJyYXkuZnJvbShuYXZpZ2F0aW9uKTsgICAgXG4gICAgbmF2aWdhdGlvbi5mb3JFYWNoKGUgPT4gZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmKGV2ZW50LnRhcmdldC50ZXh0Q29udGVudCA9PSBcIkhvbWVcIil7XG4gICAgICAgICAgICBjbGVhcigpO1xuICAgICAgICAgICAgaG9tZXBhZ2UoKTtcbiAgICAgICAgICAgIG1haW4oKTtcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQudGFyZ2V0LnRleHRDb250ZW50ID09IFwiTWVudVwiKXtcbiAgICAgICAgICAgIGNsZWFyKCk7XG4gICAgICAgICAgICBtZW51cGFnZSgpO1xuICAgICAgICAgICAgbWFpbigpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNsZWFyKCk7XG4gICAgICAgICAgICBjb250YWN0cGFnZSgpO1xuICAgICAgICAgICAgbWFpbigpO1xuICAgICAgICB9XG4gICAgfSkpXG59ICAgXG5mdW5jdGlvbiBjbGVhcigpe1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5pbm5lckhUTUwgPSBcIlwiO1xufVxuXG5ob21lcGFnZSgpO1xubWFpbigpOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==