import * as vars from '../../config/vars.json';
import * as constants from './constants';
import utils from './utils';
import { Photon } from './providers/photon';
import { OpenStreet } from './providers/osm';
import { MapQuest } from './providers/mapquest';
import { Pelias } from './providers/pelias';
import { Google } from './providers/google';

/**
 * @class Nominatim
 */
export class Nominatim {
  /**
   * @constructor
   * @param {Function} base Base class.
   */
  constructor(base) {
    this.Base = base;

    this.layer_name = utils.randomId('geocoder-layer-');
    this.layer = new ol.layer.Vector({
      name: this.layer_name,
      source: new ol.source.Vector()
    });
    
    this.options = base.options;
    this.options.provider = this.options.provider.toLowerCase();

    this.els = this.createControl();
    this.container = this.els.container;
    this.registered_listeners = {
      map_click: false
    };
    this.setListeners();
    
    // providers
    this.Photon = new Photon();
    this.OpenStreet = new OpenStreet();
    this.MapQuest = new MapQuest();
    this.Pelias = new Pelias();
    this.Google = new Google();
    
    return this;
  }
  
  createControl() {
    const container = utils.createElement([
      'div', { classname: vars.namespace + vars.container_class }
    ], Nominatim.html);
    
    const elements = {
      container: container,
      control: 
        container.querySelector(`.${vars.namespace + vars.control_class}`),
      btn_search: 
        container.querySelector(`.${vars.namespace + vars.btn_search_class}`),
      input_search: 
        container.querySelector(`.${vars.namespace + vars.input_search_class}`),
      result_container: 
        container.querySelector(`.${vars.namespace + vars.result_class}`)
    };
    //set placeholder from options
    elements.input_search.placeholder = this.options.placeholder;
    return elements;
  }
  
  setListeners() {
    let openSearch = () => {
        if(utils.hasClass(this.els.control, vars.namespace + vars.expanded_class)) {
          this.collapse();
        } else {
          this.expand();
        }
      },
      query = evt => {
        if (evt.keyCode == 13) { //enter key
          evt.preventDefault();
          const q = utils.htmlEscape(this.els.input_search.value);
          this.query(q);
        }
      };
    this.els.input_search.addEventListener('keydown', query, false);
    this.els.btn_search.addEventListener('click', openSearch, false);
  }
  
  query(q) {
    let this_ = this,
        options = this.options,
        input = this.els.input_search,
        provider = this.getProvider({
          query: q,
          provider: options.provider,
          key: options.key,
          lang: options.lang,
          countrycodes: options.countrycodes,
          limit: options.limit
        });

    this.clearResults();
    utils.addClass(input, vars.namespace + vars.loading_class);
    
    utils.json(provider.url, provider.params).when({
      ready: response => {
        if (options.debug) {
          console.info(response);
        }
        
        utils.removeClass(input, vars.namespace + vars.loading_class);
        
        //will be fullfiled according to provider
        let response__;
        
        switch (options.provider) {
          case constants.providers.OSM:
            response__ = response.length > 0 ?
              this.OpenStreet.handleResponse(response) : undefined;
            break;
          case constants.providers.MAPQUEST:
            response__ = response.length > 0 ?
              this.MapQuest.handleResponse(response) : undefined;
            break;
          case constants.providers.PELIAS:
            response__ = response.features.length > 0 ?
              this.Pelias.handleResponse(response.features) : undefined;
            break;
          case constants.providers.PHOTON:
            response__ = response.features.length > 0 ?
              this.Photon.handleResponse(response.features) : undefined;
            break;
          case constants.providers.GOOGLE:
            response__ = response.results.length > 0 ?
            this.Google.handleResponse(response.results) : undefined;
            break;
        }
        if(response__){
          this.createList(response__);
          this.listenMapClick();
        }
      },
      error: () => {
        utils.removeClass(input, vars.namespace + vars.loading_class);
        const li = utils.createElement('li', 
          '<h5>Error! No internet connection?</h5>');
        this.els.result_container.appendChild(li);
      }
    });
  }
  
  createList(response) {
    const ul = this.els.result_container;
    response.forEach(row => {
      let address_html = this.addressTemplate(row.address),
          html = '<a href="#">' + address_html + '</a>',
          li = utils.createElement('li', html);

      li.addEventListener('click', evt => {
        evt.preventDefault();
        this.chosen(row, address_html, row.address, row.original);
      }, false);
      
      ul.appendChild(li);
    });
  }
  
