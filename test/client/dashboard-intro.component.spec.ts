'use strict';

/* global */

import { ElementRef } from '@angular/core';
import { nvD3 } from 'ng2-nvd3';
import { EventEmitterService } from '../../public/app/services/event-emitter.service';
import { ServerStaticDataService } from '../../public/app/services/server-static-data.service';
import { PublicDataService } from '../../public/app/services/public-data.service';
import { Observable } from 'rxjs/Rx';

import { DashboardIntroComponent } from '../../public/app/components/dashboard-intro.component';

describe('DashboardIntroComponent', () => {

		class MockEventEmitterService extends ServerStaticDataService {
			constructor() {
				super(null);
			}
		}

		class MockServerStaticDataService extends ServerStaticDataService {
			constructor() {
				super(null);
			}
			getServerStaticData() {
				console.log('getServerStaticData: return test data');
				return Observable.of([
					{
						name: 'dyn name 1',
						value: 'dyn value 1'
					},{
						name: 'dyn name 2',
						value: 'dyn value 2'
					},{
						name: 'dyn name 3',
						value: 'dyn value 3'
					},{
						name: 'dyn name 4',
						value: 'dyn value 4'
					}
				]);
			};
		}

		class MockPublicDataService extends PublicDataService {
			constructor() {
				super(null);
			}
			getPublicData() {
				console.log('getPublicData: return test data');
				return Observable.of([
					{
						name: 'dyn name 1',
						value: 'dyn value 1'
					},{
						name: 'dyn name 2',
						value: 'dyn value 2'
					}
				]);
			};
		}

		beforeEach(() => {
			this.elementRef = ElementRef;
			this.eventEmitterSrv = EventEmitterService;
			this.serverStaticDataSrv = MockServerStaticDataService;
			this.publicDataSrv = MockPublicDataService;
			this.component = new DashboardIntroComponent(this.elementRef, this.eventEmitterSrv, this.serverStaticDataSrv, this.publicDataSrv);
		});

		it('should be defined', () => {
			console.log(this.component);
			expect(this.component).toBeDefined();
		});

});

