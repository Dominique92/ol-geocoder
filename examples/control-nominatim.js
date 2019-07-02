(function(win, doc) {
  var olview = new ol.View({
      center: [0, 0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 20,
    }),
    baseLayer = new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    map = new ol.Map({
      target: doc.getElementById('map'),
      view: olview,
      layers: [baseLayer],
    }),
    popup = new ol.Overlay.Popup();

  //Instantiate with some options and add the Control
  var geocoder = new Geocoder('nominatim', {
    provider: 'pelias',
    targetType: 'text-input',
    lang: 'en',
    key: 'c2VhcmNoLXhORE9ySkU=',
    placeholder: 'Search for ...',
    limit: 5,
    keepOpen: false,
  });

  map.addControl(geocoder);
  map.addOverlay(popup);

  //Listen when an address is chosen
  geocoder.on('addresschosen', function(evt) {
    window.setTimeout(function() {
      popup.show(evt.coordinate, evt.address.formatted);
    }, 3000);
  });
})(window, document);
