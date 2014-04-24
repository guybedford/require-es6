/*
  SystemJS Formats

  Provides modular support for format detections.

  Also dynamically loads Traceur if ES6 syntax is found.

  Add a format with:
    System.formats.push('myformatname');
    System.format.myformat = {
      detect: function(source, load) {
        return false / depArray;
      },
      execute: function(load, deps) {
        return moduleObj; // (doesnt have to be a Module instance)
      }
    }

  The System.formats array sets the format detection order.
  
  See the AMD, global and CommonJS format extensions for examples.
*/
function formats(loader) {

  // a table of instantiating load records
  var instantiating = {};

  loader.format = {};
  loader.formats = [];

  if (typeof window != 'undefined') {
    var curScript = document.getElementsByTagName('script');
    curScript = curScript[curScript.length - 1];
    // set the path to traceur
    loader.paths['@traceur'] = curScript.getAttribute('data-traceur-src') || curScript.src.substr(0, curScript.src.lastIndexOf('/') + 1) + 'traceur.js';
  }

  // also in ESML, build.js
  var es6RegEx = /(?:^\s*|[}{\(\);,\n]\s*)(import\s+['"]|(import|module)\s+[^"'\(\)\n;]+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/;
  
  // es6 module forwarding - allow detecting without Traceur
  var aliasRegEx = /^\s*export\s*\*\s*from\s*(?:'([^']+)'|"([^"]+)")/;

  // module format hint regex
  var formatHintRegEx = /^(\s*(\/\*.*\*\/)|(\/\/[^\n]*))*(["']use strict["'];?)?["']([^'"]+)["'][;\n]/;

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var name = load.name || '';

    load.source = load.source || '';

    // set load.metadata.format from metadata or format hints in the source
    var format = load.metadata.format;
    if (!format) {
      var formatMatch = load.source.match(formatHintRegEx);
      if (formatMatch)
        format = load.metadata.format = formatMatch[5];
    }

    if (name == '@traceur')
      format = 'global';

    // es6 handled by core

    // support alias modules without needing Traceur
    var match;
    if (!loader.global.traceur && (format == 'es6' || !format) && (match = load.source.match(aliasRegEx))) {
      return {
        deps: [match[1] || match[2]],
        execute: function(depName) {
          return loader.get(depName);
        }
      };
    }

    if (format == 'es6' || !format && load.source.match(es6RegEx)) {
      // dynamically load Traceur if necessary
      if (!loader.global.traceur)
        return loader['import']('@traceur').then(function() {
          return loaderInstantiate.call(loader, load);
        });
      else
        return loaderInstantiate.call(loader, load);
    }

    // if it is shimmed, assume it is a global script

    if (load.metadata.exports || load.metadata.deps)
      format = 'global';

    // if we don't know the format, run detection first
    if (!format || !this.format[format])
      for (var i = 0; i < this.formats.length; i++) {
        var f = this.formats[i];
        var curFormat = this.format[f];
        if (curFormat.detect(load)) {
          format = f;
          break;
        }
      }

    var curFormat = this.format[format];

    // if we don't have a format or format rule, throw
    if (!format || !curFormat)
      throw new TypeError('No format found for ' + (format ? format : load.address));

    load.metadata.format = format;
	instantiating[load.name] = load;

    // now invoke format instantiation
    var deps = curFormat.deps(load);

    // remove duplicates from deps first
    for (var i = 0; i < deps.length; i++)
      if (lastIndexOf.call(deps, deps[i]) != i)
        deps.splice(i--, 1);

    return {
      deps: deps,
      execute: function() {
        var output = curFormat.execute.call(this, Array.prototype.splice.call(arguments, 0, arguments.length), load);
		delete instantiating[load.name];
        if (output instanceof loader.global.Module)
          return output;
        else
          return new loader.global.Module(output && output.__esModule ? output : { __useDefault: true, 'default': output });
      }
    };
  };
  var systemFormatNormalize = loader.normalize;
  loader.normalize = function(name, refererName, refererAdress) {
  	var load = instantiating[refererName],
  		format = load && this.format[load.metadata.format],
  		normalize = format && format.normalize;
  	if(normalize) {
  		return normalize.call(this, name, refererName, refererAdress, systemFormatNormalize);
  		if(res != null) {
  			return res;
  		}
  	} 
	return systemFormatNormalize.apply(this, arguments);
  	
  };


}
