/*
*	SystemJS Extrac configuration for Angular 2
*/
(function (global) { // eslint-disable-line no-unused-vars
	System.config({
		// Map tests
		map: {
			/*
			'@angular/core/testing': '/base/node_modules/@angular/core/bundles/core-testing.umd.js',
			'@angular/common/testing': '/base/node_modules/@angular/common/bundles/common-testing.umd.js',
			'@angular/compiler/testing': '/base/node_modules/@angular/compiler/bundles/compiler-testing.umd.js',
			'@angular/platform-browser/testing': '/base/node_modules/@angular/platform-browser/bundles/platform-browser-testing.umd.js',
			'@angular/platform-browser-dynamic/testing': '/base/node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
			'@angular/http/testing': '/base/node_modules/@angular/http/bundles/http-testing.umd.js',
			'@angular/router/testing': '/base/node_modules/@angular/router/bundles/router-testing.umd.js',
*/
			'test': './base/public/test/client/dashboard-intro.component.spec.js'
		},
	});
})(this);
