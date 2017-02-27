import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';

import { AppComponent } from './app.component';
import { AppNavComponent } from './components/app-nav.component';
import { AppInfoComponent } from './components/app-info.component';
import { DashboardIntroComponent } from './components/dashboard-intro.component';
import { DashboardDetailsComponent } from './components/dashboard-details.component';
import { DashboardControlsComponent } from './components/dashboard-controls.component';
import { DashboardUserLoginComponent } from './components/dashboard-user-login.component';

import { nvD3 } from 'ng2-nvd3';

import { AudioPlayerDirective } from './directives/audio-player.directive';
import { LoadingIndicatorDirective } from './directives/loading-indicator.directive';

import { ConvertDuration } from './pipes/convert-duration.pipe';

import { EventEmitterService } from './services/event-emitter.service';
import { UserService } from './services/user-service.service';
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

declare let $: JQueryStatic;

@NgModule({
	declarations: [ AppComponent, AppNavComponent, AppInfoComponent, DashboardIntroComponent, DashboardDetailsComponent, DashboardControlsComponent, DashboardUserLoginComponent, nvD3 , AudioPlayerDirective, LoadingIndicatorDirective, ConvertDuration],
	imports 		: [ BrowserModule, FormsModule, HttpModule, RouterModule.forRoot(APP_ROUTES) ],
	providers 	: [
									{ provide: LocationStrategy, useClass: HashLocationStrategy },
									{ provide: Window, useValue: window },
									EventEmitterService, UserService, ServerStaticDataService, PublicDataService,
									SCgetQueriesService, SCgetUserService, SCgetUserDetailsService, SCgetUserTrackDownloadService, SCgetUserTrackStreamService,
									ControlsLoginService, ControlsLogoutService, ControlsMeService, ControlsUsersListService, ControlsQueriesListService,
								],
	schemas 		: [ CUSTOM_ELEMENTS_SCHEMA ],
	bootstrap 	: [ AppComponent ],
})
export class AppModule {}
