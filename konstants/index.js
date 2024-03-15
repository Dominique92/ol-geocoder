import * as _VARS_ from './vars.json';

export const VARS = _VARS_;

export const EVENT_TYPE = {
  ADDRESSCHOSEN: 'addresschosen',
};

export const CONTROL_TYPE = {
  NOMINATIM: 'nominatim',
  REVERSE: 'reverse',
};

export const TARGET_TYPE = {
  GLASS: 'glass-button',
  INPUT: 'text-input',
};

export const FEATURE_SRC = 'data:image/svg+xml;charset=utf-8,' +
  '<svg width="26" height="42" viewBox="0 0 26 42" xmlns="http://www.w3.org/2000/svg">' +
  '<polygon points="1,18 14,42 25,18" fill="rgb(75,75,75)" />' +
  '<ellipse cx="13" cy="13" rx="13" ry="13" fill="rgb(75,75,75)" />' +
  '<ellipse cx="13" cy="14" rx="6" ry="6" fill="yellow" />' +
  '</svg>'; // #285

export const PROVIDERS = {
  BING: 'bing',
  MAPQUEST: 'mapquest',
  OPENCAGE: 'opencage',
  OSM: 'osm',
  PHOTON: 'photon',
};

export const APIS = {
  BING: 'https://dev.virtualearth.net/REST/v1/Locations',
  MAPQUEST: 'https://nominatim.openstreetmap.org/search', // #286
  OPENCAGE: 'https://api.opencagedata.com/geocode/v1/json?',
  OSM: 'https://nominatim.openstreetmap.org/search',
  PHOTON: 'https://photon.komoot.io/api/',
};

export const DEFAULT_OPTIONS = {
  provider: PROVIDERS.OSM,
  label: '',
  placeholder: 'Search for an address',
  featureStyle: null,
  targetType: TARGET_TYPE.GLASS,
  lang: 'en-US',
  limit: 5,
  keepOpen: false,
  preventDefault: false,
  preventPanning: false,
  preventMarker: false,
  defaultFlyResolution: 10, // Meters per pixel
  debug: false,
};