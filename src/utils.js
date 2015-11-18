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