  chosen(place, address_html, address_obj, address_original) {
    if(this.options.keepOpen === false){
      this.clearResults(true);
    }
    
    let map = this.Base.getMap(),
        view = map.getView(),
        projection = view.getProjection(),
        coord = ol.proj.transform(
          [parseFloat(place.lon), parseFloat(place.lat)],
          'EPSG:4326', projection
        ),
        resolution = 2.388657133911758, duration = 500,
        obj = {
          coord: coord,
          address_html: address_html,
          address_obj: address_obj,
          address_original: address_original
        },
        pan = ol.animation.pan({
          duration: duration,
          source: view.getCenter()
        }),
        zoom = ol.animation.zoom({
          duration: duration,
          resolution: view.getResolution()
        });
    
    map.beforeRender(pan, zoom);
    view.setCenter(coord);
    view.setResolution(resolution);
    this.createFeature(obj);
  }

  createFeature(obj) {
    const feature = new ol.Feature({
      address_html: obj.address_html,
      address_obj: obj.address_obj,
      address_original: obj.address_original,
      geometry: new ol.geom.Point(obj.coord)
    });
    
    this.addLayer();
    feature.setStyle(this.options.featureStyle);
    feature.setId(utils.randomId('geocoder-ft-'));
    this.getSource().addFeature(feature);
    this.Base.dispatchEvent({
      type: constants.eventType.ADDRESSCHOSEN,
      feature: feature,
      coordinate: obj.coord,
    });
  }
  
  addressTemplate(address) {
    let html = [];
    if (address.name) {
      html.push(
        '<span class="' + vars.namespace + vars.road_class + '">{name}</span>'
      );
    }
    if (address.road || address.building || address.house_number) {
      html.push(
        '<span class="' + vars.namespace + vars.road_class +
        '">{building} {road} {house_number}</span>'
      );
    }
    if (address.city || address.town || address.village) {
      html.push(
        '<span class="' + vars.namespace + vars.city_class +
        '">{postcode} {city} {town} {village}</span>'
      );
    }
    if (address.state || address.country) {
      html.push(
        '<span class="' + vars.namespace + vars.country_class +
        '">{state} {country}</span>'
      );
    }
    return utils.template(html.join('<br>'), address);
  }
  
  getProvider(options) {
    let provider;

    switch(options.provider) {
      case constants.providers.OSM:
        provider = this.OpenStreet.getParameters(options);
        break;
      case constants.providers.MAPQUEST:
        provider = this.MapQuest.getParameters(options);
        break;
      case constants.providers.PHOTON:
        provider = this.Photon.getParameters(options);
        break;
      case constants.providers.GOOGLE:
        provider = this.Google.getParameters(options);
        break;
      case constants.providers.PELIAS:
        provider = this.Pelias.getParameters(options);
        break;
    }
    return provider;
  }
  
  expand() {
    utils.removeClass(this.els.input_search, vars.namespace + vars.loading_class);
    utils.addClass(this.els.control, vars.namespace + vars.expanded_class);
    window.setTimeout(() => {
      this.els.input_search.focus();
    }, 100);
    this.listenMapClick();
  }

  collapse() {
    this.els.input_search.value = '';
    this.els.input_search.blur();
    utils.removeClass(this.els.control, vars.namespace + vars.expanded_class);
    this.clearResults();
  }
  
  listenMapClick() {
    if(this.registered_listeners.map_click) {
      // already registered
      return;
    }
    
    const this_ = this;
    const map_element = this.Base.getMap().getTargetElement();
    this.registered_listeners.map_click = true;
    
    //one-time fire click
    map_element.addEventListener('click', {
      handleEvent: function (evt) {
        this_.clearResults(true);
        map_element.removeEventListener(evt.type, this, false);
        this_.registered_listeners.map_click = false;
      }
    }, false);
  }
  
  clearResults(collapse) {
    if(collapse) {
      this.collapse();
    } else {
      utils.removeAllChildren(this.els.result_container);
    }
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
    if (!found) {
      map.addLayer(this.layer);
    }
  }
}

Nominatim.html = [
  '<div class="',
      vars.namespace + vars.control_class,
      ' ',
      vars.OL3_control_class,
      '">',
    '<button',
      ' type="button"',
      ' class="' + vars.namespace + vars.btn_search_class +'">',
    '</button>',
    '<form id="'+ vars.form_id +'" action="javascript:void(0);">',
      '<input',
        ' type="text"',
        ' id="'+ vars.input_query_id +'"',
        ' class="'+ vars.namespace + vars.input_search_class + '"',
        ' placeholder="Search ...">',
    '</form>',
  '</div>',
  '<ul class="',
    vars.namespace + vars.result_class,
  '"></ul>'
].join('');
