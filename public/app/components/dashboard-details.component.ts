import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';
import { SCgetUserService } from '../services/sc-get-user.service';
import { SCgetUserDetailsService } from '../services/sc-get-user-details.service';
import { UserService } from '../services/user-service.service';

declare var $: JQueryStatic;

@Component({
	selector: 'dashboard-details',
	templateUrl: '/public/app/views/dashboard-details.html',
})
export class DashboardDetailsComponent implements OnInit, OnDestroy {
	constructor(
		public el: ElementRef,
		private emitter: EventEmitterService,
		private scGetUserService: SCgetUserService,
		private scGetUserDetailsService: SCgetUserDetailsService,
		private userService: UserService
	) {
		console.log('this.el.nativeElement:', this.el.nativeElement);
	}
	private subscription: any;

	public publicData: any = {
		user: null,
		tracks: [],
		playlists: [],
		favorites: [],
		followers: [],
		followings: [],
	};
	public displayError: string;

// User
	private userSelected() { // tslint:disable-line
		return (this.publicData.user) ? true : false;
	}
	private resetSelection(): void { // tslint:disable-line
		this.publicData.user = null;
		this.scUserName = '';
		this.selectedTab = '';
		this.selectedEndpoint = '';
		this.userService.model.analyser_query = this.scUserName;
		this.userService.model.analyser_user_id = '';
		this.userService.model.analyser_user_uri = '';
		this.userService.saveUser();
	}
	public scUserName: string = '';
	private scUserNamePattern: any = /[*]{3,}/; // tslint:disable-line
	private scUserNameKey(event): void { // tslint:disable-line
		if (event.which === 13 || event.keyCode === 13 || event.key === 'Enter' || event.code === 'Enter') {
			this.getUser();
		}
	}
	private getUser(): void { // tslint:disable-line
		this.emitSpinnerStartEvent();
		this.scGetUserService.getData(this.scUserName).subscribe(
			data => {
				this.publicData.user = data;
				this.displayError = undefined;
				console.log('this.userService: ', this.userService);
				this.userService.model.analyser_query = this.scUserName;
				this.userService.model.analyser_user_id = this.publicData.user.id;
				this.userService.model.analyser_user_uri = this.publicData.user.uri;
				this.userService.saveUser();
			},
			error => this.displayError = <any> error,
			() => {
				console.log('getUserService done');
				this.emitSpinnerStopEvent();
			}
		);
	}

// Data tabs
	private dataTabs: string[] = ['Tracks', 'Playlists', 'Favorites', 'Followers', 'Followings']; // tslint:disable-line
	private endpoints: string[] = ['tracks', 'playlists', 'favorites', 'followers', 'followings']; // tslint:disable-line
	private selectedTab: string = '';
	private selectedEndpoint: string = '';
	private selectTab(tab): void { // tslint:disable-line
		console.log('selectTab, tab: ', tab);
		this.selectedTab = tab;
		for (let i in this.dataTabs) {
			if (this.dataTabs[i] === tab) { this.selectedEndpoint = this.endpoints[i]; }
		}
		console.log('this.selectedEndpoint: ', this.selectedEndpoint);
		this.emitSpinnerStartEvent();
		this.scGetUserDetailsService.getData(this.userService.model.analyser_user_uri + '/' + this.selectedEndpoint).subscribe(
			data => {
				this.publicData[this.selectedEndpoint] = data;
				this.displayError = undefined;
			},
			error => this.displayError = <any> error,
			() => {
				console.log('getUserDetailsService done');
				this.emitSpinnerStopEvent();
			}
		);
	}

// Filters
	private filterSearchValue: string;
	get filterSearchQuery(): string {
		return this.filterSearchValue;
	}
	set filterSearchQuery(val) {
		this.emitFilterSearchValueChangeEvent(val);
	}
	private emitFilterSearchValueChangeEvent(val): void {
		console.log('labelSearchValue changed to:', val);
		this.emitter.emitEvent({search: val});
	}
	private orderProp = 'timestamp';
	get sortByCriterion(): string {
		return this.orderProp;
	}
	set sortByCriterion(val) {
		this.emitOrderPropChangeEvent(val);
	}
	private emitOrderPropChangeEvent(val): void {
		console.log('orderProp changed to:', val);
		this.emitter.emitEvent({sort: val});
	}

// Spinner
	private emitSpinnerStartEvent(): void {
		console.log('root spinner start event emitted');
		this.emitter.emitEvent({sys: 'start spinner'});
	}
	private emitSpinnerStopEvent(): void {
		console.log('root spinner stop event emitted');
		this.emitter.emitEvent({sys: 'stop spinner'});
	}

	public ngOnInit() {
		console.log('ngOnInit: DashboardDetailsComponent initialized');
		this.emitter.emitEvent({route: '/data'});
		this.emitter.emitEvent({appInfo: 'hide'});
		this.userService.restoreUser(() => {
			this.scUserName = this.userService.model.analyser_query;
			if (this.scUserName !== '') { this.getUser(); }
		});
		this.emitSpinnerStopEvent();
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			console.log('/details consuming event:', JSON.stringify(message));
			if (message.search || message.search === '') {
				console.log('searching:', message.search);
				let domElsUsername = this.el.nativeElement.querySelector('ul.labels').querySelectorAll('#label-username');
				for (let usernameObj of domElsUsername) {
					if (usernameObj.innerHTML.toLowerCase().indexOf(message.search.toLowerCase()) !== -1) {
						usernameObj.parentElement.parentElement.style.display = 'block';
					} else {
						usernameObj.parentElement.parentElement.style.display = 'none';
					}
				}
			}
			if (message.sort) {
				console.log('sorting by:', message.sort);
				if (message.sort === 'timestamp') {
					this.publicData.tracks.sort((a, b) => {
						return b.timestamp - a.timestamp;
					});
				}
				if (message.sort === 'name') {
					this.publicData.tracks.sort((a, b) => {
						if (a.permalink < b.permalink) { return -1; }
						if (a.permalink > b.permalink) { return 1; }
						return 0;
					});
				}
			}
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: DashboardDetailsComponent destroyed');
		this.subscription.unsubscribe();
	}
}
