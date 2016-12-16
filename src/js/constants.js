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

const icon = [
  'data:image/png;base64,',
  'iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAYAAAA6GuKaAAAABmJLR0QA/wD/AP+gvaeTAAAACX',
  'BIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQWCiErd9Z21AAABAJJREFUWMPVmU1oXFUUx3/3',
  'zatJx04SDOgiVUMSgrXJwpqIKy26SrKoLjQgCkIFW7otuCvdllbo1q6EpgvNQvtx710lEFdihw',
  'pSjdikJLGJWEhrM9MyX7nPxbypwzBv5n3cqXpgmOHOuff/mzPn3PfueWDBpqZnrPq1M5EUVitZ',
  '+9wPvA0cAgaALqAIbAI3gAWt5HbjvCcGXROdmp4RwDDwBfBWiKmLwKfAqlbSiwvvJAAeAeaBWy',
  'GB8f1uAfNT0zMj/jqdjXQd8Ds+sJsguyrAe1rJb6NGXMQAPgJ8k7QefPOAd7WSl6OAi4jAk8D3',
  'cdKqhRngda3k9bDgUSL9NLAO9GPftoEXtZIPrRWiXyzHwwAbA8WyoFAUFMsCY0JB9wPHwxalGy',
  'H3T4RxHByo8MZEgf4+w/ZfDt9lu9n4I5TMCeBzP8+tQL8KDAZuA7swOljh4yM5JsaKGAPGA0fA',
  'BzN5sje7+PJyht/WXNxU8O/1dbK29ulPWn05tL/CqWP3GR8tUSgKSmVBpVJ9LxQF46MlTh27z9',
  'D+SiKdqNCBFw/jwexUnr4egxfwx3oe9PUYZqfyGC+eThzo4SCYTNpweLLQtuCMgcOTBTLp4B8X',
  'pBMXuqnfroGxkTIi5MYpRNV/1yTjCQv9oHmkBXu7vRD1/s/1b2+3h+eJSDpxoa83G0w5HisbLq',
  'RCrpKClQ2XlONF0okL/XXTyQ6sbe1h/Y7bNkWEgPU7Lmtbe3CcaDpxoS8CuaYbfcpj7mqmVXE9',
  'Ltq5qxncVKBjztexBl0Azgd9uZTt4spimlJZkHKqUa29Ug6UyoIri2mWsl2tNM77OlZvmIaBn4',
  'B006tiRfDSUIk3JwocerlIzz7DTt7hxi9dLGW7+fX2U7huYJQfAeNayduduDX9Cni/3X5sPIHn',
  'VSPtCK9VDj/OZa3krPVbUx++J+y2FNF6tZI71s+IfhR2gNOWgU9rJXeinBUjnxGBF4AfgWcsAN',
  '8DXgE2OnJGbIC/CHxoAXpOK/lRx1sIvn1mKTVirRO377EFnE0IfFYrudXxvkdDbvcCvwOZGEvk',
  'gOeBB0+kwwTU9tIccClmlC8Bubj9vKQNyAPAzxHX8YCDWsnluLpOAmB84fmIU+e1kstJ2r42Ok',
  'VH/S5R2G7S0aSCsaFrHU+tZB44F3LaOa1k/l/pTzfZSQ4APwD7WrjmgdeA5STAttKjltsLbdwW',
  'khSf1UjXRfxZ4M8WLs9pJe/a0HIsAeMDnQlwOaOVvPufeFDUJLcH/H27t6EtcBDYTJrLViNdl9',
  'ubwLWG4Wv+uDUTWDb/LLlSNzSilVy1qeFYBsYHvOAPXdBKrtrK5Y5A19lJqo8kTnZi8U6kRy0Y',
  'Y8BNwNgqwP+1/Q09w5giQWRk7AAAAABJRU5ErkJggg=='
].join('');

export const featureStyle = [
  new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: icon
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
