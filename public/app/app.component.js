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
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, event_emitter_service_1.EventEmitterService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map