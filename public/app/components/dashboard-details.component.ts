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

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/first';

@Component({
	selector: 'dashboard-details',
	templateUrl: '/public/app/views/dashboard-details.html',
	host: {
		class: 'mat-body-1'
	}
})
export class DashboardDetailsComponent implements OnInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService,
		private scGetQueriesService: SCgetQueriesService,
		private scGetUserService: SCgetUserService,
		private scGetUserDetailsService: SCgetUserDetailsService,
		private scGetUserTrackDownloadService: SCgetUserTrackDownloadService,
		private scGetUserTrackStreamService: SCgetUserTrackStreamService,
		private userService: UserService
	) {
		console.log('DashboardDetailsComponent element:', this.el.nativeElement);
	}

	private ngUnsubscribe: Subject<void> = new Subject();

	public publicData: any = {
		user: null,
		tracks: [],
		playlists: [],
		favorites: [],
		followers: [],
		followings: [],
	};
	public publicDataKeys: string[] = Object.keys(this.publicData);
	public errorMessage: string;
	public successMessage: string;
	public dismissMessages(): void {
		this.errorMessage = '';
		this.successMessage = '';
	}

// popular queries
	public queries: any;
	private getQueries(): void {
		this.emitter.emitSpinnerStartEvent();
		this.scGetQueriesService.getData().first().subscribe(
			(data: any) => {
				this.queries = data;
				console.log('this.queries: ', this.queries);
			},
			(error: any) => this.errorMessage = error,
			() => {
				console.log('getQueriesService done');
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}

// User
	public userSelected(): boolean {
		return (this.publicData.user) ? true : false;
	}
	public resetSelection(): void {
		for (const key of this.publicDataKeys) {
			this.publicData[key] = (key === 'user') ? null : [];
		}
		this.scUserName = new FormControl('', Validators.compose([Validators.pattern('.{3,}')]));
		this.selectedTab = '';
		this.selectedEndpoint = '';
		const newValues: any = {
			analyser_query: this.scUserName.value,
			analyser_user_id: '',
			analyser_user_uri: ''
		};
		this.userService.saveUser(newValues);
	}
	public scUserName: FormControl = new FormControl('', Validators.compose([Validators.pattern('.{3,}')]));
	public scUserNameKey(event): void {
		if (event.which === 13 || event.keyCode === 13 || event.key === 'Enter' || event.code === 'Enter') {
			this.getUser();
		}
	}
	public getUser(): void {
		this.emitter.emitSpinnerStartEvent();
		this.scGetUserService.getData(this.scUserName.value).first().subscribe(
			(data: any) => {
				this.publicData.user = data;
				this.dismissMessages();
				const newValues: any = {
					analyser_query: this.scUserName.value,
					analyser_user_id: this.publicData.user.id,
					analyser_user_uri: this.publicData.user.uri
				};
				this.userService.saveUser(newValues);
			},
			(error: any) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			},
			() => {
				console.log('getUserService done');
				this.emitter.emitSpinnerStopEvent();
				this.setTabChangeListener();
			}
		);
	}
	public analyseThisUser(permalink: string): void {
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
		this.tabGroup.selectChange.takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			/*
			*	tab change events
			*/
			console.log('tabs chage event:', event, '| active tab index', event.index, '| tab name', this.dataTabs[event.index]);
			this.selectTab(this.dataTabs[event.index]);
		});
		this.selectTab(this.dataTabs[this.tabGroup.selectedIndex]);
	}
	public dataTabs: string[] = ['Tracks', 'Playlists', 'Favorites', 'Followers', 'Followings'];
	private endpoints: string[] = ['tracks', 'playlists', 'favorites', 'followers', 'followings'];
	public selectedTab: string = '';
	private selectedEndpoint: string = '';
	private selectTab(tab: string): void {
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
		this.emitter.emitSpinnerStartEvent();
		this.scGetUserDetailsService.getData(this.userService.model.analyser_user_uri + '/' + this.selectedEndpoint).first().subscribe(
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
			(error: any) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			},
			() => {
				console.log('getUserDetailsService done');
				this.emitter.emitSpinnerStopEvent();
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

// Data tabs controls: Tracks
	public selectedTrackURI: string;
	public audioPlayback: boolean = false;
	public selectedTrack: string = undefined;
	private resolvePreviewSource(uri): void {
		this.selectedTrack = undefined;
		this.emitter.emitSpinnerStartEvent();
		this.scGetUserTrackStreamService.getData(uri).first().subscribe(
			(data: any) => {
				console.log('scGetUserTrackPlayService, data: ', data);
				this.selectedTrack = data.location;
				this.selectedTrackURI = uri;
				this.dismissMessages();
			},
			(error: any) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			},
			() => {
				console.log('scGetUserTrackPlayService done');
				setTimeout(() => {
					this.emitter.emitEvent({audio: 'play'});
					this.audioPlayback = true;
					this.emitter.emitSpinnerStopEvent();
				}, 1000);
			}
		);
	}
	public playTrack(uri: string): void {
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
	public downloadTrack(uri: string): void {
		console.log('downloadTrack, sc api uri: ', uri);
		this.scGetUserTrackDownloadService.openInNewWindow(uri);
	}

// Data tabs controls: Playlists
	public displayPlaylistTracks: boolean[] = [];
	public togglePlaylist(index: number) {
		console.log('togglePlaylist, dispalyPlaylistTracks index: ', index);
		this.displayPlaylistTracks[index] = (this.displayPlaylistTracks[index]) ? false : true;
	}

// Help
	public showHelp: boolean = false; // controls help labells visibility, catches events from nav component

// Lifecycle
	public ngOnInit(): void {
		console.log('ngOnInit: DashboardDetailsComponent initialized');
		this.emitter.emitSpinnerStartEvent();
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
				}
			});
		} else {
			this.scUserName.patchValue(this.userService.model.analyser_query);
			console.log('user is selected, this.scUserName.value:', this.scUserName.value);
			this.getUser();
		}
		this.emitter.getEmitter().takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			/*
			*	help toggler events
			*/
			if (event.help === 'toggle') {
				console.log('DashboardDetailsComponent emitter event:', event, ' | toggling help labels visibility');
				this.showHelp = (this.showHelp) ? false : true;
			}
			/*
			*	<audio> element playback event
			*/
			if (event.AudioPlayerDirective) {
				console.log('DashboardDetailsComponent emitter event from AudioPlayerDirective: ', event);
				if (event.AudioPlayerDirective === 'play') { this.audioPlayback = true; }
				if (event.AudioPlayerDirective === 'pause') { this.audioPlayback = false; }
			}
		});
	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: DashboardDetailsComponent destroyed');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
