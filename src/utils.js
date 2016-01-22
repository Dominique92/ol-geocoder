(function(window, document){
  
  var getXhr = function() {
    var xhr = false;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
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
  var encodeUrlXhr = function(url, data) {
    if(data && typeof(data) === 'object') {
      var str_data = utils.toQueryString(data);
      url += (/\?/.test(url) ? '&' : '?') + str_data;
    }
    return url;
  };
  
  Geocoder.Utils = {
    whiteSpaceRegex: /\s+/,
    toQueryString: function(obj){
      return Object.keys(obj).reduce(function(a, k) {
        a.push((typeof obj[k] === 'object') ?
          utils.toQueryString(obj[k]) :
          encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
        );
        return a;
      }, []).join('&');
    },
    json: function(url, data) {
      var
        xhr = getXhr(),
        when = {},
        onload = function() {
          if (xhr.status === 200) {
            when.ready.call(undefined, JSON.parse(xhr.response));
          }
        },
        onerror = function() {
          console.info('Cannot XHR ' + JSON.stringify(url));
        }
      ;
      url = encodeUrlXhr(url, data);
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept','application/json');
      xhr.onload = onload;
      xhr.onerror = onerror;
      xhr.onprogress = onprogress;
      xhr.send(null);
      
      return {
        when: function(obj) { when.ready = obj.ready; }
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
    isNumeric: function(str){
      return /^\d+$/.test(str);
    },
    classRegex: function(classname) {
      return new RegExp('(^|\\s+)' + classname + '(\\s+|$)');
    },
    /**
    * @param {Element|Array<Element>} element DOM node or array of nodes.
    * @param {String|Array<String>} classname Class or array of classes.
    * For example: 'class1 class2' or ['class1', 'class2']
    * @param {Number|undefined} timeout Timeout to remove a class.
    */
    addClass: function(element, classname, timeout){
      if(Array.isArray(element)){
        element.forEach(function(each){
          utils.addClass(each, classname);
        });
        return;
      }
      
      var 
        array = (Array.isArray(classname)) ? classname : classname.split(/\s+/),
        i = array.length
      ;
      while(i--){
        if(!utils.hasClass(element, array[i])) {
          utils._addClass(element, array[i], timeout);
        }
      }
    },
    _addClass: function(el, c, timeout){
      // use native if available
      if (el.classList) {
        el.classList.add(c);
      } else {
        el.className = (el.className + ' ' + c).trim();
      }
      
      if(timeout && utils.isNumeric(timeout)){
        window.setTimeout(function(){
          utils._removeClass(el, c);
        }, timeout);
      }
    },
    /**
    * @param {Element|Array<Element>} element DOM node or array of nodes.
    * @param {String|Array<String>} classname Class or array of classes.
    * For example: 'class1 class2' or ['class1', 'class2']
    * @param {Number|undefined} timeout Timeout to add a class.
    */
    removeClass: function(element, classname, timeout){
      if(Array.isArray(element)){
        element.forEach(function(each){
          utils.removeClass(each, classname, timeout);
        });
        return;
      }
      
      var 
        array = (Array.isArray(classname)) ? classname : classname.split(/\s+/),
        i = array.length
      ;
      while(i--){
        if(utils.hasClass(element, array[i])) {
          utils._removeClass(element, array[i], timeout);
        }
      }
    },
    _removeClass: function(el, c, timeout){
      if (el.classList){
        el.classList.remove(c);
      } else {
        el.className = (el.className.replace(utils.classRegex(c), ' ')).trim();
      }
      if(timeout && utils.isNumeric(timeout)){
        window.setTimeout(function() {
          utils._addClass(el, c);
        }, timeout);
      }
    },
    /**
    * @param {Element} element DOM node.
    * @param {String} classname Classname.
    * @return {Boolean}
    */
    hasClass: function(element, c) {
      // use native if available
      return (element.classList) ?
        element.classList.contains(c) : utils.classRegex(c).test(element.className);
    },
    /**
    * @param {Element|Array<Element>} element DOM node or array of nodes.
    * @param {String} classname Classe.
    */
    toggleClass: function(element, classname){
      if(Array.isArray(element)) {
        element.forEach(function(each) {
          utils.toggleClass(each, classname);
        });
        return;
      }
      
      // use native if available
      if(element.classList) {
        element.classList.toggle(classname);
      } else {
        if(utils.hasClass(element, classname)){
          utils._removeClass(element, classname);
        } else {
          utils._addClass(element, classname);
        }
      }
    },
    $: function(id){
      id = (id[0] === '#') ? id.substr(1, id.length) : id;
      return document.getElementById(id);
    },
    isElement: function(obj){
      // DOM, Level2
      if ("HTMLElement" in window) {
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
        elem = document.createElement(node[0]);
        
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
        elem = document.createElement(node);
      }
      elem.innerHTML = html;
      var frag = document.createDocumentFragment();
      
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
})(window, document);
