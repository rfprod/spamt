import { Directive, ElementRef, Renderer, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';

@Directive({ selector: '[audioPlayer]' })
export class AudioPlayerDirective implements OnInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private renderer: Renderer,
		private emitter: EventEmitterService
	) {
		console.log('AudioPlayerDirective element: ', this.el.nativeElement);
	}

	private subscriptions: any[] = [];

	private interval: any;

	private progressInterval: any;
	public reportProgress(): void {
		const progress = 100 * this.el.nativeElement.currentTime / this.el.nativeElement.duration;
		const selectedTrackObj = this.el.nativeElement.parentElement.querySelector('.selected-track');
		const waveformWidth = selectedTrackObj.querySelector('.waveform').width;
		selectedTrackObj.querySelector('.underlay').style.width = (waveformWidth * progress / 100) + 'px';
	}

	public ngOnInit() {
		console.log('ngOnInit: AudioPlayerDirective initialized');
		const sub = this.emitter.getEmitter().subscribe((event: any) => {
			if (event.audio) {
				console.log('AudioPlayerDirective control event: ', event.audio);
				if (event.audio === 'play') {
						this.interval = setInterval(() => {
						console.log('this.el.nativeElement.readyState: ', this.el.nativeElement.readyState);
						/*
						*	states
						*	0 - nothing
						*	1 - has metadata
						*	2 - has current data
						*	3 - has future data
						*	4 - has enough data
						*/
						if (this.el.nativeElement.readyState >= 2) {
							clearInterval(this.interval);
							this.el.nativeElement.play();
						}
					}, 1500);
				}
				if (event.audio === 'pause') {
					this.el.nativeElement.pause();
					clearInterval(this.interval);
				}
				if (event.audio === 'volume+') {
					this.el.nativeElement.volume += 0.1;
				}
				if (event.audio === 'volume-') {
					this.el.nativeElement.volume -= 0.1;
				}
			}
		});
		this.subscriptions.push(sub);

		this.progressInterval = setInterval(() => {
			if (this.el.nativeElement.readyState === 4) {
				// console.log('reporting progress: ', this.el.nativeElement.readyState);
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
		if (this.subscriptions.length) {
			for (const sub of this.subscriptions) {
				sub.unsubscribe();
			}
		}
		clearInterval(this.interval);
		clearInterval(this.progressInterval);
	}
}
