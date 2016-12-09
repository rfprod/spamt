import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';

@Directive({ selector: 'loading-indicator' })
export class LoadingIndicatorDirective implements OnInit, OnDestroy {
	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService
	) {
		console.log('LoadingIndicatorDirective element: ', el.nativeElement);
	}
	private subscription: any;

	public ngOnInit() {
		console.log('ngOnInit: LoadingIndicatorDirective initialized');
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			if (message.spinner) {
				console.log('LoadingIndicatorDirective consuming control signal: ', message);
				if (message.spinner === 'start') {
					this.el.nativeElement.style.display = 'block';
				}
				if (message.spinner === 'stop') {
					this.el.nativeElement.style.display = 'none';
				}
			}
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: LoadingIndicatorDirective destroyed');
		this.subscription.unsubscribe();
	}
}
