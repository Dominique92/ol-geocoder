/* global config, Geocoder, elements */
/*eslint vars-on-top: 0*/

casper.test.begin('Assert Photon provider', 5, function (test) {
  casper.start(config.url).waitFor(function () {
    return casper.evaluate(function () {
      return window.domready === true;
    });
  });
  casper.thenEvaluate(function (options) {
    options.provider = 'photon';
    var geocoder = new Geocoder('nominatim', options);
    var map = new ol.Map({
      target: 'map',
      layers: [],
      view: new ol.View({
        center: [0, 0],
        zoom: 1
      })
    });
    map.addControl(geocoder);
  }, config.geocoder_opts);

  casper.thenClick(elements.button);
  casper.waitForSelector(elements.control_expanded, function () {
    test.assertExists(elements.control_expanded);
  }).then(function () {
    this.sendKeys(elements.input_query, config.query, {
      keepFocus: true
    });
    this.sendKeys(elements.input_query, casper.page.event.key.Enter, {
      keepFocus: true
    });

    test.assertField({
      type: 'css',
      path: elements.input_query
    }, config.query);
  });

  casper.waitForSelector(elements.input_query_loading, function () {
    test.assertExists(elements.input_query_loading);
  });

  casper.waitForResource(function testResource(resource) {
    return resource.url.indexOf(config.providers.photon) > -1;
  }, function onReceived() {
    test.assertVisible(elements.list);
    test.assertEval(function (els) {
      return __utils__.findAll(els.list + ' > li').length >= 1;
    }, 'Ok, result length >= 1', elements);
  });

  casper.run(function () {
    test.done();
  });
});
