var Geocoder = function(control_type, opt_options){
    'use strict';
    
    var nominatim = new Geocoder.Nominatim(this, opt_options);
    this.layer = nominatim.layer;
    
    ol.control.Control.call(this, {
        element: nominatim.els.container
    });
    
    //set event to be captured with 'change:geocoder'
    this.set('geocoder', '');
};
ol.inherits(Geocoder, ol.control.Control);

Geocoder.prototype.getSource = function(){
    return this.layer.getSource();
};