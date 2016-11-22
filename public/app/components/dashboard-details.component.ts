import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';
import { SCgetUserService } from '../services/sc-get-user.service';

declare var $: JQueryStatic;

@Component({
	selector: 'dashboard-details',
	templateUrl: '/public/app/views/dashboard-details.html',
})
export class DashboardDetailsComponent implements OnInit, OnDestroy {
	constructor(
		public el: ElementRef,
		private emitter: EventEmitterService,
		private scGetUserService: SCgetUserService
	) {
		console.log('this.el.nativeElement:', this.el.nativeElement);
	}
	private subscription: any;
	public publicData: {} = { user: {}, tracks: [] };
	public errorMessage: string;
	private getUserDetails(userId) {
		this.scGetUserService.getUserDetails().subscribe(
			data => this.publicData['user'] = data,
			error => this.errorMessage = <any> error,
			() => {
				console.log('getUserDetails done');
			}
		);
	}

	private filterSearchValue: string;
	get filterSearchQuery() {
		return this.filterSearchValue;
	}
	set filterSearchQuery(val) {
		this.emitFilterSearchValueChangeEvent(val);
	}
	private emitFilterSearchValueChangeEvent(val) {
		console.log('labelSearchValue changed to:', val);
		this.emitter.emitEvent({search: val});
	}

	public orderProp = 'timestamp';
	get sortByCriterion() {
		return this.orderProp;
	}
	set sortByCriterion(val) {
		this.emitOrderPropChangeEvent(val);
	}
	private emitOrderPropChangeEvent(val) {
		console.log('orderProp changed to:', val);
		this.emitter.emitEvent({sort: val});
	}

	private emitSpinnerStartEvent() {
		console.log('root spinner start event emitted');
		this.emitter.emitEvent({sys: 'start spinner'});
	}
	private emitSpinnerStopEvent() {
		console.log('root spinner stop event emitted');
		this.emitter.emitEvent({sys: 'stop spinner'});
	}

	public ngOnInit() {
		console.log('ngOnInit: DashboardDetailsComponent initialized');
		this.emitSpinnerStartEvent();
		this.emitter.emitEvent({route: '/data'});
		this.emitter.emitEvent({appInfo: 'hide'});
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			console.log('/data consuming event:', JSON.stringify(message));
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
					this.publicData['tracks'].sort((a, b) => {
						return b.timestamp - a.timestamp;
					});
				}
				if (message.sort === 'name') {
					this.publicData['tracks'].sort((a, b) => {
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
		this.emitSpinnerStopEvent(); // this is relevant in case user switches to another view fast, not allowing data to load
	}
}
