import Control from 'ol/control/Control';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

import { CONTROL_TYPE, DEFAULT_OPTIONS, FEATURE_SRC } from '../konstants';

import { Html } from './html';
import { Nominatim } from './nominatim';
import { assert, mergeOptions } from './helpers/mix';

/**
 * @class Base
 * @extends {ol.control.Control}
 */
export default class Base extends Control {
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

    DEFAULT_OPTIONS.featureStyle = [
      new Style({ image: new Icon({ scale: 0.7, src: FEATURE_SRC }) }),
    ];

    this.options = mergeOptions(DEFAULT_OPTIONS, options);
    this.container = undefined;

    let $nominatim;

    const $html = new Html(this);

    if (type === CONTROL_TYPE.NOMINATIM) {
      this.container = $html.els.container;
      $nominatim = new Nominatim(this, $html.els);
      this.layer = $nominatim.layer;
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

  /**
   * Set a new provider
   * @param {String} provider
   */
  setProvider(provider) {
    this.options.provider = provider;
  }

  /**
   * Set provider key
   * @param {String} key
   */
  setProviderKey(key) {
    this.options.key = key;
  }
}
