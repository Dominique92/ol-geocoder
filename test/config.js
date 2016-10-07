var port = 8888;
var require = patchRequire(require); // eslint-disable-line no-use-before-define
var vars = require('../config/vars.json');

var input_query = 'input#' + vars.input_query_id;
var control = 'div.' + vars.namespace + vars.control_class;

exports.elements = {
  container: 'div.' + vars.namespace + vars.container_class,
  control: control,
  control_expanded: control + '.' + vars.namespace + vars.expanded_class,
  button: 'button.' + vars.namespace + vars.btn_search_class,
  form: 'form#' + vars.form_id,
  input_query: input_query,
  input_query_loading: input_query + '.' + vars.namespace + vars.loading_class,
  input_query_class: 'input.' + vars.namespace + vars.input_search_class,
  list: 'ul.' + vars.namespace + vars.result_class
};

exports.geocoder_opts = {
  provider: 'photon',
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
