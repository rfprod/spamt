import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class EventEmitterService {
	public emitter: EventEmitter<object> = new EventEmitter();
	public emitEvent(object): void {
		this.emitter.emit(object);
	}
	public getEmitter(): EventEmitter<object> {
		return this.emitter;
	}
}
