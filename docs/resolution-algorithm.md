SystemJS Resolution Algorithm
---

When using `SystemJS.import('x')`, or `import 'x'` syntax the [full SystemJS resolution algorithm is run to convert the provided
module specifier into a fully resolved module name, that can be uniquely looked up in the module registry](architecture.md#SystemJS-Resolution-Algorithm).

This section describes the features of the normalization algorithm, also providing a [full specification for the normalization process](#Resolution-Specification).

We use the term _module specifier_ here to refer to the unnormalized name that is provided as above, and the term _module name_ to refer to the unique normalized name
in the registry.

## Resolution

### URL Resolution

When using a module specifier starting with `./`, `.`, `..`, `/`, `//` or a protocol `*://`, then normalization
is defined simply as the resolution of the module specifier URL to the parent module name URL.

> For example, `RESOLVE('./z', 'https://site.com/x/y') -> 'https://site.com/x/z'`

### Name Resolution

When a module specifier does not start with any of the URL characters as listed above, it is deemed a _plain name_.

Plain names run through name resolution, the parts of which are described below.

#### Map Resolution

Map configuration is adopted from AMD loaders and is supported in exactly the same way (apart from leaving out contextual map configuration objects,
which is provided by [package map](#Contextual-Package-Map-Resolution)).

Map is the first step to apply in the normalization algorithm for plain name module specifiers, so can map into any valid specifier itself.

Map applies to any subpaths of the match, making it suitable for package folders as well. Map targets can not end in a `/`.

##### Example

```javascript
SystemJS.config({
  map: {
    'myapp': './src',
    'x': '@empty'
  }
});

SystemJS.import('myapp/x.js');
// -> ./src/x.js, which then URL normalizes to https://site.com/src/x.js

SystemJS.import('myapp/sub/y.js');
// -> ./src/sub/y.js, which then URL normalizes to https://site.com/src/sub/y.js

SystemJS.import('x');
// -> @empty which is a SystemJS system module
```

#### System Modules

If the plain name after applying map configuration is still a plain name and is contained within the module registry already,
then we assume the module is a system module and stop any further normalization steps.

##### Example

```javascript
import * as empty from '@empty';
// returns the empty module (a module with no exports)

import {production, node, browser} from '@system-env'
// returns the systemjs environment module, exporting the above boolean environment values
```

#### Paths Resolution

Paths configuration is similar to map configuration, but while map configuration is the first thing that is applied to a plain name,
paths configuration is the last step before adding the baseURL.

If after applying map configuration, and the target is still a plain name and is not a system module,
then we apply paths configuration, which can match two variations - single module paths, and folder paths which must
provide a target ending in `/`.

##### Example

```javascript
SystemJS.config({
  paths: {
    'jquery': '//cdn.jquery.com/jquery-2.3.4.js',
    'mycompany:': '//cdn.mycompany.com/js/'
  }
});

SystemJS.import('jquery');
// -> https://cdn.jquery.com/jquery-2.3.4.js

SystemJS.import('mycompany:module.js');
// -> https://cdn.mycompany.com/js/module.js
```

> You may be wondering at this point when to use `map` config and when to use `paths` config. The general rule here is to use map
configuration for individual code packages that consist of an isolated folder, exact paths configuration for individual code modules
or code that is on a CDN like jquery, and paths folder configuration for setting up locations that contain many packages within them.

#### BaseURL Resolution

Paths and baseURL resolution are conceptualy very important in production workflows as the only resolution
configurations applied to the portable [canonical module names used in bundles](production-workflows.md#Canonical-Names), in turn
defining the canonical naming scheme itself.

If after applying paths configuration, the module specifier is still a plain name, then we add the baseURL.

The baseURL is simply a full URL ending in `/` that is concatenated with the plain name.

##### Example

```javascript
SystemJS.config({
  baseURL: '/js'
});

SystemJS.import('some/module.js');
// -> https://site.com/js/some/module.js
```

### Contextual Package Map Resolution

### Plugin Syntax

_This feature may be deprecated in future._

### Package Resolution



### Boolean Conditionals

_This feature may be deprecated in future._

### Conditional Substitution


## Resolution Specification

The resolution algorithm in SystemJS is a function of the request and parent (where _parent_ is set to undefined for a top-level `SystemJS.import('x')`).

The following loader configurations affect normalization:

* SystemJS.baseURL - absolute URL, with a trailing slash
* SystemJS.paths - hash of paths to targets
* SystemJS.map - hash of paths to targets
* SystemJS.meta - absolute URLs with wildcards
* SystemJS.packageConfigPaths, absolute URLs with wildcards
* SystemJS.packages - key of absolute URL to package to package config

- Assumption:: System.paths are absolute URLs!!

((try and define config normalization))

_SystemJS.load is a variation of SystemJS.import that assumes an already-normalized module name_

### 1. RESOLVE(request, parent, sync)

> Defines the plugin and boolean conditional syntax wrappers around core resolve.
  There are two variations of resolve - with and without the `sync` flag, which restricts
  normalization to a subset of behaviours for synchronous resolution, throwing errors if relying on dynamic
loading of package configuration or conditional modules that has not already been loaded into the registry
by the non-sync normalization.

1 If _request_ contains the boolean conditional syntax substring _"#?"_ then,
  1. Set _request_ to the result of _RESOLVE_BOOLEAN_CONDITIONAL(request, parent, sync)_
1. Let _pluginSyntax_ be _undefined_
1. If _request_ contains the plugin syntax _"!"_ then,
  1. Set _pluginSyntax_ to the result of _RESOLVE_PLUGIN_SYNTAX(request, parent, sync)_
  1. Set _request_ to _pluginSyntax.requestArgument_
1. Let _resolved_ be the result of _CORE_RESOLVE(request, parent, sync)_
1. If _pluginSyntax_ is not _undefined_ then,
  1. If _IS_SYSTEM_MODULE(resolved)_ reject with a new _Error_
  1. Return the string _resolved + "!" + pluginSyntax.resolvedPlugin_
1. Return _resolved_

#### 1.2. CORE_RESOLVE(request, parent, sync)

> Defines the comprehensive core SystemJS normalization algorithm.

1. Let _resolved_ be _undefined_
1. If _IS_PLAIN_NAME(request)_ is _true_ then,
  1. Set _resolved_ to the result of _NAME_RESOLVE(request, parent, sync)_
1. Else,
  1. Let _resolutionParent_ be equal to _parent_
  1. If _resolutionParent_ is _undefined_ then,
    1. Set _resolutionParent_ to the environment baseURI
  1. Set _resolved_ to the result of _URL_RESOLVE(request, resolutionParent)_
1. Let _packageResolution_ be the result of _RESOLVE_PACKAGE(resolved, sync)_
1. If _packageResolution_ is not _undefined_ then,
  1. Return _packageResolution_
1. Return the result of _RESOLVE_CONDITIONAL_SUBSTITUTION(resolved, parent, sync)_

#### 1.3. NAME_RESOLVE(request, parent, sync)

> Give a plain name like `jquery`, determines its resolution.

1. Assert _IS_PLAIN_NAME(request)_ is _true_
1. If _parent_ is not _undefined_ then,
  1. Let _contextualResolution_ be the result of _RESOLVE_CONTEXTUAL_PACKAGE_MAP(request, parent, sync)_
  1. If _contextualResolution_ is not _undefined_ then,
    1. Return _contextualResolution_
1. Let _mapResolution_ be the result of _RESOLVE_GLOBAL_MAP(request)_
1. If _mapResolution_ is not _undefined_ then,
  1. If _IS_PLAIN_NAME(mapResolution)_ is _false_ then,
    1. Let _baseURI_ be the environment baseURI
    1. Return the value of _URL_RESOLVE(mapResolution, baseURI)_
  1. Else,
    1. Set _request_ to _mapResolution_
1. If _IS_SYSTEM_MODULE(request)_ then,
  1. Return _request_
1. Return the result of _RESOLVE_PATHS(request)_

### 2. Helper Functions

#### 2.1. IS_PLAIN_NAME(request)

1. If _request_ is equal to _"."_ or _".."_, or begins with the string _"./"_, _"../", _"/"_ or _"*://"_, 
  where `*` consists of any valid URI protocol characters, _return false_
1. Else, return _true_

#### 2.2 URL_RESOLVE(request, parent)

> Standard URI normalization, with an exception to treat "#" as a normal URI character.

1. Pre-encode any _"#"_ characters in both _request_ and _parent_
1. Let _resolved_ be the standard URI resolution of _request_ to _parent_
1. Return _resolved_ with previous _"#"_ encodings decoded

#### 2.3 IS_SYSTEM_MODULE(request)

1. If _IS_PLAIN_NAME(request)_ is _true_,
  1. If there is already an entry in the module registry for the module _request_ return _true_
1. Return _false_

#### 2.4 RESOLVE_CONTEXTUAL_PACKAGE_MAP(request, parent, sync)

> Contextual package map is the ability for `import 'jquery'` to have its own unique map when the parent
  module importing is within a package itself. This unique package map is called contextual map configuration.

1. Assert _parent_ is not _undefined_
1. Assert _IS_PLAIN_NAME(request)_
1. Let _parentPackageURL_ be _GET_PACKAGE_MATCH(parent)_
1. If _parentPackageURL_ is _undefined_ then,
  1. Return _undefined_
1. Let _mapResolution_ be the result of _RESOLVE_PACKAGE_MAP(request, parentPackageURL, sync)_
1. If _mapResolution_ is _undefined_ then,
  1. Return _undefined_
1. Assert _mapResolution_ is a string
1. Return _mapResolution_

#### 2.5 RESOLVE_GLOBAL_MAP(request)

> Map configuration is exactly as defined in AMD loaders and supports matching both files and folders.
  This makes it suitable for both the use case `map: { jquery: '//cdn.jquery.com/jquery-x.y.z.js' }`
  and the use case `map: { jquery: '/path/to/jquery' }` where "/path/to/jquery" is a folder
  or package that we import from with `import 'jquery/x.js'`. Map only ever applies once throughout the
  entire pipeline so any cyclical or double mapping edge cases are avoided.

1. Assert _IS_PLAIN_NAME(request)_
1. Let _mapMatch_ be the value of _GET_MAP_MATCH(request, SystemJS.map)_
1. If _mapMatch_ is _undefined_ then,
  Return _undefined_
1. Let _map_ be the string _SystemJS.map[mapMatch]_
1. Assert the last character of _map_ is not _"/"_
1. Let _subPath_ be the string _request.substr(mapMatch.length)_
1. Return the string _map + subPath_

#### 2.5.1 GET_MAP_MATCH(request, map)

1. Assert that _map_ is an object
1. Let _bestMatch_ be _undefined_
1. For each key _key_ in _map_,
  1. If _request_ starts with the substring _key_ then,
    1. If _request.length_ is equal to _key.length_ or _request[key.length]_ is equal to the string _"/"_ then,
      1. If _bestMatch_ is _undefined_ or _key.length_ is greater than _bestMatch.length_ then,
        1. Set _bestMatch_ to _key_
1. Return _bestMatch_

#### 2.6 RESOLVE_PATHS(request)

> While wildcard paths are currently supported in SystemJS these are being deprecated for paths targets with a trailing "/"
  to indicate folder paths. Paths targets are baseURI-relative, unless they are plain names in which case they are baseURL-relative.

1. Assert _IS_PLAIN_NAME(request)_
1. Let _paths_ be the value of _SystemJS.paths_
1. Assert that _paths_ is an object
1. Let _bestMatch_ be _undefined_
1. For each _key_, _path_ pair in _paths_,
  1. Assert _path_ is a valid URI
  1. If _path_ does not end with a trailing _"/"_ then,
    1. If _request_ is equal to _key_ then,
      1. Return _path_
  1. Else if _request_ starts with the string prefix _key_ then,
    1. Let _bestMatchLength_ be equal to _0_
    1. If _bestMatch_ is not _undefined_ then,
      1. Set _bestMatchLength_ to _bestMatch.length_
    1. If _bestMatchLength_ is less than _key.length_ then,
      1. Set _bestMatch_ to _key_
1. If _bestMatch_ is not _undefined_ then,
  1. Let _path_ be equal to _paths[bestMatch]_
  1. Return _request_ with the _key_ prefix replaced by _path_
1. Return _BASE_URL_RESOLVE(request)_

#### 2.6.1 BASE_URL_RESOLVE(request)

1. Assert _IS_PLAIN_NAME(request)_ is _true_
1. Assert that _SystemJS.baseURL_ is a string
1. Assert that the last character of _SystemJS.baseURL_ is _"/"_
1. Return the string _SystemJS.baseURL + request_

#### 2.8 RESOLVE_PLUGIN_SYNTAX(request, parent, sync)

> Plugin syntax is the same syntax used in AMD or Webpack but with a reversed order (`a.js!plugin`).
  This order may be reversed to match these cases in the next breaking change.
  For normalization here we normalize the plugin and module argument parts separately.

1. Assert _request_ contains the plugin syntax character _"!"_
1. Let _pluginModule_ be the string to the right of the last _"!"_ character in _request_
1. Let _requestArgument_ be the string to the left of the last _"!"_ character in _request_
1. If _pluginModule_ is an empty string then,
  1. Let _pluginModule_ be the string to the right of the last _"."_ character in _request_ if any
  1. If _pluginModule_ is still an empty string, reject the operation with a new _TypeError_
1. Let _resolvedPlugin_ be the result of _RESOLVE(pluginModule, parent, sync)_
1. Let _o_ be a new plain object
1. Set _o.requestArgument_ to _requestArgument_
1. Set _o.resolvedPlugin_ to _resolvedPlugin_
1. Return _o_

#### 2.9 RESOLVE_BOOLEAN_CONDITIONAL(request, parent, sync)

> A boolean conditional is a request of the form `import 'a.js#?b.js'` which means
  that we only want to import `a.js` if `b.js` resolves to a module containing `export default true`.
  The standard use case for this is loading global environment polyfills.
  This feature is still experimental and may be deprecated in future depending on use.

1. Assert _request_ contains the substring _"#?"_
1. Let _booleanCondition_ be the string to the right of the last _"#?"_ substring in _request_
1. Let _booleanResolution_ be the string to the left of the last _"#?"_ substring in _request_
1. Let _conditionValue_ be the result of _RESOLVE_CONDITION(booleanCondition, parent, sync)_
1. If _conditionValue_ is not a boolean, reject the operation with a new _TypeError_
1. If _conditionValue_ is _true_, set _request_ to the string _booleanResolution_
1. If _conditionValue_ is _false_, set _request_ to string _"@empty"_
1. Return _request_

#### 2.10 RESOLVE_CONDITION(condition, parent, sync)

> Conditions are of the general form "~conditionModule|conditionExport", where "conditionModule"
  is the unnormalized module name to the condition, ~" indicates optional boolean condition negation 
  and "conditionExport" indicates which export from the module to use as the condition. 
  "conditionModule" is sugar indicating the default export, and is equivalent to "conditionModule|default".
  System conditions "browser", "node", "dev", "production" and "default" are provided which are treated
  as exceptions if the "conditionModule" matches one of these names so that "browser" becomes "@system-env|browser".

1. If _condition_ is equal to "browser", "node", "dev", "production" or "default" then,
  1. Set _condition_ to the value of _"@system-env|" + condition_
1. If _condition_ does note contain the string _"|"_,
  1. Let _condition_ be the value of _condition + "|default"_
1. Let _conditionExport_ be the substring after the last instance of _"|"_ in _condition_
1. Let _negation_ be _false_
1. If the first character in _conditionExport_ is _"~"_ then,
  1. Let _negation_ be _true_
  1. Set _conditionExport_ to the value of _conditionExport.substr(1)_
1. Set _condition_ to the substring before the last instance of _"|"_ in _condition_
1. Let _resolvedCondition_ be the result of _CORE_RESOLVE(condition, parent, sync)_, throwing any rejection or error
1. If _sync_ is _true_,
  1. Let _conditionModule_ be the result of _SystemJS.get(resolvedCondition)_
  1. If _conditionModule_ is _undefined_, throw a new error
1. Else,
  1. Let _conditionModule_ be the result of _SystemJS.load(resolvedCondition)_
1. If _conditionExport_ is not an export of _conditionModule_ reject with a new _Error_
1. Let _conditionValue_ be the value of _conditionModule[conditionExport]_
1. If _negation_ is _true_ then,
  1. If _conditionValue_ is not of type _boolean_ reject with a new _Error_
  1. Set _conditionValue_ to the negation of _conditionValue_
1. Return _conditionValue_

#### 2.11 RESOLVE_CONDITIONAL_SUBSTITUTION(url, parent, sync)

> Conditional substitution syntax is for loads of the form `import 'x-#{y}.js'`, where
  the default export for y is substituted into the require. This is run as the last normalization
  to ensure that substitution substitution resolves deterministically as a final-stage URL substitution, 
  independent of all other resolution configuration.

1. If _request_ contains the conditional substitution syntax substring _"#{*}"_,
  where `*` consists of any non `}` characters, then,
  1. Let _substitutionCondition_ be the contents of `*` from the last match of _"#{*}"_ within _request_
  1. Let _substitutionValue_ be the result of _RESOLVE_CONDITION(substitutionCondition, parent, sync)_, throwing any rejection or error
  1. If _substitutionValue_ is not a string, reject the RESOLVE promise with a _TypeError_
  1. Set _request_ to the value of substituting the contents of `*` from the last match of _"#{*}"_ within _request_
    with the value of _substitutionValue_
1. Return _request_

#### 2.12 RESOLVE_PACKAGE(url, sync)

> Package matches are done in URL space. The most specific package match, if any, is used
  as the package, and then package resolution rules are followed within that path.
  Package configurations can be dynamically loaded on-demand via the use of packageConfigPaths.

1. Let _packageConfigPath_ be the value of _GET_PACKAGE_CONFIG_PATH(url)_
1. Let _packageURL_ be the value of _GET_PACKAGE_MATCH(url)_
1. Let _packageConfig_ be the value of _SystemJS.packages[packageURL]_
1. Assert that _packageConfig_ is _undefined_ or an object
1. If _packageConfigPath_ is not _undefined_ then,
  1. If _packageConfig_ is _undefined_ or _packageConfig.configured_ is not set to _true_ then,
    1. If _sync_ then,
      1. Throw a new error
    1. Resolve the promise _LOAD_PACKAGE_CONFIG(packageURL, packageConfigPath)_
    1. Set _packageURL_ to _GET_PACKAGE_MATCH(url)_
    1. Set _packageConfig_ to the value of _SystemJS.packages[packageURL]_
1. If _packageConfig_ is not _undefined_ then,
  1. Let _subPath_ be the value of _url.substr(packageURL.length + 1)_
  1. Set _url_ to the value of _RESOLVE_PACKAGE_SUBPATH(packageURL, subPath, sync)_
1. Return _url_

##### 2.12.1 GET_PACKAGE_MATCH(url)

1. Let _bestPackageMatch_ be an empty string
1. For each _packageURL_ in _SystemJS.packages_ do,
  1. Assert that _packageURL_ is a valid URI
  1. Assert the last character of _packageURL_ is not _"/"_
  1. If _url_ is equal to _packageURL_ or _url_ starts with _packageURL + "/"_ then,
    1. If _bestPackageMatch.length_ is less than _packageURL.length_ then,
      1. Set _bestPackageMatch_ to _packageURL_
1. Return _bestPackageMatch_

##### 2.12.2 GET_PACKAGE_CONFIG_PATH(url)

> Package config paths provide a simple scheme for specifying dynamic config loading for packages.
  Two use cases of packageConfigPath values are supported in the same scheme
  - i) "package/package.json" means that if loading "package/x", we must first load the 
  config file "package/package.json" and ii) "packages/*/package.json" means that if loading 
  "packages/x/y" then we must first load the config file "packages/x/package.json".
  Multiple "*" wildcards are also supported in the package pattern, which match any character
  except a "/" separator. packageConfigPaths are normalized into full URLs by System.config.

1. Let _packageConfigPaths_ be the value of _SystemJS.packageConfigPaths_
1. Let _bestMatch_ be _undefined_
1. Assert _packageConfigPaths_ is an _Array_
1. For each entry _configPath_ of the _packageConfigPaths_ array,
  1. Assert that _configPath_ is a valid URI
  1. Let _lastWildcardIndex_ be the last index of the string _"*"_ in _configPath_
  1. Let _lastSeparatorIndex_ be the last index of the string _"/"_ in _configPath_
  1. Let _pkgBoundaryIndex_ be the maximum of _lastWildcardIndex + 1_ and _lastSeparatorIndex_
  1. Let _packagePattern_ be the substring prefix of _configPath_ of length _pkgBoundaryIndex_
  1. Let _packageMatch_ be the substring prefix of _url_ matched with _packagePattern_,
    where _"*"_ wildcards greedily match any character except _"/"_
  1. If _packageMatch_ is not _undefined_ then,
    1. If _packageMatch.length_ is equal to _url.length_ or _url[packageMatch.length]_ equals _"/"_ then,
      1. If _bestMatch_ is _undefined_ or _packageMatch.length_ is greater than _bestMatch.length then,
        1. Set _bestMatch_ to _packageMatch_
1. Return _bestMatch_

##### 2.12.3 LOAD_PACKAGE_CONFIG(packageURL, configURL)

> We load the config file itself through SystemJS.load, which allows config files themselves to be bundled

1. If _SystemJS.meta[configURL]_ is undefined, set _SystemJS.meta[configURL]_ to a new object
1. Let _meta_ be the value of _SystemJS.meta[configURL]_
1. Set _meta.format_ to the value _"json"_
1. Let _loadedConfig_ be the default export of resolving the promise _SystemJS.load(configURL)_
1. If _SystemJS.packages[packageURL]_ is not defined, set it to an empty object
1. Let _packageConfig_ be the value of _SystemJS.packages[packageURL]_
1. For each _key_, _value_ pair in the object `loadedConfig`,
  1. If _key_ is not already a value in _packageConfig_, set _packageConfig[key]_ to _value_
  1. Else if _key_ is _"map"_ or _"meta"_ then merge the object _value_ into _packageConfig[key]_,
    without overwriting any existing values in _packageConfig[key]_.

##### 2.12.4 RESOLVE_PACKAGE_SUBPATH(packageURL, subPath, sync)

> When loading a subpath within a package, we support package config mains, internal subpath maps
  (checked both before and after the default extension is added) and default extension adding.

1. Let _packageConfig_ be the value of _SystemJS.packages[packageURL]_
1. Assert _packageConfig_ is an object
1. If _subPath_ is an empty string then,
  1. If _packageConfig.main_ is not undefined then,
    1. Assert _packageConfig.main_ does not start with _"."_ or _"/"_
    1. Set _subPath_ to _packageConfig.main_
  1. Else return _packageURL + "/"_
1. Let _mapResolution_ be the value of _RESOLVE_PACKAGE_MAP("./" + subPath, packageURL, sync)_
1. If _mapResolution_ is _undefined then,
  1. Let _defaultExtension_ be _GET_DEFAULT_PACKAGE_EXTENSION(packageURL, subPath)_
  1. If _defaultExtension_ is not an empty string then,
    1. Set _mapResolution_ to the value of _RESOLVE_PACKAGE_MAP("./" + subPath + defaultExtension, packageURL, sync)_
1. If _mapResolution is not _undefined_ then,
  1. Return _mapResolution_
1. Return _packageURL + '/' + subPath + GET_DEFAULT_PACKAGE_EXTENSION(packageURL, subPath)_

##### 2.12.5 GET_DEFAULT_PACKAGE_EXTENSION(packageURL, subPath)

> Default extensions in package subpaths are only added when the subpath does not match
  a meta configuration of the package or a global meta configuration that specifies the file suffix.
  This allows global and package meta configurations like `meta: { '*.css': { loader: 'css' } }`
  or `meta: { 'file.css': true }` to opt-out of the default extension adding in packages.
  Ideally this wouldn't be necessary if default extension adding did not exist, but the reality
  is that it is still needed.

1. Let _packageConfig_ be the value of _SystemJS.packages[packageURL]_
1. Assert _packageConfig_ is an object
1. Let _defaultExtension_ be the value of _packageConfig.defaultExtension_
1. If _defaultExtension_ is _undefined_ then,
  1. Set _defaultExtension_ to _"js"_
1. Assert _defaultExtension_ is a string
1. Let _packageMeta_ be the value of _packageConfig.meta_
1. If _packageMeta_ is not _undefined_ then,
  1. Let _packageMetaMatches_ be the value of _GET_META_MATCHES(subPath, packageMeta)_
  1. For each value _metaMatch_ in the array _packageMetaMatches_,
    1. If the last character of _metaMatch_ is not _"*"_ then,
      1. Set _defaultExtension_ to _""_
1. Let _globalMeta_ be the value of _SystemJS.meta_
1. Let _globalMetaMatches_ be the value of _GET_META_MATCHES(packageURL + "/" + subPath, globalMeta)_
1. For each value _metaMatch_ in the array _globalMetaMatches_,
  1. If the last character of _metaMatch_ is not _"*"_ then,
    1. Set _defaultExtension_ to _""_
1. Return _defaultExtension_

##### 2.12.6 GET_META_MATCHES(path, meta)

1. Assert _meta_ is an object
1. Let _metaMatches_ be a new Array
1. For each key _metaPattern_ in _meta_,
  1. If _path_ matches _metaPattern_ exactly where _"*"_ is any character not _"/"_
    1. Add _metaPattern_ to the array _metaMatches_
1. Return _metaMatches_

##### 2.12.7 RESOLVE_PACKAGE_MAP(request, packageURL, sync)

> Package map is identical to global map, but supports two additional features.
  Firstly, packages can map relative syntax - "./x" can be used as both a target pattern
  or destination mapping which is package-relative, and secondly, package maps can use conditional
  objects to allow conditional package resolutions. When package maps map to a plain name,
  that name itself will run through the full resolution algorithm so that package map can
  chain for these plain names only.
  A "." target in package map is allowed to reference the package itself.

1. If _request_ ends with _"/"_,
  1. Let _request_ be the substring of request excluding the trailing _"/"_
1. Let _packageMap_ be the value of _SystemJS.packages[packageURL].map_
1. If _packageMap_ is _undefined_ then,
  1. Return _undefined_
1. Let _mapMatch_ be _GET_MAP_MATCH(request, packageMap)_
1. If _mapMatch_ is _undefined_ then,
  1. Return _undefined_
1. Assert _mapMatch_ is a string
1. Let _mapValue_ be the value of _packageMap[mapMatch]_
1. If _mapValue_ is of type _object_ then,
  1. For each key _condition_ in _mapValue_,
    1. Let _conditionValue_ be the result of _RESOLVE_CONDITION(condition, packageURL + '/', sync)_
    1. If _conditionValue_ is not of type _boolean_, reject with a new _Error_
    1. If _conditionValue_ is equal to _true_ then,
      1. Set _mapValue_ to the value of _mapValue[condition]_
      1. _Break For_
  1. If _mapValue_ is of type _object_ then,
    1. Return _undefined_
1. Assert _mapValue_ is a string
1. Let _mapSubPath_ be equal to _request.substr(request.length - mapMatch.length))_
1. Let _valid_ be the result of _VALID_PACKAGE_MAP(mapMatch, mapValue, mapSubPath)_, rejecting with any error on abrupt completion
1. If _valid_ is _false,
  1. Return _undefined_
1. If _IS_PLAIN_NAME(mapValue)_ then,
  1. Return the result of _CORE_RESOLVE(mapValue + mapSubPath, packageURL + _"/"_)_
1. Else,
  1. If _mapValue_ is equal to _"."_ then,
    1. Return the result of _RESOLVE_PACKAGE_SUBPATH(packageURL, mapSubPath.substr(1), sync)_
  1. If _mapValue_ starts with the string _"./"_ then,
    1. Let _subPath_ be the string _mapValue.substr(2) + mapSubPath_
    1. Return _packageURL + '/' + subPath + GET_DEFAULT_PACKAGE_EXTENSION(packageURL, subPath)_
  1. Return _URL_RESOLVE(mapValue + mapSubPath, packageURL + _"/"_)_

##### 2.12.8 VALID_PACKAGE_MAP(mapMatch, mapValue, mapSubPath)

> Returns true or false if the map should be used or not. Also throws on invalid mapping cases.
  We allow recursive package map of the form "./x" -> "./x/y" but skip this recursion in the case "./x/z" -> "./x/y".
  We throw for "." as a key in map config.

1. If _mapMatch_ is equal to the string _"."_ then,
  1. Throw a new _Error_
1. If _mapValue.substr(0, mapMatch.length)_ is equal to the string _mapMatch_ then,
  1. If _mapSubPath.length_ > _mapMatch.length_ then,
    1. Return _false_;
1. Return _true_

### 3. DECANONICALIZE(request, parent)

> Decanonicalize is the reduced normalization used to convert `System.register('name')` canonical module names
  into a full URL registry name.
  It is designed to allow a well-defined 1-1 mapping between a plain name scheme and the URLs in the registry
  making it suitable for portable module transport without having to directly use URLs.
  It just applies resolution of paths and baseURL configs.

1. Let _pluginSyntax_ be _undefined_
1. If _request_ contains the plugin syntax _"!"_ then,
  1. Set _pluginSyntax_ to the result of _DECANONICALIZE_PLUGIN_SYNTAX(request, parent)_
  1. Set _request_ to _pluginSyntax.requestArgument_
1. Assert _IS_PLAIN_NAME(request)_
1. Let _resolved_ be _undefined_
1. If _IS_SYSTEM_MODULE(request)_ then,
  1. Set _resolved_ to _request_
1. Else,
  1. Set _resolved_ to the result of _RESOLVE_PATHS(request)_
1. If _pluginSyntax_ is not _undefined_ then,
  1. If _IS_SYSTEM_MODULE(resolved)_ reject with a new _Error_
  1. Return the string _resolved + "!" + pluginSyntax.resolvedPlugin_
1. Return _resolved_
```

#### 3.1 DECANONICALIZE_PLUGIN_SYNTAX(request, parent)

> This operation is identical to RESOLVE_PLUGIN_SYNTAX, except calling DECANONICALIZE on the plugin instead of RESOLVE.

1. Assert _request_ contains the plugin syntax character _"!"_
1. Let _pluginModule_ be the string to the right of the last _"!"_ character in _request_
1. Let _requestArgument_ be the string to the left of the last _"!"_ character in _request_
1. If _pluginModule_ is an empty string then,
  1. Let _pluginModule_ be the string to the right of the last _"."_ character in _request_ if any
  1. If _pluginModule_ is still an empty string, reject the operation with a new _TypeError_
1. Let _resolvedPlugin_ be the result of _DECANONICALIZE(pluginModule, parent)_
1. Let _o_ be a new plain object
1. Set _o.requestArgument_ to _requestArgument_
1. Set _o.resolvedPlugin_ to _resolvedPlugin_
1. Return _o_



