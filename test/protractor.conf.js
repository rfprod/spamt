exports.config = {

	useAllAngular2AppRoots: true,

	onPrepare: function() {
		browser.driver.get('http://localhost:8080/public/index.html');

		return browser.getProcessedConfig().then((config) => {
			// console.log('config:', config);
		});
	},

	specs: [
		'e2e/*.js'
	],

	capabilities: {
		browserName: 'chrome',
		chromeOptions: {
			args: [ '--headless', '--disable-gpu', '--window-size=1024x768' ]
		}
	},

	chromeOnly: true,

	directConnect: true,

	baseUrl: 'http://localhost:8080/',

	framework: 'jasmine',

	plugins: [
		{
			package: 'jasmine2-protractor-utils',
			disableHTMLReport: false,
			disableScreenshot: false,
			screenshotOnExpectFailure: true, // default: false
			screenshotOnSpecFailure: true, // default: false
			screenshotPath: 'logs/e2e/screenshots', // default: 'reports/screenshots'
			clearFoldersBeforeTest: true, // default: false
			htmlReportDir: 'logs/e2e/report', // default: 'reports/htmlReports'
			failTestOnErrorLog: {
				failTestOnErrorLogLevel: 5000 // default: 900
			}
		}
	],

	allScriptsTimeout: 5000000,

	getPageTimeout: 5000000,

	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 30000
	}
};
