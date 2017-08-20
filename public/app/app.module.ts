import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { LocationStrategy, PathLocationStrategy, CommonModule  } from '@angular/common';

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
import { MaterialModule } from '@angular/material';

import { AppComponent } from './app.component';
import { AppNavComponent } from './components/app-nav.component';
import { AppInfoComponent } from './components/app-info.component';
import { DashboardIntroComponent } from './components/dashboard-intro.component';
import { DashboardDetailsComponent } from './components/dashboard-details.component';
import { DashboardControlsComponent } from './components/dashboard-controls.component';
import { DashboardUserComponent } from './components/dashboard-user.component';

import { nvD3 } from 'ng2-nvd3';

import { AudioPlayerDirective } from './directives/audio-player.directive';
import { LoadingIndicatorDirective } from './directives/loading-indicator.directive';

import { ConvertDuration } from './pipes/convert-duration.pipe';

import { EventEmitterService } from './services/event-emitter.service';
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

// declare let $: JQueryStatic;

@NgModule({
	declarations: [ AppComponent, AppNavComponent, AppInfoComponent, DashboardIntroComponent, DashboardDetailsComponent, DashboardControlsComponent, DashboardUserComponent, nvD3, AudioPlayerDirective, LoadingIndicatorDirective, ConvertDuration],
	imports 		: [ BrowserModule, BrowserAnimationsModule, FormsModule, FlexLayoutModule, MaterialModule, ReactiveFormsModule, HttpModule, RouterModule.forRoot(APP_ROUTES) ],
	providers 	: [
									{ provide: LocationStrategy, useClass: PathLocationStrategy },
									{ provide: Window, useValue: window },
									EventEmitterService, UserService, UserLogoutService, ServerStaticDataService, PublicDataService,
									SCgetQueriesService, SCgetUserService, SCgetUserDetailsService, SCgetUserTrackDownloadService, SCgetUserTrackStreamService,
									ControlsLoginService, ControlsLogoutService, ControlsMeService, ControlsUsersListService, ControlsQueriesListService
								],
	schemas 		: [ CUSTOM_ELEMENTS_SCHEMA ],
	bootstrap 	: [ AppComponent ]
})
export class AppModule {}
