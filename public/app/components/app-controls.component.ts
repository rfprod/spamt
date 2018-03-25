import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { MatTabGroup } from '@angular/material';

import { EventEmitterService } from '../services/event-emitter.service';
import { UserService } from '../services/user.service';

import { ServerStaticDataService } from '../services/server-static-data.service';
import { PublicDataService } from '../services/public-data.service';

import { ControlsLoginService } from '../services/controls-login.service';
import { ControlsLogoutService } from '../services/controls-logout.service';
import { ControlsMeService } from '../services/controls-me.service';
import { ControlsUsersListService } from '../services/controls-users-list.service';
import { ControlsQueriesListService } from '../services/controls-queries-list.service';

@Component({
	selector: 'app-controls',
	templateUrl: '/public/app/views/app-controls.html',
	host: {
		class: 'mat-body-1'
	}
})
export class AppControlsComponent implements OnInit, AfterViewInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService,
		private serverStaticDataService: ServerStaticDataService,
		private publicDataService: PublicDataService,
		private userService: UserService,
		private fb: FormBuilder,
		private controlsLoginService: ControlsLoginService,
		private controlsLogoutService: ControlsLogoutService,
		private controlsMeService: ControlsMeService,
		private controlsUsersListService: ControlsUsersListService,
		private controlsQueriesListService: ControlsQueriesListService,
		private router: Router,
		private location: Location
	) {
		console.log('AppControlsComponent element:', this.el.nativeElement);
		this.resetForm();
	}

	/**
	 * Component subscriptions.
	 */
	private subscriptions: any[] = [];

	/**
	 * View title.
	 */
	public title: string = 'SPAMT Controls';
	/**
	 * View description.
	 */
	public description: object = {
		welcome: 'In order to gain access to Social Profile Analysis and Management Tool Controls you should have an account associated with an email address. Provide this email address to get an authentication link.',
		authenticated: 'Social Profile Analysis and Management Tool Controls',
	};

	/**
	 * NVD3 chart options.
	 */
	public chartOptions: object = {
		chart: {
			type: 'pieChart',
			height: 450,
			donut: true,
			x: (d) => d.key,
			y: (d) => d.y,
			showLabels: true,
			pie: {
				startAngle: (d) => d.startAngle / 2 - Math.PI / 2,
				endAngle: (d) => d.endAngle / 2 - Math.PI / 2,
			},
			duration: 1000,
			legend: {
				margin: {
					top: 5,
					right: 0,
					bottom: 5,
					left: 0,
				}
			},
		},
	};
	/**
	 * Application usage chart data.
	 */
	public appUsageData: any[] = [
		{
			key: 'Default',
			y: 1,
		},
		{
			key: 'Default',
			y: 1,
		},
	];
	/**
	 * Queries chart data.
	 */
	public queriesData: any[] = [
		{
			key: 'Default',
			y: 1,
		},
		{
			key: 'Default',
			y: 1,
		}
	];
	/**
	 * Server data.
	 */
	public serverData: any = {
		static: []
	};
	/**
	 * Users array.
	 */
	public usersList: any[] = [];
	/**
	 * Queries array.
	 */
	public queries: any = {
		queriesList: [],
		page: 0,
	};
	/**
	 * UI error message.
	 */
	public errorMessage: string;
	/**
	 * UI success message.
	 */
	public successMessage: string;
	/**
	 * Dismisses UI messages - user actions feedback.
	 */
	public dismissMessages(): void {
		this.errorMessage = '';
		this.successMessage = '';
	}

	/**
	 * Gets static server data.
	 */
	private getServerStaticData(callback): void {
		this.emitter.emitSpinnerStartEvent();
		this.serverStaticDataService.getData().subscribe(
			(data: any) => this.serverData.static = data,
			(error: any) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			},
			() => {
				console.log('getServerStaticData done, data:', this.serverData.static);
				this.emitter.emitSpinnerStopEvent();
				if (callback) { callback(); }
			}
		);
	}
	/**
	 * Gets public data.
	 */
	private getPublicData(callback): void {
		this.emitter.emitSpinnerStartEvent();
		this.publicDataService.getData().subscribe(
			(data: any) => {
				if (this.nvd3usage) {
					this.nvd3usage.clearElement();
				}
				this.appUsageData = data;
			},
			(error: any) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			},
			() => {
				console.log('getPublicData done, data:', this.appUsageData);
				this.emitter.emitSpinnerStopEvent();
				if (callback) { callback(); }
			}
		);
	}
	/**
	 * Gets users list.
	 */
	private getUsersList(): void {
		this.emitter.emitSpinnerStartEvent();
		this.controlsUsersListService.getData().subscribe(
			(data: any) => this.usersList = data,
			(error: any) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			},
			() => {
				console.log('getUsersList done, data:', this.usersList);
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}
	/**
	 * Gets queries list.
	 */
	private getQueriesList(): void {
		this.emitter.emitSpinnerStartEvent();
		this.controlsQueriesListService.getData(this.queries.page).subscribe(
			(data: any) => {
				if (this.nvd3queries) {
					this.nvd3queries.clearElement();
				}
				this.queries.queriesList = data;
				this.queriesData = [];
				for (const query of this.queries.queriesList) {
					console.log('query:', query);
					const obj: object = {
						key: query.name,
						y: query.weight,
					};
					this.queriesData.push(obj);
				}
			},
			(error: any) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			},
			() => {
				console.log('getQueriesList done, data:', this.queries.queriesList);
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}

	/**
	 * Requests controls acces using provided user credentials.
	 */
	private requestControlsAccess(): void {
		this.emitter.emitSpinnerStartEvent();
		this.dismissMessages();
		this.controlsLoginService.getData(this.userService.model.email).subscribe(
			(data: any) => this.successMessage = data.message,
			(error: any) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			},
			() => {
				console.log('requestControlsAccess done');
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}

	/**
	 * Gets authenticated user details.
	 */
	private getMe(): void {
		this.emitter.emitSpinnerStartEvent();
		this.dismissMessages();
		this.controlsMeService.getData().subscribe(
			(data: any) => {
				this.successMessage = 'Successful login';
				const newValues: any = {
					role: data.role,
					login: data.login,
					full_name: data.full_name,
					last_login: data.last_login,
					registered: data.registered
				};
				this.userService.saveUser(newValues);
			},
			(error: any) => {
				this.errorMessage = error;
				this.userService.resetUser();
				this.emitter.emitSpinnerStopEvent();
				this.router.navigateByUrl('/controls');
			},
			() => {
				console.log('getMe done');
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}

	/**
	 * Authentication form.
	 */
	public authForm: FormGroup;
	/**
	 * Authentication form state.
	 */
	public activate: any = {
		form: true as boolean
	};
	/**
	 * Resets authentication form.
	 */
	public resetForm(reinitForm?: boolean): void {
		/*
		*	resets user local storage and register form
		*/
		this.authForm = this.fb.group({
			email: ['', Validators.compose([Validators.required, Validators.email, Validators.minLength(5)])],
		});
		if (reinitForm) {
			/*
			*	reset form completely - clear storage
			*/
			this.userService.resetUser();
		}
		this.userService.restoreUser(() => {
			this.authForm.patchValue({email: this.userService.model.email});
			if (reinitForm) {
				/*
				*	reset form completely - dismiss messages, reinit form
				*/
				this.dismissMessages();
				this.activate.form = false;
				setTimeout(() => this.activate.form = true, 0);
			}
		});
	}

	/**
	 * Loggs user in.
	 */
	public login(): void {
		console.log('login attempt with email', this.authForm.controls.email.value);
		this.userService.saveUser({ email: this.authForm.controls.email.value });
		this.requestControlsAccess();
	}

	/**
	 * Loggs user out.
	 */
	public logout(): void {
		console.log('logging out, resetting token');
		this.emitter.emitSpinnerStartEvent();
		this.dismissMessages();
		this.controlsLogoutService.getData().subscribe(
			(data) => {
				this.successMessage = 'Logout success';
				this.userService.resetUser();
				this.resetForm();
				this.activate.form = true;
				this.router.navigateByUrl('/controls');
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

	/**
	 * If modal custom should be shown or not.
	 */
	public showModal: boolean = false;
	/**
	 * Toggles custom modal visibility.
	 */
	public toggleModal(): void {
		this.showModal = (!this.showModal) ? true : false;
	}

	/**
	 * Basic controls view tabs names.
	 */
	public dataTabs: string[] = ['Users', 'Queries'];
	/**
	 * Basic controls view tab group.
	 */
	@ViewChild('tabGroup') private tabGroup: MatTabGroup;

	/**
	 * Subscribes to Tab Group change events.
	 */
	private tabGroupChangeSubscribe(): void {
		const sub = this.tabGroup.selectedTabChange.subscribe((event: any) => {
			console.log('tabs chage event:', event, '| active tab index', event.index, '| tab name', this.dataTabs[event.index]);
			if (this.dataTabs[event.index] === 'Users') {
				/*
				* TODO:client do something on users selection
				*/
			}
			if (this.dataTabs[event.index] === 'Queries') {
				/*
				* TODO:client do something on queries selection
				*/
			}
		});
		this.subscriptions.push(sub);
	}

	/**
	 * If controls should be highlighted or not.
	 * Controls help labells visibility, is controlled by events from nav component.
	 */
	public showHelp: boolean = false;

	/**
	 * Application usage chart.
	 */
	@ViewChild('appUsageChart') private nvd3usage: any;
	/**
	 * Queries data chart.
	 */
	@ViewChild('queriesDataChart') private nvd3queries: any;

	/**
	 * Lifecycle hook called after component view is destroyed.
	 */
	public ngOnInit(): void {
		console.log('ngOnInit: AppControlsComponent initialized');

		const route = this.router.url;
		const urlParams = route.substring(route.lastIndexOf('?') + 1, route.length);
		if (/^user_token\=[^&]+$/.test(urlParams)) {
			const token = urlParams.split('=')[1];
			console.log('user got token, save it:', token);
			this.userService.saveUser({ user_token: token });
			this.location.replaceState('controls');
		}

		/**
		 * Subscribe to Event Emitter Service events.
		 */
		const sub = this.emitter.getEmitter().subscribe((event: any) => {
			if (event.help === 'toggle') {
				console.log('AppControlsComponent emitter event:', event, ' | toggling help labels visibility', this.showHelp);
				this.showHelp = (this.showHelp) ? false : true;
			}
		});
		this.subscriptions.push(sub);

		/**
		 * Load data.
		 */
		this.userService.restoreUser(() => {
			if (this.userService.model.user_token) {
				this.activate.form = false;
				this.getMe();
				this.getUsersList();
				this.getQueriesList();
				this.getPublicData(() => {
					this.getServerStaticData(() => {
						console.log('get data done');
					});
				});
			} else {
				console.log('local storage is empty');
			}
		});
	}
	/**
	 * Lifecycle hook called after component view is initialized.
	 */
	public ngAfterViewInit(): void {
		if (this.userService.isLoggedIn()) {
			this.tabGroupChangeSubscribe();
			// this.nvd3usage.updateSize();
			// this.nvd3queries.updateSize();
		}
	}
	/**
	 * Lifecycle hook called after component view is destroyed.
	 */
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppControlsComponent destroyed');
		if (this.subscriptions.length) {
			for (const sub of this.subscriptions) {
				sub.unsubscribe();
			}
		}
	}
}
