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
var event_emitter_service_1 = require('../services/event-emitter.service');
var user_details_service_1 = require('../services/user-details.service');
var DashboardDetailsComponent = (function () {
    function DashboardDetailsComponent(el, emitter, userDetailsService) {
        this.el = el;
        this.emitter = emitter;
        this.userDetailsService = userDetailsService;
        this.publicData = [{ users: [] }, { labels: [] }];
        this.labelDetails = [];
        this.orderProp = 'timestamp';
        console.log('this.el.nativeElement:', this.el.nativeElement);
    }
    DashboardDetailsComponent.prototype.getUserDetails = function (userId, callback) {
        var _this = this;
        this.userDetailsService.getUserDetails().subscribe(function (data) { return _this.labelDetails = data; }, function (error) { return _this.errorMessage = error; }, function () {
            console.log('getUserDetails done');
            callback(_this.labelDetails);
        });
    };
    DashboardDetailsComponent.prototype.showLabelDetailsPreview = function (event) {
        var _this = this;
        // had to disable all tslint rules for previous line, disabling no-unused-variable is buggy
        console.log('mouse enter');
        var domEls = event.target.parentElement.querySelectorAll('span');
        if (domEls[1].innerHTML === '') {
            this.emitSpinnerStartEvent();
            this.getUserDetails(event.target.id, function (labelDetails) {
                var obj = labelDetails[0];
                console.log(obj);
                domEls[1].innerHTML = '<i class="fa fa-music" aria-hidden="true"></i> ' + obj.track_count;
                domEls[2].innerHTML = '<i class="fa fa-list" aria-hidden="true"></i> ' + obj.playlist_count;
                domEls[3].innerHTML = '<i class="fa fa-star" aria-hidden="true"></i> ' + obj.public_favorites_count;
                domEls[4].innerHTML = '<i class="fa fa-users" aria-hidden="true"></i> ' + obj.followers_count;
                _this.emitSpinnerStopEvent();
                setTimeout(function () {
                    domEls[0].style.display = 'none';
                }, 1000);
            });
        }
        else {
            domEls[0].style.display = 'flex';
        }
    };
    DashboardDetailsComponent.prototype.hideLabelDetailsPreview = function (event) {
        // had to disable all tslint rules for previous line, disabling no-unused-variable is buggy
        console.log('mouse leave');
        var domEls = event.target.parentElement.querySelectorAll('span');
        if (domEls[1].innerHTML !== '') {
            domEls[0].style.display = 'none';
        }
    };
    Object.defineProperty(DashboardDetailsComponent.prototype, "labelSearchQuery", {
        get: function () {
            return this.labelSearchValue;
        },
        set: function (val) {
            this.emitLabelSearchValueChangeEvent(val);
        },
        enumerable: true,
        configurable: true
    });
    DashboardDetailsComponent.prototype.emitLabelSearchValueChangeEvent = function (val) {
        console.log('labelSearchValue changed to:', val);
        this.emitter.emitEvent({ search: val });
    };
    Object.defineProperty(DashboardDetailsComponent.prototype, "sortLabelsByCriterion", {
        get: function () {
            return this.orderProp;
        },
        set: function (val) {
            this.emitOrderPropChangeEvent(val);
        },
        enumerable: true,
        configurable: true
    });
    DashboardDetailsComponent.prototype.emitOrderPropChangeEvent = function (val) {
        console.log('orderProp changed to:', val);
        this.emitter.emitEvent({ sort: val });
    };
    DashboardDetailsComponent.prototype.emitSpinnerStartEvent = function () {
        console.log('root spinner start event emitted');
        this.emitter.emitEvent({ sys: 'start spinner' });
    };
    DashboardDetailsComponent.prototype.emitSpinnerStopEvent = function () {
        console.log('root spinner stop event emitted');
        this.emitter.emitEvent({ sys: 'stop spinner' });
    };
    DashboardDetailsComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log('ngOnInit: DashboardDetailsComponent initialized');
        this.emitSpinnerStartEvent();
        this.emitter.emitEvent({ route: '/data' });
        this.emitter.emitEvent({ appInfo: 'hide' });
        this.subscription = this.emitter.getEmitter().subscribe(function (message) {
            console.log('/data consuming event:', JSON.stringify(message));
            if (message.search || message.search === '') {
                console.log('searching:', message.search);
                var domElsUsername = _this.el.nativeElement.querySelector('ul.labels').querySelectorAll('#label-username');
                for (var _i = 0, domElsUsername_1 = domElsUsername; _i < domElsUsername_1.length; _i++) {
                    var usernameObj = domElsUsername_1[_i];
                    if (usernameObj.innerHTML.toLowerCase().indexOf(message.search.toLowerCase()) !== -1) {
                        usernameObj.parentElement.parentElement.style.display = 'block';
                    }
                    else {
                        usernameObj.parentElement.parentElement.style.display = 'none';
                    }
                }
            }
            if (message.sort) {
                console.log('sorting by:', message.sort);
                if (message.sort === 'timestamp') {
                    _this.publicData[1].labels.sort(function (a, b) {
                        return b.timestamp - a.timestamp;
                    });
                }
                if (message.sort === 'username') {
                    _this.publicData[1].labels.sort(function (a, b) {
                        if (a.permalink < b.permalink) {
                            return -1;
                        }
                        if (a.permalink > b.permalink) {
                            return 1;
                        }
                        return 0;
                    });
                }
            }
        });
    };
    DashboardDetailsComponent.prototype.ngOnDestroy = function () {
        console.log('ngOnDestroy: DashboardDetailsComponent destroyed');
        this.subscription.unsubscribe();
        this.emitSpinnerStopEvent(); // this is relevant in case user switches to another view fast, not allowing data to load
    };
    DashboardDetailsComponent = __decorate([
        core_1.Component({
            selector: 'dashboard-details',
            templateUrl: "/public/app/views/dashboard-details.html",
            providers: [user_details_service_1.UserDetailsService],
            directives: [common_1.NgFor],
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, event_emitter_service_1.EventEmitterService, user_details_service_1.UserDetailsService])
    ], DashboardDetailsComponent);
    return DashboardDetailsComponent;
}());
exports.DashboardDetailsComponent = DashboardDetailsComponent;
//# sourceMappingURL=dashboard-details.component.js.map