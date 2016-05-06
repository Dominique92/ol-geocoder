var require = patchRequire(require);

// path here is relative to where this will be injected
var config      = require('../config');
var server      = require('../server').create(config.port);
var vars        = require('../../config/vars.json');
var ol          = require('openlayers');
var Geocoder    = require('../../build/ol3-geocoder');

var elements = config.elements;
var geocoder = new Geocoder('nominatim', config.geocoder_opts);