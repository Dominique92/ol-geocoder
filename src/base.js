/**
 * @constructor
 * @extends {ol.control.Control}
 * @fires change:geocoder
 * @param {string|undefined} control_type Nominatim|Reverse.
 * @param {object|undefined} opt_options Options.
 */
var Geocoder = function(control_type, opt_options){
    //some checks before continue
    utils.assert(
        typeof control_type === "string" || typeof control_type === "undefined",
        '@param `control_type` should be string|undefined type!'
    );
    utils.assert(
        typeof opt_options === "object" || typeof opt_options === "undefined",
        '@param `opt_options` should be object|undefined type!'
    );
    
    control_type = control_type || 'nominatim';
    
    var nominatim = new Geocoder.Nominatim(this, opt_options);
    this.layer = nominatim.layer;
    
    ol.control.Control.call(this, {
        element: nominatim.els.container
    });
    
    //set event to be captured with 'change:geocoder'
    this.set('geocoder', '');
};
ol.inherits(Geocoder, ol.control.Control);

/**
 * @return {ol.source.Vector} Returns the source created by this control
 */
Geocoder.prototype.getSource = function(){
    return this.layer.getSource();
};


/**
 * @return {ol.layer.Vector} Returns the layer created by this control
 */
Geocoder.prototype.getLayer = function(){
    return this.layer;
};

