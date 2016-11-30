import { Directive, ElementRef, Renderer, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Directive({ selector: '[audioPlayer]' })
export class AudioPlayerDirective implements OnInit, OnDestroy {
	constructor(
		private el: ElementRef,
		private renderer: Renderer,
		private emitter: EventEmitterService
	) {
		console.log('AudioPlayerDirective element: ', el.nativeElement);
	}
	private subscription: any;
	
	public reportProgress(): Observable<any> {
		/*
		*	TODO
		*	use this method in dashboard details controller
		*/
		return Observable.timer(1000).map(() => {
			/*
			*	returns elapsed time in percent
			*/
			return 100 * this.el.nativeElement.played.end(0) / this.el.nativeElement.seekable.end(0);
		});
	}
	
	private interval: any;

	public ngOnInit() {
		console.log('ngOnInit: AudioPlayerDirective initialized');
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			if (message.audio) {
				console.log('AudioPlayerDirective consuming control signal: ', message.audio);
				if (message.audio === 'play') {
					this.interval = setInterval(() => {
						console.log('this.el.nativeElement.readyState: ', this.el.nativeElement.readyState);
						if (this.el.nativeElement.readyState === 4) {
							this.el.nativeElement.play();
							clearInterval(this.interval);
						}
					}, 1000);
				}
				if (message.audio === 'pause') {
					this.el.nativeElement.pause();
					clearInterval(this.interval);
				}
				if (message.audio === 'volume+') {
					this.el.nativeElement.volume += 0.1;
				}
				if (message.audio === 'volume-') {
					this.el.nativeElement.volume -= 0.1;
				}
			}
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AudioPlayerDirective destroyed');
		this.subscription.unsubscribe();
	}
}
