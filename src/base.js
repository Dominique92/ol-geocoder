import { assert, fade } from './helpers/mix.js';
import {
  isElement,
  getOffset,
  addClass,
  removeClass,
  getWindowSize,
  getHour,
  getMinute,
  hasClass,
} from './helpers/dom.js';
import { DEFAULT_OPTIONS, FOCUSABLE, CLICKABLE, EVENT_TYPE } from './constants.js';
import { createStructure } from './html.js';
import { handleDrag } from './drag.js';
import mitt from './emitter.js';
import style from './sass/main.scss';

/**
 * @param {String|Element} target String or DOM node
 * @param {Object|undefined} initOptions Options
 */
export default function (target, initOptions) {
  const targetElement = isElement(target) ? target : document.querySelector(target);

  assert(isElement(targetElement), "Couldn't find target in DOM");

  const emitter = mitt();
  const options = Object.assign(DEFAULT_OPTIONS, initOptions);

}
