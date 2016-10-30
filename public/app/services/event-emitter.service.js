"use strict";
var core_1 = require('@angular/core');
var EventEmitterService = (function () {
    function EventEmitterService() {
        // constructor () {}
        this.emitter = new core_1.EventEmitter();
    }
    EventEmitterService.prototype.emitEvent = function (object) {
        this.emitter.emit(object);
    };
    EventEmitterService.prototype.getEmitter = function () {
        return this.emitter;
    };
    return EventEmitterService;
}());
exports.EventEmitterService = EventEmitterService;
//# sourceMappingURL=event-emitter.service.js.map