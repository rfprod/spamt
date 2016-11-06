"use strict";
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var app_module_1 = require('./app.module');
var platform = platform_browser_dynamic_1.platformBrowserDynamic();
platform.bootstrapModule(app_module_1.AppModule)
    .catch(function (err) {
    console.log('platform bootstrap error:', err);
});
//# sourceMappingURL=app.js.map