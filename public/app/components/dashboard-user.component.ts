import { Router } from '@angular/router';
import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';
import { UserService } from '../services/user-service.service';

@Component({
	selector: 'dashboard-user',
	templateUrl: '/public/app/views/dashboard-user.html',
})
export class DashboardUserComponent implements OnInit, OnDestroy {
	constructor (
		private el: ElementRef,
		private router: Router,
		private emitter: EventEmitterService,
		private userService: UserService
	) {
		console.log('this.el.nativeElement:', this.el.nativeElement);
	}
	private subscription: any;

	public title: string = 'User Login';
	public description: string = 'Login to User Panel with your Twitter or Soundcloud account';

	public isLoggedIn() {
		return this.userService.model.twitter_oauth_token && this.userService.model.twitter_oauth_token;
	}
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
		console.log('ngOnInit: UserComponent initialized');
		this.emitSpinnerStartEvent();
		this.emitter.emitEvent({route: '/user'});
		this.emitter.emitEvent({appInfo: 'hide'});

		if (!this.userService.model.twitter_oauth_token && !this.userService.model.twitter_oauth_verifier) {
			this.userService.restoreUser(() => {
				if (this.userService.model.twitter_oauth_token && this.userService.model.twitter_oauth_verifier) {
					console.log('restored auth credentials: user is logged in');
				} else {
					console.log('restored user selection: user is not logged in');
				}
			});
		} else {
			console.log('auth creedentials present');
		}

		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			console.log('UserLoginComponent consuming message:', message);
		});
		this.emitSpinnerStopEvent();
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: UserComponent destroyed');
		this.subscription.unsubscribe();
	}
}
