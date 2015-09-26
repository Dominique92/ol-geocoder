# OpenLayers 3 Control Geocoder
A geocoder extension for OpenLayers 3.

![geocoder anim](https://raw.githubusercontent.com/jonataswalker/ol3-geocoder/screenshots/images/anim.gif)

## Demo
You can see [here a demo](http://rawgit.com/jonataswalker/ol3-geocoder/master/examples/control-nominatim.html) or on [jsFiddle](http://jsfiddle.net/jonataswalker/c4qv9afb/) if you prefer.

## Providers
The plugin supports (for now) the following providers:

* [OSM](http://www.openstreetmap.org/)/[Nominatim](http://wiki.openstreetmap.org/wiki/Nominatim)
* [MapQuest Geocoding API](http://open.mapquestapi.com/nominatim/) - requires KEY.
* [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro) - requires KEY.
* [Photon](http://photon.komoot.de/)

## How to use it?
##### CDN Hosted - [jsDelivr](http://www.jsdelivr.com/projects/openlayers.geocoder)
Load CSS and Javascript:
```HTML
<link href="//cdn.jsdelivr.net/openlayers.geocoder/latest/ol3-geocoder.min.css"  rel="stylesheet">
<script src="//cdn.jsdelivr.net/openlayers.geocoder/latest/ol3-geocoder.js"></script>
```
##### Self hosted
Download [latest release](https://github.com/jonataswalker/ol3-geocoder/releases/latest) and (obviously) load CSS and Javascript.

##### Instantiate with some options and add the Control
```javascript
var geocoder = new Geocoder('nominatim', {
    provider: 'mapquest',
    key: '__some_key__',
    lang: 'pt-BR', //en-US, fr-FR
    placeholder: 'Search for ...',
    limit: 5,
    keepOpen: true
});
map.addControl(geocoder);
```

##### Listen and do something when an address is chosen
```javascript
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
```

## Where are the docs?
Work in progress.