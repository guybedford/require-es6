QUnit.config.testTimeout = 2000;

module("SystemJS");

function err(e) {
  setTimeout(function() {
    throw e;
    start();
  });  
}

asyncTest('Error handling', function() {
  System['import']('tests/error').then(err, function() {
    ok(true);
    start();
  });
});

asyncTest('Global script loading', function() {
  System['import']('tests/global').then(function(m) {
    ok(m.jQuery && m.another, 'Global objects not defined');
    start();
  }, err);
});

asyncTest('Global script with multiple objects the same', function() {
  System['import']('tests/global-multi').then(function(m) {
    ok(m.jquery == 'here', 'Multi globals not detected');
    start();
  }, err);
});

asyncTest('Global script loading with inline shim', function() {
  System['import']('tests/global-inline-dep').then(function(m) {
    ok(m == '1.8.3', 'Global dependency not defined');
    start();
  }, err);
});

asyncTest('Global script with inline exports', function() {
  System['import']('tests/global-inline-export').then(function(m) {
    ok(m == 'r', 'Inline export not applied');
    start();
  }, err);
});

asyncTest('Global script with shim config', function() {
  System.meta['tests/global-shim-config'] = { deps: ['./global-shim-config-dep'] };
  System['import']('tests/global-shim-config').then(function(m) {
    ok(m == 'shimmed', 'Not shimmed');
    start();
  }, err);
});

asyncTest('Global script loading that detects as AMD with shim config', function() {
  System.meta['tests/global-shim-amd'] = { format: 'global' };
  System['import']('tests/global-shim-amd').then(function(m) {
    ok(m == 'global', 'Not shimmed');
    start();
  }, err);
});

asyncTest('Support the empty module', function() {
  System['import']('@empty').then(function(m) {
    ok(m, 'No empty module');
    start();
  }, err);
});

asyncTest('Global script with shim config exports', function() {
  System.meta['tests/global-shim-config-exports'] = { exports: 'p' };
  System['import']('tests/global-shim-config-exports').then(function(m) {
    ok(m == 'export', 'Exports not shimmed');
    start();
  }, err);
});

asyncTest('Map configuration', function() {
  System.map['maptest'] = 'tests/map-test';
  System['import']('maptest').then(function(m) {
    ok(m.maptest == 'maptest', 'Mapped module not loaded');
    start();
  }, err);
});

asyncTest('Map configuration subpath', function() {
  System.map['maptest'] = 'tests/map-test';
  System['import']('maptest/sub').then(function(m) {
    ok(m.maptest == 'maptestsub', 'Mapped folder not loaded');
    start();
  }, err);
});

asyncTest('Contextual map configuration', function() {
  System.map['tests/contextual-map'] = {
    maptest: 'tests/contextual-map-dep'
  };
  System['import']('tests/contextual-map').then(function(m) {
    ok(m.mapdep == 'mapdep', 'Contextual map dep not loaded');
    start();
  }, err);
});

asyncTest('Submodule contextual map configuration', function() {
  System.map['tests/subcontextual-map'] = {
    dep: 'tests/subcontextual-mapdep'
  };
  System['import']('tests/subcontextual-map/submodule').then(function(m) {
    ok(m == 'submapdep', 'Submodule contextual map not loaded');
    start();
  }, err);
});

asyncTest('Contextual map with shim', function() {
  System.meta['tests/shim-map-test'] = {
    deps: ['shim-map-dep']
  };
  System.map['tests/shim-map-test'] = {
    'shim-map-dep': 'tests/shim-map-test-dep'
  };
  System['import']('tests/shim-map-test').then(function(m) {
    ok(m == 'depvalue', 'shim dep not loaded');
    start();
  }, err);
});

asyncTest('Loading an AMD module', function() {
  System['import']('tests/amd-module').then(function(m) {
    ok(m.amd == true, 'Incorrect module');
    ok(m.dep.amd == 'dep', 'Dependency not defined');
    start();
  }, err);
});
/*
asyncTest('Loading an AMD named define', function() {
  System['import']('tests/nameddefine').then(function(m1){
    ok(m1.converter, 'Showdown not loaded');
    System['import']('another-define').then(function(m2) {
      ok(m2.named === 'define', 'Another module is not defined');
      start();
    }, err);
  }, err);
});
*/

asyncTest('Loading AMD CommonJS form', function() {
  System['import']('tests/amd-cjs-module').then(function(m) {
    ok(m.test == 'hi', 'Not defined');
    start();
  }, err);
});

