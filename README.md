# OpenLayers Control Geocoder
<p align="center">
  <a href="https://www.npmjs.com/package/ol-geocoder">
    <img src="https://img.shields.io/npm/v/ol-geocoder.svg" alt="npm version">
  </a>
  <a href="https://github.com/Dominique92/ol-geocoder/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/ol-geocoder.svg" alt="license">
  </a>
</p>

A geocoder extension compatible with OpenLayers v7 & v8 (Tested with all versions from v6.15.1 to v8.0.0).

![geocoder anim](https://raw.githubusercontent.com/Dominique92/ol-geocoder/screenshots/images/anim.gif)

## Demo
You can see [here a demo](http://dominique92.github.io/ol-geocoder/examples/control-nominatim.html)
or on [jsFiddle](http://jsfiddle.net/Dominique92/c4qv9afb/) if you prefer.
There is also a [demo of creating a custom provider](http://dominique92.github.io/ol-geocoder/examples/custom-provider.html)

## Providers
The plugin supports (for now) the following providers:

* [OSM](https://www.openstreetmap.org/)/[Nominatim](https://nominatim.org/) &mdash; `'osm'`.
* [MapQuest Geocoding API](https://developer.mapquest.com/documentation/geocoding-api/) &mdash; requires KEY  &mdash; `'mapquest'`.
* [Photon](https://photon.komoot.io/)  &mdash; `'photon'`.
* [Bing](https://docs.microsoft.com/en-us/bingmaps/rest-services/) &mdash; requires KEY  &mdash; `'bing'`.
* [OpenCage](https://opencagedata.com/) &mdash; requires KEY  &mdash; `'opencage'`.

### Custom Providers
You can also write your own provider, passing an instance of it to the `Geocoder` constructor via the `provider` property of the options argument.

For an example of defining and using a custom provider see [`examples/custom-provider.js`](examples/custom-provider.js)

Custom providers must implement the following methods:

#### `getParameters(options)`
* `options` `{Object}`
    * `query` Search string entered by the user;
    * `lang` `{string}` Preferable language;
    * `limit` `{number}` Limit of results;

#### `handleResponse(results)`
* `results` `{Object}` Parsed JSON response from API call
 
##### NPM
`npm install ol-geocoder`

##### CDN hosted - [jsDelivr](https://www.jsdelivr.com/package/npm/ol-geocoder)
Load CSS and Javascript:
```HTML
<link href="https://cdn.jsdelivr.net/npm/ol-geocoder@latest/dist/ol-geocoder.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/ol-geocoder"></script>
```

##### CDN hosted - unpkg
Load CSS and Javascript:
```HTML
<link href="https://unpkg.com/ol-geocoder/dist/ol-geocoder.min.css" rel="stylesheet">
<script src="https://unpkg.com/ol-geocoder"></script>
```

##### Github pages hosted
Load CSS and Javascript:
```HTML
<link rel="stylesheet" href="http://dominique92.github.io/ol-geocoder/dist/ol-geocoder.css">
<script src="http://dominique92.github.io/ol-geocoder/dist/ol-geocoder-debug.js"></script>
```

##### Self hosted
Download [latest release](https://github.com/Dominique92/ol-geocoder/releases/latest) and (obviously) load CSS and Javascript.

##### Instantiate with some options and add the Control
```javascript
const geocoder = new Geocoder('nominatim', {
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
geocoder.on('addresschosen', (evt) => {
  const feature = evt.feature,
    coord = evt.coordinate,
    address = evt.address;
  // some popup solution
  content.innerHTML = '<p>' + address.formatted + '</p>';
  overlay.setPosition(coord);
});
```

# API

## Constructor

#### `new Geocoder(type, options)`

- `type` `{String}` - Maybe later we will have other types like `'reverse'`. So for now just pass `'nominatim'`.

- `options` is an object with the following possible properties:
  * `provider`             : `'osm'` (default), `'mapquest'`, `'photon'`, `'pelias'`, `'bing'`, `'opencage'`, custom provider instance; Your preferable provider;
  * `url`                  : `'https://nominatim.openstreetmap.org/search''`; API provider url;
  * `key`                  : `''`; API Key if required;
  * `label`                : `label to be display in the top of the input div;
  * `placeholder`          : `'Search for an address'`; Placeholder for text input;
  * `targetType`           : `'glass-button'`; Can also be `'text-input'`;
  * `featureStyle`         : `ol.style.Style`; Feature style;
  * `lang`                 : `'en-US'`; Preferable language;
  * `limit`                : `5`; Limit of results; If limit = 1 : don't display the list but directly fies to the first found;
  * `countrycodes`         : `''`; Only valid for `osm` and `mapquest`; Limit search results to a specific country (or a list of country codes separated with commas `FR,US`). This is an [ISO 3166-1alpha2 code] (https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2), e.g. `gb` for the United Kingdom, `br` for Brazil, etc;
  * `viewbox`              : `''`; The preferred area to find search results. Any two corner points of the box are accepted as long as they span a real box. (string) '<x1>,<y1>,<x2>,<y2>' x is longitude, y is latitude (EPSG:4326);
  * `keepOpen`             : `false`; Whether the results keep openned;
  * `preventDefault`       : `false`; Whether panning (and creating marker) when an address is chosen;
  * `preventPanning`       : `false`; When true, prevent panning, but create marker, when an address is chosen;
  * `preventMarker`        : `false`; When true, prevent creating marker, but provide panning, when an address is chosen;
  * `defaultFlyResolution` : `10`; (meters per pixel) resolution to fly to when only coords & not bbox is returned by the provider;
  * `target`               : `null`; html element to attach the selector to (outside the map);
  * `debug`                : `false`; If true logs provider's response;

## Instance Methods

#### `getLayer()`
Returns the layer `{ol.layer.Vector}` created by Geocoder control.

#### `getSource()`
Returns the source `{ol.source.Vector}` created by Geocoder control.

#### `setProvider(provider)`

`@param {String} provider`

Sets a new provider.

#### `setProviderKey(key)`

`@param {String} key`

Sets provider key.

## Events

##### Triggered when an address is chosen
```javascript
geocoder.on('addresschosen', function(evt) {
  // it's up to you
  console.info(evt);
});
```

# Maintenance takeover
I would like to thank you @jonataswalker & @kirtandesai and the entire development team for the fantastic work done so far creating and maintaining this project.
As they request a new maintainer, I will assume it within the core goals and values of the project.
@Dominque92
