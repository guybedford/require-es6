import { errMsg } from '../err-msg.js';
import { resolveUrl } from '../common.js';
import { importMap } from '../features/import-maps.js';
import { systemJSPrototype } from '../system-core.js';

/*
 * Fetch loader, sets up shouldFetch and fetch hooks
 */
systemJSPrototype.shouldFetch = function () {
  return false;
};
if (typeof fetch !== 'undefined')
  systemJSPrototype.fetch = fetch;

var instantiate = systemJSPrototype.instantiate;
var jsContentTypeRegEx = /^(text|application)\/(x-)?javascript(;|$)/;
systemJSPrototype.instantiate = function (url, parent) {
  var loader = this;
  if (!this.shouldFetch(url))
    return instantiate.apply(this, arguments);
  return this.fetch(url, {
    credentials: 'same-origin',
    integrity: importMap.integrity[url]
  })
  .then(function (res) {
    if (!res.ok)
      throw Error(errMsg(7, process.env.SYSTEM_PRODUCTION ? [res.status, res.statusText, url, parent].join(', ') : res.status + ' ' + res.statusText + ', loading ' + url + (parent ? ' from ' + parent : '')));
    var contentType = res.headers.get('content-type');
    if (!contentType || !jsContentTypeRegEx.test(contentType))
      throw Error(errMsg(4, process.env.SYSTEM_PRODUCTION ? contentType : 'Unknown Content-Type "' + contentType + '", loading ' + url + (parent ? ' from ' + parent : '')));
    return res.text().then(function (source) {
      var sourceMappingIndex = source.lastIndexOf('//# sourceMappingURL=');
      if (sourceMappingIndex > -1) {
        var sourceMappingEnd = source.indexOf('\n', sourceMappingIndex);
        var sourceMapping = source.slice(sourceMappingIndex, sourceMappingEnd > -1 ? sourceMappingEnd : undefined);
        source += '\n//# sourceMappingURL=' + resolveUrl(sourceMapping.slice(21), url);
      }
      source += '\n//# sourceURL=' + url;
      (0, eval)(source);
      return loader.getRegister();
    });
  });
};
