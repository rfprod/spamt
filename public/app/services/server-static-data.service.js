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
var Observable_1 = require('rxjs/Observable');
require('rxjs/Rx');
var ServerStaticDataService = (function () {
    function ServerStaticDataService(http) {
        this.http = http;
        this.appDataUrl = window.location.origin + '/app-diag/static';
        console.log('window.location:', window.location);
        console.log('window.location.origin:', window.location.origin);
    }
    ServerStaticDataService.prototype.extractData = function (res) {
        var body = res.json();
        return body || {};
    };
    ServerStaticDataService.prototype.handleError = function (error) {
        var errMsg = (error.message) ? error.message :
            error.status ? "$[error.status] - $[error.statusText]" : 'Server error';
        console.log(errMsg);
        return Observable_1.Observable.throw(errMsg);
    };
    ServerStaticDataService.prototype.getData = function () {
        // had to disable all tslint rules for previous line, disabling no-unused-variable is buggy
        return this.http.get(this.appDataUrl)
            .map(this.extractData)
            .catch(this.handleError);
    };
    ServerStaticDataService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], ServerStaticDataService);
    return ServerStaticDataService;
}());
exports.ServerStaticDataService = ServerStaticDataService;
//# sourceMappingURL=server-static-data.service.js.map