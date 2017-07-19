import { Routes } from '@angular/router';
import { DashboardIntroComponent } from './components/dashboard-intro.component';
import { DashboardDetailsComponent } from './components/dashboard-details.component';
import { DashboardControlsComponent } from './components/dashboard-controls.component';
import { DashboardUserComponent } from './components/dashboard-user.component';

export const APP_ROUTES: Routes = [
	{ path: 'intro', component: DashboardIntroComponent },
	{ path: 'data', component: DashboardDetailsComponent },
	{ path: 'controls', component: DashboardControlsComponent },
	{ path: 'user', component: DashboardUserComponent },
	{ path: '', redirectTo: 'intro', pathMatch: 'full' },
	{ path: '**', redirectTo: 'intro' }
];
