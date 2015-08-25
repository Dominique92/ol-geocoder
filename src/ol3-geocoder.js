window.geocoder = {};
var geocoder = window.geocoder;
geocoder.Nominatim = function(opt_options) {

    var this_ = this;
    
    var defaults = {
        provider: 'osm',
        keepOpen: false,
        expanded_class: 'ol-geocoder-search-expanded'
    };
    
    this.options = this.Utils.mergeOptions(defaults, opt_options);

    this.options.address_css = {
        road: 'ol-geocoder-address-road',
        city: 'ol-geocoder-address-city',
        country: 'ol-geocoder-address-country'
    };
    
    this.feature_increment = 0;
    this.layer_name = 'geocoder-nominatim-' + 
        (new Date().getTime()).toString(36);
        
    this.vectorLayer = new ol.layer.Vector({
        name: this.layer_name,
        source: new ol.source.Vector()
    });
    
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'ol-geocoder-bt-search';
    
    this.input_search = document.createElement('input');
    this.input_search.type = 'text';
    this.input_search.className = 'ol-geocoder-input-search';
    
    this.control = document.createElement('div');
    this.control.className = 'ol-geocoder-search ol-control';
    this.control.appendChild(this.button);
    this.control.appendChild(this.input_search);
    
    this.result_container = document.createElement('ul');
    this.result_container.className = 'ol-geocoder-result';
    
    this.container = document.createElement('div');
    this.container.className = 'ol-geocoder';
    this.container.appendChild(this.control);
    this.container.appendChild(this.result_container);
    
    
    var openSearch = function() { this_.toggleExpand() };
    var query = function(evt){
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode == 13){ //enter key
            var q = this_.Utils.htmlEscape(this_.input_search.value);
            this_.query(q);
        }
    };
    
    this.input_search.addEventListener('keydown', query, false);
    
    this.button.addEventListener('click', openSearch, false);
    
    ol.control.Control.call(this, {
        element: this.container
    });
    //set event to be captured with 'change:geocoder'
    this.set('geocoder', '');
};
ol.inherits(geocoder.Nominatim, ol.control.Control);

geocoder.Nominatim.prototype.query = function(query){
    var
        this_ = this,
        input = this.input_search,
        provider = this.Utils.getNominatimProvider(
            this.options.provider, query
        );
        
    this.clearResults();
    this.Utils.addClass(input, 'ol-geocoder-input-search-loading');

    this.Utils.getJson(provider.url, provider.params, function(r){
        this_.Utils.removeClass(input, 'ol-geocoder-input-search-loading');
        var response;
        
        switch (this_.options.provider) {
            case 'osm':
            case 'mapquest':
                if(r.length > 0){
                    response = r;
                }
                break;
            case 'photon':
                if(r.features.length > 0){
                    response = this_.photonResponse(r.features);
                }
                break;
        }
        if(response){
            this_.createList(response);
            
            var canvas = this_.getMap().getTargetElement();
            
            //one-time fire click
            canvas.addEventListener('click', {
                handleEvent: function (evt) {
                    this_.clearResults(true);
                    canvas.removeEventListener(evt.type, this, false);
                }
            }, false);
        }
    });
};
geocoder.Nominatim.prototype.createList = function(response){
    var 
        this_ = this,
        li, ul = this.result_container;
    
    response.forEach(function(row) {
        var address = this_.addressTemplate(row);
        var html = '<a href="#">';
        html += address + '</a>';
        
        li = this_.Utils.createElement('li', html);
        
        li.addEventListener('click', function(evt){
            evt.preventDefault();
            this_.chosen(row, address);
        }, false);
        
        ul.appendChild(li);
    });
};
geocoder.Nominatim.prototype.chosen = function(place, address){
    
    if(this.options.keepOpen === false){
        this.clearResults(true);
    }
    
    var
        map = this.getMap(),
        coord = this.Utils.to3857([place.lon, place.lat]),
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
        });
    
    map.beforeRender(pan, zoom);
    map.getView().setCenter(coord);
    map.getView().setResolution(resolution);
    this.createFeature(obj);
};
geocoder.Nominatim.prototype.createFeature = function(obj){
    var
        fill = new ol.style.Fill({
            color:[235,235,235,1]
        }),
        stroke = new ol.style.Stroke({
            color:[0,0,0,1]
        }),
        style_marker = [
            new ol.style.Style({
                image: new ol.style.Icon({
                    scale: .7,
                    anchor: [0.5, 1],
                    src: '//raw.githubusercontent.com/jonataswalker/map-utils/master/images/marker.png'
                }), zIndex: 5
            }),
            new ol.style.Style({
                image: new ol.style.Circle({
                    fill: fill, stroke: stroke, radius: 5
                }), zIndex: 4
            })
        ];
    
    this.addLayer();
    var feature = new ol.Feature({
        address: obj.address,
        geometry: new ol.geom.Point(obj.coord)
    });
    var feature_id = this.featureId();
    var feature_style = this.options.featureStyle || style_marker;
    feature.setStyle(feature_style);
    feature.setId(feature_id);
    this.getSource().addFeature(feature);
    //dispatchEvent
    this.set('geocoder', feature_id);
};
geocoder.Nominatim.prototype.featureId = function(){
    ++this.feature_increment;
    return 'geocoder-'+this.feature_increment;
};
geocoder.Nominatim.prototype.photonResponse = function(features){
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
};
/*
 * Returns layer source
 */
