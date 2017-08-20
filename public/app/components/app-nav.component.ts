import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';

@Component({
	selector: 'app-nav',
	templateUrl: '/public/app/views/dashboard-nav.html',
})
export class AppNavComponent implements OnInit, OnDestroy {
	constructor(
		private emitter: EventEmitterService,
		private router: Router
	) {}
	private subscription: any;
	public navButtonsState: boolean[] = [false, false, false, false, false];
	private showHelp: boolean = false;
	public switchNavButtons(event: any, path?: string) {
		let index;
		console.log('switchNavButtons:', event);
		const route = (event.route) ? event.route : (typeof event.urlAfterRedirects === 'string') ? event.urlAfterRedirects : event.url;
		path = (!path) ? route.substring(route.lastIndexOf('/') + 1, route.length) : path;
		console.log(' >> PATH', path);
		if (!event.route && path === 'help') {
			// console.log('help click');
			this.emitter.emitEvent({ help: 'toggle' });
			this.showHelp = (this.showHelp) ? false : true;
		}
		if (path.indexOf('intro') !== -1) {
			index = '1';
		} else if (path.indexOf('data') !== -1) {
			index = '2';
		} else if (path.indexOf('controls') !== -1) {
			index = '3';
		} else if (path.indexOf('user') !== -1) {
			index = '4';
		}
		if (index) {
			/*
			*	if help is clicked index stays undefined
			*/
			for (const b in this.navButtonsState) {
				if (b === index) { this.navButtonsState[b] = true; } else { this.navButtonsState[b] = false; }
			}
		}
		// console.log('navButtonsState:', this.navButtonsState);
	}
	public stopWS(): void {
		/*
		*	this function should be executed before user is sent to any external resource
		*	on click on an anchor object if a resource is loaded in the same tab
		*/
		console.log('close websocket event emitted');
		this.emitter.emitEvent({ sys: 'close websocket' });
	}
	public ngOnInit(): void {
		console.log('ngOnInit: AppNavComponent initialized');
		// check active route on app init - app-nav loads once on app init
		this.subscription = this.router.events.subscribe((event) => {
			// console.log(' > ROUTER EVENT:', event);
			if (event instanceof NavigationEnd) {
				if (!event.hasOwnProperty('reason')) {
					/*
					*	router returns reason with empty string as a value if guard rejects access
					*/
					this.switchNavButtons(event);
				} else {
					// switch to login
					this.switchNavButtons({route: 'login'});
				}
				this.showHelp = false;
			}
		});
	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppNavComponent destroyed');
		this.subscription.unsubscribe();
	}
}
