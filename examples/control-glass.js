((win, doc) => {
  const olview = new ol.View({
    center: [0, 0],
    zoom: 3,
    minZoom: 2,
    maxZoom: 20,
  });

  const baseLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
  });
  const map = new ol.Map({
    target: doc.querySelector('#map'),
    view: olview,
    layers: [baseLayer],
  });
  const popup = new ol.Overlay.Popup();

  // Instantiate with some options and add the Control
  const geocoder = new Geocoder('nominatim', {
    provider: 'photon',
    targetType: 'glass-button',
    lang: 'en',
    placeholder: 'Search for ...',
    limit: 5,
    keepOpen: false,
  });

  map.addControl(geocoder);
  map.addOverlay(popup);

  // Listen when an address is chosen
  geocoder.on('addresschosen', (evt) => {
    window.setTimeout(() => {
      popup.show(evt.coordinate, evt.address.formatted);
    }, 3000);
  });
})(window, document);