geocoder.Nominatim.prototype.getSource = function() {
    return this.vectorLayer.getSource();
};
geocoder.Nominatim.prototype.addLayer = function(){
    var
        this_ = this,
        map = this.getMap(),
        found = false;

    map.getLayers().forEach(function(layer){
        if(layer.get('name') === this_.layer_name){
            found = true;
        }
    });
    if(found === false){
        map.addLayer(this.vectorLayer);
    }
};
geocoder.Nominatim.prototype.clearResults = function(collapse){
    if(collapse){ //clear and collapse
        return this.collapse(); 
    }
    while (this.result_container.firstChild) {
        this.result_container.removeChild(this.result_container.firstChild);
    }
};
geocoder.Nominatim.prototype.addressTemplate = function(row){
    
    var r = row.address, html = [];
    
    if (r.name) {
        html.push(
            '<span class="' + this.options.address_css.road +
            '">{name}</span>'
        );
    }
    if (r.road || r.building) {
        html.push(
            '<span class="' + this.options.address_css.road +
            '">{building} {road} {house_number}</span>'
        );
    }
    if (r.city || r.town || r.village) {
        html.push(
            '<span class="' + this.options.address_css.city +
            '">{postcode} {city} {town} {village}</span>'
        );
    }
    if (r.state || r.country) {
        html.push(
            '<span class="' + this.options.address_css.country +
            '">{state} {country}</span>'
        );
    }
    return this.Utils.template(html.join('<br/>'), r);
};
geocoder.Nominatim.prototype.toggleExpand = function(){
    if (this.Utils.hasClass(this.control, this.options.expanded_class)) {
        this.collapse();
    } else {
        this.expand();
    }
};
geocoder.Nominatim.prototype.expand = function(){
    this.Utils.addClass(this.control, this.options.expanded_class);
    var input = this.input_search;
    window.setTimeout(function(){input.focus()}, 100);
};
geocoder.Nominatim.prototype.collapse = function(){
    this.input_search.value = "";
    this.input_search.blur();
    this.Utils.removeClass(this.control, this.options.expanded_class);
    this.clearResults();
};

geocoder.Nominatim.prototype.Utils = {
    getJson: function(url, data, callback) {
        
        // Must encode data
        if(data && typeof(data) === 'object') {
            var y = '', e = encodeURIComponent;
            for (x in data) {
                y += '&' + e(x) + '=' + e(data[x]);
            }
            data = y.slice(1);
            url += (/\?/.test(url) ? '&' : '?') + data;
        }
        
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, true);
        //xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xmlHttp.setRequestHeader('Accept', 'application/json, text/javascript');
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState != 4){
                return;
            }
            if (xmlHttp.status != 200 && xmlHttp.status != 304){
                callback('');
                return;
            }
            callback(JSON.parse(xmlHttp.response));
        };
        xmlHttp.send(null);
    },
    getNominatimProvider: function(key, query, lang, limit){
        var providers = {
            osm: {
                url: 'http://nominatim.openstreetmap.org/search/',
                params: {
                    format: 'json',
                    q: query,
                    addressdetails: 1,
                    limit: limit || 10,
                    'accept-language': lang || 'en-US'
                }
            },
            mapquest: {
                url: 'http://open.mapquestapi.com/nominatim/v1/search.php',
                params: {
                    format: 'json',
                    q: query,
                    addressdetails: 1,
                    limit: limit || 10,
                    'accept-language': lang || 'en-US'
                }
            },
            photon: {
                url: 'http://photon.komoot.de/api/',
                params: {
                    q: query,
                    limit: limit || 10,
                    lang: lang || 'en'
                }
            }
        };
        return providers[key];
    },
    to3857: function(coord){
        return ol.proj.transform(
            [parseFloat(coord[0]), parseFloat(coord[1])], 'EPSG:4326', 'EPSG:3857'
        );
    },
    to4326: function(coord){
        return ol.proj.transform(
            [parseFloat(coord[0]), parseFloat(coord[1])], 'EPSG:3857', 'EPSG:4326'
        );
    },
    createElement: function(node, html){
        var frag = document.createDocumentFragment();
        
        var elem = document.createElement(node);
        elem.innerHTML = html;
        
        while (elem.childNodes[0]) {
            frag.appendChild(elem.childNodes[0]);
        }
        elem.appendChild(frag);
        return elem;
    },
    template: function(html, row){
        var this_ = this;
        
        return html.replace(/\{ *([\w_]+) *\}/g, function (html, key) {
            var value = (row[key]  === undefined) ? '' : row[key];
            return this_.htmlEscape(value);
        });
    },
    htmlEscape: function(str){
        return String(str).replace(/&/g, '&amp;')
                .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
    },
    hasClass: function(element, classname){
        return element.className.split(/\s/).indexOf(classname) != -1;
    },
    addClass: function(element, classname){
        var 
            rspaces = /\s+/, c,
            classNames = (classname || "").split(rspaces),
            className = " " + element.className + " ",
            setClass = element.className;
        
        for (c = 0; c < classNames.length; c++) {
            if (className.indexOf(" " + classNames[c] + " ") < 0)
                setClass += " " + classNames[c];
        }
        element.className = setClass.replace(/^\s+|\s+$/g,'');
    },
    removeClass: function(element, classname){
        var
            rspaces = /\s+/, c, rclass = /[\n\t]/g,
            classNames = (classname || "").split(rspaces),
            className = (" " + element.className + " ").replace(rclass, " ");
        
        for (c = 0; c < classNames.length; c++) {
            className = className.replace(" " + classNames[c] + " ", " ");
        }
        element.className = className.replace(/^\s+|\s+$/g,'');
    },
    /**
     * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
     * @returns obj3 a new object based on obj1 and obj2
     */
    mergeOptions: function(obj1, obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }
};