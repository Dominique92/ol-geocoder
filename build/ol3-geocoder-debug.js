(function(win, doc){
    'use strict';
    
    this.Geocoder = (function(){
        
        /**
 * @constructor
 * @extends {ol.control.Control}
 * @fires change:geocoder
 * @param {string|undefined} control_type Nominatim|Reverse.
 * @param {object|undefined} opt_options Options.
 */
var Geocoder = function(control_type, opt_options){
    //some checks before continue
    utils.assert(
        typeof control_type === "string" || typeof control_type === "undefined",
        '@param `control_type` should be string|undefined type!'
    );
    utils.assert(
        typeof opt_options === "object" || typeof opt_options === "undefined",
        '@param `opt_options` should be object|undefined type!'
    );
    
    control_type = control_type || 'nominatim';
    
    var nominatim = new Geocoder.Nominatim(this, opt_options);
    this.layer = nominatim.layer;
    
    ol.control.Control.call(this, {
        element: nominatim.els.container
    });
    
    //set event to be captured with 'change:geocoder'
    this.set('geocoder', '');
};
ol.inherits(Geocoder, ol.control.Control);

/**
 * @return {ol.source.Vector} Returns the source created by this control
 */
Geocoder.prototype.getSource = function(){
    return this.layer.getSource();
};


/**
 * @return {ol.layer.Vector} Returns the layer created by this control
 */
Geocoder.prototype.getLayer = function(){
    return this.layer;
};

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
            key: '',
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
            //set placeholder from options
            Geocoder.Nominatim.elements.input_search.placeholder =
                this.options.placeholder;

            return container;
        },
        setListeners: function(){
            var
                this_ = this,
                openSearch = function() {
                    if(utils.hasClass(this_.els.control,
                        this_.constants.expanded_class)) {
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
                    limit: options.limit
                })
            ;
                
            this.clearResults();
            utils.addClass(input, 'ol-geocoder-loading');

            utils.json(provider.url, provider.params).when({
                ready: function(){
                    if(options.debug){
                        log(this.response);
                    }
                    
                    utils.removeClass(input, 'ol-geocoder-loading');
                    
                    //will be fullfiled according to provider
                    var response;
                    
                    switch (this_.options.provider) {
                        case providers_names.OSM:
                        case providers_names.MAPQUEST:
                            response = (this.response.length > 0) ?
                                this_.mapquestResponse(this.response) : undefined;
                            break;
                        case providers_names.PHOTON:
                            response = (this.response.features.length > 0) ?
                                this_.photonResponse(this.response.features)
                                : undefined;
                            break;
                        case providers_names.GOOGLE:
                            response = (this.response.results.length > 0) ?
                                this_.googleResponse(this.response.results)
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
        chosen: function(place, address_html, address_obj, address_original){
            
            if(this.options.keepOpen === false){
                this.clearResults(true);
            }
            
            var
                map = this.geocoder.getMap(),
                coord = utils.to3857([place.lon, place.lat]),
                resolution = 2.388657133911758, duration = 500,
                obj = {
                    coord: coord,
                    address_html: address_html,
                    address_obj: address_obj,
                    address_original: address_original
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
            //dispatchEvent
            this.geocoder.set('geocoder', feature_id);
        },
        mapquestResponse: function(results){
            var array = results.map(function(result){
                return {
                    lon: result.lon,
                    lat: result.lat,
                    address: {
                        name: result.address.neighbourhood || '',
                        road: result.address.road || '',
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
                city = [
                    'locality'
                ],
                state = [
                    'administrative_area_level_1'
                ],
                country = [
                    'country'
                ]
            ;
            
            /*
             * @param {Array} details - address_components
             */
            var getDetails = function(details){
                var parts = {
                    name: '',
                    road: '',
                    city: '',
                    state: '',
                    country: ''
                };
                details.forEach(function(detail){
                    if(utils.anyMatchInArray(detail.types, name)){
                        parts.name = detail.long_name;
                    } else if(utils.anyMatchInArray(detail.types, road)){
                        parts.road = detail.long_name;
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
                requires_key = [
                    providers_names.MAPQUEST,
                    providers_names.GOOGLE
                ],
                langs_photon = ['de', 'it', 'fr', 'en']
            ;
            
            if(options.provider == providers_names.MAPQUEST
                || options.provider == providers_names.OSM){
                
                provider.params.q = options.query;
                provider.params.limit = 
                    options.limit || provider.params.limit;
                provider.params['accept-language'] =
                    options.lang || provider.params['accept-language'];
            
                if(options.provider == providers_names.MAPQUEST){
                    provider.params.key = options.key;
                }

            } else if(options.provider == providers_names.PHOTON){
                
                provider.params.q = options.query;
                provider.params.limit = 
                    options.limit || provider.params.limit;
                
                options.lang = options.lang.toLowerCase();
                provider.params.lang = (langs_photon.indexOf(options.lang) > -1) 
                    ? options.lang
                    : provider.params.lang;
                    
            } else if(options.provider == providers_names.GOOGLE){
                
                provider.params.key = options.key;
                provider.params.address = options.query;
                provider.params.language =
                    options.lang || provider.params.language;
                
            }
            
            return provider;
        }
    };
    
    Geocoder.Nominatim.elements = {};
    Geocoder.Nominatim.providers = {
        names: {
            OSM: 'osm',
            MAPQUEST: 'mapquest',
            GOOGLE: 'google',
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
        google: {
            url: 'https://maps.googleapis.com/maps/api/geocode/json',
            params: {
                key: '',
                address: '',
                language: 'en-US'
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
            '<button class="ol-geocoder-btn-search"></button>',
            '<input type="text"',
                ' class="ol-geocoder-input-search"',
                ' placeholder="Search"',
            '>',
        '</div>',
        '<ul class="ol-geocoder-result"></ul>'
    ].join('');
})(Geocoder);

(function(win, doc){
    
    var getXhr = function() {
        var xhr = false;
        if (win.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (win.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch(e) {
                try {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                } catch(e) {
                    xhr = false;
                }
            }
        }
        return xhr;
    };
    
    Geocoder.Utils = {
        whiteSpaceRegex: /\s+/,
        json: function(url, data) {
            // Must encode data
            if(data && typeof(data) === 'object') {
                var y = '', e = encodeURIComponent;
                for (var x in data) {
                    y += '&' + e(x) + '=' + e(data[x]);
                }
                data = y.slice(1);
                url += (/\?/.test(url) ? '&' : '?') + data;
            }
            
            var xhr = getXhr(), when = {};
            xhr.open("GET", url, true);
            xhr.setRequestHeader("Accept","application/json");
            xhr.onload = onload;
            xhr.onerror = onerror;
            xhr.onprogress = onprogress;
            xhr.send(null);
            
            function onload() {
                if (xhr.status === 200) {
                    when.ready.call({
                        response: JSON.parse(xhr.response)
                    });
                }
            }
            function onerror() {
                when.error.call({
                    response: "Can't xhr on url: " + url
                });
            }
            function onprogress() {}
            
            return {
                when: function(obj){
                    when.ready = obj.ready;
                    when.error = obj.error;
                }
            };
        },
        randomId: function(prefix){
            var id = (new Date().getTime()).toString(36);
            return (prefix) ? prefix + id : id;
        },
        to3857: function(coord){
            return ol.proj.transform(
                [parseFloat(coord[0]), parseFloat(coord[1])],
                'EPSG:4326', 'EPSG:3857'
            );
        },
        to4326: function(coord){
            return ol.proj.transform(
                [parseFloat(coord[0]), parseFloat(coord[1])],
                'EPSG:3857', 'EPSG:4326'
            );
        },
        classRegex: function(classname) {
            return new RegExp('(^|\\s+)' + classname + '(\\s+|$)');
        },
        _addClass: function(el, c){
            if (el.classList)
                el.classList.add(c);
            else
                el.className = (el.className + ' ' + c).trim();
        },
        addClass: function(el, classname){
            if(Array.isArray(el)){
                el.forEach(function(each){
                    utils.addClass(each, classname);
                });
                return;
            }
            
            //classname can be ['class1', 'class2'] or 'class1 class2'
            var 
                array = (Array.isArray(classname)) ?
                    classname : classname.split(utils.whiteSpaceRegex),
                i = array.length
            ;
            while(i--){
                if(!utils.hasClass(el, array[i])) {
                    utils._addClass(el, array[i]);
                }
            }
        },
        _removeClass: function(el, c){
            if (el.classList){
                el.classList.remove(c);
            } else {
                el.className = 
                    (el.className.replace(utils.classReg(c), ' ')).trim();
            }
        },
        removeClass: function(el, classname){
            if(Array.isArray(el)){
                el.forEach(function(each){
                    utils.removeClass(each, classname);
                });
                return;
            }
            
            //classname can be ['class1', 'class2'] or 'class1 class2'
            var 
                array = (Array.isArray(classname)) ?
                classname : classname.split(utils.whiteSpaceRegex),
                i = array.length
            ;
            while(i--){
                if(utils.hasClass(el, array[i])) {
                    utils._removeClass(el, array[i]);
                }
            }
        },
        hasClass: function(el, c){
            return (el.classList) ? 
                el.classList.contains(c) : utils.classReg(c).test(el.className);
        },
        toggleClass: function(el, c){
            if(Array.isArray(el)){
                el.forEach(function(each){
                    utils.toggleClass(each, c);
                });
                return;
            }
            
            if(el.classList) {
                el.classList.toggle(c);
            } else {
                if(utils.hasClass(el, c)){
                    utils._removeClass(el, c);
                } else {
                    utils._addClass(el, c);
                }
            }
        },
        $: function(id){
            id = (id[0] === '#') ? id.substr(1, id.length) : id;
            return doc.getElementById(id);
        },
        isElement: function(obj){
            // DOM, Level2
            if ("HTMLElement" in win) {
                return (!!obj && obj instanceof HTMLElement);
            }
            // Older browsers
            return (!!obj && typeof obj === "object" && 
                obj.nodeType === 1 && !!obj.nodeName);
        },
        getAllChildren: function(node, tag){
            return [].slice.call(node.getElementsByTagName(tag));
        },
        isEmpty: function(str){
            return (!str || 0 === str.length);
        },
        emptyArray: function(array){
            while(array.length) array.pop();
        },
        anyMatchInArray: function(source, target) {
            return source.some(function(each){
                return target.indexOf(each) >= 0;
            });
        },
        everyMatchInArray: function(arr1, arr2) {
            return arr2.every(function(each){
                return arr1.indexOf(each) >= 0;
            });
        },
        anyItemHasValue: function(obj){
            var has = false;
            for(var key in obj){
                if(!utils.isEmpty(obj[key])){
                    has = true;
                }
            }
            return has;
        },
        removeAllChildren: function(node) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        },
        removeAll: function(collection) {
            var node;
            while ((node = collection[0])) {
                node.parentNode.removeChild(node);
            }
        },
        getChildren: function(node, tag){
            return [].filter.call(node.childNodes, function(el) {
                return (tag) ? 
                    el.nodeType == 1 && el.tagName.toLowerCase() == tag
                    :
                    el.nodeType == 1;
            });
        },
        template: function(html, row){
            var this_ = this;
            
            return html.replace(/\{ *([\w_-]+) *\}/g, function (html, key) {
                var value = (row[key]  === undefined) ? '' : row[key];
                return this_.htmlEscape(value);
            });
        },
        htmlEscape: function(str){
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, "&#039;");
        },
        /**
        * Overwrites obj1's values with obj2's and adds 
        * obj2's if non existent in obj1
        * @returns obj3 a new object based on obj1 and obj2
        */
        mergeOptions: function(obj1, obj2){
            var obj3 = {};
            for (var attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
            for (var attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
            return obj3;
        },
        createElement: function(node, html){
            var elem;
            if(Array.isArray(node)){
                elem = doc.createElement(node[0]);
                
                if(node[1].id) {
                    elem.id = node[1].id;
                }
                if(node[1].classname) {
                    elem.className = node[1].classname;
                }
                
                if(node[1].attr){
                    var attr = node[1].attr;
                    if(Array.isArray(attr)){
                        var i = -1;
                        while(++i < attr.length){
                            elem.setAttribute(attr[i].name, attr[i].value);
                        }
                    } else {
                        elem.setAttribute(attr.name, attr.value);
                    }
                }
            } else{
                elem = doc.createElement(node);
            }
            elem.innerHTML = html;
            var frag = doc.createDocumentFragment();
            
            while (elem.childNodes[0]) {
                frag.appendChild(elem.childNodes[0]);
            }
            elem.appendChild(frag);
            return elem;
        },
        assert: function(condition, message) {
            if (!condition) {
                message = message || "Assertion failed";
                if (typeof Error !== "undefined") {
                    throw new Error(message);
                }
                throw message; // Fallback
            }
        },
        assertEqual: function(a, b, message) {
            if (a != b) {
                throw new Error(message + " mismatch: " + a + " != " + b);
            }
        }
    };
})(win, doc);

        
        return Geocoder;
    })();
    var
        log = function(m){console.info(m);},
        utils = Geocoder.Utils
    ;
}).call(this, window, document);