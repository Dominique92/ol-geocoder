/* eslint-disable optimize-regex/optimize-regex */
/* eslint-disable prefer-named-capture-group */
import { isNumeric } from './mix';

/**
 * @param {Element|Array<Element>} element DOM node or array of nodes.
 * @param {String|Array<String>} classname Class or array of classes.
 * For example: 'class1 class2' or ['class1', 'class2']
 * @param {Number|undefined} timeout Timeout to remove a class.
 */
export function addClass(element, classname, timeout) {
  if (Array.isArray(element)) {
    element.forEach((each) => addClass(each, classname));

    return;
  }

  const array = Array.isArray(classname) ? classname : classname.split(/\s+/u);

  let i = array.length;

  while (i--) {
    if (!hasClass(element, array[i])) {
      _addClass(element, array[i], timeout);
    }
  }
}

/**
 * @param {Element|Array<Element>} element DOM node or array of nodes.
 * @param {String|Array<String>} classname Class or array of classes.
 * For example: 'class1 class2' or ['class1', 'class2']
 * @param {Number|undefined} timeout Timeout to add a class.
 */
export function removeClass(element, classname, timeout) {
  if (Array.isArray(element)) {
    element.forEach((each) => removeClass(each, classname, timeout));

    return;
  }

  const array = Array.isArray(classname) ? classname : classname.split(/\s+/u);

  let i = array.length;

  while (i--) {
    if (hasClass(element, array[i])) {
      _removeClass(element, array[i], timeout);
    }
  }
}

/**
 * @param {Element} element DOM node.
 * @param {String} classname Classname.
 * @return {Boolean}
 */
export function hasClass(element, c) {
  // use native if available
  return element.classList ? element.classList.contains(c) : classRegex(c).test(element.className);
}

/**
 * @param {Element|Array<Element>} element DOM node or array of nodes.
 * @param {String} classname Classe.
 */
export function toggleClass(element, classname) {
  if (Array.isArray(element)) {
    element.forEach((each) => toggleClass(each, classname));

    return;
  }

  // use native if available
  if (element.classList) {
    element.classList.toggle(classname);
  } else {
    hasClass(element, classname) ? _removeClass(element, classname) : _addClass(element, classname);
  }
}

/**
 * Abstraction to querySelectorAll for increased
 * performance and greater usability
 * @param {String} selector
 * @param {Element} context (optional)
 * @param {Boolean} findAll (optional)
 * @return (findAll) {Element} : {Array}
 */
export function $(id) {
  id = id[0] === '#' ? id.slice(1, 1 + id.length) : id;

  return document.getElementById(id);
}

export function isElement(obj) {
  // DOM, Level2
  if ('HTMLElement' in window) {
    return !!obj && obj instanceof HTMLElement;
  }

  // Older browsers
  return !!obj && typeof obj === 'object' && obj.nodeType === 1 && !!obj.nodeName;
}

export function getAllChildren(node, tag) {
  return [].slice.call(node.getElementsByTagName(tag));
}

export function removeAllChildren(node) {
  while (node.firstChild) node.firstChild.remove();
}

export function removeAll(collection) {
  let node;

  while ((node = collection[0])) node.remove();
}

export function getChildren(node, tag) {
  return [].filter.call(node.childNodes, (el) =>
    tag ? el.nodeType === 1 && el.tagName.toLowerCase() === tag : el.nodeType === 1
  );
}

export function template(html, row) {
  return html.replace(/\{\s*([\w-]+)\s*\}/gu, (htm, key) => {
    const value = row[key] === undefined ? '' : row[key];

    return htmlEscape(value);
  });
}

export function htmlEscape(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function createElement(node, html) {
  let elem;

  if (Array.isArray(node)) {
    elem = document.createElement(node[0]);

    if (node[1].id) elem.id = node[1].id;

    if (node[1].classname) elem.className = node[1].classname;

    if (node[1].attr) {
      const { attr } = node[1];

      if (Array.isArray(attr)) {
        let i = -1;

        while (++i < attr.length) {
          elem.setAttribute(attr[i].name, attr[i].value);
        }
      } else {
        elem.setAttribute(attr.name, attr.value);
      }
    }
  } else {
    elem = document.createElement(node);
  }

  elem.innerHTML = html;

  const frag = document.createDocumentFragment();

  while (elem.childNodes[0]) frag.append(elem.childNodes[0]);

  elem.append(frag);

  return elem;
}

function classRegex(classname) {
  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(`(^|\\s+) ${classname} (\\s+|$)`, 'u');
}

function _addClass(el, klass, timeout) {
  // use native if available
  if (el.classList) {
    el.classList.add(klass);
  } else {
    el.className = `${el.className} ${klass}`.trim();
  }

  if (timeout && isNumeric(timeout)) {
    window.setTimeout(() => _removeClass(el, klass), timeout);
  }
}

function _removeClass(el, klass, timeout) {
  if (el.classList) {
    el.classList.remove(klass);
  } else {
    el.className = el.className.replace(classRegex(klass), ' ').trim();
  }

  if (timeout && isNumeric(timeout)) {
    window.setTimeout(() => _addClass(el, klass), timeout);
  }
}
