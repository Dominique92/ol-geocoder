const baseLayer = new ol.layer.Tile({ source: new ol.source.OSM() });

const olview = new ol.View({
  center: [0, 0],
  zoom: 3,
  minZoom: 2,
  maxZoom: 20,
});

const map = new ol.Map({
  target: document.querySelector('#map'),
  view: olview,
  layers: [baseLayer],
});

const geocoder = new Geocoder('nominatim', {
  targetType: 'glass-button',
});

map.addControl(geocoder);
