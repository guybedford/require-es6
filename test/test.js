module("SystemJS");

var makeAsyncTest = function(testData){
	
	asyncTest(testData.name, function(){
		var timer = setTimeout(function(){
			ok(false, "neither complete nor error called in time");
			start();
			console.log("starting ...")
		},5000)
		
		var complete = function(){
			clearTimeout(timer);
			var result = testData.confirm.apply(this, arguments);
			if(result) {
				ok(false, result);
			} else {
				ok(true, "test passed successfully");
			}
			start();
		};
		var err = function(data){
			clearTimeout(timer);
			ok(false, "Error called with "+data);
			start();
		};
		testData.run(complete, err)
	});
	
};


var oldTests = [
      {
        name: 'Error handling',
        run: function(complete, err) {
          System['import']('tests/error').then(err, complete);
        },
        confirm: function() {
          return;
        }
      },
      {
        name: 'Global script loading',
        run: function(complete, err) {
          System['import']('tests/global').then(complete, err);
        },
        confirm: function(m) {
          if (!m.jQuery || !m.another) {
          	return 'Global objects not defined';
          }
        }
      },
      {
        name: 'Global script with multiple objects the same',
        run: function(complete, err) {
          System['import']('tests/global-multi').then(complete, err);
        },
        confirm: function(m) {
          if (m.jquery != 'here')
            return 'Multi globals not detected';
        }
      },
      {
        name: 'Global script loading with inline shim',
        run: function(complete, err) {
          System['import']('tests/global-inline-dep').then(complete, err);
        },
        confirm: function(m) {
          if (m != '1.8.3')
            return 'Global dependency not defined';
        }
      },
      {
        name: 'Global script with inline exports',
        run: function(complete, err) {
          System['import']('tests/global-inline-export').then(complete, err);
        },
        confirm: function(m) {
          if (m != 'r')
            return 'Inline export not applied'
        }
      },
      {
        name: 'Global script with shim config',
        run: function(complete, err) {
          System.shim['tests/global-shim-config'] = ['./global-shim-config-dep'];
          System['import']('tests/global-shim-config').then(complete, err);
        },
        confirm: function(m) {
          if (m != 'shimmed')
            return 'Not shimmed';
        }
      },
      {
        name: 'Global script loading that detects as AMD with shim config',
        run: function(complete, err) {
          System.shim['tests/global-shim-amd'] = true;
          System['import']('tests/global-shim-amd').then(complete, err);
        },
        confirm: function(m) {
          if (m != 'global')
            return 'not shimmed';
        }
      },
      {
        name: 'Support the empty module',
        run: function(complete, err) {
          System['import']('@empty').then(complete, err);
        },
        confirm: function(m) {
          if (!m)
            return 'no empty module';
        }
      },
      {
        name: 'Global script with shim config exports',
        run: function(complete, err) {
          System.shim['tests/global-shim-config-exports'] = { exports: 'p' };
          System['import']('tests/global-shim-config-exports').then(complete, err);
        },
        confirm: function(m) {
          if (m != 'export')
            return 'Exports not shimmed';
        }
      },
      {
        name: 'Map configuration',
        run: function(complete, err) {
          System.map['maptest'] = 'tests/map-test';
          System['import']('maptest').then(complete, err)
        },
        confirm: function(m) {
          if (m.maptest != 'maptest')
            return 'Mapped module not loaded';
        }
      },
      {
        name: 'Map configuration subpath',
        run: function(complete, err) {
          System['import']('maptest/sub').then(complete, err)
        },
        confirm: function(m) {
          if (m.maptest != 'maptestsub')
            return 'Mapped folder not loaded';
        }
      },
      {
        name: 'Contextual map configuration',
        run: function(complete, err) {
          System.map['tests/contextual-map'] = {
            maptest: 'tests/contextual-map-dep'
          };
          System['import']('tests/contextual-map').then(complete, err);
        },
        confirm: function(m) {
          if (m.mapdep != 'mapdep')
            return 'Contextual map dep not loaded';
        }
      },
      {
        name: 'Submodule contextual map configuration',
        run: function(complete, err) {
          System.map['tests/subcontextual-map'] = {
            dep: 'tests/subcontextual-mapdep'
          };
          System['import']('tests/subcontextual-map/submodule').then(complete, err);
        },
        confirm: function(m) {
          if (m != 'submapdep')
            return 'Submodule contextual map not loaded';
        }
      },
      {
        name: 'Contextual map with shim',
        run: function(complete, err) {
          System.shim['tests/shim-map-test'] = {
            deps: ['shim-map-dep']
          };
          System.map['tests/shim-map-test'] = {
            'shim-map-dep': 'tests/shim-map-test-dep'
          };
          System['import']('tests/shim-map-test').then(complete, err);
        },
        confirm: function(m) {
          if (m != 'depvalue')
            return 'shim dep not loaded';
        }
      },
      {
        name: 'Loading an AMD module',
        run: function(complete, err) {
          System['import']('tests/amd-module').then(complete, err);
        },
        confirm: function(m) {
          if (m.amd != true)
            return 'Incorrect module';
          if (m.dep.amd != 'dep')
            return 'Dependency not defined';
        }
      },
      {
        name: 'Loading an AMD named define',
        run: function(complete, err) {
          System['import']('tests/nameddefine').then(function(m1){
          	if (!m1.converter) {
          		err( 'Showdown not loaded!' );
          	} else {
          		System['import']('another-define').then(complete, err)
          	}
           	 
          }, err);
        },
        confirm: function(m) {
          if (m.named !== "define") {
          	return 'Another module is not defined';
          }
            
        }
      },
      {
        name: 'Loading AMD CommonJS form',
        run: function(complete, err) {
          System['import']('tests/amd-cjs-module').then(complete, err);
        },
        confirm: function(m) {
          if (m.test != 'hi')
            return 'Not defined';
        }
      },
      {
        name: 'Loading a CommonJS module',
        run: function(complete, err) {
          System['import']('tests/common-js-module').then(complete, err);
        },
        confirm: function(m) {
          if (m.hello != 'world')
            return 'module value not defined';
          if (m.first != 'this is a dep')
            return 'dep value not defined';
        }
      },
      {
        name: 'Loading a UMD module',
        run: function(complete, err) {
          System['import']('tests/umd').then(complete, err);
        },
        confirm: function(m) {
          if (m.d != 'hi')
            return 'module value not defined';
        }
      },
      {
        name: 'Loading AMD with format hint',
        run: function(complete, err) {
          System['import']('tests/amd-format').then(complete, err);
        },
        confirm: function(m) {
          if (m.amd != 'amd')
            return 'AMD not loaded';          
        }
      },
      {
        name: 'Loading CJS with format hint',
        run: function(complete, err) {
          System['import']('tests/cjs-format').then(complete, err);
        },
        confirm: function(m) {
          if (m.cjs != 'cjs')
            return 'CJS not loaded';
        }
      },
      {
        name: 'Versions support',
        run: function(complete, err) {
          System.versions['tests/versioned'] = '2.0.3';
          System['import']('tests/versioned@^2.0.3').then(complete, err);
        },
        confirm: function(m) {
          if (m.version != '2.3.4')
            return 'Version not loaded';
        }
      },
      {
        name: 'Simple compiler Plugin',
        run: function(complete, err) {
          System.map['coffee'] = 'tests/compiler-plugin';
          System['import']('tests/compiler-test.coffee!').then(complete, err);
        },
        confirm: function(m) {
          if (m.output != 'plugin output')
            return 'Plugin not working.';
          if (m.extra != 'yay!')
            return 'Compiler not working.';
        }
      },
      {
        name: 'Mapping to a plugin',
        run: function(complete, err) {
          System.map['pluginrequest'] = 'tests/compiled.coffee!';
          System.map['coffee'] = 'tests/compiler-plugin';
          System['import']('pluginrequest').then(complete, err);
        },
        confirm: function(m) {
          if (m.extra != 'yay!')
            return 'Plugin not applying.';
        }
      },
      {
        name: 'Mapping a plugin argument',
        run: function(complete, err) {
          System.map['bootstrap'] = 'tests/bootstrap@^3.1.1';
          System.versions['tests/bootstrap'] = '3.1.1';
          System['import']('bootstrap/test.coffee!coffee').then(complete, err);
        },
        confirm: function(m) {
          if (m.extra != 'yay!')
            return 'not working';
        }
      },
      {
        name: 'Legacy plugin',
        run: function(complete, err) {
          System['import']('tests/global.js!tests/legacy-plugin').then(complete, err);
        },
        confirm: function(m) {
        }
      },
      {
        name: 'Advanced compiler plugin',
        run: function(complete, err) {
          System['import']('tests/compiler-test!tests/advanced-plugin').then(complete, err);
        },
        confirm: function(m) {
          if (m != 'custom fetch:tests/compiler-test!tests/advanced-plugin')
            return m;
        }
      },
      {
        name: 'Loading from jspm',
        run: function(complete, err) {
          System.paths['npm:*'] = 'https://npm.jspm.io/*.js';
          System['import']('npm:underscore').then(complete, err);
        },
        confirm: function(m) {
          if (!m || typeof m.chain != 'function')
            return 'Not loaded';
        }
      },
      {
        name: 'Wrapper module support',
        run: function(complete, err) {
          System['import']('tests/wrapper').then(complete, err);
        },
        confirm: function(m) {
          if (m['default'] != 'default1')
            return 'Wrapper module not defined.';
        }
      },
      {
        name: 'Basic exporting & importing',
        run: function(complete, err) {
          var m1, m2, m3, m4, err;
          var checkComplete = function() {
            if (m1 && m2 && m3 && m4 && err)
              complete(m1, m2, m3, m4);
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
        },
        confirm: function(m1, m2, m3, m4) {
          if (m1['default'] != 'default1')
            return 'Error defining default 1';
          if (m2['default'] != 'default2')
            return 'Error defining default 2';
          if (m3['default'] != 'default3')
            return 'Error defining default 3';
          if (m4.test != 'default3')
            return 'Error defining module';
        }
      },
      {
        name: 'Importing a mapped loaded module',
        run: function(complete, err) {
          System.map['default1'] = 'tests/default1';
          System['import']('default1').then(function() {
            System['import']('default1').then(complete, err);
          }, err);
        },
        confirm: function(m) {
          if (!m)
            return 'no module';
        }
      },
      {
        name: 'Loading ES6 with format hint',
        run: function(complete, err) {
          System['import']('tests/es6-format').then(complete, err);
        },
        confirm: function(m) {
        }
      },
      {
        name: 'Module Name meta',
        run: function(complete, err) {
          System['import']('tests/reflection').then(complete, err);
        },
        confirm: function(m) {
          if (m.myname != 'tests/reflection')
            return 'Module name not returned';
        }
      },
      {
        name: 'Relative dyanamic loading',
        run: function(complete, err) {
          System['import']('tests/reldynamic').then(function(m) {
            m.dynamicLoad().then(complete, err);
          }, err);
        },
        confirm: function(m) {
          if (m.dynamic != 'module')
            return 'Dynamic load failed';
        }
      }
    ];

for(var i=0; i < oldTests.length; i++) {
	makeAsyncTest(oldTests[i])
}

