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