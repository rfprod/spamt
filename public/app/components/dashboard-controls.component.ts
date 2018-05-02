import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatTabGroup } from '@angular/material';
import { EventEmitterService } from '../services/event-emitter.service';
import { ServerStaticDataService } from '../services/server-static-data.service';
import { PublicDataService } from '../services/public-data.service';
import { UserService } from '../services/user.service';
import { ControlsLoginService } from '../services/controls-login.service';
import { ControlsLogoutService } from '../services/controls-logout.service';
import { ControlsMeService } from '../services/controls-me.service';
import { ControlsUsersListService } from '../services/controls-users-list.service';
import { ControlsQueriesListService } from '../services/controls-queries-list.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/first';

// declare let d3: any;

@Component({
	selector: 'dashboard-controls',
	templateUrl: '/public/app/views/dashboard-controls.html',
	host: {
		class: 'mat-body-1'
	}
})
export class DashboardControlsComponent implements OnInit, OnDestroy {

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
		console.log('DashboardControlsComponent element:', this.el.nativeElement);
		this.resetForm();
	}

	private ngUnsubscribe: Subject<void> = new Subject();

	public title: string = 'SPAMT Controls';
	public description: object = {
		welcome: 'In order to gain access to Social Profile Analysis and Management Tool Controls you should have an account associated with an email address. Provide this email address to get an authentication link.',
		authenticated: 'Social Profile Analysis and Management Tool Controls',
	};
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
	public queriesData: any[] = [
		{
			key: 'Default',
			y: 1,
		},
		{
			key: 'Default',
			y: 1,
		},
	];
	public serverData: any = {
		static: [],
	};
	public usersList: any[] = [];
	public queries: any = {
		qieriesList: 0,
		page: 0,
	};
	public errorMessage: string;
	public successMessage: string;
	public dismissMessages(): void {
		this.errorMessage = '';
		this.successMessage = '';
	}
	private getServerStaticData(callback): void {
		this.emitSpinnerStartEvent();
		this.serverStaticDataService.getData().first().subscribe(
			(data: any) => this.serverData.static = data,
			(error: any) => {
				this.errorMessage = error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('getServerStaticData done, data:', this.serverData.static);
				this.emitSpinnerStopEvent();
				if (callback) { callback(); }
			}
		);
	}
	private getPublicData(callback): void {
		this.emitSpinnerStartEvent();
		this.publicDataService.getData().first().subscribe(
			(data: any) => {
				this.nvd3usage.clearElement();
				this.appUsageData = data;
			},
			(error: any) => {
				this.errorMessage = error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('getPublicData done, data:', this.appUsageData);
				this.emitSpinnerStopEvent();
				if (callback) { callback(); }
			}
		);
	}
	private getUsersList(): void {
		this.emitSpinnerStartEvent();
		this.controlsUsersListService.getData().first().subscribe(
			(data: any) => this.usersList = data,
			(error: any) => {
				this.errorMessage = error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('getUsersList done, data:', this.usersList);
				this.emitSpinnerStopEvent();
			}
		);
	}
	private getQueriesList(): void {
		this.emitSpinnerStartEvent();
		this.controlsQueriesListService.getData(this.queries.page).first().subscribe(
			(data: any) => {
				this.nvd3queries.clearElement();
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
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('getQueriesList done, data:', this.queries.queriesList);
				this.emitSpinnerStopEvent();
			}
		);
	}

	private requestControlsAccess(): void {
		this.emitSpinnerStartEvent();
		this.dismissMessages();
		this.controlsLoginService.getData(this.userService.model.email).first().subscribe(
			(data: any) => this.successMessage = data.message,
			(error: any) => {
				this.errorMessage = error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('requestControlsAccess done');
				this.emitSpinnerStopEvent();
			}
		);
	}

	private getMe(): void {
		this.emitSpinnerStartEvent();
		this.dismissMessages();
		this.controlsMeService.getData().first().subscribe(
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
				this.emitter.emitEvent({appInfo: 'show'});
				this.emitSpinnerStopEvent();
				this.router.navigateByUrl('/controls');
			},
			() => {
				console.log('getMe done');
				this.emitSpinnerStopEvent();
			}
		);
	}

	public authForm: FormGroup;
	public activate: any = {
		form: true as boolean
	};
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

	public login(): void {
		console.log('login attempt with email', this.authForm.controls.email.value);
		this.userService.saveUser({ email: this.authForm.controls.email.value });
		this.requestControlsAccess();
	}

	public logout(): void {
		console.log('logging out, resetting token');
		this.emitSpinnerStartEvent();
		this.dismissMessages();
		this.controlsLogoutService.getData().subscribe(
			(data) => {
				this.successMessage = 'Logout success';
				this.userService.resetUser();
				this.resetForm();
				this.activate.form = true;
				this.emitter.emitEvent({appInfo: 'show'});
				this.router.navigateByUrl('/controls');
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

	private emitSpinnerStartEvent(): void {
		// console.log('root spinner start event emitted');
		this.emitter.emitEvent({spinner: 'start'});
	}
	private emitSpinnerStopEvent(): void {
		// console.log('root spinner stop event emitted');
		this.emitter.emitEvent({spinner: 'stop'});
	}

// Modal
	public showModal: boolean = false;
	public toggleModal(): void {
		this.showModal = (!this.showModal) ? true : false;
	}

// Tabs
	public dataTabs: string[] = ['Users', 'Queries']; // tslint:disable-line
	@ViewChild('tabGroup') private tabGroup: MatTabGroup;

// Help
	public showHelp: boolean = false; // controls help labells visibility, catches events from nav component

// Charts
	@ViewChild('appUsageChart') private nvd3usage: any;
	@ViewChild('queriesDataChart') private nvd3queries: any;

	public ngOnInit(): void {
		console.log('ngOnInit: DashboardControlsComponent initialized');
		this.emitter.emitEvent({appInfo: 'show'});

		const route = this.router.url;
		const urlParams = route.substring(route.lastIndexOf('?') + 1, route.length);
		if (/^user_token\=[^&]+$/.test(urlParams)) {
			const token = urlParams.split('=')[1];
			console.log('user got token, save it:', token);
			this.userService.saveUser({ user_token: token });
			this.location.replaceState('controls');
		}

		this.userService.restoreUser(() => {
			if (this.userService.model.user_token) {
				this.emitter.emitEvent({appInfo: 'hide'});
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

		this.emitter.getEmitter().takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			if (event.help === 'toggle') {
				console.log('/controls consuming event:', event, ' | toggling help labels visibility', this.showHelp);
				this.showHelp = (this.showHelp) ? false : true;
			}
		});
	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: DashboardControlsComponent destroyed');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
