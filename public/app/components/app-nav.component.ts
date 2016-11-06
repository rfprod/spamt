import { Component, OnInit, OnDestroy } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
import { EventEmitterService } from '../services/event-emitter.service';

declare var $: JQueryStatic;

@Component({
	selector: 'app-nav',
	templateUrl: `/public/app/views/dashboard-nav.html`,
})
export class AppNavComponent implements OnInit, OnDestroy {
	constructor( private emitter: EventEmitterService/*, private route: ActivatedRoute*/ ) {}
	private subscription: any;
	public navButtonsState: boolean[] = [false, false, false];
	public switchNavButtons(event, isClick: boolean) {
		let route, index;
		console.log('switchNavButtons:', event);
		if (isClick) {
			if (event.target.localName === 'i') {
				route = event.target.parentElement.href;
			} else { route = event.target.href; }
		} else { route = event.route; }
		if (route.indexOf('/intro') !== -1) {
			index = 1;
		} else {
			if (route.indexOf('/data') !== -1) { index = 2; } else { index = 0; }
		}
		for (let b in this.navButtonsState) {
			if (b === index) { this.navButtonsState[b] = true; } else { this.navButtonsState[b] = false; }
		}
	}
	public stopWS() {
		/*
		*	this function should be executed before user is sent to any external resource
		*	on click on an anchor object if a resource is loaded in the same tab
		*/
		console.log('close websocket event emitted');
		this.emitter.emitEvent({sys: 'close websocket'});
	}
	public ngOnInit() {
		console.log('ngOnInit: AppNavComponent initialized');
		// check active route on app init - app-nav loads once on app init
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			console.log('/app-nav consuming event:', message);
			if (typeof message.route !== 'undefined') {
				console.log('route is defined');
				this.switchNavButtons(message, false);
				this.subscription.unsubscribe();
			}
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AppNavComponent destroyed');
	}
}
