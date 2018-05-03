import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';
import { UserService } from '../services/user.service';
import { UserLogoutService } from '../services/user-logout.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/first';

@Component({
	selector: 'app-user',
	templateUrl: '/public/app/views/app-user.html',
	host: {
		class: 'mat-body-1'
	}
})
export class AppUserComponent implements OnInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private emitter: EventEmitterService,
		private userService: UserService,
		private userLogoutService: UserLogoutService
	) {
		console.log('AppUserComponent element:', this.el.nativeElement);
	}

	private ngUnsubscribe: Subject<void> = new Subject();

	public title: string = 'User Panel';
	public description: object = {
		welcome: 'Login to User Panel with your Twitter or Soundcloud account.',
		authenticated: 'Social Profile Analysis and Management Tool User Panel',
	};
	public errorMessage: string = '';
	public successMessage: string = '';
	public dismissMessages(): void {
		this.errorMessage = '';
		this.successMessage = '';
	}

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
					this.userService.saveUser({ twitter_oauth_token: '' });
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
					this.userService.saveUser({ twitter_oauth_token: param[1] });
				}
			}
			this.dismissMessages();
			this.successMessage = 'Successful login';
		}
		// Soundcloud
	}

	public isLoggedIn(): boolean {
		return this.userService.model.twitter_oauth_token || this.userService.model.soundcloud_oauth_token;
	}

	public logout(): void {
		console.log('logging out, resetting token');
		this.emitter.emitSpinnerStartEvent();
		this.dismissMessages();
		this.userLogoutService.getData(this.userService.model.twitter_oauth_token, null).subscribe(
			(data) => {
				this.successMessage = 'Logout success';
				this.userService.saveUser({ twitter_oauth_token: '' });
				this.router.navigateByUrl('/user');
			},
			(error) => {
				this.errorMessage = error as any;
				this.emitter.emitSpinnerStopEvent();
			},
			() => {
				console.log('logout done');
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}

// Modal
	public showModal: boolean = false;
	public toggleModal(): void {
		this.showModal = (!this.showModal) ? true : false;
	}

// Help
	public showHelp: boolean = false; // controls help labells visibility, catches events from nav component

	public ngOnInit(): void {
		console.log('ngOnInit: AppUserComponent initialized');
		this.emitter.emitSpinnerStartEvent();

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
				}
			});
		} else {
			console.log('auth creedentials present');
			this.router.navigateByUrl('/user');
		}

		this.emitter.getEmitter().takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			console.log('AppUserComponent consuming event:', event);
			if (event.help === 'toggle') {
				console.log('AppUserComponent emitter event:', event, ' | toggling help labels visibility', this.showHelp);
				this.showHelp = (this.showHelp) ? false : true;
			}
		});
		this.activatedRoute.params.takeUntil(this.ngUnsubscribe).subscribe((params: Params) => {
			console.log('url params chaned:', params);
		});
		this.emitter.emitSpinnerStopEvent();
	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppUserComponent destroyed');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
