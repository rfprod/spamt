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
var ng2_nvd3_1 = require('ng2-nvd3');
var angular2_websocket_1 = require('angular2-websocket/angular2-websocket');
var event_emitter_service_1 = require('../services/event-emitter.service');
var server_static_data_service_1 = require('../services/server-static-data.service');
var public_data_service_1 = require('../services/public-data.service');
var DashboardIntroComponent = (function () {
    function DashboardIntroComponent(el, emitter, serverStaticDataService, publicDataService) {
        this.el = el;
        this.emitter = emitter;
        this.serverStaticDataService = serverStaticDataService;
        this.publicDataService = publicDataService;
        this.title = 'SPAMT';
        this.description = 'Social Profile Analysis and Management Tool';
        this.wsUrl = 'ws://localhost:8080/app-diag/dynamic';
        this.countDown = 60;
        this.timerArr = [];
        this.chartOptions = {
            chart: {
                type: 'pieChart',
                height: 450,
                donut: true,
                x: function (d) { return d.key; },
                y: function (d) { return d.y; },
                showLabels: true,
                pie: {
                    startAngle: function (d) { return d.startAngle / 2 - Math.PI / 2; },
                    endAngle: function (d) { return d.endAngle / 2 - Math.PI / 2; },
                },
                duration: 1000,
                legend: {
                    margin: {
                        top: 5,
                        right: 140,
                        bottom: 5,
                        left: 0,
                    },
                },
            },
        };
        this.appUsageData = [
            {
                key: 'Default',
                y: 1,
            },
            {
                key: 'Default',
                y: 1,
            },
            {
                key: 'Default',
                y: 1,
            },
            {
                key: 'Default',
                y: 1,
            },
            {
                key: 'Default',
                y: 1,
            },
        ];
        this.serverData = {
            static: [],
            dynamic: []
        };
        this.ws = new angular2_websocket_1.$WebSocket(this.wsUrl);
        console.log('this.el.nativeElement:', this.el.nativeElement);
    }
    DashboardIntroComponent.prototype.getServerStaticData = function (callback) {
        var _this = this;
        this.serverStaticDataService.getData().subscribe(function (data) { return _this.serverData['static'] = data; }, function (error) { return _this.errorMessage = error; }, function () {
            console.log('getServerStaticData done, data:', _this.serverData['static']);
            callback(_this);
        });
    };
    DashboardIntroComponent.prototype.getPublicData = function (callback) {
        var _this = this;
        this.publicDataService.getData().subscribe(function (data) { return _this.appUsageData = data; }, function (error) { return _this.errorMessage = error; }, function () {
            console.log('getPublicData done, data:', _this.appUsageData);
            callback(_this);
        });
    };
    DashboardIntroComponent.prototype.emitSpinnerStartEvent = function () {
        console.log('root spinner start event emitted');
        this.emitter.emitEvent({ sys: 'start spinner' });
    };
    DashboardIntroComponent.prototype.emitSpinnerStopEvent = function () {
        console.log('root spinner stop event emitted');
        this.emitter.emitEvent({ sys: 'stop spinner' });
    };
    DashboardIntroComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log('ngOnInit: DashboardIntroComponent initialized');
        this.emitSpinnerStartEvent();
        this.emitter.emitEvent({ route: '/intro' });
        this.emitter.emitEvent({ appInfo: 'show' });
        this.ws.send(JSON.stringify({ action: 'get' }));
        this.ws.onOpen(function (event) {
            console.log('ws connection opened, state:', _this.ws.getReadyState(), ' | event:', event);
        });
        this.ws.onMessage(function (message) {
            console.log('ws incoming message');
            console.log(message);
            _this.serverData['dynamic'] = [];
            var data = JSON.parse(message.data);
            for (var d in data) {
                if (data[d]) {
                    _this.serverData['dynamic'].push(data[d]);
                }
            }
            console.log('this.serverData[\'dynamic\']:', _this.serverData['dynamic']);
        }, {});
        this.ws.onError(function (event) {
            console.log('ws connection error, state:', _this.ws.getReadyState());
            console.log(event);
            _this.ws.close(true);
        });
        this.ws.onClose(function (event) {
            console.log('ws connection closed, state:', _this.ws.getReadyState());
            console.log(event);
        });
        this.subscription = this.emitter.getEmitter().subscribe(function (message) {
            console.log('/intro consuming event:', message);
            if (message.sys === 'close websocket') {
                console.log('closing webcosket');
                _this.subscription.unsubscribe();
                _this.ws.close(true);
            }
        });
        this.getServerStaticData(function (scope) {
            scope.emitSpinnerStopEvent();
        });
        this.getPublicData(function (scope) {
            scope.emitSpinnerStopEvent();
        });
    };
    DashboardIntroComponent.prototype.ngOnDestroy = function () {
        console.log('ngOnDestroy: DashboardIntroComponent destroyed');
        this.subscription.unsubscribe();
        this.ws.close(true);
    };
    DashboardIntroComponent = __decorate([
        core_1.Component({
            selector: 'dashboard-intro',
            templateUrl: '/public/app/views/dashboard-intro.html',
            providers: [server_static_data_service_1.ServerStaticDataService, public_data_service_1.PublicDataService],
            directives: [ng2_nvd3_1.nvD3],
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, event_emitter_service_1.EventEmitterService, server_static_data_service_1.ServerStaticDataService, public_data_service_1.PublicDataService])
    ], DashboardIntroComponent);
    return DashboardIntroComponent;
}());
exports.DashboardIntroComponent = DashboardIntroComponent;
//# sourceMappingURL=dashboard-intro.component.js.map