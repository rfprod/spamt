/*
*	SystemJS configuration for Angular 2
*	Override at the last minute with global.filterSystemConfig (as plunkers do)
*/
(function(global) { // eslint-disable-line no-unused-vars

	// external packages locations
	var map = {
		'app':                        './public/app',
		'ng2-nvd3':                   './node_modules/ng2-nvd3/build/lib',
		'ng2-spin-kit':               './node_modules/ng2-spin-kit/app',
		'rxjs':                       './node_modules/rxjs',
		'angular2-websocket':         './node_modules/angular2-websocket',
		'angular2-in-memory-web-api': './node_modules/angular2-in-memory-web-api',
		'@angular':                   './node_modules/@angular'
	};
	// how to load external packages when no filename and/or no extension is provided
	var packages = {
		'app':                        { main: 'app', defaultExtension: 'js' },
		'ng2-nvd3':                   { main: 'ng2-nvd3', defaultExtension: 'js' },
		'ng2-spin-kit':               { main: 'spinners', defaultExtension: 'js' },
		'rxjs':                       { defaultExtension: 'js' },
		'angular2-websocket':         { defaultExtension: 'js' },
		'angular2-in-memory-web-api': { defaultExtension: 'js' }
	};

	// angular packages names
	var packageNames = [
		'@angular/core',
		'@angular/common',
		'@angular/compiler',
		'@angular/platform-browser',
		'@angular/platform-browser-dynamic',
		'@angular/http',
		'@angular/router-deprecated',
		'@angular/router',
		'@angular/testing'
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
