/*
*	SystemJS configuration for Angular 4+
*/
(function (global) { // eslint-disable-line no-unused-vars

	var paths = {
		'npm:': './node_modules/'
	};
	// packages locations
	var map = {
		'app': 																	'./public/app',
		'ng2-nvd3': 														'npm:ng2-nvd3/build/lib',
		'rxjs': 																'npm:rxjs',
		'traceur': 															'npm:traceur/bin',
		'@angular/animations': 									'npm:@angular/animations/bundles/animations.umd.js',
		'@angular/animations/browser': 					'npm:@angular/animations/bundles/animations-browser.umd.js',
		'@angular/core': 												'npm:@angular/core/bundles/core.umd.js',
		'@angular/common': 											'npm:@angular/common/bundles/common.umd.js',
		'@angular/compiler': 										'npm:@angular/compiler/bundles/compiler.umd.js',
		'@angular/forms': 											'npm:@angular/forms/bundles/forms.umd.js',
		'@angular/http': 												'npm:@angular/http/bundles/http.umd.js',
		'@angular/platform-browser': 						'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
		'@angular/platform-browser/animations':	'npm:@angular/platform-browser/bundles/platform-browser-animations.umd.js',
		'@angular/platform-browser-dynamic': 		'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
		'@angular/router': 											'npm:@angular/router/bundles/router.umd.js',
		'@angular/flex-layout': 								'npm:@angular/flex-layout/bundles/flex-layout.umd.js',
		'@angular/material': 										'npm:@angular/material/bundles/material.umd.js',
		'@angular/cdk': 												'npm:@angular/cdk/bundles/cdk.umd.js'
	};
	// how to load packages
	var packages = {
		'app':                        { main: 'app', defaultExtension: 'js' },
		'ng2-nvd3':                   { main: 'ng2-nvd3', defaultExtension: 'js' },
		'rxjs':                       { main: 'Rx', defaultExtension: 'js' },
		'traceur':                    { main: 'traceur', defaultExtension: 'js' }
	};

	var config = {
		paths: paths,
		map: map,
		packages: packages
	};

	System.config(config);

})(this);
