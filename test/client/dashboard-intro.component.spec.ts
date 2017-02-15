'use strict';

/* global */

import { BaseRequestOptions, ConnectionBackend, Http, RequestOptions, Response, ResponseOptions } from '@angular/http';
import { ElementRef, ReflectiveInjector } from '@angular/core';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Observable } from 'rxjs/Rx';
import { nvD3 } from 'ng2-nvd3';
import { EventEmitterService } from '../../public/app/services/event-emitter.service';
import { ServerStaticDataService } from '../../public/app/services/server-static-data.service';
import { PublicDataService } from '../../public/app/services/public-data.service';

import { DashboardIntroComponent } from '../../public/app/components/dashboard-intro.component';

describe('DashboardIntroComponent', () => {

		class MockWebsocket extends WebSocket {
			constructor(wsUrl) {
				super(wsUrl);
			}
			send(message): Object {
				return message;
			}
			close(): boolean {
				return true;
			}
		}

		const mockedResponse = [ { name: 'one', value: 1 }, { name: 'two', value: 2 } ];

		beforeEach(() => {
			this.injector = ReflectiveInjector.resolveAndCreate([
				{ provide: ConnectionBackend, useClass: MockBackend },
				{ provide: RequestOptions, useClass: BaseRequestOptions },
				{
					provide: Http,
					useFactory: (backend, options) => new Http(backend, options),
					deps: [ConnectionBackend, RequestOptions]
				},
				{
					provide: ServerStaticDataService,
					useFactory: (http) => new ServerStaticDataService(http),
					deps: [Http]
				},
				{
					provide: PublicDataService,
					useFactory: (http) => new PublicDataService(http),
					deps: [Http]
				}
			]);
			this.elementRef = new ElementRef('<dashboard-intro>');
			this.emitter = new EventEmitterService();
			this.serverStaticDataService = this.injector.get(ServerStaticDataService);
			this.publicDataService = this.injector.get(PublicDataService);
			/*
			*	TODO - optionally switch to backend mock instead of spying and returning values
			*
			*	this.backend = this.injector.get(ConnectionBackend) as MockBackend;
			*	this.backend.connections.subscribe((connection: MockBackend) => this.lastConnection = connection);
			*	this.lastConnection.mockRespond(new Response(new ResponseOptions({
			*		body: mockedResponse
			*	})));
			*/
			this.component = new DashboardIntroComponent(this.elementRef, this.emitter, this.serverStaticDataService, this.publicDataService);

			spyOn(this.component.serverStaticDataService, 'getData').and.returnValue(Observable.of(mockedResponse));
			spyOn(this.component.publicDataService, 'getData').and.returnValue(Observable.of(mockedResponse));
			spyOn(this.component, 'emitSpinnerStartEvent').and.callThrough();
			spyOn(this.component, 'emitSpinnerStopEvent').and.callThrough();
		});

		it('should be defined', (done) => {
			console.log(this.component);
			expect(this.component).toBeDefined();
			done();
		});

		it('should have variables defined', (done) => {
			const c = this.component;
			expect(c.title).toBeDefined();
			expect(c.title).toEqual(jasmine.any(String));
			expect(c.title === 'SPAMT').toBeTruthy();
			expect(c.description).toBeDefined();
			expect(c.description).toEqual(jasmine.any(String));
			expect(c.description === 'Social Profile Analysis and Management Tool').toBeTruthy();
			expect(c.host).toBeDefined();
			expect(c.host).toEqual(jasmine.any(String));
			expect(c.host).toEqual(window.location.host);
			expect(c.wsUrl).toEqual(jasmine.any(String));
			expect(c.wsUrl).toEqual('ws://' + c.host + '/app-diag/dynamic');
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
			expect(c.emitter).toEqual(this.emitter);
			expect(c.emitSpinnerStartEvent).toBeDefined();
			expect(c.emitSpinnerStartEvent).toEqual(jasmine.any(Function));
			expect(c.emitSpinnerStopEvent).toBeDefined();
			expect(c.emitSpinnerStopEvent).toEqual(jasmine.any(Function));
			expect(c.showModal).toBeDefined();
			expect(c.showModal).toEqual(jasmine.any(Boolean));
			expect(c.showModal).toBeFalsy();
			expect(c.toggleModal).toBeDefined();
			expect(c.toggleModal).toEqual(jasmine.any(Function));
			expect(c.showHelp).toBeDefined();
			expect(c.showHelp).toEqual(jasmine.any(Boolean));
			expect(c.showHelp).toBeFalsy();
			expect(c.ngOnInit).toBeDefined();
			expect(c.ngOnInit).toEqual(jasmine.any(Function));
			expect(c.ngOnDestroy).toBeDefined();
			expect(c.ngOnDestroy).toEqual(jasmine.any(Function));
			done();
		});

		it('should emit spinner start control message on respective method call', (done) => {
			const c = this.component;
			c.emitter.getEmitter().subscribe(message => { expect(message.spinner).toEqual('start'); done(); });
			c.emitSpinnerStartEvent();
		});

		it('should emit spinner stop control message on respective method call', (done) => {
			const c = this.component;
			c.emitter.getEmitter().subscribe(message => { expect(message.spinner).toEqual('stop'); done(); });
			c.emitSpinnerStopEvent();
		});

		it('should toggle modal state and control websocket connection on respective method call', (done) => {
			const c = this.component;
			c.ws = new MockWebsocket(c.wsUrl);
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

		it('should get server static data on respective method call', (done) => {
			const c = this.component;
			expect(c.serverData.static.length).toEqual(0);
			c.getServerStaticData();
			expect(c.serverStaticDataService.getData).toHaveBeenCalled();
			expect(c.serverData.static.length).toBeGreaterThan(0);
			done();
		});

		it('should get public data on respective method call', (done) => {
			const c = this.component;
			expect(c.appUsageData.length).toEqual(5); // it is prefilled with dummy data structure for convenience
			c.getPublicData();
			expect(c.publicDataService.getData).toHaveBeenCalled();
			expect(c.appUsageData.length).toEqual(2); // this is actual data
			done();
		});

		it('should init on ngOnInit', (done) => {
			const c = this.component;
			expect(typeof c.subscription === 'undefined').toBeTruthy();
			expect(c.serverData.static.length).toEqual(0);
			expect(c.appUsageData.length).toEqual(5); // it is prefilled with dummy data structure for convenience
			c.ngOnInit();
			expect(c.emitSpinnerStartEvent).toHaveBeenCalled();
			expect(c.serverStaticDataService.getData).toHaveBeenCalled();
			expect(c.publicDataService.getData).toHaveBeenCalled();
			expect(c.serverData.static.length).toBeGreaterThan(0);
			expect(c.appUsageData.length).toEqual(2); // this is actual data
			expect(c.emitSpinnerStopEvent).toHaveBeenCalled();
			expect(typeof c.subscription === 'undefined').toBeFalsy();
			done();
		});

		it('should cleanup on ngOnDestroy', (done) => {
			const c = this.component;
			spyOn(c.ws, 'close');
			c.ngOnInit();
			expect(typeof c.subscription === 'undefined').toBeFalsy();
			spyOn(c.subscription, 'unsubscribe').and.callThrough();
			c.ngOnDestroy();
			expect(c.ws.close).toHaveBeenCalled();
			expect(c.subscription.unsubscribe).toHaveBeenCalled();
			done();
		});
});

