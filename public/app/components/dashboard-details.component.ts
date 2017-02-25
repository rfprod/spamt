import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';
import { SCgetQueriesService } from '../services/sc-get-queries.service';
import { SCgetUserService } from '../services/sc-get-user.service';
import { SCgetUserDetailsService } from '../services/sc-get-user-details.service';
import { SCgetUserTrackDownloadService } from '../services/sc-get-user-track-download.service';
import { SCgetUserTrackStreamService } from '../services/sc-get-user-track-stream.service';
import { UserService } from '../services/user-service.service';

@Component({
	selector: 'dashboard-details',
	templateUrl: '/public/app/views/dashboard-details.html',
})
export class DashboardDetailsComponent implements OnInit, OnDestroy {
	constructor(
		public el: ElementRef,
		private emitter: EventEmitterService,
		private scGetQueriesService: SCgetQueriesService,
		private scGetUserService: SCgetUserService,
		private scGetUserDetailsService: SCgetUserDetailsService,
		private scGetUserTrackDownloadService: SCgetUserTrackDownloadService,
		private scGetUserTrackStreamService: SCgetUserTrackStreamService,
		private userService: UserService
	) {
		console.log('this.el.nativeElement:', this.el.nativeElement);
	}
	private subscription: any;

	private publicData: any = {
		user: null,
		tracks: [],
		playlists: [],
		favorites: [],
		followers: [],
		followings: [],
	};
	private publicDataKeys = Object.keys(this.publicData);
	private displayError: string;

// 03 popular queries
	private queries: any;
	private getQueries(): void { // tslint:disable-line
		this.emitSpinnerStartEvent();
		this.scGetQueriesService.getData().subscribe(
			data => {
				this.queries = data;
				console.log('this.queries: ', this.queries);
			},
			error => this.displayError = <any> error,
			() => {
				console.log('getQueriesService done');
				this.emitSpinnerStopEvent();
			}
		);
	}

// User
	private userSelected() { // tslint:disable-line
		return (this.publicData.user) ? true : false;
	}
	private resetSelection(): void { // tslint:disable-line
		for (let key of this.publicDataKeys) {
			this.publicData[key] = '';
		}
		this.scUserName = '';
		this.selectedTab = '';
		this.selectedEndpoint = '';
		this.userService.model.analyser_query = this.scUserName;
		this.userService.model.analyser_user_id = '';
		this.userService.model.analyser_user_uri = '';
		this.userService.saveUser();
	}
	private scUserName: string = '';
	private scUserNamePattern: any = /[*]{3,}/; // tslint:disable-line
	private scUserNameKey(event): void { // tslint:disable-line
		if (event.which === 13 || event.keyCode === 13 || event.key === 'Enter' || event.code === 'Enter') {
			this.getUser();
		}
	}
	private getUser(): void { // tslint:disable-line
		this.emitSpinnerStartEvent();
		this.scGetUserService.getData(this.scUserName).subscribe(
			data => {
				this.publicData.user = data;
				this.displayError = undefined;
				console.log('this.userService: ', this.userService);
				this.userService.model.analyser_query = this.scUserName;
				this.userService.model.analyser_user_id = this.publicData.user.id;
				this.userService.model.analyser_user_uri = this.publicData.user.uri;
				console.log('this.userService.model update:', this.userService.model);
				this.userService.saveUser();
			},
			error => this.displayError = <any> error,
			() => {
				console.log('getUserService done');
				this.emitSpinnerStopEvent();
			}
		);
	}
	private analyseThisUser(permalink) { // tslint:disable-line
		this.scUserName = permalink;
		this.selectedTab = '';
		for (let key in this.publicData) {
			if (this.publicData[key] !== 'user') { this.publicData[key] = []; }
		}
		this.getUser();
	}

// Data tabs
	private dataTabs: string[] = ['Tracks', 'Playlists', 'Favorites', 'Followers', 'Followings']; // tslint:disable-line
	private endpoints: string[] = ['tracks', 'playlists', 'favorites', 'followers', 'followings']; // tslint:disable-line
	private selectedTab: string = '';
	private selectedEndpoint: string = '';
	private selectTab(tab): void { // tslint:disable-line
		console.log('selectTab, tab: ', tab);

		if (this.audioPlayback || this.selectedTrack || this.selectedTrackURI) {
			this.emitter.emitEvent({audio: 'pause'});
			this.audioPlayback = false;
			this.selectedTrack = undefined;
			this.selectedTrackURI = undefined;
		}

		this.selectedTab = tab;
		for (let i in this.dataTabs) {
			if (this.dataTabs[i] === tab) { this.selectedEndpoint = this.endpoints[i]; }
		}
		console.log('this.selectedEndpoint: ', this.selectedEndpoint);
		this.emitSpinnerStartEvent();
		this.scGetUserDetailsService.getData(this.userService.model.analyser_user_uri + '/' + this.selectedEndpoint).subscribe(
			(data: any) => {
				if (data.hasOwnProperty('collection')) {
					/*
					*	SC API returns followers and following as {collection: [{...}, {...}]}
					* while other endpoints returns [{...}, {...}]
					*/
					this.publicData[this.selectedEndpoint] = data.collection;
				} else { this.publicData[this.selectedEndpoint] = data; }
				if (this.selectedEndpoint === 'playlists') {
					for (let i of data) { // tslint:disable-line
						this.displayPlaylistTracks.push(false);
					}
				}
				this.displayError = undefined;
			},
			error => this.displayError = <any> error,
			() => {
				console.log('getUserDetailsService done');
				this.emitSpinnerStopEvent();
			}
		);
	}

// Filters
	private filterSearchValue: string;
	get filterSearchQuery(): string {
		return this.filterSearchValue;
	}
	set filterSearchQuery(val) {
		this.emitFilterSearchValueChangeEvent(val);
	}
	private emitFilterSearchValueChangeEvent(val): void {
		console.log('labelSearchValue changed to:', val);
		this.emitter.emitEvent({search: val});
	}
	private orderProp = 'timestamp';
	get sortByCriterion(): string {
		return this.orderProp;
	}
	set sortByCriterion(val) {
		this.emitOrderPropChangeEvent(val);
	}
	private emitOrderPropChangeEvent(val): void {
		console.log('orderProp changed to:', val);
		this.emitter.emitEvent({sort: val});
	}

// Spinner
	private emitSpinnerStartEvent(): void {
		console.log('root spinner start event emitted');
		this.emitter.emitEvent({spinner: 'start'});
	}
	private emitSpinnerStopEvent(): void {
		console.log('root spinner stop event emitted');
		this.emitter.emitEvent({spinner: 'stop'});
	}

// Data tabs controls: Tracks
	private selectedTrackURI: string;
	private audioPlayback: boolean = false;
	private selectedTrack: string = undefined;
	private resolvePreviewSource(uri): void {
		this.selectedTrack = undefined;
		this.emitSpinnerStartEvent();
		this.scGetUserTrackStreamService.getData(uri).subscribe(
			data => {
				console.log('scGetUserTrackPlayService, data: ', data);
				this.selectedTrack = data.location;
				this.selectedTrackURI = uri;
				this.displayError = undefined;
			},
			error => {
				this.displayError = <any> error;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('scGetUserTrackPlayService done');
				setTimeout(() => {
					this.emitter.emitEvent({audio: 'play'});
					this.audioPlayback = true;
					this.emitSpinnerStopEvent();
				}, 1000);
			}
		);
	}
	private playTrack(uri): void { // tslint:disable-line
		console.log('playTrack, sc api uri: ', uri);
		if (this.selectedTrackURI !== uri) {
			if (this.selectedTrackURI && this.audioPlayback) {
				this.emitter.emitEvent({audio: 'pause'});
				this.audioPlayback = false;
			}
			this.resolvePreviewSource(uri);
		} else {
			console.log('trigger player');
			if (this.audioPlayback) {
				this.emitter.emitEvent({audio: 'pause'});
				this.audioPlayback = false;
			} else {
				this.emitter.emitEvent({audio: 'play'});
				this.audioPlayback = true;
			}
		}
	}
	private downloadTrack(uri): void { // tslint:disable-line
		console.log('downloadTrack, sc api uri: ', uri);
		this.scGetUserTrackDownloadService.openInNewWindow(uri);
	}

// Data tabs controls: Playlists
	private displayPlaylistTracks: boolean[] = [];
	private togglePlaylist(index) { // tslint:disable-line
		console.log('togglePlaylist, dispalyPlaylistTracks index: ', index);
		this.displayPlaylistTracks[index] = (this.displayPlaylistTracks[index]) ? false : true;
	}

// Help
	private showHelp: boolean = false; // controls help labells visibility, catches events from nav component

