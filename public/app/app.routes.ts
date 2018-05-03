import { Routes } from '@angular/router';
import { AppIntroComponent } from './components/app-intro.component';
import { AppAnalyserSoundcloudComponent } from './components/app-analyser-soundcloud.component';
import { AppControlsComponent } from './components/app-controls.component';
import { AppUserComponent } from './components/app-user.component';

export const APP_ROUTES: Routes = [
	{ path: 'intro', component: AppIntroComponent },
	{ path: 'analyser', component: AppAnalyserSoundcloudComponent },
	{ path: 'controls', component: AppControlsComponent },
	{ path: 'user', component: AppUserComponent },
	{ path: '', redirectTo: 'intro', pathMatch: 'full' },
	{ path: '**', redirectTo: 'intro' }
];
