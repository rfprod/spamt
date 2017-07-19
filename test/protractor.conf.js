exports.config = {

	// Special option for Angular 2 - test all Angular 2 apps
	useAllAngular2AppRoots: true,
	// instead one root element which should be tested can be specified
	//rootElement: 'root',

	onPrepare: function() {
		browser.driver.get('http://localhost:8080/public/index.html');
	},

	specs: [
		'e2e/*.js'
	],

	capabilities: {
		/*
		*	headless chrome testing
		*	removed PhantomJS from here completely because of errors for unknown reasons
		*	which comsume way too much time to deal with
		*/
		browserName: 'chrome',
		chromeOptions: {
			args: [ '--headless', '--disable-gpu', '--window-size=1024x768' ]
		}
	},

	chromeOnly: false,

	directConnect: false,

	baseUrl: 'http://localhost:8080/',

	framework: 'jasmine',

	allScriptsTimeout: 5000000,

	getPageTimeout: 5000000,

	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 30000
	}
};
