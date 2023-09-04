((win, doc) => {
  const olview = new ol.View({
    center: [-264000, 7480000],
    zoom: 5,
    minZoom: 2,
    maxZoom: 20,
  });

  const baseLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
  });
  const map = new ol.Map({
    target: doc.querySelector('#map'),
    view: olview,
    layers: [baseLayer],
  });

  // Create an instance of the custom provider, passing any options that are
  // required
  const provider = OsOpenNamesSearch({
    url: '//t0.ads.astuntechnology.com/open/search/osopennames/',
  });

  const geocoder = new Geocoder('nominatim', {
    // Specify the custom provider instance as the "provider" value
    provider,
    targetType: 'text-input',
    lang: 'en',
    keepOpen: false,
    preventDefault: true,
  });

  map.addControl(geocoder);

  geocoder.on('addresschosen', (evt) => {
    if (evt.bbox) {
      map.getView().fit(evt.bbox, {
        duration: 500
      });
    } else {
      map.getView().animate({
        zoom: 14,
        center: evt.coordinate
      });
    }
  });

  /**
   * Custom provider for OS OpenNames search covering Great Britian.
   * Factory function which returns an object with the methods getParameters
   * and handleResponse called by the Geocoder
   */
  function OsOpenNamesSearch(options) {
    const {
      url
    } = options;

    return {
      /**
       * Get the url, query string parameters and optional JSONP callback
       * name to be used to perform a search.
       * @param {object} options Options object with query, key, lang,
       * countrycodes and limit properties.
       * @return {object} Parameters for search request
       */
      getParameters(opt) {
        return {
          url,
          callbackName: 'callback',

          params: {
            q: opt.query,
          },
        };
      },

      /**
       * Given the results of performing a search return an array of results
       * @param {object} data returned following a search request
       * @return {Array} Array of search results
       */
      handleResponse(results) {
        // The API returns a GeoJSON FeatureCollection
        if (results && results.features && results.features.length !== 0) {
          return results.features.map((feature) => {
            return {
              lon: feature.geometry.coordinates[0],
              lat: feature.geometry.coordinates[1],

              address: {
                // Simply return a name in this case, could also return road,
                // building, house_number, city, town, village, state,
                // country
                name: feature.properties.search_full,
              },

              bbox: feature.bbox,
            };
          });
        }

        return [];
      },
    };
  }
})(window, document);