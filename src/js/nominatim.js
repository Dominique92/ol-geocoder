import * as C from './constants';
import U from './utils';
import { Photon } from './providers/photon';
import { OpenStreet } from './providers/osm';
import { MapQuest } from './providers/mapquest';
import { Pelias } from './providers/pelias';
import { Google } from './providers/google';
import { Bing } from './providers/bing';

const klasses = C.vars.cssClasses;

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

    this.layerName = U.randomId('geocoder-layer-');
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
  }

  setListeners() {
    let timeout, lastQuery;
    const openSearch = () => {
      U.hasClass(this.els.control, klasses.glass.expanded) ?
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
      U.addClass(this.els.reset, klasses.hidden);
      this.clearResults();
    };
    const handleValue = (evt) => {
      const value = evt.target.value.trim();

      value.length
        ? U.removeClass(this.els.reset, klasses.hidden)
        : U.addClass(this.els.reset, klasses.hidden);

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
    this.els.input.addEventListener('keyup', query, false);
    this.els.input.addEventListener('input', handleValue, false);
    this.els.reset.addEventListener('click', reset, false);
    if (this.options.targetType === C.targetType.GLASS) {
      this.els.button.addEventListener('click', openSearch, false);
    }
  }

  query(q) {
    let ajax = {}, options = this.options;
    const provider = this.getProvider({
      query: q,
      provider: options.provider,
      key: options.key,
      lang: options.lang,
      countrycodes: options.countrycodes,
      limit: options.limit
    });
    if (this.lastQuery === q && this.els.result.firstChild) return;
    this.lastQuery = q;
    this.clearResults();
    U.addClass(this.els.reset, klasses.spin);

    ajax.url = document.location.protocol + provider.url;
    ajax.data = provider.params;

    if (options.provider === C.providers.BING) {
      ajax.data_type = 'jsonp';
      ajax.callbackName = provider.callbackName;
    }

    U.json(ajax).when({
      ready: res => {
        // eslint-disable-next-line no-console
        options.debug && console.info(res);
        U.removeClass(this.els.reset, klasses.spin);
        //will be fullfiled according to provider
        let res_;
        switch (options.provider) {
          case C.providers.OSM:
            res_ = res.length ?
              this.OpenStreet.handleResponse(res) : undefined;
            break;
          case C.providers.MAPQUEST:
            res_ = res.length ?
              this.MapQuest.handleResponse(res) : undefined;
            break;
          case C.providers.PELIAS:
            res_ = res.features.length ?
              this.Pelias.handleResponse(res.features) : undefined;
            break;
          case C.providers.PHOTON:
            res_ = res.features.length ?
              this.Photon.handleResponse(res.features) : undefined;
            break;
          case C.providers.GOOGLE:
            res_ = res.results.length ?
              this.Google.handleResponse(res.results) : undefined;
            break;
          case C.providers.BING:
            res_ = res.resourceSets[0].resources.length
              ? this.Bing.handleResponse(res.resourceSets[0].resources)
              : undefined;
            break;
          default:
            // eslint-disable-next-line no-console
            console.log('Unknown provider!');
            break;
        }
        if (res_) {
          this.createList(res_);
          this.listenMapClick();
        }
      },
      error: () => {
        U.removeClass(this.els.reset, klasses.spin);
        const li = U.createElement(
          'li', '<h5>Error! No internet connection?</h5>');
        this.els.result.appendChild(li);
      }
    });
  }

  createList(response) {
    const ul = this.els.result;
    response.forEach(row => {
      let addressHtml = this.addressTemplate(row.address),
          html = ['<a href="#">', addressHtml, '</a>'].join(''),
          li = U.createElement('li', html);
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
    const address = {
      formatted: addressHtml,
      details: addressObj,
      original: addressOriginal
    };

    this.options.keepOpen === false && this.clearResults(true);

    if (this.options.preventDefault === true) {
      this.Base.dispatchEvent({
        type: C.eventType.ADDRESSCHOSEN,
        address: address,
        coordinate: coord
      });
    } else {
      U.flyTo(map, coord);
      const feature = this.createFeature(coord, address);

      this.Base.dispatchEvent({
        type: C.eventType.ADDRESSCHOSEN,
        address: address,
        feature: feature,
        coordinate: coord
      });
    }
  }

  createFeature(coord) {
    const feature = new ol.Feature(new ol.geom.Point(coord));
    this.addLayer();
    feature.setStyle(this.options.featureStyle);
    feature.setId(U.randomId('geocoder-ft-'));
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
    return U.template(html.join('<br>'), address);
  }

  getProvider(options) {
    let provider;
    /*eslint default-case: 0*/
    switch (options.provider) {
      case C.providers.OSM:
        provider = this.OpenStreet.getParameters(options);
        break;
      case C.providers.MAPQUEST:
        provider = this.MapQuest.getParameters(options);
        break;
      case C.providers.PHOTON:
        provider = this.Photon.getParameters(options);
        break;
      case C.providers.GOOGLE:
        provider = this.Google.getParameters(options);
        break;
      case C.providers.PELIAS:
        provider = this.Pelias.getParameters(options);
        break;
      case C.providers.BING:
        provider = this.Bing.getParameters(options);
        break;
    }
    return provider;
  }

  expand() {
    U.removeClass(this.els.input, klasses.spin);
    U.addClass(this.els.control, klasses.glass.expanded);
    window.setTimeout(() => this.els.input.focus(), 100);
    this.listenMapClick();
  }

  collapse() {
    this.els.input.value = '';
    this.els.input.blur();
    U.addClass(this.els.reset, klasses.hidden);
    U.removeClass(this.els.control, klasses.glass.expanded);
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
    collapse && this.options.targetType === C.targetType.GLASS ?
      this.collapse() : U.removeAllChildren(this.els.result);
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
