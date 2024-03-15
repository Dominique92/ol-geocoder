/*!
 * ol-geocoder - v4.3.4
 * A geocoder extension compatible with OpenLayers v6.x to v9.0
 * https://github.com/Dominique92/ol-geocoder
 * Built: 15/03/2024 09:40:14
 */
 
 
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('ol/control/Control'), require('ol/style/Style'), require('ol/style/Icon'), require('ol/layer/Vector'), require('ol/source/Vector'), require('ol/geom/Point'), require('ol/Feature'), require('ol/proj')) :
  typeof define === 'function' && define.amd ? define(['ol/control/Control', 'ol/style/Style', 'ol/style/Icon', 'ol/layer/Vector', 'ol/source/Vector', 'ol/geom/Point', 'ol/Feature', 'ol/proj'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Geocoder = factory(global.ol.control.Control, global.ol.style.Style, global.ol.style.Icon, global.ol.layer.Vector, global.ol.source.Vector, global.ol.geom.Point, global.ol.Feature, global.ol.proj));
})(this, (function (Control, Style, Icon, LayerVector, SourceVector, Point, Feature, proj) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }

  var Control__default = /*#__PURE__*/_interopDefaultLegacy(Control);
  var Style__default = /*#__PURE__*/_interopDefaultLegacy(Style);
  var Icon__default = /*#__PURE__*/_interopDefaultLegacy(Icon);
  var LayerVector__default = /*#__PURE__*/_interopDefaultLegacy(LayerVector);
  var SourceVector__default = /*#__PURE__*/_interopDefaultLegacy(SourceVector);
  var Point__default = /*#__PURE__*/_interopDefaultLegacy(Point);
  var Feature__default = /*#__PURE__*/_interopDefaultLegacy(Feature);
  var proj__namespace = /*#__PURE__*/_interopNamespace(proj);

  var containerId = "gcd-container";
  var buttonControlId = "gcd-button-control";
  var inputQueryId = "gcd-input-query";
  var inputLabelId = "gcd-input-label";
  var inputSearchId = "gcd-input-search";
  var cssClasses = {
  	namespace: "ol-geocoder",
  	spin: "gcd-pseudo-rotate",
  	hidden: "gcd-hidden",
  	address: "gcd-address",
  	country: "gcd-country",
  	city: "gcd-city",
  	road: "gcd-road",
  	olControl: "ol-control",
  	glass: {
  		container: "gcd-gl-container",
  		control: "gcd-gl-control",
  		button: "gcd-gl-btn",
  		input: "gcd-gl-input",
  		expanded: "gcd-gl-expanded",
  		search: "gcd-gl-search",
  		result: "gcd-gl-result"
  	},
  	inputText: {
  		container: "gcd-txt-container",
  		control: "gcd-txt-control",
  		label: "gcd-txt-label",
  		input: "gcd-txt-input",
  		search: "gcd-txt-search",
  		icon: "gcd-txt-glass",
  		result: "gcd-txt-result"
  	}
  };
  var vars = {
  	containerId: containerId,
  	buttonControlId: buttonControlId,
  	inputQueryId: inputQueryId,
  	inputLabelId: inputLabelId,
  	inputSearchId: inputSearchId,
  	cssClasses: cssClasses
  };

  var _VARS_ = /*#__PURE__*/Object.freeze({
    __proto__: null,
    containerId: containerId,
    buttonControlId: buttonControlId,
    inputQueryId: inputQueryId,
    inputLabelId: inputLabelId,
    inputSearchId: inputSearchId,
    cssClasses: cssClasses,
    'default': vars
  });

  const VARS = _VARS_;

  const EVENT_TYPE = {
    ADDRESSCHOSEN: 'addresschosen',
  };

  const CONTROL_TYPE = {
    NOMINATIM: 'nominatim',
    REVERSE: 'reverse',
  };

  const TARGET_TYPE = {
    GLASS: 'glass-button',
    INPUT: 'text-input',
  };

  const FEATURE_SRC = 'data:image/svg+xml;charset=utf-8,' +
    '<svg width="26" height="42" viewBox="0 0 26 42" xmlns="http://www.w3.org/2000/svg">' +
    '<polygon points="1,18 14,42 25,18" fill="rgb(75,75,75)" />' +
    '<ellipse cx="13" cy="13" rx="13" ry="13" fill="rgb(75,75,75)" />' +
    '<ellipse cx="13" cy="14" rx="6" ry="6" fill="yellow" />' +
    '</svg>'; // #285

  const PROVIDERS = {
    BING: 'bing',
    MAPQUEST: 'mapquest',
    OPENCAGE: 'opencage',
    OSM: 'osm',
    PHOTON: 'photon',
  };

  const APIS = {
    BING: 'https://dev.virtualearth.net/REST/v1/Locations',
    MAPQUEST: 'https://nominatim.openstreetmap.org/search', // #286
    OPENCAGE: 'https://api.opencagedata.com/geocode/v1/json?',
    OSM: 'https://nominatim.openstreetmap.org/search',
    PHOTON: 'https://photon.komoot.io/api/',
  };

  const DEFAULT_OPTIONS = {
    provider: PROVIDERS.OSM,
    label: '',
    placeholder: 'Search for an address',
    featureStyle: null,
    targetType: TARGET_TYPE.GLASS,
    lang: 'en-US',
    limit: 5,
    keepOpen: false,
    preventDefault: false,
    preventPanning: false,
    preventMarker: false,
    defaultFlyResolution: 10, // Meters per pixel
    debug: false,
  };

  function assert(condition, message = 'Assertion failed') {
    if (!condition) {
      if (typeof Error !== 'undefined') throw new Error(message);

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

    if ('now' in window.performance === false) {
      let nowOffset = Date.now();

      if (performance.timing && performance.timing.navigationStart) {
        nowOffset = performance.timing.navigationStart;
      }

      window.performance.now = () => Date.now() - nowOffset;
    }

    return window.performance.now();
  }

  function randomId(prefix) {
    const id = now().toString(36);

    return prefix ? prefix + id : id;
  }

  function isNumeric(str) {
    return /^\d+$/u.test(str);
  }

  /* eslint-disable prefer-named-capture-group */

  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to remove a class.
   */
  function addClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach((each) => addClass(each, classname));

      return;
    }

    const array = Array.isArray(classname) ? classname : classname.split(/\s+/u);

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
      element.forEach((each) => removeClass(each, classname, timeout));

      return;
    }

    const array = Array.isArray(classname) ? classname : classname.split(/\s+/u);

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
    return element.classList ? element.classList.contains(c) : classRegex(c).test(element.className);
  }

  function removeAllChildren(node) {
    while (node.firstChild) node.firstChild.remove();
  }

  function template(html, row) {
    return html.replace(/\{\s*([\w-]+)\s*\}/gu, (htm, key) => {
      const value = row[key] === undefined ? '' : row[key];

      return htmlEscape(value);
    });
  }

  function htmlEscape(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function createElement(node, html) {
    let elem;

    if (Array.isArray(node)) {
      elem = document.createElement(node[0]);

      if (node[1].id) elem.id = node[1].id;

      if (node[1].classname) elem.className = node[1].classname;

      if (node[1].attr) {
        const {
          attr
        } = node[1];

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

    const frag = document.createDocumentFragment();

    while (elem.childNodes[0]) frag.append(elem.childNodes[0]);

    elem.append(frag);

    return elem;
  }

  function classRegex(classname) {
    return new RegExp(`(^|\\s+) ${classname} (\\s+|$)`, 'u');
  }

  function _addClass(el, klass, timeout) {
    // use native if available
    if (el.classList) {
      el.classList.add(klass);
    } else {
      el.className = `${el.className} ${klass}`.trim();
    }

    if (timeout && isNumeric(timeout)) {
      window.setTimeout(() => _removeClass(el, klass), timeout);
    }
  }

  function _removeClass(el, klass, timeout) {
    if (el.classList) {
      el.classList.remove(klass);
    } else {
      el.className = el.className.replace(classRegex(klass), ' ').trim();
    }

    if (timeout && isNumeric(timeout)) {
      window.setTimeout(() => _addClass(el, klass), timeout);
    }
  }

  const klasses$1 = VARS.cssClasses;

  /**
   * @class Html
   */
  class Html {
    /**
     * @constructor
     * @param {object} options Options.
     */
    constructor(options) {
      this.options = options;
      this.els = this.createControl();
    }

    createControl() {
      let container;
      let containerClass;
      let elements;

      if (this.options.targetType === TARGET_TYPE.INPUT) {
        containerClass = `${klasses$1.namespace} ${klasses$1.inputText.container}`;
        container = createElement(
          ['div', {
            id: VARS.containerId,
            classname: containerClass
          }],
          Html.input
        );
        elements = {
          container,
          control: container.querySelector(`.${klasses$1.inputText.control}`),
          label: container.querySelector(`.${klasses$1.inputText.label}`), // #198
          input: container.querySelector(`.${klasses$1.inputText.input}`),
          search: container.querySelector(`.${klasses$1.inputText.search}`),
          result: container.querySelector(`.${klasses$1.inputText.result}`),
        };
        elements.label.innerHTML = this.options.label;
      } else {
        containerClass = `${klasses$1.namespace} ${klasses$1.glass.container}`;
        container = createElement(
          ['div', {
            id: VARS.containerId,
            classname: containerClass
          }],
          Html.glass
        );
        elements = {
          container,
          control: container.querySelector(`.${klasses$1.glass.control}`),
          button: container.querySelector(`.${klasses$1.glass.button}`),
          input: container.querySelector(`.${klasses$1.glass.input}`),
          search: container.querySelector(`.${klasses$1.glass.search}`),
          result: container.querySelector(`.${klasses$1.glass.result}`),
        };
      }

      // set placeholder from options
      elements.input.placeholder = this.options.placeholder;

      return elements;
    }
  }

  Html.glass = `
  <div class="${klasses$1.glass.control} ${klasses$1.olControl}">
    <button type="button" id="${VARS.buttonControlId}" class="${klasses$1.glass.button}"></button>
    <input type="text" id="${VARS.inputQueryId}" class="${klasses$1.glass.input}" autocomplete="off" placeholder="Search ...">
    <a id="${VARS.inputSearchId}" class="${klasses$1.glass.search} ${klasses$1.hidden}"></a>
  </div>
  <ul class="${klasses$1.glass.result}"></ul>
`;

  Html.input = `
  <div class="${klasses$1.inputText.control}">
    <label type="button" id="${VARS.inputSearchId}" class="${klasses$1.inputText.label}"></label>
    <input type="text" id="${VARS.inputQueryId}" class="${klasses$1.inputText.input}" autocomplete="off" placeholder="Search ...">
    <span class="${klasses$1.inputText.icon}"></span>
    <button type="button" id="${VARS.inputSearchId}" class="${klasses$1.inputText.search} ${klasses$1.hidden}"></button>
  </div>
  <ul class="${klasses$1.inputText.result}"></ul>
`;

  function json(obj) {
    return new Promise((resolve, reject) => {
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
          .then((r) => r.json())
          .then(resolve)
          .catch(reject);
      }
    });
  }

  function toQueryString(obj) {
    return Object.keys(obj)
      .reduce((acc, k) => {
        acc.push(
          typeof obj[k] === 'object' ?
          toQueryString(obj[k]) :
          `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`
        );

        return acc;
      }, [])
      .join('&');
  }

  function encodeUrlXhr(url, data) {
    if (data && typeof data === 'object') {
      url += (/\?/u.test(url) ? '&' : '?') + toQueryString(data);
    }

    return url;
  }

  function jsonp(url, key, callback) {
    // https://github.com/Fresheyeball/micro-jsonp/blob/master/src/jsonp.js
    const {
      head
    } = document;
    const script = document.createElement('script');
    // generate minimally unique name for callback function
    const callbackName = `f${Math.round(Math.random() * Date.now())}`;

    // set request url
    script.setAttribute(
      'src',
      // add callback parameter to the url
      //    where key is the parameter key supplied
      //    and callbackName is the parameter value
      `${url + (url.indexOf('?') > 0 ? '&' : '?') + key}=${callbackName}`
    );

    // place jsonp callback on window,
    //  the script sent by the server should call this
    //  function as it was passed as a url parameter
    window[callbackName] = (data) => {
      window[callbackName] = undefined;

      // clean up script tag created for request
      setTimeout(() => head.removeChild(script), 0);

      // hand data back to the user
      callback(data);
    };

    // actually make the request
    head.append(script);
  }

  /**
   * @class Photon
   */
  class Photon {
    /**
     * @constructor
     */
    constructor() {
      this.settings = {
        url: APIS.PHOTON,

        params: {
          q: '',
          limit: 10,
          lang: 'en',
        },

        langs: ['de', 'it', 'fr', 'en'],
      };
    }

    getParameters(options) {
      options.lang = options.lang.toLowerCase();

      return {
        url: this.settings.url,

        params: {
          q: options.query,
          limit: options.limit || this.settings.params.limit,

          lang: this.settings.langs.includes(options.lang) ? options.lang : this.settings.params.lang,
        },
      };
    }

    handleResponse(results) {
      if (results.features.length === 0) return [];

      return results.features.map((result) => ({
        lon: result.geometry.coordinates[0],
        lat: result.geometry.coordinates[1],

        address: {
          name: result.properties.name,
          postcode: result.properties.postcode,
          city: result.properties.city,
          state: result.properties.state,
          country: result.properties.country,
        },

        original: {
          formatted: result.properties.name,
          details: result.properties,
        },
      }));
    }
  }

  /**
   * @class OpenStreet
   */
  class OpenStreet {
    /**
     * @constructor
     */
    constructor(options) {
      this.settings = {
        url: APIS.OSM,
        ...options, // #266 Allow custom URL for osm provider
        params: {
          q: '',
          format: 'json',
          addressdetails: 1,
          limit: 10,
          countrycodes: '',
          viewbox: '',
          'accept-language': 'en-US',
        },
      };
    }

    getParameters(opt) {
      return {
        url: this.settings.url,

        params: {
          q: opt.query,
          format: this.settings.params.format,
          addressdetails: this.settings.params.addressdetails,
          limit: opt.limit || this.settings.params.limit,
          countrycodes: opt.countrycodes || this.settings.params.countrycodes,
          viewbox: opt.viewbox || this.settings.params.viewbox, // #260
          'accept-language': opt.lang || this.settings.params['accept-language'],
        },
      };
    }

    handleResponse(results) {
      if (results.length === 0) return [];

      return results.map((result) => ({
        lon: result.lon,
        lat: result.lat,
        bbox: result.boundingbox,

        address: {
          name: result.display_name,
          road: result.address.road || '',
          houseNumber: result.address.house_number || '',
          postcode: result.address.postcode,
          city: result.address.city || result.address.town,
          state: result.address.state,
          country: result.address.country,
        },

        original: {
          formatted: result.display_name,
          details: result.address,
        },
      }));
    }
  }

  /**
   * @class MapQuest
   */
  class MapQuest {
    /**
     * @constructor
     */
    constructor() {
      this.settings = {
        url: APIS.MAPQUEST,

        params: {
          q: '',
          key: '',
          format: 'json',
          addressdetails: 1,
          limit: 10,
          countrycodes: '',
          'accept-language': 'en-US',
        },
      };
    }

    getParameters(options) {
      return {
        url: this.settings.url,

        params: {
          q: options.query,
          key: options.key,
          format: 'json',
          addressdetails: 1,
          limit: options.limit || this.settings.params.limit,
          countrycodes: options.countrycodes || this.settings.params.countrycodes,

          'accept-language': options.lang || this.settings.params['accept-language'],
        },
      };
    }

    handleResponse(results) {
      if (results.length === 0) return [];

      return results.map((result) => ({
        lon: result.lon,
        lat: result.lat,

        address: {
          name: result.address.neighbourhood || '',
          road: result.address.road || '',
          postcode: result.address.postcode,
          city: result.address.city || result.address.town,
          state: result.address.state,
          country: result.address.country,
        },

        original: {
          formatted: result.display_name,
          details: result.address,
        },
      }));
    }
  }

  /**
   * @class Bing
   */
  class Bing {
    /**
     * @constructor
     */
    constructor() {
      this.settings = {
        url: APIS.BING,
        callbackName: 'jsonp',

        params: {
          query: '',
          key: '',
          includeNeighborhood: 0,
          maxResults: 10,
        },
      };
    }

    getParameters(options) {
      return {
        url: this.settings.url,
        callbackName: this.settings.callbackName,

        params: {
          query: options.query,
          key: options.key,

          includeNeighborhood: options.includeNeighborhood || this.settings.params.includeNeighborhood,

          maxResults: options.maxResults || this.settings.params.maxResults,
        },
      };
    }

    handleResponse(results) {
      const {
        resources
      } = results.resourceSets[0];

      if (resources.length === 0) return [];

      return resources.map((result) => ({
        lon: result.point.coordinates[1],
        lat: result.point.coordinates[0],

        address: {
          name: result.name,
        },

        original: {
          formatted: result.address.formattedAddress,
          details: result.address,
        },
      }));
    }
  }

  /**
   * @class OpenCage
   */
  class OpenCage {
    /**
     * @constructor
     */
    constructor() {
      this.settings = {
        url: APIS.OPENCAGE,

        params: {
          q: '',
          key: '',
          limit: 10,
          countrycode: '',
          pretty: 1,
          no_annotations: 1,
        },
      };
    }

    getParameters(options) {
      return {
        url: this.settings.url,

        params: {
          q: options.query,
          key: options.key,
          limit: options.limit || this.settings.params.limit,
          countrycode: options.countrycodes || this.settings.params.countrycodes,
        },
      };
    }

    handleResponse(results) {
      if (results.results.length === 0) return [];

      return results.results.map((result) => ({
        lon: result.geometry.lng,
        lat: result.geometry.lat,

        address: {
          name: result.components.house_number || '',
          road: result.components.road || '',
          postcode: result.components.postcode,
          city: result.components.city || result.components.town,
          state: result.components.state,
          country: result.components.country,
        },

        original: {
          formatted: result.formatted,
          details: result.components,
        },
      }));
    }
  }

  const klasses = VARS.cssClasses;

  /**
   * @class Nominatim
   */
  class Nominatim {
    /**
     * @constructor
     * @param {Function} base Base class.
     */
    constructor(base, els) {
      this.Base = base;

      this.layerName = randomId('geocoder-layer-');
      this.layer = new LayerVector__default["default"]({
        background: 'transparent', // #282
        name: this.layerName,
        source: new SourceVector__default["default"](),
        displayInLayerSwitcher: false, // #256 Remove search layer from legend
      });

      this.options = base.options;
      // provider is either the name of a built-in provider as a string or an
      // object that implements the provider API
      this.options.provider =
        typeof this.options.provider === 'string' ?
        this.options.provider.toLowerCase() :
        this.options.provider;
      this.provider = this.newProvider();

      this.els = els;
      this.container = this.els.container;
      this.registeredListeners = {
        mapClick: false,
      };
      this.setListeners();
    }

    setListeners() {
      const openSearch = (evt) => {
        evt.stopPropagation();
        hasClass(this.els.control, klasses.glass.expanded) ? this.collapse() : this.expand();
      };
      const query = (evt) => {
        const value = evt.target.value.trim();
        const hit = evt.key ?
          evt.key === 'Enter' :
          evt.which ?
          evt.which === 13 :
          evt.keyCode ?
          evt.keyCode === 13 :
          false;

        if (hit) {
          evt.preventDefault();
          this.query(value);
        }
      };
      const stopBubbling = (evt) => evt.stopPropagation();
      const search = () => { // #255
        this.els.input.focus();
        this.query(this.els.input.value);
      };
      const handleValue = (evt) => {
        const value = evt.target.value.trim();

        value.length !== 0 ?
          removeClass(this.els.search, klasses.hidden) :
          addClass(this.els.search, klasses.hidden);
      };

      this.els.input.addEventListener('keypress', query, false);
      this.els.input.addEventListener('click', stopBubbling, false);
      this.els.input.addEventListener('input', handleValue, false);
      this.els.search.addEventListener('click', search, false);

      if (this.options.targetType === TARGET_TYPE.GLASS) {
        this.els.button.addEventListener('click', openSearch, false);
      }
    }

    query(q) {
      // lazy provider
      if (!this.provider) {
        this.provider = this.newProvider();
      }

      const parameters = this.provider.getParameters({
        query: q,
        key: this.options.key,
        lang: this.options.lang,
        countrycodes: this.options.countrycodes,
        viewbox: this.options.viewbox,
        limit: this.options.limit,
      });

      this.clearResults(this.options.keepOpen === false); // #284
      addClass(this.els.search, klasses.spin);

      const ajax = {
        url: parameters.url,
        data: parameters.params,
      };

      if (parameters.callbackName) {
        ajax.jsonp = true;
        ajax.callbackName = parameters.callbackName;
      }

      json(ajax)
        .then((res) => {
          // eslint-disable-next-line no-console
          this.options.debug && console.info(res);

          removeClass(this.els.search, klasses.spin);

          // will be fullfiled according to provider
          const res_ = this.provider.handleResponse(res);

          if (res_) {
            this.createList(res_);
            this.listenMapClick();
          }
        })
        .catch(() => {
          removeClass(this.els.search, klasses.spin);

          const li = createElement('li', '<h5>Error! No internet connection?</h5>');

          this.els.result.append(li);
        });
    }

    createList(response) {
      const ul = this.els.result;

      response.forEach((row) => {
        let addressHtml;

        switch (this.options.provider) {
          case PROVIDERS.OSM:
            addressHtml = `<span class="${klasses.road}">${row.address.name}</span>`;
            break;

          default:
            addressHtml = this.addressTemplate(row.address);
        }

        if (response.length == 1) {
          // #206 Direct access if options.limit: 1
          this.chosen(row, addressHtml, row.address, row.original);
        } else {
          const li = createElement('li', `<a href="#">${addressHtml}</a>`);

          li.addEventListener(
            'click',
            (evt) => {
              evt.preventDefault();
              this.chosen(row, addressHtml, row.address, row.original);
            },
            false
          );

          ul.append(li);
        }
      });
    }

    chosen(place, addressHtml, addressObj, addressOriginal) {
      const map = this.Base.getMap();
      const coord_ = [Number.parseFloat(place.lon), Number.parseFloat(place.lat)];
      const projection = map.getView().getProjection();
      const coord = proj__namespace.transform(coord_, 'EPSG:4326', projection);

      let {
        bbox
      } = place;

      if (bbox) {
        bbox = proj__namespace.transformExtent(
          // #274 https://nominatim.org/release-docs/latest/api/Output/#boundingbox
          // Requires parseFloat on negative bbox entries
          [parseFloat(bbox[2]), parseFloat(bbox[0]), parseFloat(bbox[3]), parseFloat(bbox[1])], // SNWE -> WSEN
          'EPSG:4326',
          projection
        );
      }

      const address = {
        formatted: addressHtml,
        details: addressObj,
        original: addressOriginal,
      };

      this.clearResults(true); // #284

      // #239
      if (this.options.preventDefault === true || this.options.preventMarker === true) {
        // No display change
        this.Base.dispatchEvent({
          type: EVENT_TYPE.ADDRESSCHOSEN,
          address,
          coordinate: coord,
          bbox,
          place,
        });
      } else {
        // Display a marker
        const feature = this.createFeature(coord, address);

        this.Base.dispatchEvent({
          type: EVENT_TYPE.ADDRESSCHOSEN,
          address,
          feature,
          coordinate: coord,
          bbox,
          place,
        });
      }

      // #239
      if (this.options.preventDefault !== true && this.options.preventPanning !== true) {
        // Move & zoom to the position
        if (bbox) {
          map.getView().fit(bbox, {
            duration: 500,
          });
        } else {
          map.getView().animate({
            center: coord,
            // #235 ol-geocoder results are too much zoomed -in
            resolution: this.options.defaultFlyResolution,
            duration: 500,
          });
        }
      }
    }

    createFeature(coord) {
      const feature = new Feature__default["default"](new Point__default["default"](coord));

      this.addLayer();
      feature.setStyle(this.options.featureStyle);
      feature.setId(randomId('geocoder-ft-'));
      this.getSource().addFeature(feature);

      return feature;
    }

    addressTemplate(address) {
      const html = [];

      if (address.name) {
        html.push(['<span class="', klasses.road, '">{name}</span>'].join(''));
      }

      if (address.road || address.building || address.house_number) {
        html.push(
          ['<span class="', klasses.road, '">{building} {road} {house_number}</span>'].join('')
        );
      }

      if (address.city || address.town || address.village) {
        html.push(
          ['<span class="', klasses.city, '">{postcode} {city} {town} {village}</span>'].join('')
        );
      }

      if (address.state || address.country) {
        html.push(['<span class="', klasses.country, '">{state} {country}</span>'].join(''));
      }

      return template(html.join('<br>'), address);
    }

    newProvider() {
      switch (this.options.provider) {
        case PROVIDERS.OSM:
          return new OpenStreet(this.options);
        case PROVIDERS.MAPQUEST:
          return new MapQuest();
        case PROVIDERS.PHOTON:
          return new Photon();
        case PROVIDERS.BING:
          return new Bing();
        case PROVIDERS.OPENCAGE:
          return new OpenCage();

        default:
          return this.options.provider;
      }
    }

    expand() {
      removeClass(this.els.input, klasses.spin);
      addClass(this.els.control, klasses.glass.expanded);
      window.setTimeout(() => this.els.input.focus(), 100);
      this.listenMapClick();
    }

    collapse() {
      this.els.input.value = '';
      this.els.input.blur();
      addClass(this.els.search, klasses.hidden);
      removeClass(this.els.control, klasses.glass.expanded);
      removeAllChildren(this.els.result); // #284
    }

    listenMapClick() {
      // already registered
      if (this.registeredListeners.mapClick) return;

      const that = this;
      const mapElement = this.Base.getMap().getTargetElement();

      this.registeredListeners.mapClick = true;

      // one-time fire click
      mapElement.addEventListener(
        'click', {
          handleEvent(evt) {
            mapElement.removeEventListener(evt.type, this, false);
            that.registeredListeners.mapClick = false;
          },
        },
        false
      );
    }

    clearResults(collapse) {
      collapse && this.options.targetType === TARGET_TYPE.GLASS ?
        this.collapse() :
        removeAllChildren(this.els.result);
    }

    getSource() {
      return this.layer.getSource();
    }

    addLayer() {
      let found = false;

      const map = this.Base.getMap();

      map.getLayers().forEach((layer) => {
        if (layer === this.layer) found = true;
      });

      if (!found) map.addLayer(this.layer);
    }
  }

  /**
   * @class Base
   * @extends {ol.control.Control}
   */
  class Base extends Control__default["default"] {
    /**
     * @constructor
     * @param {string} type nominatim|reverse.
     * @param {object} options Options.
     */
    constructor(type = CONTROL_TYPE.NOMINATIM, opt) {
      assert(typeof type === 'string', '@param `type` should be string!');
      assert(
        type === CONTROL_TYPE.NOMINATIM || type === CONTROL_TYPE.REVERSE,
        `@param 'type' should be '${CONTROL_TYPE.NOMINATIM}'
      or '${CONTROL_TYPE.REVERSE}'!`
      );
      const options = {
        ...DEFAULT_OPTIONS,
        featureStyle: [
          new Style__default["default"]({
            image: new Icon__default["default"]({
              anchor: [0.5, 1], // #285
              src: FEATURE_SRC
            })
          }),
        ],
        ...opt,
      };

      let container;
      let $nominatim;
      const $html = new Html(options);

      if (type === CONTROL_TYPE.NOMINATIM) {
        container = $html.els.container;
      }

      super({
        element: container,
        ...options, // Allows to add ol.control.Control options (as target:)
      });

      if (!(this instanceof Base)) return new Base();

      this.options = options;
      this.container = container;

      if (type === CONTROL_TYPE.NOMINATIM) {
        $nominatim = new Nominatim(this, $html.els);
        this.layer = $nominatim.layer;
      }
    }

    /**
     * @return {ol.layer.Vector} Returns the layer created by this control
     */
    getLayer() {
      return this.layer;
    }

    /**
     * @return {ol.source.Vector} Returns the source created by this control
     */
    getSource() {
      return this.getLayer().getSource();
    }

    /**
     * Set a new provider
     * @param {String} provider
     */
    setProvider(provider) {
      this.options.provider = provider;
    }

    /**
     * Set provider key
     * @param {String} key
     */
    setProviderKey(key) {
      this.options.key = key;
    }
  }

  return Base;

}));
//# sourceMappingURL=ol-geocoder-debug.js.map
