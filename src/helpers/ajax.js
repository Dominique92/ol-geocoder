export function json(obj) {
  return new Promise((resolve, reject) => {
    const url = encodeUrlXhr(obj.url, obj.data);
    const config = {
      method: 'GET',
      mode: 'cors',
      credentials: 'same-origin',
    };

    if (obj.jsonp) {
      jsonp(url, obj.callbackName, resolve);
    } else {
      fetch(url, config)
        .then((r) => r.json())
        .then(resolve)
        .catch(reject);
    }
  });
}

function toQueryString(obj) {
  return Object.keys(obj)
    .reduce((acc, k) => {
      acc.push(
        typeof obj[k] === 'object'
          ? toQueryString(obj[k])
          : `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`
      );

      return acc;
    }, [])
    .join('&');
}

function encodeUrlXhr(url, data) {
  if (data && typeof data === 'object') {
    url += (/\?/u.test(url) ? '&' : '?') + toQueryString(data);
  }

  return url;
}

function jsonp(url, key, callback) {
  // https://github.com/Fresheyeball/micro-jsonp/blob/master/src/jsonp.js
  const { head } = document;
  const script = document.createElement('script');
  // generate minimally unique name for callback function
  const callbackName = `f${Math.round(Math.random() * Date.now())}`;

  // set request url
  script.setAttribute(
    'src',
    // add callback parameter to the url
    //    where key is the parameter key supplied
    //    and callbackName is the parameter value
    `${url + (url.indexOf('?') > 0 ? '&' : '?') + key}=${callbackName}`
  );

  // place jsonp callback on window,
  //  the script sent by the server should call this
  //  function as it was passed as a url parameter
  window[callbackName] = (data) => {
    window[callbackName] = undefined;

    // clean up script tag created for request
    setTimeout(() => head.removeChild(script), 0);

    // hand data back to the user
    callback(data);
  };

  // actually make the request
  head.append(script);
}
