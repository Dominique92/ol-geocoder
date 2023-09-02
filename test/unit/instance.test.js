/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://localhost/"}
 */

import Control from 'ol/control/Control';
import LayerVector from 'ol/layer/Vector';
import SourceVector from 'ol/source/Vector';

// eslint-disable-next-line no-shadow
import Geocoder from '../../dist/ol-geocoder';
import { DEFAULT_OPTIONS, PROVIDERS } from '../../konstants';

const options = {
  provider: PROVIDERS.PHOTON,
  targetType: 'text-input',
  lang: 'en',
  placeholder: 'Search for ...',
  limit: 5,
  keepOpen: false,
};

const geocoder = new Geocoder();
const geocoderWithOptions = new Geocoder('nominatim', options);

describe('Instance of', () => {
  test('is a constructor', () => {
    expect(geocoder instanceof Geocoder).toBeTruthy();
  });

  test('is ol.control.Control', () => {
    expect(geocoder).toBeInstanceOf(Control);
  });
});

describe('Instance options', () => {
  test('default options', () => {
    geocoder.options.featureStyle = null;
    expect(geocoder.options).toEqual(DEFAULT_OPTIONS);
  });

  test('merge options', () => {
    expect(geocoderWithOptions.options).toMatchObject(options);
  });
});

describe('Instance methods', () => {
  test('getLayer()', () => {
    const layer = geocoder.getLayer();

    expect(layer).toBeInstanceOf(LayerVector);
  });

  test('getSource()', () => {
    const source = geocoder.getSource();

    expect(source).toBeInstanceOf(SourceVector);
  });

  test('setProvider()', () => {
    geocoder.setProvider(PROVIDERS.BING);
    expect(geocoder.options.provider).toBe(PROVIDERS.BING);
  });

  test('setProviderKey()', () => {
    geocoder.setProviderKey('foo');
    expect(geocoder.options.key).toBe('foo');
  });
});

describe('Throw errors', () => {
  test('wrong control type', () => {
    expect(() => {
      new Geocoder('foo');
    }).toThrow();
  });

  test('wrong options type', () => {
    expect(() => {
      new Geocoder('nominatim', 'foo');
    }).toThrow();
  });
});
