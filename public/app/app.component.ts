import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router, ResolveEnd } from '@angular/router';
import { EventEmitterService } from './services/event-emitter.service';

import { MatIconRegistry } from '@angular/material';

import { CustomServiceWorkerService } from './services/custom-service-worker.service';

declare let $: JQueryStatic;

@Component({
	selector: 'spamt',
	template: `
		<app-nav></app-nav>
		<loading-indicator *ngIf="showSpinner"></loading-indicator>
		<router-outlet></router-outlet>
		<app-info *ngIf="showAppInfo"></app-info>
	`
})
export class AppComponent implements OnInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService,
		private matIconRegistry: MatIconRegistry,
		private serviceWorker: CustomServiceWorkerService,
		private router: Router
	) {
		console.log('AppComponent element', this.el.nativeElement);
	}

	private subscriptions: any[] = [];

	public showAppInfo: boolean = true;
	public showSpinner: boolean = false;

	public ngOnInit() {
		console.log('ngOnInit: AppComponent initialized');
		$('#init-spinner').remove();

		let sub = this.router.events.subscribe((event: any) => {
			if (event instanceof ResolveEnd) {
				console.log('router event, resolve end', event);
				this.showAppInfo = (event.url === '/intro') ? true : false;
			}
		});
		this.subscriptions.push(sub);

		sub = this.emitter.getEmitter().subscribe((event: any) => {
			console.log('app consuming event:', event);
			if (event.spinner) {
				if (event.spinner === 'start') {
					this.showSpinner = true;
				}
				if (event.spinner === 'stop') {
					this.showSpinner = false;
				}
			}
		});
		this.subscriptions.push(sub);

		/*
		*	register fontawesome for usage in mat-icon by adding directives
		*	fontSet="fab" fontIcon="fa-icon"
		*	fontSet="fas" fontIcon="fa-icon"
		*
		*	free plan includes only fab (font-awesome-brands) and fas (font-awesome-solid) groups
		*
		*	icons reference: https://fontawesome.com/icons/
		*/
		this.matIconRegistry.registerFontClassAlias('fontawesome-all');
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AppComponent destroyed');
		this.serviceWorker.disableServiceWorker();
		if (this.subscriptions.length) {
			for (const sub of this.subscriptions) {
				sub.unsubscribe();
			}
		}
	}
}
