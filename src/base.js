/**
 * @constructor
 * @extends {ol.control.Control}
 * @fires {G.EventType}
 * @param {string} control_type Nominatim|Reverse.
 * @param {object|undefined} opt_options Options.
 */
G.Base = function(control_type, opt_options){
  utils.assert(typeof control_type === 'string', '@param `control_type`' +
    ' should be string type!'
  );
  utils.assert(typeof opt_options === 'object' || typeof opt_options === 'undefined',
    '@param `opt_options` should be object|undefined type!'
  );
  
  control_type = control_type || 'nominatim';
  
  G.$base = this;
  G.$nominatim = new G.Nominatim(opt_options);
  
  ol.control.Control.call(this, {
    element: G.$nominatim.container
  });
};
ol.inherits(G.Base, ol.control.Control);

/**
 * @return {ol.source.Vector} Returns the source created by this control
 */
G.Base.prototype.getSource = function(){
  return this.getLayer().getSource();
};

/**
 * @return {ol.layer.Vector} Returns the layer created by this control
 */
G.Base.prototype.getLayer = function(){
  return G.$nominatim.layer;
};
