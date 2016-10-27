import { Component, OnInit, OnDestroy, ElementRef, provide } from '@angular/core';
import { HTTP_PROVIDERS, ConnectionBackend } from '@angular/http';
import { LocationStrategy, /*Location,*/ HashLocationStrategy } from '@angular/common';
import { ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig } from '@angular/router-deprecated';
import { APP_ROUTES } from './app.routes';
import { AppNavComponent } from './components/app-nav.component';
import { AppInfoComponent } from './components/app-info.component';
import { DashboardIntroComponent } from './components/dashboard-intro.component';
import { DashboardDetailsComponent } from './components/dashboard-details.component';
import { EventEmitterService } from './services/event-emitter.service';

declare let $: JQueryStatic;

@Component({
	selector: 'spamt',
	template: `
		<app-nav></app-nav>
		<router-outlet></router-outlet>
		<app-info></app-info>
	`,
	providers: [
		ROUTER_PROVIDERS, provide(LocationStrategy, {useClass : HashLocationStrategy}),
		EventEmitterService,
		HTTP_PROVIDERS, ConnectionBackend,
	],
	directives: [AppNavComponent, AppInfoComponent, DashboardIntroComponent, DashboardDetailsComponent, ROUTER_DIRECTIVES],
})
@RouteConfig(APP_ROUTES)
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
