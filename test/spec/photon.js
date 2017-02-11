/* global config, Geocoder */
/*eslint vars-on-top: 0*/

var vars = config.vars;
var glassClasses = config.glassClasses;

casper.test.begin('Assert Photon provider', 4, function (test) {
  casper.start(config.url).waitFor(function () {
    return casper.evaluate(function () { return window.domready === true; });
  });
  casper.thenEvaluate(function (options) {
    options.provider = 'photon';
    var geocoder = new Geocoder('nominatim', options);
    var map = new ol.Map({
      target: 'map',
      layers: [],
      view: new ol.View({ center: [0, 0], zoom: 1 })
    });
    map.addControl(geocoder);
  }, config.geocoderOpts);

  casper.thenClick(glassClasses.button);
  casper.waitForSelector(glassClasses.expanded, function () {
    test.assertExists(glassClasses.expanded);
  }).then(function () {
    this.sendKeys(vars.inputQuery, config.query, { keepFocus: true });
    this.sendKeys(vars.inputQuery, casper.page.event.key.Enter, {
      keepFocus: true
    });

    test.assertField({
      type: 'css',
      path: vars.inputQuery
    }, config.query);
  });

  casper.waitForResource(function testResource(resource) {
    return resource.url.indexOf(config.providers.photon) > -1;
  }, function onReceived() {
    test.assertVisible(glassClasses.result);
    test.assertEval(function (list) {
      return __utils__.findAll(list + ' > li').length >= 1;
    }, 'Ok, result length >= 1', glassClasses.result);
  });
  casper.run(function () { test.done(); });
});
