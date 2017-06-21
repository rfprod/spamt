import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';
import { UserService } from '../services/user.service';
import { UserLogoutService } from '../services/user-logout.service';

@Component({
	selector: 'dashboard-user',
	templateUrl: '/public/app/views/dashboard-user.html',
})
export class DashboardUserComponent implements OnInit, OnDestroy {
	constructor(
		private el: ElementRef,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private emitter: EventEmitterService,
		private userService: UserService,
		private userLogoutService: UserLogoutService
	) {
		console.log('this.el.nativeElement:', this.el.nativeElement);
	}
	private subscription: any;

	public title: string = 'User Panel';
	public description: object = {
		welcome: 'Login to User Panel with your Twitter or Soundcloud account.',
		authenticated: 'Social Profile Analysis and Management Tool User Panel',
	};
	public errorMessage: string = '';
	public successMessage: string = '';
	private dismissMessages(): void {
		this.errorMessage = '';
		this.successMessage = '';
	}
	private routerSubscription: any;

// Authentication checker
	private checkUrlParams(): void {
		/*
		*	checks url params for queries describing third party login result
		*	is effectively executed on Soundcloud or Twitter API auth callback
		*/
		const url = this.router.url;
		console.log('this.router.url:', url);
		// Twitter error
		if (url.match(/twitter\_auth\_error/)) {
			const params = url.split('?')[1].split('&').map((item) => item.split('='));
			getError:
			for (const param of params) {
				if (param[0] === 'twitter_auth_error' && param[1] === 'true') {
					this.errorMessage = 'Failed to log in with Twitter credentials. Please, try again.';
					// reset existing tokens if any in case of twitter_auth_error is present and truthy
					this.userService.model.twitter_oauth_token = '';
					this.userService.saveUser();
					break getError;
				}
			}
		} else
		// Twitter success
		if (url.match(/twitter\_oauth\_token/)) {
			const params = url.split('?')[1].split('&').map((item) => item.split('='));
			console.log(params);
			for (const param of params) {
				if (param[0] === 'twitter_oauth_token') {
					this.userService.model.twitter_oauth_token = param[1];
				}
			}
			this.dismissMessages();
			this.successMessage = 'Successful login';
			this.userService.saveUser();
		}
		// Soundcloud
	}

	public isLoggedIn(): boolean {
		return this.userService.model.twitter_oauth_token || this.userService.model.soundcloud_oauth_token;
	}

	private logout(): void { /* tslint:disable-line */
		console.log('logging out, resetting token');
		this.emitSpinnerStartEvent();
		this.dismissMessages();
		this.userLogoutService.getData(this.userService.model.twitter_oauth_token, null).subscribe(
			(data) => {
				this.successMessage = 'Logout success';
				this.userService.model.twitter_oauth_token = '';
				this.userService.saveUser();
				this.emitter.emitEvent({appInfo: 'show'});
				this.router.navigateByUrl('/user');
			},
			(error) => {
				this.errorMessage = error as any;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('logout done');
				this.emitSpinnerStopEvent();
			}
		);
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

// Modal
	private showModal: boolean = false;
	private toggleModal(): void { /* tslint:disable-line */
		this.showModal = (!this.showModal) ? true : false;
	}

// Help
	private showHelp: boolean = false; // controls help labells visibility, catches events from nav component

	public ngOnInit(): void {
		console.log('ngOnInit: UserComponent initialized');
		this.emitSpinnerStartEvent();
		this.emitter.emitEvent({route: '/user'});
		this.emitter.emitEvent({appInfo: 'hide'});

		this.checkUrlParams();

		if (!this.userService.model.twitter_oauth_token) {
			this.userService.restoreUser(() => {
				if (this.userService.model.twitter_oauth_token !== '') {
					console.log('restored auth credentials: user is logged in');
					this.dismissMessages();
					this.successMessage = 'Successful login';
					this.router.navigateByUrl('/user');
				} else {
					console.log('restored user selection: user is not logged in');
					this.emitter.emitEvent({appInfo: 'show'});
				}
			});
		} else {
			console.log('auth creedentials present');
			this.router.navigateByUrl('/user');
		}

		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			console.log('UserComponent consuming message:', message);
			if (message.help === 'toggle') {
				console.log('/controls consuming event:', message, ' | toggling help labels visibility', this.showHelp);
				this.showHelp = (this.showHelp) ? false : true;
			}
		});
		this.routerSubscription = this.activatedRoute.params.subscribe((params: Params) => {
			console.log('url params chaned:', params);
		});
		this.emitSpinnerStopEvent();
	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: UserComponent destroyed');
		this.subscription.unsubscribe();
		this.routerSubscription.unsubscribe();
	}
}
