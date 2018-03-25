import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material';
import { EventEmitterService } from '../services/event-emitter.service';
import { SCgetQueriesService } from '../services/sc-get-queries.service';
import { SCgetUserService } from '../services/sc-get-user.service';
import { SCgetUserDetailsService } from '../services/sc-get-user-details.service';
import { SCgetUserTrackDownloadService } from '../services/sc-get-user-track-download.service';
import { SCgetUserTrackStreamService } from '../services/sc-get-user-track-stream.service';
import { UserService } from '../services/user.service';

@Component({
	selector: 'dashboard-details',
	templateUrl: '/public/app/views/dashboard-details.html',
	host: {
		class: 'mat-body-1'
	}
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
	private subscription: any = {
		emitter: null as any,
		tabChange: null as any
	};

	private publicData: any = {
		user: null,
		tracks: [],
		playlists: [],
		favorites: [],
		followers: [],
		followings: [],
	};
	private publicDataKeys: string[] = Object.keys(this.publicData);
	public errorMessage: string;
	public successMessage: string;
	private dismissMessages(): void {
		this.errorMessage = '';
		this.successMessage = '';
	}

// popular queries
	private queries: any;
	private getQueries(): void { // tslint:disable-line
		this.emitSpinnerStartEvent();
		this.scGetQueriesService.getData().subscribe(
			(data) => {
				this.queries = data;
				console.log('this.queries: ', this.queries);
			},
			(error) => this.errorMessage = error as any,
			() => {
				console.log('getQueriesService done');
				this.emitSpinnerStopEvent();
			}
		);
	}

// User
	private userSelected(): boolean { // tslint:disable-line
		return (this.publicData.user) ? true : false;
	}
	private resetSelection(): void { // tslint:disable-line
		for (const key of this.publicDataKeys) {
			this.publicData[key] = (key === 'user') ? null : [];
		}
		this.scUserName = new FormControl('', Validators.compose([Validators.pattern('.{3,}')]));
		this.selectedTab = '';
		this.selectedEndpoint = '';
		this.userService.model.analyser_query = this.scUserName.value;
		this.userService.model.analyser_user_id = '';
		this.userService.model.analyser_user_uri = '';
		this.userService.saveUser();
		this.emitter.emitEvent({appInfo: 'show'});
		if (this.subscription.tabGroup) {
			this.subscription.tabGroup.unsubscribe();
		}
	}
	private scUserName: FormControl = new FormControl('', Validators.compose([Validators.pattern('.{3,}')]));
	private scUserNameKey(event): void { // tslint:disable-line
		if (event.which === 13 || event.keyCode === 13 || event.key === 'Enter' || event.code === 'Enter') {
			this.getUser();
		}
	}
	private getUser(): void { // tslint:disable-line
		this.emitSpinnerStartEvent();
		this.scGetUserService.getData(this.scUserName.value).subscribe(
			(data) => {
				this.emitter.emitEvent({appInfo: 'hide'});
				this.publicData.user = data;
				this.dismissMessages();
				console.log('this.userService: ', this.userService);
				this.userService.model.analyser_query = this.scUserName.value;
				this.userService.model.analyser_user_id = this.publicData.user.id;
				this.userService.model.analyser_user_uri = this.publicData.user.uri;
				console.log('this.userService.model update:', this.userService.model);
				this.userService.saveUser();
			},
			(error) => {
				this.errorMessage = error as any;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('getUserService done');
				this.emitSpinnerStopEvent();
				this.setTabChangeListener();
			}
		);
	}
	private analyseThisUser(permalink: string): void { // tslint:disable-line
		this.scUserName.patchValue(permalink);
		this.selectedTab = '';
		for (const key in this.publicData) {
			if (this.publicData[key] !== 'user') { this.publicData[key] = []; }
		}
		this.getUser();
	}

// Data tabs
	@ViewChild('tabGroup') private tabGroup: MatTabGroup;
	private setTabChangeListener(): void {
		this.tabGroup.selectedIndex = 0;
		this.subscription.tabChange = this.tabGroup.selectChange.subscribe((message) => {
			/*
			*	tab change events
			*/
			console.log('tabs chage event:', message, '| active tab index', message.index, '| tab name', this.dataTabs[message.index]);
			this.selectTab(this.dataTabs[message.index]);
		});
		this.selectTab(this.dataTabs[this.tabGroup.selectedIndex]);
	}
	private dataTabs: string[] = ['Tracks', 'Playlists', 'Favorites', 'Followers', 'Followings']; // tslint:disable-line
	private endpoints: string[] = ['tracks', 'playlists', 'favorites', 'followers', 'followings']; // tslint:disable-line
	private selectedTab: string = '';
	private selectedEndpoint: string = '';
	private selectTab(tab: string): void { // tslint:disable-line
		console.log('selectTab, tab: ', tab);

		if (this.audioPlayback || this.selectedTrack || this.selectedTrackURI) {
			this.emitter.emitEvent({audio: 'pause'});
			this.audioPlayback = false;
			this.selectedTrack = undefined;
			this.selectedTrackURI = undefined;
		}

		this.selectedTab = tab;
		findTab:
		for (const i in this.dataTabs) {
			if (this.dataTabs[i] === tab) {
				this.selectedEndpoint = this.endpoints[i];
				break findTab;
			}
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
					for (const i of data) { // tslint:disable-line
						this.displayPlaylistTracks.push(false);
					}
				}
				this.dismissMessages();
			},
			(error) => {
				this.errorMessage = error as any;
				this.emitSpinnerStopEvent();
			},
			() => {
				console.log('getUserDetailsService done');
				this.emitSpinnerStopEvent();
			}
		);
	}

