/*
 * SystemJS v0.19.3
 */
!function(e){function t(e,t){var r;if(e instanceof Error){var r=new Error(e.message,e.fileName,e.lineNumber);v?(r.message=e.message+"\n	"+t,r.stack=e.stack):(r.message=e.message,r.stack=e.stack+"\n	"+t)}else r=e+"\n	"+t;return r}function r(e,r,n){try{new Function(e).call(n)}catch(a){throw t(a,"Evaluating "+r)}}function n(){}function a(t){this._loader={loaderObj:this,loads:[],modules:{},importPromises:{},moduleRecords:{}},y(this,"global",{get:function(){return e}})}function o(){a.call(this),this.paths={}}function i(e,t){var r,n="",a=0;for(var o in e){var i=o.split("*");if(i.length>2)throw new TypeError("Only one wildcard in a path is permitted");if(1==i.length){if(t==o){n=o;break}}else{var d=i[0].length;d>=a&&t.substr(0,i[0].length)==i[0]&&t.substr(t.length-i[1].length)==i[1]&&(a=d,n=o,r=t.substr(i[0].length,t.length-i[1].length-i[0].length))}}var s=e[n]||t;return"string"==typeof r&&(s=s.replace("*",r)),s}function d(){}function s(){o.call(this),k.call(this)}function l(){}function u(e,t){s.prototype[e]=t(s.prototype[e]||function(){})}function c(e){k=e(k||function(){})}function f(e){for(var t=[],r=[],n=0,a=e.length;a>n;n++){var o=w.call(t,e[n]);-1===o?(t.push(e[n]),r.push([n])):r[o].push(n)}return{names:t,indices:r}}function m(e){var t={};if("object"==typeof e||"function"==typeof e)if(P){var r;for(var n in e)(r=Object.getOwnPropertyDescriptor(e,n))&&y(t,n,r)}else{var a=e&&e.hasOwnProperty;for(var n in e)(!a||e.hasOwnProperty(n))&&(t[n]=e[n])}return t["default"]=e,y(t,"__useDefault",{value:!0}),t}function p(){return{name:null,deps:null,declare:null,execute:null,executingRequire:!1,declarative:!1,normalizedDeps:null,groupIndex:null,evaluated:!1,module:null,esModule:null,esmExports:!1}}var h="undefined"==typeof window&&"undefined"!=typeof self&&"undefined"!=typeof importScripts,v="undefined"!=typeof window&&"undefined"!=typeof document,g="undefined"!=typeof process&&!!process.platform.match(/^win/);e.console||(e.console={assert:function(){}});var y,w=Array.prototype.indexOf||function(e){for(var t=0,r=this.length;r>t;t++)if(this[t]===e)return t;return-1};!function(){try{Object.defineProperty({},"a",{})&&(y=Object.defineProperty)}catch(e){y=function(e,t,r){try{e[t]=r.value||r.get.call(e)}catch(n){}}}}();var b;if("undefined"!=typeof document&&document.getElementsByTagName){if(b=document.baseURI,!b){var x=document.getElementsByTagName("base");b=x[0]&&x[0].href||window.location.href}b=b.split("#")[0].split("?")[0],b=b.substr(0,b.lastIndexOf("/")+1)}else if("undefined"!=typeof process&&process.cwd)b="file://"+(g?"/":"")+process.cwd()+"/",g&&(b=b.replace(/\\/g,"/"));else{if("undefined"==typeof location)throw new TypeError("No environment baseURI");b=e.location.href}var E=e.URLPolyfill||e.URL;y(n.prototype,"toString",{value:function(){return"Module"}}),function(){function o(e){return{status:"loading",name:e,linkSets:[],dependencies:[],metadata:{}}}function i(e,t,r){return new Promise(c({step:r.address?"fetch":"locate",loader:e,moduleName:t,moduleMetadata:r&&r.metadata||{},moduleSource:r.source,moduleAddress:r.address}))}function d(e,t,r,n){return new Promise(function(a,o){a(e.loaderObj.normalize(t,r,n))}).then(function(t){var r;if(e.modules[t])return r=o(t),r.status="linked",r.module=e.modules[t],r;for(var n=0,a=e.loads.length;a>n;n++)if(r=e.loads[n],r.name==t)return r;return r=o(t),e.loads.push(r),s(e,r),r})}function s(e,t){l(e,t,Promise.resolve().then(function(){return e.loaderObj.locate({name:t.name,metadata:t.metadata})}))}function l(e,t,r){u(e,t,r.then(function(r){return"loading"==t.status?(t.address=r,e.loaderObj.fetch({name:t.name,metadata:t.metadata,address:r})):void 0}))}function u(t,n,a){a.then(function(a){return"loading"==n.status?Promise.resolve(t.loaderObj.translate({name:n.name,metadata:n.metadata,address:n.address,source:a})).then(function(e){return n.source=e,t.loaderObj.instantiate({name:n.name,metadata:n.metadata,address:n.address,source:e})}).then(function(a){if(void 0===a)return n.address=n.address||"<Anonymous Module "+ ++P+">",n.isDeclarative=!0,k.call(t.loaderObj,n).then(function(t){var a=e.System,o=a.register;a.register=function(e,t,r){"string"!=typeof e&&(r=t,t=e),n.declare=r,n.depsList=t},r(t,n.address,{}),a.register=o});if("object"!=typeof a)throw TypeError("Invalid instantiate return value");n.depsList=a.deps||[],n.execute=a.execute,n.isDeclarative=!1}).then(function(){n.dependencies=[];for(var e=n.depsList,r=[],a=0,o=e.length;o>a;a++)(function(e,a){r.push(d(t,e,n.name,n.address).then(function(t){if(n.dependencies[a]={key:e,value:t.name},"linked"!=t.status)for(var r=n.linkSets.concat([]),o=0,i=r.length;i>o;o++)m(r[o],t)}))})(e[a],a);return Promise.all(r)}).then(function(){n.status="loaded";for(var e=n.linkSets.concat([]),t=0,r=e.length;r>t;t++)h(e[t],n)}):void 0})["catch"](function(e){n.status="failed",n.exception=e;for(var t=n.linkSets.concat([]),r=0,a=t.length;a>r;r++)v(t[r],n,e)})}function c(e){return function(t,r){var n=e.loader,a=e.moduleName,i=e.step;if(n.modules[a])throw new TypeError('"'+a+'" already exists in the module table');for(var d,c=0,m=n.loads.length;m>c;c++)if(n.loads[c].name==a&&(d=n.loads[c],"translate"!=i||d.source||(d.address=e.moduleAddress,u(n,d,Promise.resolve(e.moduleSource))),d.linkSets.length))return d.linkSets[0].done.then(function(){t(d)});var p=d||o(a);p.metadata=e.moduleMetadata;var h=f(n,p);n.loads.push(p),t(h.done),"locate"==i?s(n,p):"fetch"==i?l(n,p,Promise.resolve(e.moduleAddress)):(p.address=e.moduleAddress,u(n,p,Promise.resolve(e.moduleSource)))}}function f(e,t){var r={loader:e,loads:[],startingLoad:t,loadingCount:0};return r.done=new Promise(function(e,t){r.resolve=e,r.reject=t}),m(r,t),r}function m(e,t){if("failed"!=t.status){for(var r=0,n=e.loads.length;n>r;r++)if(e.loads[r]==t)return;e.loads.push(t),t.linkSets.push(e),"loaded"!=t.status&&e.loadingCount++;for(var a=e.loader,r=0,n=t.dependencies.length;n>r;r++)if(t.dependencies[r]){var o=t.dependencies[r].value;if(!a.modules[o])for(var i=0,d=a.loads.length;d>i;i++)if(a.loads[i].name==o){m(e,a.loads[i]);break}}}}function p(e){var t=!1;try{E(e,function(r,n){v(e,r,n),t=!0})}catch(r){v(e,null,r),t=!0}return t}function h(e,t){if(e.loadingCount--,!(e.loadingCount>0)){var r=e.startingLoad;if(e.loader.loaderObj.execute===!1){for(var n=[].concat(e.loads),a=0,o=n.length;o>a;a++){var t=n[a];t.module=t.isDeclarative?{name:t.name,module:O({}),evaluated:!0}:{module:O({})},t.status="linked",g(e.loader,t)}return e.resolve(r)}var i=p(e);i||e.resolve(r)}}function v(e,r,n){var a=e.loader;e:if(r)if(e.loads[0].name==r.name)n=t(n,"Error loading "+r.name);else{for(var o=0;o<e.loads.length;o++)for(var i=e.loads[o],d=0;d<i.dependencies.length;d++){var s=i.dependencies[d];if(s.value==r.name){n=t(n,"Error loading "+r.name+' as "'+s.key+'" from '+i.name);break e}}n=t(n,"Error loading "+r.name+" from "+e.loads[0].name)}else n=t(n,"Error linking "+e.loads[0].name);for(var l=e.loads.concat([]),o=0,u=l.length;u>o;o++){var r=l[o];a.loaderObj.failed=a.loaderObj.failed||[],-1==w.call(a.loaderObj.failed,r)&&a.loaderObj.failed.push(r);var c=w.call(r.linkSets,e);if(r.linkSets.splice(c,1),0==r.linkSets.length){var f=w.call(e.loader.loads,r);-1!=f&&e.loader.loads.splice(f,1)}}e.reject(n)}function g(e,t){if(e.loaderObj.trace){e.loaderObj.loads||(e.loaderObj.loads={});var r={};t.dependencies.forEach(function(e){r[e.key]=e.value}),e.loaderObj.loads[t.name]={name:t.name,deps:t.dependencies.map(function(e){return e.key}),depMap:r,address:t.address,metadata:t.metadata,source:t.source,kind:t.isDeclarative?"declarative":"dynamic"}}t.name&&(e.modules[t.name]=t.module);var n=w.call(e.loads,t);-1!=n&&e.loads.splice(n,1);for(var a=0,o=t.linkSets.length;o>a;a++)n=w.call(t.linkSets[a].loads,t),-1!=n&&t.linkSets[a].loads.splice(n,1);t.linkSets.splice(0,t.linkSets.length)}function b(e,t,r){try{var a=t.execute()}catch(o){return void r(t,o)}return a&&a instanceof n?a:void r(t,new TypeError("Execution must define a Module instance"))}function x(e,t,r){var n=e._loader.importPromises;return n[t]=r.then(function(e){return n[t]=void 0,e},function(e){throw n[t]=void 0,e})}function E(e,t){var r=e.loader;if(e.loads.length)for(var n=e.loads.concat([]),a=0;a<n.length;a++){var o=n[a],i=b(e,o,t);if(!i)return;o.module={name:o.name,module:i},o.status="linked",g(r,o)}}function S(e,t){return t.module.module}function _(){}function k(){throw new TypeError("ES6 transpilation is only provided in the dev module loader build.")}var P=0;a.prototype={constructor:a,define:function(e,t,r){if(this._loader.importPromises[e])throw new TypeError("Module is already loading.");return x(this,e,new Promise(c({step:"translate",loader:this._loader,moduleName:e,moduleMetadata:r&&r.metadata||{},moduleSource:t,moduleAddress:r&&r.address})))},"delete":function(e){var t=this._loader;return delete t.importPromises[e],delete t.moduleRecords[e],t.modules[e]?delete t.modules[e]:!1},get:function(e){return this._loader.modules[e]?(_(this._loader.modules[e],[],this),this._loader.modules[e].module):void 0},has:function(e){return!!this._loader.modules[e]},"import":function(e,t,r){"object"==typeof t&&(t=t.name);var n=this;return Promise.resolve(n.normalize(e,t)).then(function(e){var t=n._loader;return t.modules[e]?(_(t.modules[e],[],t._loader),t.modules[e].module):t.importPromises[e]||x(n,e,i(t,e,{}).then(function(r){return delete t.importPromises[e],S(t,r)}))})},load:function(e,t){var r=this._loader;return r.modules[e]?(_(r.modules[e],[],r),Promise.resolve(r.modules[e].module)):r.importPromises[e]||x(this,e,i(r,e,{}).then(function(t){return delete r.importPromises[e],S(r,t)}))},module:function(e,t){var r=o();r.address=t&&t.address;var n=f(this._loader,r),a=Promise.resolve(e),i=this._loader,d=n.done.then(function(){return S(i,r)});return u(i,r,a),d},newModule:function(e){if("object"!=typeof e)throw new TypeError("Expected object");var t,r=new n;if(Object.getOwnPropertyNames&&null!=e)t=Object.getOwnPropertyNames(e);else{t=[];for(var a in e)t.push(a)}for(var o=0;o<t.length;o++)(function(t){y(r,t,{configurable:!1,enumerable:!0,get:function(){return e[t]}})})(t[o]);return Object.preventExtensions&&Object.preventExtensions(r),r},set:function(e,t){if(!(t instanceof n))throw new TypeError("Loader.set("+e+", module) must be a module");this._loader.modules[e]={module:t}},normalize:function(e,t,r){return e},locate:function(e){return e.name},fetch:function(e){},translate:function(e){return e.source},instantiate:function(e){}};var O=a.prototype.newModule}();var S;d.prototype=a.prototype,o.prototype=new d;var _=/^([^\/]+:\/\/|\/)/;o.prototype.normalize=function(e,t,r){return e=e.match(_)||"."==e[0]?new E(e,t||b).href:new E(i(this.paths,e),b).href},o.prototype.locate=function(e){return e.name},o.prototype.instantiate=function(t){var n=this;return Promise.resolve(n.normalize(n.transpiler)).then(function(a){return t.address===a?{deps:[],execute:function(){var a=e.System,o=e.Reflect.Loader;return r("(function(require,exports,module){"+t.source+"})();",t.address,e),e.System=a,e.Reflect.Loader=o,n.newModule({"default":e[n.transpiler],__useDefault:!0})}}:void 0})},l.prototype=o.prototype,s.prototype=new l,s.prototype.constructor=s;var k,P=!0;try{Object.getOwnPropertyDescriptor({a:0},"a")}catch(O){P=!1}!function(){function t(){if(o&&"interactive"===o.script.readyState)return o.load;for(var e=0;e<s.length;e++)if("interactive"==s[e].script.readyState)return o=s[e],o.load}function r(e,t){return new Promise(function(e,r){t.metadata.integrity&&r(new Error("Subresource integrity checking is not supported in web workers.")),i=t;try{importScripts(t.address)}catch(n){i=null,r(n)}i=null,t.metadata.entry||r(new Error(t.address+" did not call System.register or AMD define")),e("")})}if("undefined"!=typeof document)var n=document.getElementsByTagName("head")[0];var a,o,i=null,d=n&&function(){var e=document.createElement("script"),t="undefined"!=typeof opera&&"[object Opera]"===opera.toString();return e.attachEvent&&!(e.attachEvent.toString&&e.attachEvent.toString().indexOf("[native code")<0)&&!t}(),s=[],l=0,c=[];u("pushRegister_",function(e){return function(r){return e.call(this,r)?!1:(i?this.reduceRegister_(i,r):d?this.reduceRegister_(t(),r):l?c.push(r):this.reduceRegister_(null,r),!0)}}),u("fetch",function(t){return function(i){var u=this;return i.metadata.scriptLoad&&(v||h)?h?r(u,i):new Promise(function(t,r){function f(e){if(!h.readyState||"loaded"==h.readyState||"complete"==h.readyState){if(l--,i.metadata.entry||c.length){if(!d){for(var n=0;n<c.length;n++)u.reduceRegister_(i,c[n]);c=[]}}else u.reduceRegister_(i);p(),i.metadata.entry||i.metadata.bundle||r(new Error(i.name+" did not call System.register or AMD define")),t("")}}function m(e){p(),r(new Error("Unable to load script "+i.address))}function p(){if(e.System=a,h.detachEvent){h.detachEvent("onreadystatechange",f);for(var t=0;t<s.length;t++)s[t].script==h&&(o.script==h&&(o=null),s.splice(t,1))}else h.removeEventListener("load",f,!1),h.removeEventListener("error",m,!1);n.removeChild(h)}var h=document.createElement("script");h.async=!0,i.metadata.integrity&&h.setAttribute("integrity",i.metadata.integrity),d?(h.attachEvent("onreadystatechange",f),s.push({script:h,load:i})):(h.addEventListener("load",f,!1),h.addEventListener("error",m,!1)),l++,a=e.System,h.src=i.address,n.appendChild(h)}):t.call(this,i)}})}(),function(){function t(e,r,n){if(n[e.groupIndex]=n[e.groupIndex]||[],-1==w.call(n[e.groupIndex],e)){n[e.groupIndex].push(e);for(var a=0,o=e.normalizedDeps.length;o>a;a++){var i=e.normalizedDeps[a],d=r.defined[i];if(d&&!d.evaluated){var s=e.groupIndex+(d.declarative!=e.declarative);if(null===d.groupIndex||d.groupIndex<s){if(null!==d.groupIndex&&(n[d.groupIndex].splice(w.call(n[d.groupIndex],d),1),0==n[d.groupIndex].length))throw new Error("Mixed dependency cycle detected");d.groupIndex=s}t(d,r,n)}}}}function r(e,r){var n=r.defined[e];if(!n.module){n.groupIndex=0;var a=[];t(n,r,a);for(var i=!!n.declarative==a.length%2,s=a.length-1;s>=0;s--){for(var l=a[s],u=0;u<l.length;u++){var c=l[u];i?o(c,r):d(c,r)}i=!i}}}function n(){}function a(e,t){return t[e]||(t[e]={name:e,dependencies:[],exports:new n,importers:[]})}function o(t,r){if(!t.module){var n=r._loader.moduleRecords,i=t.module=a(t.name,n),d=t.module.exports,s=t.declare.call(e,function(e,t){if(i.locked=!0,"object"==typeof e)for(var r in e)d[r]=e[r];else d[e]=t;for(var n=0,a=i.importers.length;a>n;n++){var o=i.importers[n];if(!o.locked){var s=w.call(o.dependencies,i);o.setters[s](d)}}return i.locked=!1,t});if(i.setters=s.setters,i.execute=s.execute,!i.setters||!i.execute)throw new TypeError("Invalid System.register form for "+t.name);for(var l=0,u=t.normalizedDeps.length;u>l;l++){var c,f=t.normalizedDeps[l],m=r.defined[f],p=n[f];p?c=p.exports:m&&!m.declarative?c=m.esModule:m?(o(m,r),p=m.module,c=p.exports):c=r.get(f),p&&p.importers?(p.importers.push(i),i.dependencies.push(p)):i.dependencies.push(null);for(var h=t.originalIndices[l],v=0,g=h.length;g>v;++v){var y=h[v];i.setters[y]&&i.setters[y](c)}}}}function i(e,t){var r,n=t.defined[e];if(n)n.declarative?l(e,[],t):n.evaluated||d(n,t),r=n.module.exports;else if(r=t.get(e),!r)throw new Error("Unable to load dependency "+e+".");return(!n||n.declarative)&&r&&r.__useDefault?r["default"]:r}function d(t,r){if(!t.module){var n={},a=t.module={exports:n,id:t.name};if(!t.executingRequire)for(var o=0,s=t.normalizedDeps.length;s>o;o++){var l=t.normalizedDeps[o],u=r.defined[l];u&&d(u,r)}t.evaluated=!0;var c=t.execute.call(e,function(e){for(var n=0,a=t.deps.length;a>n;n++)if(t.deps[n]==e)return i(t.normalizedDeps[n],r);throw new Error("Module "+e+" not declared as a dependency.")},n,a);c&&(a.exports=c),n=a.exports,n&&n.__esModule?t.esModule=n:t.esmExports?t.esModule=m(n):t.esModule={"default":n}}}function l(t,r,n){var a=n.defined[t];if(a&&!a.evaluated&&a.declarative){r.push(t);for(var o=0,i=a.normalizedDeps.length;i>o;o++){var d=a.normalizedDeps[o];-1==w.call(r,d)&&(n.defined[d]?l(d,r,n):n.get(d))}a.evaluated||(a.evaluated=!0,a.module.execute.call(e))}}function h(e){var t=e.match(v);return t&&"System.register"==e.substr(t[0].length,15)}s.prototype.register=function(e,t,r){if("string"!=typeof e&&(r=t,t=e,e=null),"boolean"==typeof r)return this.registerDynamic.apply(this,arguments);var n=p();n.name=e&&(this.normalizeSync||this.normalize).call(this,e),n.declarative=!0,n.deps=t,n.declare=r,this.pushRegister_({amd:!1,entry:n})},s.prototype.registerDynamic=function(e,t,r,n){"string"!=typeof e&&(n=r,r=t,t=e,e=null);var a=p();a.name=e&&(this.normalizeSync||this.normalize).call(this,e),a.deps=t,a.execute=n,a.executingRequire=r,this.pushRegister_({amd:!1,entry:a})},u("reduceRegister_",function(){return function(e,t){if(t){var r=t.entry,n=e&&e.metadata;if(r.name&&(r.name in this.defined||(this.defined[r.name]=r),n&&(n.bundle=!0)),!r.name||e&&r.name==e.name){if(!n)throw new TypeError("Unexpected anonymous System.register call.");if(n.entry)throw new Error("Multiple anonymous System.register calls in module "+e.name+". If loading a bundle, ensure all the System.register calls are named.");n.format||(n.format="register"),n.entry=r}}}}),c(function(e){return function(){e.call(this),this.defined={},this._loader.moduleRecords={}}}),y(n,"toString",{value:function(){return"Module"}}),u("delete",function(e){return function(t){return delete this._loader.moduleRecords[t],delete this.defined[t],e.call(this,t)}});var v=/^\s*(\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)*\s*/;u("fetch",function(e){return function(t){return this.defined[t.name]?(t.metadata.format="defined",""):("register"!=t.metadata.format||t.metadata.authorization||(t.metadata.scriptLoad=!0),t.metadata.deps=t.metadata.deps||[],e.call(this,t))}}),u("translate",function(e){return function(t){return t.metadata.deps=t.metadata.deps||[],Promise.resolve(e.call(this,t)).then(function(e){return("register"==t.metadata.format||!t.metadata.format&&h(t.source))&&(t.metadata.format="register"),e})}}),u("instantiate",function(e){return function(e){var t,n=this;if(n.defined[e.name])t=n.defined[e.name],t.deps=t.deps.concat(e.metadata.deps);else if(e.metadata.entry)t=e.metadata.entry,t.deps=t.deps.concat(e.metadata.deps);else if(!(n.builder&&e.metadata.bundle||"register"!=e.metadata.format&&"esm"!=e.metadata.format&&"es6"!=e.metadata.format)){if("undefined"!=typeof __exec&&__exec.call(n,e),!e.metadata.entry&&!e.metadata.bundle)throw new Error(e.name+" detected as "+e.metadata.format+" but didn't execute.");t=e.metadata.entry}t||(t=p(),t.deps=e.metadata.deps,t.execute=function(){}),n.defined[e.name]=t;var a=f(t.deps);t.deps=a.names,t.originalIndices=a.indices,t.name=e.name,t.esmExports=e.metadata.esmExports!==!1;for(var o=[],i=0,d=t.deps.length;d>i;i++)o.push(Promise.resolve(n.normalize(t.deps[i],e.name)));return Promise.all(o).then(function(a){return t.normalizedDeps=a,{deps:t.deps,execute:function(){return r(e.name,n),l(e.name,[],n),n.defined[e.name]=void 0,n.newModule(t.declarative?t.module.exports:t.esModule)}}})}})}(),c(function(e){return function(){e.apply(this,arguments),this.has("@@amd-helpers")&&this.get("@@amd-helpers").createDefine()}}),u("fetch",function(e){return function(t){return t.metadata.scriptLoad=!0,e.call(this,t)}}),S=new s,S.version="0.19.3 Register Only","object"==typeof exports&&(module.exports=a),e.Reflect=e.Reflect||{},e.Reflect.Loader=e.Reflect.Loader||a,e.Reflect.global=e.Reflect.global||e,e.LoaderPolyfill=a,S||(S=new o,S.constructor=o),"object"==typeof exports&&(module.exports=S),e.System=S}("undefined"!=typeof self?self:global);
//# sourceMappingURL=system-register-only.js.map