asyncTest('Loading a CommonJS module', function() {
  System['import']('tests/common-js-module').then(function(m) {
    ok(m.hello == 'world', 'module value not defined');
    ok(m.first == 'this is a dep', 'dep value not defined');
    start();
  }, err);
});

asyncTest('Loading a UMD module', function() {
  System['import']('tests/umd').then(function(m) {
    ok(m.d == 'hi', 'module value not defined');
    start();
  }, err);
});

asyncTest('Loading AMD with format hint', function() {
  System['import']('tests/amd-format').then(function(m) {
    ok(m.amd == 'amd', 'AMD not loaded');
    start();
  }, err);
});

asyncTest('Loading CJS with format hint', function() {
  System['import']('tests/cjs-format').then(function(m) {
    ok(m.cjs == 'cjs', 'CJS not loaded');
    start();
  }, err);
});

asyncTest('Versions support', function() {
  System.versions['tests/versioned'] = '2.0.3';
  System['import']('tests/versioned@^2.0.3').then(function(m) {
    ok(m.version == '2.3.4', 'Version not loaded');
    start();
  }, err);
});

asyncTest('Simple compiler Plugin', function() {
  System.map['coffee'] = 'tests/compiler-plugin';
  System['import']('tests/compiler-test.coffee!').then(function(m) {
    ok(m.output == 'plugin output', 'Plugin not working.');
    ok(m.extra == 'yay!', 'Compiler not working.');
    start();
  }, err);
});

asyncTest('Mapping to a plugin', function() {
  System.map['pluginrequest'] = 'tests/compiled.coffee!';
  System.map['coffee'] = 'tests/compiler-plugin';
  System['import']('pluginrequest').then(function(m) {
    ok(m.extra == 'yay!', 'Plugin not applying.');
    start();
  }, err);
});

asyncTest('Mapping a plugin argument', function() {
  System.map['bootstrap'] = 'tests/bootstrap@^3.1.1';
  System.versions['tests/bootstrap'] = '3.1.1';
  System.map['coffee'] = 'tests/compiler-plugin';
  System['import']('bootstrap/test.coffee!coffee').then(function(m) {
    ok(m.extra == 'yay!', 'not working');
    start();
  }, err);
});

asyncTest('Legacy plugin', function() {
  System['import']('tests/global.js!tests/legacy-plugin').then(function(m) {
    expect(0);
    start();
  }, err);
});

asyncTest('Advanced compiler plugin', function() {
  System['import']('tests/compiler-test!tests/advanced-plugin').then(function(m) {
    ok(m == 'custom fetch:tests/compiler-test!tests/advanced-plugin', m);
    start();
  }, err);
});

asyncTest('Loading from jspm', function() {
  System.paths['npm:*'] = 'https://npm.jspm.io/*.js';
  System['import']('npm:underscore').then(function(m) {
    ok(m && typeof m.chain == 'function', 'Not loaded');
    start();
  }, err);
});

asyncTest('Wrapper module support', function() {
  System['import']('tests/wrapper').then(function(m) {
    ok(m['default'] == 'default1', 'Wrapper module not defined.');
    start();
  }, err);
});

asyncTest('Basic exporting & importing', function() {
  var m1, m2, m3, m4, err;
  var checkComplete = function() {
    if (m1 && m2 && m3 && m4 && err) {
      ok(m1['default'] == 'default1', 'Error defining default 1');
      ok(m2['default'] == 'default2', 'Error defining default 2');
      ok(m3['default'] == 'default3', 'Error defining default 3');
      ok(m4.test == 'default3', 'Error defining module');
      start();
    }
  };
  System['import']('tests/default1').then(function(_m1) {
    if (m1 === undefined)
      m1 = null;
    else
      m1 = _m1;
    checkComplete();
  })['catch'](err);
  System['import']('tests/default1').then(function(_m1) {
    if (m1 === undefined)
      m1 = null;
    else
      m1 = _m1;
    checkComplete();
  })['catch'](err);
  System['import']('tests/default2').then(function(_m2) {
    m2 = _m2;
    checkComplete();
  })['catch'](err);
  System['import']('tests/asdf').then(function() {
  }, function(_err) {
    err = _err;
    checkComplete();
  })['catch'](err);
  System['import']('tests/default3').then(function(_m3) {
    m3 = _m3;
    checkComplete();
  })['catch'](err);
  System['import']('tests/module').then(function(_m4) {
    m4 = _m4;
    checkComplete();
  })['catch'](err);
});

