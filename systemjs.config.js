/*
*	SystemJS configuration for Angular 2
*	Override at the last minute with global.filterSystemConfig (as plunkers do)
*/
(function (global) { // eslint-disable-line no-unused-vars

	var paths = {
		'npm:': 'node_modules'
	};

	// external packages locations
	var map = {
		'app':                        './public/app',
		'ng2-nvd3':                   './node_modules/ng2-nvd3/build/lib',
		'rxjs':                       './node_modules/rxjs',
		'angular-in-memory-web-api': 	'./node_modules/angular-in-memory-web-api',
		'traceur': 										'./node_modules/traceur/bin',
		'@angular':                   './node_modules/@angular'
	};
	// how to load external packages when no filename and/or no extension is provided
	var packages = {
		'app':                        { main: 'app', defaultExtension: 'js' },
		'ng2-nvd3':                   { main: 'ng2-nvd3', defaultExtension: 'js' },
		'rxjs':                       { defaultExtension: 'js' },
		'traceur':                    { main: 'traceur' },
		'angular-in-memory-web-api': 	{ main: './index', defaultExtension: 'js' }
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
		//'@angular/testing'
	];
	// add package entries for angular packages in the form '@angular/common': { main: 'index.js', defaultExtension: 'js' }
	packageNames.forEach(function(pkgName) {
		packages[pkgName] = { main: 'index', defaultExtension: 'js' };
	});

	var config = {
		paths: paths,
		map: map,
		packages: packages
	};

	System.config(config);

})(this);
