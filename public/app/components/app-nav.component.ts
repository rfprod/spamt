import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';

@Component({
	selector: 'app-nav',
	templateUrl: '/public/app/views/dashboard-nav.html',
})
export class AppNavComponent implements OnInit, OnDestroy {
	constructor( private emitter: EventEmitterService, private router: Router ) {}
	private subscription: any;
	public navButtonsState: boolean[] = [false, false, false];
	private showHelp: boolean = false;
	public switchNavButtons(event, isClick: boolean) {
		let route, index;
		console.log('switchNavButtons:', event);
		if (isClick) {
			if (event.target.localName === 'i') {
				// button icon clicked
				route = event.target.parentElement.href;
			} else {
				// button anchor clicked
				route = event.target.href;
			}
		} else { route = event.route; }
		if (!route) {
			// help button does not have href property
			console.log('help click');
			this.emitter.emitEvent({ help: 'toggle' });
			this.showHelp = (this.showHelp) ? false : true;
			route = this.router.url; // set current route
		}
		const path = route.substring(route.lastIndexOf('/') + 1, route.length);
		if (path === 'intro') {
			index = '1';
		} else {
			if (path === 'data') { index = '2'; }
		}
		for (let b in this.navButtonsState) {
			if (b === index) { this.navButtonsState[b] = true; } else { this.navButtonsState[b] = false; }
		}
		console.log('navButtonsState:', this.navButtonsState);
	}
	public stopWS() {
		/*
		*	this function should be executed before user is sent to any external resource
		*	on click on an anchor object if a resource is loaded in the same tab
		*/
		console.log('close websocket event emitted');
		this.emitter.emitEvent({ sys: 'close websocket' });
	}
	public ngOnInit() {
		console.log('ngOnInit: AppNavComponent initialized');
		// check active route on app init - app-nav loads once on app init
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			if (typeof message.route !== 'undefined') {
				console.log('/app-nav consuming event:', message);
				this.switchNavButtons(message, false);
				this.subscription.unsubscribe();
			}
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AppNavComponent destroyed');
	}
}
