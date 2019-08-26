'use strict';


var fs = require('fs');
var path = require('path');

var lib = {
	/**
	 * Function that find the root path where grunt plugins are installed.
	 *
	 * @method findRoot
	 * @return String rootPath
	 */
	findRoot: function () {
		var cwd = process.cwd();
		var rootPath = cwd;
		var newRootPath = null;
		while (!fs.existsSync(path.join(process.cwd(), "node_modules/grunt"))) {
			process.chdir("..");
			newRootPath = process.cwd();
			if (newRootPath === rootPath) {
				return;
			}
			rootPath = newRootPath;
		}
		process.chdir(cwd);
		return rootPath;
	},
	/**
	 * Function load the npm tasks from the root path
	 *
	 * @method loadTasks
	 * @param grunt {Object} The grunt instance
	 * @param tasks {Array} Array of tasks as string
	 */
	loadTasks: function (grunt, rootPath, tasks) {
		tasks.forEach(function (name) {
			if (name === 'grunt-cli') return;
			var cwd = process.cwd();
			process.chdir(rootPath); // load files from proper root, I don't want to install everything locally per module!
			grunt.loadNpmTasks(name);
			process.chdir(cwd);
		});
	}
};

module.exports = function (grunt) {
	//Loading the needed plugins to run the grunt tasks
	var pluginsRootPath = lib.findRoot();
	lib.loadTasks(grunt, pluginsRootPath, ['grunt-contrib-jshint', 'grunt-jsdoc', 'grunt-contrib-clean', 'grunt-mocha-test', 'grunt-env'
		, 'grunt-istanbul', 'grunt-coveralls', 'grunt-babel', 'grunt-contrib-copy']);
	grunt.initConfig({
		babel: {
			options: {
				sourceMap: true,
				presets: ['@babel/preset-env'],
			},
			dist: {
				files: [{
					"expand": true,
					"src": [
						'test/**/*.js', 'test/*.js', 'test/unit/*.js', 'test/unit/**/*.js', 'test/unit/***/**/*.js',
						'*.js', 'container/**/*.js', 'infra/*.js', 'infra/**/*.js',
						'infra/***/**/*.js', 'lib/*.js', 'lib/**/*.js', 'lib/***/**/*.js', 'lib/****/***/**/*.js'
					],
					"dest": "dist/"
				}]
			}
		},
		
		//Defining jshint tasks
		jshint: {
			options: {
				"bitwise": true,
				"eqeqeq": true,
				"forin": true,
				"newcap": true,
				"noarg": true,
				"undef": true,
				"unused": false,
				"eqnull": true,
				"laxcomma": true,
				"loopfunc": true,
				"sub": true,
				"supernew": true,
				"validthis": true,
				"node": true,
				"maxerr": 100,
				"indent": 2,
				"globals": {
					"describe": false,
					"it": false,
					"before": false,
					"beforeEach": false,
					"after": false,
					"afterEach": false
				},
				ignores: ['test/coverage/**/*.js']
			},
			files: {
				src: ['**/*.js']
			},
			gruntfile: {
				src: 'Gruntfile.js'
			}
		},
		// jsdoc: {
		//   doc : {
		//     src: ['soajs/**/*.js'],
		//     jsdoc: pluginsRootPath+'/node_modules/grunt-jsdoc/node_modules/jsdoc/jsdoc',
		//     options: {
		//       dest: 'doc',
		//     }
		//   }
		// },
		
		env: {
			mochaTest: {
				SOAJS_ENV: "dev",
				APP_DIR_FOR_CODE_COVERAGE: '../../test/coverage/instrument/dist/',
				SOAJS_DAEMON_GRP_CONF: 'group1',
				SOAJS_IMAGE_PREFIX : "soajsorg",
				SOAJS_TEST_KUBE_PORT: '8080'
			},
			coverage: {
				SOAJS_ENV: "dev",
				APP_DIR_FOR_CODE_COVERAGE: '../../test/coverage/instrument/dist/',
				SOAJS_DAEMON_GRP_CONF: 'group1',
				SOAJS_IMAGE_PREFIX : "soajsorg",
				SOAJS_TEST_KUBE_PORT: '8080',
				SOAJS_CLOOSTRO_TEST: 1
			}
		},
		
		clean: {
			doc: {
				src: ['doc/']
			},
			coverage: {
				src: ['test/coverage/']
			}
		},
		
		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: 'lib/schemas/kubernetes/swagger',
						dest: 'test/coverage/instrument/dist/lib/schemas/kubernetes/swagger',
						src: '**/*',
					},
				]
			}
		},
		
		instrument: {
			files: [
				'dist/*.js', 'dist/container/**/*.js', 'dist/infra/*.js', 'dist/infra/**/*.js', 'dist/infra/***/**/*.js',
				'dist/lib/*.js', 'dist/lib/**/*.js', 'dist/lib/***/**/*.js', 'dist/lib/****/***/**/*.js', 'swagger.json'],
			options: {
				lazy: false,
				basePath: 'test/coverage/instrument/'
			}
		},
		
		storeCoverage: {
			options: {
				dir: 'test/coverage/reports'
			}
		},
		
		makeReport: {
			src: 'test/coverage/reports/**/*.json',
			options: {
				type: 'lcov',
				dir: 'test/coverage/reports',
				print: 'detail'
			}
		},
		
		mochaTest: {
			unitTest: {
				options: {
					reporter: 'spec',
					timeout: 90000
				},
				src: ['dist/test/unit/*.js', 'dist/test/unit/**/*.js', 'dist/test/unit/***/**/*.js']
			}
		},
		
		coveralls: {
			options: {
				// LCOV coverage file relevant to every target
				src: 'test/coverage/reports/lcov.info',
				
				// When true, grunt-coveralls will only print a warning rather than
				// an error, to prevent CI builds from failing unnecessarily (e.g. if
				// coveralls.io is down). Optional, defaults to false.
				force: false
			},
			your_target: {
				// Target-specific LCOV coverage file
				src: 'test/coverage/reports/lcov.info'
			}
		}
	});
	
	process.env.SHOW_LOGS = grunt.option('showLogs');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.registerTask("default", ['copy', 'babel', 'jshint']);
	grunt.registerTask("integration", ['env:mochaTest', 'mochaTest:integration']);
	grunt.registerTask("unit", ['env:mochaTest', 'instrument', 'mochaTest:unit']);
	//grunt.registerTask("test", ['unit','integration']);
	grunt.registerTask("test", ['clean', 'copy', 'env:coverage', 'instrument', 'mochaTest:unit', 'mochaTest:integration']);
	grunt.registerTask("coverage", ['clean', 'copy', 'babel', 'env:coverage', 'instrument', 'mochaTest:unitTest', 'storeCoverage', 'makeReport', 'coveralls']);
	//grunt.registerTask("coverage", ['clean', 'env:coverage', 'instrument', 'mochaTest:unit', 'mochaTest:integration', 'storeCoverage', 'makeReport']);
	
};
