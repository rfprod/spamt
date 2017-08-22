import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';

@Component({
	selector: 'app-info',
	template: `
		<span class="app-info" *ngIf="!hideInfo">
			<a class="flex-item" *ngFor="let badge of badges" href="{{badge.link}}" data-toggle="tooltip" target=_blank title="{{badge.title}}">
				<img src="{{badge.img}}"/>
			</a>
		</span>
	`,
})
export class AppInfoComponent implements OnInit, OnDestroy {
	constructor(
		public el: ElementRef,
		private emitter: EventEmitterService
	) {
		console.log('this.el.nativeElement:', this.el.nativeElement);
	}
	private subscription: any;
	private hideInfo: boolean = false;
	private badges: any[] = [ // tslint:disable-line
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
		},
	];

	public ngOnInit(): void {
		console.log('ngOnInit: AppInfoComponent initialized');
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			if (message.appInfo) {
				console.log('app-info consuming event:', message);
				if (message.appInfo === 'hide') { this.hideInfo = true; }
				if (message.appInfo === 'show') { this.hideInfo = false; }
			}
		});
	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppInfoComponent destroyed');
		this.subscription.unsubscribe();
	}
}
