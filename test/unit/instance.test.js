const ol = require('openlayers');
const Geocoder = require('../../dist/ol-geocoder');
const { DEFAULT_OPTIONS } = require('../../konstants');

const options = {
  provider: 'photon',
  targetType: 'text-input',
  lang: 'en',
  placeholder: 'Search for ...',
  limit: 5,
  keepOpen: false
};

const geocoder = new Geocoder();
const geocoderWithOptions = new Geocoder('nominatim', options);

describe('Instance of', () => {
  test('is a constructor', () => {
    expect(geocoder instanceof Geocoder).toBeTruthy();
  });

  test('is ol.control.Control', () => {
    expect(geocoder instanceof ol.control.Control).toBeTruthy();
  });
});

describe('Instance options', () => {
  test('default options', () => {
    expect(geocoder.options).toEqual(DEFAULT_OPTIONS);
  });

  test('merge options', () => {
    expect(geocoderWithOptions.options).toMatchObject(options);
  });
});

describe('Instance methods', () => {
  test('getLayer()', () => {
    const layer = geocoder.getLayer();
    expect(layer instanceof ol.layer.Vector).toBeTruthy();
  });

  test('getSource()', () => {
    const source = geocoder.getSource();
    expect(source instanceof ol.source.Vector).toBeTruthy();
  });
});

describe('Throw errors', () => {
  test('wrong control type', () => {
    expect(() => { new Geocoder('foo') }).toThrowError();
  });

  test('wrong options type', () => {
    expect(() => { new Geocoder('nominatim', 'foo') }).toThrowError();
  });
});
