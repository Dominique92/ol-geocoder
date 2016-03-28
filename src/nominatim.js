(function(Geocoder){
  
  Geocoder.Nominatim = function(geocoder, opt_options){
    this.geocoder = geocoder;
    this.layer_name = utils.randomId('geocoder-layer-');
    this.layer = new ol.layer.Vector({
      name: this.layer_name,
      source: new ol.source.Vector()
    });
    var defaults = {
      provider: 'osm',
      placeholder: 'Search for an address',
      featureStyle: Geocoder.Nominatim.featureStyle,
      lang: 'en-US',
      limit: 5,
      keepOpen: false,
      debug: false
    };
    
    this.options = utils.mergeOptions(defaults, opt_options);
    this.options.provider = this.options.provider.toLowerCase();
    this.constants = {
      road: 'ol-geocoder-road',
      city: 'ol-geocoder-city',
      country: 'ol-geocoder-country',
      class_container: 'ol-geocoder',
      expanded_class: 'ol-geocoder-search-expanded'
    };

    this.createControl();
    this.els = Geocoder.Nominatim.elements;
    this.registered_listeners = {
      map_click: false
    };
    this.setListeners();
    return this;
  };
  
  Geocoder.Nominatim.prototype = {
    createControl: function(){
      var container = utils.createElement([
        'div', { classname: this.constants.class_container }
      ], Geocoder.Nominatim.html);
      
      Geocoder.Nominatim.elements = {
        container: container,
        control: container.querySelector('.ol-geocoder-search'),
        btn_search: container.querySelector('.ol-geocoder-btn-search'),
        input_search: container.querySelector('.ol-geocoder-input-search'),
        result_container: container.querySelector('.ol-geocoder-result')
      };
      //set placeholder from options
      Geocoder.Nominatim.elements.input_search.placeholder =
        this.options.placeholder;

      return container;
    },
    setListeners: function(){
      var
        this_ = this,
        openSearch = function() {
          if(utils.hasClass(this_.els.control, this_.constants.expanded_class)){
            this_.collapse();
          } else {
            this_.expand();
          }
        },
        query = function(evt){
          if (evt.keyCode == 13){ //enter key
            var q = utils.htmlEscape(this_.els.input_search.value);
            this_.query(q);
          }
        }
      ;
      this_.els.input_search.addEventListener('keydown', query, false);
      this_.els.btn_search.addEventListener('click', openSearch, false);
    },
    listenMapClick: function() {
      if(this.registered_listeners.map_click) {
        // already registered
        return;
      }
 
      var this_ = this;
      var map_element = this.geocoder.getMap().getTargetElement();
      this.registered_listeners.map_click = true;
      
      //one-time fire click
      map_element.addEventListener('click', {
        handleEvent: function (evt) {
          this_.clearResults(true);
          map_element.removeEventListener(evt.type, this, false);
          this_.registered_listeners.map_click = false;
        }
      }, false);
    },
    expand: function(){
      utils.removeClass(this.els.input_search, 'ol-geocoder-loading');
      utils.addClass(this.els.control, this.constants.expanded_class);
      var input = this.els.input_search;
      window.setTimeout(function(){
        input.focus();
      }, 100);
      this.listenMapClick();
    },
    collapse: function(){
      this.els.input_search.value = "";
      this.els.input_search.blur();
      utils.removeClass(this.els.control, this.constants.expanded_class);
      this.clearResults();
    },
    clearResults: function(collapse){
      if(collapse) {
        this.collapse();
      } else {
        utils.removeAllChildren(this.els.result_container);
      }
    },
    query: function(query){
      var
        this_ = this,
        options = this.options,
        input = this.els.input_search,
        providers_names = Geocoder.Nominatim.providers.names,
        provider = this.getProvider({
          provider: options.provider,
          key: options.key,
          query: query,
          lang: options.lang,
          countrycodes: options.countrycodes,
          limit: options.limit
        })
      ;

      this.clearResults();
      utils.addClass(input, 'ol-geocoder-loading');

      utils.json(provider.url, provider.params).when({
        ready: function(response){
          if(options.debug){
            console.info(response);
          }
          
          utils.removeClass(input, 'ol-geocoder-loading');
          
          //will be fullfiled according to provider
          var response__;
          
          switch (this_.options.provider) {
            case providers_names.OSM:
            case providers_names.MAPQUEST:
              response__ = response.length > 0 ?
                this_.mapquestResponse(response) : undefined;
              break;
            case providers_names.PELIAS:
              response__ = response.features.length > 0 ?
                this_.peliasResponse(response.features) : undefined;
              break;
            case providers_names.PHOTON:
              response__ = response.features.length > 0 ?
                this_.photonResponse(response.features) : undefined;
              break;
            case providers_names.GOOGLE:
              response__ = response.results.length > 0 ?
                this_.googleResponse(response.results) : undefined;
              break;
          }
          if(response__){
            this_.createList(response__);
            this_.listenMapClick();
          }
        },
        error: function(){
          utils.removeClass(input, 'ol-geocoder-loading');
          var li = utils.createElement('li', 
            '<h5>Error! No internet connection?</h5>');
          this_.els.result_container.appendChild(li);
        }
      });
    },
    createList: function(response){
      var this_ = this;
      var ul = this.els.result_container;
      response.forEach(function(row) {
        var
          address_html = this_.addressTemplate(row),
          html = '<a href="#">' + address_html + '</a>',
          li = utils.createElement('li', html)
        ;
        li.addEventListener('click', function(evt){
          evt.preventDefault();
          this_.chosen(row, address_html, row.address, row.original);
        }, false);
        
        ul.appendChild(li);
      });
    },
    addressTemplate: function(r){
      var row = r.address, html = [];
      if (row.name) {
        html.push(
          '<span class="' + this.constants.road + '">{name}</span>'
        );
      }
      if (row.road || row.building || row.house_number) {
        html.push(
          '<span class="' + this.constants.road +
          '">{building} {road} {house_number}</span>'
        );
      }
      if (row.city || row.town || row.village) {
        html.push(
          '<span class="' + this.constants.city +
          '">{postcode} {city} {town} {village}</span>'
        );
      }
      if (row.state || row.country) {
        html.push(
          '<span class="' + this.constants.country +
          '">{state} {country}</span>'
        );
      }
      return utils.template(html.join('<br>'), row);
    },
    chosen: function(place, address_html, address_obj, address_original){
      if(this.options.keepOpen === false){
        this.clearResults(true);
      }
      
      var
        map = this.geocoder.getMap(),
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
        })
      ;
      
      map.beforeRender(pan, zoom);
      view.setCenter(coord);
      view.setResolution(resolution);
      this.createFeature(obj);
    },
    createFeature: function(obj){
      var
        feature = new ol.Feature({
          address_html: obj.address_html,
          address_obj: obj.address_obj,
          address_original: obj.address_original,
          geometry: new ol.geom.Point(obj.coord)
        }),
        feature_id = utils.randomId('geocoder-ft-'),
        feature_style = this.options.featureStyle || 
          Geocoder.Nominatim.featureStyle
      ;
      
      this.addLayer();
      feature.setStyle(feature_style);
      feature.setId(feature_id);
      this.getSource().addFeature(feature);
      this.geocoder.dispatchEvent({
        type: Geocoder.EventType.ADDRESSCHOSEN,
        feature: feature,
        coordinate: obj.coord,
      });
    },
    mapquestResponse: function(results){
      var array = results.map(function(result){
        return {
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
        };
      });
      return array;
    },
    photonResponse: function(features){
      var array = features.map(function(feature){
        return {
          lon: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1],
          address: {
            name: feature.properties.name,
            postcode: feature.properties.postcode,
            city: feature.properties.city,
            state: feature.properties.state,
            country: feature.properties.country
          },
          original: {
            formatted: feature.properties.name,
            details: feature.properties
          }
        };
      });
      return array;
    },
    peliasResponse: function(features){
      var array = features.map(function(feature){
        return {
          lon: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1],
          address: {
            name: feature.properties.name,
            house_number: feature.properties.housenumber,
            postcode: feature.properties.postalcode,
            road: feature.properties.street,
            city: feature.properties.city,
            state: feature.properties.region,
            country: feature.properties.country
          },
          original: {
            formatted: feature.properties.label,
            details: feature.properties
          }
        };
      });
      return array;
    },
    googleResponse: function(results){
      var
        name = [
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
        postcode = [ 'postal_code' ],
        city = [ 'locality' ],
        state = [ 'administrative_area_level_1' ],
        country = [ 'country' ]
      ;
      
      /*
       * @param {Array} details - address_components
       */
      var getDetails = function(details){
        var parts = {
          name: '',
          road: '',
          postcode: '',
          city: '',
          state: '',
          country: ''
        };
        details.forEach(function(detail){
          if(utils.anyMatchInArray(detail.types, name)){
            parts.name = detail.long_name;
          } else if(utils.anyMatchInArray(detail.types, road)){
            parts.road = detail.long_name;
          } else if(utils.anyMatchInArray(detail.types, postcode)){
            parts.postcode = detail.long_name;
          } else if(utils.anyMatchInArray(detail.types, city)){
            parts.city = detail.long_name;
          } else if(utils.anyMatchInArray(detail.types, state)){
            parts.state = detail.long_name;
          } else if(utils.anyMatchInArray(detail.types, country)){
            parts.country = detail.long_name;
          }
        });
        return parts;
      };
      
      var array = [];
      results.forEach(function(result){
        var details = getDetails(result.address_components);
        if(utils.anyItemHasValue(details)){
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
    },
    getSource: function() {
      return this.layer.getSource();
    },
    addLayer: function() {
      var this_ = this, found = false;
      var map = this.geocoder.getMap();

      map.getLayers().forEach(function(layer){
        if (layer === this_.layer) found = true;
      });
      if (!found) {
        map.addLayer(this.layer);
      }
    },
    getProvider: function(options) {
      var
        params,
        provider = Geocoder.Nominatim.providers[options.provider],
        providers_names = Geocoder.Nominatim.providers.names,
        requires_key = [
          providers_names.MAPQUEST,
          providers_names.PELIAS,
          providers_names.GOOGLE
        ],
        langs_photon = ['de', 'it', 'fr', 'en']
      ;
      switch(options.provider) {
        case providers_names.OSM:
        case providers_names.MAPQUEST:
          params = {
            q: options.query,
            limit: options.limit,
            countrycodes: options.countrycodes,
            'accept-language': options.lang
          };
          provider.params = utils.mergeOptions(provider.params, params);
          break;
        case providers_names.PHOTON:
          options.lang = options.lang.toLowerCase();
          params = {
            q: options.query,
            limit: options.limit || provider.params.limit,
            lang: (langs_photon.indexOf(options.lang) > -1) ? 
              options.lang : provider.params.lang
          };
          provider.params = utils.mergeOptions(provider.params, params);
          break;
        case providers_names.GOOGLE:
          params = {
            address: options.query,
            language: options.lang
          };
          provider.params = utils.mergeOptions(provider.params, params);
          break;
        case providers_names.PELIAS:
          params = {
            text: options.query,
            size: options.limit
          };
          provider.params = utils.mergeOptions(provider.params, params);
          break;
      }
      if (requires_key.indexOf(options.provider) > -1) {
        provider.params.key = options.key;
      }
      return provider;
    }
  };
  Geocoder.EventType = {
    /**
     * Triggered when an address is chosen.
     */
    ADDRESSCHOSEN: 'addresschosen'
  };
  
  Geocoder.Nominatim.elements = {};
  Geocoder.Nominatim.providers = {
    names: {
      OSM: 'osm',
      MAPQUEST: 'mapquest',
      GOOGLE: 'google',
      PHOTON: 'photon',
      PELIAS: 'pelias'
    },
    osm: {
      url: 'http://nominatim.openstreetmap.org/search/',
      params: {
        format: 'json',
        q: '',
        addressdetails: 1,
        limit: 10,
        countrycodes: '',
        'accept-language': 'en-US'
      }
    },
    mapquest: {
      url: 'http://open.mapquestapi.com/nominatim/v1/search.php',
      params: {
        key: '',
        format: 'json',
        q: '',
        addressdetails: 1,
        limit: 10,
        countrycodes: '',
        'accept-language': 'en-US'
      }
    },
    google: {
      url: 'https://maps.googleapis.com/maps/api/geocode/json',
      params: {
        key: '',
        address: '',
        language: 'en-US'
      }
    },
    pelias: {
      url: 'https://search.mapzen.com/v1/search',
      params: {
        key: '',
        text: '',
        size: 10
      }
    },
    photon: {
      url: 'http://photon.komoot.de/api/',
      params: {
        q: '',
        limit: 10,
        lang: 'en'
      }
    }
  };
  Geocoder.Nominatim.featureStyle = [
    new ol.style.Style({
      image: new ol.style.Icon({
        scale: 0.7,
        anchor: [0.5, 1],
        src: '//cdn.rawgit.com/jonataswalker/'
          + 'map-utils/master/images/marker.png'
      }),
      zIndex: 5
    }),
    new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({ color: [235, 235, 235, 1]}),
        stroke: new ol.style.Stroke({ color: [0, 0, 0, 1]}),
        radius: 5
      }),
      zIndex: 4
    })
  ];
  Geocoder.Nominatim.html = [
    '<div class="ol-geocoder-search ol-control">',
      '<button type="button" class="ol-geocoder-btn-search"></button>',
      '<input type="text"',
        ' class="ol-geocoder-input-search"',
        ' placeholder="Search">',
    '</div>',
    '<ul class="ol-geocoder-result"></ul>'
  ].join('');
})(Geocoder);

