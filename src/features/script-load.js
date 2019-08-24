/*
 * Supports loading System.register via script tag injection
 */

import { systemJSPrototype } from '../system-core';

const systemRegister = systemJSPrototype.register;
systemJSPrototype.register = function (deps, declare) {
  systemRegister.call(this, deps, declare);
};

systemJSPrototype.instantiate = function (url, firstParentUrl) {
  const loader = this;
  if (url.substr(-5) === '.json') {
    return loadDynamicModule(url, function (_export, source) {
      _export('default', JSON.parse(source));
    });
  } else if (url.substr(-4) === '.css') {
    return loadDynamicModule(url, function (_export, source) {
      // Relies on a Constructable Stylesheet polyfill
      const stylesheet = new CSSStyleSheet();
      stylesheet.replaceSync(source);
      _export('default', stylesheet);
    });
  } else {
    return new Promise(function (resolve, reject) {
      let err;

      function windowErrorListener(evt) {
        if (evt.filename === url)
          err = evt.error;
      }

      window.addEventListener('error', windowErrorListener);

      const script = document.createElement('script');
      script.charset = 'utf-8';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.addEventListener('error', function () {
        window.removeEventListener('error', windowErrorListener);
        reject(Error('Error loading ' + url + (firstParentUrl ? ' from ' + firstParentUrl : '')));
      });
      script.addEventListener('load', function () {
        window.removeEventListener('error', windowErrorListener);
        document.head.removeChild(script);
        // Note that if an error occurs that isn't caught by this if statement,
        // that getRegister will return null and a "did not instantiate" error will be thrown.
        if (err) {
          reject(err);
        }
        else {
          resolve(loader.getRegister());
        }
      });
      script.src = url;
      document.head.appendChild(script);
    });
  }
};

function loadDynamicModule (url, createExec) {
  return fetch(url).then(function (resp) {
    return resp.text();
  }).then(function (source) {
    return [[], function (_export) {
      return {execute: createExec(_export, source)};
    }];
  });
}
