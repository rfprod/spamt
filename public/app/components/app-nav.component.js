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
var router_deprecated_1 = require('@angular/router-deprecated');
var event_emitter_service_1 = require('../services/event-emitter.service');
var AppNavComponent = (function () {
    function AppNavComponent(emitter) {
        this.emitter = emitter;
        this.navButtonsState = [false, false, false];
    }
    AppNavComponent.prototype.switchNavButtons = function (event, isClick) {
        var route, index;
        console.log('switchNavButtons:', event);
        if (isClick) {
            if (event.target.localName === 'i') {
                route = event.target.parentElement.href;
            }
            else {
                route = event.target.href;
            }
        }
        else {
            route = event.route;
        }
        if (route.indexOf('/intro') !== -1) {
            index = 1;
        }
        else {
            if (route.indexOf('/data') !== -1) {
                index = 2;
            }
            else {
                index = 0;
            }
        }
        for (var b in this.navButtonsState) {
            if (b === index) {
                this.navButtonsState[b] = true;
            }
            else {
                this.navButtonsState[b] = false;
            }
        }
    };
    AppNavComponent.prototype.stopWS = function () {
        /*
        *	this function should be executed before user is sent to any external resource
        *	on click on an anchor object if a resource is loaded in the same tab
        */
        console.log('close websocket event emitted');
        this.emitter.emitEvent({ sys: 'close websocket' });
    };
    AppNavComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log('ngOnInit: AppNavComponent initialized');
        // check active route on app init - app-nav loads once on app init
        this.subscription = this.emitter.getEmitter().subscribe(function (message) {
            console.log('/app-nav consuming event:', message);
            if (typeof message.route !== 'undefined') {
                console.log('route is defined');
                _this.switchNavButtons(message, false);
                _this.subscription.unsubscribe();
            }
        });
    };
    AppNavComponent.prototype.ngOnDestroy = function () {
        console.log('ngOnDestroy: AppNavComponent destroyed');
    };
    AppNavComponent = __decorate([
        core_1.Component({
            selector: 'app-nav',
            templateUrl: "/public/app/views/dashboard-nav.html",
            providers: [],
            directives: [router_deprecated_1.ROUTER_DIRECTIVES, common_1.NgClass],
        }), 
        __metadata('design:paramtypes', [event_emitter_service_1.EventEmitterService])
    ], AppNavComponent);
    return AppNavComponent;
}());
exports.AppNavComponent = AppNavComponent;
//# sourceMappingURL=app-nav.component.js.map