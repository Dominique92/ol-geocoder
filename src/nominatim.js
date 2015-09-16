(function(Geocoder){
    'use strict';
    
    Geocoder.Nominatim = function(geocoder, opt_options){
        this.geocoder = geocoder;
        this.feature_increment = 0;
        this.layer_name = 'geocoder-nominatim-' + (new Date().getTime()).toString(36);
        this.layer = new ol.layer.Vector({
            name: this.layer_name,
            source: new ol.source.Vector()
        });
        var defaults = {
            provider: 'osm',
            keepOpen: false
        };
        
        this.options = utils.mergeOptions(defaults, opt_options);
        this.constants = {
            class_container: 'ol-geocoder',
            expanded_class: 'ol-geocoder-search-expanded',
            road: 'ol-geocoder-road',
            city: 'ol-geocoder-city',
            country: 'ol-geocoder-country'
        };

        var container = this.createControl();
        this.els = Geocoder.Nominatim.elements;
        
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
            return container;
        },
        setListeners: function(){
            var
                this_ = this,
                openSearch = function() {
                    utils.hasClass(this_.els.control, this_.constants.expanded_class)
                        ? this_.collapse()
                        : this_.expand();
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
        expand: function(){
            utils.removeClass(this.els.input_search, 'ol-geocoder-loading');
            utils.addClass(this.els.control, this.constants.expanded_class);
            var input = this.els.input_search;
            window.setTimeout(function(){
                input.focus();
            }, 100);
        },
        collapse: function(){
            this.els.input_search.value = "";
            this.els.input_search.blur();
            utils.removeClass(this.els.control, this.constants.expanded_class);
            this.clearResults();
        },
        clearResults: function(collapse){
            collapse 
                ? this.collapse() //clear and collapse
                : utils.removeAllChildren(this.els.result_container);
        },
        query: function(query){
            var
                this_ = this,
                input = this.els.input_search,
                providers_names = Geocoder.Nominatim.providers.names,
                provider = this.getProvider({
                    provider: this.options.provider,
                    key: this.options.key,
                    query: query,
                    lang: this.options.lang,
                    limit: this.options.limit
                })
            ;
                
            this.clearResults();
            utils.addClass(input, 'ol-geocoder-loading');

            utils.json(provider.url, provider.params).when({
                ready: function(){
                    utils.removeClass(input, 'ol-geocoder-loading');
                    var response;
                    
                    switch (this_.options.provider) {
                        case providers_names.OSM:
                        case providers_names.MAPQUEST:
                            response = this.response.length > 0 
                                ? this.response 
                                : undefined;
                            break;
                        case providers_names.PHOTON:
                            response = this.response.features.length > 0 
                                ? this_.photonResponse(this.response.features)
                                : undefined;
                            break;
                    }
                    if(response){
                        this_.createList(response);
                        
                        var canvas = this_.geocoder.getMap().getTargetElement();
                        
                        //one-time fire click
                        canvas.addEventListener('click', {
                            handleEvent: function (evt) {
                                this_.clearResults(true);
                                canvas.removeEventListener(evt.type, this, false);
                            }
                        }, false);
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
            var 
                this_ = this,
                ul = this.els.result_container
            ;
            
            response.forEach(function(row) {
                var
                    address = this_.addressTemplate(row),
                    html = '<a href="#">' + address + '</a>',
                    li = utils.createElement('li', html)
                ;
                li.addEventListener('click', function(evt){
                    evt.preventDefault();
                    this_.chosen(row, address);
                }, false);
                
                ul.appendChild(li);
            });
        },
        addressTemplate: function(row){
            
            var r = row.address, html = [];
            
            if (r.name) {
                html.push(
                    '<span class="' + this.constants.road + '">{name}</span>'
                );
            }
            if (r.road || r.building) {
                html.push(
                    '<span class="' + this.constants.road +
                    '">{building} {road} {house_number}</span>'
                );
            }
            if (r.city || r.town || r.village) {
                html.push(
                    '<span class="' + this.constants.city +
                    '">{postcode} {city} {town} {village}</span>'
                );
            }
            if (r.state || r.country) {
                html.push(
                    '<span class="' + this.constants.country +
                    '">{state} {country}</span>'
                );
            }
            return utils.template(html.join('<br/>'), r);
        },
        chosen: function(place, address){
            
            if(this.options.keepOpen === false){
                this.clearResults(true);
            }
            
            var
                map = this.geocoder.getMap(),
                coord = utils.to3857([place.lon, place.lat]),
                resolution = 2.388657133911758, duration = 500,
                obj = {
                    coord: coord,
                    address: address
                },
                pan = ol.animation.pan({
                    duration: duration,
                    source: map.getView().getCenter()
                }),
                zoom = ol.animation.zoom({
                    duration: duration,
                    resolution: map.getView().getResolution()
                })
            ;
            
            map.beforeRender(pan, zoom);
            map.getView().setCenter(coord);
            map.getView().setResolution(resolution);
            this.createFeature(obj);
        },
        createFeature: function(obj){
            var
                feature = new ol.Feature({
                    address: obj.address,
                    geometry: new ol.geom.Point(obj.coord)
                }),
                feature_id = this.featureId(),
                feature_style = this.options.featureStyle || Geocoder.Nominatim.featureStyle
            ;
            
            this.addLayer();
            feature.setStyle(feature_style);
            feature.setId(feature_id);
            this.getSource().addFeature(feature);
            //dispatchEvent
            this.geocoder.set('geocoder', feature_id);
        },
        featureId: function(){
            return 'geocoder-' + (++this.feature_increment);
        },
        photonResponse: function(features){
            var array = features.map(function(feature){
                var obj = {
                    lon: feature.geometry.coordinates[0],
                    lat: feature.geometry.coordinates[1],
                    address: {
                        name: feature.properties.name,
                        city: feature.properties.city,
                        state: feature.properties.state,
                        country: feature.properties.country
                    }
                };
                return obj;
            });
            return array;
        },
        getSource: function() {
            return this.layer.getSource();
        },
        addLayer: function(){
            var
                this_ = this,
                map = this.geocoder.getMap(),
                found
            ;

            map.getLayers().forEach(function(layer){
                found = (layer === this_.layer) ? true : false;
            });
            if(found === false){
                map.addLayer(this.layer);
            }
        },
        getProvider: function(options){
            var
                provider = Geocoder.Nominatim.providers[options.provider],
                providers_names = Geocoder.Nominatim.providers.names,
                langs_photon = ['de', 'it', 'fr', 'en']
            ;
            provider.params.q = options.query;
            provider.params.limit = options.limit || provider.params.limit;
            
            //defining key
            if(options.provider == providers_names.MAPQUEST){
                provider.params.key = options.key;
            }
            
            //defining language
            if(options.provider == providers_names.PHOTON){
                options.lang = options.lang.toLowerCase();
                
                provider.params.lang = (langs_photon.indexOf(options.lang) > -1) 
                    ? options.lang
                    : provider.params.lang;
            } else {
                provider.params['accept-language'] =
                    options.lang || provider.params['accept-language'];
            }
            
            return provider;
        }
    };
    
    Geocoder.Nominatim.elements = {};
    Geocoder.Nominatim.providers = {
        names: {
            OSM: 'osm',
            MAPQUEST: 'mapquest',
            PHOTON: 'photon'
        },
        osm: {
            url: 'http://nominatim.openstreetmap.org/search/',
            params: {
                format: 'json',
                q: '',
                addressdetails: 1,
                limit: 10,
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
                'accept-language': 'en-US'
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
                scale: .7,
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
            '<button class="ol-geocoder-btn-search"></button>',
            '<input type="text" class="ol-geocoder-input-search">',
        '</div>',
        '<ul class="ol-geocoder-result"></ul>'
    ].join('');
})(Geocoder);