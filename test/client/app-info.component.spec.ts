import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';
import '../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from '../../public/app/custom-material.module';

import { EventEmitterService } from '../../public/app/services/event-emitter.service';

import { AppInfoComponent } from '../../public/app/components/app-info.component';

describe('AppInfoComponent', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [ AppInfoComponent ],
			imports: [ NoopAnimationsModule, CustomMaterialModule, FlexLayoutModule ],
			providers: [
				{ provide: APP_BASE_HREF, useValue: '/' },
				{ provide: Window, useValue: { location: { host: 'localhost', protocol: 'http' } } },
				EventEmitterService
			],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
		}).compileComponents().then(() => {
			this.fixture = TestBed.createComponent(AppInfoComponent);
			this.component = this.fixture.componentInstance;
			this.eventEmitterSrv = TestBed.get(EventEmitterService) as EventEmitterService;
			spyOn(this.eventEmitterSrv, 'emitEvent').and.callThrough();
			done();
		});
	});

	it('should be defined', () => {
		expect(this.component).toBeDefined();
	});

	it('should have variables defined', () => {
		const c = this.component;
		expect(c.el).toBeDefined();
		expect(c.emitter).toBeDefined();
		expect(c.hideInfo).toBeDefined();
		expect(c.hideInfo).toEqual(jasmine.any(Boolean));
		expect(c.hideInfo).toEqual(false);
		expect(c.badges).toBeDefined();
		expect(c.badges).toEqual(jasmine.any(Array));
		expect(c.badges.length).toEqual(4);
		expect(c.badges[0]).toEqual(jasmine.objectContaining({
			title: 'Node.js - an open-source, cross-platform runtime environment for developing server-side Web applications.',
			link: 'https://en.wikipedia.org/wiki/Node.js',
			img: '/public/img/Node.js_logo.svg'
		}));
		expect(c.badges[1]).toEqual(jasmine.objectContaining({
			title: 'MongoDB - a free and open-source cross-platform document-oriented database.',
			link: 'https://en.wikipedia.org/wiki/MongoDB',
			img: '/public/img/MongoDB_logo.svg'
		}));
		expect(c.badges[2]).toEqual(jasmine.objectContaining({
			title: 'Angular - (commonly referred to as "Angular 2+" or "Angular 2") is a TypeScript-based open-source front-end web application platform led by the Angular Team at Google and by a community of individuals and corporations to address all of the parts of the developer\'s workflow while building complex web applications. Angular is a complete rewrite from the same team that built AngularJS.',
			link: 'https://en.wikipedia.org/wiki/Angular_(application_platform)',
			img: '/public/img/Angular_logo.svg'
		}));
		expect(c.badges[3]).toEqual(jasmine.objectContaining({
			title: 'Soundcloud - a global online audio distribution platform based in Berlin, Germany, that enables its users to upload, record, promote, and share their originally-created sounds.',
			link: 'https://en.wikipedia.org/wiki/SoundCloud',
			img: '/public/img/SoundCloud_logo.svg'
		}));
		expect(c.ngOnInit).toBeDefined();
		expect(c.ngOnInit).toEqual(jasmine.any(Function));
		expect(c.ngOnDestroy).toBeDefined();
		expect(c.ngOnDestroy).toEqual(jasmine.any(Function));
	});

	it('should init on ngOnInit, listen to emitter messages and change hideInfo variable state on respective messages', () => {
		const c = this.component;
		c.ngOnInit();
		expect(c.hideInfo).toEqual(false);
		c.emitter.emitEvent({appInfo: 'show'});
		expect(c.hideInfo).toEqual(false);
		c.emitter.emitEvent({appInfo: 'hide'});
		expect(c.hideInfo).toEqual(true);
	});

	it('should cleanup on ngOnDestroy', () => {
		const c = this.component;
		c.ngOnInit();
		spyOn(c.ngUnsubscribe, 'next').and.callThrough();
		spyOn(c.ngUnsubscribe, 'complete').and.callThrough();
		c.ngOnDestroy();
		expect(c.ngUnsubscribe.next).toHaveBeenCalled();
		expect(c.ngUnsubscribe.complete).toHaveBeenCalled();
	});
});

