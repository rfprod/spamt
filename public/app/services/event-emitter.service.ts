import { EventEmitter } from '@angular/core';

export class EventEmitterService {
	public emitter: EventEmitter<object> = new EventEmitter();
	public emitEvent(object) {
		this.emitter.emit(object);
	}
	public getEmitter() {
		return this.emitter;
	}
}
