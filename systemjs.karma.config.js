/*
*	SystemJS configuration for Angular 2
*	Override at the last minute with global.filterSystemConfig (as plunkers do)
*/
(function (global) { // eslint-disable-line no-unused-vars

	// external packages locations
	var map = {
		'app':                        './base/public/app',
		'ng2-nvd3':                   './base/node_modules/ng2-nvd3/build/lib',
		'rxjs':                       './base/node_modules/rxjs',
		'angular-in-memory-web-api': 	'./base/node_modules/angular-in-memory-web-api',
		'traceur': 										'./base/node_modules/traceur/bin',
		'@angular':                   './base/node_modules/@angular'
	};
	// how to load external packages when no filename and/or no extension is provided
	var packages = {
		'app':                        { main: 'app', defaultExtension: 'js' },
		'ng2-nvd3':                   { main: 'ng2-nvd3', defaultExtension: 'js' },
		'rxjs':                       { defaultExtension: 'js' },
		'traceur':                    { main: 'traceur' },
		'angular-in-memory-web-api': 	{ main: 'index', defaultExtension: 'js' }
	};

	// angular packages names
	var packageNames = [
		'@angular/core',
		'@angular/common',
		'@angular/compiler',
		'@angular/forms',
		'@angular/platform-browser',
		'@angular/platform-browser-dynamic',
		'@angular/http',
		'@angular/router'
	];
	// add package entries for angular packages in the form '@angular/common': { main: 'index.js', defaultExtension: 'js' }
	packageNames.forEach(function(pkgName) {
		packages[pkgName] = { main: 'index', defaultExtension: 'js' };
	});

	var config = {
		map: map,
		packages: packages
	};

	System.config(config);

})(this);
