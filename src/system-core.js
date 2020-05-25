/*
 * SystemJS Core
 * 
 * Provides
 * - System.import
 * - System.register support for
 *     live bindings, function hoisting through circular references,
 *     reexports, dynamic import, import.meta.url, top-level await
 * - System.getRegister to get the registration
 * - Symbol.toStringTag support in Module objects
 * - Hookable System.createContext to customize import.meta
 * - System.onload(err, id, deps) handler for tracing / hot-reloading
 * 
 * Core comes with no System.prototype.resolve or
 * System.prototype.instantiate implementations
 */
import { global, hasSymbol } from './common.js';
import { errMsg } from './err-msg.js';
export { systemJSPrototype, REGISTRY }

var toStringTag = hasSymbol && Symbol.toStringTag;
var REGISTRY = hasSymbol ? Symbol() : '@';

function SystemJS () {
  this[REGISTRY] = {};
}

var systemJSPrototype = SystemJS.prototype;

systemJSPrototype.import = function (id, parentUrl) {
  var loader = this;
  return Promise.resolve(loader.prepareImport())
  .then(function() {
    return loader.resolve(id, parentUrl);
  })
  .then(function (id) {
    var load = getOrCreateLoad(loader, id);
    return load.C || topLevelLoad(loader, load);
  });
};

// Hookable createContext function -> allowing eg custom import meta
systemJSPrototype.createContext = function (parentId) {
  return {
    url: parentId
  };
};

// onLoad(err, id, deps) provided for tracing / hot-reloading
if (!process.env.SYSTEM_PRODUCTION)
  systemJSPrototype.onload = function () {};
function loadToId (load) {
  return load.id;
}
function triggerOnload (loader, load, err) {
  loader.onload(err, load.id, load.d && load.d.map(loadToId));
  if (err)
    throw err;
}

var lastRegister;
systemJSPrototype.register = function (deps, declare) {
  lastRegister = [deps, declare];
};

/*
 * getRegister provides the last anonymous System.register call
 */
systemJSPrototype.getRegister = function () {
  var _lastRegister = lastRegister;
  lastRegister = undefined;
  return _lastRegister;
};

function getOrCreateLoad (loader, id, firstParentUrl) {
  var load = loader[REGISTRY][id];
  if (load)
    return load;

  var importerSetters = [];
  var ns = Object.create(null);
  if (toStringTag)
    Object.defineProperty(ns, toStringTag, { value: 'Module' });
  
  var instantiatePromise = Promise.resolve()
  .then(function () {
    return loader.instantiate(id, firstParentUrl);
  })
  .then(function (registration) {
    if (!registration)
      throw Error(errMsg(2, process.env.SYSTEM_PRODUCTION ? id : 'Module ' + id + ' did not instantiate'));
    function _export (name, value) {
      // note if we have hoisted exports (including reexports)
      load.h = true;
      var changed = false;
      if (typeof name !== 'object') {
        if (!(name in ns) || ns[name] !== value) {
          ns[name] = value;
          changed = true;
        }
      }
      else {
        for (var p in name) {
          var value = name[p];
          if (!(p in ns) || ns[p] !== value) {
            ns[p] = value;
            changed = true;
          }
        }

        if (name.__esModule) {
          ns.__esModule = name.__esModule;
        }
      }
      if (changed)
        for (var i = 0; i < importerSetters.length; i++) {
          var setter = importerSetters[i];
          if (setter) setter(ns);
        }
      return value;
    }
    var declared = registration[1](_export, registration[1].length === 2 ? {
      import: function (importId) {
        return loader.import(importId, id);
      },
      meta: loader.createContext(id)
    } : undefined);
    load.e = declared.execute || function () {};
    return [registration[0], declared.setters || []];
  });

  if (!process.env.SYSTEM_PRODUCTION)
    instantiatePromise = instantiatePromise.catch(function (err) {
      triggerOnload(loader, load, err);
    });

  var linkPromise = instantiatePromise
  .then(function (instantiation) {
    return Promise.all(instantiation[0].map(function (dep, i) {
      var setter = instantiation[1][i];
      return Promise.resolve(loader.resolve(dep, id))
      .then(function (depId) {
        var depLoad = getOrCreateLoad(loader, depId, id);
        // depLoad.I may be undefined for already-evaluated
        return Promise.resolve(depLoad.I)
        .then(function () {
          if (setter) {
            depLoad.i.push(setter);
            // only run early setters when there are hoisted exports of that module
            // the timing works here as pending hoisted export calls will trigger through importerSetters
            if (depLoad.h || !depLoad.I)
              setter(depLoad.n);
          }
          return depLoad;
        });
      })
    }))
    .then(function (depLoads) {
      load.d = depLoads;
    });
  });

  linkPromise.catch(function (err) {
    load.e = null;
    load.er = err;
  });

  // Capital letter = a promise function
  return load = loader[REGISTRY][id] = {
    id: id,
    // importerSetters, the setters functions registered to this dependency
    // we retain this to add more later
    i: importerSetters,
    // module namespace object
    n: ns,

    // instantiate
    I: instantiatePromise,
    // link
    L: linkPromise,
    // whether it has hoisted exports
    h: false,

    // On instantiate completion we have populated:
    // dependency load records
    d: undefined,
    // execution function
    // set to NULL immediately after execution (or on any failure) to indicate execution has happened
    // in such a case, C should be used, and E, I, L will be emptied
    e: undefined,

    // On execution we have populated:
    // the execution error if any
    er: undefined,
    // in the case of TLA, the execution promise
    E: undefined,

    // On execution, L, I, E cleared

    // Promise for top-level completion
    C: undefined
  };
}

