'use strict';

/* global */

import { ElementRef } from '@angular/core';
import { EventEmitterService } from '../../public/app/services/event-emitter.service';

import { AppInfoComponent } from '../../public/app/components/app-info.component';

describe('AppInfoComponent', () => {

		beforeEach(() => {
			this.elementRef = new ElementRef('<app-info>');
			this.emitter = new EventEmitterService();
			this.component = new AppInfoComponent(this.elementRef, this.emitter);
		});

		it('should be defined', (done) => {
			expect(this.component).toBeDefined();
			done();
		});

		it('should have variables defined', (done) => {
			const c = this.component;
			expect(c.el).toBeDefined();
			expect(c.el).toEqual(this.elementRef);
			expect(c.emitter).toBeDefined();
			expect(c.emitter).toEqual(this.emitter);
			expect(typeof c.subscription === 'undefined').toBeTruthy();
			expect(c.hideInfo).toBeDefined();
			expect(c.hideInfo).toEqual(jasmine.any(Boolean));
			expect(c.hideInfo).toEqual(true);
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
			done();
		});

		it('should init on ngOnInit, listen to emitter messages and change hideInfo variable state on respective messages', (done) => {
			const c = this.component;
			expect(typeof c.subscription === 'undefined').toBeTruthy();
			c.ngOnInit();
			expect(c.hideInfo).toEqual(true);
			expect(typeof c.subscription === 'undefined').toBeFalsy();
			c.emitter.emitEvent({appInfo: 'show'});
			expect(c.hideInfo).toEqual(false);
			c.emitter.emitEvent({appInfo: 'hide'});
			expect(c.hideInfo).toEqual(true);
			done();
		});

		it('should cleanup on ngOnDestroy', (done) => {
			const c = this.component;
			c.ngOnInit();
			expect(typeof c.subscription === 'undefined').toBeFalsy();
			spyOn(c.subscription, 'unsubscribe').and.callThrough();
			c.ngOnDestroy();
			expect(c.subscription.unsubscribe).toHaveBeenCalled();
			done();
		});
});

