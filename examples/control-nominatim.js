(function(win, doc){
  'use strict';
  
  var olview = new ol.View({
        center: [0, 0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 20
      }),
      baseLayer = new ol.layer.Tile({
        source: new ol.source.MapQuest({ layer: 'osm' })
      }),
      map = new ol.Map({
        target: doc.getElementById('map'),
        view: olview,
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [baseLayer]
      });

  //Instantiate with some options and add the Control
  var geocoder = new Geocoder('nominatim', {
    provider: 'photon',
    lang: 'en',
    placeholder: 'Search for ...',
    limit: 5,
    keepOpen: true
  });
  map.addControl(geocoder);
  
  //Listen when an address is chosen
  geocoder.on('addresschosen', function(evt){
    var feature = evt.feature,
        coord = evt.coordinate,
        address_html = feature.get('address_html');

    content.innerHTML = '<p>'+address_html+'</p>';
    overlay.setPosition(coord);
  });

  /**
  * Popup
  **/
  var container = doc.getElementById('popup'),
      content = doc.getElementById('popup-content'),
      closer = doc.getElementById('popup-closer'),
      overlay = new ol.Overlay({
        element: container,
        offset: [0, -40]
      });
  closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };
  map.addOverlay(overlay);
})(window, document);