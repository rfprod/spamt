exports.config = {
	allScriptsTimeout: 11000,

	specs: [
		'e2e/*.js'
	],

	capabilities: {
		//'browserName': 'chrome'
		'browserName': 'phantomjs'
	},

	chromeOnly: true,

	baseUrl: 'http://localhost:8080/',

	framework: 'jasmine',

	jasmineNodeOpts: {
		defaultTimeoutInterval: 30000
	}
};
