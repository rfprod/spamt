import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { EventEmitterService } from './services/event-emitter.service';

declare let $: JQueryStatic;

@Component({
	selector: 'spamt',
	template: `
		<app-nav></app-nav>
		<router-outlet></router-outlet>
		<app-info></app-info>
	`,
})
export class AppComponent implements OnInit, OnDestroy {
	private subscription: any;
	constructor( public el: ElementRef, private emitter: EventEmitterService ) {
		console.log('this.el.nativeElement', this.el.nativeElement);
	}
	public startSpinner() {
		console.log('spinner start');
	}
	public stopSpinner() {
		console.log('spinner stop');
	}
	public ngOnInit() {
		console.log('ngOnInit: AppComponent initialized');
		$('#init-spinner').remove();
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			console.log('app consuming event:', message);
			if (message.sys === 'start spinner') {
				console.log('starting spinner');
				this.startSpinner();
			}
			if (message.sys === 'stop spinner') {
				console.log('stopping spinner');
				this.stopSpinner();
			}
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AppComponent destroyed');
		this.subscription.unsubscribe();
	}
}
