/*!
 * ol3-geocoder - v2.5.0
 * A geocoder extension for OpenLayers.
 * https://github.com/jonataswalker/ol3-geocoder
 * Built: Tue Feb 21 2017 08:59:29 GMT-0300 (BRT)
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Geocoder = factory());
}(this, (function () { 'use strict';

var inputQueryId = "gcd-input-query";
var inputResetId = "gcd-input-reset";
var cssClasses = {"namespace":"ol-geocoder","spin":"gcd-pseudo-rotate","hidden":"gcd-hidden","country":"gcd-country","city":"gcd-city","road":"gcd-road","olControl":"ol-control","glass":{"container":"gcd-gl-container","control":"gcd-gl-control","button":"gcd-gl-btn","input":"gcd-gl-input","expanded":"gcd-gl-expanded","reset":"gcd-gl-reset","result":"gcd-gl-result"},"inputText":{"container":"gcd-txt-container","control":"gcd-txt-control","input":"gcd-txt-input","reset":"gcd-txt-reset","icon":"gcd-txt-glass","result":"gcd-txt-result"}};
var vars$1 = {
	inputQueryId: inputQueryId,
	inputResetId: inputResetId,
	cssClasses: cssClasses
};

var _VARS = Object.freeze({
	inputQueryId: inputQueryId,
	inputResetId: inputResetId,
	cssClasses: cssClasses,
	default: vars$1
});

var eventType = {
  ADDRESSCHOSEN: 'addresschosen'
};

var controlType = {
  NOMINATIM: 'nominatim',
  REVERSE: 'reverse'
};

var targetType = {
  GLASS: 'glass-button',
  INPUT: 'text-input'
};

var vars = _VARS;

var featureStyle = [
  new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      scale: .7,
      src: '//cdn.rawgit.com/jonataswalker/map-utils/master/images/marker.png'
    })
  })
];

var providers = {
  OSM: 'osm',
  MAPQUEST: 'mapquest',
  GOOGLE: 'google',
  PHOTON: 'photon',
  BING: 'bing',
  PELIAS: 'pelias'
};

var defaultOptions = {
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

/**
 * @module utils
 * All the helper functions needed in this project
 */
