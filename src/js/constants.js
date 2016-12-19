import * as _VARS from '../../config/vars.json';

export const eventType = {
  ADDRESSCHOSEN: 'addresschosen'
};

export const controlType = {
  NOMINATIM: 'nominatim',
  REVERSE: 'reverse'
};

export const targetType = {
  GLASS: 'glass-button',
  INPUT: 'text-input'
};

export const vars = _VARS;

export const featureStyle = [
  new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      scale: .7,
      src: '//cdn.rawgit.com/jonataswalker/map-utils/master/images/marker.png'
    })
  })
];

export const providers = {
  OSM: 'osm',
  MAPQUEST: 'mapquest',
  GOOGLE: 'google',
  PHOTON: 'photon',
  BING: 'bing',
  PELIAS: 'pelias'
};

export const defaultOptions = {
  provider: providers.OSM,
  placeholder: 'Search for an address',
  featureStyle: featureStyle,
  targetType: targetType.GLASS,
  lang: 'en-US',
  limit: 5,
  keepOpen: false,
  preventDefault: false,
  autoComplete: false,
  autoCompleteMinLength: 2,
  debug: false
};
