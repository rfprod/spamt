import { Component, ElementRef, OnInit, /*SimpleChange,*/ OnDestroy } from '@angular/core';
import { NgFor } from '@angular/common';
import { EventEmitterService } from '../services/event-emitter.service';
import { UserDetailsService } from '../services/user-details.service';

declare var $: JQueryStatic;

@Component({
	selector: 'dashboard-details',
	templateUrl: `/public/app/views/dashboard-details.html`,
	providers: [UserDetailsService],
	directives: [NgFor],
})
export class DashboardDetailsComponent implements OnInit, OnDestroy {
	constructor(
		public el: ElementRef,
		private emitter: EventEmitterService,
		private UserDetailsService: UserDetailsService
	) {
		console.log('this.el.nativeElement:', this.el.nativeElement);
	}
	private subscription: any;
	public publicData: Array<any> = [ {users: []}, {labels: []} ];
	public labelDetails = [];
	public errorMessage: string;
	private getUserDetails(userId, callback) {
		this.UserDetailsService.getUserDetails().subscribe(
			data => this.labelDetails = data,
			error => this.errorMessage = <any> error,
			() => {
				console.log('getUserDetails done');
				callback(this.labelDetails);
			}
		);
	}
	private showLabelDetailsPreview(event) { // tslint:disable-line
		// had to disable all tslint rules for previous line, disabling no-unused-variable is buggy
		console.log('mouse enter');
		let domEls = event.target.parentElement.querySelectorAll('span');
		if (domEls[1].innerHTML === '') {
			this.emitSpinnerStartEvent();
			this.getUserDetails(event.target.id, (labelDetails) => {
				let obj = labelDetails[0];
				console.log(obj);
				domEls[1].innerHTML = '<i class="fa fa-music" aria-hidden="true"></i> ' + obj.track_count;
				domEls[2].innerHTML = '<i class="fa fa-list" aria-hidden="true"></i> ' + obj.playlist_count;
				domEls[3].innerHTML = '<i class="fa fa-star" aria-hidden="true"></i> ' + obj.public_favorites_count;
				domEls[4].innerHTML = '<i class="fa fa-users" aria-hidden="true"></i> ' + obj.followers_count;
				this.emitSpinnerStopEvent();
				setTimeout(() => {
					domEls[0].style.display = 'none';
				}, 1000);
			});
		}else { domEls[0].style.display = 'flex'; }
	}
	private hideLabelDetailsPreview(event) { // tslint:disable-line
		// had to disable all tslint rules for previous line, disabling no-unused-variable is buggy
		console.log('mouse leave');
		let domEls = event.target.parentElement.querySelectorAll('span');
		if (domEls[1].innerHTML !== '') { domEls[0].style.display = 'none'; }
	}

	private labelSearchValue: string;
	get labelSearchQuery() {
		return this.labelSearchValue;
	}
	set labelSearchQuery(val) {
		this.emitLabelSearchValueChangeEvent(val);
	}
	private emitLabelSearchValueChangeEvent(val) {
		console.log('labelSearchValue changed to:', val);
		this.emitter.emitEvent({search: val});
	}

	public orderProp = 'timestamp';
	get sortLabelsByCriterion() {
		return this.orderProp;
	}
	set sortLabelsByCriterion(val) {
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
					this.publicData[1].labels.sort((a, b) => {
						return b.timestamp - a.timestamp;
					});
				}
				if (message.sort === 'username') {
					this.publicData[1].labels.sort((a, b) => {
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
