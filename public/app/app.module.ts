import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';

/*
*	Some material components rely on hammerjs
*	CustomMaterialModule loads exact material modules
*/
import '../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from './custom-material.module';

import { AppComponent } from './app.component';
import { AppNavComponent } from './components/app-nav.component';
import { AppInfoComponent } from './components/app-info.component';
import { DashboardIntroComponent } from './components/dashboard-intro.component';
import { DashboardDetailsComponent } from './components/dashboard-details.component';
import { DashboardControlsComponent } from './components/dashboard-controls.component';
import { DashboardUserComponent } from './components/dashboard-user.component';

import { AudioPlayerDirective } from './directives/audio-player.directive';

import { ConvertDuration } from './pipes/convert-duration.pipe';

import { CustomServiceWorkerService } from './services/custom-service-worker.service';
import { CustomDeferredService } from './services/custom-deferred.service';

import { EventEmitterService } from './services/event-emitter.service';
import { WebsocketService } from './services/websocket.service';
import { UserService } from './services/user.service';
import { UserLogoutService } from './services/user-logout.service';
import { SCgetQueriesService } from './services/sc-get-queries.service';
import { SCgetUserService } from './services/sc-get-user.service';
import { SCgetUserDetailsService } from './services/sc-get-user-details.service';
import { SCgetUserTrackDownloadService } from './services/sc-get-user-track-download.service';
import { SCgetUserTrackStreamService } from './services/sc-get-user-track-stream.service';
import { ServerStaticDataService } from './services/server-static-data.service';
import { PublicDataService } from './services/public-data.service';
import { ControlsLoginService } from './services/controls-login.service';
import { ControlsLogoutService } from './services/controls-logout.service';
import { ControlsMeService } from './services/controls-me.service';
import { ControlsUsersListService } from './services/controls-users-list.service';
import { ControlsQueriesListService } from './services/controls-queries-list.service';

import { NvD3Component } from 'ng2-nvd3';

@NgModule({
	declarations: [ AppComponent, AppNavComponent, AppInfoComponent, DashboardIntroComponent, DashboardDetailsComponent, DashboardControlsComponent, DashboardUserComponent, /*nvD3,*/NvD3Component, AudioPlayerDirective, ConvertDuration ],
	imports 		: [ BrowserModule, BrowserAnimationsModule, FormsModule, FlexLayoutModule, CustomMaterialModule, ReactiveFormsModule, HttpModule, RouterModule.forRoot(APP_ROUTES) ],
	providers 	: [
									{provide: APP_BASE_HREF, useValue: '/'},
									{ provide: LocationStrategy, useClass: PathLocationStrategy },
									{ provide: 'Window', useValue: window },
									EventEmitterService, WebsocketService, CustomServiceWorkerService, CustomDeferredService, UserService, UserLogoutService,
									ServerStaticDataService, PublicDataService, SCgetQueriesService, SCgetUserService, SCgetUserDetailsService,
									SCgetUserTrackDownloadService, SCgetUserTrackStreamService, ControlsLoginService, ControlsLogoutService, ControlsMeService,
									ControlsUsersListService, ControlsQueriesListService
								],
	schemas 		: [ CUSTOM_ELEMENTS_SCHEMA ],
	bootstrap 	: [ AppComponent ]
})
export class AppModule {}
