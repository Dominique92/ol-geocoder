var olview = new ol.View({
    center: [0, 0],
    zoom: 3,
    minZoom: 2,
    maxZoom: 20
});

var baseLayer = new ol.layer.Tile({
    preload: Infinity,
    opacity: 1,
    source: new ol.source.MapQuest({layer: 'osm'})
});

var map = new ol.Map({
    target: 'map',
    view: olview,
    layers: [baseLayer]
});

var geocoder = new geocoder.Nominatim();
map.addControl(geocoder);

geocoder.on('change:geocoder', function(evt){
    var feature_id = evt.target.get('geocoder');
    var feature = geocoder.getSource().getFeatureById(feature_id);
    var address = feature.get('address');
    var coord = feature.getGeometry().getCoordinates();
    content.innerHTML = '<p>'+address+'</p>';
    overlay.setPosition(coord);
});

/**
 * Popup
 **/
var
    container = document.getElementById('popup'),
    content = document.getElementById('popup-content'),
    closer = document.getElementById('popup-closer');

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};
var overlay = new ol.Overlay({
    element: container,
    offset: [0, -40]
});
map.addOverlay(overlay);