# OpenLayers 3 Control Geocoder
<p align="center">
  <a href="https://travis-ci.org/jonataswalker/ol3-geocoder">
    <img src="https://travis-ci.org/jonataswalker/ol3-geocoder.svg?branch=master" alt="build status">
  </a>
  <a href="https://www.npmjs.com/package/ol3-geocoder">
    <img src="https://img.shields.io/npm/v/ol3-geocoder.svg"
      alt="npm version">
  </a>
  <a href="https://github.com/jonataswalker/ol3-geocoder/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/ol3-geocoder.svg"
      alt="license">
  </a>
  <a href="https://david-dm.org/jonataswalker/ol3-geocoder">
    <img src="https://david-dm.org/jonataswalker/ol3-geocoder/status.svg"
      alt="dependency status">
  </a>
  <a href="https://david-dm.org/jonataswalker/ol3-geocoder">
    <img src="https://david-dm.org/jonataswalker/ol3-geocoder/dev-status.svg" alt="devDependency status">
  </a>
</p>

A geocoder extension for [OpenLayers 3](http://openlayers.org/). **Requires** OpenLayers **v3.11.0** or higher.

![geocoder anim](https://raw.githubusercontent.com/jonataswalker/ol3-geocoder/screenshots/images/anim.gif)

## Demo
You can see [here a demo](http://rawgit.com/jonataswalker/ol3-geocoder/master/examples/control-nominatim.html) or on [jsFiddle](http://jsfiddle.net/jonataswalker/c4qv9afb/) if you prefer.

## Providers
The plugin supports (for now) the following providers:

* [OSM](http://www.openstreetmap.org/)/[Nominatim](http://wiki.openstreetmap.org/wiki/Nominatim) &mdash; `'osm'`.
* [MapQuest Geocoding API](http://open.mapquestapi.com/nominatim/) &mdash; requires KEY  &mdash; `'mapquest'`.
* [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro) &mdash; requires KEY  &mdash; `'google'`. See [#16](https://github.com/jonataswalker/ol3-geocoder/issues/16).
* [Photon](http://photon.komoot.de/)  &mdash; `'photon'`.
* [Mapzen Search/Pelias](https://mapzen.com/projects/search) &mdash; requires KEY  &mdash; `'pelias'`.
* [Bing](https://msdn.microsoft.com/pt-br/library/ff701713.aspx) &mdash; requires KEY  &mdash; `'bing'`.

## How to use it?
##### CDN Hosted - [jsDelivr](http://www.jsdelivr.com/projects/openlayers.geocoder)
Load CSS and Javascript:
```HTML
<link href="//cdn.jsdelivr.net/openlayers.geocoder/latest/ol3-geocoder.min.css" rel="stylesheet">
<script src="//cdn.jsdelivr.net/openlayers.geocoder/latest/ol3-geocoder.js"></script>
```
##### CDN Hosted - UNPKG
Load CSS and Javascript:
```HTML
<link href="https://unpkg.com/ol3-geocoder/build/ol3-geocoder.min.css" rel="stylesheet">
<script src="https://unpkg.com/ol3-geocoder/build/ol3-geocoder.js"></script>
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
  targetType: 'text-input',
  limit: 5,
  keepOpen: true
});
map.addControl(geocoder);
```

##### Listen and do something when an address is chosen
```javascript
geocoder.on('addresschosen', function(evt){
  var feature = evt.feature,
      coord = evt.coordinate,
      address = evt.address;
  // some popup solution
  content.innerHTML = '<p>'+ address.formatted +'</p>';
  overlay.setPosition(coord);
});
```

# API

## Constructor

#### `new Geocoder(type, options)`

- `type` `{String}` - Maybe later we will have other types like `'reverse'`. So for now just pass `'nominatim'`.

- `options` is an object with the following possible properties:
  * `provider`             : `'osm'` (default), `'mapquest'`, `'google'`, `'photon'`, `'pelias'`, `'bing'`; Your preferable provider;
  * `key`                  : `''`; API Key if required;
  * `autoComplete`         : `false`; Search as you type;
  * `autoCompleteMinLength`: `2`; The minimum number of characters to trigger search;
  * `placeholder`          : `'Search for an address'`; Placeholder for text input;
  * `targetType`           : `'glass-button'`; Can also be `'text-input'`;
  * `featureStyle`         : `ol.style.Style`; Feature style;
  * `lang`                 : `'en-US'`; Preferable language;
  * `limit`                : `5`; Limit of results;
  * `countrycodes`         : `''`; Only valid for `osm` and `mapquest`; Limit search results to a specific country (or a list of countries). This is an [ISO 3166-1alpha2 code] (https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2), e.g. `gb` for the United Kingdom, `br` for Brazil, etc;
  * `keepOpen`             : `false`; Whether the results keep openned;
  * `preventDefault`       : `false`; Whether panning (and creating marker) when an address is chosen;
  * `debug`                : `false`; If true logs provider's response;

## Instance Methods

#### `getLayer()`
Returns the layer `{ol.layer.Vector}` created by Geocoder control.

#### `getSource()`
Returns the source `{ol.source.Vector}` created by Geocoder control.

## Events

##### Triggered when an address is chosen
```javascript
geocoder.on('addresschosen', function(evt) {
  // it's up to you
  console.info(evt);
});
```
