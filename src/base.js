import ol from 'openlayers';
import { Html } from './html';
import { Nominatim } from './nominatim';
import { assert, mergeOptions } from 'helpers/mix';
import { CONTROL_TYPE, DEFAULT_OPTIONS } from 'konstants';

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
  constructor(type = CONTROL_TYPE.NOMINATIM, options = {}) {

    if (!(this instanceof Base)) return new Base();

    assert(typeof type === 'string', '@param `type` should be string!');
    assert(
      type === CONTROL_TYPE.NOMINATIM || type === CONTROL_TYPE.REVERSE,
      `@param 'type' should be '${CONTROL_TYPE.NOMINATIM}'
        or '${CONTROL_TYPE.REVERSE}'!`
    );
    assert(typeof options === 'object', '@param `options` should be object!');

    this.options = mergeOptions(DEFAULT_OPTIONS, options);
    this.container = undefined;

    let $nominatim;
    const $html = new Html(this);

    if (type === CONTROL_TYPE.NOMINATIM) {
      this.container = $html.els.container;
      $nominatim = new Nominatim(this, $html.els);
      this.layer = $nominatim.layer;
    } else if (type === CONTROL_TYPE.REVERSE) {
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
