import { Html } from './html';
import { Nominatim } from './nominatim';
import U from './utils';
import * as C from './constants';

/**
 * @class Base
 * @extends {ol.control.Control}
 */
export default class Base extends ol.control.Control {
  /**
   * @constructor
   * @param {string} type nominatim|reverse.
   * @param {object} options Options.
   */
  constructor(type = C.controlType.NOMINATIM, options = {}) {

    if (!(this instanceof Base)) return new Base();

    U.assert(typeof type === 'string', '@param `type` should be string!');
    U.assert(type === C.controlType.NOMINATIM || type === C.controlType.REVERSE,
        `@param 'type' should be '${C.controlType.NOMINATIM}' or 
        '${C.controlType.REVERSE}'!`);
    U.assert(typeof options === 'object',
        '@param `options` should be object!');

    this.options = U.mergeOptions(C.defaultOptions, options);
    this.container = undefined;

    let $nominatim;
    const $html = new Html(this);

    if (type === C.controlType.NOMINATIM) {
      this.container = $html.els.container;
      $nominatim = new Nominatim(this, $html.els);
      this.layer = $nominatim.layer;
    } else if (type === C.controlType.REVERSE) {
      // TODO
    }

    super({ element: this.container });
  }

  /**
   * @return {ol.layer.Vector} Returns the layer created by this control
   */
  getLayer() {
    return this.layer;
  }

  /**
   * @return {ol.source.Vector} Returns the source created by this control
   */
  getSource() {
    return this.getLayer().getSource();
  }
}
