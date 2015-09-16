(function(win, doc){
    'use strict';
    
    var 
        olview = new ol.View({
            center: [0, 0],
            zoom: 3,
            minZoom: 2,
            maxZoom: 20
        }),
        baseLayer = new ol.layer.Tile({
            preload: Infinity,
            opacity: 1,
            source: new ol.source.MapQuest({layer: 'osm'})
        }),
        map = new ol.Map({
            target: doc.getElementById('map'),
            view: olview,
            layers: [baseLayer]
        })
    ;

    //Instantiate with some options and add the Control
    var geocoder = new Geocoder('nominatim', {
        provider: 'mapquest',
        key: '5wLaMQ9Z56pVgIKqxhD2UaM2BetlR6Vz', //please, get yours at
                                                 // https://developer.mapquest.com/
        lang: 'pt-BR',
        limit: 5,
        keepOpen: true
    });
    map.addControl(geocoder);
    
    //Listen when an address is chosen
    geocoder.on('change:geocoder', function(evt){
        var
            feature_id = evt.target.get('geocoder'),
            feature = geocoder.getSource().getFeatureById(feature_id),
            address = feature.get('address'),
            coord = feature.getGeometry().getCoordinates()
        ;
        content.innerHTML = '<p>'+address+'</p>';
        overlay.setPosition(coord);
    });

    /**
    * Popup
    **/
    var
        container = doc.getElementById('popup'),
        content = doc.getElementById('popup-content'),
        closer = doc.getElementById('popup-closer'),
        overlay = new ol.Overlay({
            element: container,
            offset: [0, -40]
        })
    ;
    closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };
    map.addOverlay(overlay);
})(window, document);