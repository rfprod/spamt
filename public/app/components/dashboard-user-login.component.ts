import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';

@Component({
	selector: 'dashboard-user-login',
	templateUrl: '/public/app/views/dashboard-user-login.html',
})
export class DashboardUserLoginComponent implements OnInit, OnDestroy {
	constructor (private emitter: EventEmitterService, private router: Router) {}
	private subscription: any;
	public title: string = 'User Login';
	public description: string = 'Login to User Panel with your Twitter or Soundcloud account';

	// Spinner
	private emitSpinnerStartEvent(): void {
		console.log('root spinner start event emitted');
		this.emitter.emitEvent({spinner: 'start'});
	}
	private emitSpinnerStopEvent(): void {
		console.log('root spinner stop event emitted');
		this.emitter.emitEvent({spinner: 'stop'});
	}
	
	public ngOnInit() {
		console.log('ngOnInit: UserLoginComponent initialized');
		this.emitSpinnerStartEvent();
		this.emitter.emitEvent({route: '/user'});
		this.emitter.emitEvent({appInfo: 'hide'});
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			console.log('UserLoginComponent consuming message:', message);
		});
		this.emitSpinnerStopEvent();
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: UserLoginComponent destroyed');
		this.subscription.unsubscribe();
	}
}