function instantiateAll (loader, load, loaded) {
  if (!loaded[load.id]) {
    loaded[load.id] = true;
    // load.L may be undefined for already-instantiated
    return Promise.resolve(load.L)
    .then(function () {
      return Promise.all(load.d.map(function (dep) {
        return instantiateAll(loader, dep, loaded);
      }));
    })
  }
}

function topLevelLoad (loader, load) {
  return load.C = instantiateAll(loader, load, {})
  .then(function () {
    return postOrderExec(loader, load, {});
  })
  .then(function () {
    return load.n;
  });
}

// the closest we can get to call(undefined)
var nullContext = Object.freeze(Object.create(null));

// returns a promise if and only if a top-level await subgraph
// throws on sync errors
function postOrderExec (loader, load, seen) {
  if (seen[load.id])
    return;
  seen[load.id] = true;

  if (!load.e) {
    if (load.er)
      throw load.er;
    if (load.E)
      return load.E;
    return;
  }

  // deps execute first, unless circular
  var depLoadPromises;
  load.d.forEach(function (depLoad) {
    if (!process.env.SYSTEM_PRODUCTION) {
      try {
        var depLoadPromise = postOrderExec(loader, depLoad, seen);
        if (depLoadPromise) {
          depLoadPromise.catch(function (err) {
            triggerOnload(loader, load, err);
          });
          (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
        }
      }
      catch (err) {
        triggerOnload(loader, load, err);
      }
    }
    else {
      var depLoadPromise = postOrderExec(loader, depLoad, seen);
      if (depLoadPromise)
        (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
    }
  });
  if (depLoadPromises)
    return Promise.all(depLoadPromises).then(doExec);

  return doExec();

  function doExec () {
    try {
      var execPromise = load.e.call(nullContext);
      if (execPromise) {
        if (!process.env.SYSTEM_PRODUCTION)
          execPromise = execPromise.then(function () {
            load.C = load.n;
            load.E = null; // indicates completion
            triggerOnload(loader, load, null);
          }, function (err) {
            triggerOnload(loader, load, err);
          });
        else
          execPromise = execPromise.then(function () {
            load.C = load.n;
            load.E = null;
          });
        return load.E = load.E || execPromise;
      }
      // (should be a promise, but a minify optimization to leave out Promise.resolve)
      load.C = load.n;
      if (!process.env.SYSTEM_PRODUCTION) triggerOnload(loader, load, null);
    }
    catch (err) {
      load.er = err;
      if (!process.env.SYSTEM_PRODUCTION) triggerOnload(loader, load, err);
      else throw err;
    }
    finally {
      load.L = load.I = undefined;
      load.e = null;
    }
  }
}

global.System = new SystemJS();