// Filters
	private filterSearchValue: string;
	public get filterSearchQuery(): string {
		return this.filterSearchValue;
	}
	public set filterSearchQuery(val: string) {
		this.filterSearchValue = val;
	}
	public hideCard(trackTitle: string): boolean {
		if (!this.filterSearchQuery) { return false; }
		return trackTitle.toLowerCase().indexOf(this.filterSearchQuery.toLowerCase()) === -1;
	}
	private orderProp: string = 'timestamp';
	public get sortByCriterion(): string {
		return this.orderProp;
	}
	public set sortByCriterion(val: string) {
		this.orderProp = val;
		if (val === 'timestamp') {
			this.publicData[this.selectedEndpoint].sort((a, b) => {
				if (this.selectedEndpoint === 'followers' || this.selectedEndpoint === 'followings') {
					return new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime();
				}
				return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});
		}
		if (val === 'name') {
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

// Spinner
	private emitSpinnerStartEvent(): void {
		// console.log('root spinner start event emitted');
		this.emitter.emitEvent({spinner: 'start'});
	}
	private emitSpinnerStopEvent(): void {
		// console.log('root spinner stop event emitted');
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
			(data) => {
				console.log('scGetUserTrackPlayService, data: ', data);
				this.selectedTrack = data.location;
				this.selectedTrackURI = uri;
				this.dismissMessages();
			},
			(error) => {
				this.errorMessage = error as any;
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

// Lifecycle
	public ngOnInit(): void {
		console.log('ngOnInit: DashboardDetailsComponent initialized');
		this.emitSpinnerStartEvent();
		this.emitter.emitEvent({appInfo: 'hide'});
		console.log('this.userService:', this.userService.model);
		this.getQueries();
		if (!this.userService.model.analyser_query) {
			this.userService.restoreUser(() => {
				this.scUserName.patchValue(this.userService.model.analyser_query);
				if (this.scUserName.value) {
					console.log('restored user selection, this.scUserName.value:', this.scUserName.value);
					this.getUser();
				} else {
					console.log('restored user selection, user is not selected');
					this.emitter.emitEvent({appInfo: 'show'});
				}
			});
		} else {
			this.scUserName.patchValue(this.userService.model.analyser_query);
			console.log('user is selected, this.scUserName.value:', this.scUserName.value);
			this.getUser();
		}
		this.subscription.emitter = this.emitter.getEmitter().subscribe((message) => {
			/*
			*	listen to help toggler messages
			*/
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
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: DashboardDetailsComponent destroyed');
		this.subscription.emitter.unsubscribe();
		if (this.subscription.tabGroup) {
			this.subscription.tabGroup.unsubscribe();
		}
	}
}
