import { Directive, ElementRef, Renderer, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';

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
	
	private progressInterval: any;
	public reportProgress(): void {
		const progress = 100 * this.el.nativeElement.currentTime / this.el.nativeElement.duration;
		this.el.nativeElement.parentElement.querySelector('.underlay').style.width = progress+'%';
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
		this.progressInterval = setInterval(() => {
			if (this.el.nativeElement.readyState === 4) {
				console.log('reporting progress: ', this.el.nativeElement.readyState);
				this.reportProgress();
			}
		}, 1000);
		/*
		*	listen to <audio> element playback controls and broadcast message
		*/
		this.el.nativeElement.addEventListener('play', () => {
			console.log('AudioPlayerDirective, played with <audio> controls');
			this.emitter.emitEvent({ AudioPlayerDirective: 'play' });
		});
		this.el.nativeElement.addEventListener('pause', () => {
			console.log('AudioPlayerDirective, paused with <audio> controls');
			this.emitter.emitEvent({ AudioPlayerDirective: 'pause' });
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AudioPlayerDirective destroyed');
		this.subscription.unsubscribe();
		clearInterval(this.interval);
		clearInterval(this.progressInterval);
	}
}
