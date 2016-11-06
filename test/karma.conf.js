module.exports = function(config){
  config.set({
	  
		basePath : '../',
		
		files : [
			'public/bower_components/jquery-2.2.4.min/index.js',
			'public/bower_components/d3/d3.js',
			'public/bower_components/nvd3/build/nv.d3.js',

			'node_modules/es6-shim/es6-shim.js',
			'node_modules/reflect-metadata/Reflect.js',
			{ pattern: 'node_modules/reflect-metadata/Reflect.js.map', included: false, watched: false },

			'node_modules/systemjs/dist/system.src.js',
			'node_modules/systemjs/dist/system-polyfills.js',
			{ pattern: 'node_modules/systemjs/dist/system-polyfills.js.map', included: false, watched: false },

			'node_modules/zone.js/dist/zone.js',
			'node_modules/zone.js/dist/proxy.js',
			'node_modules/zone.js/dist/sync-test.js',
			'node_modules/zone.js/dist/jasmine-patch.js',
			'node_modules/zone.js/dist/async-test.js',
			'node_modules/zone.js/dist/fake-async-test.js',

			//'systemjs.config.js',
			//'systemjs.config.extras.js',
			{ pattern: 'systemjs.config.js', included: false, watched: false },
			{ pattern: 'systemjs.config.extras.js', included: false, watched: false },
			'test/karma.test-shim.js'
		],

		proxies: {
			'public/app/': 'base/public/app/'
		},

		// exclude: [],

		frameworks: ['jasmine'],

		// preprocessors: {},

		browsers: ['PhantomJS'],
		// browsers: ['Chrome'],
		// browsers : ['Firefox'],
		phantomjsLauncher: {
			/*
			*	exit phantomjs if a ResourceError is encountered
			*	useful if karma exits without killing phantomjs)
			*/
			exitOnResourceError: true
		},
		
		plugins : [
		//    'karma-chrome-launcher',
		//    'karma-firefox-launcher',
			'karma-phantomjs-launcher',
			'karma-jasmine'
		],

		// reporters: [],

		failOnEmptyTestSuite: false, // overrides the error, warn instead - by default returns error if there're no tests defined

		hostname: process.env.IP,
		port: process.env.PORT,
		runnerPort: 0,

		autoWatch: true,
		singleRun: true,
		logLevel: config.LOG_DEBUG,
		colors: true

  });
};
