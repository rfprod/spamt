import { Routes } from '@angular/router';
import { DashboardIntroComponent } from './components/dashboard-intro.component';
import { DashboardDetailsComponent } from './components/dashboard-details.component';
import { DashboardControlsComponent } from './components/dashboard-controls.component';

export const APP_ROUTES: Routes = [
	{path: '', redirectTo: 'intro', pathMatch: 'full'},
	{path: 'intro', component: DashboardIntroComponent},
	{path: 'data', component: DashboardDetailsComponent},
	{path: 'controls', component: DashboardControlsComponent},
];
