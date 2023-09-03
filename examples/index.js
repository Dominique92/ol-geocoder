console.log('Ol v' + ol.util.VERSION);

const map = new ol.Map({
  target: document.querySelector('#map'),
  view: new ol.View({
    center: [0, 0],
    zoom: 3,
  }),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
});

// Instantiate with nominatim, outside of the map
const geocoder = new Geocoder('nominatim', {
  provider: 'osm',
  targetType: 'text-input',
  lang: 'en',
  placeholder: 'Search for ...',
  limit: 5,
  keepOpen: false,
  target: document.body,
});

// Instantiate with photon, little button
const geocoderGlass = new Geocoder('nominatim', {
  provider: 'photon',
  targetType: 'glass-button',
  lang: 'en',
  placeholder: 'Search for ...',
  limit: 5,
  keepOpen: false,
});

const popup = new ol.Overlay.Popup();

map.addControl(geocoder);
map.addControl(geocoderGlass);
map.addOverlay(popup);

// Listen when an address is chosen
geocoder.on('addresschosen', (evt) => {
  window.setTimeout(() => {
    popup.show(evt.coordinate, evt.address.formatted);
  }, 1000);
});