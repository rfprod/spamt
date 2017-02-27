import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { EventEmitterService } from '../services/event-emitter.service';
import { ServerStaticDataService } from '../services/server-static-data.service';
import { PublicDataService } from '../services/public-data.service';
import { UserService } from '../services/user-service.service';
import { ControlsLoginService } from '../services/controls-login.service';
import { ControlsLogoutService } from '../services/controls-logout.service';
import { ControlsMeService } from '../services/controls-me.service';
import { ControlsUsersListService } from '../services/controls-users-list.service';
import { ControlsQueriesListService } from '../services/controls-queries-list.service';

// declare let d3: any;

@Component({
	selector: 'dashboard-controls',
	templateUrl: '/public/app/views/dashboard-controls.html',
})
export class DashboardControlsComponent implements OnInit, OnDestroy {
	constructor(
		public el: ElementRef,
		private emitter: EventEmitterService,
		private serverStaticDataService: ServerStaticDataService,
		private publicDataService: PublicDataService,
		private userService: UserService,
		private controlsLoginService: ControlsLoginService,
		private controlsLogoutService: ControlsLogoutService,
		private controlsMeService: ControlsMeService,
		private controlsUsersListService: ControlsUsersListService,
		private controlsQueriesListService: ControlsQueriesListService,
		private router: Router
	) {
		console.log('this.el.nativeElement:', this.el.nativeElement);
	}
	private subscription: any;
	public title: string = 'SPAMT Controls';
	public description: Object = {
		'welcome': 'In order to gain access to Social Profile Analysis and Management Tool Controls you should have an account associated with an email address. Provide this email address to get an authentication link.',
		'authenticated': 'Social Profile Analysis and Management Tool Controls',
	};
	public chartOptions: Object = {
		chart: {
			type: 'pieChart',
			height: 450,
			donut: true,
			x: (d) => { return d.key; },
			y: (d) => { return d.y; },
			showLabels: true,
			pie: {
				startAngle: (d) => { return d.startAngle / 2 - Math.PI / 2; },
				endAngle: (d) => { return d.endAngle / 2 - Math.PI / 2; },
			},
			duration: 1000,
			legend: {
				margin: {
					top: 5,
					right: 140,
					bottom: 5,
					left: 0,
				},
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
	private dismissMessages() {
		this.errorMessage = '';
		this.successMessage = '';
	};
	private getServerStaticData(callback) {
		this.serverStaticDataService.getData().subscribe(
			data => this.serverData.static = data,
			error => {
				this.errorMessage = <any> error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('getServerStaticData done, data:', this.serverData.static);
				if (callback) { callback(this); }
			}
		);
	}
	private getPublicData(callback) {
		this.publicDataService.getData().subscribe(
			data => this.appUsageData = data,
			error => {
				this.errorMessage = <any> error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('getPublicData done, data:', this.appUsageData);
				if (callback) { callback(this); }
			}
		);
	}
	private getUsersList() {
		this.emitSpinnerStartEvent();
		this.controlsUsersListService.getData(this.userService.model.user_token).subscribe(
			data => this.usersList = data,
			error => {
				this.errorMessage = <any> error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('getUsersList done, data:', this.usersList);
				this.emitSpinnerStopEvent();
			}
		);
	}
	private getQueriesList() {
		this.emitSpinnerStartEvent();
		this.controlsQueriesListService.getData(this.userService.model.user_token, this.queries.page).subscribe(
			data => {
				this.queries.queriesList = data;
				this.queriesData = [];
				for (let query of this.queries.queriesList) {
					console.log('query:', query);
					const obj: Object = {
						key: query.name,
						y: query.weight,
					};
					this.queriesData.push(obj);
				}
			},
			error => {
				this.errorMessage = <any> error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('getQueriesList done, data:', this.queries.queriesList);
				this.emitSpinnerStopEvent();
			}
		);
	}

	private requestControlsAccess() {
		this.emitSpinnerStartEvent();
		this.dismissMessages();
		this.controlsLoginService.getData(this.userService.model.email).subscribe(
			data => this.successMessage = data.message,
			error => {
				this.errorMessage = <any> error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('requestControlsAccess done');
				this.emitSpinnerStopEvent();
			}
		);
	}

	private getMe() {
		this.emitSpinnerStartEvent();
		this.dismissMessages();
		this.controlsMeService.getData(this.userService.model.user_token).subscribe(
			data => {
				this.userService.model.role = data.role;
				this.userService.model.login = data.login;
				this.userService.model.full_name = data.full_name;
				this.userService.model.last_login = data.last_login;
				this.userService.model.registered = data.registered;
				this.successMessage = 'Successful login';
				this.userService.saveUser();
			},
			error => {
				this.errorMessage = <any> error;
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

	private login() { /* tslint:disable-line */
		console.log('login attempt with email', this.userService.model.email);
		this.userService.saveUser();
		this.requestControlsAccess();
	};

	private logout() { /* tslint:disable-line */
		console.log('logging out, resetting token');
		this.emitSpinnerStartEvent();
		this.dismissMessages();
		this.controlsLogoutService.getData(this.userService.model.user_token).subscribe(
			data => {
				this.successMessage = 'Logout success';
				this.userService.resetUser();
				this.emitter.emitEvent({appInfo: 'show'});
				this.router.navigateByUrl('/controls');
			},
			error => {
				this.errorMessage = <any> error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('logout done');
				this.emitSpinnerStopEvent();
			}
		);
	}

	private emitSpinnerStartEvent() {
		console.log('root spinner start event emitted');
		this.emitter.emitEvent({spinner: 'start'});
	}
	private emitSpinnerStopEvent() {
		console.log('root spinner stop event emitted');
		this.emitter.emitEvent({spinner: 'stop'});
	}

// Modal
	private showModal: boolean = false;
	private toggleModal() { /* tslint:disable-line */
		this.showModal = (!this.showModal) ? true : false;
	};

// Tabs
	private dataTabs: string[] = ['Users', 'Queries']; // tslint:disable-line
	private selectedTab: string = this.dataTabs[0];
	private selectTab(tab): void { // tslint:disable-line
		this.emitSpinnerStartEvent();
		console.log('selectTab, tab: ', tab);
		this.selectedTab = tab;
		this.emitSpinnerStopEvent();
	}

// Help
	private showHelp: boolean = false; // controls help labells visibility, catches events from nav component

	public ngOnInit() {
		console.log('ngOnInit: DashboardControlsComponent initialized');
		this.emitSpinnerStartEvent();
		this.emitter.emitEvent({route: '/controls'});
		this.emitter.emitEvent({appInfo: 'show'});

		const route = this.router.url;
		const urlParams = route.substring(route.lastIndexOf('?') + 1, route.length);
		if (/^user_token\=[^&]+$/.test(urlParams)) {
			const token = urlParams.split('=')[1];
			console.log('user got token, save it:', token);
			this.userService.model.user_token = token;
			this.userService.saveUser();
		}

		this.userService.restoreUser(() => {
			if (this.userService.model.user_token) {
				this.emitter.emitEvent({appInfo: 'hide'});
				this.getMe();
				this.getUsersList();
				this.getQueriesList();
			} else {
				console.log('local storage is empty');
				this.emitSpinnerStopEvent();
			}
		});

		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			if (message.help === 'toggle') {
				console.log('/controls consuming event:', message, ' | toggling help labels visibility', this.showHelp);
				this.showHelp = (this.showHelp) ? false : true;
			}
		});

		this.getPublicData(() => {
			this.getServerStaticData(() => {
				this.emitSpinnerStopEvent();
			});
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: DashboardControlsComponent destroyed');
		this.subscription.unsubscribe();
	}
}
