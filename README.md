# OpenLayers 3 Control Geocoder
A geocoder extension for OpenLayers 3.

![geocoder anim](https://raw.githubusercontent.com/jonataswalker/ol3-geocoder/screenshots/images/anim.gif)

## Demo
You can see [here a demo](http://rawgit.com/jonataswalker/ol3-geocoder/master/examples/control-nominatim.html).

## Providers
The plugin supports (for now) the following providers:

* [OSM](http://www.openstreetmap.org/)/[Nominatim](http://wiki.openstreetmap.org/wiki/Nominatim)
* [MapQuest Geocoding API](http://open.mapquestapi.com/nominatim/)
* [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro)
* [Photon](http://photon.komoot.de/)

## How to use it?
Load (from [jsDelivr CDN](http://www.jsdelivr.com/projects/openlayers.geocoder)) the CSS and Javascript:
```HTML
<link rel="stylesheet" href="//cdn.jsdelivr.net/openlayers.geocoder/latest/ol3-geocoder.min.css">
<script src="//cdn.jsdelivr.net/openlayers.geocoder/latest/ol3-geocoder.js"></script>
```
[Or download latest release.](https://github.com/jonataswalker/ol3-geocoder/releases/latest)

Instantiate with some options and add the Control
```javascript
var geocoder = new Geocoder('nominatim', {
    provider: 'mapquest',
    lang: 'pt-BR', //en-US, fr-FR
    limit: 5,
    keepOpen: true
});
map.addControl(geocoder);
```

Listen and do something when an address is chosen
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
Help wanted.