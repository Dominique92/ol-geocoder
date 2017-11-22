const provider = document.getElementById('provider');
const key = document.getElementById('key');

const baseLayer = new ol.layer.Tile({ source: new ol.source.OSM() });

const olview = new ol.View({
  center: [0, 0],
  zoom: 3,
  minZoom: 2,
  maxZoom: 20
});

const map = new ol.Map({
  target: document.getElementById('map'),
  view: olview,
  layers: [baseLayer]
});

const geocoder = new Geocoder('nominatim', {
  provider: '',
  key: '',
  targetType: 'text-input',
  lang: 'en',
  placeholder: 'Search for ...',
  limit: 5,
  keepOpen: false,
  debug: true
});

map.addControl(geocoder);

provider.addEventListener('input', () => {
  geocoder.setProvider(provider.value);
});

key.addEventListener('input', () => {
  geocoder.setProviderKey(key.value);
});


