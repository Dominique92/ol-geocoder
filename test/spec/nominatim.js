/* global config */

var ol = require('openlayers');
var Geocoder = require('../../build/ol3-geocoder');
var vars = config.vars;
var glassClasses = config.glassClasses;

casper.options.viewportSize = { width: 1024, height: 768 };
casper.options.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X)';
casper.options.pageSettings.loadImages = true;
casper.options.pageSettings.loadPlugins = true;
casper.options.pageSettings.webSecurityEnabled = false;
casper.options.pageSettings.localToRemoteUrlAccessEnabled = true;

casper.test.begin('Assert DOM Elements', 11, function (test) {
  casper.start(config.url).waitFor(function () {
    return casper.evaluate(function () { return window.domready === true; });
  });
  casper.thenEvaluate(function (options) {
    var geocoder = new Geocoder('nominatim', options);
    var map = new ol.Map({
      target: 'map',
      layers: [],
      view: new ol.View({ center: [0, 0], zoom: 1 })
    });
    map.addControl(geocoder);
  }, config.geocoderOpts);

  casper.then(function () {
    // comparison
    var input_el = this.evaluate(function () {
      return __utils__.findOne(vars.inputQuery);
    });
    test.assertEvalEquals(function () {
      return __utils__.findOne(glassClasses.input);
    }, input_el, 'Ok, comparing input by id and class');

    test.assertExists(glassClasses.container);
    test.assertExists(glassClasses.control);
    test.assertExists(glassClasses.button);
    test.assertExists(vars.inputQuery);
    test.assertExists(glassClasses.input);
    test.assertExists(glassClasses.result);
    // assert structure
    test.assertExists(glassClasses.container + ' > ' + glassClasses.control);
    test.assertExists(glassClasses.container + ' > ' + glassClasses.result);
    test.assertExists(glassClasses.control + ' > ' + glassClasses.button);
    test.assertExists(glassClasses.control + '>' + vars.inputQuery);
  }).run(function () { test.done(); });
});

casper.test.begin('assertInstanceOf() tests', 3, function (test) {
  var geocoder = new Geocoder('nominatim', config.geocoderOpts);
  test.assertInstanceOf(geocoder, ol.control.Control,
      'Ok, new Geocoder() is ol.control.Control');
  test.assertInstanceOf(geocoder.getLayer(), ol.layer.Vector,
      'Ok, #getLayer() returns ol.layer.Vector');
  test.assertInstanceOf(geocoder.getSource(), ol.source.Vector,
      'Ok, getSource() returns ol.source.Vector');
  test.done();
});

casper.test.begin('assert constructor properties', 6, function (test) {
  var geocoder = new Geocoder('nominatim', config.geocoderOpts);
  test.assertTruthy(geocoder.options.provider === config.geocoderOpts.provider,
      'Ok, provider is the same');
  test.assertTruthy(geocoder.options.lang === config.geocoderOpts.lang,
      'Ok, lang is the same');
  test.assertTruthy(
      geocoder.options.placeholder === config.geocoderOpts.placeholder,
      'Ok, placeholder is the same');
  test.assertTruthy(geocoder.options.limit === config.geocoderOpts.limit,
      'Ok, limit is the same');
  test.assertTruthy(geocoder.options.keepOpen === config.geocoderOpts.keepOpen,
      'Ok, keepOpen is the same');
  test.assertTruthy(geocoder.options.debug === config.geocoderOpts.debug,
      'Ok, debug is the same');
  test.done();
});
