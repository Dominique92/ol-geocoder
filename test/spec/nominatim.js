/* global config */

var ol = require('openlayers');
var Geocoder = require('../../build/ol3-geocoder');
var elements = config.elements;

casper.options.viewportSize = { width: 1024, height: 768 };
casper.options.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X)';
casper.options.pageSettings.loadImages = true;
casper.options.pageSettings.loadPlugins = true;
casper.options.pageSettings.webSecurityEnabled = false;
casper.options.pageSettings.localToRemoteUrlAccessEnabled = true;

casper.test.begin('Assert DOM Elements', 13, function (test) {
  casper.start(config.url).waitFor(function () {
    return casper.evaluate(function () {
      return window.domready === true;
    });
  });
  casper.thenEvaluate(function (options) {
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

  casper.then(function () {
    // comparison
    var input_el = this.evaluate(function () {
      return __utils__.findOne(elements.input_query);
    });
    test.assertEvalEquals(function () {
      return __utils__.findOne(elements.input_query_class);
    }, input_el, 'Ok, comparing input by id and class');

    test.assertExists(elements.container);
    test.assertExists(elements.control);
    test.assertExists(elements.button);
    test.assertExists(elements.form);
    test.assertExists(elements.input_query);
    test.assertExists(elements.input_query_class);
    test.assertExists(elements.list);
    // assert structure
    test.assertExists(elements.container + ' > ' + elements.control);
    test.assertExists(elements.container + ' > ' + elements.list);
    test.assertExists(elements.control + ' > ' + elements.button);
    test.assertExists(elements.control + ' > ' + elements.form);
    test.assertExists(elements.form + ' > ' + elements.input_query);
  }).run(function () {
    test.done();
  });
});

casper.test.begin('assertInstanceOf() tests', 3, function (test) {
  var geocoder = new Geocoder('nominatim', config.geocoder_opts);
  test.assertInstanceOf(geocoder, ol.control.Control,
      'Ok, new Geocoder() is ol.control.Control');
  test.assertInstanceOf(geocoder.getLayer(), ol.layer.Vector,
      'Ok, #getLayer() returns ol.layer.Vector');
  test.assertInstanceOf(geocoder.getSource(), ol.source.Vector,
      'Ok, getSource() returns ol.source.Vector');
  test.done();
});

casper.test.begin('assert constructor properties', 6, function (test) {
  var geocoder = new Geocoder('nominatim', config.geocoder_opts);
  test.assertTruthy(geocoder.options.provider === config.geocoder_opts.provider,
      'Ok, provider is the same');
  test.assertTruthy(geocoder.options.lang === config.geocoder_opts.lang,
      'Ok, lang is the same');
  test.assertTruthy(
      geocoder.options.placeholder === config.geocoder_opts.placeholder,
      'Ok, placeholder is the same');
  test.assertTruthy(geocoder.options.limit === config.geocoder_opts.limit,
      'Ok, limit is the same');
  test.assertTruthy(geocoder.options.keepOpen === config.geocoder_opts.keepOpen,
      'Ok, keepOpen is the same');
  test.assertTruthy(geocoder.options.debug === config.geocoder_opts.debug,
      'Ok, debug is the same');
  test.done();
});
