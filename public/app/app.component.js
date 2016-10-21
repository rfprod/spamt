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
var http_1 = require('@angular/http');
var common_1 = require('@angular/common');
var router_deprecated_1 = require('@angular/router-deprecated');
var app_routes_1 = require('./app.routes');
var app_nav_component_1 = require('./components/app-nav.component');
var app_info_component_1 = require('./components/app-info.component');
var dashboard_intro_component_1 = require('./components/dashboard-intro.component');
var dashboard_details_component_1 = require('./components/dashboard-details.component');
var event_emitter_service_1 = require('./services/event-emitter.service');
var AppComponent = (function () {
    function AppComponent(el, emitter) {
        this.el = el;
        this.emitter = emitter;
        console.log('this.el.nativeElement', this.el.nativeElement);
    }
    AppComponent.prototype.startSpinner = function () {
        console.log('spinner start');
    };
    AppComponent.prototype.stopSpinner = function () {
        console.log('spinner stop');
    };
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log('ngOnInit: AppComponent initialized');
        $('#init-spinner').remove();
        this.subscription = this.emitter.getEmitter().subscribe(function (message) {
            console.log('app consuming event:', message);
            if (message.sys === 'start spinner') {
                console.log('starting spinner');
                _this.startSpinner();
            }
            if (message.sys === 'stop spinner') {
                console.log('stopping spinner');
                _this.stopSpinner();
            }
        });
    };
    AppComponent.prototype.ngOnDestroy = function () {
        console.log('ngOnDestroy: AppComponent destroyed');
        this.subscription.unsubscribe();
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'spamt',
            template: "\n\t\t<app-nav></app-nav>\n\t\t<router-outlet></router-outlet>\n\t\t<app-info></app-info>\n\t",
            providers: [
                router_deprecated_1.ROUTER_PROVIDERS, core_1.provide(common_1.LocationStrategy, { useClass: common_1.HashLocationStrategy }),
                event_emitter_service_1.EventEmitterService,
                http_1.HTTP_PROVIDERS, http_1.ConnectionBackend,
            ],
            directives: [app_nav_component_1.AppNavComponent, app_info_component_1.AppInfoComponent, dashboard_intro_component_1.DashboardIntroComponent, dashboard_details_component_1.DashboardDetailsComponent, router_deprecated_1.ROUTER_DIRECTIVES],
        }),
        router_deprecated_1.RouteConfig(app_routes_1.APP_ROUTES), 
        __metadata('design:paramtypes', [core_1.ElementRef, event_emitter_service_1.EventEmitterService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map