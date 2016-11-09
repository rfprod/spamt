'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _this = this;
/* global */
var core_1 = require('@angular/core');
var event_emitter_service_1 = require('../../public/app/services/event-emitter.service');
var server_static_data_service_1 = require('../../public/app/services/server-static-data.service');
var public_data_service_1 = require('../../public/app/services/public-data.service');
var Rx_1 = require('rxjs/Rx');
var dashboard_intro_component_1 = require('../../public/app/components/dashboard-intro.component');
describe('DashboardIntroComponent', function () {
    var MockEventEmitterService = (function (_super) {
        __extends(MockEventEmitterService, _super);
        function MockEventEmitterService() {
            _super.call(this, null);
        }
        return MockEventEmitterService;
    }(server_static_data_service_1.ServerStaticDataService));
    var MockServerStaticDataService = (function (_super) {
        __extends(MockServerStaticDataService, _super);
        function MockServerStaticDataService() {
            _super.call(this, null);
        }
        MockServerStaticDataService.prototype.getServerStaticData = function () {
            console.log('getServerStaticData: return test data');
            return Rx_1.Observable.of([
                {
                    name: 'dyn name 1',
                    value: 'dyn value 1'
                }, {
                    name: 'dyn name 2',
                    value: 'dyn value 2'
                }, {
                    name: 'dyn name 3',
                    value: 'dyn value 3'
                }, {
                    name: 'dyn name 4',
                    value: 'dyn value 4'
                }
            ]);
        };
        ;
        return MockServerStaticDataService;
    }(server_static_data_service_1.ServerStaticDataService));
    var MockPublicDataService = (function (_super) {
        __extends(MockPublicDataService, _super);
        function MockPublicDataService() {
            _super.call(this, null);
        }
        MockPublicDataService.prototype.getPublicData = function () {
            console.log('getPublicData: return test data');
            return Rx_1.Observable.of([
                {
                    name: 'dyn name 1',
                    value: 'dyn value 1'
                }, {
                    name: 'dyn name 2',
                    value: 'dyn value 2'
                }
            ]);
        };
        ;
        return MockPublicDataService;
    }(public_data_service_1.PublicDataService));
    beforeEach(function () {
        _this.elementRef = core_1.ElementRef;
        _this.eventEmitterSrv = event_emitter_service_1.EventEmitterService;
        _this.serverStaticDataSrv = MockServerStaticDataService;
        _this.publicDataSrv = MockPublicDataService;
        _this.component = new dashboard_intro_component_1.DashboardIntroComponent(_this.elementRef, _this.eventEmitterSrv, _this.serverStaticDataSrv, _this.publicDataSrv);
    });
    it('should be defined', function () {
        console.log(_this.component);
        expect(_this.component).toBeDefined();
    });
    it('should have variables defined', function () {
        expect(_this.component.title).toBeDefined();
        expect(_this.component.title === 'SPAMT').toBeTruthy();
        expect(_this.component.description).toBeDefined();
        expect(_this.component.description === 'Social Profile Analysis and Management Tool').toBeTruthy();
        expect(_this.component.host).toBeDefined();
        expect(_this.component.host).toEqual(window.location.host);
        expect(_this.component.wsUrl).toEqual('ws://' + _this.component.host + '/app-diag/dynamic');
    });
});
//# sourceMappingURL=dashboard-intro.component.spec.js.map