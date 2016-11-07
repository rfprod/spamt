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
import { EventEmitterService } from './services/event-emitter.service';
import { UserDetailsService } from './services/user-details.service';
import { ServerStaticDataService } from './services/server-static-data.service';
import { PublicDataService } from './services/public-data.service';
import { nvD3 } from 'ng2-nvd3';
//import { $WebSocket } from 'angular2-websocket/angular2-websocket';

declare let $: JQueryStatic;

@NgModule({
	declarations: [ AppComponent, AppNavComponent, AppInfoComponent, DashboardIntroComponent, DashboardDetailsComponent, nvD3 ],
	imports 		: [ BrowserModule, FormsModule, HttpModule, RouterModule.forRoot(APP_ROUTES) ],
	providers 	: [ {provide: LocationStrategy, useClass: HashLocationStrategy}, EventEmitterService, UserDetailsService, ServerStaticDataService, PublicDataService ],
	schemas 		: [ CUSTOM_ELEMENTS_SCHEMA ],
	bootstrap 	: [ AppComponent ],
})
export class AppModule {}
