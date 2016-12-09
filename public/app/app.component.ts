import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { EventEmitterService } from './services/event-emitter.service';

declare let $: JQueryStatic;

@Component({
	selector: 'spamt',
	template: `
		<app-nav></app-nav>
		<loading-indicator></loading-indicator>
		<router-outlet></router-outlet>
		<app-info></app-info>
	`,
})
export class AppComponent implements OnInit, OnDestroy {
	private subscription: any;
	constructor( public el: ElementRef, private emitter: EventEmitterService ) {
		console.log('this.el.nativeElement', this.el.nativeElement);
	}
	public ngOnInit() {
		console.log('ngOnInit: AppComponent initialized');
		$('#init-spinner').remove();
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			console.log('app consuming event:', message);
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AppComponent destroyed');
		this.subscription.unsubscribe();
	}
}
