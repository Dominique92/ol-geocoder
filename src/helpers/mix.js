/**
 * Overwrites obj1's values with obj2's and adds
 * obj2's if non existent in obj1
 * @returns obj3 a new object based on obj1 and obj2
 */
export function mergeOptions(obj1, obj2) {
  const obj3 = {};

  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      obj3[key] = obj1[key];
    }
  }

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      obj3[key] = obj2[key];
    }
  }

  return obj3;
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    if (typeof Error !== 'undefined') throw new Error(message);

    throw message; // Fallback
  }
}

export function now() {
  // Polyfill for window.performance.now()
  // @license http://opensource.org/licenses/MIT
  // copyright Paul Irish 2015
  // https://gist.github.com/paulirish/5438650
  if ('performance' in window === false) {
    window.performance = {};
  }

  if ('now' in window.performance === false) {
    let nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart) {
      nowOffset = performance.timing.navigationStart;
    }

    window.performance.now = () => Date.now() - nowOffset;
  }

  return window.performance.now();
}

export function flyTo(map, coord, duration = 500, resolution = 2.388657133911758) {
  map.getView().animate({ duration, resolution }, { duration, center: coord });
}

export function randomId(prefix) {
  const id = now().toString(36);

  return prefix ? prefix + id : id;
}

export function isNumeric(str) {
  return /^\d+$/u.test(str);
}

export function isEmpty(str) {
  return !str || str.length === 0;
}

export function emptyArray(array) {
  while (array.length) array.pop();
}

export function anyMatchInArray(source, target) {
  return source.some((each) => target.includes(each));
}

export function everyMatchInArray(arr1, arr2) {
  return arr2.every((each) => arr1.includes(each));
}

export function anyItemHasValue(obj, has = false) {
  const keys = Object.keys(obj);

  keys.forEach((key) => {
    if (!isEmpty(obj[key])) has = true;
  });

  return has;
}
