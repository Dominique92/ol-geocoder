/*!
 * ol-geocoder - v3.1.0
 * A geocoder extension for OpenLayers.
 * https://github.com/jonataswalker/ol-geocoder
 * Built: Fri Apr 06 2018 09:18:51 GMT-0300 (-03)
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('ol/layer/vector'), require('ol/source/vector'), require('ol/geom/point'), require('ol/feature'), require('ol/proj'), require('ol/control/control'), require('ol/style/style'), require('ol/style/icon')) :
  typeof define === 'function' && define.amd ? define(['ol/layer/vector', 'ol/source/vector', 'ol/geom/point', 'ol/feature', 'ol/proj', 'ol/control/control', 'ol/style/style', 'ol/style/icon'], factory) :
  (global.Geocoder = factory(global.ol.layer.Vector,global.ol.source.Vector,global.ol.geom.Point,global.ol.Feature,global.ol.proj,global.ol.control.Control,global.ol.style.Style,global.ol.style.Icon));
}(this, (function (LayerVector,SourceVector,Point,Feature,proj,Control,Style,Icon) { 'use strict';

  LayerVector = LayerVector && LayerVector.hasOwnProperty('default') ? LayerVector['default'] : LayerVector;
  SourceVector = SourceVector && SourceVector.hasOwnProperty('default') ? SourceVector['default'] : SourceVector;
  Point = Point && Point.hasOwnProperty('default') ? Point['default'] : Point;
  Feature = Feature && Feature.hasOwnProperty('default') ? Feature['default'] : Feature;
  proj = proj && proj.hasOwnProperty('default') ? proj['default'] : proj;
  Control = Control && Control.hasOwnProperty('default') ? Control['default'] : Control;
  Style = Style && Style.hasOwnProperty('default') ? Style['default'] : Style;
  Icon = Icon && Icon.hasOwnProperty('default') ? Icon['default'] : Icon;

  var containerId = "gcd-container";
  var buttonControlId = "gcd-button-control";
  var inputQueryId = "gcd-input-query";
  var inputResetId = "gcd-input-reset";
  var cssClasses = {"namespace":"ol-geocoder","spin":"gcd-pseudo-rotate","hidden":"gcd-hidden","address":"gcd-address","country":"gcd-country","city":"gcd-city","road":"gcd-road","olControl":"ol-control","glass":{"container":"gcd-gl-container","control":"gcd-gl-control","button":"gcd-gl-btn","input":"gcd-gl-input","expanded":"gcd-gl-expanded","reset":"gcd-gl-reset","result":"gcd-gl-result"},"inputText":{"container":"gcd-txt-container","control":"gcd-txt-control","input":"gcd-txt-input","reset":"gcd-txt-reset","icon":"gcd-txt-glass","result":"gcd-txt-result"}};
  var vars = {
  	containerId: containerId,
  	buttonControlId: buttonControlId,
  	inputQueryId: inputQueryId,
  	inputResetId: inputResetId,
  	cssClasses: cssClasses
  };

  var _VARS_ = /*#__PURE__*/Object.freeze({
    containerId: containerId,
    buttonControlId: buttonControlId,
    inputQueryId: inputQueryId,
    inputResetId: inputResetId,
    cssClasses: cssClasses,
    default: vars
  });

  const VARS = _VARS_;

  const EVENT_TYPE = {
    ADDRESSCHOSEN: 'addresschosen'
  };

  const CONTROL_TYPE = {
    NOMINATIM: 'nominatim',
    REVERSE: 'reverse'
  };

  const TARGET_TYPE = {
    GLASS: 'glass-button',
    INPUT: 'text-input'
  };


  const FEATURE_SRC =
    '//cdn.rawgit.com/jonataswalker/map-utils/master/images/marker.png';

  const PROVIDERS = {
    OSM: 'osm',
    MAPQUEST: 'mapquest',
    GOOGLE: 'google',
    PHOTON: 'photon',
    BING: 'bing',
    OPENCAGE: 'opencage',
    PELIAS: 'pelias'
  };

  const DEFAULT_OPTIONS = {
    provider: PROVIDERS.OSM,
    placeholder: 'Search for an address',
    featureStyle: null,
    targetType: TARGET_TYPE.GLASS,
    lang: 'en-US',
    limit: 5,
    keepOpen: false,
    preventDefault: false,
    autoComplete: false,
    autoCompleteMinLength: 2,
    debug: false
  };

  /**
    * Overwrites obj1's values with obj2's and adds
    * obj2's if non existent in obj1
    * @returns obj3 a new object based on obj1 and obj2
    */
  function mergeOptions(obj1, obj2) {
    let obj3 = {};
    for (let attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (let attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
  }

  function assert(condition, message) {
    if ( message === void 0 ) message = 'Assertion failed';

    if (!condition) {
      if (typeof Error !== 'undefined') { throw new Error(message); }
      throw message; // Fallback
    }
  }

  function now() {
    // Polyfill for window.performance.now()
    // @license http://opensource.org/licenses/MIT
    // copyright Paul Irish 2015
    // https://gist.github.com/paulirish/5438650
    if ('performance' in window === false) {
      window.performance = {};
    }

    Date.now = (Date.now || function () { // thanks IE8
      return new Date().getTime();
    });

    if ('now' in window.performance === false) {

      let nowOffset = Date.now();

      if (performance.timing && performance.timing.navigationStart) {
        nowOffset = performance.timing.navigationStart;
      }

      window.performance.now = function () { return Date.now() - nowOffset; };
    }

    return window.performance.now();
  }

  function flyTo(map, coord, duration, resolution) {
    resolution = resolution || 2.388657133911758;
    duration = duration || 500;
    map.getView().animate(
      { duration: duration, resolution: resolution },
      { duration: duration, center: coord }
    );
  }

  function randomId(prefix) {
    const id = now().toString(36);
    return prefix ? prefix + id : id;
  }

  function isNumeric(str) {
    return /^\d+$/.test(str);
  }

  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to remove a class.
   */
  function addClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach(function (each) { return addClass(each, classname); });
      return;
    }

    const array = (Array.isArray(classname))
      ? classname
      : classname.split(/\s+/);
    let i = array.length;

    while (i--) {
      if (!hasClass(element, array[i])) {
        _addClass(element, array[i], timeout);
      }
    }
  }

  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to add a class.
   */
  function removeClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach(function (each) { return removeClass(each, classname, timeout); });
      return;
    }

    const array = (Array.isArray(classname))
      ? classname
      : classname.split(/\s+/);
    let i = array.length;

    while (i--) {
      if (hasClass(element, array[i])) {
        _removeClass(element, array[i], timeout);
      }
    }
  }


  /**
   * @param {Element} element DOM node.
   * @param {String} classname Classname.
   * @return {Boolean}
   */
  function hasClass(element, c) {
    // use native if available
    return element.classList
      ? element.classList.contains(c)
      : classRegex(c).test(element.className);
  }

  /**
   * Abstraction to querySelectorAll for increased
   * performance and greater usability
   * @param {String} selector
   * @param {Element} context (optional)
   * @param {Boolean} find_all (optional)
   * @return (find_all) {Element} : {Array}
   */
  function find(selector, context, find_all) {
    if ( context === void 0 ) context = window.document;

    let simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
        periodRe = /\./g,
        slice = Array.prototype.slice,
        matches = [];

    // Redirect call to the more performant function
    // if it's a simple selector and return an array
    // for easier usage
    if (simpleRe.test(selector)) {
      switch (selector[0]) {
        case '#':
          matches = [$(selector.substr(1))];
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
  }

  function $(id) {
    id = (id[0] === '#') ? id.substr(1, id.length) : id;
    return document.getElementById(id);
  }

  function removeAllChildren(node) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
  }

  function template(html, row) {
    return html.replace(/\{ *([\w_-]+) *\}/g, function (htm, key) {
      let value = (row[key] === undefined) ? '' : row[key];
      return htmlEscape(value);
    });
  }

  function htmlEscape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function createElement(node, html) {
    let elem;
    if (Array.isArray(node)) {
      elem = document.createElement(node[0]);

      if (node[1].id) { elem.id = node[1].id; }
      if (node[1].classname) { elem.className = node[1].classname; }

      if (node[1].attr) {
        let attr = node[1].attr;
        if (Array.isArray(attr)) {
          let i = -1;
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
    let frag = document.createDocumentFragment();

    while (elem.childNodes[0]) { frag.appendChild(elem.childNodes[0]); }
    elem.appendChild(frag);
    return elem;
  }

  function classRegex(classname) {
    return new RegExp(("(^|\\s+) " + classname + " (\\s+|$)"));
  }

  function _addClass(el, klass, timeout) {
    // use native if available
    if (el.classList) {
      el.classList.add(klass);
    } else {
      el.className = (el.className + ' ' + klass).trim();
    }

    if (timeout && isNumeric(timeout)) {
      window.setTimeout(function () { return _removeClass(el, klass); }, timeout);
    }
  }

  function _removeClass(el, klass, timeout) {
    if (el.classList) {
      el.classList.remove(klass);
    } else {
      el.className = (el.className.replace(classRegex(klass), ' ')).trim();
    }
    if (timeout && isNumeric(timeout)) {
      window.setTimeout(function () { return _addClass(el, klass); }, timeout);
    }
  }

  const klasses = VARS.cssClasses;

  /**
   * @class Html
   */
  var Html = function Html(base) {
    this.options = base.options;
    this.els = this.createControl();
  };

  Html.prototype.createControl = function createControl () {
    let container, containerClass, elements;

    if (this.options.targetType === TARGET_TYPE.INPUT) {
      containerClass = klasses.namespace + ' ' + klasses.inputText.container;
      container = createElement(
        ['div', { id: VARS.containerId, classname: containerClass }],
        Html.input
      );
      elements = {
        container: container,
        control: find('.' + klasses.inputText.control, container),
        input: find('.' + klasses.inputText.input, container),
        reset: find('.' + klasses.inputText.reset, container),
        result: find('.' + klasses.inputText.result, container)
      };
    } else {
      containerClass = (klasses.namespace) + " " + (klasses.glass.container);
      container = createElement(
        ['div', { id: VARS.containerId, classname: containerClass }],
        Html.glass
      );
      elements = {
        container: container,
        control: find('.' + klasses.glass.control, container),
        button: find('.' + klasses.glass.button, container),
        input: find('.' + klasses.glass.input, container),
        reset: find('.' + klasses.glass.reset, container),
        result: find('.' + klasses.glass.result, container)
      };
    }
    //set placeholder from options
    elements.input.placeholder = this.options.placeholder;
    return elements;
  };

  /* eslint-disable indent */
  Html.glass = [
    '<div class="', klasses.glass.control, ' ', klasses.olControl, '">',
      '<button type="button"',
        ' id="', VARS.buttonControlId, '"',
        ' class="', klasses.glass.button, '"></button>',
      '<input type="text"',
        ' id="', VARS.inputQueryId, '"',
        ' class="', klasses.glass.input, '"',
        ' autocomplete="off" placeholder="Search ...">',
      '<a',
        ' id="', VARS.inputResetId, '"',
        ' class="', klasses.glass.reset, ' ', klasses.hidden, '"',
      '></a>',
    '</div>',
    '<ul class="', klasses.glass.result, '"></ul>'
  ].join('');

  Html.input = [
    '<div class="', klasses.inputText.control, '">',
      '<input type="text"',
        ' id="', VARS.inputQueryId, '"',
        ' class="', klasses.inputText.input, '"',
        ' autocomplete="off" placeholder="Search ...">',
      '<span class="', klasses.inputText.icon, '"></span>',
      '<button type="button"',
        ' id="', VARS.inputResetId, '"',
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
      url: 'https://photon.komoot.de/api/',
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
      url: 'https://nominatim.openstreetmap.org/search/',
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

  OpenStreet.prototype.getParameters = function getParameters (opt) {
    return {
      url: this.settings.url,
      params: {
        q: opt.query,
        format: this.settings.params.format,
        addressdetails: this.settings.params.addressdetails,
        limit: opt.limit || this.settings.params.limit,
        countrycodes: opt.countrycodes || this.settings.params.countrycodes,
        'accept-language': opt.lang || this.settings.params['accept-language']
      }
    };
  };

  OpenStreet.prototype.handleResponse = function handleResponse (results) {
    return results.map(function (result) { return ({
      lon: result.lon,
      lat: result.lat,
      address: {
        name: result.display_name,
        road: result.address.road || '',
        houseNumber: result.address.house_number || '',
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
      url: 'http://open.mapquestapi.com/nominatim/v1/search.php',
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
      url: 'http://search.mapzen.com/v1/search',
      params: {
        size: 10
      }
    };
  };

  Pelias.prototype.getParameters = function getParameters (options) {
    return {
      url: this.settings.url,
      params: {
        text: options.query,
        api_key: options.key,
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
   * @class Bing
   */
  var Bing = function Bing() {
    this.settings = {
      url: 'https://dev.virtualearth.net/REST/v1/Locations',
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

  /**
   * @class OpenCage
   */
  var OpenCage = function OpenCage() {

    this.settings = {
      url: 'https://api.opencagedata.com/geocode/v1/json?',
      params: {
        q: '',
        key: '',
        limit: 10,
        countrycode: '',
        pretty: 1,
        no_annotations: 1
      }
    };
  };

  OpenCage.prototype.getParameters = function getParameters (options) {
    return {
      url: this.settings.url,
      params: {
        q: options.query,
        key: options.key,
        limit: options.limit || this.settings.params.limit,
        countrycode: options.countrycodes || this.settings.params.countrycodes
      }
    };
  };

  OpenCage.prototype.handleResponse = function handleResponse (results) {
    return results.map(function (result) { return ({
      lon: result.geometry.lng,
      lat: result.geometry.lat,
      address: {
        name: result.components.house_number || '',
        road: result.components.road || '',
        postcode: result.components.postcode,
        city: result.components.city || result.components.town,
        state: result.components.state,
        country: result.components.country
      },
      original: {
        formatted: result.formatted,
        details: result.components
      }
    }); });
  };

  function json(obj) {
    return new Promise(function (resolve, reject) {
      const url = encodeUrlXhr(obj.url, obj.data);
      const config = {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
      };

      if (obj.jsonp) {
        jsonp(url, obj.callbackName, resolve);
      } else {
        fetch(url, config)
          .then(function (r) { return r.json(); })
          .then(resolve)
          .catch(reject);
      }

    });
  }


  function toQueryString(obj) {
    return Object.keys(obj).reduce(function (a, k) {
      a.push(
        typeof obj[k] === 'object'
          ? toQueryString(obj[k])
          : ((encodeURIComponent(k)) + "=" + (encodeURIComponent(obj[k])))
      );
      return a;
    }, []).join('&');
  }

  function encodeUrlXhr(url, data) {
    if (data && typeof data === 'object') {
      url += (/\?/.test(url) ? '&' : '?') + toQueryString(data);
    }
    return url;
  }

  function jsonp(url, key, callback) {
    // https://github.com/Fresheyeball/micro-jsonp/blob/master/src/jsonp.js
    let head = document.head,
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
    window[callbackName] = function (data) {
      window[callbackName] = undefined;

      // clean up script tag created for request
      setTimeout(function () { return head.removeChild(script); }, 0);

      // hand data back to the user
      callback(data);
    };

    // actually make the request
    head.appendChild(script);
  }

  const klasses$1 = VARS.cssClasses;

  /**
   * @class Nominatim
   */
  var Nominatim = function Nominatim(base, els) {
    this.Base = base;

    this.layerName = randomId('geocoder-layer-');
    this.layer = new LayerVector({
      name: this.layerName,
      source: new SourceVector()
    });

    this.options = base.options;
    // provider is either the name of a built-in provider as a string or an
    // object that implements the provider API
    this.options.provider = (typeof this.options.provider === 'string')
      ? this.options.provider.toLowerCase()
      : this.options.provider;

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
    this.Bing = new Bing();
    this.OpenCage = new OpenCage();
  };

  Nominatim.prototype.setListeners = function setListeners () {
      var this$1 = this;

    let timeout, lastQuery;
    const openSearch = function () {
      hasClass(this$1.els.control, klasses$1.glass.expanded) ?
        this$1.collapse() : this$1.expand();
    };
    const query = function (evt) {
      const value = evt.target.value.trim();
      const hit = evt.key ? evt.key === 'Enter' :
        evt.which ? evt.which === 13 :
          evt.keyCode ? evt.keyCode === 13 : false;

      if (hit) {
        evt.preventDefault();
        this$1.query(value);
      }
    };
    const reset = function (evt) {
      this$1.els.input.focus();
      this$1.els.input.value = '';
      this$1.lastQuery = '';
      addClass(this$1.els.reset, klasses$1.hidden);
      this$1.clearResults();
    };
    const handleValue = function (evt) {
      const value = evt.target.value.trim();

      value.length
        ? removeClass(this$1.els.reset, klasses$1.hidden)
        : addClass(this$1.els.reset, klasses$1.hidden);

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
    this.els.input.addEventListener('keypress', query, false);
    this.els.input.addEventListener('input', handleValue, false);
    this.els.reset.addEventListener('click', reset, false);
    if (this.options.targetType === TARGET_TYPE.GLASS) {
      this.els.button.addEventListener('click', openSearch, false);
    }
  };

  Nominatim.prototype.query = function query (q) {
      var this$1 = this;

    const provider = this.getProvider({
      query: q,
      provider: this.options.provider,
      key: this.options.key,
      lang: this.options.lang,
      countrycodes: this.options.countrycodes,
      limit: this.options.limit
    });

    if (this.lastQuery === q && this.els.result.firstChild) { return; }

    this.lastQuery = q;
    this.clearResults();
    addClass(this.els.reset, klasses$1.spin);

    let ajax = {
      url: provider.url,
      data: provider.params,
    };

    if (provider.callbackName) {
      ajax.jsonp = true;
      ajax.callbackName = provider.callbackName;
    }

    json(ajax).then(function (res) {
      // eslint-disable-next-line no-console
      this$1.options.debug && console.info(res);

      removeClass(this$1.els.reset, klasses$1.spin);

      //will be fullfiled according to provider
      let res_;
      switch (this$1.options.provider) {
        case PROVIDERS.OSM:
          res_ = res.length ?
            this$1.OpenStreet.handleResponse(res) : undefined;
          break;
        case PROVIDERS.MAPQUEST:
          res_ = res.length ?
            this$1.MapQuest.handleResponse(res) : undefined;
          break;
        case PROVIDERS.PELIAS:
          res_ = res.features.length ?
            this$1.Pelias.handleResponse(res.features) : undefined;
          break;
        case PROVIDERS.PHOTON:
          res_ = res.features.length ?
            this$1.Photon.handleResponse(res.features) : undefined;
          break;
        case PROVIDERS.BING:
          res_ = res.resourceSets[0].resources.length
            ? this$1.Bing.handleResponse(res.resourceSets[0].resources)
            : undefined;
          break;
        case PROVIDERS.OPENCAGE:
          res_ = res.results.length ?
            this$1.OpenCage.handleResponse(res.results) : undefined;
          break;
        default:
          res_ = this$1.options.provider.handleResponse(res);
          break;
      }
      if (res_) {
        this$1.createList(res_);
        this$1.listenMapClick();
      }
    }).catch(function (err) {
      removeClass(this$1.els.reset, klasses$1.spin);
      const li = createElement(
        'li', '<h5>Error! No internet connection?</h5>');
      this$1.els.result.appendChild(li);
    });
  };

  Nominatim.prototype.createList = function createList (response) {
      var this$1 = this;

    const ul = this.els.result;

    response.forEach(function (row) {
      let addressHtml;

      switch (this$1.options.provider) {
        case PROVIDERS.OSM:
          addressHtml =
            "<span class=\"" + (klasses$1.road) + "\">" + (row.address.name) + "</span>";
          break;
        default:
          addressHtml = this$1.addressTemplate(row.address);
      }

      const html = "<a href=\"#\">" + addressHtml + "</a>";
      const li = createElement('li', html);

      li.addEventListener('click', function (evt) {
        evt.preventDefault();
        this$1.chosen(row, addressHtml, row.address, row.original);
      }, false);

      ul.appendChild(li);
    });
  };

  Nominatim.prototype.chosen = function chosen (place, addressHtml, addressObj, addressOriginal) {
    const map = this.Base.getMap();
    const coord_ = [parseFloat(place.lon), parseFloat(place.lat)];
    const projection = map.getView().getProjection();
    const coord = proj.transform(coord_, 'EPSG:4326', projection);
    let bbox = place.bbox;

    if (bbox) {
      bbox = proj.transformExtent(bbox, 'EPSG:4326', projection);
    }
    const address = {
      formatted: addressHtml,
      details: addressObj,
      original: addressOriginal
    };

    this.options.keepOpen === false && this.clearResults(true);

    if (this.options.preventDefault === true) {
      this.Base.dispatchEvent({
        type: EVENT_TYPE.ADDRESSCHOSEN,
        address: address,
        coordinate: coord,
        bbox: bbox
      });
    } else {
      if (bbox) {
        map.getView().fit(bbox, { duration: 500 });
      } else {
        flyTo(map, coord);
      }
      const feature = this.createFeature(coord, address);

      this.Base.dispatchEvent({
        type: EVENT_TYPE.ADDRESSCHOSEN,
        address: address,
        feature: feature,
        coordinate: coord,
        bbox: bbox
      });
    }
  };

  Nominatim.prototype.createFeature = function createFeature (coord) {
    const feature = new Feature(new Point(coord));
    this.addLayer();
    feature.setStyle(this.options.featureStyle);
    feature.setId(randomId('geocoder-ft-'));
    this.getSource().addFeature(feature);
    return feature;
  };

  Nominatim.prototype.addressTemplate = function addressTemplate (address) {
    let html = [];
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
    return template(html.join('<br>'), address);
  };

  Nominatim.prototype.getProvider = function getProvider (options) {
    let provider;
    /*eslint default-case: 0*/
    switch (options.provider) {
      case PROVIDERS.OSM:
        provider = this.OpenStreet.getParameters(options);
        break;
      case PROVIDERS.MAPQUEST:
        provider = this.MapQuest.getParameters(options);
        break;
      case PROVIDERS.PHOTON:
        provider = this.Photon.getParameters(options);
        break;
      case PROVIDERS.PELIAS:
        provider = this.Pelias.getParameters(options);
        break;
      case PROVIDERS.BING:
        provider = this.Bing.getParameters(options);
        break;
      case PROVIDERS.OPENCAGE:
        provider = this.OpenCage.getParameters(options);
        break;
      default:
        provider = options.provider.getParameters(options);
        break;
    }
    return provider;
  };

  Nominatim.prototype.expand = function expand () {
      var this$1 = this;

    removeClass(this.els.input, klasses$1.spin);
    addClass(this.els.control, klasses$1.glass.expanded);
    window.setTimeout(function () { return this$1.els.input.focus(); }, 100);
    this.listenMapClick();
  };

  Nominatim.prototype.collapse = function collapse () {
    this.els.input.value = '';
    this.els.input.blur();
    addClass(this.els.reset, klasses$1.hidden);
    removeClass(this.els.control, klasses$1.glass.expanded);
    this.clearResults();
  };

  Nominatim.prototype.listenMapClick = function listenMapClick () {
    // already registered
    if (this.registeredListeners.mapClick) { return; }

    const this_ = this;
    const mapElement = this.Base.getMap().getTargetElement();
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
    collapse && this.options.targetType === TARGET_TYPE.GLASS
      ? this.collapse()
      : removeAllChildren(this.els.result);
  };

  Nominatim.prototype.getSource = function getSource () {
    return this.layer.getSource();
  };

  Nominatim.prototype.addLayer = function addLayer () {
      var this$1 = this;

    let found = false;
    const map = this.Base.getMap();

    map.getLayers().forEach(function (layer) {
      if (layer === this$1.layer) { found = true; }
    });
    if (!found) { map.addLayer(this.layer); }
  };

  /**
   * @class Base
   * @extends {ol.control.Control}
   */
  var Base = (function (Control$$1) {
    function Base(type, options) {
      if ( type === void 0 ) type = CONTROL_TYPE.NOMINATIM;
      if ( options === void 0 ) options = {};


      if (!(this instanceof Base)) { return new Base(); }

      assert(typeof type === 'string', '@param `type` should be string!');
      assert(
        type === CONTROL_TYPE.NOMINATIM || type === CONTROL_TYPE.REVERSE,
        ("@param 'type' should be '" + (CONTROL_TYPE.NOMINATIM) + "'\n        or '" + (CONTROL_TYPE.REVERSE) + "'!")
      );
      assert(typeof options === 'object', '@param `options` should be object!');

      DEFAULT_OPTIONS.featureStyle = [
        new Style({ image: new Icon({ scale: .7, src: FEATURE_SRC }) })
      ];

      this.options = mergeOptions(DEFAULT_OPTIONS, options);
      this.container = undefined;

      let $nominatim;
      const $html = new Html(this);

      if (type === CONTROL_TYPE.NOMINATIM) {
        this.container = $html.els.container;
        $nominatim = new Nominatim(this, $html.els);
        this.layer = $nominatim.layer;
      } else if (type === CONTROL_TYPE.REVERSE) {
        // TODO
      }

      Control$$1.call(this, { element: this.container });
    }

    if ( Control$$1 ) Base.__proto__ = Control$$1;
    Base.prototype = Object.create( Control$$1 && Control$$1.prototype );
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

    /**
     * Set a new provider
     * @param {String} provider
     */
    Base.prototype.setProvider = function setProvider (provider) {
      this.options.provider = provider;
    };

    /**
     * Set provider key
     * @param {String} key
     */
    Base.prototype.setProviderKey = function setProviderKey (key) {
      this.options.key = key;
    };

    return Base;
  }(Control));

  return Base;

})));
