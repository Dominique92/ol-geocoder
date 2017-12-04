import ol from 'openlayers';
import { Photon } from './providers/photon';
import { OpenStreet } from './providers/osm';
import { MapQuest } from './providers/mapquest';
import { Pelias } from './providers/pelias';
import { Bing } from './providers/bing';
import { OpenCage } from './providers/opencage';
import { DataGouvFr } from './providers/datagouvfr.js';
import { VARS, TARGET_TYPE, PROVIDERS, EVENT_TYPE } from 'konstants';
import { randomId, flyTo } from 'helpers/mix';
import { json } from 'helpers/ajax';
import {
  hasClass,
  addClass,
  removeClass,
  createElement,
  template,
  removeAllChildren,
} from 'helpers/dom';

const klasses = VARS.cssClasses;

/**
 * @class Nominatim
 */
export class Nominatim {
  /**
   * @constructor
   * @param {Function} base Base class.
   */
  constructor(base, els) {
    this.Base = base;

    this.layerName = randomId('geocoder-layer-');
    this.layer = new ol.layer.Vector({
      name: this.layerName,
      source: new ol.source.Vector()
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
    this.DataGouvFr = new DataGouvFr();
  }

  setListeners() {
    let timeout, lastQuery;
    const openSearch = () => {
      hasClass(this.els.control, klasses.glass.expanded) ?
        this.collapse() : this.expand();
    };
    const query = (evt) => {
      const value = evt.target.value.trim();
      const hit = evt.key ? evt.key === 'Enter' :
        evt.which ? evt.which === 13 :
          evt.keyCode ? evt.keyCode === 13 : false;

      if (hit) {
        evt.preventDefault();
        this.query(value);
      }
    };
    const reset = (evt) => {
      this.els.input.focus();
      this.els.input.value = '';
      this.lastQuery = '';
      addClass(this.els.reset, klasses.hidden);
      this.clearResults();
    };
    const handleValue = (evt) => {
      const value = evt.target.value.trim();

      value.length
        ? removeClass(this.els.reset, klasses.hidden)
        : addClass(this.els.reset, klasses.hidden);

      if (this.options.autoComplete && value !== lastQuery) {
        lastQuery = value;
        timeout && clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (value.length >= this.options.autoCompleteMinLength) {
            this.query(value);
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
  }

  query(q) {
    const provider = this.getProvider({
      query: q,
      provider: this.options.provider,
      key: this.options.key,
      lang: this.options.lang,
      countrycodes: this.options.countrycodes,
      limit: this.options.limit
    });

    if (this.lastQuery === q && this.els.result.firstChild) return;

    this.lastQuery = q;
    this.clearResults();
    addClass(this.els.reset, klasses.spin);

    let ajax = {
      url: provider.url,
      data: provider.params,
    };

    if (provider.callbackName) {
      ajax.jsonp = true;
      ajax.callbackName = provider.callbackName;
    }

    json(ajax).then(res => {
      // eslint-disable-next-line no-console
      this.options.debug && console.info(res);

      removeClass(this.els.reset, klasses.spin);

      //will be fullfiled according to provider
      let res_;
      switch (this.options.provider) {
        case PROVIDERS.OSM:
          res_ = res.length ?
            this.OpenStreet.handleResponse(res) : undefined;
          break;
        case PROVIDERS.MAPQUEST:
          res_ = res.length ?
            this.MapQuest.handleResponse(res) : undefined;
          break;
        case PROVIDERS.PELIAS:
          res_ = res.features.length ?
            this.Pelias.handleResponse(res.features) : undefined;
          break;
        case PROVIDERS.PHOTON:
          res_ = res.features.length ?
            this.Photon.handleResponse(res.features) : undefined;
          break;
        case PROVIDERS.BING:
          res_ = res.resourceSets[0].resources.length
            ? this.Bing.handleResponse(res.resourceSets[0].resources)
            : undefined;
          break;
        case PROVIDERS.OPENCAGE:
          res_ = res.results.length ?
            this.OpenCage.handleResponse(res.results) : undefined;
          break;
        case PROVIDERS.DATAGOUVFR:
          res_ = res.features.length ?
            this.DataGouvFr.handleResponse(res.features) : undefined;
          break;
        default:
          res_ = this.options.provider.handleResponse(res);
          break;
      }
      if (res_) {
        this.createList(res_);
        this.listenMapClick();
      }
    }).catch(err => {
      removeClass(this.els.reset, klasses.spin);
      const li = createElement(
        'li', '<h5>Error! No internet connection?</h5>');
      this.els.result.appendChild(li);
    });
  }

  createList(response) {
    const ul = this.els.result;

    response.forEach(row => {
      let addressHtml;

      switch (this.options.provider) {
        case PROVIDERS.OSM:
          addressHtml =
            `<span class="${klasses.road}">${row.address.name}</span>`;
          break;
        default:
          addressHtml = this.addressTemplate(row.address);
      }

      const html = `<a href="#">${addressHtml}</a>`;
      const li = createElement('li', html);

      li.addEventListener('click', evt => {
        evt.preventDefault();
        this.chosen(row, addressHtml, row.address, row.original);
      }, false);

      ul.appendChild(li);
    });
  }

  chosen(place, addressHtml, addressObj, addressOriginal) {
    const map = this.Base.getMap();
    const coord_ = [parseFloat(place.lon), parseFloat(place.lat)];
    const projection = map.getView().getProjection();
    const coord = ol.proj.transform(coord_, 'EPSG:4326', projection);
    let bbox = place.bbox;

    if (bbox) {
      bbox = ol.proj.transformExtent(bbox, 'EPSG:4326', projection);
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
  }

  createFeature(coord) {
    const feature = new ol.Feature(new ol.geom.Point(coord));
    this.addLayer();
    feature.setStyle(this.options.featureStyle);
    feature.setId(randomId('geocoder-ft-'));
    this.getSource().addFeature(feature);
    return feature;
  }

  addressTemplate(address) {
    let html = [];
    if (address.name) {
      html.push(['<span class="', klasses.road, '">{name}</span>'].join(''));
    }
    if (address.road || address.building || address.house_number) {
      html.push([
        '<span class="', klasses.road,
        '">{building} {road} {house_number}</span>'
      ].join(''));
    }
    if (address.city || address.town || address.village) {
      html.push([
        '<span class="', klasses.city,
        '">{postcode} {city} {town} {village}</span>'
      ].join(''));
    }
    if (address.state || address.country) {
      html.push([
        '<span class="', klasses.country, '">{state} {country}</span>'
      ].join(''));
    }
    return template(html.join('<br>'), address);
  }

  getProvider(options) {
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
      case PROVIDERS.DATAGOUVFR:
        provider = this.DataGouvFr.getParameters(options);
        break;
      default:
        provider = options.provider.getParameters(options);
        break;
    }
    return provider;
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
    addClass(this.els.reset, klasses.hidden);
    removeClass(this.els.control, klasses.glass.expanded);
    this.clearResults();
  }

  listenMapClick() {
    // already registered
    if (this.registeredListeners.mapClick) return;

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
  }

  clearResults(collapse) {
    collapse && this.options.targetType === TARGET_TYPE.GLASS
      ? this.collapse()
      : removeAllChildren(this.els.result);
  }

  getSource() {
    return this.layer.getSource();
  }

  addLayer() {
    let found = false;
    const map = this.Base.getMap();

    map.getLayers().forEach(layer => {
      if (layer === this.layer) found = true;
    });
    if (!found) map.addLayer(this.layer);
  }
}
