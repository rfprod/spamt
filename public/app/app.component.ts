import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { EventEmitterService } from './services/event-emitter.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

declare let $: JQueryStatic;

@Component({
	selector: 'spamt',
	template: `
		<app-nav></app-nav>
		<loading-indicator></loading-indicator>
		<router-outlet></router-outlet>
		<app-info fxFlex="0 1 auto" *ngIf="showAppInfo"></app-info>
	`,
	animations: [
		trigger('empty', [])
	]
})
export class AppComponent implements OnInit, OnDestroy {
	private subscription: any;
	constructor( public el: ElementRef, private emitter: EventEmitterService ) {
		console.log('this.el.nativeElement', this.el.nativeElement);
	}
	private showAppInfo: boolean = true;
	public ngOnInit() {
		console.log('ngOnInit: AppComponent initialized');
		$('#init-spinner').remove();
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			console.log('app consuming event:', message);
			if (message.appInfo) {
				if (message.appInfo === 'hide') {
					this.showAppInfo = false;
				} else if (message.appInfo === 'show') {
					this.showAppInfo = true;
				}
			}
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AppComponent destroyed');
		this.subscription.unsubscribe();
	}
}
