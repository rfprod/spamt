import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';

@Component({
	selector: 'app-info',
	template: `
		<a class="flex-item" [hidden]="hideInfo" *ngFor="let badge of badges" href="{{badge.link}}" data-toggle="tooltip" target=_blank title="{{badge.title}}">
			<img src="{{badge.img}}"/>
		</a>
	`,
})
export class AppInfoComponent implements OnInit, OnDestroy {
	constructor( private emitter: EventEmitterService ) {}
	private subscription: any;
	private hideInfo: boolean = true;
	private badges = [ // tslint:disable-line
		// had to disable all tslint rules for previous line, disabling no-unused-variable is buggy
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
			title: 'AngularJS - an open-source web application framework mainly maintained by Google and by a community of individuals and corporations.',
			link: 'https://en.wikipedia.org/wiki/AngularJS',
			img: '/public/img/AngularJS_logo.svg',
		},
		{
			title: 'Soundcloud - a global online audio distribution platform based in Berlin, Germany, that enables its users to upload, record, promote, and share their originally-created sounds.',
			link: 'https://en.wikipedia.org/wiki/SoundCloud',
			img: '/public/img/SoundCloud_logo.svg',
		},
	];

	public ngOnInit() {
		console.log('ngOnInit: AppInfoComponent initialized');
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			console.log('app-info consuming event:', message);
			if (message.appInfo === 'hide') { this.hideInfo = true; }
			if (message.appInfo === 'show') { this.hideInfo = false; }
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AppInfoComponent destroyed');
		this.subscription.unsubscribe();
	}
}