	public ngOnInit() {
		console.log('ngOnInit: DashboardDetailsComponent initialized');
		this.emitSpinnerStartEvent();
		this.emitter.emitEvent({route: '/data'});
		this.emitter.emitEvent({appInfo: 'hide'});
		console.log('this.userService:', this.userService.model);
		this.getQueries();
		if (!this.userService.model.analyser_query) {
			this.userService.restoreUser(() => {
				this.scUserName = this.userService.model.analyser_query;
				if (this.scUserName) {
					console.log('restored user selection, this.scUserName:', this.scUserName);
					this.getUser();
				} else {
					console.log('restored user selection, user is not selected');
				}
			});
		} else {
			console.log('user is selected, this.scUserName:', this.scUserName);
		}
		this.subscription = this.emitter.getEmitter().subscribe((message) => {
			/*
			*	listen to filtering messages
			*/
			if (message.search || message.search === '') {
				console.log('/data consuming message:', message);
				let domTitleObjects = this.el.nativeElement.querySelectorAll('#data')[this.dataTabs.indexOf(this.selectedTab)].querySelectorAll('.media-heading');
				for (let domObj of domTitleObjects) {
					if (domObj.innerHTML.toLowerCase().indexOf(message.search.toLowerCase()) !== -1) {
						domObj.parentElement.parentElement.style.display = 'block';
					} else {
						domObj.parentElement.parentElement.style.display = 'none';
					}
				}
			}
			if (message.sort) {
				console.log('/data consuming message:', message);
				if (message.sort === 'timestamp') {
					this.publicData[this.selectedEndpoint].sort((a, b) => {
						if (this.selectedEndpoint === 'followers' || this.selectedEndpoint === 'followings') {
							return new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime();
						}
						return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
					});
				}
				if (message.sort === 'name') {
					this.publicData[this.selectedEndpoint].sort((a, b) => {
						if (this.selectedEndpoint === 'followers' || this.selectedEndpoint === 'followings') {
							if (a.username < b.username) { return -1; }
							if (a.username > b.username) { return 1; }
						} else {
							if (a.title < b.title) { return -1; }
							if (a.title > b.title) { return 1; }
						}
						return 0;
					});
				}
			}
			if (message.help === 'toggle') {
				console.log('/data consuming event:', message, ' | toggling help labels visibility');
				this.showHelp = (this.showHelp) ? false : true;
			}
			/*
			*	listen to <audio> element playback controls messages
			*/
			if (message.AudioPlayerDirective) {
				console.log('/data consuming event from AudioPlayerDirective: ', message);
				if (message.AudioPlayerDirective === 'play') { this.audioPlayback = true; }
				if (message.AudioPlayerDirective === 'pause') { this.audioPlayback = false; }
			}
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: DashboardDetailsComponent destroyed');
		this.subscription.unsubscribe();
	}
}
