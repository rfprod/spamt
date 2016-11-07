"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var common_1 = require('@angular/common');
var platform_browser_1 = require('@angular/platform-browser');
var forms_1 = require('@angular/forms');
var http_1 = require('@angular/http');
var router_1 = require('@angular/router');
var app_routes_1 = require('./app.routes');
var app_component_1 = require('./app.component');
var app_nav_component_1 = require('./components/app-nav.component');
var app_info_component_1 = require('./components/app-info.component');
var dashboard_intro_component_1 = require('./components/dashboard-intro.component');
var dashboard_details_component_1 = require('./components/dashboard-details.component');
var event_emitter_service_1 = require('./services/event-emitter.service');
var user_details_service_1 = require('./services/user-details.service');
var server_static_data_service_1 = require('./services/server-static-data.service');
var public_data_service_1 = require('./services/public-data.service');
var ng2_nvd3_1 = require('ng2-nvd3');
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            declarations: [app_component_1.AppComponent, app_nav_component_1.AppNavComponent, app_info_component_1.AppInfoComponent, dashboard_intro_component_1.DashboardIntroComponent, dashboard_details_component_1.DashboardDetailsComponent, ng2_nvd3_1.nvD3],
            imports: [platform_browser_1.BrowserModule, forms_1.FormsModule, http_1.HttpModule, router_1.RouterModule.forRoot(app_routes_1.APP_ROUTES)],
            providers: [{ provide: common_1.LocationStrategy, useClass: common_1.HashLocationStrategy }, event_emitter_service_1.EventEmitterService, user_details_service_1.UserDetailsService, server_static_data_service_1.ServerStaticDataService, public_data_service_1.PublicDataService],
            schemas: [core_1.CUSTOM_ELEMENTS_SCHEMA],
            bootstrap: [app_component_1.AppComponent],
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map