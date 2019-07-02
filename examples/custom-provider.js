(function(win, doc) {
  var olview = new ol.View({
      center: [-264000, 7480000],
      zoom: 5,
      minZoom: 2,
      maxZoom: 20,
    }),
    baseLayer = new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    map = new ol.Map({
      target: doc.getElementById('map'),
      view: olview,
      layers: [baseLayer],
    });

  // Create an instance of the custom provider, passing any options that are
  // required
  var provider = OsOpenNamesSearch({
    url: '//t0.ads.astuntechnology.com/open/search/osopennames/',
  });

  var geocoder = new Geocoder('nominatim', {
    // Specify the custom provider instance as the "provider" value
    provider: provider,
    autoComplete: true,
    autoCompleteMinLength: 3,
    targetType: 'text-input',
    lang: 'en',
    keepOpen: false,
    preventDefault: true,
  });
  map.addControl(geocoder);

  geocoder.on('addresschosen', function(evt) {
    if (evt.bbox) {
      map.getView().fit(evt.bbox, { duration: 500 });
    } else {
      map.getView().animate({ zoom: 14, center: evt.coordinate });
    }
  });

  /**
   * Custom provider for OS OpenNames search covering Great Britian.
   * Factory function which returns an object with the methods getParameters
   * and handleResponse called by the Geocoder
   */
  function OsOpenNamesSearch(options) {
    var url = options.url;
    return {
      /**
       * Get the url, query string parameters and optional JSONP callback
       * name to be used to perform a search.
       * @param {object} options Options object with query, key, lang,
       * countrycodes and limit properties.
       * @return {object} Parameters for search request
       */
      getParameters: function(opt) {
        return {
          url: url,
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
      handleResponse: function(results) {
        // The API returns a GeoJSON FeatureCollection
        if (results && results.features && results.features.length) {
          return results.features.map(function(feature) {
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
        } else {
          return;
        }
      },
    };
  }
})(window, document);