asyncTest('Importing a mapped loaded module', function() {
  System.map['default1'] = 'tests/default1';
  System['import']('default1').then(function(m) {
    System['import']('default1').then(function(m) {
      ok(m, 'no module');
      start();
    }, err);
  }, err);
});

asyncTest('Loading ES6 with format hint', function() {
  System['import']('tests/es6-format').then(function(m) {
    expect(0);
    start();
  }, err);
});

asyncTest('Module Name meta', function() {
  System['import']('tests/reflection').then(function(m) {
    ok(m.myname == 'tests/reflection', 'Module name not returned');
    start();
  }, err);
});

asyncTest('Relative dyanamic loading', function() {
  System['import']('tests/reldynamic').then(function(m) {
    m.dynamicLoad().then(function(m) {
      ok(m.dynamic == 'module', 'Dynamic load failed');
      start();
    }, err);
  }, err);
});

asyncTest("normalize hook", function(){
	
	System.format.normalized = {
		detect: function(load){
			return !!load.source.match(/getNormal\(/);
		},
		deps: function(load, global){
			var deps;
			global.getNormal = function(dep, factory){
				deps = [dep];
				load.metadata.factory = factory;
			};
			System.__exec(load);
			console.log("deps", deps)
			return deps;
		},
		execute: function(depNames, load){
			var module = System.get( depNames[0] );
			if (module.__useDefault) {
		      module = module['default'];
		    }
			
			return load.metadata.factory( module );
		},
		normalize: function(name, referer, refererAddress, baseNormalize){
			var parts = name.split("/"),
				last = ( parts.pop() || "");
			return baseNormalize(parts.join("/")+"/normalized-"+last);
		}
	};
	System.formats.unshift("normalized");
	System['import']('tests/amd-cjs-module').then(function(m) {
    ok(m.test == 'hi', 'Not defined');
      start();
    }, err);
	
	
});


asyncTest("System.meta", function(){
	
	System.meta = {
		'tests/global-multi' : {
			arbitraryMetaProperty: true,
			exports: "jQuery"
		}
	};
	var oldLocate = System.locate;
	System.locate = function(load){
      var res = oldLocate.apply(this, arguments);
      if(load.name == "tests/global-multi") {
        ok(load.metadata.arbitraryMetaProperty, "got arbitrary metadata");
      }
	  return res;
	};
	
	
	System.formats.unshift("normalized");
	System['import']('tests/global-multi').then(function(m) {
      ok(m.jquery === 'here', 'exports works right');
      start();
    }, err);
});

/*
asyncTest("System.clone", function(){
	
  System.map['maptest'] = 'tests/map-test';
  
  var ClonedSystem  = System.clone();
  ClonedSystem.map['maptest'] = 'tests/map-test';
  
  var systemDef = System['import']('maptest');
  var cloneDef = ClonedSystem['import']('maptest');
  
  systemDef.then(function(){
  	console.log("got system");
  });
  cloneDef.then(function(){
  	console.log("got cloned");
  })
  
  Promise.all(System['import']('maptest'), ClonedSystem['import']('maptest'), function(m, mClone){
  	ok(m.maptest == 'maptest', 'Mapped module not loaded');
  	ok(mClone.maptest == 'maptest', 'Mapped module not loaded');
  	ok(mClone !== m, "different modules");
    start();
  }); 
	
});*/

asyncTest("bundled defines without dependencies", function(){
	System.bundles["tests/amd-bundle/amd-bundled"] = ["tests/amd-bundle",'amd-dependency'];
	System['import']("tests/amd-bundle").then(function(value){
		equal(value.name, "tests/amd-bundle","got the right module value");
		console.log(value.dep);
		start();
	}, function(e){
		ok(false, "got error "+e);
		start();
	});
});

asyncTest("plugin instantiate hook", function(){
	var testEl = document.createElement("div");
	testEl.id = "test-element";
	
	document.body.appendChild(testEl);
	
	var instantiate = System.instantiate;
	System.instantiate = function(load){
		if( load.name.indexOf( "tests/build_types/test.css") === 0 ) {
			equal(load.metadata.buildType, "css", "buildType set");
		}
		
		return instantiate.apply(this, arguments);
	};
	
	System['import']("tests/build_types/test.css!tests/build_types/css").then(function(value){
		equal(testEl.clientWidth, 200, "style added to the page");
		document.body.removeChild(testEl);
		System.instantiate = instantiate;
		start();
		
	}, function(e){
		ok(false, "got error "+e);
		start();
	});
});

QUnit.start();
