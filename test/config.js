// eslint-disable-next-line no-use-before-define
var require = patchRequire(require);
var vars = require('../../config/vars.json');
var port = 8888;

var klasses = vars.cssClasses;
var glassClasses = {};
Object.keys(klasses.glass).forEach(function (each) {
  glassClasses[each] = '.' + klasses.glass[each];
});

vars.inputQuery = '#' + vars.inputQueryId;
exports.vars = vars;
exports.klasses = klasses;
exports.glassClasses = glassClasses;

exports.geocoderOpts = {
  provider: 'photon',
  targetType: 'glass-button',
  lang: 'en',
  placeholder: 'Search for ...',
  limit: 5,
  keepOpen: true,
  debug: false
};
exports.query = 'New York';
exports.port = port;
exports.url = 'http://127.0.0.1:' + port + '/test/nominatim.html';
exports.providers = {
  photon: '//photon.komoot.de/api/',
  osm: '//nominatim.openstreetmap.org/search/'
};
