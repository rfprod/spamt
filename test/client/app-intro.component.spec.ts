import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Http, BaseRequestOptions, Response, ResponseOptions, Headers } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { FlexLayoutModule } from '@angular/flex-layout';
import '../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from '../../public/app/modules/custom-material.module';

import { CustomHttpHandlersService } from '../../public/app/services/custom-http-handlers.service';
import { CustomHttpUtilsService } from '../../public/app/services/custom-http-utils.service';

import { NvD3Component } from 'ng2-nvd3';
import { EventEmitterService } from '../../public/app/services/event-emitter.service';

import { ServerStaticDataService } from '../../public/app/services/server-static-data.service';
import { PublicDataService } from '../../public/app/services/public-data.service';
import { WebsocketService } from '../../public/app/services/websocket.service';
import { Observable, concat, of } from 'rxjs';

import { AppIntroComponent } from '../../public/app/components/app-intro.component';

describe('AppIntroComponent', () => {

	const mockedResponse = [ { name: 'one', value: 1 }, { name: 'two', value: 2 } ];

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [ NvD3Component, AppIntroComponent ],
			imports: [ NoopAnimationsModule, CustomMaterialModule, FlexLayoutModule ],
			providers: [
				{ provide: APP_BASE_HREF, useValue: '/' },
				{ provide: 'Window', useValue: window },
				EventEmitterService,
				BaseRequestOptions,
				MockBackend,
				{ provide: Http,
					useFactory: (mockedBackend, requestOptions) => new Http(mockedBackend, requestOptions),
					deps: [MockBackend, BaseRequestOptions]
				},
				CustomHttpHandlersService,
				{
					provide: CustomHttpUtilsService,
					useFactory: (win) => new CustomHttpUtilsService(win),
					deps: ['Window']
				},
				{
					provide: PublicDataService,
					useFactory: (http, handlers, utils) => new PublicDataService(http, handlers, utils),
					deps: [Http, CustomHttpHandlersService, CustomHttpUtilsService]
				},
				{
					provide: ServerStaticDataService,
					useFactory: (http, handlers, utils) => new ServerStaticDataService(http, handlers, utils),
					deps: [Http, CustomHttpHandlersService, CustomHttpUtilsService]
				},
				{
					provide: WebsocketService,
					useFactory: (win) => new WebsocketService(win),
					deps: ['Window']
				}
			],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
		}).compileComponents().then(() => {
			this.fixture = TestBed.createComponent(AppIntroComponent);
			this.component = this.fixture.componentInstance;
			spyOn(this.component.serverStaticDataService, 'getData').and.returnValue(concat(of(mockedResponse)));
			spyOn(this.component.publicDataService, 'getData').and.returnValue(concat(of(mockedResponse)));
			this.eventEmitterSrv = TestBed.get(EventEmitterService) as EventEmitterService;
			spyOn(this.eventEmitterSrv, 'emitSpinnerStartEvent').and.callThrough();
			spyOn(this.eventEmitterSrv, 'emitSpinnerStopEvent').and.callThrough();
			spyOn(this.eventEmitterSrv, 'emitEvent').and.callThrough();
			this.serverStaticDataSrv = TestBed.get(ServerStaticDataService) as ServerStaticDataService;
			this.publicDataSrv = TestBed.get(PublicDataService) as PublicDataService;
			this.websocket = TestBed.get(WebsocketService) as WebsocketService;
			this.backend = TestBed.get(MockBackend) as MockBackend;
			/*
			*	TODO
			*
			*	this.backend.connections.subscribe((connection: MockConnection) => {
			*		connection.mockRespond(new Response(new ResponseOptions({ body: { data: {} }, status: 200, headers: new Headers({}) })));
			*	});
			*
			*	this.backend.connections.subscribe((connection: MockConnection) => {
			*		connection.mockError(new Error('{ status: 400 }'));
			*	});
			*
			*/
			done();
		});
	});

	it('should be defined', () => {
		expect(this.component).toBeDefined();
	});

	it('should have variables defined', () => {
		const c = this.component;
		expect(c.title).toBeDefined();
		expect(c.title).toEqual(jasmine.any(String));
		expect(c.title === 'SPAMT').toBeTruthy();
		expect(c.description).toBeDefined();
		expect(c.description).toEqual(jasmine.any(String));
		expect(c.description === 'Social Profile Analysis and Management Tool').toBeTruthy();
		expect(c.chartOptions).toBeDefined();
		expect(c.chartOptions).toEqual(jasmine.any(Object));
		expect(c.chartOptions.chart).toEqual(jasmine.any(Object));
		expect(c.chartOptions.chart).toEqual(jasmine.objectContaining({ type: 'pieChart', donut: true, showLabels: true }));
		expect(c.appUsageData).toBeDefined();
		expect(c.appUsageData).toEqual(jasmine.any(Array));
		expect(c.serverData).toBeDefined();
		expect(c.serverData).toEqual(jasmine.any(Object));
		expect(c.ws).toBeDefined();
		expect(c.errorMessage).not.toBeDefined();
		expect(c.serverStaticDataService).toBeDefined();
		expect(c.getServerStaticData).toBeDefined();
		expect(c.getServerStaticData).toEqual(jasmine.any(Function));
		expect(c.publicDataService).toBeDefined();
		expect(c.getPublicData).toBeDefined();
		expect(c.getPublicData).toEqual(jasmine.any(Function));
		expect(c.emitter).toBeDefined();
		expect(c.showModal).toBeDefined();
		expect(c.showModal).toEqual(jasmine.any(Boolean));
		expect(c.showModal).toBeFalsy();
		expect(c.toggleModal).toBeDefined();
		expect(c.toggleModal).toEqual(jasmine.any(Function));
		expect(c.showHelp).toBeDefined();
		expect(c.showHelp).toEqual(jasmine.any(Boolean));
		expect(c.showHelp).toBeFalsy();
		expect(c.badges).toEqual([
			{
				title: 'Node.js - an open-source, cross-platform runtime environment for developing server-side Web applications.',
				link: 'https://en.wikipedia.org/wiki/Node.js',
				img: '/public/img/Node.js_logo.svg',
			},
			{
				title: 'MongoDB - a free and open-source cross-platform document-oriented database.',
				link: 'https://en.wikipedia.org/wiki/MongoDB',
				img: '/public/img/MongoDB_logo.svg',
			},
			{
				title: 'Angular - (commonly referred to as "Angular 2+" or "Angular 2") is a TypeScript-based open-source front-end web application platform led by the Angular Team at Google and by a community of individuals and corporations to address all of the parts of the developer\'s workflow while building complex web applications. Angular is a complete rewrite from the same team that built AngularJS.',
				link: 'https://en.wikipedia.org/wiki/Angular_(application_platform)',
				img: '/public/img/Angular_logo.svg',
			},
			{
				title: 'Soundcloud - a global online audio distribution platform based in Berlin, Germany, that enables its users to upload, record, promote, and share their originally-created sounds.',
				link: 'https://en.wikipedia.org/wiki/SoundCloud',
				img: '/public/img/SoundCloud_logo.svg',
			}
		]);
		expect(c.ngOnInit).toBeDefined();
		expect(c.ngOnInit).toEqual(jasmine.any(Function));
		expect(c.ngOnDestroy).toBeDefined();
		expect(c.ngOnDestroy).toEqual(jasmine.any(Function));
	});

	it('should toggle modal state and control websocket connection on respective method call', (done) => {
		const c = this.component;
		spyOn(c.ws, 'send');
		expect(c.showModal).toBeFalsy();
		c.toggleModal();
		expect(c.ws.send).toHaveBeenCalled();
		expect(c.ws.send.calls.argsFor(0)).toEqual(['{"action":"get"}']);
		expect(c.showModal).toBeTruthy();
		c.toggleModal();
		expect(c.ws.send).toHaveBeenCalled();
		expect(c.ws.send.calls.argsFor(1)).toEqual(['{"action":"pause"}']);
		expect(c.showModal).toBeFalsy();
		done();
	});

	it('should get server static data on respective method call', () => {
		const c = this.component;
		expect(c.serverData.static.length).toEqual(0);
		c.getServerStaticData();
		expect(c.serverStaticDataService.getData).toHaveBeenCalled();
		expect(c.serverData.static.length).toBeGreaterThan(0);
	});

	it('should get public data on respective method call', () => {
		const c = this.component;
		expect(c.appUsageData.length).toEqual(5); // it is prefilled with dummy data structure for convenience
		c.getPublicData();
		expect(c.publicDataService.getData).toHaveBeenCalled();
		expect(c.appUsageData.length).toEqual(2); // this is actual data
	});

	it('should init on ngOnInit', () => {
		const c = this.component;
		expect(c.serverData.static.length).toEqual(0);
		expect(c.appUsageData.length).toEqual(5); // it is prefilled with dummy data structure for convenience
		c.ngOnInit();
		expect(this.eventEmitterSrv.emitSpinnerStartEvent).toHaveBeenCalled();
		expect(c.serverStaticDataService.getData).toHaveBeenCalled();
		expect(c.publicDataService.getData).toHaveBeenCalled();
		expect(c.serverData.static.length).toBeGreaterThan(0);
		expect(c.appUsageData.length).toEqual(2); // this is actual data
		expect(this.eventEmitterSrv.emitSpinnerStopEvent).toHaveBeenCalled();
	});

	it('should cleanup on ngOnDestroy', () => {
		const c = this.component;
		c.ngOnInit();
		spyOn(c.ws, 'close');
		for (const sub of c.subscriptions) {
			spyOn(sub, 'unsubscribe').and.callThrough();
		}
		c.ngOnDestroy();
		expect(c.ws.close).toHaveBeenCalled();
		this.component.ngOnDestroy();
		for (const sub of c.subscriptions) {
			expect(sub.unsubscribe).toHaveBeenCalled();
		}
	});

});
