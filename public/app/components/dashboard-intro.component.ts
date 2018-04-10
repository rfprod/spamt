import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';
import { ServerStaticDataService } from '../services/server-static-data.service';
import { PublicDataService } from '../services/public-data.service';
import { WebsocketService } from '../services/websocket.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/first';

// declare let d3: any;

@Component({
	selector: 'dashboard-intro',
	templateUrl: '/public/app/views/dashboard-intro.html',
	host: {
		class: 'mat-body-1'
	}
})
export class DashboardIntroComponent implements OnInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService,
		private websocket: WebsocketService,
		private serverStaticDataService: ServerStaticDataService,
		private publicDataService: PublicDataService
	) {
		console.log('DashboardIntroComponent element:', this.el.nativeElement);
	}

	private ngUnsubscribe: Subject<void> = new Subject();

	public title: string = 'SPAMT';
	public description: string = 'Social Profile Analysis and Management Tool';
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
		{
			key: 'Default',
			y: 1,
		},
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
		dynamic: [],
	};
	public ws = new WebSocket(this.websocket.generateUrl('/api/app-diag/dynamic'));
	public errorMessage: string;

	private getServerStaticData(callback): void {
		this.serverStaticDataService.getData().first().subscribe(
			(data: any) => this.serverData.static = data,
			(error: any) => this.errorMessage = error,
			() => {
				console.log('getServerStaticData done, data:', this.serverData.static);
				if (callback) { callback(); }
			}
		);
	}
	private getPublicData(callback): void {
		this.publicDataService.getData().first().subscribe(
			(data: any) => {
				this.nvd3.clearElement();
				this.appUsageData = data;
			},
			(error: any) => this.errorMessage = error,
			() => {
				console.log('getPublicData done, data:', this.appUsageData);
				if (callback) { callback(); }
			}
		);
	}

// Spinner
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
		if (this.showModal) {
			this.ws.send(JSON.stringify({action: 'pause'}));
		} else { this.ws.send(JSON.stringify({action: 'get'})); }
		this.showModal = (!this.showModal) ? true : false;
	}

// Help
	private showHelp: boolean = false; // controls help labells visibility, catches events from nav component

	@ViewChild('chart') private nvd3: any;

	public ngOnInit(): void {
		console.log('ngOnInit: DashboardIntroComponent initialized');
		this.emitSpinnerStartEvent();
		this.emitter.emitEvent({appInfo: 'show'});

		this.ws.onopen = (evt: any) => {
			console.log('websocket opened:', evt);
			/*
			*	ws connection is established, but data is requested
			*	only when this.showModal switches to true, i.e.
			*	app diagnostics modal is visible to a user
			*/
			// this.ws.send(JSON.stringify({action: 'get'}));
		};
		this.ws.onmessage = (event: any) => {
			console.log('websocket incoming message event:', event);
			this.serverData.dynamic = [];
			const data = JSON.parse(event.data);
			for (const d in data) {
				if (data[d]) { this.serverData.dynamic.push(data[d]); }
			}
			console.log('this.serverData.dynamic:', this.serverData.dynamic);
		};
		this.ws.onerror = (evt: any) => {
			console.log('websocket error:', evt);
			this.ws.close();
		};
		this.ws.onclose = (evt: any) => {
			console.log('websocket closed:', evt);
		};

		this.emitter.getEmitter().takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			if (event.sys === 'close websocket') {
				console.log('/intro consuming event:', event);
				console.log('closing webcosket');
				this.ws.close();
			}
			if (event.help === 'toggle') {
				console.log('/intro consuming event:', event);
				console.log('toggling help labels visibility', this.showHelp);
				this.showHelp = (this.showHelp) ? false : true;
			}
		});

		this.getPublicData(() => {
			this.getServerStaticData(() => {
				this.emitSpinnerStopEvent();
			});
		});
	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: DashboardIntroComponent destroyed');
		this.ws.close();
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
