/*
*	SystemJS configuration for Angular 2
*	Override at the last minute with global.filterSystemConfig (as plunkers do)
*/
(function (global) { // eslint-disable-line no-unused-vars

	var paths = {
		'npm:': './node_modules/'
	};
	// external packages locations
	var map = {
		'app': 																	'./public/app',
		'ng2-nvd3': 														'npm:ng2-nvd3/build/lib',
		'rxjs': 																'npm:rxjs',
		'traceur': 															'npm:traceur/bin',
		'@angular/core': 												'npm:@angular/core/bundles',
		'@angular/common': 											'npm:@angular/common/bundles',
		'@angular/compiler': 										'npm:@angular/compiler/bundles',
		'@angular/forms': 											'npm:@angular/forms/bundles',
		'@angular/http': 												'npm:@angular/http/bundles',
		'@angular/platform-browser': 						'npm:@angular/platform-browser/bundles',
		'@angular/platform-browser/animations':	'npm:@angular/platform-browser/bundles',
		'@angular/platform-browser-dynamic': 		'npm:@angular/platform-browser-dynamic/bundles',
		'@angular/router': 											'npm:@angular/router/bundles'
	};
	// external packages main files
	var packages = {
		'app':                        { main: 'app', defaultExtension: 'js' },
		'ng2-nvd3':                   { main: 'ng2-nvd3', defaultExtension: 'js' },
		'rxjs':                       { defaultExtension: 'js' },
		'traceur':                    { main: 'traceur', defaultExtension: 'js' },

		'@angular/core': 												{ main: 'core', defaultExtension: 'umd.js' },
		'@angular/common': 											{ main: 'common', defaultExtension: 'umd.js' },
		'@angular/compiler': 										{ main: 'compiler', defaultExtension: 'umd.js' },
		'@angular/forms': 											{ main: 'forms', defaultExtension: 'umd.js' },
		'@angular/http': 												{ main: 'http', defaultExtension: 'umd.js' },
		'@angular/platform-browser': 						{ main: 'platform-browser', defaultExtension: 'umd.js' },
		'@angular/platform-browser-dynamic': 		{ main: 'platform-browser-dynamic', defaultExtension: 'umd.js' },
		'@angular/router': 											{ main: 'router', defaultExtension: 'umd.js' }
	};

	var config = {
		paths: paths,
		map: map,
		packages: packages
	};

	System.config(config);

})(this);
