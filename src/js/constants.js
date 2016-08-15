export const eventType = {
  ADDRESSCHOSEN: 'addresschosen'
};

export const featureStyle = [
  new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: [
        'data:image/png;base64,',
        'iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAYAAAA6GuKaAAAABmJLR0QA/wD/AP+gvaeT',
        'AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQWCiErd9Z21AAABAJJREFUWMPVm',
        'U1oXFUUx3/3zatJx04SDOgiVUMSgrXJwpqIKy26SrKoLjQgCkIFW7otuCvdllbo1q6Epg',
        'vNQvtx710lEFdihwpSjdikJLGJWEhrM9MyX7nPxbypwzBv5n3cqXpgmOHOuff/mzPn3Pf',
        'ueWDBpqZnrPq1M5EUVitZ+9wPvA0cAgaALqAIbAI3gAWt5HbjvCcGXROdmp4RwDDwBfBW',
        'iKmLwKfAqlbSiwvvJAAeAeaBWyGB8f1uAfNT0zMj/jqdjXQd8Ds+sJsguyrAe1rJb6NGX',
        'MQAPgJ8k7QefPOAd7WSl6OAi4jAk8D3cdKqhRngda3k9bDgUSL9NLAO9GPftoEXtZIPrR',
        'WiXyzHwwAbA8WyoFAUFMsCY0JB9wPHwxalGyH3T4RxHByo8MZEgf4+w/ZfDt9lu9n4I5T',
        'MCeBzP8+tQL8KDAZuA7swOljh4yM5JsaKGAPGA0fABzN5sje7+PJyht/WXNxU8O/1dbK2',
        '9ulPWn05tL/CqWP3GR8tUSgKSmVBpVJ9LxQF46MlTh27z9D+SiKdqNCBFw/jwexUnr4eg',
        'xfwx3oe9PUYZqfyGC+eThzo4SCYTNpweLLQtuCMgcOTBTLp4B8XpBMXuqnfroGxkTIi5M',
        'YpRNV/1yTjCQv9oHmkBXu7vRD1/s/1b2+3h+eJSDpxoa83G0w5HisbLqRCrpKClQ2XlON',
        'F0okL/XXTyQ6sbe1h/Y7bNkWEgPU7Lmtbe3CcaDpxoS8CuaYbfcpj7mqmVXE9Ltq5qxnc',
        'VKBjztexBl0Azgd9uZTt4spimlJZkHKqUa29Ug6UyoIri2mWsl2tNM77OlZvmIaBn4B00',
        '6tiRfDSUIk3JwocerlIzz7DTt7hxi9dLGW7+fX2U7huYJQfAeNayduduDX9Cni/3X5sPI',
        'HnVSPtCK9VDj/OZa3krPVbUx++J+y2FNF6tZI71s+IfhR2gNOWgU9rJXeinBUjnxGBF4A',
        'fgWcsAN8DXgE2OnJGbIC/CHxoAXpOK/lRx1sIvn1mKTVirRO377EFnE0IfFYrudXxvkdD',
        'bvcCvwOZGEvkgOeBB0+kwwTU9tIccClmlC8Bubj9vKQNyAPAzxHX8YCDWsnluLpOAmB84',
        'fmIU+e1kstJ2r42OkVH/S5R2G7S0aSCsaFrHU+tZB44F3LaOa1k/l/pTzfZSQ4APwD7Wr',
        'jmgdeA5STAttKjltsLbdwWkhSf1UjXRfxZ4M8WLs9pJe/a0HIsAeMDnQlwOaOVvPufeFD',
        'UJLcH/H27t6EtcBDYTJrLViNdl9ubwLWG4Wv+uDUTWDb/LLlSNzSilVy1qeFYBsYHvOAP',
        'XdBKrtrK5Y5A19lJqo8kTnZi8U6kRy0YY8BNwNgqwP+1/Q09w5giQWRk7AAAAABJRU5Er',
        'kJggg=='
      ].join('')
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
  lang: 'en-US',
  limit: 5,
  keepOpen: false,
  preventDefault: false,
  autoComplete: false,
  autoCompleteMinLength: 2,
  debug: false
};
