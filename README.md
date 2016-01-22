# OpenLayers 3 Control Geocoder
A geocoder extension for OpenLayers 3 (at least v3.11.0).

![geocoder anim](https://raw.githubusercontent.com/jonataswalker/ol3-geocoder/screenshots/images/anim.gif)

## Demo
You can see [here a demo](http://rawgit.com/jonataswalker/ol3-geocoder/master/examples/control-nominatim.html) or on [jsFiddle](http://jsfiddle.net/jonataswalker/c4qv9afb/) if you prefer.

## Providers
The plugin supports (for now) the following providers:

* [OSM](http://www.openstreetmap.org/)/[Nominatim](http://wiki.openstreetmap.org/wiki/Nominatim) &mdash; `'osm'`.
* [MapQuest Geocoding API](http://open.mapquestapi.com/nominatim/) - requires KEY  &mdash; `'mapquest'`.
* [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro) - requires KEY  &mdash; `'google'`.
* [Photon](http://photon.komoot.de/)  &mdash; `'photon'`.
* [Mapzen Search/Pelias](https://mapzen.com/projects/search) - requires KEY  &mdash; `'pelias'`.

## How to use it?
##### CDN Hosted - [jsDelivr](http://www.jsdelivr.com/projects/openlayers.geocoder)
Load CSS and Javascript:
```HTML
<link href="//cdn.jsdelivr.net/openlayers.geocoder/latest/ol3-geocoder.min.css" rel="stylesheet">
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
geocoder.on('addresschosen', function(evt){
  var
    feature = evt.feature,
    coord = evt.coordinate,
    address_html = feature.get('address_html')
  ;
  content.innerHTML = '<p>'+address_html+'</p>';
  overlay.setPosition(coord);
});
```

# API

## Constructor

#### `new Geocoder(control_type, options)`

###### `control_type` `{String}`
Maybe later we will have other types like `'reverse'`. So for now just pass `'nominatim'`.

###### `options` is an object with the following possible properties:
* `provider`    : `'osm'` (default), `'mapquest'`, `'google'`, `'photon'`, `'pelias'`; Your preferable provider;
* `key`         : ''; API Key if required;
* `placeholder` : 'Search for an address'; Placeholder for text input;
* `featureStyle`: `ol.style.Style`; Feature style;
* `lang`        : `'en-US'`; Preferable language;
* `limit`       : `5`; Limit of results;
* `keepOpen`    : `false`; Whether the results keep openned;
* `debug`       : `false`; If true logs provider's response;

## Methods

#### `geocoder.getLayer()`
Returns the layer `{ol.layer.Vector}` created by Geocoder control.

#### `geocoder.getSource()`
Returns the source `{ol.source.Vector}` created by Geocoder control.
