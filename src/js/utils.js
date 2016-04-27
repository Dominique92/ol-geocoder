/**
 * @module utils
 * All the helper functions needed in this project
 */
export default {
  toQueryString(obj) {
    return Object.keys(obj).reduce((a, k) => {
      a.push(
        typeof obj[k] === 'object' ?
          this.toQueryString(obj[k]) :
            encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
      );
      return a;
    }, []).join('&');
  },
  encodeUrlXhr(url, data) {
    if(data && typeof(data) === 'object') {
      const str_data = this.toQueryString(data);
      url += (/\?/.test(url) ? '&' : '?') + str_data;
    }
    return url;
  },
  json(url, data) {
    let xhr = new XMLHttpRequest(),
        when = {},
        onload = () => {
          if (xhr.status === 200) {
            when.ready.call(undefined, JSON.parse(xhr.response));
          }
        },
        onerror = () => {
          console.info('Cannot XHR ' + JSON.stringify(url));
        };
    url = this.encodeUrlXhr(url, data);
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept','application/json');
    xhr.onload = onload;
    xhr.onerror = onerror;
    xhr.send(null);
    
    return {
      when: obj => { when.ready = obj.ready; }
    };
  },
  now() {
    // Polyfill for window.performance.now()
    // @license http://opensource.org/licenses/MIT
    // copyright Paul Irish 2015
    // https://gist.github.com/paulirish/5438650
    if ('performance' in window == false) {
      window.performance = {};
    }
    
    Date.now = (Date.now || function () {  // thanks IE8
      return new Date().getTime();
    });
    
    if ('now' in window.performance == false) {
      
      let nowOffset = Date.now();
      
      if (performance.timing && performance.timing.navigationStart){
        nowOffset = performance.timing.navigationStart
      }
      
      window.performance.now = function now(){
        return Date.now() - nowOffset;
      }
    }
    
    return window.performance.now();
  },
  randomId(prefix) {
    const id = this.now().toString(36);
    return prefix ? prefix + id : id;
  },
  isNumeric(str) {
    return /^\d+$/.test(str);
  },
  classRegex(classname) {
    return new RegExp(`(^|\\s+) ${classname} (\\s+|$)`);
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to remove a class.
   */
  addClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach(each => { this.addClass(each, classname) });
      return;
    }
    
    const array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
    let i = array.length;
    
    while(i--) {
      if (!this.hasClass(element, array[i])) {
        this._addClass(element, array[i], timeout);
      }
    }
  },
  _addClass(el, c, timeout) {
    // use native if available
    if (el.classList) {
      el.classList.add(c);
    } else {
      el.className = (el.className +' '+ c).trim();
    }
    
    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(() => { this._removeClass(el, c) }, timeout);
    }
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to add a class.
   */
  removeClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach(each => { this.removeClass(each, classname, timeout) });
      return;
    }
    
    const array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
    let i = array.length;
    
    while(i--) {
      if (this.hasClass(element, array[i])) {
        this._removeClass(element, array[i], timeout);
      }
    }
  },
  _removeClass(el, c, timeout) {
    if (el.classList) {
      el.classList.remove(c);
    } else {
      el.className = (el.className.replace(this.classRegex(c), ' ')).trim();
    }
    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(() => {
        this._addClass(el, c);
      }, timeout);
    }
  },
  /**
   * @param {Element} element DOM node.
   * @param {String} classname Classname.
   * @return {Boolean}
   */
  hasClass(element, c) {
    // use native if available
    return (element.classList) ?
      element.classList.contains(c) : this.classRegex(c).test(element.className);
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String} classname Classe.
   */
  toggleClass(element, classname) {
    if (Array.isArray(element)) {
      element.forEach(each => { this.toggleClass(each, classname) });
      return;
    }
    
    // use native if available
    if (element.classList) {
      element.classList.toggle(classname);
    } else {
      if (this.hasClass(element, classname)) {
        this._removeClass(element, classname);
      } else {
        this._addClass(element, classname);
      }
    }
  },
  /**
   * @param {String} id DOM node id.
   * @return {Element} DOM node.
   */
  $(id) {
    id = (id[0] === '#') ? id.substr(1, id.length) : id;
    return document.getElementById(id);
  },
  isElement(obj) {
    // DOM, Level2
    if ('HTMLElement' in window) {
      return (!!obj && obj instanceof HTMLElement);
    }
    // Older browsers
    return (!!obj && typeof obj === 'object' && 
      obj.nodeType === 1 && !!obj.nodeName);
  },
  getAllChildren(node, tag) {
    return [].slice.call(node.getElementsByTagName(tag));
  },
  isEmpty(str) {
    return (!str || 0 === str.length);
  },
  emptyArray(array) {
    while(array.length) array.pop();
  },
  anyMatchInArray(source, target) {
    return source.some(each => target.indexOf(each) >= 0);
  },
  everyMatchInArray(arr1, arr2) {
    return arr2.every(each => arr1.indexOf(each) >= 0);
  },
  anyItemHasValue(obj, has = false) {
    for(let key in obj) {
      if(!this.isEmpty(obj[key])) {
        has = true;
      }
    }
    return has;
  },
  removeAllChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  },
  removeAll(collection) {
    let node;
    while ((node = collection[0])) {
      node.parentNode.removeChild(node);
    }
  },
  getChildren(node, tag) {
    return [].filter.call(node.childNodes, el => tag ? 
        el.nodeType == 1 && el.tagName.toLowerCase() == tag : el.nodeType == 1);
  },
  template(html, row) {
    return html.replace(/\{ *([\w_-]+) *\}/g, (html, key) => {
      let value = (row[key]  === undefined) ? '' : row[key];
      return this.htmlEscape(value);
    });
  },
  htmlEscape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  /**
  * Overwrites obj1's values with obj2's and adds 
  * obj2's if non existent in obj1
  * @returns obj3 a new object based on obj1 and obj2
  */
  mergeOptions(obj1, obj2) {
    let obj3 = {};
    for (let attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (let attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
  },
  createElement(node, html) {
    let elem;
    if (Array.isArray(node)) {
      elem = document.createElement(node[0]);
      
      if (node[1].id) elem.id = node[1].id;
      if (node[1].classname) elem.className = node[1].classname;
      
      if (node[1].attr) {
        let attr = node[1].attr;
        if (Array.isArray(attr)) {
          let i = -1;
          while(++i < attr.length) {
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
    let frag = document.createDocumentFragment();
    
    while (elem.childNodes[0]) {
      frag.appendChild(elem.childNodes[0]);
    }
    elem.appendChild(frag);
    return elem;
  },
  assert(condition, message = 'Assertion failed') {
    if (!condition) {
      if (typeof Error !== 'undefined') {
        throw new Error(message);
      }
      throw message; // Fallback
    }
  }
};
