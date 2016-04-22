import { Nominatim } from './nominatim';
import utils from './utils';
import * as constants from './constants';
import * as vars from '../../sass-vars.json';

/**
 * @class Base
 * @extends {ol.control.Control}
 */
export default class Base {
  /**
   * @constructor
   * @param {string} control_type Nominatim|Reverse.
   * @param {object|undefined} opt_options Options.
   */
  constructor(control_type = 'nominatim', opt_options = {}) {
    utils.assert(typeof control_type == 'string',
      '@param `control_type` should be string type!'
    );
    utils.assert(typeof opt_options == 'object',
      '@param `opt_options` should be object type!'
    );
    
    this.options = utils.mergeOptions(constants.defaultOptions, opt_options);
    
    Base.Nominatim = new Nominatim(this);
    
    ol.control.Control.call(this, {
      element: Base.Nominatim.container
    });
  }

  /**
   * @return {ol.layer.Vector} Returns the layer created by this control
   */
  getLayer() {
    return Base.Nominatim.layer;
  }

  /**
   * @return {ol.source.Vector} Returns the source created by this control
   */
  getSource() {
    return this.getLayer().getSource();
  }
}
ol.inherits(Base, ol.control.Control);