var utils = {
  toQueryString: function toQueryString(obj) {
    var this$1 = this;

    return Object.keys(obj).reduce(function (a, k) {
      a.push(
        typeof obj[k] === 'object' ?
          this$1.toQueryString(obj[k]) :
            encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
      );
      return a;
    }, []).join('&');
  },
  encodeUrlXhr: function encodeUrlXhr(url, data) {
    if (data && typeof data === 'object') {
      var str_data = this.toQueryString(data);
      url += (/\?/.test(url) ? '&' : '?') + str_data;
    }
    return url;
  },
  json: function json(url, data) {
    var xhr = new XMLHttpRequest(),
        url_ = '',
        data_type = '',
        when = {},
        onload = function () {
          if (xhr.status === 200) {
            when.ready.call(undefined, JSON.parse(xhr.response));
          }
        },
        onerror = function () {
          console.error('Cannot XHR ' + JSON.stringify(url));
        };

    if (typeof url === 'object') {
      url_ = url.url;
      data = url.data;
      data_type = url.data_type || 'json';
    } else {
      url_ = url;
    }

    url_ = this.encodeUrlXhr(url_, data);

    if (data_type === 'jsonp') {
      this.jsonp(url_, url.callbackName, function (res) {
        when.ready.call(undefined, res);
      });
    } else {
      xhr.open('GET', url_, true);
      xhr.setRequestHeader('Accept','application/json');
      xhr.onload = onload;
      xhr.onerror = onerror;
      xhr.send(null);
    }

    return {
      when: function (obj) {
        when.ready = obj.ready;
      }
    };
  },
  jsonp: function jsonp(url, key, callback) {
    // https://github.com/Fresheyeball/micro-jsonp/blob/master/src/jsonp.js
    var head = document.head,
        script = document.createElement('script'),
        // generate minimally unique name for callback function
        callbackName = 'f' + Math.round(Math.random() * Date.now());

    // set request url
    script.setAttribute('src',
        /*  add callback parameter to the url
            where key is the parameter key supplied
            and callbackName is the parameter value */
        (url + (url.indexOf('?') > 0 ? '&' : '?') + key + '=' + callbackName));

    /*  place jsonp callback on window,
        the script sent by the server should call this
        function as it was passed as a url parameter */
    window[callbackName] = function (json) {
      window[callbackName] = undefined;

      // clean up script tag created for request
      setTimeout(function () {
        head.removeChild(script);
      }, 0);

      // hand data back to the user
      callback(json);
    };

    // actually make the request
    head.appendChild(script);
  },
  now: function now() {
    // Polyfill for window.performance.now()
    // @license http://opensource.org/licenses/MIT
    // copyright Paul Irish 2015
    // https://gist.github.com/paulirish/5438650
    if ('performance' in window === false) {
      window.performance = {};
    }

    Date.now = (Date.now || function () {  // thanks IE8
      return new Date().getTime();
    });

    if ('now' in window.performance === false) {

      var nowOffset = Date.now();

      if (performance.timing && performance.timing.navigationStart) {
        nowOffset = performance.timing.navigationStart;
      }

      window.performance.now = function now() {
        return Date.now() - nowOffset;
      };
    }

    return window.performance.now();
  },
  flyTo: function flyTo(map, coord, duration, resolution) {
    resolution = resolution || 2.388657133911758;
    duration = duration || 500;
    var view = map.getView();
    view.animate({ duration: duration, resolution: resolution },
                 { duration: duration, center: coord });
  },
  randomId: function randomId(prefix) {
    var id = this.now().toString(36);
    return prefix ? prefix + id : id;
  },
  isNumeric: function isNumeric(str) {
    return /^\d+$/.test(str);
  },
  classRegex: function classRegex(classname) {
    return new RegExp(("(^|\\s+) " + classname + " (\\s+|$)"));
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to remove a class.
   */
  addClass: function addClass(element, classname, timeout) {
    var this$1 = this;

    if (Array.isArray(element)) {
      element.forEach(function (each) {
        this$1.addClass(each, classname);
      });
      return;
    }

    var array = (Array.isArray(classname))
        ? classname
        : classname.split(/\s+/);
    var i = array.length;

    while (i--) {
      if (!this$1.hasClass(element, array[i])) {
        this$1._addClass(element, array[i], timeout);
      }
    }
  },
  _addClass: function _addClass(el, klass, timeout) {
    var this$1 = this;

    // use native if available
    if (el.classList) {
      el.classList.add(klass);
    } else {
      el.className = (el.className + ' ' + klass).trim();
    }

    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(function () {
        this$1._removeClass(el, klass);
      }, timeout);
    }
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to add a class.
   */
  removeClass: function removeClass(element, classname, timeout) {
    var this$1 = this;

    if (Array.isArray(element)) {
      element.forEach(function (each) {
        this$1.removeClass(each, classname, timeout);
      });
      return;
    }

    var array = (Array.isArray(classname))
        ? classname
        : classname.split(/\s+/);
    var i = array.length;

    while (i--) {
      if (this$1.hasClass(element, array[i])) {
        this$1._removeClass(element, array[i], timeout);
      }
    }
  },
  _removeClass: function _removeClass(el, klass, timeout) {
    var this$1 = this;

    if (el.classList) {
      el.classList.remove(klass);
    } else {
      el.className = (el.className.replace(this.classRegex(klass), ' ')).trim();
    }
    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(function () {
        this$1._addClass(el, klass);
      }, timeout);
    }
  },
  /**
   * @param {Element} element DOM node.
   * @param {String} classname Classname.
   * @return {Boolean}
   */
  hasClass: function hasClass(element, c) {
    // use native if available
    return element.classList
        ? element.classList.contains(c)
        : this.classRegex(c).test(element.className);
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String} classname Classe.
   */
  toggleClass: function toggleClass(element, classname) {
    var this$1 = this;

    if (Array.isArray(element)) {
      element.forEach(function (each) {
        this$1.toggleClass(each, classname);
      });
      return;
    }

    // use native if available
    if (element.classList) {
      element.classList.toggle(classname);
    } else {
      if (this.hasClass(element, classname)) {
        this._removeClass(element, classname);
      } else {
        this._addClass(element, classname);
      }
    }
  },
  /**
   * Abstraction to querySelectorAll for increased
   * performance and greater usability
   * @param {String} selector
   * @param {Element} context (optional)
   * @param {Boolean} find_all (optional)
   * @return (find_all) {Element} : {Array}
   */
  find: function find(selector, context, find_all) {
    if ( context === void 0 ) context = window.document;

    var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
        periodRe = /\./g,
        slice = Array.prototype.slice,
        matches = [];

    // Redirect call to the more performant function
    // if it's a simple selector and return an array
    // for easier usage
    if (simpleRe.test(selector)) {
      switch (selector[0]) {
        case '#':
          matches = [this.$(selector.substr(1))];
          break;
        case '.':
          matches = slice.call(context.getElementsByClassName(
              selector.substr(1).replace(periodRe, ' ')));
          break;
        default:
          matches = slice.call(context.getElementsByTagName(selector));
      }
    } else {
      // If not a simple selector, query the DOM as usual
      // and return an array for easier usage
      matches = slice.call(context.querySelectorAll(selector));
    }

    return (find_all) ? matches : matches[0];
  },
  $: function $(id) {
    id = (id[0] === '#') ? id.substr(1, id.length) : id;
    return document.getElementById(id);
  },
  isElement: function isElement(obj) {
    // DOM, Level2
    if ('HTMLElement' in window) {
      return (!!obj && obj instanceof HTMLElement);
    }
    // Older browsers
    return (!!obj && typeof obj === 'object' && obj.nodeType === 1 &&
        !!obj.nodeName);
  },
  getAllChildren: function getAllChildren(node, tag) {
    return [].slice.call(node.getElementsByTagName(tag));
  },
  isEmpty: function isEmpty(str) {
    return (!str || 0 === str.length);
  },
  emptyArray: function emptyArray(array) {
    while (array.length) { array.pop(); }
  },
  anyMatchInArray: function anyMatchInArray(source, target) {
    return source.some(function (each) { return target.indexOf(each) >= 0; });
  },
  everyMatchInArray: function everyMatchInArray(arr1, arr2) {
    return arr2.every(function (each) { return arr1.indexOf(each) >= 0; });
  },
  anyItemHasValue: function anyItemHasValue(obj, has) {
    var this$1 = this;
    if ( has === void 0 ) has = false;

    var keys = Object.keys(obj);
    keys.forEach(function (key) {
      if (!this$1.isEmpty(obj[key])) { has = true; }
    });
    return has;
  },
  removeAllChildren: function removeAllChildren(node) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
  },
  removeAll: function removeAll(collection) {
    var node;
    while ((node = collection[0])) { node.parentNode.removeChild(node); }
  },
  getChildren: function getChildren(node, tag) {
    return [].filter.call(
      node.childNodes, function (el) { return tag
        ? el.nodeType === 1 && el.tagName.toLowerCase() === tag
        : el.nodeType === 1; }
    );
  },
  template: function template(html, row) {
    var this$1 = this;

    return html.replace(/\{ *([\w_-]+) *\}/g, function (htm, key) {
      var value = (row[key] === undefined) ? '' : row[key];
      return this$1.htmlEscape(value);
    });
  },
  htmlEscape: function htmlEscape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  /**
    * Overwrites obj1's values with obj2's and adds
    * obj2's if non existent in obj1
    * @returns obj3 a new object based on obj1 and obj2
    */
  mergeOptions: function mergeOptions(obj1, obj2) {
    var obj3 = {};
    for (var attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (var attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
  },
  createElement: function createElement(node, html) {
    var elem;
    if (Array.isArray(node)) {
      elem = document.createElement(node[0]);

      if (node[1].id) { elem.id = node[1].id; }
      if (node[1].classname) { elem.className = node[1].classname; }

      if (node[1].attr) {
        var attr = node[1].attr;
        if (Array.isArray(attr)) {
          var i = -1;
          while (++i < attr.length) {
            elem.setAttribute(attr[i].name, attr[i].value);
          }
        } else {
          elem.setAttribute(attr.name, attr.value);
        }
      }
    } else {
      elem = document.createElement(node);
    }
    elem.innerHTML = html;
    var frag = document.createDocumentFragment();

    while (elem.childNodes[0]) { frag.appendChild(elem.childNodes[0]); }
    elem.appendChild(frag);
    return elem;
  },
  assert: function assert(condition, message) {
    if ( message === void 0 ) message = 'Assertion failed';

    if (!condition) {
      if (typeof Error !== 'undefined') { throw new Error(message); }
      throw message; // Fallback
    }
  }
};

var klasses = vars.cssClasses;

/**
 * @class Html
 */
var Html = function Html(base) {
  this.options = base.options;
  this.els = this.createControl();
};

Html.prototype.createControl = function createControl () {
  var container, containerClass, elements;

  if (this.options.targetType === targetType.INPUT) {
    containerClass = klasses.namespace + ' ' + klasses.inputText.container;
    container = utils.createElement(
      ['div', { classname: containerClass }], Html.input);
    elements = {
      container: container,
      control: utils.find('.' + klasses.inputText.control, container),
      input: utils.find('.' + klasses.inputText.input, container),
      reset: utils.find('.' + klasses.inputText.reset, container),
      result: utils.find('.' + klasses.inputText.result, container)
    };
  } else {
    containerClass = klasses.namespace + ' ' + klasses.glass.container;
    container = utils.createElement(
      ['div', { classname: containerClass }], Html.glass);
    elements = {
      container: container,
      control: utils.find('.' + klasses.glass.control, container),
      button: utils.find('.' + klasses.glass.button, container),
      input: utils.find('.' + klasses.glass.input, container),
      reset: utils.find('.' + klasses.glass.reset, container),
      result: utils.find('.' + klasses.glass.result, container)
    };
  }
  //set placeholder from options
  elements.input.placeholder = this.options.placeholder;
  return elements;
};

/* eslint-disable indent */
Html.glass = [
  '<div class="', klasses.glass.control, ' ', klasses.olControl, '">',
    '<button type="button" class="', klasses.glass.button, '"></button>',
    '<input type="text"',
      ' id="', vars.inputQueryId, '"',
      ' class="', klasses.glass.input, '"',
      ' autocomplete="off" placeholder="Search ...">',
    '<a',
      ' id="', vars.inputResetId, '"',
      ' class="', klasses.glass.reset, ' ', klasses.hidden, '"',
    '></a>',
  '</div>',
  '<ul class="', klasses.glass.result, '"></ul>'
].join('');

Html.input = [
  '<div class="', klasses.inputText.control, '">',
    '<input type="text"',
      ' id="', vars.inputQueryId, '"',
      ' class="', klasses.inputText.input, '"',
      ' autocomplete="off" placeholder="Search ...">',
    '<span class="', klasses.inputText.icon, '"></span>',
    '<button type="button"',
      ' id="', vars.inputResetId, '"',
      ' class="', klasses.inputText.reset, ' ', klasses.hidden, '"',
    '></button>',
  '</div>',
  '<ul class="', klasses.inputText.result, '"></ul>'
].join('');
/* eslint-enable indent */

/**
 * @class Photon
 */
var Photon = function Photon() {

  this.settings = {
    url: '//photon.komoot.de/api/',
    params: {
      q: '',
      limit: 10,
      lang: 'en'
    },
    langs: ['de', 'it', 'fr', 'en']
  };
};

Photon.prototype.getParameters = function getParameters (options) {
  options.lang = options.lang.toLowerCase();

  return {
    url: this.settings.url,
    params: {
      q: options.query,
      limit: options.limit || this.settings.params.limit,
      lang: this.settings.langs.indexOf(options.lang) > -1 ?
        options.lang : this.settings.params.lang
    }
  };
};

Photon.prototype.handleResponse = function handleResponse (results) {
  return results.map(function (result) { return ({
    lon: result.geometry.coordinates[0],
    lat: result.geometry.coordinates[1],
    address: {
      name: result.properties.name,
      postcode: result.properties.postcode,
      city: result.properties.city,
      state: result.properties.state,
      country: result.properties.country
    },
    original: {
      formatted: result.properties.name,
      details: result.properties
    }
  }); });
};

/**
 * @class OpenStreet
 */
var OpenStreet = function OpenStreet() {

  this.settings = {
    url: '//nominatim.openstreetmap.org/search/',
    params: {
      q: '',
      format: 'json',
      addressdetails: 1,
      limit: 10,
      countrycodes: '',
      'accept-language': 'en-US'
    }
  };
};

OpenStreet.prototype.getParameters = function getParameters (options) {
  return {
    url: this.settings.url,
    params: {
      q: options.query,
      format: 'json',
      addressdetails: 1,
      limit: options.limit || this.settings.params.limit,
      countrycodes: options.countrycodes || this.settings.params.countrycodes,
      'accept-language':
          options.lang || this.settings.params['accept-language']
    }
  };
};

OpenStreet.prototype.handleResponse = function handleResponse (results) {
  return results.map(function (result) { return ({
    lon: result.lon,
    lat: result.lat,
    address: {
      name: result.address.neighbourhood || '',
      road: result.address.road || '',
      postcode: result.address.postcode,
      city: result.address.city || result.address.town,
      state: result.address.state,
      country: result.address.country
    },
    original: {
      formatted: result.display_name,
      details: result.address
    }
  }); });
};

/**
 * @class MapQuest
 */
var MapQuest = function MapQuest() {

  this.settings = {
    url: '//open.mapquestapi.com/nominatim/v1/search.php',
    params: {
      q: '',
      key: '',
      format: 'json',
      addressdetails: 1,
      limit: 10,
      countrycodes: '',
      'accept-language': 'en-US'
    }
  };
};

MapQuest.prototype.getParameters = function getParameters (options) {
  return {
    url: this.settings.url,
    params: {
      q: options.query,
      key: options.key,
      format: 'json',
      addressdetails: 1,
      limit: options.limit || this.settings.params.limit,
      countrycodes: options.countrycodes || this.settings.params.countrycodes,
      'accept-language':
          options.lang || this.settings.params['accept-language']
    }
  };
};

MapQuest.prototype.handleResponse = function handleResponse (results) {
  return results.map(function (result) { return ({
    lon: result.lon,
    lat: result.lat,
    address: {
      name: result.address.neighbourhood || '',
      road: result.address.road || '',
      postcode: result.address.postcode,
      city: result.address.city || result.address.town,
      state: result.address.state,
      country: result.address.country
    },
    original: {
      formatted: result.display_name,
      details: result.address
    }
  }); });
};

/**
 * @class Pelias
 */
var Pelias = function Pelias() {

  this.settings = {
    url: '//search.mapzen.com/v1/search',
    params: {
      text: '',
      key: '',
      size: 10
    }
  };
};

Pelias.prototype.getParameters = function getParameters (options) {
  return {
    url: this.settings.url,
    params: {
      text: options.query,
      key: options.key,
      size: options.limit || this.settings.params.size
    }
  };
};

Pelias.prototype.handleResponse = function handleResponse (results) {
  return results.map(function (result) { return ({
    lon: result.geometry.coordinates[0],
    lat: result.geometry.coordinates[1],
    address: {
      name: result.properties.name,
      house_number: result.properties.housenumber,
      postcode: result.properties.postalcode,
      road: result.properties.street,
      city: result.properties.city,
      state: result.properties.region,
      country: result.properties.country
    },
    original: {
      formatted: result.properties.label,
      details: result.properties
    }
  }); });
};

/**
 * @class Google
 */
var Google = function Google() {

  this.settings = {
    url: '//maps.googleapis.com/maps/api/geocode/json',
    params: {
      address: '',
      key: '',
      language: 'en-US'
    }
  };
};

Google.prototype.getParameters = function getParameters (options) {
  return {
    url: this.settings.url,
    params: {
      address: options.query,
      key: options.key,
      language: options.lang || this.settings.params.language
    }
  };
};

Google.prototype.handleResponse = function handleResponse (results) {
  var name = [
        'point_of_interest',
        'establishment',
        'natural_feature',
        'airport'
      ],
      road = [
        'street_address',
        'route',
        'sublocality_level_5',
        'intersection'
      ],
      postcode = ['postal_code'],
      city = ['locality'],
      state = ['administrative_area_level_1'],
      country = ['country'];

  /*
   * @param {Array} details - address_components
   */
  var getDetails = function (details) {
    var parts = {
      name: '',
      road: '',
      postcode: '',
      city: '',
      state: '',
      country: ''
    };
    details.forEach(function (detail) {
      if (utils.anyMatchInArray(detail.types, name)) {
        parts.name = detail.long_name;
      } else if (utils.anyMatchInArray(detail.types, road)) {
        parts.road = detail.long_name;
      } else if (utils.anyMatchInArray(detail.types, postcode)) {
        parts.postcode = detail.long_name;
      } else if (utils.anyMatchInArray(detail.types, city)) {
        parts.city = detail.long_name;
      } else if (utils.anyMatchInArray(detail.types, state)) {
        parts.state = detail.long_name;
      } else if (utils.anyMatchInArray(detail.types, country)) {
        parts.country = detail.long_name;
      }
    });
    return parts;
  };

  var array = [];

  results.forEach(function (result) {
    var details = getDetails(result.address_components);
    if (utils.anyItemHasValue(details)) {
      array.push({
        lon: result.geometry.location.lng,
        lat: result.geometry.location.lat,
        address: {
          name: details.name,
          postcode: details.postcode,
          road: details.road,
          city: details.city,
          state: details.state,
          country: details.country
        },
        original: {
          formatted: result.formatted_address,
          details: result.address_components
        }
      });
    }
  });

  return array;
};

/**
 * @class Bing
 */
var Bing = function Bing() {
  this.settings = {
    url: '//dev.virtualearth.net/REST/v1/Locations',
    callbackName: 'jsonp',
    params: {
      query: '',
      key: '',
      includeNeighborhood: 0,
      maxResults: 10
    }
  };
};

Bing.prototype.getParameters = function getParameters (options) {
  return {
    url: this.settings.url,
    callbackName: this.settings.callbackName,
    params: {
      query: options.query,
      key: options.key,
      includeNeighborhood: options.includeNeighborhood ||
          this.settings.params.includeNeighborhood,
      maxResults: options.maxResults || this.settings.params.maxResults
    }
  };
};

Bing.prototype.handleResponse = function handleResponse (results) {
  return results.map(function (result) { return ({
    lon: result.point.coordinates[1],
    lat: result.point.coordinates[0],
    address: {
      name: result.name
    },
    original: {
      formatted: result.address.formattedAddress,
      details: result.address
    }
  }); });
};

var klasses$1 = vars.cssClasses;

/**
 * @class Nominatim
 */
var Nominatim = function Nominatim(base, els) {
  this.Base = base;

  this.layerName = utils.randomId('geocoder-layer-');
  this.layer = new ol.layer.Vector({
    name: this.layerName,
    source: new ol.source.Vector()
  });

  this.options = base.options;
  this.options.provider = this.options.provider.toLowerCase();

  this.els = els;
  this.lastQuery = '';
  this.container = this.els.container;
  this.registeredListeners = { mapClick: false };
  this.setListeners();

  // providers
  this.Photon = new Photon();
  this.OpenStreet = new OpenStreet();
  this.MapQuest = new MapQuest();
  this.Pelias = new Pelias();
  this.Google = new Google();
  this.Bing = new Bing();
};

Nominatim.prototype.setListeners = function setListeners () {
    var this$1 = this;

  var timeout, lastQuery;
  var openSearch = function () {
    utils.hasClass(this$1.els.control, klasses$1.glass.expanded) ?
        this$1.collapse() : this$1.expand();
  };
  var query = function (evt) {
    var value = evt.target.value.trim();
    var hit = evt.key ? evt.key === 'Enter' :
      evt.which ? evt.which === 13 :
        evt.keyCode ? evt.keyCode === 13 : false;

    if (hit) {
      evt.preventDefault();
      this$1.query(value);
    }
  };
  var reset = function (evt) {
    this$1.els.input.focus();
    this$1.els.input.value = '';
    this$1.lastQuery = '';
    utils.addClass(this$1.els.reset, klasses$1.hidden);
    this$1.clearResults();
  };
  var handleValue = function (evt) {
    var value = evt.target.value.trim();

    value.length
      ? utils.removeClass(this$1.els.reset, klasses$1.hidden)
      : utils.addClass(this$1.els.reset, klasses$1.hidden);

    if (this$1.options.autoComplete && value !== lastQuery) {
      lastQuery = value;
      timeout && clearTimeout(timeout);
      timeout = setTimeout(function () {
        if (value.length >= this$1.options.autoCompleteMinLength) {
          this$1.query(value);
        }
      }, 200);
    }
  };
  this.els.input.addEventListener('keyup', query, false);
  this.els.input.addEventListener('input', handleValue, false);
  this.els.reset.addEventListener('click', reset, false);
  if (this.options.targetType === targetType.GLASS) {
    this.els.button.addEventListener('click', openSearch, false);
  }
};

Nominatim.prototype.query = function query (q) {
    var this$1 = this;

  var ajax = {}, options = this.options;
  var provider = this.getProvider({
    query: q,
    provider: options.provider,
    key: options.key,
    lang: options.lang,
    countrycodes: options.countrycodes,
    limit: options.limit
  });
  if (this.lastQuery === q && this.els.result.firstChild) { return; }
  this.lastQuery = q;
  this.clearResults();
  utils.addClass(this.els.reset, klasses$1.spin);

  ajax.url = document.location.protocol + provider.url;
  ajax.data = provider.params;

  if (options.provider === providers.BING) {
    ajax.data_type = 'jsonp';
    ajax.callbackName = provider.callbackName;
  }

  utils.json(ajax).when({
    ready: function (res) {
      // eslint-disable-next-line no-console
      options.debug && console.info(res);
      utils.removeClass(this$1.els.reset, klasses$1.spin);
      //will be fullfiled according to provider
      var res_;
      switch (options.provider) {
        case providers.OSM:
          res_ = res.length ?
            this$1.OpenStreet.handleResponse(res) : undefined;
          break;
        case providers.MAPQUEST:
          res_ = res.length ?
            this$1.MapQuest.handleResponse(res) : undefined;
          break;
        case providers.PELIAS:
          res_ = res.features.length ?
            this$1.Pelias.handleResponse(res.features) : undefined;
          break;
        case providers.PHOTON:
          res_ = res.features.length ?
            this$1.Photon.handleResponse(res.features) : undefined;
          break;
        case providers.GOOGLE:
          res_ = res.results.length ?
            this$1.Google.handleResponse(res.results) : undefined;
          break;
        case providers.BING:
          res_ = res.resourceSets[0].resources.length
            ? this$1.Bing.handleResponse(res.resourceSets[0].resources)
            : undefined;
          break;
        default:
          // eslint-disable-next-line no-console
          console.log('Unknown provider!');
          break;
      }
      if (res_) {
        this$1.createList(res_);
        this$1.listenMapClick();
      }
    },
    error: function () {
      utils.removeClass(this$1.els.reset, klasses$1.spin);
      var li = utils.createElement(
        'li', '<h5>Error! No internet connection?</h5>');
      this$1.els.result.appendChild(li);
    }
  });
};

Nominatim.prototype.createList = function createList (response) {
    var this$1 = this;

  var ul = this.els.result;
  response.forEach(function (row) {
    var addressHtml = this$1.addressTemplate(row.address),
        html = ['<a href="#">', addressHtml, '</a>'].join(''),
        li = utils.createElement('li', html);
    li.addEventListener('click', function (evt) {
      evt.preventDefault();
      this$1.chosen(row, addressHtml, row.address, row.original);
    }, false);
    ul.appendChild(li);
  });
};

Nominatim.prototype.chosen = function chosen (place, addressHtml, addressObj, addressOriginal) {
  var map = this.Base.getMap();
  var coord_ = [parseFloat(place.lon), parseFloat(place.lat)];
  var projection = map.getView().getProjection();
  var coord = ol.proj.transform(coord_, 'EPSG:4326', projection);
  var address = {
    formatted: addressHtml,
    details: addressObj,
    original: addressOriginal
  };

  this.options.keepOpen === false && this.clearResults(true);

  if (this.options.preventDefault === true) {
    this.Base.dispatchEvent({
      type: eventType.ADDRESSCHOSEN,
      address: address,
      coordinate: coord
    });
  } else {
    utils.flyTo(map, coord);
    var feature = this.createFeature(coord, address);

    this.Base.dispatchEvent({
      type: eventType.ADDRESSCHOSEN,
      address: address,
      feature: feature,
      coordinate: coord
    });
  }
};

Nominatim.prototype.createFeature = function createFeature (coord) {
  var feature = new ol.Feature(new ol.geom.Point(coord));
  this.addLayer();
  feature.setStyle(this.options.featureStyle);
  feature.setId(utils.randomId('geocoder-ft-'));
  this.getSource().addFeature(feature);
  return feature;
};

Nominatim.prototype.addressTemplate = function addressTemplate (address) {
  var html = [];
  if (address.name) {
    html.push(['<span class="', klasses$1.road, '">{name}</span>'].join(''));
  }
  if (address.road || address.building || address.house_number) {
    html.push([
      '<span class="', klasses$1.road,
      '">{building} {road} {house_number}</span>'
    ].join(''));
  }
  if (address.city || address.town || address.village) {
    html.push([
      '<span class="', klasses$1.city,
      '">{postcode} {city} {town} {village}</span>'
    ].join(''));
  }
  if (address.state || address.country) {
    html.push([
      '<span class="', klasses$1.country, '">{state} {country}</span>'
    ].join(''));
  }
  return utils.template(html.join('<br>'), address);
};

Nominatim.prototype.getProvider = function getProvider (options) {
  var provider;
  /*eslint default-case: 0*/
  switch (options.provider) {
    case providers.OSM:
      provider = this.OpenStreet.getParameters(options);
      break;
    case providers.MAPQUEST:
      provider = this.MapQuest.getParameters(options);
      break;
    case providers.PHOTON:
      provider = this.Photon.getParameters(options);
      break;
    case providers.GOOGLE:
      provider = this.Google.getParameters(options);
      break;
    case providers.PELIAS:
      provider = this.Pelias.getParameters(options);
      break;
    case providers.BING:
      provider = this.Bing.getParameters(options);
      break;
  }
  return provider;
};

Nominatim.prototype.expand = function expand () {
    var this$1 = this;

  utils.removeClass(this.els.input, klasses$1.spin);
  utils.addClass(this.els.control, klasses$1.glass.expanded);
  window.setTimeout(function () { return this$1.els.input.focus(); }, 100);
  this.listenMapClick();
};

Nominatim.prototype.collapse = function collapse () {
  this.els.input.value = '';
  this.els.input.blur();
  utils.addClass(this.els.reset, klasses$1.hidden);
  utils.removeClass(this.els.control, klasses$1.glass.expanded);
  this.clearResults();
};

Nominatim.prototype.listenMapClick = function listenMapClick () {
  // already registered
  if (this.registeredListeners.mapClick) { return; }

  var this_ = this;
  var mapElement = this.Base.getMap().getTargetElement();
  this.registeredListeners.mapClick = true;

  //one-time fire click
  mapElement.addEventListener('click', {
    handleEvent: function (evt) {
      this_.clearResults(true);
      mapElement.removeEventListener(evt.type, this, false);
      this_.registeredListeners.mapClick = false;
    }
  }, false);
};

Nominatim.prototype.clearResults = function clearResults (collapse) {
  collapse && this.options.targetType === targetType.GLASS ?
    this.collapse() : utils.removeAllChildren(this.els.result);
};

Nominatim.prototype.getSource = function getSource () {
  return this.layer.getSource();
};

Nominatim.prototype.addLayer = function addLayer () {
    var this$1 = this;

  var found = false;
  var map = this.Base.getMap();

  map.getLayers().forEach(function (layer) {
    if (layer === this$1.layer) { found = true; }
  });
  if (!found) { map.addLayer(this.layer); }
};

/**
 * @class Base
 * @extends {ol.control.Control}
 */
var Base = (function (superclass) {
  function Base(type, options) {
    if ( type === void 0 ) type = controlType.NOMINATIM;
    if ( options === void 0 ) options = {};


    if (!(this instanceof Base)) { return new Base(); }

    utils.assert(typeof type === 'string', '@param `type` should be string!');
    utils.assert(type === controlType.NOMINATIM || type === controlType.REVERSE,
        ("@param 'type' should be '" + (controlType.NOMINATIM) + "' or \n        '" + (controlType.REVERSE) + "'!"));
    utils.assert(typeof options === 'object',
        '@param `options` should be object!');

    this.options = utils.mergeOptions(defaultOptions, options);
    this.container = undefined;

    var $nominatim;
    var $html = new Html(this);

    if (type === controlType.NOMINATIM) {
      this.container = $html.els.container;
      $nominatim = new Nominatim(this, $html.els);
      this.layer = $nominatim.layer;
    } else if (type === controlType.REVERSE) {
      // TODO
    }

    superclass.call(this, { element: this.container });
  }

  if ( superclass ) Base.__proto__ = superclass;
  Base.prototype = Object.create( superclass && superclass.prototype );
  Base.prototype.constructor = Base;

  /**
   * @return {ol.layer.Vector} Returns the layer created by this control
   */
  Base.prototype.getLayer = function getLayer () {
    return this.layer;
  };

  /**
   * @return {ol.source.Vector} Returns the source created by this control
   */
  Base.prototype.getSource = function getSource () {
    return this.getLayer().getSource();
  };

  return Base;
}(ol.control.Control));

return Base;

})));
