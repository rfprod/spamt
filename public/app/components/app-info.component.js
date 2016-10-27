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
var event_emitter_service_1 = require('../services/event-emitter.service');
var AppInfoComponent = (function () {
    function AppInfoComponent(emitter) {
        this.emitter = emitter;
        this.hideInfo = true;
        this.badges = [
            // had to disable all tslint rules for previous line, disabling no-unused-variable is buggy
            {
                title: 'Node.js - an open-source, cross-platform runtime environment for developing server-side Web applications.',
                link: 'https://en.wikipedia.org/wiki/Node.js',
                img: '/public/img/Node.js_logo.svg',
            },
            {
                title: 'MongoDB - a free and open-source cross-platform document-oriented database.',
                link: 'https://en.wikipedia.org/wiki/MongoDB',
                img: '/public/img/MongoDB_logo.svg',
            },
            {
                title: 'AngularJS - an open-source web application framework mainly maintained by Google and by a community of individuals and corporations.',
                link: 'https://en.wikipedia.org/wiki/AngularJS',
                img: '/public/img/AngularJS_logo.svg',
            },
            {
                title: 'Soundcloud - a global online audio distribution platform based in Berlin, Germany, that enables its users to upload, record, promote, and share their originally-created sounds.',
                link: 'https://en.wikipedia.org/wiki/SoundCloud',
                img: '/public/img/SoundCloud_logo.svg',
            },
        ];
    }
    AppInfoComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log('ngOnInit: AppInfoComponent initialized');
        this.subscription = this.emitter.getEmitter().subscribe(function (message) {
            console.log('app-info consuming event:', message);
            if (message.appInfo === 'hide') {
                _this.hideInfo = true;
            }
            if (message.appInfo === 'show') {
                _this.hideInfo = false;
            }
        });
    };
    AppInfoComponent.prototype.ngOnDestroy = function () {
        console.log('ngOnDestroy: AppInfoComponent destroyed');
        this.subscription.unsubscribe();
    };
    AppInfoComponent = __decorate([
        core_1.Component({
            selector: 'app-info',
            template: "\n\t\t<a class=\"flex-item\" [hidden]=\"hideInfo\" *ngFor=\"let badge of badges\" href=\"{{badge.link}}\" data-toggle=\"tooltip\" target=_blank title=\"{{badge.title}}\">\n\t\t\t<img src=\"{{badge.img}}\"/>\n\t\t</a>\n\t",
            providers: [],
        }), 
        __metadata('design:paramtypes', [event_emitter_service_1.EventEmitterService])
    ], AppInfoComponent);
    return AppInfoComponent;
}());
exports.AppInfoComponent = AppInfoComponent;
//# sourceMappingURL=app-info.component.js.map