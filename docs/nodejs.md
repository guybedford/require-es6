# NodeJS Loader

The `system-node.cjs` build adds support for loading modules in NodeJS.

## Installation

```sh
npm install --save systemjs

# or
yarn add systemjs
```

```js
const { System, applyImportMap, clearFetchCache, setBaseUrl } = require('systemjs');

System.import('file:///Users/name/some-module.js').then(module => {
  console.log("The loaded module", module);
});
```

## Features

SystemJS creates a global variable `global.System` that loaded modules use by calling `System.register()`. Modules may be loaded either from disk (`file://`) or network (`http://`). A loaded module's code is retrieved and eval'ed.

Since [Import Maps](/docs/import-maps.md) are usually installed via the DOM, system-node.cjs provides an alternative API `applyImportMap` API to support resolution of bare specifiers.

Separate instances of SystemJS, each with their own import map and module registry, are supported via the `new System.constructor()` API.

Additionally, [global loading](/README.md#extras), [module types](/docs/module-types.md), and the [SystemJS Registry API](/docs/api.md#registry) are supported. Other extras, such as the AMD extra, have not been thoroughly tested but are presumed to work.

Modules loaded over HTTP will be cached on disk, according to the [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) header. This caching is performed by [make-fetch-happen](https://github.com/npm/make-fetch-happen).

## API

### System

A reference to the global SystemJS instance. This is referentially equal to `global.System`.

```js
const { System } = require('systemjs');

console.log(System === global.System) // true

System.import('file:///Users/name/some-module.js');

System.import('https://example.com/some-module.js');
```

Multiple instances of SystemJS may be created, each with their own import map and module registry:

```js
const { System } = require('systemjs');

const system1 = new System.constructor();
const system2 = new System.constructor();
```

### applyImportMap(loader, importMap) -> undefined

Since no DOM is available for [import map installation](https://github.com/WICG/import-maps#installation), system-node.cjs provides the `applyImportMap` API. Note that calling applyImportMap multiple times on the same SystemJS instance will completely override the import map (not merge).

```js
const { System, applyImportMap } = require('systemjs');
const path = require('path');
const { pathToFileURL } = require('url');

applyImportMap(System, {
  imports: {
    // File loading
    "module-a": "file:///Users/name/a.js",
    "module-b": pathToFileURL(path.join(process.cwd(), './b.js')),
    // Network loading
    "module-c": "https://example.com/c.js",
  }
});

System.import('module-a');

// Separate import map for separate SystemJS instance
const otherSystem = new System.constructor();
applyImportMap(otherSystem, {
  imports: {
    "module-a": "file:///Users/name/other-a.js",
  }
});

otherSystem.import('module-a');
```

### setBaseUrl(loader, url) -> undefined

By default, relative URLs will be resolved with `process.cwd()` as the base URL. If you wish to change the base URL, you may do so:

```js
const { System, setBaseUrl } = require('systemjs');
const path = require('path');
const { pathToFileURL } = require('url');

// relative to process.cwd()
System.resolve('./file.js');

// Use a network URL as the base
setBaseUrl(System, 'https://example.com/base/');

// Use a file URL as the base
setBaseUrl(System, 'file:///Users/name/some-dir/');
setBaseUrl(System, pathToFileURL(path.join(process.cwd(), 'some-dir')) + path.sep);
```

### clearFetchCache() -> undefined

SystemJS uses [make-fetch-happen](https://github.com/npm/make-fetch-happen) to manage a disk cache that respects the [`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) header. The `clearFetchCache` API clears the disk cache of modules loaded over the network.

Calling `clearFetchCache` ensures that subsequent modules will be loaded from the network instead of disk cache. This does not impact any existing SystemJS modules in the registry.

Note that the disk cache is reused by all NodeJS programs that use SystemJS on any particular machine. This includes reusing the cache after shutting down the program and restarting it.

```js
const { clearFetchCache } = require('systemjs');

clearFetchCache();
```